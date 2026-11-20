"use client";

import React from "react";
import Link from "next/link";
import { AuthUser, getDashboardPath } from "@/lib/auth";
import {
  Menu,
  Search,
  User as UserIcon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export interface DashboardHeaderProps {
  user: AuthUser;
  onOpenMobileSidebar: () => void;
}

export function DashboardHeader({
  user,
  onOpenMobileSidebar,
}: DashboardHeaderProps) {
  const getProfileLink = () => {
    switch (user.role) {
      case "JOB_SEEKER": return "/dashboard/job-seeker/profile";
      case "EMPLOYER": return "/dashboard/employer/profile";
      case "ADMIN": return "/dashboard/admin";
    }
  };

  const getRoleBadgeVariant = () => {
    switch (user.role) {
      case "ADMIN": return "destructive";
      case "EMPLOYER": return "secondary";
      default: return "outline";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-neutral-800 dark:bg-neutral-900/90">
      {/* Left side: Hamburger button for mobile & Search input */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block max-w-md w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Quick search jobs, companies, applicants..."
            className="w-full pl-9 h-9 text-xs rounded-xl bg-neutral-50/80 border-neutral-200 focus:bg-white dark:bg-neutral-800/60 dark:border-neutral-700"
          />
        </div>
      </div>

      {/* Right side: Notifications, Role Pill, User Avatar Menu */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* User Role Badge */}
        <Badge
          variant={getRoleBadgeVariant() as "default" | "secondary" | "destructive" | "outline"}
          className="hidden sm:inline-flex capitalize text-xs"
        >
          {user.role.replace("_", " ").toLowerCase()}
        </Badge>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Avatar
                fallback={user.name || user.email}
                size="sm"
                className="bg-neutral-900 text-white font-bold text-xs"
              />
              <div className="hidden text-left md:block pr-1">
                <p className="text-xs font-semibold leading-none text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">
                  {user.name}
                </p>
                <p className="text-[10px] leading-tight text-neutral-400 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{user.name}</span>
                <span className="text-[11px] font-normal text-neutral-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={getProfileLink()} className="flex items-center gap-2 w-full text-xs">
                <UserIcon className="size-3.5" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/" className="flex items-center gap-2 w-full text-xs">
                <ExternalLink className="size-3.5" />
                <span>Public Portal</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>
              <Link href="/logout" className="flex items-center gap-2 w-full text-xs">
                <LogOut className="size-3.5" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
