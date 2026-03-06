/**
 * Material Icon Component
 * Uses material-symbols package CSS classes
 */

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface MaterialIconProps extends HTMLAttributes<HTMLSpanElement> {
  icon: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  filled?: boolean;
  weight?: number;
  grade?: number;
  opticalSize?: number;
}

export function MaterialIcon({
  icon,
  size = 24,
  filled = false,
  weight = 400,
  grade = 0,
  opticalSize,
  className,
  style,
  ...props
}: MaterialIconProps) {
  // Convert size aliases to numbers
  const sizeMap = {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  };

  const finalSize = typeof size === "string" ? sizeMap[size] : size;
  const finalOpticalSize = opticalSize ?? finalSize;

  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{
        fontSize: `${finalSize}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${finalOpticalSize}`,
        ...style,
      }}
      {...props}
    >
      {icon}
    </span>
  );
}
