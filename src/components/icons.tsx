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
} from "lucide-react";

export function DeployIcon({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-sanity-icon="inbox"
      width="1em"
      height="1em"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 8.5H8.17703C7.76813 8.5 7.40042 8.74895 7.24856 9.12861L5.5 13.5M5.5 13.5V17.5C5.5 18.0523 5.94302 18.5 6.4953 18.5C9.00381 18.5 15.5919 18.5 18.504 18.5C19.0563 18.5 19.5 18.0523 19.5 17.5V13.5M5.5 13.5H8.5L10 15.5H15L16.5 13.5H19.5M19.5 13.5L17.7514 9.12861C17.5996 8.74895 17.2319 8.5 16.823 8.5H16M12.5 5V12.5M12.5 12.5L15 10M12.5 12.5L10 10"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linejoin="round"
      ></path>
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
