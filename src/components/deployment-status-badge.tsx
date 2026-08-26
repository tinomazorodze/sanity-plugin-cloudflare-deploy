import React from "react";
import { Badge, Flex, Text } from "@sanity/ui";
import { CheckmarkIcon } from "@sanity/icons/Checkmark";
import { CloseIcon } from "@sanity/icons/Close";
import { SyncIcon } from "@sanity/icons/Sync";
import { WarningOutlineIcon } from "@sanity/icons/WarningOutline";
import { PublishIcon } from "@sanity/icons/Publish";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import type { DeploymentStatus } from "../types";

interface DeploymentStatusBadgeProps {
  status: DeploymentStatus;
  size?: 1 | 2 | 3;
  showIcon?: boolean;
}

export function DeploymentStatusBadge({
  status,
  size = 1,
  showIcon = true,
}: DeploymentStatusBadgeProps) {
  let tone: "positive" | "critical" | "caution" | "primary" | "default" =
    "default";
  let label = "Unknown";
  let IconComponent: React.ComponentType<any> = HelpCircleIcon;
  let isSpinning = false;

  switch (status) {
    case "success":
      tone = "positive";
      label = "Success";
      IconComponent = CheckmarkIcon;
      break;
    case "failure":
      tone = "critical";
      label = "Failure";
      IconComponent = CloseIcon;
      break;
    case "building":
      tone = "caution";
      label = "Building...";
      IconComponent = SyncIcon;
      isSpinning = true;
      break;
    case "triggering":
      tone = "caution";
      label = "Triggering...";
      IconComponent = SyncIcon;
      isSpinning = true;
      break;
    case "triggered":
      tone = "primary";
      label = "Triggered";
      IconComponent = PublishIcon;
      break;
    case "canceled":
      tone = "caution";
      label = "Canceled";
      IconComponent = WarningOutlineIcon;
      break;
    default:
      tone = "default";
      label = "Unknown";
      IconComponent = HelpCircleIcon;
      break;
  }

  return (
    <Badge tone={tone} size={size}>
      <Flex align="center" gap={1}>
        {showIcon && (
          <span
            style={{
              display: "inline-flex",
              animation: isSpinning
                ? "sanity-spin 1.5s linear infinite"
                : undefined,
            }}
          >
            <IconComponent
              style={{ fontSize: size === 1 ? "0.9em" : "1.1em" }}
            />
          </span>
        )}
        <Text size={size === 1 ? 0 : 1} weight="medium">
          {label}
        </Text>
      </Flex>
    </Badge>
  );
}
