"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

interface JobItem {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    location?: string;
  };
  skills: Array<{ skill: { name: string } }>;
  createdAt: string;
}

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Details Modal
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  // Apply Modal
  const [applyingJob, setApplyingJob] = useState<JobItem | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!applyingJob) return;
    let active = true;
    setResumeLoading(true);
    apiGet<{ resumeUrl?: string | null }>("/profile/job-seeker")
      .then((profile) => { if (active) setResumeUrl(profile.resumeUrl || ""); })
      .catch((error) => { if (active) { setResumeUrl(""); setApplyError(error instanceof Error ? error.message : "Could not load your CV."); } })
      .finally(() => { if (active) setResumeLoading(false); });
    return () => { active = false; };
  }, [applyingJob]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await apiGet<{ jobs: JobItem[] }>("/jobs");
        if (res.jobs && res.jobs.length > 0) {
          setJobs(res.jobs);
        } else {
          loadFallbackJobs();
        }
      } catch {
        loadFallbackJobs();
      } finally {
        setLoading(false);
      }
    }

    function loadFallbackJobs() {
      setJobs([
        {
          id: "job-1",
          title: "Senior Full Stack Engineer",
          description: "We are seeking an experienced Full Stack Engineer to lead our frontend and backend service architecture with Next.js, Node.js, and PostgreSQL. You will craft scalable microservices and intuitive user interfaces.",
          location: "Kathmandu, Nepal (Hybrid)",
          employmentType: "FULL_TIME",
          workplaceType: "HYBRID",
          experienceLevel: "SENIOR",
          salaryMin: 120000,
          salaryMax: 150000,
          currency: "USD",
          company: { id: "c1", name: "TechNova Solutions", location: "Kathmandu, Nepal" },
          skills: [{ skill: { name: "Next.js" } }, { skill: { name: "TypeScript" } }, { skill: { name: "PostgreSQL" } }, { skill: { name: "Node.js" } }],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "job-2",
          title: "Backend Cloud Architect",
          description: "Design high throughput backend systems using Express, Prisma, and Supabase. Maintain zero-downtime database migrations, caching layers, and role authorization pipelines.",
          location: "Remote",
          employmentType: "FULL_TIME",
          workplaceType: "REMOTE",
          experienceLevel: "LEAD",
          salaryMin: 130000,
          salaryMax: 165000,
          currency: "USD",
          company: { id: "c2", name: "CloudScale Inc.", location: "Global / Remote" },
          skills: [{ skill: { name: "Node.js" } }, { skill: { name: "Prisma" } }, { skill: { name: "PostgreSQL" } }, { skill: { name: "Redis" } }],
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: "job-3",
          title: "UI/UX Product Designer & Developer",
          description: "Bridge the gap between design and engineering. Work with Tailwind CSS, shadcn/ui, and Figma to build accessible, fluid experiences for thousands of active job seekers.",
          location: "Lalitpur, Nepal",
          employmentType: "CONTRACT",
          workplaceType: "ONSITE",
          experienceLevel: "MID_LEVEL",
          salaryMin: 80000,
          salaryMax: 105000,
          currency: "USD",
          company: { id: "c3", name: "DesignCraft Studios", location: "Lalitpur, Nepal" },
          skills: [{ skill: { name: "Tailwind CSS" } }, { skill: { name: "React" } }, { skill: { name: "Figma" } }, { skill: { name: "UI/UX" } }],
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: "job-4",
          title: "DevOps & Infrastructure Engineer",
          description: "Manage CI/CD deployments, container orchestration with Docker and Kubernetes, and monitor distributed infrastructure with telemetry and Prometheus.",
          location: "Pokhara, Nepal",
          employmentType: "FULL_TIME",
          workplaceType: "HYBRID",
          experienceLevel: "SENIOR",
          salaryMin: 110000,
          salaryMax: 140000,
          currency: "USD",
          company: { id: "c4", name: "InfraCore Labs", location: "Pokhara, Nepal" },
          skills: [{ skill: { name: "Docker" } }, { skill: { name: "Kubernetes" } }, { skill: { name: "AWS" } }, { skill: { name: "CI/CD" } }],
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
      ]);
    }

    fetchJobs();
  }, []);

  const toggleSave = (id: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = async () => {
    if (!applyingJob) return;
    setApplying(true);
    setApplyError(null);
    try {
      await apiPost("/applications", {
        jobId: applyingJob.id,
        coverLetter,
        resumeUrl,
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.name.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());

    const matchesLocation =
      locationFilter === "ALL" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesType =
      typeFilter === "ALL" || job.employmentType === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <DashboardLayout allowedRole="JOB_SEEKER">
      <div className="space-y-6">
        <PageHeader
          title="Browse Available Opportunities"
          description="Discover matched tech and business positions tailored to your profile."
        >
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <Sparkles className="size-4 text-amber-500" />
            <span>{filteredJobs.length} matching jobs active</span>
          </div>
        </PageHeader>

        {/* Search & Filter Bar */}
        <div className="grid gap-3 sm:grid-cols-12 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative sm:col-span-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, tech stack, or company..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full h-10 appearance-none rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-xs focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <option value="ALL">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Kathmandu">Kathmandu, Nepal</option>
              <option value="Lalitpur">Lalitpur, Nepal</option>
              <option value="Pokhara">Pokhara, Nepal</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 appearance-none rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 shadow-xs focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <option value="ALL">All Employment Types</option>
              <option value="FULL_TIME">Full-Time</option>
              <option value="PART_TIME">Part-Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            Loading opportunities...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              No matching jobs found
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Try adjusting your search criteria or resetting filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setLocationFilter("ALL");
                setTypeFilter("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);

              return (
                <Card
                  key={job.id}
                  className="group flex flex-col justify-between rounded-2xl border-neutral-200/80 bg-white shadow-xs transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                          {job.company.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="size-3" />
                            {job.company.name}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSave(job.id)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isSaved
                            ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                            : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                        title={isSaved ? "Saved" : "Save job"}
                      >
                        <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                      <span className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
                        <MapPin className="size-3 text-neutral-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
                        <Briefcase className="size-3 text-neutral-400" />
                        {job.employmentType.replace("_", " ")}
                      </span>
                      {job.salaryMin && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                          ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax! / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.map((s, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-[10px] font-normal"
                        >
                          {s.skill.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setSelectedJob(job)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                        onClick={() => {
                          setApplyingJob(job);
                          setApplySuccess(false);
                          setCoverLetter("");
                        }}
                      >
                        Quick Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* View Details Modal */}
        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          {selectedJob && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-lg dark:bg-white dark:text-neutral-900">
                    {selectedJob.company.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      {selectedJob.company.name} • {selectedJob.location}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-3 text-sm">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{selectedJob.employmentType.replace("_", " ")}</Badge>
                  <Badge variant="outline">{selectedJob.workplaceType}</Badge>
                  <Badge variant="secondary">{selectedJob.experienceLevel}</Badge>
                  {selectedJob.salaryMin && (
                    <Badge variant="default" className="bg-emerald-600">
                      ${selectedJob.salaryMin.toLocaleString()} – ${selectedJob.salaryMax?.toLocaleString()} / yr
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                    Job Description
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((s, idx) => (
                      <Badge key={idx} variant="secondary">
                        {s.skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const j = selectedJob;
                    setSelectedJob(null);
                    setApplyingJob(j);
                    setApplySuccess(false);
                    setApplyError(null);
                    setCoverLetter("");
                  }}
                >
                  Apply Now
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>

        {/* Apply Modal */}
        <Dialog open={!!applyingJob} onOpenChange={(open) => !open && setApplyingJob(null)}>
          {applyingJob && (
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Apply for {applyingJob.title}</DialogTitle>
                <DialogDescription>
                  Submit your application to {applyingJob.company.name}.
                </DialogDescription>
              </DialogHeader>

              {applySuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Application Submitted!
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Your profile and attached resume have been sent to the hiring team. You can monitor progress under My Applications.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setApplyingJob(null);
                      setApplySuccess(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Resume on file
                    </label>
                    {resumeLoading ? (
                      <p className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800">Loading your saved CV…</p>
                    ) : resumeUrl ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 text-xs bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40">
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-blue-700 hover:underline dark:text-blue-300">
                          {decodeURIComponent(resumeUrl.split("/").pop()?.split("?")[0] || "Uploaded CV")}
                        </a>
                        <span className="shrink-0 text-emerald-600 font-semibold text-[11px]">Ready</span>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                        Upload a CV in <a className="font-semibold underline" href="/dashboard/job-seeker/resume">Resume Management</a> before applying.
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Cover Note (Optional)
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly state why you're a great fit for this position..."
                      rows={4}
                      className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  {applyError && (
                    <p className="text-xs text-rose-600">{applyError}</p>
                  )}

                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setApplyingJob(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleApply} disabled={applying || resumeLoading || !resumeUrl}>
                      {applying ? "Submitting..." : "Send Application"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
