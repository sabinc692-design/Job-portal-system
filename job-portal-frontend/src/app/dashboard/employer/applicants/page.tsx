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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  Search,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";

interface ApplicantItem {
  id: string;
  jobId: string;
  applicantUserId: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company?: { name: string };
  };
  applicant: {
    id: string;
    email: string;
    jobSeekerProfile?: {
      firstName: string;
      lastName: string;
      headline?: string;
      phone?: string;
      location?: string;
      skills?: Array<{ skill: { name: string } }>;
      resumeUrl?: string | null;
    } | null;
  };
}

export default function EmployerApplicantsPage() {
  const [applicants, setApplicants] = useState<ApplicantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicantItem | null>(null);
  const [previewResume, setPreviewResume] = useState(false);
  // Edit status dialog
  const [editingApp, setEditingApp] = useState<ApplicantItem | null>(null);
  const [editStatus, setEditStatus] = useState("");
  // Delete confirmation dialog
  const [deletingApp, setDeletingApp] = useState<ApplicantItem | null>(null);
  // Action options popup modal
  const [actionPopupApp, setActionPopupApp] = useState<ApplicantItem | null>(null);

  useEffect(() => {
    async function loadApplicants() {
      try {
        const res = await apiGet<ApplicantItem[]>("/applications/employer");
        if (Array.isArray(res) && res.length > 0) {
          setApplicants(res);
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
      setApplicants([
        {
          id: "app-1",
          jobId: "1",
          applicantUserId: "u1",
          status: "INTERVIEW",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          coverLetter: "Extensive experience designing full-stack distributed web applications in Next.js and Prisma.",
          job: { id: "1", title: "Senior Full Stack Engineer" },
          applicant: {
            id: "u1",
            email: "sabinc692@gmail.com",
            jobSeekerProfile: {
              firstName: "Sabin",
              lastName: "Chaulagain",
              headline: "Senior Full-Stack Developer",
              phone: "+977 9814397731",
              location: "Kathmandu, Nepal",
              skills: [{ skill: { name: "TypeScript" } }, { skill: { name: "Next.js" } }, { skill: { name: "PostgreSQL" } }],
            },
          },
        },
        {
          id: "app-2",
          jobId: "2",
          applicantUserId: "u2",
          status: "SHORTLISTED",
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          coverLetter: "Certified Kubernetes administrator with background deploying AWS microservices.",
          job: { id: "2", title: "Cloud Infrastructure Specialist" },
          applicant: {
            id: "u2",
            email: "aarav@example.com",
            jobSeekerProfile: {
              firstName: "Aarav",
              lastName: "Sharma",
              headline: "DevOps & Cloud Engineer",
              phone: "+977 9841000000",
              location: "Remote / Nepal",
              skills: [{ skill: { name: "Docker" } }, { skill: { name: "Kubernetes" } }, { skill: { name: "AWS" } }],
            },
          },
        },
        {
          id: "app-3",
          jobId: "1",
          applicantUserId: "u3",
          status: "REVIEWING",
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          job: { id: "1", title: "Senior Full Stack Engineer" },
          applicant: {
            id: "u3",
            email: "pooja@example.com",
            jobSeekerProfile: {
              firstName: "Pooja",
              lastName: "Thapa",
              headline: "Frontend UI Developer",
              phone: "+977 9800000000",
              location: "Lalitpur, Nepal",
              skills: [{ skill: { name: "React" } }, { skill: { name: "Tailwind CSS" } }],
            },
          },
        },
      ]);
    }

    loadApplicants();
  }, []);

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await apiPatch(`/applications/${appId}/status`, { status: newStatus });
    } catch {
      // Optimistic
    }
    setApplicants((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
  };

  const handleEditSave = async () => {
    if (!editingApp || !editStatus) return;
    await updateStatus(editingApp.id, editStatus);
    setEditingApp(null);
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    try {
      await apiDelete(`/applications/${deletingApp.id}`);
    } catch {
      // Optimistic
    }
    setApplicants((prev) => prev.filter((a) => a.id !== deletingApp.id));
    setDeletingApp(null);
  };

  const filtered = applicants.filter((app) => {
    const name = app.applicant.jobSeekerProfile
      ? `${app.applicant.jobSeekerProfile.firstName} ${app.applicant.jobSeekerProfile.lastName}`
      : app.applicant.email;

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      app.job.title.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout allowedRole="EMPLOYER">
      <div className="space-y-6">
        <PageHeader
          title="Candidate Applications"
          description="Review candidate submissions, inspect resumes, and fast-track top talent."
        />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, role, or email..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 sm:w-56 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-xs focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview Scheduled</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/40">
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Position</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => {
                const name = app.applicant.jobSeekerProfile
                  ? `${app.applicant.jobSeekerProfile.firstName} ${app.applicant.jobSeekerProfile.lastName}`
                  : app.applicant.email;

                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {app.applicant.email} • {app.applicant.jobSeekerProfile?.location || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      {app.job.title}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          app.status === "HIRED"
                            ? "default"
                            : app.status === "SHORTLISTED"
                            ? "secondary"
                            : app.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                        }
                        className={app.status === "HIRED" ? "bg-emerald-600" : ""}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => { setSelectedCandidate(app); setPreviewResume(false); }}
                        >
                          <Eye className="size-3.5 mr-1" />
                          Review
                        </Button>

                        <button
                          type="button"
                          onClick={() => setActionPopupApp(app)}
                          title="Candidate Actions"
                          className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Candidate Detail Modal */}
        <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
          {selectedCandidate && (
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedCandidate.applicant.jobSeekerProfile
                    ? `${selectedCandidate.applicant.jobSeekerProfile.firstName} ${selectedCandidate.applicant.jobSeekerProfile.lastName}`
                    : selectedCandidate.applicant.email}
                </DialogTitle>
                <DialogDescription>
                  Applied for {selectedCandidate.job.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                  <div>
                    <span className="text-neutral-400">Email</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedCandidate.applicant.email}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Phone</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedCandidate.applicant.jobSeekerProfile?.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {selectedCandidate.coverLetter && (
                  <div className="space-y-1">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Cover Note
                    </span>
                    <p className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 leading-relaxed dark:border-neutral-800 dark:bg-neutral-800/30">
                      {selectedCandidate.coverLetter}
                    </p>
                  </div>
                )}

                {selectedCandidate.applicant.jobSeekerProfile?.skills && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Candidate Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.applicant.jobSeekerProfile.skills.map((s, idx) => (
                        <Badge key={idx} variant="secondary">
                          {s.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(() => {
                  // Prefer the seeker’s saved CV so legacy applications with demo URLs show the real file.
                  const resumeUrl = selectedCandidate.applicant.jobSeekerProfile?.resumeUrl || selectedCandidate.resumeUrl;
                  if (!resumeUrl) return <p className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-500 dark:bg-neutral-800">No CV uploaded.</p>;
                  const isPdf = resumeUrl.toLowerCase().split("?")[0].endsWith(".pdf");
                  return <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setPreviewResume((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"><Eye className="size-4" />{previewResume ? "Hide preview" : "Preview"}</button>
                      <a href={resumeUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"><FileText className="size-4" />Download</a>
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"><ExternalLink className="size-4" />Open in new tab</a>
                    </div>
                    {previewResume && (isPdf ? <iframe title="Candidate resume preview" src={resumeUrl} className="h-[65vh] w-full rounded-xl border dark:border-neutral-800" /> : <p className="text-xs text-neutral-500">Inline preview is available for PDF files. Open or download this document to view it.</p>)}
                  </div>;
                })()}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    updateStatus(selectedCandidate.id, "SHORTLISTED");
                    setSelectedCandidate(null);
                  }}
                >
                  Shortlist Candidate
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Candidate Actions Pop-up Modal */}
        <Dialog open={!!actionPopupApp} onOpenChange={(open) => !open && setActionPopupApp(null)}>
          {actionPopupApp && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Candidate Options &amp; Pipeline</DialogTitle>
                <DialogDescription>
                  {actionPopupApp.applicant.jobSeekerProfile
                    ? `${actionPopupApp.applicant.jobSeekerProfile.firstName} ${actionPopupApp.applicant.jobSeekerProfile.lastName}`
                    : actionPopupApp.applicant.email}{" "}
                  • Applied for {actionPopupApp.job.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <button
                  type="button"
                  onClick={() => {
                    updateStatus(actionPopupApp.id, "INTERVIEW");
                    setActionPopupApp(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Schedule Interview
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Advance candidate to the interview loop
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateStatus(actionPopupApp.id, "HIRED");
                    setActionPopupApp(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Hire Candidate
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Extend offer and finalize placement
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateStatus(actionPopupApp.id, "SHORTLISTED");
                    setActionPopupApp(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Shortlist Candidate
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Flag profile as a promising fit
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = actionPopupApp;
                    setActionPopupApp(null);
                    setEditingApp(target);
                    setEditStatus(target.status);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <Edit className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Edit Status Directly
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Choose any pipeline status manually
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = actionPopupApp;
                    setActionPopupApp(null);
                    setSelectedCandidate(target);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    <Eye className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Review Application &amp; CV
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Open full candidate dossier, resume, and details
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateStatus(actionPopupApp.id, "REJECTED");
                    setActionPopupApp(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    <XCircle className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Reject Candidate
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Mark application as rejected
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = actionPopupApp;
                    setActionPopupApp(null);
                    setDeletingApp(target);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    <Trash2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Delete Application
                    </p>
                    <p className="text-[11px] text-red-500/80">
                      Permanently remove this submission from the system
                    </p>
                  </div>
                </button>
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setActionPopupApp(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Edit Application Status Dialog */}
        <Dialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
          {editingApp && (
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Edit Application</DialogTitle>
                <DialogDescription>
                  Update the status for{" "}
                  <strong>
                    {editingApp.applicant.jobSeekerProfile
                      ? `${editingApp.applicant.jobSeekerProfile.firstName} ${editingApp.applicant.jobSeekerProfile.lastName}`
                      : editingApp.applicant.email}
                  </strong>
                </DialogDescription>
              </DialogHeader>
              <div className="py-3">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                  Application Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-xs focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="REVIEWING">Reviewing</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview Scheduled</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setEditingApp(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEditSave}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingApp} onOpenChange={(open) => !open && setDeletingApp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="size-5" />
                <DialogTitle className="text-rose-600">Delete Application</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Are you sure you want to permanently remove the application from{" "}
                <strong>
                  {deletingApp?.applicant.jobSeekerProfile
                    ? `${deletingApp.applicant.jobSeekerProfile.firstName} ${deletingApp.applicant.jobSeekerProfile.lastName}`
                    : deletingApp?.applicant.email}
                </strong>{" "}
                for <strong>{deletingApp?.job.title}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeletingApp(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                Delete Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
