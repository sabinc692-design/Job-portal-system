"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, type FormEvent } from "react";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { apiPost } from "@/lib/api";
import { getDashboardPath, saveAuthSession, type AuthRole, type AuthSession } from "@/lib/auth";
import { ShieldAlert, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role")?.toUpperCase() as AuthRole | undefined;
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await apiPost<AuthSession>("/auth/login", { email, password });
      saveAuthSession(data);

      // If user requested a specific role but logged into another role
      if (requestedRole && data.user.role !== requestedRole) {
        // Redirect to their actual role dashboard
        router.push(getDashboardPath(data.user.role));
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(getDashboardPath(data.user.role));
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  const roleLabels: Record<string, string> = {
    JOB_SEEKER: "Candidate / Job Seeker",
    EMPLOYER: "Recruiter / Employer",
    ADMIN: "Platform Administrator",
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        requestedRole && roleLabels[requestedRole]
          ? `Sign in with your ${roleLabels[requestedRole]} credentials to access this portal.`
          : "Log in to apply for jobs or manage your listings."
      }
      footer={
        <>
          New to JobPortal?{" "}
          <Link
            href={
              requestedRole === "EMPLOYER"
                ? "/register?role=employer"
                : requestedRole === "JOB_SEEKER"
                ? "/register?role=job-seeker"
                : "/register"
            }
            className="font-semibold text-black hover:underline dark:text-white"
          >
            Create an account
          </Link>
        </>
      }
    >
      {requestedRole && roleLabels[requestedRole] && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          <ShieldCheck className="size-4 text-blue-600 shrink-0" />
          <span>
            Authorization required: Sign in to access the{" "}
            <strong>{roleLabels[requestedRole]}</strong> portal.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {serverError}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {loading ? "Verifying credentials..." : "Log in to Portal"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
