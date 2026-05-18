import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.put("/users/profile", requireAuth, async (req, res): Promise<void> => {
  const { name, avatarUrl, governorate, neighborhood } = req.body as {
    name?: string;
    avatarUrl?: string;
    governorate?: string;
    neighborhood?: string;
  };

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (governorate !== undefined) updates.governorate = governorate;
  if (neighborhood !== undefined) updates.neighborhood = neighborhood;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user!.userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

export default router;
