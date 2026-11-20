import { Router } from "express";
import { loginController } from "./login.controller.js";

export const loginRouter = Router();
loginRouter.post("/", loginController);
