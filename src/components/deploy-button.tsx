import React from "react";
import { Button, Spinner, Flex, Text } from "@sanity/ui";
import { Icons } from "./icons";

interface DeployButtonProps {
  onClick: () => void;
  isDeploying: boolean;
  targetLabel?: string;
  disabled?: boolean;
}

export function DeployButton({
  onClick,
  isDeploying,
  targetLabel,
  disabled = false,
}: DeployButtonProps) {
  const label = targetLabel ? `Deploy ${targetLabel}` : "Deploy";

  return (
    <Button
      tone="primary"
      onClick={onClick}
      disabled={disabled || isDeploying}
      padding={[3, 3, 4]}
      style={{ cursor: disabled || isDeploying ? "not-allowed" : "pointer" }}
    >
      <Flex align="center" justify="center" gap={2}>
        {isDeploying ? (
          <Spinner size={1} />
        ) : (
          <Icons.DeployIcon style={{ fontSize: "1.25em" }} />
        )}
        <Text weight="bold" size={2}>
          {isDeploying ? "Deploying..." : label}
        </Text>
      </Flex>
    </Button>
  );
}
