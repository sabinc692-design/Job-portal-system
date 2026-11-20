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
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Building2,
} from "lucide-react";
import { apiGet } from "@/lib/api";

interface EmployerOverviewData {
  stats: {
    totalJobsPosted: number;
    activeJobs: number;
    totalApplicants: number;
    shortlistedCandidates: number;
    interviewsScheduled: number;
  };
  recruitmentActivity: Array<{ name: string; applicants: number; interviews: number }>;
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    location: string;
    createdAt: string;
    _count?: { applications: number };
  }>;
  recentApplicants: Array<{
    id: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    appliedDate: string;
    status: string;
  }>;
}

export default function EmployerDashboardPage() {
  const [data, setData] = useState<EmployerOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiGet<EmployerOverviewData>("/dashboard/employer");
        setData(res);
      } catch {
        // Fallback demo data
        setData({
          stats: {
            totalJobsPosted: 5,
            activeJobs: 4,
            totalApplicants: 28,
            shortlistedCandidates: 9,
            interviewsScheduled: 3,
          },
          recruitmentActivity: [
            { name: "Week 1", applicants: 4, interviews: 1 },
            { name: "Week 2", applicants: 8, interviews: 2 },
            { name: "Week 3", applicants: 15, interviews: 3 },
            { name: "Week 4", applicants: 28, interviews: 3 },
          ],
          recentJobs: [
            {
              id: "job-1",
              title: "Senior Full Stack Engineer",
              status: "PUBLISHED",
              location: "Kathmandu, Nepal (Hybrid)",
              createdAt: new Date().toISOString(),
              _count: { applications: 12 },
            },
            {
              id: "job-2",
              title: "Cloud Infrastructure Specialist",
              status: "PUBLISHED",
              location: "Remote",
              createdAt: new Date().toISOString(),
              _count: { applications: 9 },
            },
            {
              id: "job-3",
              title: "UI Engineer (React / Tailwind)",
              status: "PUBLISHED",
              location: "Lalitpur, Nepal",
              createdAt: new Date().toISOString(),
              _count: { applications: 7 },
            },
          ],
          recentApplicants: [
            {
              id: "app-1",
              candidateName: "Sabin Chaulagain",
              candidateEmail: "sabinc692@gmail.com",
              jobTitle: "Senior Full Stack Engineer",
              appliedDate: new Date().toISOString(),
              status: "INTERVIEW",
            },
            {
              id: "app-2",
              candidateName: "Aarav Sharma",
              candidateEmail: "aarav@example.com",
              jobTitle: "Cloud Infrastructure Specialist",
              appliedDate: new Date().toISOString(),
              status: "SHORTLISTED",
            },
            {
              id: "app-3",
              candidateName: "Pooja Thapa",
              candidateEmail: "pooja@example.com",
              jobTitle: "UI Engineer (React / Tailwind)",
              appliedDate: new Date().toISOString(),
              status: "SUBMITTED",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout allowedRole="EMPLOYER">
      <div className="space-y-6">
        <PageHeader
          title="Employer Hiring Portal"
          description="Manage active job openings, review candidate pipelines, and coordinate interviews."
        >
          <Button render={<Link href="/dashboard/employer/jobs" />}>
            <Plus className="mr-2 size-4" />
            Create Job Post
          </Button>
        </PageHeader>

        {/* 5 Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Jobs Posted"
            value={data?.stats.totalJobsPosted ?? 0}
            icon={Briefcase}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColor="text-blue-600 dark:text-blue-400"
            loading={loading}
          />
          <StatCard
            title="Active Jobs"
            value={data?.stats.activeJobs ?? 0}
            icon={TrendingUp}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
            loading={loading}
          />
          <StatCard
            title="Total Applicants"
            value={data?.stats.totalApplicants ?? 0}
            icon={Users}
            iconBg="bg-purple-50 dark:bg-purple-950/40"
            iconColor="text-purple-600 dark:text-purple-400"
            trend={{ value: "+18%", isPositive: true }}
            loading={loading}
          />
          <StatCard
            title="Shortlisted"
            value={data?.stats.shortlistedCandidates ?? 0}
            icon={CheckCircle2}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            iconColor="text-amber-600 dark:text-amber-400"
            loading={loading}
          />
          <StatCard
            title="Interviews"
            value={data?.stats.interviewsScheduled ?? 0}
            icon={Calendar}
            iconBg="bg-rose-50 dark:bg-rose-950/40"
            iconColor="text-rose-600 dark:text-rose-400"
            loading={loading}
          />
        </div>

        {/* Recruitment Activity Chart */}
        <ActivityChart
          title="Applicant Trajectory"
          description="Application inflows across weekly, monthly, and annual hiring cycles"
          weeklyData={data?.recruitmentActivity || []}
          monthlyData={data?.recruitmentActivity || []}
          yearlyData={data?.recruitmentActivity || []}
          dataKey="applicants"
          color="#2563eb"
        />

        {/* Recent Jobs & Recent Applicants */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Jobs */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Recent Job Postings</CardTitle>
                <p className="text-xs text-neutral-500">Live positions open for applications</p>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/employer/jobs" />}>
                View All
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {job.title}
                    </h4>
                    <p className="text-xs text-neutral-500">{job.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {job._count?.applications ?? 0} applicants
                    </span>
                    <Badge variant="default" className="bg-emerald-600 text-[10px]">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Applicants */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Latest Candidates</CardTitle>
                <p className="text-xs text-neutral-500">New candidate submissions waiting for review</p>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/employer/applicants" />}>
                View All
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.recentApplicants.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {app.candidateName}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Applied for {app.jobTitle}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {app.status.toLowerCase()}
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
