import { cloudinary } from "../config/cloudinary.js";
import { Readable } from "node:stream";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

export interface CloudinaryResumeUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export interface CloudinaryDeleteResult {
  success: boolean;
  result: string;
}

/**
 * Uploads an image buffer to Cloudinary using an upload stream.
 *
 * @param buffer - File content buffer
 * @param folder - Destination folder (e.g. 'job-portal/profiles')
 * @returns CloudinaryUploadResult with url, publicId, format, width, height
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new Error(
              error?.message || "Failed to upload image to Cloudinary: empty response."
            )
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Uploads a resume (PDF/DOCX) buffer to Cloudinary using an upload stream.
 * Uses resource_type 'raw' so non-image files are accepted.
 *
 * @param buffer - File content buffer
 * @param folder - Destination folder (e.g. 'job-portal/resumes')
 * @param originalName - Original filename to preserve extension
 * @returns CloudinaryResumeUploadResult with url, publicId, format, bytes
 */
export async function uploadResumeToCloudinary(
  buffer: Buffer,
  folder: string,
  originalName: string
): Promise<CloudinaryResumeUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        public_id: `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new Error(
              error?.message || "Failed to upload resume to Cloudinary: empty response."
            )
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format || "raw",
          bytes: result.bytes,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Deletes a raw/resume file from Cloudinary by its public ID.
 *
 * @param publicId - Cloudinary public ID
 * @returns CloudinaryDeleteResult
 */
export async function deleteResumeFromCloudinary(
  publicId: string
): Promise<CloudinaryDeleteResult> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });

    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error: any) {
    throw new Error(
      error?.message || "Failed to delete resume from Cloudinary."
    );
  }
}

/** Deletes an image asset from Cloudinary by its public ID. */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<CloudinaryDeleteResult> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    return { success: result.result === "ok", result: result.result };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to delete image from Cloudinary.");
  }
}
