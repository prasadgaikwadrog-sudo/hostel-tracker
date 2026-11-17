import { Router } from "express";
import { db, usersTable, otpsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import { sendOtpEmail } from "../lib/email";
import { z } from "zod";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

router.post("/send-otp", async (req, res) => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  const { email } = parsed.data;

  const existing = await db
    .select()
    .from(otpsTable)
    .where(and(eq(otpsTable.email, email), gt(otpsTable.expiresAt, new Date())))
    .limit(1);

  if (existing[0] && existing[0].createdAt > new Date(Date.now() - 60_000)) {
    res.status(429).json({ error: "Please wait before requesting a new OTP" });
    return;
  }

  await db.delete(otpsTable).where(eq(otpsTable.email, email));

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(otpsTable).values({ email, otp, expiresAt });

  await sendOtpEmail(email, otp);

  res.json({ message: "OTP sent to email" });
});

router.post("/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, otp } = parsed.data;

  const otpRecord = await db
    .select()
    .from(otpsTable)
    .where(and(eq(otpsTable.email, email), gt(otpsTable.expiresAt, new Date())))
    .limit(1);

  if (!otpRecord[0]) {
    res.status(400).json({ error: "OTP expired or not found" });
    return;
  }

  if (otpRecord[0].attempts >= 5) {
    await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord[0].id));
    res.status(400).json({ error: "Too many failed attempts" });
    return;
  }

  if (otpRecord[0].otp !== otp) {
    await db
      .update(otpsTable)
      .set({ attempts: otpRecord[0].attempts + 1 })
      .where(eq(otpsTable.id, otpRecord[0].id));
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }

  await db.delete(otpsTable).where(eq(otpsTable.id, otpRecord[0].id));

  let user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user[0]) {
    const name = email.split("@")[0];
    const isAdmin = email.endsWith("@admin.hostel") || email === "admin@hostel.edu";
    const inserted = await db
      .insert(usersTable)
      .values({ email, name, role: isAdmin ? "ADMIN" : "STUDENT" })
      .returning();
    user = inserted;
  }

  const token = signToken({ userId: user[0].id, email: user[0].email, role: user[0].role });

  res.json({ token, user: user[0] });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user[0]) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user[0]);
});

export default router;
