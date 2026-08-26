import React from "react";
import { Card, Flex, Stack, Text, Select, Badge } from "@sanity/ui";
import type { NormalizedDeployTarget } from "../types";

interface TargetSelectorProps {
  targets: NormalizedDeployTarget[];
  selectedTargetName: string;
  onSelectTarget: (name: string) => void;
  disabled?: boolean;
}

export function TargetSelector({
  targets,
  selectedTargetName,
  onSelectTarget,
  disabled = false,
}: TargetSelectorProps) {
  if (targets.length <= 1) {
    return null;
  }

  return (
    <Card padding={3} radius={2} border tone="inherit">
      <Flex align="center" justify="space-between" gap={3} wrap="wrap">
        <Stack gap={1}>
          <Text size={1} weight="semibold">
            Target Environment
          </Text>
          <Text size={0} muted>
            Select which Cloudflare Pages environment to deploy to
          </Text>
        </Stack>

        <Flex align="center" gap={2}>
          <Select
            fontSize={1}
            value={selectedTargetName}
            disabled={disabled}
            onChange={(e) => onSelectTarget(e.currentTarget.value)}
          >
            {targets.map((target) => (
              <option key={target.name} value={target.name}>
                {target.label} ({target.environment})
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>
    </Card>
  );
}
