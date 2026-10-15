import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { firstIssue, subscriberSchema } from "@/lib/validation";
import { toSubscriberView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const list = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.subscribedAt));

    return NextResponse.json(list.map(toSubscriberView));
  } catch (error: unknown) {
    return serverError("GET /api/subscribers", error);
  }
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(clientKey(request, "subscribers"), 6, 10 * 60 * 1000);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter);
    }

    const body = await request.json().catch(() => null);
    const parsed = subscriberSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const [sub] = await db
      .insert(newsletterSubscribers)
      .values({ email: normalizedEmail, active: true })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set: { active: true },
      })
      .returning();

    return NextResponse.json(toSubscriberView(sub), { status: 201 });
  } catch (error: unknown) {
    return serverError("POST /api/subscribers", error);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return badRequest("Email is required");
    }

    await db
      .update(newsletterSubscribers)
      .set({ active: false })
      .where(eq(newsletterSubscribers.email, email.toLowerCase()));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return serverError("DELETE /api/subscribers", error);
  }
}
