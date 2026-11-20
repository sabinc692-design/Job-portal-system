import { prisma } from "../../lib/prisma.js";
import { randomUUID } from "node:crypto";

export type NotificationType = "APPLICATION_STATUS_CHANGE" | "NEW_APPLICATION";

type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  meta: string | null;
  read: boolean;
  createdAt: Date;
};

export const notificationsRepository = {
  /**
   * Create a notification for a specific user.
   */
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    meta?: Record<string, string>;
  }) {
    const id = `ntf_${randomUUID()}`;
    const meta = data.meta ? JSON.stringify(data.meta) : null;
    await prisma.$executeRaw`INSERT INTO "notifications" ("id", "userId", "title", "message", "type", "meta") VALUES (${id}, ${data.userId}, ${data.title}, ${data.message}, ${data.type}, ${meta})`;
    return { id, ...data, meta, read: false, createdAt: new Date() };
  },

  /**
   * Get all notifications for a user, newest first.
   */
  async findByUser(userId: string, limit = 30) {
    return prisma.$queryRaw<NotificationRecord[]>`SELECT "id", "userId", "title", "message", "type", "meta", "read", "createdAt" FROM "notifications" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC LIMIT ${limit}`;
  },

  /**
   * Count unread notifications for a user.
   */
  async countUnread(userId: string) {
    const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) AS "count" FROM "notifications" WHERE "userId" = ${userId} AND "read" = false`;
    return Number(rows[0]?.count ?? 0);
  },

  /**
   * Mark a single notification as read.
   */
  async markRead(id: string, userId: string) {
    return prisma.$executeRaw`UPDATE "notifications" SET "read" = true WHERE "id" = ${id} AND "userId" = ${userId}`;
  },

  /**
   * Mark ALL unread notifications for a user as read.
   */
  async markAllRead(userId: string) {
    return prisma.$executeRaw`UPDATE "notifications" SET "read" = true WHERE "userId" = ${userId} AND "read" = false`;
  },
};
