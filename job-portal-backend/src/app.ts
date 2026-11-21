/// <reference path="./types/multer.d.ts" />
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import { loginRouter } from "./modules/auth/login/login.route.js";
import { registerRouter } from "./modules/auth/register/register.route.js";
import { refreshRouter } from "./modules/auth/refresh/refresh.route.js";
import { logoutRouter } from "./modules/auth/logout/logout.route.js";
import { jobsRouter } from "./modules/jobs/jobs.route.js";
import { applicationsRouter } from "./modules/applications/applications.route.js";
import { profileRouter } from "./modules/profile/profile.route.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.route.js";
import { adminRouter } from "./modules/admin/admin.route.js";
import { recruiterRouter } from "./modules/recruiter/recruiter.route.js";
import { candidateRouter } from "./modules/candidate/candidate.route.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.route.js";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Auth routes
app.use("/api/auth/login", loginRouter);
app.use("/api/auth/register", registerRouter);
app.use("/api/auth/refresh", refreshRouter);
app.use("/api/auth/logout", logoutRouter);

// Recruiter routes
app.use("/api/recruiter", recruiterRouter);

// Candidate routes
app.use("/api/candidate", candidateRouter);

// Resource routes
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/admin", adminRouter);

// Upload routes
app.use("/api/upload", uploadRouter);
app.use("/api/notifications", notificationsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Global error-handling middleware (Multer and application errors)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5 MB limit.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    const statusCode = err.status || err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "An unexpected error occurred.",
    });
  }
});
