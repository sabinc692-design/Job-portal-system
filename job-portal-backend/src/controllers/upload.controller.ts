import type { Request, Response } from "express";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  uploadResumeToCloudinary,
} from "../services/cloudinary.service.js";
import { validateImageBuffer, validateResumeBuffer } from "../middlewares/upload.middleware.js";
import { UserRole } from "../generated/prisma/client.js";

// Controlled Cloudinary folder mapping
const FOLDER_MAP: Record<string, string> = {
  profiles: "job-portal/profiles",
  profile: "job-portal/profiles",
  companies: "job-portal/companies",
  company: "job-portal/companies",
  jobs: "job-portal/jobs",
  job: "job-portal/jobs",
  resumes: "job-portal/resumes",
  resume: "job-portal/resumes",
};

export async function uploadResume(req: Request, res: Response) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: "No resume file provided." });
    }
    if (!validateResumeBuffer(req.file.buffer, req.file.originalname)) {
      return res.status(400).json({ success: false, message: "The file content does not match a valid PDF, DOC, or DOCX document." });
    }

    const result = await uploadResumeToCloudinary(req.file.buffer, FOLDER_MAP.resumes, req.file.originalname);
    return res.status(200).json({
      success: true,
      data: { url: result.url, publicId: result.publicId, format: result.format, bytes: result.bytes, fileName: req.file.originalname },
    });
  } catch (error: any) {
    console.error("[UploadController] Resume upload failure:", error?.message || error);
    return res.status(500).json({ success: false, message: "Resume upload failed." });
  }
}

/**
 * Controller to handle image upload to Cloudinary.
 * Validates file existence, magic bytes, controlled folder, and role permissions.
 */
export async function uploadImage(req: Request, res: Response) {
  try {
    // 1. Verify file was provided by Multer
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please attach an image file with key 'image'.",
      });
    }

    // 2. Validate actual image content (magic numbers / signatures)
    const magicCheck = validateImageBuffer(req.file.buffer);
    if (!magicCheck.valid) {
      return res.status(400).json({
        success: false,
        message: magicCheck.error || "The uploaded file is not a valid image.",
      });
    }

    // 3. Resolve controlled Cloudinary folder
    const rawCategory = (
      req.body.category ||
      req.body.folder ||
      req.query.category ||
      req.query.folder ||
      "profiles"
    )
      .toString()
      .toLowerCase()
      .trim();

    const targetFolder = FOLDER_MAP[rawCategory];
    if (!targetFolder) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid upload category. Allowed categories are 'profiles', 'companies', or 'jobs'.",
      });
    }
    if (targetFolder === FOLDER_MAP.resumes) {
      return res.status(400).json({
        success: false,
        message: "Resume documents must be uploaded through the resume upload route.",
      });
    }

    // 4. Role-based authorization for folder categories
    const userRole = req.user?.role;
    if (
      (targetFolder === "job-portal/companies" || targetFolder === "job-portal/jobs") &&
      userRole === UserRole.JOB_SEEKER
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Job seekers are not authorized to upload assets to company or job listings.",
      });
    }

    // 5. Stream upload to Cloudinary
    const result = await uploadImageToCloudinary(req.file.buffer, targetFolder);

    // 6. Return consistent, clean response without exposing sensitive backend details
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error: any) {
    // Log internal error for server monitoring while keeping client response clean
    console.error("[UploadController] Cloudinary upload failure:", error?.message || error);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
}

/**
 * Controller to handle image deletion from Cloudinary.
 * Ensures users can only delete assets within the job-portal hierarchy.
 */
export async function deleteImage(req: Request, res: Response) {
  try {
    const publicId =
      req.body.publicId ||
      req.query.publicId ||
      (req.params as any).publicId;

    if (!publicId || typeof publicId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Public ID is required to delete an image.",
      });
    }

    // Security: Only allow deleting assets residing within the controlled 'job-portal/' folder
    if (!publicId.startsWith("job-portal/")) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized deletion path. Only job-portal assets can be removed.",
      });
    }

    // Role check: If job seeker attempts to delete company or jobs assets, restrict
    const userRole = req.user?.role;
    if (
      (publicId.startsWith("job-portal/companies") || publicId.startsWith("job-portal/jobs")) &&
      userRole === UserRole.JOB_SEEKER
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Job seekers cannot delete company or job assets.",
      });
    }

    const deleteResult = await deleteImageFromCloudinary(publicId);

    if (!deleteResult.success && deleteResult.result !== "not found") {
      return res.status(500).json({
        success: false,
        message: "Failed to delete image from Cloudinary.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: {
        publicId,
        result: deleteResult.result,
      },
    });
  } catch (error: any) {
    console.error("[UploadController] Cloudinary deletion failure:", error?.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete image.",
    });
  }
}
