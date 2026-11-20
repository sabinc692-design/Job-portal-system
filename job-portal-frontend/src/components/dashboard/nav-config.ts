import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Calendar,
  Building2,
  Users,
  BarChart3,
  FileSpreadsheet,
  LucideIcon,
} from "lucide-react";
import { AuthRole } from "@/lib/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export const ROLE_NAVIGATION: Record<AuthRole, NavItem[]> = {
  JOB_SEEKER: [
    {
      title: "Overview",
      href: "/dashboard/job-seeker",
      icon: LayoutDashboard,
    },
    {
      title: "Browse Jobs",
      href: "/dashboard/job-seeker/jobs",
      icon: Briefcase,
    },
    {
      title: "My Applications",
      href: "/dashboard/job-seeker/applications",
      icon: FileText,
    },
    {
      title: "My Resume",
      href: "/dashboard/job-seeker/resume",
      icon: FileSpreadsheet,
    },
    {
      title: "My Profile",
      href: "/dashboard/job-seeker/profile",
      icon: User,
    },
    {
      title: "Interviews",
      href: "/dashboard/job-seeker/interviews",
      icon: Calendar,
    },
  ],
  EMPLOYER: [
    {
      title: "Overview",
      href: "/dashboard/employer",
      icon: LayoutDashboard,
    },
    {
      title: "Manage Jobs",
      href: "/dashboard/employer/jobs",
      icon: Briefcase,
    },
    {
      title: "Applicants",
      href: "/dashboard/employer/applicants",
      icon: Users,
    },
    {
      title: "Interviews",
      href: "/dashboard/employer/interviews",
      icon: Calendar,
    },
    {
      title: "Company Profile",
      href: "/dashboard/employer/profile",
      icon: Building2,
    },
  ],
  ADMIN: [
    {
      title: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      title: "User Management",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Employer Management",
      href: "/dashboard/admin/employers",
      icon: Building2,
    },
    {
      title: "Job Moderation",
      href: "/dashboard/admin/jobs",
      icon: Briefcase,
    },
    {
      title: "Applications",
      href: "/dashboard/admin/applications",
      icon: FileText,
    },
    {
      title: "Reports & Analytics",
      href: "/dashboard/admin/reports",
      icon: BarChart3,
    },
  ],
};
