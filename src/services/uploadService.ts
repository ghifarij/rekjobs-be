// src/services/uploadService.ts
import { UploadApiResponse } from "cloudinary";
import { cloudinaryUpload } from "./cloudinary";

/**
 * Upload exactly one Multer file buffer to Cloudinary and return its secure URL.
 */
export async function uploadApplicationFile(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  const result: UploadApiResponse = await cloudinaryUpload(file, folder);
  return result.secure_url;
}
