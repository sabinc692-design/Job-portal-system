import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const { search, role, status } = req.query;
    const where: any = {};

    if (role && role !== "ALL") where.role = role;
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.email = { contains: search as string, mode: "insensitive" };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        jobSeekerProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { firstName: true, lastName: true, company: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch users." });
  }
}

export async function toggleUserStatus(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, role: true, status: true },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update user status." });
  }
}

export async function getAdminEmployers(req: Request, res: Response) {
  try {
    const employers = await prisma.employerProfile.findMany({
      include: {
        user: { select: { id: true, email: true, status: true, createdAt: true } },
        company: {
          include: {
            _count: { select: { jobs: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(employers);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch employers." });
  }
}

export async function getAdminReports(req: Request, res: Response) {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      hiredCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.application.count({ where: { status: "HIRED" } }),
    ]);

    return res.json({
      summary: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        hiredCount,
        placementRate: totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(1) + "%" : "0%",
      },
      monthlyBreakdown: [
        { month: "Jan", users: 15, applications: 25, hires: 2 },
        { month: "Feb", users: 30, applications: 48, hires: 5 },
        { month: "Mar", users: 50, applications: 75, hires: 9 },
        { month: "Apr", users: 80, applications: 120, hires: 16 },
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to load reports." });
  }
}

export async function getAdminJobs(req: Request, res: Response) {
  try {
    const { status, search, page = "1", limit = "50" } = req.query;
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { company: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: true,
          skills: { include: { skill: true } },
          postedBy: { select: { id: true, email: true, status: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.job.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Admin jobs retrieved successfully.",
      data: {
        jobs,
        total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch admin jobs." });
  }
}

export async function getAdminJobById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        skills: { include: { skill: true } },
        postedBy: { select: { id: true, email: true, status: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
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
