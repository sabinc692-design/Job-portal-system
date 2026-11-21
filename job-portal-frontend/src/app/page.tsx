"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  FileCheck2,
  ChevronRight,
  Star,
  ExternalLink,
  Lock,
  ShieldAlert,
  LogIn,
  UserCheck,
  Loader2,
} from "lucide-react";
import {
  readAuthUser,
  clearAuthSession,
  getDashboardPath,
  type AuthRole,
} from "@/lib/auth";
import { apiRequest } from "@/lib/api";

interface PublicJob {
  id: string;
  title: string;
  location: string | null;
  employmentType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  company: { name: string };
  skills: Array<{ skill: { name: string } }>;
  createdAt: string;
}

const LOCATIONS = [
  "All Locations",
  "Remote",
  "Kathmandu, Nepal",
  "Lalitpur, Nepal",
  "Bhaktapur, Nepal",
  "Pokhara, Nepal",
  "Biratnagar, Nepal",
  "Itahari, Nepal",
  "Dharan, Nepal",
  "Morang, Nepal",
  "Jhapa, Nepal",
  "Birtamod, Nepal",
  "Damak, Nepal",
  "Inaruwa, Nepal",
  "Birgunj, Nepal",
  "Janakpur, Nepal",
  "Rajbiraj, Nepal",
  "Hetauda, Nepal",
  "Bharatpur, Nepal",
  "Butwal, Nepal",
  "Bhairahawa, Nepal",
  "Nepalgunj, Nepal",
  "Dhangadhi, Nepal",
  "Mahendranagar, Nepal",
  "Tulsipur, Nepal",
  "Ghorahi, Nepal",
  "Baglung, Nepal",
  "Lumbini, Nepal",
  "Banepa, Nepal",
  "Dhulikhel, Nepal",
  "Gorkha, Nepal",
  "Lahan, Nepal",
  "Ilam, Nepal",
  "Phidim, Nepal",
  "Myagdi, Nepal",
  "Surkhet, Nepal",
  "All Nepal",
];

// Auth-aware portal launch: redirect to login with role hint if not authenticated
function usePortalLaunch() {
  const router = useRouter();
  return (role: AuthRole, dashboardPath: string) => {
    if (typeof window === "undefined") return;
    const user = readAuthUser();
    const token = localStorage.getItem("accessToken");
    if (user && token) {
      // Already logged in — go to their actual dashboard (role guard handles wrong-role redirect)
      router.push(getDashboardPath(user.role));
    } else {
      router.push(`/login?role=${role}&redirect=${dashboardPath}`);
    }
  };
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const launchPortal = usePortalLaunch();
  const router = useRouter();

  // ── Real jobs from API ──────────────────────────────────────────────
  const [featuredJobs, setFeaturedJobs] = useState<PublicJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    async function loadPublicJobs() {
      try {
        const data = await apiRequest<{ jobs?: PublicJob[]; total?: number }>(
          "/jobs?limit=3&status=PUBLISHED",
          { method: "GET", requiresAuth: false }
        );
        if (data.jobs && data.jobs.length > 0) {
          setFeaturedJobs(data.jobs);
          setTotalJobs(data.total ?? data.jobs.length);
        }
      } catch {
        // silently fail — no jobs shown if API is down
      } finally {
        setJobsLoading(false);
      }
    }
    loadPublicJobs();
  }, []);

  // ── Auth-aware navigation for protected pages ───────────────────────
  function handleProtectedNav(path: string) {
    if (typeof window === "undefined") return;
    const user = readAuthUser();
    const token = localStorage.getItem("accessToken");
    if (user && token) {
      router.push(path);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }
  }

  // ── Salary formatter ───────────────────────────────────────────────
  function formatSalary(job: PublicJob) {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.currency ?? "USD";
    const fmt = (n: number) =>
      currency === "USD"
        ? `$${Math.round(n / 1000)}k`
        : `${currency} ${Math.round(n / 1000)}k`;
    if (job.salaryMin && job.salaryMax)
      return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
    if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
    return `Up to ${fmt(job.salaryMax!)}`;
  }

  function formatEmploymentType(type: string) {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col antialiased selection:bg-neutral-900 selection:text-white">
      {/* ───────────────── TOP NOTIFICATION BANNER ───────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-2 text-center text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
          <span>New in JPS 2.0: Unified Role-Based Portals for Candidates, Recruiters &amp; Admins</span>
          <Link href="/login" className="underline underline-offset-2 font-semibold hover:text-neutral-200 ml-1">
            Sign In &rarr;
          </Link>
        </div>
      </div>

      {/* ───────────────── NAVBAR ───────────────── */}
      <header className="border-b border-neutral-200/80 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-neutral-950 via-neutral-800 to-neutral-700 text-white flex items-center justify-center font-bold text-lg shadow-sm dark:from-white dark:to-neutral-300 dark:text-neutral-950">
              J
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-950 to-neutral-700 bg-clip-text text-transparent dark:from-white dark:to-neutral-300">
              JobPortal
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#jobs" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors">
              Browse Jobs
            </a>
            <a href="#roles" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors">
              Role Portals
            </a>
            <a href="#stats" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors">
              Platform Metrics
            </a>
            <a href="#about" className="text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={`${buttonVariants({ size: "sm" })} bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white dark:from-white dark:to-neutral-200 dark:text-neutral-950 font-semibold shadow-xs`}
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white dark:bg-neutral-900 px-4 py-4 space-y-3">
            <a href="#jobs" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Browse Jobs
            </a>
            <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Role Portals
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              About JPS
            </a>
            <div className="flex gap-2 pt-2 border-t">
              <Link href="/login" className={`${buttonVariants({ variant: "outline", size: "sm" })} flex-1`}>
                Sign In
              </Link>
              <Link href="/register" className={`${buttonVariants({ size: "sm" })} flex-1`}>
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ───────────────── HERO SECTION WITH GRADIENTS ───────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
        {/* Ambient Gradient Background Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 bg-gradient-to-tr from-blue-400/20 via-purple-300/20 to-pink-300/20 blur-3xl dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/10" />

        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold shadow-xs backdrop-blur-md mb-6 dark:border-neutral-800 dark:bg-neutral-900/80">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-neutral-700 dark:text-neutral-300">Nepal &amp; Global Tech Hiring Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.12]">
            Discover High-Impact Roles.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hire Exceptional Talent.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The next-generation hiring portal connecting software engineers, product designers, and engineering leaders with verified companies across Nepal and worldwide.
          </p>

          {/* Search Box */}
          <div className="mt-10 p-2 sm:p-2.5 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl shadow-neutral-950/5 border border-neutral-200/80 dark:border-neutral-800 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="pointer-events-none absolute left-3.5 size-4 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills (Next.js, Node), or company..."
                className="pl-10 h-11 border-0 shadow-none focus-visible:ring-0 text-sm"
              />
            </div>

            <div className="hidden sm:block w-px bg-neutral-200 dark:bg-neutral-800 self-stretch my-1.5" />

            {/* Location selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center gap-2 h-11 px-3.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-xl transition-colors w-full sm:w-48 justify-between"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="size-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{selectedLocation}</span>
                </span>
                <span className="text-neutral-400 text-[10px]">▼</span>
              </button>

              {locationOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto py-1.5 text-xs">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setLocationOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                          selectedLocation === loc ? "font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30" : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleProtectedNav("/dashboard/job-seeker/jobs")}
              className={`${buttonVariants({ size: "default" })} h-11 px-6 rounded-xl bg-neutral-950 text-white font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 shadow-md shrink-0`}
            >
              Explore Jobs
            </button>
          </div>

          {/* Quick Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-400">Popular:</span>
            {["Next.js", "TypeScript", "Remote", "Kathmandu", "Full Stack", "DevOps"].map((tag) => (
              <button
                key={tag}
                onClick={() => handleProtectedNav("/dashboard/job-seeker/jobs")}
                className="rounded-full bg-white px-2.5 py-1 border border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 text-[11px] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── THREE ROLE CARDS SECTION ───────────────── */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-2 text-xs">
            Purpose-Built Portals
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="mt-2 text-sm text-neutral-500 max-w-xl mx-auto">
            Choose your role and enter dedicated dashboards packed with specialized tooling.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Candidate Card */}
          <Card className="group relative overflow-hidden rounded-3xl border-neutral-200/80 bg-gradient-to-b from-white to-blue-50/30 shadow-xs hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
            <div className="p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-5">
                <Briefcase className="size-6" />
              </div>
              <Badge variant="secondary" className="mb-2 text-[10px] text-blue-700 bg-blue-100/60 dark:bg-blue-950/60 dark:text-blue-300">
                For Job Seekers
              </Badge>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Candidate Workspace
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Browse matched opportunities, manage CVs with instant PDF upload, track application pipelines, and schedule interviews.
              </p>

              <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-blue-600 shrink-0" />
                  <span>Interactive Application Activity Chart</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-blue-600 shrink-0" />
                  <span>Resume Management &amp; One-Click Apply</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-blue-600 shrink-0" />
                  <span>Integrated Video Interview Links</span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => launchPortal("JOB_SEEKER", "/dashboard/job-seeker")}
                  className="flex w-full items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3 opacity-60" />
                    Sign In to Launch
                  </span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Employer Card */}
          <Card className="group relative overflow-hidden rounded-3xl border-neutral-200/80 bg-gradient-to-b from-white to-purple-50/30 shadow-xs hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/5 transition-all dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
            <div className="p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20 mb-5">
                <Building2 className="size-6" />
              </div>
              <Badge variant="secondary" className="mb-2 text-[10px] text-purple-700 bg-purple-100/60 dark:bg-purple-950/60 dark:text-purple-300">
                For Recruiters &amp; Employers
              </Badge>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Recruiter Command Hub
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Publish high-visibility jobs, inspect candidate resumes, progress candidates through screening stages, and organize loops.
              </p>

              <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-purple-600 shrink-0" />
                  <span>Rich Job Creation with Skill Tagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-purple-600 shrink-0" />
                  <span>Applicant Review &amp; Status Transitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-purple-600 shrink-0" />
                  <span>Company Branding &amp; Verified Recruiter Profile</span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => launchPortal("EMPLOYER", "/dashboard/employer")}
                  className="flex w-full items-center justify-between text-xs font-bold text-purple-600 hover:text-purple-700 group-hover:translate-x-0.5 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3 opacity-60" />
                    Sign In to Launch
                  </span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Admin Card */}
          <Card className="group relative overflow-hidden rounded-3xl border-neutral-200/80 bg-gradient-to-b from-white to-emerald-50/30 shadow-xs hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
            <div className="p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-5">
                <ShieldCheck className="size-6" />
              </div>
              <Badge variant="secondary" className="mb-2 text-[10px] text-emerald-700 bg-emerald-100/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                For Administrators
              </Badge>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Platform Governance
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Comprehensive platform telemetries, account moderation, employer verification workflows, and macro hiring throughput reports.
              </p>

              <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Platform-Wide User &amp; Job Auditing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Account Suspension &amp; Reactivation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Hiring Conversion &amp; Placement Analytics</span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => launchPortal("ADMIN", "/dashboard/admin")}
                  className="flex w-full items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-0.5 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3 opacity-60" />
                    Sign In to Launch
                  </span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────────── FEATURED JOBS ───────────────── */}
      <section id="jobs" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="outline" className="mb-1 text-xs">Featured Vacancies</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              Latest Open Positions
            </h2>
          </div>
          <button
            onClick={() => handleProtectedNav("/dashboard/job-seeker/jobs")}
            className="text-xs font-semibold text-neutral-900 dark:text-white inline-flex items-center gap-1 hover:underline"
          >
            {totalJobs > 0 ? `Explore all ${totalJobs}+ open jobs` : "Explore all open jobs"} <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Loading skeleton */}
        {jobsLoading && (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-neutral-200/80 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-3" />
                <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-16" />
                  <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-20" />
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real jobs from API */}
        {!jobsLoading && featuredJobs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredJobs.map((job) => (
              <Card
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border-neutral-200/80 bg-white p-6 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-[10px]">
                      {formatEmploymentType(job.employmentType)}
                    </Badge>
                    {formatSalary(job) && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatSalary(job)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                    <Building2 className="size-3" />
                    {job.company.name}{job.location ? ` • ${job.location}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map(({ skill }) => (
                      <Badge key={skill.name} variant="secondary" className="text-[10px] font-normal">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => handleProtectedNav("/dashboard/job-seeker/jobs")}
                    className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full text-xs font-semibold`}
                  >
                    View Details &amp; Apply
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state when no jobs available */}
        {!jobsLoading && featuredJobs.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <Briefcase className="size-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-500">No open positions at the moment.</p>
            <p className="text-xs text-neutral-400 mt-1">Check back soon or sign up to get notified.</p>
            <Link href="/register" className={`${buttonVariants({ size: "sm" })} mt-4`}>
              Create Account
            </Link>
          </div>
        )}
      </section>

      {/* ───────────────── PLATFORM METRICS COUNTER ───────────────── */}
      <section id="stats" className="border-y border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white">
                2,400+
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Active Job Opportunities
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                850+
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Verified Employers
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">
                18,000+
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Skilled Candidates
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                98.4%
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Recruitment Satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── ABOUT & DEVELOPER SECTION ───────────────── */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Badge variant="outline" className="mb-2 text-xs">Architectural Integrity</Badge>
        <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          Engineered for Maximum Scale &amp; Performance
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Job Portal System (JPS) is built on an enterprise tech stack comprising Next.js, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Prisma ORM, and Supabase.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold mb-4 dark:bg-blue-950 dark:text-blue-300">
              ⚡
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Strict Role-Based Access Control
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
              Cryptographically verified JWT access and refresh tokens protect sensitive APIs and frontend routes for Job Seekers, Employers, and Admins.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold mb-4 dark:bg-purple-950 dark:text-purple-300">
              📊
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Real-Time Visual Telemetry
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
              Responsive Recharts cadence charts across weekly, monthly, and yearly horizons for candidate activity and recruiter conversion.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-4 dark:bg-emerald-950 dark:text-emerald-300">
              🛡️
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Supabase &amp; Prisma ORM
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
              Fully normalized relational PostgreSQL database preserving transactional integrity across users, profiles, jobs, and applications.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="border-t border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm dark:bg-white dark:text-neutral-950">
                  J
                </div>
                <span className="font-bold text-lg tracking-tight">JobPortal System (JPS)</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
                Empowering career transitions and corporate talent acquisition across Nepal and the international engineering ecosystem.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
                Role Dashboards
              </h4>
              <ul className="space-y-2 text-xs text-neutral-500">
                <li>
                  <Link href="/login?role=JOB_SEEKER&redirect=/dashboard/job-seeker" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Job Seeker Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=EMPLOYER&redirect=/dashboard/employer" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Employer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/login?role=ADMIN&redirect=/dashboard/admin" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Administrator Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Sign In to Portal
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Create New Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-3">
                Architect &amp; Developer
              </h4>
              <ul className="space-y-2 text-xs text-neutral-500">
                <li className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Sabin Chaulagain
                </li>
                <li>
                  <a href="tel:+9779814397731" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Phone: +977 9814397731
                  </a>
                </li>
                <li>
                  <a href="mailto:sabinc692@gmail.com" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Email: sabinc692@gmail.com
                  </a>
                </li>
                <li>
                  <span className="text-neutral-400">Location: Kathmandu, Nepal</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <span>&copy; 2026 JobPortal System (JPS). All rights reserved.</span>
            <span>
              Designed &amp; Developed with Next.js, Tailwind CSS &amp; shadcn/ui.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
