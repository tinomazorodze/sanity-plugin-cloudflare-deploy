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

export interface CloudflareApiConfig {
  accountId: string;
  apiToken: string;
  projectName: string;
}

export interface CloudflareDeployTarget {
  name: string;
  label?: string;
  deployHook: string;
  environment?: string;
  cloudflare?: CloudflareApiConfig;
}

export interface CloudflareDeployToolConfig {
  name?: string;
  title?: string;
  icon?: React.ComponentType;
  deployHook?: string;
  targetName?: string;
  targets?: CloudflareDeployTarget[];
  defaultTarget?: string;
  enableHistory?: boolean;
  cloudflare?: CloudflareApiConfig;
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

export interface CloudflarePagesStage {
  name: string;
  status: string;
  started_on?: string | null;
  ended_on?: string | null;
}

export interface CloudflarePagesDeployment {
  id: string;
  short_id?: string;
  project_id?: string;
  project_name?: string;
  environment?: string;
  url?: string;
  created_on: string;
  modified_on?: string;
  aliases?: string[];
  latest_stage?: CloudflarePagesStage;
  stages?: CloudflarePagesStage[];
  build_config?: {
    build_command?: string;
    destination_dir?: string;
    root_dir?: string;
  };
  source?: {
    type?: string;
    config?: {
      owner?: string;
      repo_name?: string;
      production_branch?: string;
      pr_id?: number;
      deploy_hook_id?: string;
    };
  };
  deployment_trigger?: {
    type?: string;
    metadata?: {
      branch?: string;
      commit_hash?: string;
      commit_message?: string;
    };
  };
}

export interface NormalizedDeployTarget {
  name: string;
  label: string;
  deployHook: string;
  environment: string;
  cloudflare?: CloudflareApiConfig;
}
