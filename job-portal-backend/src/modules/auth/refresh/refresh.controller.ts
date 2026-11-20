import type { Request, Response, NextFunction } from "express";
import { refreshSchema } from "../auth.validation.js";
import { InvalidRefreshTokenError } from "../token.service.js";
import { refreshSession } from "../login/login.service.js";

export async function refreshController(req: Request, res: Response, next: NextFunction) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "A refresh token is required." });

  try {
    return res.json(await refreshSession(parsed.data.refreshToken));
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      return res.status(401).json({ message: error.message });
    }
    return next(error);
  }
}
