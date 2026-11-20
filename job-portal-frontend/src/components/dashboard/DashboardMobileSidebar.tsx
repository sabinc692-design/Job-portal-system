"use client";

import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DashboardSidebar } from "./DashboardSidebar";
import { AuthUser } from "@/lib/auth";

export function DashboardMobileSidebar({
  user,
  open,
  onOpenChange,
}: {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-72">
        <DashboardSidebar
          user={user}
          collapsed={false}
          className="border-r-0 h-full w-full"
          onNavigate={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
