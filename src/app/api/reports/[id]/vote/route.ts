import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reportVotes } from "@/drizzle/schema";
import { eq, and, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get vote count and user's vote status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const sessionId = request.headers.get("x-session-id") || "";

    // Get total vote count
    const voteCountResult = await db
      .select({ count: count() })
      .from(reportVotes)
      .where(eq(reportVotes.reportId, reportId));
    const voteCount = voteCountResult[0]?.count || 0;

    // Check if current session has voted
    let hasVoted = false;
    if (sessionId) {
      const userVote = await db
        .select()
        .from(reportVotes)
        .where(
          and(
            eq(reportVotes.reportId, reportId),
            eq(reportVotes.sessionId, sessionId)
          )
        )
        .limit(1);
      hasVoted = userVote.length > 0;
    }

    return NextResponse.json({ voteCount, hasVoted });
  } catch (error) {
    console.error("Error getting votes:", error);
    return NextResponse.json(
      { error: "Failed to get votes" },
      { status: 500 }
    );
  }
}

// Toggle vote (upvote/remove vote)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if already voted
    const existingVote = await db
      .select()
      .from(reportVotes)
      .where(
        and(
          eq(reportVotes.reportId, reportId),
          eq(reportVotes.sessionId, sessionId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      // Remove vote
      await db
        .delete(reportVotes)
        .where(
          and(
            eq(reportVotes.reportId, reportId),
            eq(reportVotes.sessionId, sessionId)
          )
        );
    } else {
      // Add vote
      await db.insert(reportVotes).values({
        id: uuidv4(),
        reportId,
        sessionId,
        createdAt: new Date(),
      });
    }

    // Get new vote count
    const voteCountResult = await db
      .select({ count: count() })
      .from(reportVotes)
      .where(eq(reportVotes.reportId, reportId));
    const voteCount = voteCountResult[0]?.count || 0;
    const hasVoted = existingVote.length === 0;

    return NextResponse.json({
      success: true,
      voteCount,
      hasVoted,
    });
  } catch (error) {
    console.error("Error toggling vote:", error);
    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    );
  }
}
