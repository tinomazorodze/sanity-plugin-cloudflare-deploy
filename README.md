# sanity-plugin-cloudflare-deploy

## Installation

```sh
npm install sanity-plugin-cloudflare-deploy
```

## Usage

### 1. Basic Setup (Single Deploy Hook)

Add `cloudflareDeployTool` to the `plugins` array in `sanity.config.ts`:

```ts
import { defineConfig } from "sanity";
import { cloudflareDeployTool } from "sanity-plugin-cloudflare-deploy";

export default defineConfig({
  name: "default",
  title: "My Project",
  projectId: "your-project-id",
  dataset: "production",
  plugins: [
    cloudflareDeployTool({
      deployHook:
        process.env.SANITY_STUDIO_CLOUDFLARE_DEPLOY_HOOK ||
        "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...",
      targetName: "Production",
    }),
  ],
});
```

### 2. Multi-Target Setup (Production, Staging, Preview)

You can configure multiple deployment targets for different environments:

```ts
import { defineConfig } from "sanity";
import { cloudflareDeployTool } from "sanity-plugin-cloudflare-deploy";

export default defineConfig({
  // ...
  plugins: [
    cloudflareDeployTool({
      title: "Deployments",
      defaultTarget: "production",
      targets: [
        {
          name: "production",
          label: "Production Site",
          environment: "production",
          deployHook:
            "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxx-prod-hook",
        },
        {
          name: "staging",
          label: "Staging Preview",
          environment: "staging",
          deployHook:
            "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/yyy-staging-hook",
        },
      ],
    }),
  ],
});
```

### 3. Optional: Live Build Status Tracking via Cloudflare API

By providing Cloudflare API credentials, the plugin will poll Cloudflare's API to track live build stages, status changes (building, success, failure), and link directly to preview URLs:

```ts
import { defineConfig } from "sanity";
import { cloudflareDeployTool } from "sanity-plugin-cloudflare-deploy";

export default defineConfig({
  // ...
  plugins: [
    cloudflareDeployTool({
      deployHook:
        "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...",
      targetName: "Production",
      cloudflare: {
        accountId: process.env.SANITY_STUDIO_CF_ACCOUNT_ID!,
        apiToken: process.env.SANITY_STUDIO_CF_API_TOKEN!,
        projectName: "my-pages-project",
      },
    }),
  ],
});
```

### Configuration Options

| Option          | Type                       | Default               | Description                                                          |
| --------------- | -------------------------- | --------------------- | -------------------------------------------------------------------- |
| `deployHook`    | `string`                   | `undefined`           | Cloudflare Pages deploy hook URL for single-target setup.            |
| `targetName`    | `string`                   | `"Production"`        | Label for the default deployment target.                             |
| `targets`       | `CloudflareDeployTarget[]` | `[]`                  | List of deployment targets for multi-target environments.            |
| `defaultTarget` | `string`                   | `undefined`           | The name of the target selected by default.                          |
| `title`         | `string`                   | `"Cloudflare Deploy"` | Custom title displayed in the Studio tool navigation.                |
| `enableHistory` | `boolean`                  | `true`                | Persist and display deployment history in Sanity Studio.             |
| `cloudflare`    | `CloudflareApiConfig`      | `undefined`           | Cloudflare account & API credentials for live build status tracking. |

## License

[MIT](LICENSE) © Tino Mazorodze

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugins/tree/main/packages/@sanity/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugins/tree/main/packages/@sanity/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
