import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { isAuthenticated } from "@/lib/guard";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { breakingSchema, firstIssue } from "@/lib/validation";
import { normalizeTickers, sortTickers, type BreakingTicker } from "@/lib/view";

export const dynamic = "force-dynamic";

async function readTickers(): Promise<BreakingTicker[]> {
  const [config] = await db
    .select({ breakingNews: siteConfig.breakingNews })
    .from(siteConfig)
    .where(eq(siteConfig.id, 1));
  return normalizeTickers(config?.breakingNews ?? []);
}

async function writeTickers(tickers: BreakingTicker[]): Promise<boolean> {
  const [config] = await db
    .select({ id: siteConfig.id })
    .from(siteConfig)
    .where(eq(siteConfig.id, 1))
    .limit(1);
  if (!config) return false;

  await db
    .update(siteConfig)
    .set({ breakingNews: tickers, updatedAt: new Date() })
    .where(eq(siteConfig.id, 1));
  return true;
}

export async function GET() {
  try {
    const active = sortTickers(await readTickers()).filter((ticker) => ticker.isActive);
    return NextResponse.json(active);
  } catch (error: unknown) {
    return serverError("GET /api/breaking", error);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const body = await request.json().catch(() => null);
    const parsed = breakingSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    const { text, link, priority = 1, isActive = true } = parsed.data;
    const ticker: BreakingTicker = {
      id: randomUUID(),
      text,
      link: link || null,
      priority,
      isActive,
      createdAt: new Date().toISOString(),
    };

    const tickers = await readTickers();
    if (!(await writeTickers([...tickers, ticker]))) {
      return serverError("POST /api/breaking", new Error("site_config row missing"));
    }

    return NextResponse.json(ticker, { status: 201 });
  } catch (error: unknown) {
    return serverError("POST /api/breaking", error);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("Ticker id is required");
    }

    const tickers = await readTickers();
    const remaining = tickers.filter((ticker) => ticker.id !== id);
    if (remaining.length === tickers.length) {
      return badRequest("Ticker not found");
    }

    if (!(await writeTickers(remaining))) {
      return serverError("DELETE /api/breaking", new Error("site_config row missing"));
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return serverError("DELETE /api/breaking", error);
  }
}
