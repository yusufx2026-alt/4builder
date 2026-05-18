import { pgTable, text, timestamp, boolean, uuid, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const providersTable = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  type: text("type", { enum: ["contractor", "craftsman", "machinery"] }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  governorate: text("governorate").notNull(),
  neighborhood: text("neighborhood"),
  phone: text("phone").notNull(),
  specialties: text("specialties").array().notNull().default([]),
  portfolioImages: text("portfolio_images").array().notNull().default([]),
  avgRating: real("avg_rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  subscriptionPlan: text("subscription_plan", { enum: ["none", "silver", "gold"] }).notNull().default("none"),
  subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),
  machinerySpecs: jsonb("machinery_specs"),
  craftDetails: jsonb("craft_details"),
  contractorDetails: jsonb("contractor_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  avgRating: true,
  totalReviews: true,
  totalViews: true,
});
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
