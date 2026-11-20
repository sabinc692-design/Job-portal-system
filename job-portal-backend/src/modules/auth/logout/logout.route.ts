import { Router } from "express";
import { logoutController } from "./logout.controller.js";

export const logoutRouter = Router();

logoutRouter.post("/", logoutController);
