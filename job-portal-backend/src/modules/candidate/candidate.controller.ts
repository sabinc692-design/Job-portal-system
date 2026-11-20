import type { Request, Response } from "express";
import { jobsRepository } from "../jobs/jobs.repository.js";
import { applicationsRepository } from "../applications/applications.repository.js";
import { prisma } from "../../lib/prisma.js";
import { notificationsRepository } from "../notifications/notifications.repository.js";

// In-memory store for saved jobs per candidate (userId -> Set of jobIds)
// Since schema.prisma does not yet have a SavedJob table, this provides full functional support.
const savedJobsStore = new Map<string, Set<string>>();

export async function getCandidateJobs(req: Request, res: Response) {
  try {
    const {
      search,
      location,
      employmentType,
      workplaceType,
      experienceLevel,
      page = "1",
      limit = "20",
    } = req.query;

    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const result = await jobsRepository.findMany({
      search: search as string,
      location: location as string,
      employmentType: employmentType as any,
      workplaceType: workplaceType as any,
      experienceLevel: experienceLevel as any,
      status: "PUBLISHED",
      skip,
      take,
    });

    return res.status(200).json({
      success: true,
      message: "Candidate jobs retrieved successfully.",
      data: {
        jobs: result.jobs,
        total: result.total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(result.total / take) || 1,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch candidate jobs." });
  }
}

export async function getCandidateJobById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const job = await jobsRepository.findById(id);

    if (!job || job.status !== "PUBLISHED") {
      return res.status(404).json({ success: false, message: "Job not found or not available." });
    }

    return res.status(200).json({
      success: true,
      message: "Job details retrieved successfully.",
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch job details." });
  }
}

export async function saveCandidateJob(req: Request, res: Response) {
  try {
    const jobId = String(req.params.id);
    const userId = req.user!.id;

    const job = await jobsRepository.findById(jobId);
    if (!job || job.status !== "PUBLISHED") {
      return res.status(404).json({ success: false, message: "Job not found or not available to save." });
    }

    if (!savedJobsStore.has(userId)) {
      savedJobsStore.set(userId, new Set<string>());
    }

    const userSaved = savedJobsStore.get(userId)!;
    if (userSaved.has(jobId)) {
      return res.status(409).json({ success: false, message: "Job is already saved." });
    }

    userSaved.add(jobId);

    return res.status(201).json({
      success: true,
      message: "Job saved successfully.",
      data: {
        jobId,
        userId,
        savedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to save job." });
  }
}

export async function applyCandidateJob(req: Request, res: Response) {
  try {
    const jobId = String(req.params.id);
    const userId = req.user!.id;
    const { coverLetter } = req.body;

    const job = await jobsRepository.findById(jobId);
    if (!job || job.status !== "PUBLISHED") {
      return res.status(400).json({ success: false, message: "Job is not available for applications." });
    }

    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      select: { resumeUrl: true },
    });
    if (!profile?.resumeUrl) {
      return res.status(400).json({ success: false, message: "Upload a CV to your profile before applying." });
    }

    const existing = await prisma.application.findUnique({
      where: {
        jobId_applicantUserId: {
          jobId,
          applicantUserId: userId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "You have already applied for this job." });
    }

    const application = await applicationsRepository.create({
      jobId,
      applicantUserId: userId,
      coverLetter,
      resumeUrl: profile.resumeUrl,
    });

    try {
      await notificationsRepository.create({
        userId: job.postedByUserId,
        title: "New job application",
        message: `A candidate applied for ${job.title}.`,
        type: "NEW_APPLICATION",
        meta: { applicationId: application.id, jobId },
      });
    } catch (notificationError) {
      console.error("[Notifications] Could not notify employer:", notificationError);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to apply for job." });
  }
}

export async function removeSavedCandidateJob(req: Request, res: Response) {
  try {
    const jobId = String(req.params.id);
    const userId = req.user!.id;

    const userSaved = savedJobsStore.get(userId);
    if (userSaved && userSaved.has(jobId)) {
      userSaved.delete(jobId);
    }

    return res.status(200).json({
      success: true,
      message: "Saved job removed successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to remove saved job." });
  }
}
