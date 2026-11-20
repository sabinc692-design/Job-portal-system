import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notifications.controller.js";

export const notificationsRouter = Router();

// GET /api/notifications — fetch all notifications + unread count for the current user
notificationsRouter.get("/", authenticate, getMyNotifications);

// PATCH /api/notifications/read-all — mark all as read (must be before /:id/read)
notificationsRouter.patch("/read-all", authenticate, markAllNotificationsRead);

// PATCH /api/notifications/:id/read — mark single notification as read
notificationsRouter.patch("/:id/read", authenticate, markNotificationRead);
