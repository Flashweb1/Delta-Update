import { NextResponse } from "next/server";
import { db } from "@/db";
import { pollVotes } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { firstIssue, pollSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const CURRENT_QUESTION =
  "What should state and local governments across Nigeria prioritize most to improve daily life?";

const OPTIONS = [
  "Reliable roads and public transport",
  "Accessible primary healthcare",
  "Quality public schools and skills",
  "Jobs and support for small businesses",
];

export async function GET() {
  try {
    const results: { [key: string]: number } = {};

    for (const opt of OPTIONS) {
      const [{ value }] = await db
        .select({ value: count() })
        .from(pollVotes)
        .where(and(eq(pollVotes.pollQuestion, CURRENT_QUESTION), eq(pollVotes.optionSelected, opt)));
      results[opt] = value;
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(pollVotes)
      .where(eq(pollVotes.pollQuestion, CURRENT_QUESTION));

    return NextResponse.json({
      question: CURRENT_QUESTION,
      options: OPTIONS,
      results,
      totalVotes: total,
    });
  } catch (error: unknown) {
    return serverError("GET /api/poll", error);
  }
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(clientKey(request, "poll"), 10, 10 * 60 * 1000);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter);
    }

    const body = await request.json().catch(() => null);
    const parsed = pollSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(firstIssue(parsed.error));
    }

    if (!OPTIONS.includes(parsed.data.optionSelected)) {
      return badRequest("Choose one of the available poll options");
    }

    await db.insert(pollVotes).values({
      pollQuestion: CURRENT_QUESTION,
      optionSelected: parsed.data.optionSelected,
    });

    return NextResponse.json({ success: true, message: "Vote recorded" });
  } catch (error: unknown) {
    return serverError("POST /api/poll", error);
  }
}
