import { useCallback, useRef, useState, useEffect } from "react";
import { useClient } from "sanity";
import type {
  NormalizedDeployTarget,
  DeploymentRecord,
  DeploymentStatus,
  DeploymentUser,
} from "../types";
import { API_VERSION, DEPLOYMENT_TYPE } from "../lib/constants";
import {
  triggerDeployHook,
  findMatchingDeployment,
  getCloudflareDeployment,
  mapCloudflareStatusToDeploymentStatus,
} from "../lib/cloudflare";

interface UseDeployActionOptions {
  target: NormalizedDeployTarget | null;
  user?: DeploymentUser;
  onSuccess?: (doc: DeploymentRecord) => void;
  onError?: (err: Error) => void;
}

export interface UseDeployActionResult {
  isDeploying: boolean;
  deployError: string | null;
  activeDeploymentId: string | null;
  activeStatus: DeploymentStatus | null;
  triggerDeployment: () => Promise<void>;
  resetError: () => void;
}

export function useDeployAction({
  target,
  user,
  onSuccess,
  onError,
}: UseDeployActionOptions): UseDeployActionResult {
  const client = useClient({ apiVersion: API_VERSION });
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(
    null,
  );
  const [activeStatus, setActiveStatus] = useState<DeploymentStatus | null>(
    null,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup active polling on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetError = useCallback(() => {
    setDeployError(null);
  }, []);

  const triggerDeployment = useCallback(async () => {
    if (!target) {
      setDeployError("No deployment target selected.");
      return;
    }

    if (!target.deployHook) {
      setDeployError("Selected target has no Deploy Hook configured.");
      return;
    }

    if (isDeploying) {
      return;
    }

    // Cancel any previous in-flight polling
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsDeploying(true);
    setDeployError(null);
    setActiveStatus("triggering");

    const startedAt = new Date().toISOString();
    const triggerTimestampMs = Date.now();
    let sanityDocId: string | null = null;

    try {
      // Step 1: Create initial Sanity deployment document with status "triggering"
      const initialDoc: Omit<DeploymentRecord, "_id"> = {
        _type: DEPLOYMENT_TYPE,
        environment: target.environment || target.label || target.name,
        status: "triggering",
        trigger: "manual",
        startedAt,
        triggeredBy: user,
        logs: [
          {
            timestamp: startedAt,
            message: `Manual deployment triggered for target '${target.label}' (${target.environment})`,
            type: "info",
          },
        ],
      };

      const createdDoc = await client.create(initialDoc);
      sanityDocId = createdDoc._id;
      setActiveDeploymentId(sanityDocId);

      // Step 2: Trigger the Cloudflare Deploy Hook
      await triggerDeployHook(target.deployHook);

      // Step 3: Deployment Hook accepted -> update status to "triggered"
      setActiveStatus("triggered");
      await client
        .patch(sanityDocId)
        .set({
          status: "triggered",
        })
        .append("logs", [
          {
            timestamp: new Date().toISOString(),
            message: "Cloudflare Deploy Hook accepted the request.",
            type: "success",
          },
        ])
        .commit();

      // Step 4: If Cloudflare API credentials are provided, track live build status
      if (target.cloudflare) {
        const cfConfig = target.cloudflare;

        // Poll for matched deployment and status
        const poll = async () => {
          let matchedCfDeploymentId: string | null = null;
          let attempts = 0;
          const maxAttempts = 60; // Up to ~10 minutes
          const delays = [1500, 3000, 5000, 5000, 10000];

          while (attempts < maxAttempts && !abortController.signal.aborted) {
            const delayMs =
              attempts < delays.length
                ? delays[attempts]
                : delays[delays.length - 1];
            await new Promise((resolve) => setTimeout(resolve, delayMs));

            if (abortController.signal.aborted) break;

            try {
              // Match deployment if not yet found
              if (!matchedCfDeploymentId) {
                const matched = await findMatchingDeployment(
                  cfConfig,
                  triggerTimestampMs,
                  target.environment,
                );
                if (matched) {
                  matchedCfDeploymentId = matched.id;
                  const currentStatus =
                    mapCloudflareStatusToDeploymentStatus(matched);
                  setActiveStatus(currentStatus);

                  await client
                    .patch(sanityDocId!)
                    .set({
                      deploymentId: matched.id,
                      deploymentUrl: matched.url || undefined,
                      status: currentStatus,
                    })
                    .append("logs", [
                      {
                        timestamp: new Date().toISOString(),
                        message: `Matched Cloudflare Pages deployment ${matched.short_id || matched.id}`,
                        type: "info",
                      },
                    ])
                    .commit();

                  if (
                    currentStatus === "success" ||
                    currentStatus === "failure" ||
                    currentStatus === "canceled"
                  ) {
                    await client
                      .patch(sanityDocId!)
                      .set({
                        completedAt: new Date().toISOString(),
                      })
                      .commit();
                    break;
                  }
                }
              } else {
                // Deployment already matched, inspect details
                const currentCf = await getCloudflareDeployment(
                  cfConfig,
                  matchedCfDeploymentId,
                );
                const currentStatus =
                  mapCloudflareStatusToDeploymentStatus(currentCf);
                setActiveStatus(currentStatus);

                const patchData: Record<string, any> = {
                  status: currentStatus,
                };
                if (currentCf.url) {
                  patchData.deploymentUrl = currentCf.url;
                }

                if (
                  currentStatus === "success" ||
                  currentStatus === "failure" ||
                  currentStatus === "canceled"
                ) {
                  patchData.completedAt = new Date().toISOString();
                  await client
                    .patch(sanityDocId!)
                    .set(patchData)
                    .append("logs", [
                      {
                        timestamp: new Date().toISOString(),
                        message: `Cloudflare deployment completed with status: ${currentStatus}`,
                        type:
                          currentStatus === "success"
                            ? "success"
                            : currentStatus === "failure"
                              ? "error"
                              : "warning",
                      },
                    ])
                    .commit();
                  break;
                } else {
                  await client.patch(sanityDocId!).set(patchData).commit();
                }
              }
            } catch (pollErr: any) {
              console.warn("Cloudflare status poll warning:", pollErr?.message);
            }

            attempts++;
          }
        };

        // Run polling in background
        void poll().finally(() => {
          setIsDeploying(false);
        });
      } else {
        // Without Cloudflare API credentials, we finish after triggering
        setIsDeploying(false);
      }

      onSuccess?.({
        _id: sanityDocId,
        _type: DEPLOYMENT_TYPE,
        environment: target.environment || target.name,
        status: target.cloudflare ? "building" : "triggered",
        trigger: "manual",
        startedAt,
        triggeredBy: user,
      });
    } catch (err: any) {
      const errorMessage =
        err?.message || "Failed to trigger Cloudflare deployment";
      setDeployError(errorMessage);
      setActiveStatus("failure");
      setIsDeploying(false);

      if (sanityDocId) {
        try {
          await client
            .patch(sanityDocId)
            .set({
              status: "failure",
              completedAt: new Date().toISOString(),
              error: errorMessage,
            })
            .append("logs", [
              {
                timestamp: new Date().toISOString(),
                message: `Deployment failed: ${errorMessage}`,
                type: "error",
              },
            ])
            .commit();
        } catch (patchErr) {
          console.error("Failed to update failure record in Sanity:", patchErr);
        }
      }

      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [target, user, client, isDeploying, onSuccess, onError]);

  return {
    isDeploying,
    deployError,
    activeDeploymentId,
    activeStatus,
    triggerDeployment,
    resetError,
  };
}
