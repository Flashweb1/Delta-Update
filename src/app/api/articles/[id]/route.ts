import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { articleUpdateSchema, firstIssue } from "@/lib/validation";
import { articleUpdateRow, toArticleView, type ArticleInput } from "@/lib/view";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function notFound() {
  return NextResponse.json({ error: "Article not found" }, { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const condition = UUID_PATTERN.test(id) ? eq(articles.id, id) : eq(articles.slug, id);

    const [article] = await db.select().from(articles).where(condition).limit(1);
    if (!article) return notFound();

    // Drafts are visible to the newsroom only.
    if (article.status !== "published" && !(await isAuthenticated())) {
      return notFound();
    }

    await db
      .update(articles)
      .set({ views: sql`${articles.views} + 1`, updatedAt: new Date() })
      .where(eq(articles.id, article.id));

    return NextResponse.json(toArticleView({ ...article, views: article.views + 1 }));
  } catch (error: unknown) {
    return serverError("GET /api/articles/[id]", error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const { id } = await params;
    if (!UUID_PATTERN.test(id)) return badRequest("Invalid article id");

    const body = await request.json().catch(() => null);
    const parsed = articleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    if (Object.keys(parsed.data).length === 0) {
      return badRequest("No fields provided to update");
    }

    const [existing] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (!existing) return notFound();

    const patch = articleUpdateRow(parsed.data as ArticleInput, existing.tags);
    if (Object.keys(patch).length === 0) {
      return badRequest("No fields provided to update");
    }

    const [updated] = await db
      .update(articles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();

    if (!updated) return notFound();

    return NextResponse.json(toArticleView(updated));
  } catch (error: unknown) {
    return serverError("PUT /api/articles/[id]", error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const { id } = await params;
    if (!UUID_PATTERN.test(id)) return badRequest("Invalid article id");

    await db.delete(articles).where(eq(articles.id, id));

    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch (error: unknown) {
    return serverError("DELETE /api/articles/[id]", error);
  }
}
