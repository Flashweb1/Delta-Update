import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";
import { timingSafeEqual } from "@/lib/auth";
import { isAuthenticated } from "@/lib/guard";
import { serverError, unauthorized } from "@/lib/http";

export const dynamic = "force-dynamic";

async function isAuthorized(request: Request): Promise<boolean> {
  if (await isAuthenticated()) return true;
  const expected = process.env.SEED_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get("x-seed-token");
  return Boolean(provided) && timingSafeEqual(provided as string, expected);
}

async function runSeed(request: Request) {
  if (!(await isAuthorized(request))) {
    return unauthorized();
  }
  const result = await seedDatabase();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    return await runSeed(request);
  } catch (error: unknown) {
    return serverError("POST /api/seed", error);
  }
}

export async function GET(request: Request) {
  try {
    return await runSeed(request);
  } catch (error: unknown) {
    return serverError("GET /api/seed", error);
  }
}
