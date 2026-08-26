import { definePlugin } from "sanity";
import type { CloudflareDeployToolConfig } from "./types";
import { DeployPage } from "./components/deploy-page";
import { Icons } from "./components/icons";

export const cloudflareDeployTool = definePlugin<CloudflareDeployToolConfig>(
  (config) => {
    const { name, title, icon } = config || {};
    return {
      name: "sanity-plugin-cloudflare-deploy",

      tools: [
        {
          name: name ?? "cloudflare-deploy",
          title: title ?? "Deploy",
          icon: icon ?? Icons.DeployIcon,
          component: DeployPage,
        },
      ],
    };
  },
);
