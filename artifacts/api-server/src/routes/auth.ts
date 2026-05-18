import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable, otpCodesTable, providersTable } from "@workspace/db";
import { sendOtp } from "../lib/twilio";
import { signToken } from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/auth/send-otp", async (req, res): Promise<void> => {
  const { phone } = req.body as { phone?: string };
  if (!phone || !/^\+964\d{10}$/.test(phone)) {
    res.status(400).json({ error: "Valid Iraqi phone number required (e.g. +9647700000000)" });
    return;
  }

  await db.delete(otpCodesTable).where(eq(otpCodesTable.phone, phone));

  const otp = await sendOtp(phone);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(otpCodesTable).values({ phone, code: otp, expiresAt });

  res.json({ success: true, expiresIn: 300 });
});

router.post("/auth/verify-otp", async (req, res): Promise<void> => {
  const { phone, otp, role } = req.body as { phone?: string; otp?: string; role?: string };

  if (!phone || !otp) {
    res.status(400).json({ error: "Phone and OTP are required" });
    return;
  }

  const [record] = await db
    .select()
    .from(otpCodesTable)
    .where(
      and(
        eq(otpCodesTable.phone, phone),
        eq(otpCodesTable.code, otp),
        eq(otpCodesTable.used, false),
        gt(otpCodesTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!record) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, record.id));

  let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  const isNewUser = !user;

  if (!user) {
    const userRole = role === "provider" ? "provider" : "client";
    [user] = await db
      .insert(usersTable)
      .values({ phone, role: userRole, isVerified: true })
      .returning();
  }

  let providerProfile = null;
  if (user.role === "provider") {
    const [p] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.userId, user.id))
      .limit(1);
    providerProfile = p ?? null;
  }

  const token = signToken({ userId: user.id, phone: user.phone, role: user.role });

  res.json({
    token,
    user: { ...user, provider: providerProfile },
    isNewUser,
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  let providerProfile = null;
  if (user.role === "provider") {
    const [p] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.userId, user.id))
      .limit(1);
    providerProfile = p ?? null;
  }

  res.json({ ...user, provider: providerProfile });
});

export default router;
