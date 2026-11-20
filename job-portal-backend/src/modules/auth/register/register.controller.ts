import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../auth.validation.js";
import { AuthConflictError, register } from "./register.service.js";

export async function registerController(req: Request, res: Response, next: NextFunction) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid registration details.", errors: parsed.error.flatten().fieldErrors });
  }

  try {
    const result = await register(parsed.data);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof AuthConflictError) return res.status(409).json({ message: error.message });
    return next(error);
  }
}
