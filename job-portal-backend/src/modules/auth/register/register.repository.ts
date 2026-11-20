import { prisma } from "../../../lib/prisma.js";
import type { UserRole } from "../../../generated/prisma/client.js";

export const registerRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { email: string; password: string; role: UserRole }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data });
      const { password: _password, ...safeUser } = user;
      return safeUser;
    });
  },
};
