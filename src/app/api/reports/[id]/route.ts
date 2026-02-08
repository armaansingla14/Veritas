import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET - Get a single report by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const results = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report: results[0] });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PATCH - Update a report
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Only allow updating certain fields
    const allowedUpdates: Record<string, any> = {};
    const updateableFields = [
      "status",
      "severity",
      "suggestedDepartment",
      "triageExplanation",
      "triageTitle",
    ];

    for (const field of updateableFields) {
      if (body[field] !== undefined) {
        allowedUpdates[field] = body[field];
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    allowedUpdates.updatedAt = new Date();

    await db
      .update(reports)
      .set(allowedUpdates)
      .where(eq(reports.id, id));

    // Fetch updated report
    const results = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    return NextResponse.json({ report: results[0] });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
