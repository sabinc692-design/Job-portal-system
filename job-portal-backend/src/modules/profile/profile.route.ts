import { Router } from "express";
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  updateResume,
  deleteResume,
  getEmployerProfile,
  updateEmployerProfile,
} from "./profile.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const profileRouter = Router();

// Job seeker profile routes
profileRouter.get("/job-seeker", authenticate, requireRole("JOB_SEEKER"), getJobSeekerProfile);
profileRouter.put("/job-seeker", authenticate, requireRole("JOB_SEEKER"), updateJobSeekerProfile);
profileRouter.post("/job-seeker/resume", authenticate, requireRole("JOB_SEEKER"), updateResume);
profileRouter.delete("/job-seeker/resume", authenticate, requireRole("JOB_SEEKER"), deleteResume);

// Employer profile routes
profileRouter.get("/employer", authenticate, requireRole("EMPLOYER", "ADMIN"), getEmployerProfile);
profileRouter.put("/employer", authenticate, requireRole("EMPLOYER", "ADMIN"), updateEmployerProfile);
