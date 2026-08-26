import { useCallback, useEffect, useState } from "react";
import { useClient } from "sanity";
import type { DeploymentRecord } from "../types";
import { API_VERSION, DEPLOYMENT_QUERY } from "../lib/constants";

export interface UseDeploymentHistoryResult {
  deployments: DeploymentRecord[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDeploymentHistory(
  filterTargetName?: string,
): UseDeploymentHistoryResult {
  const client = useClient({ apiVersion: API_VERSION });
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const results = await client.fetch<DeploymentRecord[]>(DEPLOYMENT_QUERY);
      setDeployments(results || []);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    let isMounted = true;

    void fetchHistory();

    // Setup real-time listener for deployment document changes
    const subscription = client
      .listen<DeploymentRecord>(DEPLOYMENT_QUERY, {}, { visibility: "query" })
      .subscribe({
        next: (update) => {
          if (!isMounted) return;
          if (update.result) {
            setDeployments((prev) => {
              const updatedDoc = update.result!;
              const exists = prev.some((d) => d._id === updatedDoc._id);
              if (exists) {
                return prev.map((d) =>
                  d._id === updatedDoc._id ? updatedDoc : d,
                );
              }
              return [updatedDoc, ...prev];
            });
          } else if (update.documentId && update.transition === "disappear") {
            setDeployments((prev) =>
              prev.filter((d) => d._id !== update.documentId),
            );
          } else {
            void fetchHistory();
          }
        },
        error: (err) => {
          console.error("Cloudflare Deploy listener error:", err);
        },
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [client, fetchHistory]);

  const filteredDeployments = filterTargetName
    ? deployments.filter(
        (d) =>
          d.environment?.toLowerCase() === filterTargetName.toLowerCase() ||
          !d.environment,
      )
    : deployments;

  return {
    deployments: filteredDeployments,
    isLoading,
    error,
    refresh: fetchHistory,
  };
}
