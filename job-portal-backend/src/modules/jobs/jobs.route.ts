import { Router } from "express";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getEmployerJobs,
  getJobApplicants,
} from "./jobs.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const jobsRouter = Router();

// Public routes
jobsRouter.get("/", getJobs);
jobsRouter.get("/detail/:id", getJobById);

// Employer / Admin protected routes
jobsRouter.get("/employer/mine", authenticate, requireRole("EMPLOYER", "ADMIN"), getEmployerJobs);
jobsRouter.get("/:id/applicants", authenticate, requireRole("EMPLOYER", "ADMIN"), getJobApplicants);
jobsRouter.get("/:id", getJobById);
jobsRouter.post("/", authenticate, requireRole("EMPLOYER", "ADMIN"), createJob);
jobsRouter.put("/:id", authenticate, requireRole("EMPLOYER", "ADMIN"), updateJob);
jobsRouter.patch("/:id", authenticate, requireRole("EMPLOYER", "ADMIN"), updateJob);
jobsRouter.patch("/:id/status", authenticate, requireRole("EMPLOYER", "ADMIN"), updateJobStatus);
jobsRouter.delete("/:id", authenticate, requireRole("EMPLOYER", "ADMIN"), deleteJob);
