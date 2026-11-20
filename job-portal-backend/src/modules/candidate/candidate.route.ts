import { Router } from "express";
import {
  getCandidateJobs,
  getCandidateJobById,
  saveCandidateJob,
  applyCandidateJob,
  removeSavedCandidateJob,
} from "./candidate.controller.js";
import { authenticate, requireRole } from "../../middleware/auth.middleware.js";

export const candidateRouter = Router();

candidateRouter.use(authenticate, requireRole("JOB_SEEKER", "candidate"));

candidateRouter.get("/jobs", getCandidateJobs);
candidateRouter.get("/job/:id", getCandidateJobById);
candidateRouter.post("/job/save/:id", saveCandidateJob);
candidateRouter.post("/job/apply/:id", applyCandidateJob);
candidateRouter.delete("/job/:id", removeSavedCandidateJob);
