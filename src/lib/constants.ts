export const API_VERSION = "2025-01-01";

export const DEPLOYMENT_TYPE = "cloudflare.deployment";

export const DEFAULT_TOOL_NAME = "cloudflare-deploy";
export const DEFAULT_TOOL_TITLE = "Deploy";

export const DEPLOYMENT_QUERY = `
  *[
    _type == "${DEPLOYMENT_TYPE}"
  ]
  | order(startedAt desc)[0...50]
`;
