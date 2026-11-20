"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Building2,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

export default function JobSeekerInterviewsPage() {
  const [upcomingInterviews] = useState([
    {
      id: "int-1",
      jobTitle: "Senior Full Stack Engineer",
      companyName: "TechNova Solutions",
      date: "Nov 14, 2026",
      time: "11:00 AM – 12:00 PM (NST)",
      format: "Online (Google Meet)",
      meetingLink: "https://meet.google.com/jps-technova",
      interviewer: "Hiring Manager & Lead Architect",
      stage: "Technical Deep Dive",
      status: "Confirmed",
    },
    {
      id: "int-2",
      jobTitle: "Backend Cloud Architect",
      companyName: "CloudScale Inc.",
      date: "Nov 18, 2026",
      time: "2:30 PM – 3:15 PM (NST)",
      format: "Online (Zoom)",
      meetingLink: "https://zoom.us/j/jps-cloudscale",
      interviewer: "VP of Engineering",
      stage: "System Design Evaluation",
      status: "Scheduled",
    },
  ]);

  const [previousInterviews] = useState([
    {
      id: "int-past-1",
      jobTitle: "UI/UX Product Designer",
      companyName: "DesignCraft Studios",
      date: "Oct 28, 2026",
      time: "10:00 AM (NST)",
      format: "On-site (Lalitpur Office)",
      interviewer: "Design Director",
      stage: "Portfolio Review",
      outcome: "Passed to Next Round",
      status: "Completed",
    },
    {
      id: "int-past-2",
      jobTitle: "DevOps & Cloud Engineer",
      companyName: "InfraCore Labs",
      date: "Oct 15, 2026",
      time: "3:00 PM (NST)",
      format: "Online (Google Meet)",
      interviewer: "DevOps Lead",
      stage: "Initial Screening",
      outcome: "Position On Hold",
      status: "Completed",
    },
  ]);

  return (
    <DashboardLayout allowedRole="JOB_SEEKER">
      <div className="space-y-6">
        <PageHeader
          title="Interview Schedules"
          description="Access meeting invitations, videoconference links, and historical interview notes."
        />

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="previous" className="text-xs">
              Previous ({previousInterviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.map((item) => (
              <Card
                key={item.id}
                className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-emerald-600 text-[10px]">
                          {item.status}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.stage}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {item.jobTitle}
                      </h3>

                      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-neutral-400" />
                        {item.companyName} • With {item.interviewer}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-300 pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="size-3.5 text-neutral-400" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="size-3.5 text-neutral-400" />
                          {item.time}
                        </span>
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                          <Video className="size-3.5" />
                          {item.format}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors shadow-sm"
                      >
                        Join Video Meeting
                        <ExternalLink className="ml-2 size-3.5" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="previous" className="space-y-4">
            {previousInterviews.map((item) => (
              <Card
                key={item.id}
                className="rounded-2xl border-neutral-200/80 bg-white/70 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/60"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {item.status}
                        </Badge>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          Outcome: {item.outcome}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.jobTitle} • {item.companyName}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {item.stage} on {item.date} at {item.time} ({item.format})
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs">
                      Archived
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
