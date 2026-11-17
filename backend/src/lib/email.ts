import nodemailer from "nodemailer";
import { logger } from "./logger";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal_user",
        pass: "ethereal_pass",
      },
    });
    logger.warn("No SMTP config found — using development mock email");
  }

  return transporter;
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  logger.info({ email, otp }, "Sending OTP email (dev: OTP logged above)");

  if (!process.env.SMTP_HOST) {
    logger.info({ email, otp }, "DEV MODE: OTP for login");
    return;
  }

  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM || "Hostel Issue Tracker <noreply@hosteltracker.app>",
    to: email,
    subject: "Your login OTP - Hostel Issue Tracker",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Hostel Issue Tracker</h2>
        <p>Your one-time password for login is:</p>
        <div style="background: #f0f4ff; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f;">${otp}</span>
        </div>
        <p style="color: #666;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}
