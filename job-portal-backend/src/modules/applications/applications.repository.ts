import { prisma } from "../../lib/prisma.js";
import type { ApplicationStatus } from "../../generated/prisma/client.js";

export const applicationsRepository = {
  async findByApplicant(applicantUserId: string) {
    return prisma.application.findMany({
      where: { applicantUserId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByEmployer(employerUserId: string, jobId?: string) {
    return prisma.application.findMany({
      where: {
        job: {
          postedByUserId: employerUserId,
          ...(jobId ? { id: jobId } : {}),
        },
      },
      include: {
        job: {
          include: { company: true },
        },
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
  },

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: { company: true },
        },
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
    });
  },

  async create(data: {
    jobId: string;
    applicantUserId: string;
    resumeUrl?: string;
    coverLetter?: string;
  }) {
    return prisma.application.create({
      data: {
        jobId: data.jobId,
        applicantUserId: data.applicantUserId,
        resumeUrl: data.resumeUrl,
        coverLetter: data.coverLetter,
        status: "SUBMITTED",
      },
      include: {
        job: {
          include: { company: true },
        },
      },
    });
  },

  async updateStatus(id: string, status: ApplicationStatus, notes?: string) {
    return prisma.application.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        job: {
          include: { company: true },
        },
      },
    });
  },

  async findAll() {
    return prisma.application.findMany({
      include: {
        job: {
          include: { company: true },
        },
        applicant: {
          include: {
            jobSeekerProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
