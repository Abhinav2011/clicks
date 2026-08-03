import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Protect /admin ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Read valid keys from server environment variables (never exposed to client)
    const validKeys = [
      process.env.ADMIN_SECRET_KEY,
      process.env.ADMIN_PASSKEY,
    ].filter(Boolean) as string[];

    const providedKey = searchParams.get("key");

    if (!providedKey || validKeys.length === 0 || !validKeys.includes(providedKey)) {
      // Return a 404 at the edge — hides the existence of the admin portal
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
