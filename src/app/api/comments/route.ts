import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, comments, siteConfig } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { commentSchema, firstIssue } from "@/lib/validation";
import { toCommentView } from "@/lib/view";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const authed = await isAuthenticated();
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (articleId) {
      if (!UUID_PATTERN.test(articleId)) {
        return badRequest("Invalid article id");
      }

      const conditions = [eq(comments.articleId, articleId)];
      // Readers only ever see approved comments.
      if (!authed) {
        conditions.push(eq(comments.status, "approved"));
      }

      const list = await db
        .select()
        .from(comments)
        .where(and(...conditions))
        .orderBy(desc(comments.createdAt));

      return NextResponse.json(list.map(toCommentView));
    }

    // Full comment feed (moderation view) is newsroom-only.
    if (!authed) {
      return unauthorized();
    }

    const all = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(100);

    return NextResponse.json(all.map(toCommentView));
  } catch (error: unknown) {
    return serverError("GET /api/comments", error);
  }
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(clientKey(request, "comments"), 10, 10 * 60 * 1000);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter);
    }

    const body = await request.json().catch(() => null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const { articleId, authorName, authorEmail, authorLocation, content } = parsed.data;

    const [article] = await db
      .select({ id: articles.id, title: articles.title, status: articles.status })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);
    if (!article) {
      return badRequest("Article not found");
    }

    const [config] = await db
      .select({ requireCommentModeration: siteConfig.requireCommentModeration })
      .from(siteConfig)
      .where(eq(siteConfig.id, 1));

    const status = config?.requireCommentModeration === false ? "approved" : "pending";

    const [comment] = await db
      .insert(comments)
      .values({
        articleId: article.id,
        articleTitle: article.title,
        author: authorName,
        authorEmail: authorEmail.toLowerCase(),
        authorLocation: authorLocation?.trim() || null,
        body: content,
        status,
      })
      .returning();

    return NextResponse.json(toCommentView(comment), { status: 201 });
  } catch (error: unknown) {
    return serverError("POST /api/comments", error);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || !UUID_PATTERN.test(id)) {
      return badRequest("Comment id is required");
    }

    await db.delete(comments).where(eq(comments.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return serverError("DELETE /api/comments", error);
  }
}
