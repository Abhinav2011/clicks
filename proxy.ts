import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Protect /admin ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Read key from server-side env (never exposed to client bundle)
    const validKey =
      process.env.ADMIN_SECRET_KEY ||
      process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ||
      "fuji2026";

    const providedKey = searchParams.get("key");

    if (!providedKey || providedKey !== validKey) {
      // Return a real 404 at the edge — never reveals the admin URL exists
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run this middleware on /admin routes
  matcher: ["/admin/:path*"],
};
