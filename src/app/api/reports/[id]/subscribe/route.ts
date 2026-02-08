import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reportSubscriptions } from "@/drizzle/schema";
import { eq, and, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get subscription status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const sessionId = request.headers.get("x-session-id") || "";

    // Get total subscriber count
    const subCountResult = await db
      .select({ count: count() })
      .from(reportSubscriptions)
      .where(eq(reportSubscriptions.reportId, reportId));
    const subscriberCount = subCountResult[0]?.count || 0;

    // Check if current session is subscribed
    let isSubscribed = false;
    if (sessionId) {
      const userSub = await db
        .select()
        .from(reportSubscriptions)
        .where(
          and(
            eq(reportSubscriptions.reportId, reportId),
            eq(reportSubscriptions.sessionId, sessionId)
          )
        )
        .limit(1);
      isSubscribed = userSub.length > 0;
    }

    return NextResponse.json({ subscriberCount, isSubscribed });
  } catch (error) {
    console.error("Error getting subscription:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}

// Toggle subscription
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

    // Check if already subscribed
    const existingSub = await db
      .select()
      .from(reportSubscriptions)
      .where(
        and(
          eq(reportSubscriptions.reportId, reportId),
          eq(reportSubscriptions.sessionId, sessionId)
        )
      )
      .limit(1);

    if (existingSub.length > 0) {
      // Unsubscribe
      await db
        .delete(reportSubscriptions)
        .where(
          and(
            eq(reportSubscriptions.reportId, reportId),
            eq(reportSubscriptions.sessionId, sessionId)
          )
        );
    } else {
      // Subscribe
      await db.insert(reportSubscriptions).values({
        id: uuidv4(),
        reportId,
        sessionId,
        createdAt: new Date(),
      });
    }

    // Get new subscriber count
    const subCountResult = await db
      .select({ count: count() })
      .from(reportSubscriptions)
      .where(eq(reportSubscriptions.reportId, reportId));
    const subscriberCount = subCountResult[0]?.count || 0;
    const isSubscribed = existingSub.length === 0;

    return NextResponse.json({
      success: true,
      subscriberCount,
      isSubscribed,
    });
  } catch (error) {
    console.error("Error toggling subscription:", error);
    return NextResponse.json(
      { error: "Failed to toggle subscription" },
      { status: 500 }
    );
  }
}
