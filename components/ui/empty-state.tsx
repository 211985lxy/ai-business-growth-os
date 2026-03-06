/**
 * Empty State
 * Lobe Chat style empty state component for when there's no data
 */

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const IconComponent = icon;

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 p-12 text-center", className)}
    >
      {IconComponent && (
        <div className="text-muted-foreground/50">
          {typeof IconComponent === "function" ? (
            <IconComponent className="h-16 w-16" />
          ) : (
            <div className="text-6xl">{IconComponent}</div>
          )}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action && (
        <Button variant={action.variant || "default"} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface EmptyStateCardProps extends EmptyStateProps {
  bordered?: boolean;
}

export function EmptyStateCard({ bordered = true, ...props }: EmptyStateCardProps) {
  return (
    <div className={cn(bordered && "rounded-xl border p-12")}>
      <EmptyState {...props} />
    </div>
  );
}

// Preset empty states
interface EmptyStatePresetProps {
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function NoData({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon="📭"
      title="暂无数据"
      description="还没有任何数据，开始创建第一条记录吧"
      action={action}
      className={className}
    />
  );
}

export function NoResults({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon="🔍"
      title="未找到结果"
      description="尝试调整筛选条件或搜索关键词"
      action={action}
      className={className}
    />
  );
}

export function NoTasks({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon="✓"
      title="所有任务已完成"
      description="太棒了！你已经完成了所有待办任务"
      action={action}
      className={className}
    />
  );
}

export function NoNotifications({ action, className }: EmptyStatePresetProps) {
  return (
    <EmptyState
      icon="🔔"
      title="暂无通知"
      description="当有新消息时，你会在这里看到"
      action={action}
      className={className}
    />
  );
}

export function ErrorState({
  title = "出现错误",
  description = "抱歉，加载时出现了问题",
  action,
  className,
}: EmptyStateProps) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
