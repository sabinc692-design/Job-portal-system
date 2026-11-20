"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_NAVIGATION } from "./nav-config";
import { AuthUser, AuthRole } from "@/lib/auth";
import { LogOut, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";

export interface DashboardSidebarProps {
  user: AuthUser;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({
  user,
  collapsed = false,
  onToggleCollapse,
  className,
  onNavigate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const role: AuthRole = user.role;
  const navItems = ROLE_NAVIGATION[role] || [];

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-neutral-200/80 bg-white transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900 select-none",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand & Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800">
        <Link
          href="/"
          className={cn("flex items-center gap-3 transition-opacity", collapsed && "justify-center w-full")}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 text-white shadow-sm dark:from-white dark:via-neutral-200 dark:to-neutral-400 dark:text-neutral-900">
            <span className="font-bold text-lg tracking-wider">J</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
                JobPortal <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium ml-1">JPS</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-medium capitalize">
                {role.replace("_", " ").toLowerCase()}
              </span>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={cn("px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400", collapsed && "hidden")}>
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                collapsed ? "justify-center px-0" : "",
                isActive
                  ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white dark:text-neutral-900"
                    : "text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                )}
              />
              {!collapsed && (
                <span className="truncate flex-1">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "default"}
                  className="ml-auto text-[10px] px-1.5 py-0"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer User info & Logout */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
        <Link
          href="/logout"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors",
            collapsed && "justify-center px-0"
          )}
          title="Sign out"
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </Link>
      </div>
    </aside>
  );
}
