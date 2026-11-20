import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, InvalidAccessTokenError } from "../modules/auth/token.service.js";
import { UserRole } from "../generated/prisma/client.js";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type AllowedRole =
  | UserRole
  | "recruiter"
  | "candidate"
  | "admin"
  | "RECRUITER"
  | "CANDIDATE"
  | "ADMIN"
  | "employer"
  | "job_seeker";

function normalizeRole(role: string): UserRole | null {
  const normalized = role.toUpperCase();
  if (normalized === "EMPLOYER" || normalized === "RECRUITER") {
    return UserRole.EMPLOYER;
  }
  if (normalized === "JOB_SEEKER" || normalized === "CANDIDATE") {
    return UserRole.JOB_SEEKER;
  }
  if (normalized === "ADMIN") {
    return UserRole.ADMIN;
  }
  return null;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required. Missing Bearer token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const claims = verifyAccessToken(token);
    req.user = {
      id: claims.sub as string,
      role: claims.role as UserRole,
    };
    return next();
  } catch (error) {
    if (error instanceof InvalidAccessTokenError) {
      return res.status(401).json({ message: error.message });
    }
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireRole(...roles: AllowedRole[]) {
  const allowed = roles
    .map((r) => normalizeRole(r))
    .filter((r): r is UserRole => r !== null);

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions." });
    }
    return next();
  };
}
