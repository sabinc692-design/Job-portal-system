"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AuthRole,
  getAuthSessionSnapshot,
  getDashboardPath,
  parseAuthUser,
  subscribeAuthSession,
} from "@/lib/auth";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMobileSidebar } from "./DashboardMobileSidebar";
import { DashboardBreadcrumb } from "./DashboardBreadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRole?: AuthRole;
}

export function DashboardLayout({ children, allowedRole }: DashboardLayoutProps) {
  const router = useRouter();
  const serializedUser = useSyncExternalStore(subscribeAuthSession, getAuthSessionSnapshot, () => null);
  const user = useMemo(() => parseAuthUser(serializedUser), [serializedUser]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("accessToken");
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    if (allowedRole && user.role !== allowedRole) {
      router.replace(getDashboardPath(user.role));
    }
  }, [mounted, user, allowedRole, router]);

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
          <p className="text-sm font-medium text-neutral-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of wrong role content
  if (allowedRole && user.role !== allowedRole) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-neutral-50/70 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      {/* Desktop Sidebar */}
      <DashboardSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer */}
      <DashboardMobileSidebar
        user={user}
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <DashboardHeader
          user={user}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="mb-4">
            <DashboardBreadcrumb />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
