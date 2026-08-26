import React, { useState } from "react";
import {
  Card,
  Flex,
  Stack,
  Text,
  Box,
  Button,
  Avatar,
  Badge,
} from "@sanity/ui";
import { LaunchIcon, ChevronDownIcon, ChevronUpIcon, UserIcon } from "./icons";
import type { DeploymentRecord } from "../types";
import { DeploymentStatusBadge } from "./deployment-status-badge";

interface DeploymentItemProps {
  deployment: DeploymentRecord;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 45) return "just now";
    if (diffSeconds < 90) return "1 minute ago";
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 45) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 90) return "1 hour ago";
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatFullDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function DeploymentItem({ deployment }: DeploymentItemProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const {
    status,
    environment,
    trigger,
    startedAt,
    triggeredBy,
    deploymentUrl,
    error,
    logs,
  } = deployment;

  const hasDetails = Boolean(error || (logs && logs.length > 0));

  return (
    <Card
      padding={3}
      radius={2}
      border
      tone={
        status === "failure"
          ? "critical"
          : status === "building" || status === "triggering"
            ? "caution"
            : "default"
      }
    >
      <Stack gap={3}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          {/* Left: Status & Environment & Trigger */}
          <Flex align="center" gap={2} wrap="wrap">
            <DeploymentStatusBadge status={status} size={1} />

            <Badge tone="default" size={1}>
              {environment || "Production"}
            </Badge>

            {trigger && trigger !== "manual" && (
              <Badge tone="primary" size={1}>
                {trigger}
              </Badge>
            )}
          </Flex>

          {/* Right: Actions (View link & Expand details) */}
          <Flex align="center" gap={1}>
            {deploymentUrl && (
              <Button
                as="a"
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                mode="ghost"
                tone="primary"
                fontSize={1}
                padding={2}
                icon={LaunchIcon}
                text="Visit"
              />
            )}

            {hasDetails && (
              <Button
                mode="bleed"
                fontSize={1}
                padding={2}
                icon={expanded ? ChevronUpIcon : ChevronDownIcon}
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? "Hide details" : "Show details"}
              />
            )}
          </Flex>
        </Flex>

        {/* User Attribution & Timestamp */}
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <Flex align="center" gap={2}>
            {triggeredBy?.imageUrl ? (
              <Avatar
                src={triggeredBy.imageUrl}
                size={1}
                title={triggeredBy.name || triggeredBy.email || "User"}
              />
            ) : (
              <Avatar
                initials={
                  triggeredBy?.name
                    ? triggeredBy.name.slice(0, 2).toUpperCase()
                    : undefined
                }
                size={1}
                icon={!triggeredBy?.name ? UserIcon : undefined}
              />
            )}

            <Stack gap={1}>
              <Text size={1} weight="semibold">
                {triggeredBy?.name || triggeredBy?.email || "Unknown User"}
              </Text>
              {triggeredBy?.email && triggeredBy.name && (
                <Text size={0} muted>
                  {triggeredBy.email}
                </Text>
              )}
            </Stack>
          </Flex>

          <Stack gap={1} style={{ textAlign: "right" }}>
            <Text size={1} muted title={formatFullDate(startedAt)}>
              {formatRelativeTime(startedAt)}
            </Text>
            <Text size={0} muted>
              {formatFullDate(startedAt)}
            </Text>
          </Stack>
        </Flex>

        {/* Expanded Error or Logs */}
        {expanded && (
          <Box paddingTop={2}>
            <Stack gap={2}>
              {error && (
                <Card tone="critical" padding={3} radius={2}>
                  <Stack gap={1}>
                    <Text size={1} weight="semibold">
                      Error details:
                    </Text>
                    <Text size={1}>{error}</Text>
                  </Stack>
                </Card>
              )}

              {logs && logs.length > 0 && (
                <Card tone="inherit" padding={2} radius={2} border>
                  <Stack gap={1}>
                    <Text size={0} weight="semibold" muted>
                      Activity log:
                    </Text>
                    {logs.map((log, idx) => (
                      <Flex key={idx} gap={2} align="flex-start">
                        <Text size={0} muted style={{ whiteSpace: "nowrap" }}>
                          {formatFullDate(log.timestamp).split(", ")[1] ||
                            log.timestamp}
                        </Text>
                        <Text
                          size={0}
                          tone={
                            log.type === "error"
                              ? "critical"
                              : log.type === "success"
                                ? "positive"
                                : "default"
                          }
                        >
                          {log.message}
                        </Text>
                      </Flex>
                    ))}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
