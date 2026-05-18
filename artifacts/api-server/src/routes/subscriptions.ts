import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { subscriptionsTable, providersTable, notificationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const PLANS = [
  {
    id: "silver",
    name: "Silver",
    nameAr: "فضي",
    priceMonthly: 25000,
    features: ["Listed in directory", "Basic profile", "Up to 5 portfolio photos"],
    featuresAr: ["مدرج في الدليل", "ملف شخصي أساسي", "حتى 5 صور للمحفظة"],
  },
  {
    id: "gold",
    name: "Gold",
    nameAr: "ذهبي",
    priceMonthly: 50000,
    features: ["Priority listing", "Full profile", "Unlimited portfolio photos", "Gold badge"],
    featuresAr: ["أولوية في القائمة", "ملف شخصي كامل", "صور محفظة غير محدودة", "شارة ذهبية"],
  },
];

router.get("/subscriptions/plans", (_req, res): void => {
  res.json({ plans: PLANS });
});

router.get("/subscriptions/status", requireAuth, async (req, res): Promise<void> => {
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, req.user!.userId),
        eq(subscriptionsTable.status, "active"),
      ),
    )
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(1);

  if (!sub) {
    res.json({ id: "none", userId: req.user!.userId, plan: "none", status: "none" });
    return;
  }

  if (new Date() > sub.expiresAt) {
    await db
      .update(subscriptionsTable)
      .set({ status: "expired" })
      .where(eq(subscriptionsTable.id, sub.id));
    res.json({ id: sub.id, userId: sub.userId, plan: sub.plan, status: "expired", expiresAt: sub.expiresAt });
    return;
  }

  res.json(sub);
});

router.post("/subscriptions/activate", requireAuth, async (req, res): Promise<void> => {
  const { plan, paymentMethod, transactionId } = req.body as {
    plan?: string;
    paymentMethod?: string;
    transactionId?: string;
  };

  if (!plan || !["silver", "gold"].includes(plan)) {
    res.status(400).json({ error: "Valid plan (silver or gold) required" });
    return;
  }
  if (!paymentMethod || !["fib", "zain_cash", "fastpay"].includes(paymentMethod)) {
    res.status(400).json({ error: "Valid payment method required" });
    return;
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const [sub] = await db
    .insert(subscriptionsTable)
    .values({
      userId: req.user!.userId,
      plan: plan as "silver" | "gold",
      status: "active",
      expiresAt,
      paymentMethod: paymentMethod as "fib" | "zain_cash" | "fastpay",
      transactionId: transactionId ?? null,
    })
    .returning();

  await db
    .update(providersTable)
    .set({
      subscriptionPlan: plan as "silver" | "gold",
      subscriptionExpiresAt: expiresAt,
      isActive: true,
    })
    .where(eq(providersTable.userId, req.user!.userId));

  await db.insert(notificationsTable).values({
    userId: req.user!.userId,
    type: "subscription",
    title: "Subscription Activated",
    message: `Your ${plan} plan is now active until ${expiresAt.toLocaleDateString()}.`,
    isRead: false,
  });

  res.json(sub);
});

export default router;
