import React from "react";
import { definePlugin } from "sanity";
import type { CloudflareDeployToolConfig } from "./types";
import { DeployPage } from "./components/deploy-page";
import { Icons } from "./components/icons";
import { deploymentSchema } from "./schemas/deployment";
import { DEFAULT_TOOL_NAME, DEFAULT_TOOL_TITLE } from "./lib/constants";

export const cloudflareDeployTool =
  definePlugin<CloudflareDeployToolConfig | void>((config) => {
    const toolName = config?.name ?? DEFAULT_TOOL_NAME;
    const toolTitle = config?.title ?? DEFAULT_TOOL_TITLE;
    const toolIcon = config?.icon ?? Icons.DeployIcon;

    return {
      name: "sanity-plugin-cloudflare-deploy",

      schema: {
        types: [deploymentSchema],
      },

      tools: [
        {
          name: toolName,
          title: toolTitle,
          icon: toolIcon,
          component: (props) => (
            <DeployPage {...props} config={config || undefined} />
          ),
        },
      ],
    };
  });
