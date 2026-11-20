"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const getLabel = (seg: string) => {
    switch (seg) {
      case "dashboard": return "Dashboard";
      case "job-seeker": return "Job Seeker";
      case "employer": return "Employer";
      case "admin": return "Admin";
      case "jobs": return "Jobs";
      case "applications": return "Applications";
      case "resume": return "Resume";
      case "profile": return "Profile";
      case "interviews": return "Interviews";
      case "applicants": return "Applicants";
      case "users": return "Users";
      case "employers": return "Employers";
      case "reports": return "Reports";
      default: return seg.charAt(0).toUpperCase() + seg.slice(1);
    }
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-neutral-500 dark:text-neutral-400">
      <Link
        href="/"
        className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <Home className="size-3.5" />
      </Link>
      {segments.map((seg, idx) => {
        const path = `/${segments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === segments.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="size-3 text-neutral-400" />
            {isLast ? (
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {getLabel(seg)}
              </span>
            ) : (
              <Link
                href={path}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                {getLabel(seg)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
