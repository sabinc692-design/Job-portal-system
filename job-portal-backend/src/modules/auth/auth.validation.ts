import { z } from "zod";

const ALLOWED_REGISTER_ROLES = [
  "job_seeker",
  "employer",
  "candidate",
  "recruiter",
] as const;

export const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(6).refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: "Password must be no more than 72 bytes.",
  }),
  role: z.string().trim().refine(
    (val) => ALLOWED_REGISTER_ROLES.includes(val.toLowerCase() as any),
    {
      message: "Role must be candidate (job seeker) or recruiter (employer). Admin accounts cannot self-register.",
    }
  ),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: "Password must be no more than 72 bytes.",
  }),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
