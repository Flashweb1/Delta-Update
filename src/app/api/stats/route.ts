import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, comments, newsletterSubscribers, newsTips, siteConfig } from "@/db/schema";
import { count, eq, sum } from "drizzle-orm";
import { isAuthenticated } from "@/lib/guard";
import { serverError, unauthorized } from "@/lib/http";
import { normalizeTickers } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const [articleStats] = await db
      .select({
        totalArticles: count(articles.id),
        totalViews: sum(articles.views),
        totalLikes: sum(articles.likes),
        totalShares: sum(articles.shares),
      })
      .from(articles);

    const [{ totalComments }] = await db
      .select({ totalComments: count(comments.id) })
      .from(comments);

    const [{ totalSubscribers }] = await db
      .select({ totalSubscribers: count(newsletterSubscribers.id) })
      .from(newsletterSubscribers);

    const [{ totalTips }] = await db
      .select({ totalTips: count(newsTips.id) })
      .from(newsTips);

    const [config] = await db
      .select({ breakingNews: siteConfig.breakingNews })
      .from(siteConfig)
      .where(eq(siteConfig.id, 1));

    return NextResponse.json({
      totalArticles: Number(articleStats?.totalArticles || 0),
      totalViews: Number(articleStats?.totalViews || 0),
      totalLikes: Number(articleStats?.totalLikes || 0),
      totalShares: Number(articleStats?.totalShares || 0),
      totalComments: Number(totalComments || 0),
      totalSubscribers: Number(totalSubscribers || 0),
      totalTips: Number(totalTips || 0),
      totalTickers: normalizeTickers(config?.breakingNews ?? []).length,
      databaseStatus: "Connected (PostgreSQL / Supabase Ready)",
    });
  } catch (error: unknown) {
    return serverError("GET /api/stats", error);
  }
}
