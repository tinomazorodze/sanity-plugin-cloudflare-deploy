import type {
  CloudflareDeployToolConfig,
  CloudflareDeployTarget,
  NormalizedDeployTarget,
} from "../types";
import { DEFAULT_TOOL_NAME, DEFAULT_TOOL_TITLE } from "./constants";

export function normalizeConfig(config?: CloudflareDeployToolConfig): {
  targets: NormalizedDeployTarget[];
  defaultTargetName: string;
  enableHistory: boolean;
  title: string;
  name: string;
} {
  const rootConfig = config || {};
  const targets: NormalizedDeployTarget[] = [];

  if (Array.isArray(rootConfig.targets) && rootConfig.targets.length > 0) {
    for (const t of rootConfig.targets) {
      if (t && t.deployHook) {
        targets.push({
          name: t.name || "production",
          label: t.label || t.name || "Production",
          deployHook: t.deployHook,
          environment: t.environment || t.name || "production",
          cloudflare: t.cloudflare || rootConfig.cloudflare,
        });
      }
    }
  }

  // If no targets array was provided or it was empty, check root deployHook
  if (targets.length === 0 && rootConfig.deployHook) {
    const targetName = rootConfig.targetName || "Production";
    targets.push({
      name: targetName.toLowerCase().replace(/\s+/g, "-"),
      label: targetName,
      deployHook: rootConfig.deployHook,
      environment: "production",
      cloudflare: rootConfig.cloudflare,
    });
  }

  const defaultTargetName =
    rootConfig.defaultTarget &&
    targets.some((t) => t.name === rootConfig.defaultTarget)
      ? rootConfig.defaultTarget
      : targets[0]?.name || "production";

  return {
    targets,
    defaultTargetName,
    enableHistory: rootConfig.enableHistory ?? true,
    title: rootConfig.title ?? DEFAULT_TOOL_TITLE,
    name: rootConfig.name ?? DEFAULT_TOOL_NAME,
  };
}

export function validateConfig(config?: CloudflareDeployToolConfig): string[] {
  const errors: string[] = [];

  if (!config) {
    errors.push("Plugin configuration is missing.");
    return errors;
  }

  const hasDeployHook = Boolean(config.deployHook);
  const hasTargets = Array.isArray(config.targets) && config.targets.length > 0;

  if (!hasDeployHook && !hasTargets) {
    errors.push(
      "Missing deployment target. Provide either 'deployHook' or an array of 'targets'.",
    );
  }

  if (hasTargets) {
    config.targets?.forEach((t, i) => {
      if (!t.name) {
        errors.push(`Target at index ${i} is missing required 'name'.`);
      }
      if (!t.deployHook) {
        errors.push(
          `Target '${t.name || i}' is missing required 'deployHook' URL.`,
        );
      }
    });

    if (
      config.defaultTarget &&
      !config.targets?.some((t) => t.name === config.defaultTarget)
    ) {
      errors.push(
        `defaultTarget '${config.defaultTarget}' was not found in targets list.`,
      );
    }
  }

  const checkCloudflareConfig = (cf?: any, context = "root") => {
    if (!cf) return;
    if (!cf.accountId || typeof cf.accountId !== "string") {
      errors.push(
        `Cloudflare API config (${context}) is missing valid 'accountId'.`,
      );
    }
    if (!cf.apiToken || typeof cf.apiToken !== "string") {
      errors.push(
        `Cloudflare API config (${context}) is missing valid 'apiToken'.`,
      );
    }
    if (!cf.projectName || typeof cf.projectName !== "string") {
      errors.push(
        `Cloudflare API config (${context}) is missing valid 'projectName'.`,
      );
    }
  };

  checkCloudflareConfig(config.cloudflare, "plugin config");
  config.targets?.forEach((t) => {
    if (t.cloudflare) {
      checkCloudflareConfig(t.cloudflare, `target '${t.name}'`);
    }
  });

  return errors;
}
