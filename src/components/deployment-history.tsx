import React from "react";
import { Card, Stack, Flex, Heading, Text, Button, Spinner } from "@sanity/ui";
import { RefreshIcon } from "@sanity/icons/Refresh";
import { ClockIcon } from "@sanity/icons/Clock";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import type { DeploymentRecord } from "../types";
import { DeploymentItem } from "./deployment-item";

interface DeploymentHistoryProps {
  deployments: DeploymentRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  targetName?: string;
}

export function DeploymentHistory({
  deployments,
  isLoading,
  onRefresh,
}: DeploymentHistoryProps) {
  return (
    <Card padding={[3, 4, 4]} radius={3} border tone="default">
      <Stack space={4}>
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={2}>
            <ClockIcon style={{ fontSize: "1.25em" }} />
            <Heading size={2}>Deployment History</Heading>
          </Flex>

          <Button
            mode="ghost"
            fontSize={1}
            padding={2}
            icon={RefreshIcon}
            text="Refresh"
            onClick={onRefresh}
            disabled={isLoading}
          />
        </Flex>

        {/* Content */}
        {isLoading && deployments.length === 0 ? (
          <Flex justify="center" align="center" padding={5}>
            <Spinner />
          </Flex>
        ) : deployments.length === 0 ? (
          <Card
            padding={5}
            radius={2}
            tone="transparent"
            style={{ textAlign: "center" }}
          >
            <Flex direction="column" align="center" gap={2}>
              <InfoOutlineIcon style={{ fontSize: "2em", opacity: 0.5 }} />
              <Text size={2} weight="medium">
                No deployments recorded yet
              </Text>
              <Text size={1} muted>
                Trigger a deployment above to start tracking history for this
                project.
              </Text>
            </Flex>
          </Card>
        ) : (
          <Stack space={3}>
            {deployments.map((deployment) => (
              <DeploymentItem
                key={deployment._id || deployment.startedAt}
                deployment={deployment}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
