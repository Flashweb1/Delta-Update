import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  getAuthSecret,
  verifyPassword,
} from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getAuthSecret();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!secret || !expectedPassword) {
    return NextResponse.json(
      { error: "Newsroom sign-in is not configured on the server." },
      { status: 500 },
    );
  }

  const limit = rateLimit(clientKey(request, "login"), 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your newsroom password." }, { status: 400 });
  }

  const valid = await verifyPassword(parsed.data.password, expectedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Newsroom sign-in is not configured on the server." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return response;
}
