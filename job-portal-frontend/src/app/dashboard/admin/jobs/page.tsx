"use client";

import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Edit,
  Power,
  AlertCircle,
} from "lucide-react";
import { apiGet, apiPatch, apiPut, apiDelete } from "@/lib/api";

interface AdminJob {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  status: string;
  createdAt: string;
  company: {
    name: string;
  };
  _count?: { applications: number };
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  
  // Action pop-up state
  const [actionJob, setActionJob] = useState<AdminJob | null>(null);
  
  // Edit job state
  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    employmentType: "FULL_TIME",
    status: "PUBLISHED",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete job state
  const [deletingJob, setDeletingJob] = useState<AdminJob | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiGet<{ jobs: AdminJob[] }>("/jobs?status=PUBLISHED");
        if (res.jobs && res.jobs.length > 0) {
          setJobs(res.jobs);
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
          description: "Full stack engineering vacancy leading Next.js and Prisma cloud architecture.",
          location: "Kathmandu, Nepal (Hybrid)",
          employmentType: "FULL_TIME",
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
          company: { name: "TechNova Solutions" },
          _count: { applications: 12 },
        },
        {
          id: "job-2",
          title: "Cloud Infrastructure Specialist",
          description: "Responsible for cluster monitoring, Docker containerization, and AWS services.",
          location: "Remote",
          employmentType: "FULL_TIME",
          status: "PUBLISHED",
          createdAt: new Date().toISOString(),
          company: { name: "CloudScale Inc." },
          _count: { applications: 9 },
        },
      ]);
    }

    loadJobs();
  }, []);

  const handleModerate = async (jobId: string, newStatus: string) => {
    try {
      await apiPatch(`/jobs/${jobId}/status`, { status: newStatus });
    } catch {
      // Optimistic
    }
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  const handleRemove = async (jobId: string) => {
    try {
      await apiDelete(`/jobs/${jobId}`);
    } catch {
      // Optimistic
    }
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const openEdit = (job: AdminJob) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      employmentType: job.employmentType || "FULL_TIME",
      status: job.status || "PUBLISHED",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setSubmittingEdit(true);
    try {
      await apiPut(`/jobs/${editingJob.id}`, editForm);
      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? { ...j, ...editForm } : j))
      );
      setEditingJob(null);
    } catch (err: any) {
      alert(err.message || "Failed to update job.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingJob) return;
    await handleRemove(deletingJob.id);
    setDeletingJob(null);
  };

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.name.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout allowedRole="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Job Moderation Center"
          description="Review published job posts, audit compliance, edit content, or purge violations."
        />

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, organization, or location..."
            className="pl-9 h-10 rounded-xl bg-white dark:bg-neutral-900"
          />
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/40">
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {job.title}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-600 dark:text-neutral-300">
                    {job.company.name}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">
                    {job.location}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {job._count?.applications ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={job.status === "PUBLISHED" ? "default" : "destructive"}
                      className={job.status === "PUBLISHED" ? "bg-emerald-600 text-[10px]" : "text-[10px]"}
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="size-3.5 mr-1" />
                        Inspect
                      </Button>

                      <button
                        type="button"
                        onClick={() => setActionJob(job)}
                        title="Job actions"
                        className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Action Pop-up Modal */}
        <Dialog open={!!actionJob} onOpenChange={(open) => !open && setActionJob(null)}>
          {actionJob && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Job Actions</DialogTitle>
                <DialogDescription>
                  {actionJob.title} • {actionJob.company.name} ({actionJob.location})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2.5 py-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = actionJob;
                    setActionJob(null);
                    openEdit(target);
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
                      Update title, description, location, or type
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = actionJob;
                    setActionJob(null);
                    setDeletingJob(target);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    <Trash2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Delete Job Posting
                    </p>
                    <p className="text-[11px] text-red-500/80">
                      Permanently remove job and all applicant submissions
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newStatus = actionJob.status === "PUBLISHED" ? "REMOVED" : "PUBLISHED";
                    handleModerate(actionJob.id, newStatus);
                    setActionJob(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {actionJob.status === "PUBLISHED" ? "Flag & Take Down" : "Restore Job Listing"}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Toggle moderation status on the platform
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = actionJob;
                    setActionJob(null);
                    setSelectedJob(target);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    <Eye className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Inspect Details
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      View full vacancy description and metadata
                    </p>
                  </div>
                </button>
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setActionJob(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Edit Job Modal */}
        <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
          {editingJob && (
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Job Posting</DialogTitle>
                <DialogDescription>
                  Modify the details for {editingJob.company.name}&apos;s posting.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 py-2 text-xs">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Job Title
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Location
                    </label>
                    <Input
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Employment Type
                    </label>
                    <select
                      value={editForm.employmentType}
                      onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                      className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REMOVED">Removed (Flagged)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Job Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditingJob(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" disabled={submittingEdit}>
                    {submittingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          )}
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deletingJob} onOpenChange={(open) => !open && setDeletingJob(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="size-5" />
                <DialogTitle className="text-rose-600">Delete Job Posting</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Are you sure you want to permanently delete{" "}
                <strong>{deletingJob?.title}</strong> ({deletingJob?.company.name})? All linked applications and telemetry will be removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeletingJob(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={confirmDelete}>
                Delete Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inspect Modal */}
        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          {selectedJob && (
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
                <DialogDescription>
                  {selectedJob.company.name} • {selectedJob.location}
                </DialogDescription>
              </DialogHeader>

              <div className="py-2 text-xs space-y-3">
                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
