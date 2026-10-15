import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { categorySchema, firstIssue } from "@/lib/validation";
import { toCategoryView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(categories)
      .where(sql`true`)
      .orderBy(asc(categories.ord), asc(categories.name));

    return NextResponse.json(list.map(toCategoryView));
  } catch (error: unknown) {
    return serverError("GET /api/categories", error);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const { name, description, color = "#0b2545" } = parsed.data;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug) {
      return badRequest("Category name must contain letters or numbers");
    }

    const [{ nextOrd }] = await db
      .select({ nextOrd: sql<number>`coalesce(max(${categories.ord}), 0) + 1` })
      .from(categories);

    const [newCat] = await db
      .insert(categories)
      .values({
        name,
        slug,
        emoji: "📰",
        color,
        description: description ?? "",
        visible: true,
        ord: nextOrd ?? 1,
      })
      .returning();

    if (!newCat) {
      return badRequest("Category could not be created");
    }

    return NextResponse.json(toCategoryView(newCat), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && /duplicate key/i.test(error.message)) {
      return badRequest("A category with that name or slug already exists");
    }
    return serverError("POST /api/categories", error);
  }
}
