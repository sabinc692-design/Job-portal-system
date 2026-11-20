import { prisma } from "../../lib/prisma.js";

export const profileRepository = {
  async getJobSeekerProfile(userId: string) {
    return prisma.jobSeekerProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        education: { orderBy: { startDate: "desc" } },
        experience: { orderBy: { startDate: "desc" } },
      },
    });
  },

  async upsertJobSeekerProfile(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      headline?: string;
      bio?: string;
      phone?: string;
      location?: string;
      portfolioUrl?: string;
      resumeUrl?: string;
    }
  ) {
    return prisma.jobSeekerProfile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        headline: data.headline,
        bio: data.bio,
        phone: data.phone,
        location: data.location,
        portfolioUrl: data.portfolioUrl,
        resumeUrl: data.resumeUrl,
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        headline: data.headline,
        bio: data.bio,
        phone: data.phone,
        location: data.location,
        portfolioUrl: data.portfolioUrl,
        ...(data.resumeUrl !== undefined ? { resumeUrl: data.resumeUrl } : {}),
      },
      include: {
        skills: { include: { skill: true } },
        education: true,
        experience: true,
      },
    });
  },

  async updateResume(userId: string, resumeUrl: string | null) {
    return prisma.jobSeekerProfile.upsert({
      where: { userId },
      create: { userId, firstName: "", lastName: "", resumeUrl },
      update: { resumeUrl },
    });
  },

  async getEmployerProfile(userId: string) {
    return prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });
  },

  async upsertEmployerProfile(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      jobTitle?: string;
      phone?: string;
      companyName: string;
      companyDescription?: string;
      website?: string;
      logoUrl?: string;
      industry?: string;
      size?: string;
      location?: string;
    }
  ) {
    let profile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!profile) {
      const company = await prisma.company.create({
        data: {
          name: data.companyName,
          slug: `${data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          description: data.companyDescription,
          website: data.website,
          logoUrl: data.logoUrl,
          industry: data.industry,
          size: data.size,
          location: data.location,
        },
      });

      return prisma.employerProfile.create({
        data: {
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          phone: data.phone,
          companyId: company.id,
        },
        include: { company: true },
      });
    }

    // Update existing company and profile
    await prisma.company.update({
      where: { id: profile.companyId },
      data: {
        name: data.companyName,
        description: data.companyDescription,
        website: data.website,
        logoUrl: data.logoUrl,
        industry: data.industry,
        size: data.size,
        location: data.location,
      },
    });

    return prisma.employerProfile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        phone: data.phone,
      },
      include: { company: true },
    });
  },
};
