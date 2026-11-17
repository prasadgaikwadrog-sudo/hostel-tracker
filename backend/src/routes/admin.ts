import { Router } from "express";
import { db, complaintsTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql, count, gte, lte } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/dashboard", requireAdmin, async (req, res) => {
  const [totalResult] = await db.select({ count: count() }).from(complaintsTable);
  const [pendingResult] = await db.select({ count: count() }).from(complaintsTable).where(eq(complaintsTable.status, "PENDING"));
  const [inProgressResult] = await db.select({ count: count() }).from(complaintsTable).where(eq(complaintsTable.status, "IN_PROGRESS"));
  const [resolvedResult] = await db.select({ count: count() }).from(complaintsTable).where(eq(complaintsTable.status, "RESOLVED"));
  const [urgentResult] = await db.select({ count: count() }).from(complaintsTable).where(eq(complaintsTable.priority, "URGENT"));

  const categoryRows = await db
    .select({
      category: complaintsTable.category,
      count: count(),
    })
    .from(complaintsTable)
    .groupBy(complaintsTable.category)
    .orderBy(desc(count()));

  const recentRows = await db
    .select({
      complaint: complaintsTable,
      user: usersTable,
    })
    .from(complaintsTable)
    .leftJoin(usersTable, eq(complaintsTable.userId, usersTable.id))
    .orderBy(desc(complaintsTable.createdAt))
    .limit(10);

  const total = totalResult?.count ?? 0;
  const resolved = resolvedResult?.count ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  res.json({
    totalComplaints: total,
    pendingComplaints: pendingResult?.count ?? 0,
    inProgressComplaints: inProgressResult?.count ?? 0,
    resolvedComplaints: resolved,
    urgentComplaints: urgentResult?.count ?? 0,
    byCategory: categoryRows,
    recentComplaints: recentRows.map((r) => ({ ...r.complaint, user: r.user })),
    resolutionRate,
  });
});

router.get("/complaints", requireAdmin, async (req, res) => {
  const { status, category, priority, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (status) conditions.push(eq(complaintsTable.status, status as any));
  if (category) conditions.push(eq(complaintsTable.category, category));
  if (priority) conditions.push(eq(complaintsTable.priority, priority as any));
  if (search) {
    conditions.push(sql`(${complaintsTable.title} ILIKE ${"%" + search + "%"} OR ${complaintsTable.description} ILIKE ${"%" + search + "%"})`);
  }

  const baseQuery = db
    .select({ complaint: complaintsTable, user: usersTable })
    .from(complaintsTable)
    .leftJoin(usersTable, eq(complaintsTable.userId, usersTable.id));

  const filtered = conditions.length > 0
    ? baseQuery.where(and(...conditions))
    : baseQuery;

  const rows = await filtered
    .orderBy(desc(complaintsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const [totalResult] = await db.select({ count: count() }).from(complaintsTable).where(
    conditions.length > 0 ? and(...conditions) : undefined
  );

  const total = totalResult?.count ?? 0;

  res.json({
    complaints: rows.map((r) => ({ ...r.complaint, user: r.user })),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get("/weekly-report", requireAdmin, async (req, res) => {
  const weekEnd = new Date();
  const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekComplaints = await db
    .select()
    .from(complaintsTable)
    .where(and(gte(complaintsTable.createdAt, weekStart), lte(complaintsTable.createdAt, weekEnd)));

  const totalSubmitted = weekComplaints.length;
  const totalResolved = weekComplaints.filter((c) => c.status === "RESOLVED").length;

  const categoryMap: Record<string, { count: number; resolved: number }> = {};
  const dayMap: Record<string, number> = {};

  for (const c of weekComplaints) {
    if (!categoryMap[c.category]) categoryMap[c.category] = { count: 0, resolved: 0 };
    categoryMap[c.category].count++;
    if (c.status === "RESOLVED") categoryMap[c.category].resolved++;

    const day = c.createdAt.toISOString().split("T")[0];
    dayMap[day] = (dayMap[day] || 0) + 1;
  }

  const byCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    count: data.count,
    resolved: data.resolved,
  }));

  const byDay = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(weekEnd.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    byDay.push({ date: key, count: dayMap[key] || 0 });
  }

  const topIssues = weekComplaints
    .filter((c) => c.priority === "URGENT" || c.priority === "HIGH")
    .slice(0, 5)
    .map((c) => ({ category: c.category, title: c.title, priority: c.priority }));

  res.json({
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalSubmitted,
    totalResolved,
    avgResolutionHours: totalResolved > 0 ? 24 : 0,
    byCategory,
    byDay,
    topIssues,
  });
});

export default router;
