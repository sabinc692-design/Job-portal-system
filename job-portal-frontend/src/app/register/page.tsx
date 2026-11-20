"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";

const ROLES = [
  { value: "job_seeker", label: "Job Seeker — I'm looking for work" },
  { value: "employer", label: "Employer — I want to hire" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "job_seeker",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handle =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Email is required.";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setLoading(true);
    try {
      await apiPost("/auth/register", {
        email: form.email,
        password: form.password,
        role: form.role,
      });
      router.push("/login");
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join JobPortal as a job seeker or employer"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-black hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handle("email")}
          error={errors.email}
          required
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={handle("password")}
          error={errors.password}
          required
        />
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={handle("confirmPassword")}
          error={errors.confirmPassword}
          required
        />

        {/* Role Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            I am registering as <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-col gap-2">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  form.role === r.value
                    ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800"
                    : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={() => setForm((p) => ({ ...p, role: r.value }))}
                  className="accent-neutral-900 dark:accent-neutral-100"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 text-center">{serverError}</p>
        )}

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </Button>
      </form>
    </AuthShell>
  );
}
