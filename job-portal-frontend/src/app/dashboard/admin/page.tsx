"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  FileText,
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck,
  Clock,
} from "lucide-react";
import { apiGet } from "@/lib/api";

interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalJobSeekers: number;
    totalEmployers: number;
    totalJobs: number;
    totalApplications: number;
    pendingEmployerVerifications: number;
  };
  registrationGrowth: Array<{ name: string; users: number; jobs: number }>;
  recentUsers: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    company: { name: string };
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await apiGet<AdminDashboardData>("/dashboard/admin");
        setData(res);
      } catch {
        // Fallback demo data
        setData({
          stats: {
            totalUsers: 84,
            totalJobSeekers: 62,
            totalEmployers: 21,
            totalJobs: 34,
            totalApplications: 142,
            pendingEmployerVerifications: 2,
          },
          registrationGrowth: [
            { name: "Jan", users: 15, jobs: 6 },
            { name: "Feb", users: 28, jobs: 12 },
            { name: "Mar", users: 45, jobs: 19 },
            { name: "Apr", users: 65, jobs: 26 },
            { name: "May", users: 84, jobs: 34 },
          ],
          recentUsers: [
            { id: "u-1", email: "sabinc692@gmail.com", role: "JOB_SEEKER", status: "ACTIVE", createdAt: new Date().toISOString() },
            { id: "u-2", email: "recruiter@technova.com", role: "EMPLOYER", status: "ACTIVE", createdAt: new Date().toISOString() },
            { id: "u-3", email: "aarav@example.com", role: "JOB_SEEKER", status: "ACTIVE", createdAt: new Date().toISOString() },
          ],
          recentJobs: [
            { id: "j-1", title: "Senior Full Stack Engineer", status: "PUBLISHED", company: { name: "TechNova Solutions" }, createdAt: new Date().toISOString() },
            { id: "j-2", title: "Cloud Infrastructure Specialist", status: "PUBLISHED", company: { name: "CloudScale Inc." }, createdAt: new Date().toISOString() },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <DashboardLayout allowedRole="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Platform Administration"
          description="High-level operational metrics, user governance, moderation, and systemic analytics."
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link href="/dashboard/admin/users" />}>
              <UserCheck className="mr-1.5 size-4" />
              Users
            </Button>
            <Button size="sm" render={<Link href="/dashboard/admin/reports" />}>
              Platform Reports
            </Button>
          </div>
        </PageHeader>

        {/* 6 Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Platform Users"
            value={data?.stats.totalUsers ?? 0}
            description="Combined candidates & employers"
            icon={Users}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColor="text-blue-600 dark:text-blue-400"
            loading={loading}
          />
          <StatCard
            title="Job Seekers"
            value={data?.stats.totalJobSeekers ?? 0}
            description="Active candidate accounts"
            icon={UserCheck}
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            iconColor="text-indigo-600 dark:text-indigo-400"
            loading={loading}
          />
          <StatCard
            title="Registered Employers"
            value={data?.stats.totalEmployers ?? 0}
            description="Verified organizations"
            icon={Building2}
            iconBg="bg-purple-50 dark:bg-purple-950/40"
            iconColor="text-purple-600 dark:text-purple-400"
            loading={loading}
          />
          <StatCard
            title="Total Job Postings"
            value={data?.stats.totalJobs ?? 0}
            description="All platform vacancies"
            icon={Briefcase}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
            loading={loading}
          />
          <StatCard
            title="Applications Processed"
            value={data?.stats.totalApplications ?? 0}
            description="Submissions through the portal"
            icon={FileText}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            iconColor="text-amber-600 dark:text-amber-400"
            loading={loading}
          />
          <StatCard
            title="Employer Verifications"
            value={data?.stats.pendingEmployerVerifications ?? 0}
            description="Pending corporate review"
            icon={ShieldCheck}
            iconBg="bg-rose-50 dark:bg-rose-950/40"
            iconColor="text-rose-600 dark:text-rose-400"
            loading={loading}
          />
        </div>

        {/* User Growth Chart */}
        <ActivityChart
          title="Platform Expansion &amp; Registrations"
          description="User acquisition trends across system milestones"
          weeklyData={data?.registrationGrowth || []}
          monthlyData={data?.registrationGrowth || []}
          yearlyData={data?.registrationGrowth || []}
          dataKey="users"
          color="#0284c7"
        />

        {/* Recent Platform Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Registrations */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Recent Registrations</CardTitle>
                <p className="text-xs text-neutral-500">Newly onboarded portal accounts</p>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/admin/users" />}>
                View Users
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {u.email}
                    </p>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {u.role.replace("_", " ")}
                    </Badge>
                    <Badge variant="default" className="bg-emerald-600 text-[10px]">
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Jobs Posted */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Recent Job Additions</CardTitle>
                <p className="text-xs text-neutral-500">Latest company vacancies</p>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/admin/jobs" />}>
                Moderate Jobs
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.recentJobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {j.title}
                    </p>
                    <p className="text-xs text-neutral-400">{j.company.name}</p>
                  </div>
                  <Badge variant="default" className="bg-blue-600 text-[10px]">
                    {j.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
