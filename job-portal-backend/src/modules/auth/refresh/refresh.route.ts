import { Router } from "express";
import { refreshController } from "./refresh.controller.js";

export const refreshRouter = Router();
refreshRouter.post("/", refreshController);
