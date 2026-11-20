import type { Request, Response } from "express";
import { jobsRepository } from "./jobs.repository.js";
import { prisma } from "../../lib/prisma.js";

export async function getJobs(req: Request, res: Response) {
  try {
    const {
      search,
      location,
      employmentType,
      workplaceType,
      experienceLevel,
      salaryMin,
      salaryMax,
      status,
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
      salaryMin: salaryMin ? parseFloat(salaryMin as string) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax as string) : undefined,
      status: (status as any) || "PUBLISHED",
      skip,
      take,
    });

    return res.json({
      jobs: result.jobs,
      total: result.total,
      page: parseInt(page as string, 10),
      totalPages: Math.ceil(result.total / take) || 1,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch jobs." });
  }
}

export async function getJobById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const job = await jobsRepository.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    return res.json(job);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch job details." });
  }
}

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

export async function createJob(req: Request, res: Response) {
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
      return res.status(400).json({ message: "Missing required job fields." });
    }

    // Find or create company for employer
    let employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: { company: true },
    });

    let companyId: string;
    if (!employerProfile) {
      // Auto-provision basic employer company profile if not yet created
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
          firstName: "Employer",
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

    return res.status(201).json(job);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create job." });
  }
}

export async function updateJob(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await jobsRepository.findById(id);
    if (!existing) return res.status(404).json({ message: "Job not found." });

    if (role !== "ADMIN" && existing.postedByUserId !== userId) {
      return res.status(403).json({ message: "You do not have permission to edit this job." });
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

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update job." });
  }
}

export async function updateJobStatus(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await jobsRepository.findById(id);
    if (!existing) return res.status(404).json({ message: "Job not found." });

    if (role !== "ADMIN" && existing.postedByUserId !== userId) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const updated = await jobsRepository.updateStatus(id, status);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update job status." });
  }
}

export async function deleteJob(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await jobsRepository.findById(id);
    if (!existing) return res.status(404).json({ message: "Job not found." });

    if (role !== "ADMIN" && existing.postedByUserId !== userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own jobs." });
    }

    await jobsRepository.delete(id);
    return res.json({ success: true, message: "Job removed successfully." });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to delete job." });
  }
}

export async function getEmployerJobs(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const result = await jobsRepository.findMany({
      postedByUserId: userId,
      take: 100,
    });
    return res.json(result.jobs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch employer jobs." });
  }
}

export async function getJobApplicants(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const existing = await jobsRepository.findById(id);
    if (!existing) return res.status(404).json({ message: "Job not found." });

    if (role !== "ADMIN" && existing.postedByUserId !== userId) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const applicants = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        applicant: {
          include: {
            jobSeekerProfile: {
              include: {
                skills: { include: { skill: true } },
                education: true,
                experience: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(applicants);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch job applicants." });
  }
}
