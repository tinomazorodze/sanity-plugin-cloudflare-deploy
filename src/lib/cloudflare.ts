import type {
  CloudflareApiConfig,
  CloudflarePagesDeployment,
  DeploymentRecord,
  DeploymentStatus,
} from "../types";

/**
 * Triggers a Cloudflare Pages Deploy Hook via POST request.
 * Does not require Cloudflare API tokens or account credentials.
 */
export async function triggerDeployHook(deployHook: string): Promise<void> {
  if (!deployHook) {
    throw new Error("Missing Cloudflare Deploy Hook URL");
  }

  let response: Response;
  try {
    response = await fetch(deployHook, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (err: any) {
    throw new Error(
      `Network error while contacting Cloudflare: ${err?.message || "Check your internet connection"}`,
    );
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const data = await response.json();
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        errorDetail = data.errors.map((e: any) => e.message).join(", ");
      } else if (data?.message) {
        errorDetail = data.message;
      }
    } catch {
      // Body may not be JSON
    }

    const suffix = errorDetail ? `: ${errorDetail}` : "";
    throw new Error(
      `Cloudflare rejected the deployment request (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""})${suffix}`,
    );
  }
}

/**
 * Alias for triggerDeployHook for backwards compatibility.
 */
export const triggerCloudflareDeploy = triggerDeployHook;

/**
 * Cloudflare Pages API endpoint base URL.
 */
const CF_API_BASE = "https://api.cloudflare.com/client/v4";

/**
 * Convenience wrapper to fetch and normalize Cloudflare Pages deployments
 */
export async function fetchCloudflareApiDeployments(
  config: CloudflareApiConfig,
): Promise<Partial<DeploymentRecord>[]> {
  const deployments = await listCloudflareDeployments(config);
  return deployments.map((d) => {
    const status = mapCloudflareStatusToDeploymentStatus(d);
    return {
      deploymentId: d.id,
      environment: d.environment || "production",
      status,
      trigger: d.deployment_trigger?.type === "ad_hoc" ? "manual" : "webhook",
      startedAt: d.created_on,
      completedAt: d.modified_on,
      deploymentUrl: d.url,
      logs: (d.stages || []).map((s) => ({
        timestamp: s.started_on
          ? new Date(s.started_on).toLocaleTimeString()
          : new Date(d.created_on).toLocaleTimeString(),
        message: `Stage [${s.name}]: ${s.status}`,
        type:
          s.status === "success"
            ? "success"
            : s.status === "failure"
              ? "error"
              : "info",
      })),
    };
  });
}

/**
 * Fetches recent deployments for a Cloudflare Pages project.
 */
export async function listCloudflareDeployments(
  config: CloudflareApiConfig,
  options: { perPage?: number } = {},
): Promise<CloudflarePagesDeployment[]> {
  const { accountId, apiToken, projectName } = config;
  const perPage = options.perPage ?? 10;

  const url = `${CF_API_BASE}/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}/deployments?per_page=${perPage}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    throw new Error(
      `Cloudflare API connection failed: ${err?.message || "Network error"}`,
    );
  }

  if (!response.ok) {
    let message = `Cloudflare API returned HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data?.errors?.[0]?.message) {
        message = `Cloudflare API error: ${data.errors[0].message}`;
      }
    } catch {
      // Ignore parse error
    }
    throw new Error(message);
  }

  const data = (await response.json()) as {
    success: boolean;
    result?: CloudflarePagesDeployment[];
    errors?: Array<{ message: string }>;
  };
  if (!data.success) {
    const msg =
      data.errors?.[0]?.message ||
      "Failed to retrieve deployments from Cloudflare";
    throw new Error(`Cloudflare API error: ${msg}`);
  }

  return data.result || [];
}

/**
 * Fetches details for a specific Cloudflare Pages deployment.
 */
export async function getCloudflareDeployment(
  config: CloudflareApiConfig,
  deploymentId: string,
): Promise<CloudflarePagesDeployment> {
  const { accountId, apiToken, projectName } = config;

  const url = `${CF_API_BASE}/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}/deployments/${encodeURIComponent(deploymentId)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    throw new Error(
      `Cloudflare API connection failed: ${err?.message || "Network error"}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Cloudflare deployment lookup failed (HTTP ${response.status})`,
    );
  }

  const data = (await response.json()) as {
    success: boolean;
    result?: CloudflarePagesDeployment;
    errors?: Array<{ message: string }>;
  };
  if (!data.success || !data.result) {
    throw new Error(
      data.errors?.[0]?.message || "Deployment not found on Cloudflare",
    );
  }

  return data.result;
}

/**
 * Maps Cloudflare Pages stages and deployment state to a unified DeploymentStatus.
 */
export function mapCloudflareStatusToDeploymentStatus(
  deployment: CloudflarePagesDeployment,
): DeploymentStatus {
  if (!deployment) return "unknown";

  const latestStage = deployment.latest_stage;
  const stageName = latestStage?.name?.toLowerCase();
  const stageStatus = latestStage?.status?.toLowerCase();

  // Terminal failures & cancellations
  if (stageStatus === "failure" || stageStatus === "failed") {
    return "failure";
  }
  if (stageStatus === "canceled" || stageStatus === "cancelled") {
    return "canceled";
  }

  // Check if overall deploy stage completed successfully
  if (stageName === "deploy" && stageStatus === "success") {
    return "success";
  }

  // Active build / deploy stages
  if (
    stageStatus === "active" ||
    stageStatus === "idle" ||
    stageName === "queued" ||
    stageName === "initialize" ||
    stageName === "clone_repo" ||
    stageName === "build" ||
    stageName === "deploy"
  ) {
    return "building";
  }

  // If stages array is present, inspect last stage
  if (Array.isArray(deployment.stages) && deployment.stages.length > 0) {
    const lastStage = deployment.stages[deployment.stages.length - 1];
    if (lastStage.name === "deploy" && lastStage.status === "success") {
      return "success";
    }
    if (deployment.stages.some((s) => s.status === "failure")) {
      return "failure";
    }
    if (deployment.stages.some((s) => s.status === "canceled")) {
      return "canceled";
    }
    if (deployment.stages.some((s) => s.status === "active")) {
      return "building";
    }
  }

  return "building";
}

/**
 * Attempts to match a triggered deployment against Cloudflare Pages API.
 * Uses timing window around the trigger timestamp and matching environment.
 */
export async function findMatchingDeployment(
  config: CloudflareApiConfig,
  triggeredAtMs: number,
  environment?: string,
): Promise<CloudflarePagesDeployment | null> {
  const deployments = await listCloudflareDeployments(config, { perPage: 10 });
  if (!deployments || deployments.length === 0) {
    return null;
  }

  // Window: -30 seconds to +180 seconds around trigger time
  const minTime = triggeredAtMs - 30 * 1000;
  const maxTime = triggeredAtMs + 180 * 1000;

  const envNormalized = environment?.toLowerCase();

  // Filter candidates within window and environment
  const candidates = deployments.filter((d) => {
    const createdMs = new Date(d.created_on).getTime();
    const timeMatch = createdMs >= minTime && createdMs <= maxTime;

    if (!timeMatch) return false;

    if (envNormalized && d.environment) {
      if (
        envNormalized === "production" &&
        d.environment.toLowerCase() !== "production"
      ) {
        return false;
      }
      if (
        envNormalized === "preview" &&
        d.environment.toLowerCase() !== "preview"
      ) {
        return false;
      }
    }

    return true;
  });

  if (candidates.length > 0) {
    // Return the candidate closest to triggeredAtMs
    return candidates.sort((a, b) => {
      const diffA = Math.abs(new Date(a.created_on).getTime() - triggeredAtMs);
      const diffB = Math.abs(new Date(b.created_on).getTime() - triggeredAtMs);
      return diffA - diffB;
    })[0];
  }

  // Fallback: If no candidate in exact window, check if the newest deployment was created right after trigger
  const newest = deployments[0];
  const newestTime = new Date(newest.created_on).getTime();
  if (newestTime >= triggeredAtMs - 15 * 1000) {
    return newest;
  }

  return null;
}
