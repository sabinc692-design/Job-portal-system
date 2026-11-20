import type { Request, Response } from "express";

export async function logoutController(req: Request, res: Response) {
  // Clear any auth cookies if present
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}
