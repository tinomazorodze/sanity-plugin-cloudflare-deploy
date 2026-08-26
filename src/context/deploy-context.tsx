import React, { createContext, useContext, useMemo, useState } from "react";
import type {
  CloudflareDeployToolConfig,
  NormalizedDeployTarget,
} from "../types";
import { normalizeConfig, validateConfig } from "../lib/config";

interface DeployContextValue {
  targets: NormalizedDeployTarget[];
  selectedTarget: NormalizedDeployTarget | null;
  selectedTargetName: string;
  setSelectedTargetName: (name: string) => void;
  enableHistory: boolean;
  title: string;
  toolName: string;
  validationErrors: string[];
  isConfigValid: boolean;
  config?: CloudflareDeployToolConfig;
}

const DeployContext = createContext<DeployContextValue | undefined>(undefined);

export interface DeployContextProviderProps {
  config?: CloudflareDeployToolConfig;
  children: React.ReactNode;
}

export function DeployContextProvider({
  config,
  children,
}: DeployContextProviderProps) {
  const { targets, defaultTargetName, enableHistory, title, name } = useMemo(
    () => normalizeConfig(config),
    [config],
  );

  const validationErrors = useMemo(() => validateConfig(config), [config]);
  const isConfigValid = validationErrors.length === 0 && targets.length > 0;

  const [selectedTargetName, setSelectedTargetName] =
    useState<string>(defaultTargetName);

  const selectedTarget = useMemo(() => {
    return (
      targets.find((t) => t.name === selectedTargetName) || targets[0] || null
    );
  }, [targets, selectedTargetName]);

  const value = useMemo<DeployContextValue>(() => {
    return {
      targets,
      selectedTarget,
      selectedTargetName: selectedTarget?.name || selectedTargetName,
      setSelectedTargetName,
      enableHistory,
      title,
      toolName: name,
      validationErrors,
      isConfigValid,
      config,
    };
  }, [
    targets,
    selectedTarget,
    selectedTargetName,
    enableHistory,
    title,
    name,
    validationErrors,
    isConfigValid,
    config,
  ]);

  return (
    <DeployContext.Provider value={value}>{children}</DeployContext.Provider>
  );
}

export function useDeployContext(): DeployContextValue {
  const context = useContext(DeployContext);
  if (!context) {
    throw new Error(
      "useDeployContext must be used within a DeployContextProvider",
    );
  }
  return context;
}
