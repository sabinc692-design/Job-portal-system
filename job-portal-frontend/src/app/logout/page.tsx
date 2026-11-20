"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAuthSession();
    router.replace("/login");
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-sm text-neutral-600">Signing out…</main>;
}
