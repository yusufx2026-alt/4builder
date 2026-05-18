import { Router, type IRouter } from "express";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { providersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/providers/stats", async (_req, res): Promise<void> => {
  const all = await db.select().from(providersTable).where(eq(providersTable.isActive, true));
  const breakdown = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.governorate] = (acc[p.governorate] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    totalContractors: all.filter((p) => p.type === "contractor").length,
    totalCraftsmen: all.filter((p) => p.type === "craftsman").length,
    totalMachinery: all.filter((p) => p.type === "machinery").length,
    totalActive: all.length,
    governorateBreakdown: Object.entries(breakdown).map(([governorate, count]) => ({ governorate, count })),
  });
});

router.get("/providers", async (req, res): Promise<void> => {
  const { type, governorate, neighborhood, sort, search } = req.query as {
    type?: string;
    governorate?: string;
    neighborhood?: string;
    sort?: string;
    search?: string;
  };

  let query = db.select().from(providersTable).$dynamic();

  const conditions = [eq(providersTable.isActive, true)];
  if (type && ["contractor", "craftsman", "machinery"].includes(type)) {
    conditions.push(eq(providersTable.type, type as "contractor" | "craftsman" | "machinery"));
  }
  if (governorate) conditions.push(eq(providersTable.governorate, governorate));
  if (neighborhood) conditions.push(eq(providersTable.neighborhood, neighborhood));
  if (search) conditions.push(ilike(providersTable.name, `%${search}%`));

  query = query.where(and(...conditions));

  if (sort === "top_rated") {
    query = query.orderBy(desc(providersTable.avgRating));
  } else if (sort === "most_experienced") {
    query = query.orderBy(providersTable.createdAt);
  } else {
    query = query.orderBy(desc(providersTable.subscriptionPlan), desc(providersTable.avgRating));
  }

  const providers = await query.limit(100);
  res.json({ providers, total: providers.length });
});

router.post("/providers", requireAuth, async (req, res): Promise<void> => {
  const { type, name, description, governorate, neighborhood, phone, specialties, portfolioImages, machinerySpecs, craftDetails, contractorDetails } = req.body as {
    type?: string;
    name?: string;
    description?: string;
    governorate?: string;
    neighborhood?: string;
    phone?: string;
    specialties?: string[];
    portfolioImages?: string[];
    machinerySpecs?: object;
    craftDetails?: object;
    contractorDetails?: object;
  };

  if (!type || !name || !governorate || !phone) {
    res.status(400).json({ error: "type, name, governorate, phone are required" });
    return;
  }

  const [provider] = await db
    .insert(providersTable)
    .values({
      userId: req.user!.userId,
      type: type as "contractor" | "craftsman" | "machinery",
      name,
      description: description ?? null,
      governorate,
      neighborhood: neighborhood ?? null,
      phone,
      specialties: specialties ?? [],
      portfolioImages: portfolioImages ?? [],
      machinerySpecs: machinerySpecs ?? null,
      craftDetails: craftDetails ?? null,
      contractorDetails: contractorDetails ?? null,
    })
    .returning();

  res.status(201).json(provider);
});

router.get("/providers/:providerId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;

  const [provider] = await db
    .select()
    .from(providersTable)
    .where(eq(providersTable.id, rawId))
    .limit(1);

  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }

  await db
    .update(providersTable)
    .set({ totalViews: sql`${providersTable.totalViews} + 1` })
    .where(eq(providersTable.id, rawId));

  res.json(provider);
});

router.put("/providers/:providerId", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.providerId) ? req.params.providerId[0] : req.params.providerId;

  const allowed = ["name", "description", "governorate", "neighborhood", "phone", "specialties", "portfolioImages", "machinerySpecs", "craftDetails", "contractorDetails"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const [provider] = await db
    .update(providersTable)
    .set(updates)
    .where(and(eq(providersTable.id, rawId), eq(providersTable.userId, req.user!.userId)))
    .returning();

  if (!provider) {
    res.status(404).json({ error: "Provider not found or not authorized" });
    return;
  }

  res.json(provider);
});

export default router;
