/**
 * Status Indicators
 * Lobe Chat style status badges and indicators
 */

import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export type Status = "success" | "warning" | "error" | "info" | "processing";

const statusConfig = {
  success: {
    variant: "success" as const,
    label: "成功",
    icon: "✓",
  },
  warning: {
    variant: "warning" as const,
    label: "警告",
    icon: "⚠",
  },
  error: {
    variant: "destructive" as const,
    label: "错误",
    icon: "✕",
  },
  info: {
    variant: "info" as const,
    label: "信息",
    icon: "ⓘ",
  },
  processing: {
    variant: "default" as const,
    label: "处理中",
    icon: "⋯",
  },
};

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      <span className="text-xs">{config.icon}</span>
      {label || config.label}
    </Badge>
  );
}

interface StatusDotProps {
  status: Status;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function StatusDot({ status, className, showLabel, label }: StatusDotProps) {
  const config = statusConfig[status];

  const colorMap = {
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    processing: "bg-blue-500 animate-pulse",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2 w-2 rounded-full", colorMap[status])} />
      {showLabel && <span className="text-sm text-muted-foreground">{label || config.label}</span>}
    </div>
  );
}

interface StatusIndicatorProps {
  status: Status;
  title: string;
  description?: string;
  className?: string;
}

export function StatusIndicator({ status, title, description, className }: StatusIndicatorProps) {
  const config = statusConfig[status];

  const bgMap = {
    success: "bg-green-500/10 border-green-500/20",
    warning: "bg-amber-500/10 border-amber-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
    processing: "bg-blue-500/10 border-blue-500/20",
  };

  const textMap = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
    processing: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-lg border", bgMap[status], className)}>
      <span className={cn("text-lg font-semibold", textMap[status])}>{config.icon}</span>
      <div className="flex-1">
        <p className={cn("font-medium", textMap[status])}>{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
