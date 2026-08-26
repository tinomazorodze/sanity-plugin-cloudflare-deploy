import React from "react";
import { Card, Stack, Flex, Heading, Text, Box } from "@sanity/ui";
import { WarningOutlineIcon } from "./icons";

interface ConfigWarningProps {
  errors: string[];
}

export function ConfigWarning({ errors }: ConfigWarningProps) {
  return (
    <Card tone="caution" padding={[3, 4, 4]} radius={3} border>
      <Stack gap={4}>
        <Flex align="center" gap={2}>
          <WarningOutlineIcon style={{ fontSize: "1.5em" }} />
          <Heading size={2}>Configuration Required</Heading>
        </Flex>

        <Text size={1}>
          The Cloudflare Deploy plugin requires at least one configured Deploy
          Hook to trigger builds.
        </Text>

        {errors.length > 0 && (
          <Card padding={3} radius={2} tone="critical">
            <Stack gap={1}>
              <Text size={1} weight="semibold">
                Configuration Issues:
              </Text>
              {errors.map((err, i) => (
                <Text key={i} size={1}>
                  • {err}
                </Text>
              ))}
            </Stack>
          </Card>
        )}

        <Stack gap={2}>
          <Text size={1} weight="semibold">
            How to set up a Cloudflare Pages Deploy Hook:
          </Text>
          <Text size={1}>
            1. Open the <strong>Cloudflare Dashboard</strong> and go to{" "}
            <strong>Workers & Pages</strong>.
          </Text>
          <Text size={1}>
            2. Select your Pages project, then navigate to{" "}
            <strong>Settings → Builds & deployments</strong>.
          </Text>
          <Text size={1}>
            3. Scroll down to <strong>Deploy hooks</strong> and click{" "}
            <strong>Add deploy hook</strong>.
          </Text>
          <Text size={1}>
            4. Copy the generated webhook URL and configure your Sanity Studio:
          </Text>

          <Box paddingTop={1}>
            <pre className="p-3 bg-zinc-900 text-zinc-200 rounded text-xs overflow-x-auto font-mono">
              {`// sanity.config.ts
import { cloudflareDeployTool } from "sanity-plugin-cloudflare-deploy";

export default defineConfig({
  // ...
  plugins: [
    cloudflareDeployTool({
      deployHook: process.env.SANITY_STUDIO_CLOUDFLARE_DEPLOY_HOOK,
      targetName: "Production",
    }),
  ],
});`}
            </pre>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}
