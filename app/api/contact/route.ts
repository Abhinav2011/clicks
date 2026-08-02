import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

// ── Simple in-memory rate limiter ──
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, honeypot } = body;

    // ── Honeypot check ──
    if (honeypot) {
      // Silently accept to not tip off bots
      return Response.json({ success: true });
    }

    // ── Validation ──
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return Response.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // ── Log to Supabase (if configured) ──
    if (isSupabaseConfigured()) {
      try {
        // Use service role for INSERT into contact_messages
        const { getServiceClient } = await import("@/lib/supabase");
        const admin = getServiceClient();
        await admin.from("contact_messages").insert({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          ip_address: ip,
        });
      } catch (dbErr) {
        console.error("Failed to log contact message:", dbErr);
        // Don't fail the request — email is primary delivery
      }
    }

    // ── Send email via Resend (if API key configured) ──
    const resendKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (resendKey && contactEmail) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Clicks Contact <onboarding@resend.dev>",
          to: contactEmail,
          subject: `[Clicks] ${subject.trim()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <h2 style="color: #1C1C1C;">New message from Clicks</h2>
              <p><strong>From:</strong> ${name.trim()} (${email.trim()})</p>
              <p><strong>Subject:</strong> ${subject.trim()}</p>
              <hr style="border: 1px solid #E5E0D8; margin: 16px 0;" />
              <p style="white-space: pre-wrap; color: #3A3A3A;">${message.trim()}</p>
            </div>
          `,
          reply_to: email.trim(),
        }),
      });

      if (!emailRes.ok) {
        console.error("Resend error:", await emailRes.text());
      }
    } else {
      console.log("Contact form submission (no email service configured):", {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim().substring(0, 100) + "…",
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return Response.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
