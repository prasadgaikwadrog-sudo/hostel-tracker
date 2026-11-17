import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const complaintStatusEnum = pgEnum("complaint_status", ["PENDING", "IN_PROGRESS", "RESOLVED"]);
export const complaintPriorityEnum = pgEnum("complaint_priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const complaintsTable = pgTable("complaints", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: complaintStatusEnum("status").notNull().default("PENDING"),
  priority: complaintPriorityEnum("priority").notNull().default("LOW"),
  roomNumber: text("room_number").notNull(),
  imageUrl: text("image_url"),
  qrCodeUrl: text("qr_code_url"),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertComplaintSchema = createInsertSchema(complaintsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaintsTable.$inferSelect;
