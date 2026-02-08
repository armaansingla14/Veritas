import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, reportVotes } from "@/drizzle/schema";
import { eq, count, desc, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get reports with vote counts, sorted by vote count
    const reportsWithVotes = await db
      .select({
        report: reports,
        voteCount: count(reportVotes.id),
      })
      .from(reports)
      .leftJoin(reportVotes, eq(reports.id, reportVotes.reportId))
      .where(ne(reports.status, "resolved"))
      .groupBy(reports.id)
      .orderBy(desc(count(reportVotes.id)), desc(reports.createdAt))
      .limit(limit);

    return NextResponse.json({
      trending: reportsWithVotes.map((item) => ({
        ...item.report,
        voteCount: item.voteCount,
      })),
    });
  } catch (error) {
    console.error("Error fetching trending reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending reports" },
      { status: 500 }
    );
  }
}
