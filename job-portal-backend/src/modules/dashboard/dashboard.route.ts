import { Router } from "express";
import {
  getJobSeekerDashboard,
  getEmployerDashboard,
  getAdminDashboard,
} from "./dashboard.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.get("/job-seeker", authenticate, requireRole("JOB_SEEKER"), getJobSeekerDashboard);
dashboardRouter.get("/employer", authenticate, requireRole("EMPLOYER", "ADMIN"), getEmployerDashboard);
dashboardRouter.get("/admin", authenticate, requireRole("ADMIN"), getAdminDashboard);
