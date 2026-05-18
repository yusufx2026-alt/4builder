import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  plan: text("plan", { enum: ["silver", "gold"] }).notNull(),
  status: text("status", { enum: ["active", "expired"] }).notNull().default("active"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  paymentMethod: text("payment_method", { enum: ["fib", "zain_cash", "fastpay"] }),
  transactionId: text("transaction_id"),
  activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptionsTable.$inferSelect;
