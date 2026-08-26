export type DeploymentStatus =
  | "triggering"
  | "triggered"
  | "building"
  | "success"
  | "failure"
  | "canceled"
  | "unknown";

export type DeploymentTrigger = "manual" | "webhook";

export type DeploymentEnvironment =
  | "production"
  | "preview"
  | "staging"
  | "custom";

export interface DeploymentLog {
  timestamp: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

export interface DeploymentUser {
  id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}

export interface DeploymentRecord {
  _id?: string;
  _createdAt?: string;
  _updatedAt?: string;

  _type: "cloudflare.deployment";

  environment: string;
  status: DeploymentStatus;
  trigger: DeploymentTrigger;

  startedAt: string;

  completedAt?: string;

  triggeredBy?: DeploymentUser;

  deploymentId?: string;

  deploymentUrl?: string;

  logs?: DeploymentLog[];

  error?: string;
}

export interface CloudflareApiConfig {
  accountId: string;
  apiToken: string;
  projectName: string;
}

export interface CloudflareDeployTarget {
  name: string;
  label?: string;

  deployHook: string;

  environment?: DeploymentEnvironment;

  cloudflare?: CloudflareApiConfig;
}

export interface CloudflareDeployToolConfig {
  name?: string;
  title?: string;
  icon?: React.ComponentType;
  deployHook?: string;
  targetName?: string;
  enableHistory?: boolean;
  cloudflare?: CloudflareApiConfig;
}
