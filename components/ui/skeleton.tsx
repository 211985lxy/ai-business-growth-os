/**
 * Loading Skeleton
 * Lobe Chat style skeleton loaders for content placeholders
 */

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-shimmer-custom rounded-md", className)} {...props} />;
}

export { Skeleton };
