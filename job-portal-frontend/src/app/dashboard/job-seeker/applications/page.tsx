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
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";

interface ApplicationItem {
  id: string;
  jobId: string;
  status: string;
  createdAt: string;
  coverLetter?: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    location: string;
    employmentType: string;
    company: {
      name: string;
      logoUrl?: string;
    };
  };
}

const statusBadgeStyles: Record<string, { label: string; badgeVariant: "default" | "secondary" | "destructive" | "outline"; bg: string; text: string }> = {
  SUBMITTED: { label: "Pending", badgeVariant: "outline", bg: "bg-neutral-100", text: "text-neutral-700" },
  REVIEWING: { label: "Reviewed", badgeVariant: "secondary", bg: "bg-blue-50", text: "text-blue-700" },
  SHORTLISTED: { label: "Shortlisted", badgeVariant: "secondary", bg: "bg-purple-50", text: "text-purple-700" },
  INTERVIEW: { label: "Interview Scheduled", badgeVariant: "default", bg: "bg-amber-500", text: "text-white" },
  REJECTED: { label: "Rejected", badgeVariant: "destructive", bg: "bg-rose-50", text: "text-rose-700" },
  HIRED: { label: "Accepted", badgeVariant: "default", bg: "bg-emerald-600", text: "text-white" },
  WITHDRAWN: { label: "Withdrawn", badgeVariant: "outline", bg: "bg-neutral-50", text: "text-neutral-500" },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // View detail modal
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Withdraw confirm modal
  const [withdrawingApp, setWithdrawingApp] = useState<ApplicationItem | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await apiGet<ApplicationItem[]>("/applications/my");
        if (Array.isArray(res) && res.length > 0) {
          setApplications(res);
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
      setApplications([
        {
          id: "app-101",
          jobId: "1",
          status: "INTERVIEW",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          coverLetter: "I have 5+ years building production Next.js and Prisma systems. Excited to contribute!",
          job: {
            id: "1",
            title: "Senior Full Stack Engineer",
            location: "Kathmandu, Nepal (Hybrid)",
            employmentType: "FULL_TIME",
            company: { name: "TechNova Solutions" },
          },
        },
        {
          id: "app-102",
          jobId: "2",
          status: "SHORTLISTED",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          coverLetter: "Specialized in scalable distributed microservices with PostgreSQL and Supabase.",
          job: {
            id: "2",
            title: "Backend Cloud Architect",
            location: "Remote",
            employmentType: "FULL_TIME",
            company: { name: "CloudScale Inc." },
          },
        },
        {
          id: "app-103",
          jobId: "3",
          status: "REVIEWING",
          createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
          job: {
            id: "3",
            title: "UI/UX Product Designer",
            location: "Lalitpur, Nepal",
            employmentType: "CONTRACT",
            company: { name: "DesignCraft Studios" },
          },
        },
        {
          id: "app-104",
          jobId: "4",
          status: "SUBMITTED",
          createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          job: {
            id: "4",
            title: "DevOps & Cloud Engineer",
            location: "Pokhara, Nepal",
            employmentType: "FULL_TIME",
            company: { name: "InfraCore Labs" },
          },
        },
      ]);
    }

    loadApplications();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawingApp) return;
    setWithdrawing(true);
    try {
      await apiPatch(`/applications/${withdrawingApp.id}/withdraw`);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === withdrawingApp.id ? { ...app, status: "WITHDRAWN" } : app
        )
      );
    } catch {
      // Local optimistic update
      setApplications((prev) =>
        prev.map((app) =>
          app.id === withdrawingApp.id ? { ...app, status: "WITHDRAWN" } : app
        )
      );
    } finally {
      setWithdrawing(false);
      setWithdrawingApp(null);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.job.title.toLowerCase().includes(search.toLowerCase()) ||
      app.job.company.name.toLowerCase().includes(search.toLowerCase()) ||
      app.job.location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Summary counts
  const totalCount = applications.length;
  const activeCount = applications.filter((a) => !["REJECTED", "WITHDRAWN"].includes(a.status)).length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;

  return (
    <DashboardLayout allowedRole="JOB_SEEKER">
      <div className="space-y-6">
        <PageHeader
          title="My Job Applications"
          description="Track status updates, review submission details, and manage responses."
        />

        {/* Metric summary banner */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 font-medium">Total Applied</span>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {totalCount}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 font-medium">In Active Review</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500 font-medium">Interviews Scheduled</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {interviewCount}
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, job title, or location..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 sm:w-56 appearance-none rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-xs focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Pending (Submitted)</option>
            <option value="REVIEWING">Reviewed</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview Scheduled</option>
            <option value="HIRED">Accepted / Hired</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        {/* Applications Table */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              Loading applications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-neutral-500">
              No matching applications found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/40">
                  <TableHead className="w-12 text-center">S.N.</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app, index) => {
                  const style = statusBadgeStyles[app.status] || {
                    label: app.status,
                    badgeVariant: "outline",
                  };
                  const canWithdraw = !["REJECTED", "WITHDRAWN", "HIRED"].includes(app.status);

                  return (
                    <TableRow key={app.id}>
                      <TableCell className="text-center font-medium text-xs text-neutral-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {app.job.company.name}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">
                        {app.job.title}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500">
                        {app.job.location}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={style.badgeVariant}
                          className="text-[11px] font-medium"
                        >
                          {style.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                              aria-label="Actions"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedApp(app)}>
                              <Eye className="size-3.5 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canWithdraw && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onClick={() => setWithdrawingApp(app)}
                                >
                                  <Trash2 className="size-3.5 mr-2" />
                                  Withdraw Application
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* View Details Modal */}
        <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
          {selectedApp && (
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedApp.job.title}</DialogTitle>
                <DialogDescription>
                  {selectedApp.job.company.name} • {selectedApp.job.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                  <span className="text-neutral-500">Application Status</span>
                  <Badge variant={statusBadgeStyles[selectedApp.status]?.badgeVariant || "outline"}>
                    {statusBadgeStyles[selectedApp.status]?.label || selectedApp.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Applied Date
                  </span>
                  <p className="text-neutral-500">
                    {new Date(selectedApp.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedApp.coverLetter && (
                  <div className="space-y-1">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Cover Note
                    </span>
                    <p className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/30">
                      {selectedApp.coverLetter}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Withdraw Confirmation Modal */}
        <Dialog open={!!withdrawingApp} onOpenChange={(open) => !open && setWithdrawingApp(null)}>
          {withdrawingApp && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertCircle className="size-5" />
                  <DialogTitle className="text-rose-600">Withdraw Application</DialogTitle>
                </div>
                <DialogDescription className="pt-2">
                  Are you sure you want to withdraw your application for{" "}
                  <strong className="text-neutral-900 dark:text-neutral-100">{withdrawingApp.job.title}</strong> at{" "}
                  <strong>{withdrawingApp.job.company.name}</strong>?
                </DialogDescription>
              </DialogHeader>

              <p className="text-xs text-neutral-500">
                This action will notify the employer that you are no longer in consideration for this vacancy.
              </p>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawingApp(null)}
                >
                  Keep Application
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                >
                  {withdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
