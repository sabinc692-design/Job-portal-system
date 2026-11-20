import bcrypt from "bcryptjs";
import type { UserRole } from "../../../generated/prisma/client.js";
import { createTokenPair, InvalidRefreshTokenError, verifyRefreshToken } from "../token.service.js";
import { loginRepository } from "./login.repository.js";

export class InvalidCredentialsError extends Error {}

function publicUser(user: {
  id: string;
  email: string;
  role: UserRole;
  jobSeekerProfile: { firstName: string; lastName: string } | null;
  employerProfile: { firstName: string; lastName: string } | null;
}) {
  const profile = user.jobSeekerProfile ?? user.employerProfile;
  const name = user.role === "ADMIN"
    ? "Admin"
    : profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : user.email.split("@")[0];
  return { id: user.id, name, email: user.email, role: user.role };
}

async function findOrProvisionAdmin(email: string, password: string) {
  const adminEmail = (process.env.ADMIN_EMAIL || "jps@admin.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (email !== adminEmail || !adminPassword || password !== adminPassword) return null;

  const existing = await loginRepository.findByEmail(email);
  if (existing) return existing.role === "ADMIN" ? existing : null;

  try {
    return await loginRepository.createAdmin(email, await bcrypt.hash(adminPassword, 12));
  } catch (error) {
    // Another first login may have created the unique email at the same time.
    const createdByConcurrentLogin = await loginRepository.findByEmail(email);
    if (createdByConcurrentLogin?.role === "ADMIN") return createdByConcurrentLogin;
    throw error;
  }
}

export async function login(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  let user = await loginRepository.findByEmail(email);
  if (!user) user = await findOrProvisionAdmin(email, password);
  if (!user || user.status !== "ACTIVE" || !(await bcrypt.compare(password, user.password))) {
    throw new InvalidCredentialsError("Email or password is incorrect.");
  }

  return { ...createTokenPair(user), user: publicUser(user) };
}

export async function refreshSession(refreshToken: string) {
  const claims = verifyRefreshToken(refreshToken);
  const user = await loginRepository.findById(claims.sub!);
  if (!user || user.status !== "ACTIVE" || user.role !== claims.role) {
    throw new InvalidRefreshTokenError("Refresh token is invalid or expired.");
  }
  return { ...createTokenPair(user), user: publicUser(user) };
}
