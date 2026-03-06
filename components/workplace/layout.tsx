/**
 * Workplace Layout - Feishu-style Dark Mode Workspace
 * Using react-resizable-panels for resizable panels
 */

"use client";

import { memo, useState, useCallback } from "react";
import { Panel, Separator, Group } from "react-resizable-panels";
import { GlobalNav } from "./global-nav";
import { ModuleSidebar } from "./module-sidebar";
import { WorkspaceCanvas } from "./workspace-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";

export const WorkplaceLayout = memo(function WorkplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#050505]">
      <Group orientation="horizontal" className="h-full">
        {/* L1: Global Navigation - Fixed 68px */}
        <Panel defaultSize={68} minSize={68} maxSize={68}>
          <GlobalNav />
        </Panel>

        {/* Resizable Handle */}
        <Separator className="w-px bg-white/5 hover:bg-white/10 transition-colors" />

        {/* L2: Module Sidebar - Collapsible */}
        <Panel defaultSize={22} minSize={sidebarCollapsed ? 0 : 15} maxSize={30} collapsible={true}>
          <ModuleSidebar
            collapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </Panel>

        {/* Resizable Handle */}
        {!sidebarCollapsed && (
          <Separator className="w-px bg-white/5 hover:bg-white/10 transition-colors cursor-col-resize" />
        )}

        {/* L3: Main Workspace - Flex-1 */}
        <Panel defaultSize={71} minSize={40}>
          {children}
        </Panel>
      </Group>
    </div>
  );
});
