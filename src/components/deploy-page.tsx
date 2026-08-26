import React, { useMemo } from "react";
import {
  Container,
  Card,
  Stack,
  Flex,
  Heading,
  Text,
  Badge,
  Inline,
} from "@sanity/ui";
import { Icons } from "./icons";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { LaunchIcon } from "@sanity/icons/Launch";
import type { Tool } from "sanity";
import type { CloudflareDeployToolConfig } from "../types";
import {
  DeployContextProvider,
  useDeployContext,
} from "../context/deploy-context";
import { useDeploymentUser } from "../hooks/use-current-user";
import { useDeploymentHistory } from "../hooks/use-deployment-history";
import { useDeployAction } from "../hooks/use-deploy-action";
import { DeployButton } from "./deploy-button";
import { DeploymentStatusBadge } from "./deployment-status-badge";
import { DeploymentHistory } from "./deployment-history";
import { TargetSelector } from "./target-selector";
import { ConfigWarning } from "./config-warning";

export interface DeployPageProps {
  tool?: Tool<CloudflareDeployToolConfig>;
  config?: CloudflareDeployToolConfig;
  options?: CloudflareDeployToolConfig;
}

function DeployPageInner() {
  const {
    targets,
    selectedTarget,
    selectedTargetName,
    setSelectedTargetName,
    enableHistory,
    title,
    validationErrors,
    isConfigValid,
  } = useDeployContext();

  const user = useDeploymentUser();
  const {
    deployments,
    isLoading: isHistoryLoading,
    refresh,
  } = useDeploymentHistory();

  const { isDeploying, deployError, triggerDeployment } = useDeployAction({
    target: selectedTarget,
    user,
    onSuccess: () => {
      void refresh();
    },
    onError: () => {
      void refresh();
    },
  });

  // Most recent deployment for the selected target or globally
  const lastDeployment = useMemo(() => {
    if (!deployments || deployments.length === 0) return null;
    if (selectedTarget) {
      const match = deployments.find(
        (d) =>
          d.environment?.toLowerCase() ===
            selectedTarget.environment?.toLowerCase() ||
          d.environment?.toLowerCase() === selectedTarget.name.toLowerCase(),
      );
      if (match) return match;
    }
    return deployments[0];
  }, [deployments, selectedTarget]);

  return (
    <Container width={2} padding={[3, 4, 5]}>
      <Stack space={5}>
        {/* Page Title & Intro */}
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <Stack space={2}>
            <Flex align="center" gap={3}>
              <Icons.DeployIcon style={{ fontSize: "1.75em" }} />
              <Heading size={3}>{title}</Heading>
            </Flex>
            <Text size={1} muted>
              Trigger and monitor Cloudflare Pages deployments directly from
              Sanity Studio.
            </Text>
          </Stack>
        </Flex>

        {/* Configuration Warning if missing hook/targets */}
        {!isConfigValid && <ConfigWarning errors={validationErrors} />}

        {isConfigValid && selectedTarget && (
          <>
            {/* Target Selector (when >1 target configured) */}
            <TargetSelector
              targets={targets}
              selectedTargetName={selectedTargetName}
              onSelectTarget={setSelectedTargetName}
              disabled={isDeploying}
            />

            {/* Active Deploy Action Card */}
            <Card
              padding={[4, 4, 5]}
              radius={3}
              border
              tone="default"
              shadow={1}
            >
              <Stack space={4}>
                <Flex
                  align="center"
                  justify="space-between"
                  wrap="wrap"
                  gap={3}
                >
                  <Stack space={1}>
                    <Flex align="center" gap={2}>
                      <Heading size={2}>{selectedTarget.label}</Heading>
                      <Badge tone="default" fontSize={1}>
                        {selectedTarget.environment}
                      </Badge>
                      {selectedTarget.cloudflare && (
                        <Badge tone="positive" fontSize={1}>
                          API Tracking
                        </Badge>
                      )}
                    </Flex>
                    <Text size={1} muted>
                      Cloudflare Pages
                    </Text>
                  </Stack>

                  <DeployButton
                    onClick={triggerDeployment}
                    isDeploying={isDeploying}
                    targetLabel={selectedTarget.label}
                  />
                </Flex>

                {/* Tracking info or error notice */}
                {deployError ? (
                  <Card tone="critical" padding={3} radius={2}>
                    <Stack space={1}>
                      <Text size={1} weight="semibold">
                        Deployment failed:
                      </Text>
                      <Text size={1}>{deployError}</Text>
                    </Stack>
                  </Card>
                ) : (
                  <Flex align="center" gap={2}>
                    <InfoOutlineIcon
                      style={{ fontSize: "1em", opacity: 0.6 }}
                    />
                    <Text size={0} muted>
                      {selectedTarget.cloudflare
                        ? `Live build tracking is active for project '${selectedTarget.cloudflare.projectName}'.`
                        : "Cloudflare Deploy Hook configured. To enable live build status tracking, add Cloudflare API credentials."}
                    </Text>
                  </Flex>
                )}
              </Stack>
            </Card>

            {/* Last Deployment Summary */}
            {lastDeployment && (
              <Card padding={[3, 4, 4]} radius={2} border tone="inherit">
                <Flex
                  align="center"
                  justify="space-between"
                  wrap="wrap"
                  gap={3}
                >
                  <Stack space={2}>
                    <Text size={0} weight="semibold" muted>
                      LAST DEPLOYMENT ({lastDeployment.environment})
                    </Text>
                    <Flex align="center" gap={2} wrap="wrap">
                      <DeploymentStatusBadge
                        status={lastDeployment.status}
                        size={2}
                      />
                      <Text size={1} weight="medium">
                        {lastDeployment.triggeredBy?.name ||
                          lastDeployment.triggeredBy?.email ||
                          "Sanity User"}
                      </Text>
                      <Text size={1} muted>
                        •
                      </Text>
                      <Text size={1} muted>
                        {new Date(lastDeployment.startedAt).toLocaleString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </Text>
                    </Flex>
                  </Stack>

                  {lastDeployment.deploymentUrl && (
                    <Inline>
                      <Badge
                        as="a"
                        href={lastDeployment.deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        tone="primary"
                        fontSize={1}
                        style={{ cursor: "pointer", textDecoration: "none" }}
                      >
                        <Flex align="center" gap={1}>
                          <LaunchIcon />
                          <Text size={0} weight="semibold">
                            Open Site
                          </Text>
                        </Flex>
                      </Badge>
                    </Inline>
                  )}
                </Flex>
              </Card>
            )}

            {/* Deployment History Table */}
            {enableHistory && (
              <DeploymentHistory
                deployments={deployments}
                isLoading={isHistoryLoading}
                onRefresh={refresh}
                targetName={selectedTarget.name}
              />
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

export function DeployPage(props: DeployPageProps) {
  const config = props.config || props.options || props.tool?.options;

  return (
    <DeployContextProvider config={config}>
      <DeployPageInner />
    </DeployContextProvider>
  );
}
