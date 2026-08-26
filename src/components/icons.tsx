import React from "react";
import {
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Send,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  History,
  Info,
  Rocket,
} from "lucide-react";

export function DeployIcon({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-sanity-icon="true"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        d="M10.06,19.53H4.27L12.5,5.21l8.23,14.32H14.94"
        style={{
          stroke: "currentColor",
          strokeWidth: "1.2",
        }}
      />
      <path
        d="M12.5,12.58v7.51"
        style={{
          stroke: "currentColor",
          strokeWidth: "1.2",
        }}
      />
      <path
        d="M15.12,16.76,12.5,12.58,10,16.71"
        style={{
          stroke: "currentColor",
          strokeWidth: "1.2",
        }}
      />
    </svg>
  );
}

export function CheckmarkIcon(props: any) {
  return <Check size={16} {...props} />;
}

export function CloseIcon(props: any) {
  return <X size={16} {...props} />;
}

export function SyncIcon(props: any) {
  return <RefreshCw size={16} {...props} />;
}

export function WarningOutlineIcon(props: any) {
  return <AlertTriangle size={16} {...props} />;
}

export function PublishIcon(props: any) {
  return <Send size={16} {...props} />;
}

export function HelpCircleIcon(props: any) {
  return <HelpCircle size={16} {...props} />;
}

export function LaunchIcon(props: any) {
  return <ExternalLink size={16} {...props} />;
}

export function ChevronDownIcon(props: any) {
  return <ChevronDown size={16} {...props} />;
}

export function ChevronUpIcon(props: any) {
  return <ChevronUp size={16} {...props} />;
}

export function UserIcon(props: any) {
  return <User size={16} {...props} />;
}

export function RefreshIcon(props: any) {
  return <RefreshCw size={16} {...props} />;
}

export function HistoryIcon(props: any) {
  return <History size={16} {...props} />;
}

export function InfoOutlineIcon(props: any) {
  return <Info size={16} {...props} />;
}

export const Icons = {
  DeployIcon,
  CheckmarkIcon,
  CloseIcon,
  SyncIcon,
  WarningOutlineIcon,
  PublishIcon,
  HelpCircleIcon,
  LaunchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  RefreshIcon,
  HistoryIcon,
  InfoOutlineIcon,
};
