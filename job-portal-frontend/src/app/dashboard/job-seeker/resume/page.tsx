"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Plus,
} from "lucide-react";
import { apiGet, apiPost, apiDelete, apiUpload } from "@/lib/api";

interface ResumeState {
  hasResume: boolean;
  fileName: string;
  fileSize: string;
  updatedAt: string;
  url: string;
}

export default function MyResumePage() {
  const [resume, setResume] = useState<ResumeState>({
    hasResume: false,
    fileName: "",
    fileSize: "",
    updatedAt: "",
    url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadResume() {
      try {
        const profile = await apiGet<any>("/profile/job-seeker");
        if (profile?.resumeUrl) {
          setResume({
            hasResume: true,
            fileName: decodeURIComponent(profile.resumeUrl.split("/").pop() || "Resume document"),
            fileSize: "Size unavailable",
            updatedAt: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Recently updated",
            url: profile.resumeUrl,
          });
        }
      } catch (error) { setUploadError(error instanceof Error ? error.message : "Could not load your resume."); }
    }
    loadResume();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate supported resume types and the server's 10 MB limit.
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      setUploadError("Only PDF and DOCX documents are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    setUploadProgress(25);
    void finishUpload(file);
  };

  const finishUpload = async (file: File) => {
    try {
      const form = new FormData();
      form.append("resume", file);
      setUploadProgress(60);
      const uploaded = await apiUpload<{ data: { url: string; bytes: number; fileName: string } }>("/upload/resume", form);
      await apiPost("/profile/job-seeker/resume", { resumeUrl: uploaded.data.url });
      setUploadProgress(100);
      setResume({ hasResume: true, fileName: uploaded.data.fileName || file.name,
        fileSize: `${(uploaded.data.bytes / (1024 * 1024)).toFixed(2)} MB`, updatedAt: "Just now", url: uploaded.data.url });
      showToast("Resume uploaded successfully!");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Resume upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete("/profile/job-seeker/resume");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not remove your resume.");
      return;
    }
    setResume({
      hasResume: false,
      fileName: "",
      fileSize: "",
      updatedAt: "",
      url: "",
    });
    setShowDeleteModal(false);
    showToast("Resume deleted.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <DashboardLayout allowedRole="JOB_SEEKER">
      <div className="space-y-6">
        <PageHeader
          title="Resume Management"
          description="Upload and maintain your master CV used across all job applications."
        />

        {toastMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500 text-white p-3 text-xs font-semibold shadow-md animate-in fade-in">
            <CheckCircle2 className="size-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Current Active Resume Card */}
        {resume.hasResume ? (
          <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-emerald-600">
                    Active Resume
                  </Badge>
                  <span className="text-xs text-neutral-400">Default for fast apply</span>
                </div>
                <span className="text-xs text-neutral-500">Updated {resume.updatedAt}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    <FileText className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-xs sm:max-w-md">
                      {resume.fileName}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {resume.fileSize} • Portable Document Format
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    <Eye className="mr-1.5 size-3.5" />
                    Preview
                  </Button>
                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    <Download className="mr-1.5 size-3.5" />
                    Download
                  </a>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Replace resume section */}
              <div className="pt-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-neutral-300 p-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                  <RefreshCw className="size-3.5 text-neutral-400" />
                  <span>Replace with new file (PDF, DOC, or DOCX, max 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Upload Area */}
        <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {resume.hasResume ? "Upload Alternative Resume" : "Upload Your Resume"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600 transition-colors">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-3">
                <UploadCloud className="size-7 text-neutral-500" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Choose a file or drag and drop here
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
              </p>

              <label className="mt-4 cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 transition-colors">
                <Plus className="size-3.5" />
                Browse File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              {uploading && (
                <div className="w-full max-w-xs mt-4 space-y-1">
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400">Uploading... {uploadProgress}%</span>
                </div>
              )}

              {uploadError && (
                <p className="mt-3 text-xs text-rose-600 font-medium">{uploadError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="size-5" />
                <DialogTitle className="text-rose-600">Remove Resume</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Are you sure you want to delete your active resume? You will need to upload a new one to apply for jobs.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                Delete Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resume Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="size-4 text-emerald-500" />
                {resume.fileName}
              </DialogTitle>
              <DialogDescription>
                Snapshot of your active resume document.
              </DialogDescription>
            </DialogHeader>

            {resume.fileName.toLowerCase().endsWith(".pdf") ? (
              <iframe title="Resume preview" src={resume.url} className="h-[70vh] w-full rounded-xl border border-neutral-200 dark:border-neutral-800" />
            ) : (
              <div className="rounded-xl border border-neutral-200 p-6 text-sm dark:border-neutral-800">
                DOC and DOCX files cannot be previewed in the browser. <a className="underline" href={resume.url} target="_blank" rel="noopener noreferrer">Open or download the document</a>.
              </div>
            )}

            <DialogFooter>
              <Button size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
