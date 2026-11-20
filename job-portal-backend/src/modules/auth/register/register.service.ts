import bcrypt from "bcryptjs";
import { UserRole } from "../../../generated/prisma/client.js";
import { registerRepository } from "./register.repository.js";

export class AuthConflictError extends Error {}

const roleMap: Record<string, UserRole> = {
  job_seeker: UserRole.JOB_SEEKER,
  candidate: UserRole.JOB_SEEKER,
  employer: UserRole.EMPLOYER,
  recruiter: UserRole.EMPLOYER,
};

export type RegisterInput = {
  email: string;
  password: string;
  role: string;
};

export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  if (await registerRepository.findByEmail(email)) {
    throw new AuthConflictError("An account with this email already exists.");
  }

  const roleKey = input.role.trim().toLowerCase();
  const normalizedRole = roleMap[roleKey];
  if (!normalizedRole) {
    throw new Error("Invalid registration role.");
  }

  const password = await bcrypt.hash(input.password, 12);
  const user = await registerRepository.create({
    email,
    password,
    role: normalizedRole,
  });

  return {
    success: true,
    message: "User registered successfully",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
}
