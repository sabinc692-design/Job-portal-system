"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Users,
  ExternalLink,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface InterviewSchedule {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  time: string;
  format: string;
  meetingLink: string;
  interviewer: string;
  status: string;
}

export default function EmployerInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([
    {
      id: "int-101",
      candidateName: "Sabin Chaulagain",
      candidateEmail: "sabinc692@gmail.com",
      jobTitle: "Senior Full Stack Engineer",
      date: "2026-11-14",
      time: "11:00 AM (NST)",
      format: "Online (Google Meet)",
      meetingLink: "https://meet.google.com/jps-technova",
      interviewer: "Hiring Manager & Lead Architect",
      status: "Confirmed",
    },
    {
      id: "int-102",
      candidateName: "Aarav Sharma",
      candidateEmail: "aarav@example.com",
      jobTitle: "Cloud Infrastructure Specialist",
      date: "2026-11-18",
      time: "2:30 PM (NST)",
      format: "Online (Zoom)",
      meetingLink: "https://zoom.us/j/jps-cloudscale",
      interviewer: "VP of Engineering",
      status: "Scheduled",
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [form, setForm] = useState({
    candidateName: "Sabin Chaulagain",
    candidateEmail: "sabinc692@gmail.com",
    jobTitle: "Senior Full Stack Engineer",
    date: "2026-11-20",
    time: "10:30 AM",
    format: "Online (Google Meet)",
    meetingLink: "https://meet.google.com/jps-call",
    interviewer: "Engineering Team",
  });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newInterview: InterviewSchedule = {
      id: `int-${Date.now()}`,
      ...form,
      status: "Scheduled",
    };
    setInterviews([newInterview, ...interviews]);
    setShowScheduleModal(false);
  };

  const cancelInterview = (id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <DashboardLayout allowedRole="EMPLOYER">
      <div className="space-y-6">
        <PageHeader
          title="Interview Coordination"
          description="Schedule candidate screening sessions, link virtual rooms, and track interview loops."
        >
          <Button onClick={() => setShowScheduleModal(true)} size="sm">
            <Plus className="mr-2 size-4" />
            Schedule Interview
          </Button>
        </PageHeader>

        <div className="grid gap-4">
          {interviews.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-emerald-600 text-[10px]">
                        {item.status}
                      </Badge>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        {item.candidateName}
                      </h3>
                      <span className="text-xs text-neutral-400">({item.candidateEmail})</span>
                    </div>

                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Position: {item.jobTitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                        <Calendar className="size-3.5 text-neutral-400" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                        <Clock className="size-3.5 text-neutral-400" />
                        {item.time}
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                        <Video className="size-3.5" />
                        {item.format}
                      </span>
                      <span>Panel: {item.interviewer}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                    >
                      Enter Meeting Room
                      <ExternalLink className="ml-1.5 size-3" />
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => cancelInterview(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Schedule Modal */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Candidate Interview</DialogTitle>
              <DialogDescription>
                Set meeting times and invite candidates to interview rounds.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSchedule} className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Candidate Name *
                </label>
                <Input
                  value={form.candidateName}
                  onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Candidate Email *
                </label>
                <Input
                  type="email"
                  value={form.candidateEmail}
                  onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Job Position *
                </label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Time *
                  </label>
                  <Input
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="e.g. 11:00 AM"
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Interview Type
                </label>
                <select
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option value="Online (Google Meet)">Online (Google Meet)</option>
                  <option value="Online (Zoom)">Online (Zoom)</option>
                  <option value="Onsite (Company Office)">Onsite (Company Office)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Meeting URL / Room Link
                </label>
                <Input
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Schedule Call
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
