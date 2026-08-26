# sanity-plugin-cloudflare-deploy

## Installation

```sh
npm install sanity-plugin-cloudflare-deploy
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import { defineConfig } from "sanity";
import { cloudflareDeployTool } from "sanity-plugin-cloudflare-deploy";

export default defineConfig({
  //...
  plugins: [cloudflareDeployTool({})],
});
```

## License

[MIT](LICENSE) © Tino Mazorodze

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugins/tree/main/packages/@sanity/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugins/tree/main/packages/@sanity/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
