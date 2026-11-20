import { Router } from "express";
import {
  createRecruiterJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateRecruiterJob,
  deleteRecruiterJob,
} from "./recruiter.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const recruiterRouter = Router();

recruiterRouter.use(authenticate, requireRole("EMPLOYER", "recruiter", "ADMIN"));

recruiterRouter.post("/job/create", createRecruiterJob);
recruiterRouter.get("/job", getRecruiterJobs);
recruiterRouter.get("/job/:id", getRecruiterJobById);
recruiterRouter.patch("/job/:id", updateRecruiterJob);
recruiterRouter.put("/job/:id", updateRecruiterJob);
recruiterRouter.delete("/job/:id", deleteRecruiterJob);
