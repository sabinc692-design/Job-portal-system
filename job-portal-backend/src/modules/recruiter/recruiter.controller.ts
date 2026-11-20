import type { Request, Response } from "express";
import { jobsRepository } from "../jobs/jobs.repository.js";
import { prisma } from "../../lib/prisma.js";

function parseDecimal(val: unknown): number | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? null : num;
}

function parseDate(val: unknown): Date | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

export async function createRecruiterJob(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      location,
      employmentType,
      workplaceType,
      experienceLevel,
      salaryMin,
      salaryMax,
      currency,
      applicationDeadline,
      skills,
    } = req.body;

    if (!title || !description || !employmentType || !experienceLevel) {
      return res.status(400).json({ success: false, message: "Missing required job fields (title, description, employmentType, experienceLevel)." });
    }

    // Ensure company profile exists for employer/recruiter
    let employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: { company: true },
    });

    let companyId: string;
    if (!employerProfile) {
      const company = await prisma.company.create({
        data: {
          name: "My Enterprise",
          slug: `company-${Date.now()}`,
          location: location || "Kathmandu, Nepal",
        },
      });
      employerProfile = await prisma.employerProfile.create({
        data: {
          userId,
          firstName: "Recruiter",
          lastName: "User",
          companyId: company.id,
        },
        include: { company: true },
      });
      companyId = company.id;
    } else {
      companyId = employerProfile.companyId;
    }

    const job = await jobsRepository.create({
      companyId,
      postedByUserId: userId,
      title,
      description,
      location,
      employmentType,
      workplaceType: workplaceType || "ONSITE",
      experienceLevel,
      salaryMin: parseDecimal(salaryMin) ?? undefined,
      salaryMax: parseDecimal(salaryMax) ?? undefined,
      currency: currency || "USD",
      applicationDeadline: parseDate(applicationDeadline) ?? undefined,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully.",
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to create job." });
  }
}

export async function getRecruiterJobs(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const result = await jobsRepository.findMany({
      postedByUserId: userId,
      take: 100,
    });
    return res.status(200).json({
      success: true,
      message: "Recruiter jobs retrieved successfully.",
      data: result.jobs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch recruiter jobs." });
  }
}

export async function getRecruiterJobById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const job = await jobsRepository.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (role !== "ADMIN" && job.postedByUserId !== userId) {
      // Return 404 to avoid disclosing existence of another recruiter's job
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Job retrieved successfully.",
      data: job,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch job details." });
  }
}

export async function updateRecruiterJob(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await jobsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (role !== "ADMIN" && existing.postedByUserId !== userId) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const {
      title,
      description,
      location,
      employmentType,
      workplaceType,
      experienceLevel,
      salaryMin,
      salaryMax,
      status,
      applicationDeadline,
      skills,
    } = req.body;

    const parsedMin = parseDecimal(salaryMin);
    const parsedMax = parseDecimal(salaryMax);
    const parsedDeadline = parseDate(applicationDeadline);

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (employmentType !== undefined) updateData.employmentType = employmentType;
    if (workplaceType !== undefined) updateData.workplaceType = workplaceType;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (parsedMin !== undefined) updateData.salaryMin = parsedMin;
    if (parsedMax !== undefined) updateData.salaryMax = parsedMax;
    if (status !== undefined) updateData.status = status;
    if (parsedDeadline !== undefined) updateData.applicationDeadline = parsedDeadline;

    const skillsArray =
      skills !== undefined
        ? Array.isArray(skills)
          ? skills
          : typeof skills === "string"
          ? skills.split(",").map((s) => s.trim()).filter(Boolean)
          : []
        : undefined;

    const updated = await jobsRepository.update(id, updateData, skillsArray);

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update job." });
  }
}

export async function deleteRecruiterJob(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await jobsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (role !== "ADMIN" && existing.postedByUserId !== userId) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    await jobsRepository.delete(id);
    return res.status(200).json({
      success: true,
      message: "Job removed successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete job." });
  }
}
