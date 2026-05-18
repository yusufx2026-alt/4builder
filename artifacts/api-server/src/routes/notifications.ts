import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({ notifications, unreadCount });
});

router.put("/notifications/:notificationId/read", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;

  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, rawId))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(notification);
});

router.delete("/notifications/:notificationId", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;

  await db.delete(notificationsTable).where(eq(notificationsTable.id, rawId));

  res.sendStatus(204);
});

export default router;
