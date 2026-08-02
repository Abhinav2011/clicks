import { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

// ── Simple in-memory rate limiter ──
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per window

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

    // ── 1. Log to Supabase (if configured) ──
    if (isSupabaseConfigured()) {
      try {
        const { getServiceClient } = await import("@/lib/supabase");
        const admin = getServiceClient();
        const { error: dbError } = await admin.from("contact_messages").insert({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          ip_address: ip,
        });

        if (dbError) {
          console.error("Supabase insert error in contact_messages:", dbError);
        } else {
          console.log("Logged contact message into Supabase successfully.");
        }
      } catch (dbErr) {
        console.error("Failed to log contact message to Supabase:", dbErr);
      }
    }

    // ── 2. Send email via Resend ──
    const resendKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || process.env.CONTACT_TO_EMAIL;

    if (!resendKey) {
      console.warn("RESEND_API_KEY is missing in environment variables.");
      return Response.json(
        { error: "Email service not configured (RESEND_API_KEY missing)." },
        { status: 500 }
      );
    }

    if (!contactEmail) {
      console.warn("CONTACT_EMAIL is missing in environment variables.");
      return Response.json(
        { error: "Destination email not configured (CONTACT_EMAIL missing)." },
        { status: 500 }
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Still Frames Contact <onboarding@resend.dev>",
        to: [contactEmail],
        subject: `[Still Frames] ${subject.trim()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #171614; background: #FAF8F5;">
            <h2 style="color: #171614; font-family: serif; margin-top: 0;">New Message from Still Frames</h2>
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Email:</strong> ${email.trim()}</p>
            <p><strong>Subject:</strong> ${subject.trim()}</p>
            <hr style="border: none; border-top: 1px solid #D6D0C8; margin: 16px 0;" />
            <p style="white-space: pre-wrap; color: #2E2B28; line-height: 1.6;">${message.trim()}</p>
          </div>
        `,
        reply_to: email.trim(),
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend API failed:", emailData);
      return Response.json(
        { error: emailData.message || "Failed to deliver email via Resend." },
        { status: 500 }
      );
    }

    console.log("Resend email sent successfully! Message ID:", emailData.id);
    return Response.json({ success: true, id: emailData.id });
  } catch (err) {
    console.error("Contact API error:", err);
    return Response.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
