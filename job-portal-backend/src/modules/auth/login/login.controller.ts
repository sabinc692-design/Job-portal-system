import type { Request, Response, NextFunction } from "express";
import { loginSchema } from "../auth.validation.js";
import { InvalidCredentialsError, login } from "./login.service.js";

export async function loginController(req: Request, res: Response, next: NextFunction) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "A valid email and password are required." });

  try {
    return res.json(await login(parsed.data.email, parsed.data.password));
  } catch (error) {
    if (error instanceof InvalidCredentialsError) return res.status(401).json({ message: error.message });
    return next(error);
  }
}
