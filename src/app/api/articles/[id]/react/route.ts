import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { firstIssue, reactSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limit = rateLimit(clientKey(request, "react"), 30, 60_000);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter);
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = reactSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const articleId = id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId)) {
      return badRequest("Invalid article id");
    }

    if (parsed.data.type === "like") {
      const [updated] = await db
        .update(articles)
        .set({ likes: sql`${articles.likes} + 1` })
        .where(eq(articles.id, articleId))
        .returning({ likes: articles.likes });
      return NextResponse.json({ success: true, likes: updated?.likes });
    }

    const [updated] = await db
      .update(articles)
      .set({ shares: sql`${articles.shares} + 1` })
      .where(eq(articles.id, articleId))
      .returning({ shares: articles.shares });
    return NextResponse.json({ success: true, shares: updated?.shares });
  } catch (error: unknown) {
    return serverError("POST /api/articles/[id]/react", error);
  }
}
