import type { Request, Response } from "express";
import { notificationsRepository } from "./notifications.repository.js";

/**
 * GET /api/notifications
 * Returns up to 30 recent notifications for the authenticated user.
 */
export async function getMyNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const notifications = await notificationsRepository.findByUser(userId);
    const unreadCount = await notificationsRepository.countUnread(userId);

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch notifications." });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export async function markNotificationRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    await notificationsRepository.markRead(id, userId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to mark notification as read." });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications for the current user as read.
 */
export async function markAllNotificationsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await notificationsRepository.markAllRead(userId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to mark all notifications as read." });
  }
}
