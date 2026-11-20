import { prisma } from "../../lib/prisma.js";
import type { JobStatus, EmploymentType, WorkplaceType, ExperienceLevel, Prisma } from "../../generated/prisma/client.js";

export const jobsRepository = {
  async findMany(filters: {
    search?: string;
    location?: string;
    employmentType?: EmploymentType;
    workplaceType?: WorkplaceType;
    experienceLevel?: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    status?: JobStatus;
    companyId?: string;
    postedByUserId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.JobWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.postedByUserId) {
      where.postedByUserId = filters.postedByUserId;
    }

    if (filters.location && filters.location !== "All Locations") {
      where.location = { contains: filters.location, mode: "insensitive" };
    }

    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }

    if (filters.workplaceType) {
      where.workplaceType = filters.workplaceType;
    }

    if (filters.experienceLevel) {
      where.experienceLevel = filters.experienceLevel;
    }

    if (filters.salaryMin !== undefined) {
      where.OR = [
        { salaryMax: { gte: filters.salaryMin } },
        { salaryMin: { gte: filters.salaryMin } },
      ];
    }

    if (filters.salaryMax !== undefined) {
      where.salaryMin = { lte: filters.salaryMax };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { company: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: true,
          skills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip ?? 0,
        take: filters.take ?? 20,
      }),
      prisma.job.count({ where }),
    ]);

    return { jobs, total };
  },

  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });
  },

  async create(data: {
    companyId: string;
    postedByUserId: string;
    title: string;
    description: string;
    location?: string;
    employmentType: EmploymentType;
    workplaceType: WorkplaceType;
    experienceLevel: ExperienceLevel;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    applicationDeadline?: Date;
    skills?: string[];
  }) {
    return prisma.job.create({
      data: {
        companyId: data.companyId,
        postedByUserId: data.postedByUserId,
        title: data.title,
        description: data.description,
        location: data.location,
        employmentType: data.employmentType,
        workplaceType: data.workplaceType,
        experienceLevel: data.experienceLevel,
        salaryMin: data.salaryMin !== undefined ? data.salaryMin : null,
        salaryMax: data.salaryMax !== undefined ? data.salaryMax : null,
        currency: data.currency ?? "USD",
        applicationDeadline: data.applicationDeadline,
        status: "PUBLISHED",
        skills: data.skills && data.skills.length > 0
          ? {
              create: data.skills.map((skillName) => ({
                skill: {
                  connectOrCreate: {
                    where: { name: skillName.trim() },
                    create: { name: skillName.trim() },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    });
  },

  async update(
    id: string,
    data: Prisma.JobUpdateInput,
    skills?: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      if (skills !== undefined) {
        // Delete existing skills join records
        await tx.jobSkill.deleteMany({
          where: { jobId: id },
        });

        // Insert updated skills
        if (skills.length > 0) {
          for (const skillName of skills) {
            const trimmed = skillName.trim();
            if (!trimmed) continue;
            await tx.jobSkill.create({
              data: {
                job: { connect: { id } },
                skill: {
                  connectOrCreate: {
                    where: { name: trimmed },
                    create: { name: trimmed },
                  },
                },
              },
            });
          }
        }
      }

      return tx.job.update({
        where: { id },
        data,
        include: {
          company: true,
          skills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
      });
    });
  },

  async updateStatus(id: string, status: JobStatus) {
    return prisma.job.update({
      where: { id },
      data: { status },
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Delete associated job skills
      await tx.jobSkill.deleteMany({
        where: { jobId: id },
      });

      // 2. Delete associated applications
      await tx.application.deleteMany({
        where: { jobId: id },
      });

      // 3. Delete the job record
      return tx.job.delete({
        where: { id },
      });
    });
  },
};
