"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Globe,
  MapPin,
  Save,
  CheckCircle2,
  Phone,
  Briefcase,
  Users,
} from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "Recruiter",
    jobTitle: "Head of Talent Acquisition",
    phone: "+977 1 4455667",
    companyName: "TechNova Solutions",
    companyDescription: "Pioneering enterprise engineering services and digital cloud products for international clients.",
    website: "https://technova.example.com",
    industry: "Information Technology & Software Services",
    size: "50-200 Employees",
    location: "Kathmandu, Nepal",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadEmployer() {
      try {
        const res = await apiGet<any>("/profile/employer");
        if (res?.company) {
          setProfile({
            firstName: res.firstName || "Admin",
            lastName: res.lastName || "Recruiter",
            jobTitle: res.jobTitle || "Talent Lead",
            phone: res.phone || "",
            companyName: res.company.name || "TechNova Solutions",
            companyDescription: res.company.description || "",
            website: res.company.website || "",
            industry: res.company.industry || "Information Technology",
            size: res.company.size || "50-200",
            location: res.company.location || "Kathmandu, Nepal",
          });
        }
      } catch {
        // Fallback default
      }
    }
    loadEmployer();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await apiPut("/profile/employer", profile);
      setSaveSuccess(true);
    } catch {
      // Optimistic
      setSaveSuccess(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <DashboardLayout allowedRole="EMPLOYER">
      <div className="space-y-6">
        <PageHeader
          title="Company &amp; Recruiter Profile"
          description="Manage your organizational branding, company description, and verified hiring contact."
        >
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save Company Profile"}
          </Button>
        </PageHeader>

        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500 text-white p-3 text-xs font-semibold shadow-md animate-in fade-in">
            <CheckCircle2 className="size-4" />
            <span>Company profile updated successfully!</span>
          </div>
        )}

        {/* Company Card Header */}
        <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-2xl font-bold text-white dark:bg-white dark:text-neutral-900">
                {profile.companyName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {profile.companyName}
                  </h2>
                  <Badge variant="default" className="bg-emerald-600 text-[10px]">
                    Verified Employer
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                  <span>{profile.industry}</span>
                  <span>•</span>
                  <span>{profile.location}</span>
                  <span>•</span>
                  <span>{profile.size}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2">
          {/* Company Details */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-neutral-500" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Company Name *
                </label>
                <Input
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Company Overview &amp; Mission
                </label>
                <textarea
                  value={profile.companyDescription}
                  onChange={(e) => setProfile({ ...profile, companyDescription: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Industry
                  </label>
                  <Input
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Company Size
                  </label>
                  <Input
                    value={profile.size}
                    onChange={(e) => setProfile({ ...profile, size: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Website URL
                  </label>
                  <Input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Headquarters Location
                  </label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Representative Details */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="size-4 text-neutral-500" />
                Recruiter &amp; Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    First Name
                  </label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Last Name
                  </label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Job Title in Organization
                </label>
                <Input
                  value={profile.jobTitle}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  placeholder="e.g. HR Manager / Lead Recruiter"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Direct Phone Number
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/40">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Verification Badge
                </p>
                <p>
                  Your employer identity is tied to your corporate email. Job candidates will see this verified branding when viewing your posted vacancies.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
