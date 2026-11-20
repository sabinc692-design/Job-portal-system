/// <reference path="../types/multer.d.ts" />
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "node:path";

// Allowed MIME types and extensions for images
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Allowed MIME types and extensions for resumes (PDF / DOCX)
const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_RESUME_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

// 5 MB maximum file size limit for images
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// 10 MB maximum file size limit for resumes
export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB

// Multer memory storage - keeps file in buffer for Cloudinary streaming
const storage = multer.memoryStorage();

// File filter validating MIME type and extension for images
function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile?: boolean) => void
) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mime) || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        "Unsupported file type. Only JPEG, JPG, PNG, and WEBP images are allowed."
      ),
      false
    );
  }

  cb(null, true);
}

// File filter validating MIME type and extension for resumes
function resumeFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile?: boolean) => void
) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_RESUME_MIME_TYPES.has(mime) || !ALLOWED_RESUME_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        "Unsupported file type. Only PDF, DOC, and DOCX resume documents are allowed."
      ),
      false
    );
  }

  cb(null, true);
}

/** Validate PDF, legacy DOC, and DOCX signatures rather than trusting the client MIME type. */
export function validateResumeBuffer(buffer: Buffer, fileName: string): boolean {
  if (!buffer || buffer.length < 8) return false;
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (ext === ".doc") return buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  if (ext === ".docx") return buffer[0] === 0x50 && buffer[1] === 0x4b && [0x03, 0x05, 0x07].includes(buffer[2]) && [0x04, 0x06, 0x08].includes(buffer[3]);
  return false;
}

// Multer instance for image uploads
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Enforce one image per request
  },
  fileFilter: imageFileFilter,
});

// Multer instance for resume uploads (PDF/DOCX, up to 10 MB)
const resumeUpload = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
  },
  fileFilter: resumeFileFilter,
});

/**
 * Validates actual binary content of the buffer using magic numbers.
 * Prevents malformed or disguised files (e.g., .exe or .html renamed to .jpg).
 */
export function validateImageBuffer(buffer: Buffer): {
  valid: boolean;
  format?: "jpeg" | "png" | "webp";
  error?: string;
} {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: "Empty or corrupted file buffer." };
  }

  // JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: "png" };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: "webp" };
  }

  return {
    valid: false,
    error: "File content does not match a valid JPEG, PNG, or WEBP image.",
  };
}

/**
 * Multer middleware wrapper supporting primary field 'image'
 * (with fallback support for 'file' if provided).
 * Handles Multer limits and format errors cleanly.
 */
export function uploadSingleImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Accept 'image' or 'file' (max 1 file total)
  const uploadHandler = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]);

  uploadHandler(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds the 5 MB limit.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message:
              "Only one image can be uploaded per request. Please use the form-data field 'image'.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "Failed to parse upload request.",
      });
    }

    // Attach single file to req.file if uploaded via fields
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files["image"] && files["image"][0]) {
        req.file = files["image"][0];
      } else if (files["file"] && files["file"][0]) {
        req.file = files["file"][0];
      }
    }

    next();
  });
}

/**
 * Multer middleware wrapper for resume uploads (PDF / DOC / DOCX, max 10 MB).
 * Accepts field name 'resume' or 'file'.
 */
export function uploadSingleResume(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uploadHandler = resumeUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]);

  uploadHandler(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Resume file size exceeds the 10 MB limit.",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message: "Only one resume file can be uploaded per request.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "Failed to parse resume upload request.",
      });
    }

    // Attach single file to req.file
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files["resume"] && files["resume"][0]) {
        req.file = files["resume"][0];
      } else if (files["file"] && files["file"][0]) {
        req.file = files["file"][0];
      }
    }

    next();
  });
}
