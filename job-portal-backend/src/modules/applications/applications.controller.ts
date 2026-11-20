import type { Request, Response } from "express";
import { applicationsRepository } from "./applications.repository.js";
import { prisma } from "../../lib/prisma.js";
import { notificationsRepository } from "../notifications/notifications.repository.js";
import { sendApplicationStatusEmail } from "../../services/email.service.js";

export async function getMyApplications(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const applications = await applicationsRepository.findByApplicant(userId);
    return res.json(applications);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch applications." });
  }
}

export async function submitApplication(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      select: { resumeUrl: true },
    });
    if (!profile?.resumeUrl) {
      return res.status(400).json({ message: "Upload a CV to your profile before applying." });
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
      return res.status(409).json({ message: "You have already applied for this job." });
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

    return res.status(201).json(application);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to submit application." });
  }
}

export async function withdrawApplication(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;

    const existing = await applicationsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (existing.applicantUserId !== userId) {
      return res.status(403).json({ message: "You can only withdraw your own applications." });
    }

    const updated = await applicationsRepository.updateStatus(id, "WITHDRAWN");
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to withdraw application." });
  }
}

export async function getEmployerApplicants(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const jobId = req.query.jobId as string | undefined;
    const applicants = await applicationsRepository.findByEmployer(userId, jobId);
    return res.json(applicants);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch applicants." });
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const { status, notes } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await applicationsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (role !== "ADMIN" && existing.job.postedByUserId !== userId) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const updated = await applicationsRepository.updateStatus(id, status, notes);
    if (existing.status !== status) {
      const profile = existing.applicant.jobSeekerProfile;
      const applicantName = profile ? `${profile.firstName} ${profile.lastName}` : existing.applicant.email;
      try {
        await notificationsRepository.create({
          userId: existing.applicantUserId,
          title: "Application status updated",
          message: `Your application for ${existing.job.title} at ${existing.job.company.name} is now ${String(status).toLowerCase().replaceAll("_", " ")}.`,
          type: "APPLICATION_STATUS_CHANGE",
          meta: { applicationId: existing.id, jobId: existing.jobId, status: String(status) },
        });
      } catch (notificationError) {
        console.error("[Notifications] Could not notify applicant:", notificationError);
      }

      if (status === "HIRED" || status === "REJECTED") {
        const employer = await prisma.user.findUnique({
          where: { id: existing.job.postedByUserId },
          include: { employerProfile: true },
        });
        const employerName = employer?.employerProfile
          ? `${employer.employerProfile.firstName} ${employer.employerProfile.lastName}`
          : process.env.GMAIL_FROM_NAME || "Job-Portal System";
        await sendApplicationStatusEmail({
          to: existing.applicant.email,
          applicantName,
          jobTitle: existing.job.title,
          companyName: existing.job.company.name,
          employerEmail: employer?.email || "",
          employerName,
          status: String(status),
        });
      }
    }
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update status." });
  }
}

export async function getAllApplicationsAdmin(req: Request, res: Response) {
  try {
    const applications = await applicationsRepository.findAll();
    return res.json(applications);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch applications." });
  }
}
