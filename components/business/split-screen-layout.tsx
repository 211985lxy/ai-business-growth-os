/**
 * Split-Screen Layout
 * Core UI pattern: Left Panel (Forms/Assets) | Right Panel (Streaming Output)
 * Lobe Chat styled with smooth transitions
 */

"use client";

import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";

interface SplitScreenLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  leftClassName?: string;
  rightClassName?: string;
}

export function SplitScreenLayout({
  leftPanel,
  rightPanel,
  leftClassName = "w-full lg:w-[340px] xl:w-[380px]",
  rightClassName = "flex-1",
}: SplitScreenLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 lg:gap-8 overflow-hidden">
      {/* Left Panel - Input Forms / Asset Selector */}
      <SlideIn direction="left">
        <div className={`${leftClassName} h-full overflow-y-auto`}>{leftPanel}</div>
      </SlideIn>

      {/* Vertical Separator for Desktop */}
      <Separator orientation="vertical" className="hidden lg:block bg-border/30" />

      {/* Horizontal Separator for Mobile */}
      <Separator orientation="horizontal" className="lg:hidden bg-border/30" />

      {/* Right Panel - Live Streaming Output */}
      <FadeIn>
        <div className={`${rightClassName} h-full overflow-hidden`}>{rightPanel}</div>
      </FadeIn>
    </div>
  );
}
