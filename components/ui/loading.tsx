/**
 * Loading States
 * Lobe Chat style loading indicators and spinners
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return <Loader2 className={cn("animate-spin", sizeMap[size], className)} />;
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = "加载中...", className }: LoadingOverlayProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <LoadingSpinner size="lg" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
    </div>
  );
}

interface LoadingBarProps {
  progress?: number;
  className?: string;
  showLabel?: boolean;
}

export function LoadingBar({ progress, className, showLabel }: LoadingBarProps) {
  const displayProgress = progress ?? 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-center">{Math.round(displayProgress)}%</p>
      )}
    </div>
  );
}

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  logo?: React.ReactNode;
  className?: string;
}

export function LoadingScreen({ message, submessage, logo, className }: LoadingScreenProps) {
  return (
    <div className={cn("flex min-h-[400px] flex-col items-center justify-center gap-6", className)}>
      {logo && <div className="text-6xl">{logo}</div>}
      <LoadingSpinner size="xl" />
      {message && <p className="text-lg font-medium">{message}</p>}
      {submessage && <p className="text-sm text-muted-foreground">{submessage}</p>}
    </div>
  );
}
