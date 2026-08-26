export const API_VERSION = "2025-01-01";

export const DEPLOYMENT_TYPE = "cloudflare.deployment";

export const DEPLOYMENT_QUERY = `
  *[
    _type == "${DEPLOYMENT_TYPE}"
  ]
  | order(startedAt desc)
`;
