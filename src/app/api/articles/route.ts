import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { articleCreateSchema, firstIssue } from "@/lib/validation";
import { articleInsertRow, toArticleViews, type ArticleInput } from "@/lib/view";

export const dynamic = "force-dynamic";

const tagMatches = (tag: string) => sql`${articles.tags} @> ARRAY[${tag}]::text[]`;

async function uniqueSlug(baseSlug: string): Promise<string> {
  const base = baseSlug || "delta-updates-story";
  const [collision] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, base))
    .limit(1);
  if (!collision) return base;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `${base}-${Date.now().toString(36)}${attempt ? attempt : ""}`;
    const [taken] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, candidate))
      .limit(1);
    if (!taken) return candidate;
  }

  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(request: Request) {
  try {
    const authed = await isAuthenticated();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const lga = searchParams.get("lga");
    const search = searchParams.get("search");
    const isBreaking = searchParams.get("breaking");
    const isFeatured = searchParams.get("featured");
    const parsedLimit = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50;

    const conditions = [];

    // Only the newsroom may see drafts; the public feed is published-only.
    if (!authed) {
      conditions.push(eq(articles.status, "published"));
    }

    if (category && category !== "All" && category !== "All desks") {
      conditions.push(eq(articles.category, category));
    }

    if (lga && lga !== "All") {
      conditions.push(tagMatches(`LGA:${lga}`));
    }

    if (isBreaking === "true") {
      conditions.push(tagMatches("Breaking"));
    }

    if (isFeatured === "true") {
      conditions.push(eq(articles.featured, true));
    }

    if (search) {
      const safeSearch = search.slice(0, 100);
      const pattern = `%${safeSearch}%`;
      conditions.push(
        or(
          ilike(articles.title, pattern),
          ilike(articles.dek, pattern),
          sql`CAST(${articles.body} AS text) ILIKE ${pattern}`,
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(articles)
      .where(whereClause)
      .orderBy(desc(articles.publishedAtTs), desc(articles.createdAt))
      .limit(limit);

    return NextResponse.json(toArticleViews(data));
  } catch (error: unknown) {
    return serverError("GET /api/articles", error);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const parsed = articleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const input = parsed.data as ArticleInput;
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120)
      .replace(/-+$/, "");

    const [newArticle] = await db
      .insert(articles)
      .values(articleInsertRow(input, await uniqueSlug(baseSlug)))
      .returning();

    return NextResponse.json(toArticleViews([newArticle])[0], { status: 201 });
  } catch (error: unknown) {
    return serverError("POST /api/articles", error);
  }
}
