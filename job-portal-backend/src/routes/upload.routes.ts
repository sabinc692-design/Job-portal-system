import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadSingleImage, uploadSingleResume } from "../middlewares/upload.middleware.js";
import { uploadImage, deleteImage, uploadResume } from "../controllers/upload.controller.js";
import { requireRole } from "../middleware/auth.middleware.js";

export const uploadRouter = Router();

// POST /api/upload - Authenticated single image upload with Multer and Cloudinary
uploadRouter.post("/", authenticate, uploadSingleImage, uploadImage);
uploadRouter.post("/resume", authenticate, requireRole("JOB_SEEKER"), uploadSingleResume, uploadResume);

// DELETE /api/upload - Authenticated image deletion by publicId in body, query, or path
uploadRouter.delete("/", authenticate, deleteImage);
uploadRouter.delete("/:publicId", authenticate, deleteImage);
