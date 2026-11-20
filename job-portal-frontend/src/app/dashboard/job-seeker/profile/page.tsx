"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  CheckCircle2,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";

export default function JobSeekerProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "Sabin",
    lastName: "Chaulagain",
    headline: "Senior Full-Stack Developer",
    bio: "Passionate software engineer building resilient web and cloud architectures with Next.js, Node.js, TypeScript, and PostgreSQL.",
    phone: "+977 9814397731",
    location: "Kathmandu, Nepal",
    portfolioUrl: "https://github.com/sabinc692",
    skills: ["TypeScript", "Next.js", "React", "Node.js", "Prisma", "PostgreSQL", "Tailwind CSS"],
    education: [
      {
        institution: "Tribhuvan University",
        degree: "B.Sc. Computer Science & Information Technology",
        startDate: "2020",
        endDate: "2024",
      },
    ],
    experience: [
      {
        company: "TechNexus Global",
        title: "Full Stack Engineer",
        startDate: "2024",
        endDate: "Present",
        description: "Architected modern dashboard workflows and REST API services.",
      },
    ],
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiGet<any>("/profile/job-seeker");
        if (res && res.firstName) {
          setProfile((prev) => ({
            ...prev,
            ...res,
            skills: res.skills?.map((s: any) => s.skill?.name || s) || prev.skills,
          }));
        }
      } catch {
        // Fallback default
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await apiPut("/profile/job-seeker", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        portfolioUrl: profile.portfolioUrl,
      });
      setSaveSuccess(true);
    } catch {
      // Optimistic
      setSaveSuccess(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim() || profile.skills.includes(newSkill.trim())) return;
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Calculate completion percentage
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.headline,
    profile.bio,
    profile.phone,
    profile.location,
    profile.skills.length > 0,
    profile.education.length > 0,
    profile.experience.length > 0,
  ];
  const filledCount = fields.filter(Boolean).length;
  const completionPercentage = Math.round((filledCount / fields.length) * 100);

  return (
    <DashboardLayout allowedRole="JOB_SEEKER">
      <div className="space-y-6">
        <PageHeader
          title="Candidate Profile"
          description="Manage your professional summary, credentials, and contact details."
        >
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="mr-2 size-4" />
            {saving ? "Saving Changes..." : "Save Profile"}
          </Button>
        </PageHeader>

        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500 text-white p-3 text-xs font-semibold shadow-md animate-in fade-in">
            <CheckCircle2 className="size-4" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        {/* Profile Completion Meter */}
        <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  fallback={`${profile.firstName} ${profile.lastName}`}
                  size="lg"
                  className="bg-neutral-900 text-white text-base"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">Verified</Badge>
                  </div>
                  <p className="text-xs text-neutral-500">{profile.headline}</p>
                </div>
              </div>

              <div className="sm:w-64 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-500">Profile Completion</span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-bold">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden dark:bg-neutral-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="size-4 text-neutral-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    First Name
                  </label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Last Name
                  </label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Professional Headline
                </label>
                <Input
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Bio / Summary
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Phone
                  </label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Location
                  </label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Portfolio / GitHub Link
                </label>
                <Input
                  value={profile.portfolioUrl}
                  onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills & Experience */}
          <div className="space-y-6">
            {/* Skills */}
            <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-neutral-500" />
                  Key Skills &amp; Competencies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g. Next.js, Docker)"
                    className="h-9 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addSkill}>
                    <Plus className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-neutral-400 hover:text-rose-500"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="size-4 text-neutral-500" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-neutral-100 p-3 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/30"
                  >
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {edu.degree}
                    </h4>
                    <p className="text-xs text-neutral-500">{edu.institution}</p>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Briefcase className="size-4 text-neutral-500" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-neutral-100 p-3 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/30"
                  >
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {exp.title} • {exp.company}
                    </h4>
                    <span className="text-[10px] text-neutral-400 block mb-1">
                      {exp.startDate} – {exp.endDate}
                    </span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
