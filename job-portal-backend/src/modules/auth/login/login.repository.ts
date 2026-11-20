import { prisma } from "../../../lib/prisma.js";

export const loginRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        jobSeekerProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { firstName: true, lastName: true } },
      },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        jobSeekerProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { firstName: true, lastName: true } },
      },
    });
  },

  createAdmin(email: string, password: string) {
    return prisma.user.create({
      data: { email, password, role: "ADMIN" },
      include: {
        jobSeekerProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { firstName: true, lastName: true } },
      },
    });
  },
};
