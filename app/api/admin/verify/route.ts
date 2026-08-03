import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { passkey } = (await request.json()) as { passkey: string };

    const validPasskeys = [
      process.env.ADMIN_PASSKEY,
      process.env.ADMIN_SECRET_KEY,
    ].filter(Boolean) as string[];

    if (!passkey || validPasskeys.length === 0 || !validPasskeys.includes(passkey)) {
      return Response.json(
        { valid: false, error: "Invalid admin passkey." },
        { status: 401 }
      );
    }

    return Response.json({ valid: true });
  } catch {
    return Response.json({ valid: false, error: "Verification failed." }, { status: 400 });
  }
}
