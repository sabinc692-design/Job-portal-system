"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Eye,
  Power,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";

interface EmployerJob {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  status: string;
  createdAt: string;
  skills: Array<{ skill: { name: string } }>;
  _count?: { applications: number };
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<EmployerJob | null>(null);
  const [optionsJob, setOptionsJob] = useState<EmployerJob | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Kathmandu, Nepal",
    employmentType: "FULL_TIME",
    workplaceType: "HYBRID",
    experienceLevel: "MID_LEVEL",
    salaryMin: "90000",
    salaryMax: "120000",
    skills: "Next.js, TypeScript, PostgreSQL",
    applicationDeadline: "2026-12-31",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiGet<EmployerJob[]>("/jobs/employer/mine");
        if (Array.isArray(res)) {
          setJobs(res);
        } else {
          loadFallback();
        }
      } catch {
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      setJobs([
        {
          id: "job-1",
          title: "Senior Full Stack Engineer",
          description: "Build scalable Next.js and Prisma web platforms.",
          location: "Kathmandu, Nepal (Hybrid)",
          employmentType: "FULL_TIME",
          workplaceType: "HYBRID",
          experienceLevel: "SENIOR",
          salaryMin: 120000,
          salaryMax: 150000,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
          skills: [{ skill: { name: "Next.js" } }, { skill: { name: "TypeScript" } }],
          _count: { applications: 12 },
        },
        {
          id: "job-2",
          title: "Cloud Infrastructure Specialist",
          description: "Maintain cloud architecture and Docker/Kubernetes workflows.",
          location: "Remote",
          employmentType: "FULL_TIME",
          workplaceType: "REMOTE",
          experienceLevel: "LEAD",
          salaryMin: 130000,
          salaryMax: 165000,
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
          skills: [{ skill: { name: "AWS" } }, { skill: { name: "Docker" } }],
          _count: { applications: 9 },
        },
      ]);
    }

    loadJobs();
  }, []);

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      employmentType: form.employmentType,
      workplaceType: form.workplaceType,
      experienceLevel: form.experienceLevel,
      salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : undefined,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      applicationDeadline: form.applicationDeadline || undefined,
    };

    try {
      if (editingJob) {
        const updated = await apiPut<EmployerJob>(`/jobs/${editingJob.id}`, payload);
        setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...updated } : j)));
        setEditingJob(null);
      } else {
        const created = await apiPost<EmployerJob>("/jobs", payload);
        setJobs((prev) => [created, ...prev]);
        setShowCreateModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save job opening.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (job: EmployerJob) => {
    const newStatus = job.status === "PUBLISHED" ? "CLOSED" : "PUBLISHED";
    try {
      await apiPatch(`/jobs/${job.id}/status`, { status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingJob) return;
    try {
      await apiDelete(`/jobs/${deletingJob.id}`);
      setJobs((prev) => prev.filter((j) => j.id !== deletingJob.id));
      setDeletingJob(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete job.");
    }
  };

  const openEdit = (job: EmployerJob) => {
    setEditingJob(job);
    setErrorMsg(null);
    setForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "Kathmandu, Nepal",
      employmentType: job.employmentType || "FULL_TIME",
      workplaceType: job.workplaceType || "HYBRID",
      experienceLevel: job.experienceLevel || "MID_LEVEL",
      salaryMin: job.salaryMin !== undefined && job.salaryMin !== null ? String(job.salaryMin) : "90000",
      salaryMax: job.salaryMax !== undefined && job.salaryMax !== null ? String(job.salaryMax) : "130000",
      skills: Array.isArray(job.skills) ? job.skills.map((s) => s.skill.name).join(", ") : "",
      applicationDeadline: "2026-12-31",
    });
  };

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout allowedRole="EMPLOYER">
      <div className="space-y-6">
        <PageHeader
          title="Job Listings Management"
          description="Create, monitor, and regulate active vacancies and incoming candidates."
        >
          <Button
            onClick={() => {
              setEditingJob(null);
              setForm({
                title: "",
                description: "",
                location: "Kathmandu, Nepal (Hybrid)",
                employmentType: "FULL_TIME",
                workplaceType: "HYBRID",
                experienceLevel: "MID_LEVEL",
                salaryMin: "90000",
                salaryMax: "125000",
                skills: "TypeScript, Next.js, Node.js",
                applicationDeadline: "2026-12-31",
              });
              setShowCreateModal(true);
            }}
            size="sm"
          >
            <Plus className="mr-2 size-4" />
            Post New Job
          </Button>
        </PageHeader>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posted jobs..."
            className="pl-9 h-10 rounded-xl bg-white dark:bg-neutral-900"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/40">
                <TableHead>Job Title</TableHead>
                <TableHead>Location &amp; Type</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-sm text-neutral-500">
                    {loading
                      ? "Loading jobs..."
                      : search
                      ? "No job postings matched your search."
                      : "No job postings yet. Click \"Post New Job\" above to publish your first vacancy."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-semibold text-neutral-900 dark:text-neutral-100">
                    <div>
                      <span>{job.title}</span>
                      <div className="flex gap-1 mt-1">
                        {job.skills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md dark:bg-neutral-800 dark:text-neutral-400">
                            {s.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">
                    <p>{job.location}</p>
                    <span className="capitalize text-[11px] font-medium text-neutral-400">
                      {job.employmentType.replace("_", " ").toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href="/dashboard/employer/applicants"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      <Users className="size-3.5" />
                      {job._count?.applications ?? 0} Candidates
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={job.status === "PUBLISHED" ? "default" : "outline"}
                      className={job.status === "PUBLISHED" ? "bg-emerald-600" : ""}
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setOptionsJob(job)}
                      title="Job options"
                      className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>

        {/* Create / Edit Job Modal */}
        <Dialog
          open={showCreateModal || !!editingJob}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateModal(false);
              setEditingJob(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingJob ? "Edit Job Posting" : "Create New Job Opening"}</DialogTitle>
              <DialogDescription>
                Provide essential vacancy details to publish to thousands of candidates.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveJob} className="space-y-4 py-2 text-xs">
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Job Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail roles, responsibilities, team structure, and qualifications..."
                  rows={4}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Location
                  </label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Employment Type
                  </label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Workplace Type
                  </label>
                  <select
                    value={form.workplaceType}
                    onChange={(e) => setForm({ ...form, workplaceType: e.target.value })}
                    className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="ONSITE">On-site</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Salary Min ($/yr)
                  </label>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Salary Max ($/yr)
                  </label>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Required Skills (comma separated)
                </label>
                <Input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="e.g. Next.js, Node.js, PostgreSQL"
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJob(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Saving..." : editingJob ? "Update Job" : "Publish Job"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Job Actions Pop-up Modal */}
        <Dialog open={!!optionsJob} onOpenChange={(open) => !open && setOptionsJob(null)}>
          {optionsJob && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Job Options &amp; Actions</DialogTitle>
                <DialogDescription>
                  {optionsJob.title} • {optionsJob.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2.5 py-2">
                <button
                  type="button"
                  onClick={() => {
                    const j = optionsJob;
                    setOptionsJob(null);
                    openEdit(j);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Edit className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Edit Job Details
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Update title, description, skills, salary, or workplace settings
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const j = optionsJob;
                    setOptionsJob(null);
                    setDeletingJob(j);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    <Trash2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Delete Job Opening
                    </p>
                    <p className="text-[11px] text-red-500/80">
                      Permanently remove this job posting and related applications
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleStatus(optionsJob);
                    setOptionsJob(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <Power className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {optionsJob.status === "PUBLISHED" ? "Deactivate Job" : "Activate Job"}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {optionsJob.status === "PUBLISHED" ? "Hide from candidate searches" : "Publish to candidate searches"}
                    </p>
                  </div>
                </button>

                <Link
                  href="/dashboard/employer/applicants"
                  onClick={() => setOptionsJob(null)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      View Candidate Applicants ({optionsJob._count?.applications ?? 0})
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Inspect applicants who applied to this role
                    </p>
                  </div>
                </Link>
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setOptionsJob(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deletingJob} onOpenChange={(open) => !open && setDeletingJob(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="size-5" />
                <DialogTitle className="text-rose-600">Delete Job Posting</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Are you sure you want to permanently delete{" "}
                <strong>{deletingJob?.title}</strong>? All linked applications and progress will be removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeletingJob(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                Delete Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
