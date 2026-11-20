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
  FileCheck2,
  Eye,
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  Video,
  ExternalLink,
} from "lucide-react";
import { apiGet } from "@/lib/api";

interface DashboardData {
  stats: {
    totalAvailableJobs: number;
    totalAppliedJobs: number;
    profileViews: number;
    interviewsScheduled: number;
  };
  activity: {
    weekly: Array<{ name: string; applications: number }>;
    monthly: Array<{ name: string; applications: number }>;
    yearly: Array<{ name: string; applications: number }>;
  };
  recentApplications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    location: string;
    appliedDate: string;
    status: string;
  }>;
  upcomingInterviews: Array<{
    id: string;
    applicationId: string;
    jobTitle: string;
    companyName: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
    meetingLink: string;
    status: string;
  }>;
}

const statusBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUBMITTED: "outline",
  REVIEWING: "secondary",
  SHORTLISTED: "secondary",
  INTERVIEW: "default",
  REJECTED: "destructive",
  HIRED: "default",
  WITHDRAWN: "outline",
};

export default function JobSeekerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiGet<DashboardData>("/dashboard/job-seeker");
        setData(res);
      } catch {
        // Fallback demo data if backend has no records yet
        setData({
          stats: {
            totalAvailableJobs: 24,
            totalAppliedJobs: 6,
            profileViews: 48,
            interviewsScheduled: 2,
          },
          activity: {
            weekly: [
              { name: "Mon", applications: 1 },
              { name: "Tue", applications: 2 },
              { name: "Wed", applications: 0 },
              { name: "Thu", applications: 3 },
              { name: "Fri", applications: 1 },
              { name: "Sat", applications: 0 },
              { name: "Sun", applications: 1 },
            ],
            monthly: [
              { name: "Jan", applications: 2 },
              { name: "Feb", applications: 4 },
              { name: "Mar", applications: 5 },
              { name: "Apr", applications: 3 },
              { name: "May", applications: 7 },
              { name: "Jun", applications: 6 },
              { name: "Jul", applications: 8 },
              { name: "Aug", applications: 5 },
              { name: "Sep", applications: 9 },
              { name: "Oct", applications: 6 },
              { name: "Nov", applications: 8 },
              { name: "Dec", applications: 4 },
            ],
            yearly: [
              { name: "2024", applications: 12 },
              { name: "2025", applications: 28 },
              { name: "2026", applications: 38 },
            ],
          },
          recentApplications: [
            {
              id: "app-1",
              jobId: "1",
              jobTitle: "Senior Full Stack Engineer",
              companyName: "TechNova Solutions",
              location: "Kathmandu / Remote",
              appliedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
              status: "INTERVIEW",
            },
            {
              id: "app-2",
              jobId: "2",
              jobTitle: "Backend Developer (Node / Prisma)",
              companyName: "CloudScale Inc.",
              location: "Remote",
              appliedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
              status: "SHORTLISTED",
            },
            {
              id: "app-3",
              jobId: "3",
              jobTitle: "Frontend UI/UX Engineer",
              companyName: "DesignCraft Studios",
              location: "Lalitpur, Nepal",
              appliedDate: new Date(Date.now() - 86400000 * 9).toISOString(),
              status: "REVIEWING",
            },
          ],
          upcomingInterviews: [
            {
              id: "int-1",
              applicationId: "app-1",
              jobTitle: "Senior Full Stack Engineer",
              companyName: "TechNova Solutions",
              interviewDate: "Nov 14, 2026",
              interviewTime: "11:00 AM (NST)",
              interviewType: "Online (Google Meet)",
              meetingLink: "https://meet.google.com/jps-technova",
              status: "Confirmed",
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
    <DashboardLayout allowedRole="JOB_SEEKER">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Candidate Dashboard"
          description="Overview of your job applications, interview schedules, and profile visibility."
        >
          <Button render={<Link href="/dashboard/job-seeker/jobs" />}>
            <Briefcase className="mr-2 size-4" />
            Explore New Jobs
          </Button>
        </PageHeader>

        {/* 4 Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Available Jobs"
            value={data?.stats.totalAvailableJobs ?? 0}
            description="Active opportunities matching your skills"
            icon={Briefcase}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColor="text-blue-600 dark:text-blue-400"
            trend={{ value: "+8 this week", isPositive: true }}
            loading={loading}
          />
          <StatCard
            title="Total Applied Jobs"
            value={data?.stats.totalAppliedJobs ?? 0}
            description="Applications submitted across companies"
            icon={FileCheck2}
            iconBg="bg-purple-50 dark:bg-purple-950/40"
            iconColor="text-purple-600 dark:text-purple-400"
            trend={{ value: "+2 this month", isPositive: true }}
            loading={loading}
          />
          <StatCard
            title="Profile Views"
            value={data?.stats.profileViews ?? 0}
            description="Employers who reviewed your profile"
            icon={Eye}
            iconBg="bg-amber-50 dark:bg-amber-950/40"
            iconColor="text-amber-600 dark:text-amber-400"
            trend={{ value: "+14%", isPositive: true }}
            loading={loading}
          />
          <StatCard
            title="Interviews Scheduled"
            value={data?.stats.interviewsScheduled ?? 0}
            description="Upcoming meetings and assessments"
            icon={Calendar}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
            trend={{ value: "Next in 2 days", isPositive: true }}
            loading={loading}
          />
        </div>

        {/* Application Activity Chart */}
        <ActivityChart
          title="Application Activity"
          description="Visual cadence of submitted applications over selected periods"
          weeklyData={data?.activity.weekly || []}
          monthlyData={data?.activity.monthly || []}
          yearlyData={data?.activity.yearly || []}
          color="#0f172a"
        />

        {/* Two Bottom Sections: Recent Applications & Upcoming Interviews */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Recent Applications
                </CardTitle>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Latest roles you applied for
                </p>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/job-seeker/applications" />}>
                View All
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(!data?.recentApplications || data.recentApplications.length === 0) ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  You haven&apos;t submitted any applications yet.
                </div>
              ) : (
                data.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-100 p-3.5 hover:bg-neutral-50 dark:border-neutral-800/80 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {app.jobTitle}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{app.companyName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {app.location}
                        </span>
                        <span>•</span>
                        <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={statusBadgeVariants[app.status] || "outline"}
                        className="text-[11px] capitalize font-medium"
                      >
                        {app.status.toLowerCase()}
                      </Badge>
                      <Button variant="ghost" size="xs" render={<Link href="/dashboard/job-seeker/applications" />}>
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Upcoming Interviews
                </CardTitle>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Scheduled calls and discussions
                </p>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/job-seeker/interviews" />}>
                View All
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {(!data?.upcomingInterviews || data.upcomingInterviews.length === 0) ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No upcoming interviews currently scheduled.
                </div>
              ) : (
                data.upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-100 p-3.5 bg-neutral-50/50 hover:bg-neutral-50 dark:border-neutral-800/80 dark:bg-neutral-800/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-[10px] bg-emerald-600">
                          {interview.status}
                        </Badge>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {interview.jobTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {interview.companyName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="size-3 text-neutral-400" />
                          {interview.interviewDate} at {interview.interviewTime}
                        </span>
                        <span className="flex items-center gap-1 text-neutral-500">
                          <Video className="size-3 text-blue-500" />
                          {interview.interviewType}
                        </span>
                      </div>
                    </div>

                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors"
                    >
                      Join Meeting
                      <ExternalLink className="ml-1.5 size-3" />
                    </a>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
