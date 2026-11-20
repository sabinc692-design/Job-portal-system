"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthSessionSnapshot, getDashboardPath, parseAuthUser, subscribeAuthSession, type AuthRole } from "@/lib/auth";

const titles: Record<AuthRole, string> = {
  JOB_SEEKER: "Job Seeker Dashboard",
  EMPLOYER: "Employer Dashboard",
  ADMIN: "Admin Dashboard",
};

export default function RoleDashboard({ role }: { role: AuthRole }) {
  const router = useRouter();
  const serializedUser = useSyncExternalStore(subscribeAuthSession, getAuthSessionSnapshot, () => null);
  const user = useMemo(() => parseAuthUser(serializedUser), [serializedUser]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!user || !accessToken) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) router.replace(getDashboardPath(user.role));
  }, [role, router, user]);

  if (!user) return <main className="min-h-screen bg-neutral-50" aria-label="Loading dashboard" />;

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-sm text-neutral-500">Signed in as {user.name}</p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900">{titles[role]}</h1>
          </div>
          <Button variant="outline" render={<Link href="/logout" />}>Log out</Button>
        </header>
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-neutral-700">Welcome, {user.name}.</p>
        </section>
      </div>
    </main>
  );
}
