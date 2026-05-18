import { Router, type IRouter } from "express";
import { eq, desc, avg, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { reviewsTable, providersTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/providers/:providerId/reviews", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.providerId, rawId))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(50);

  const [agg] = await db
    .select({ avgRating: avg(reviewsTable.rating), total: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.providerId, rawId));

  res.json({
    reviews,
    avgRating: parseFloat(agg?.avgRating ?? "0"),
    total: Number(agg?.total ?? 0),
  });
});

router.post("/providers/:providerId/reviews", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;
  const { rating, text } = req.body as { rating?: number; text?: string };

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be 1-5" });
    return;
  }

  const [user] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);

  const [review] = await db
    .insert(reviewsTable)
    .values({
      providerId: rawId,
      clientId: req.user!.userId,
      clientName: user?.name ?? "Anonymous",
      rating,
      text: text ?? null,
    })
    .returning();

  const [agg] = await db
    .select({ avgRating: avg(reviewsTable.rating), total: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.providerId, rawId));

  await db
    .update(providersTable)
    .set({
      avgRating: parseFloat(agg?.avgRating ?? "0"),
      totalReviews: Number(agg?.total ?? 0),
    })
    .where(eq(providersTable.id, rawId));

  res.status(201).json(review);
});

export default router;
