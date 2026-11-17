import { Router } from "express";
import { db, complaintsTable, commentsTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import { generateQrCode } from "../lib/qrcode";
import { detectCategory, detectPriority } from "../lib/ai";
import { z } from "zod";
import path from "path";
import fs from "fs";

const router = Router();

const createComplaintSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().optional(),
  roomNumber: z.string(),
  imageUrl: z.string().optional().nullable(),
});

const updateComplaintSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

const addCommentSchema = z.object({
  message: z.string().min(1),
});

function buildFrontendUrl(complaintId: string): string {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domains) {
    return `https://${domains}/track/${complaintId}`;
  }
  return `/track/${complaintId}`;
}

async function getComplaintWithUser(id: string) {
  const result = await db
    .select({
      complaint: complaintsTable,
      user: usersTable,
    })
    .from(complaintsTable)
    .leftJoin(usersTable, eq(complaintsTable.userId, usersTable.id))
    .where(eq(complaintsTable.id, id))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0].complaint,
    user: result[0].user,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const { status, category, priority, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const isAdmin = req.user!.role === "ADMIN";

  const baseQuery = db
    .select({
      complaint: complaintsTable,
      user: usersTable,
    })
    .from(complaintsTable)
    .leftJoin(usersTable, eq(complaintsTable.userId, usersTable.id));

  const conditions = [];
  if (!isAdmin) conditions.push(eq(complaintsTable.userId, req.user!.id));
  if (status) conditions.push(eq(complaintsTable.status, status as any));
  if (category) conditions.push(eq(complaintsTable.category, category));
  if (priority) conditions.push(eq(complaintsTable.priority, priority as any));

  const query = conditions.length > 0
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  const complaints = await query
    .orderBy(desc(complaintsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const totalResult = await db.select({ count: count() }).from(complaintsTable).where(
    conditions.length > 0 ? and(...conditions) : undefined
  );
  const total = totalResult[0]?.count ?? 0;

  res.json({
    complaints: complaints.map((r) => ({ ...r.complaint, user: r.user })),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createComplaintSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", message: parsed.error.message });
    return;
  }

  const { title, description, roomNumber, imageUrl } = parsed.data;
  let { category } = parsed.data;

  if (!category || category === "auto") {
    category = detectCategory(`${title} ${description}`);
  }

  const priority = detectPriority(`${title} ${description}`);

  const inserted = await db
    .insert(complaintsTable)
    .values({
      title,
      description,
      category,
      priority,
      roomNumber,
      imageUrl: imageUrl ?? null,
      userId: req.user!.id,
    })
    .returning();

  const complaint = inserted[0];

  const trackingUrl = buildFrontendUrl(complaint.id);
  const qrCodeUrl = await generateQrCode(trackingUrl);

  const updated = await db
    .update(complaintsTable)
    .set({ qrCodeUrl })
    .where(eq(complaintsTable.id, complaint.id))
    .returning();

  const fullComplaint = await getComplaintWithUser(complaint.id);
  res.status(201).json(fullComplaint);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const complaint = await getComplaintWithUser(id);

  if (!complaint) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  const commentRows = await db
    .select({
      comment: commentsTable,
      admin: usersTable,
    })
    .from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.adminId, usersTable.id))
    .where(eq(commentsTable.complaintId, id))
    .orderBy(desc(commentsTable.createdAt));

  const comments = commentRows.map((r) => ({ ...r.comment, admin: r.admin }));

  res.json({ ...complaint, comments });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const parsed = updateComplaintSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  if (req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Admin only" });
    return;
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.priority) updateData.priority = parsed.data.priority;

  await db.update(complaintsTable).set(updateData).where(eq(complaintsTable.id, id));

  const updated = await getComplaintWithUser(id);
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

router.post("/:id/comments", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const parsed = addCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }

  const inserted = await db
    .insert(commentsTable)
    .values({
      complaintId: id,
      adminId: req.user!.id,
      message: parsed.data.message,
    })
    .returning();

  const comment = inserted[0];
  const adminUser = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);

  res.status(201).json({ ...comment, admin: adminUser[0] });
});

router.post("/:id/upload-image", requireAuth, async (req, res) => {
  const { imageData, fileName } = req.body;

  if (!imageData) {
    res.status(400).json({ error: "No image data provided" });
    return;
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const ext = fileName?.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

  const imageUrl = `/api/uploads/${filename}`;
  res.json({ imageUrl });
});

export default router;
