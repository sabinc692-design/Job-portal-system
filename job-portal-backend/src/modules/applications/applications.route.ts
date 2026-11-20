import { Router } from "express";
import {
  getMyApplications,
  submitApplication,
  withdrawApplication,
  getEmployerApplicants,
  updateApplicationStatus,
  getAllApplicationsAdmin,
} from "./applications.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const applicationsRouter = Router();

// Job seeker
applicationsRouter.get("/my", authenticate, requireRole("JOB_SEEKER"), getMyApplications);
applicationsRouter.post("/", authenticate, requireRole("JOB_SEEKER"), submitApplication);
applicationsRouter.patch("/:id/withdraw", authenticate, requireRole("JOB_SEEKER"), withdrawApplication);

// Employer
applicationsRouter.get("/employer", authenticate, requireRole("EMPLOYER", "ADMIN"), getEmployerApplicants);
applicationsRouter.patch("/:id/status", authenticate, requireRole("EMPLOYER", "ADMIN"), updateApplicationStatus);

// Admin
applicationsRouter.get("/all", authenticate, requireRole("ADMIN"), getAllApplicationsAdmin);
