import { Router } from "express";
import {
  getAllUsers,
  toggleUserStatus,
  getAdminEmployers,
  getAdminReports,
  getAdminJobs,
  getAdminJobById,
} from "./admin.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN", "admin"));

adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/status", toggleUserStatus);
adminRouter.get("/employers", getAdminEmployers);
adminRouter.get("/reports", getAdminReports);
adminRouter.get("/jobs", getAdminJobs);
adminRouter.get("/job/:id", getAdminJobById);
