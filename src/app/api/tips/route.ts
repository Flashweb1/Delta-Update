import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsTips } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { firstIssue, tipSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const list = await db
      .select()
      .from(newsTips)
      .orderBy(desc(newsTips.createdAt));
    return NextResponse.json(list);
  } catch (error: unknown) {
    return serverError("GET /api/tips", error);
  }
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(clientKey(request, "tips"), 5, 10 * 60 * 1000);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter);
    }

    const body = await request.json().catch(() => null);
    const parsed = tipSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const { headline, description, location, reporterContact, isAnonymous = false } = parsed.data;

    const [tip] = await db
      .insert(newsTips)
      .values({
        headline,
        description,
        location,
        reporterContact: reporterContact || null,
        isAnonymous,
      })
      .returning();

    return NextResponse.json(tip, { status: 201 });
  } catch (error: unknown) {
    return serverError("POST /api/tips", error);
  }
}
