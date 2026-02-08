import { NextRequest, NextResponse } from "next/server";
import { triageReport } from "@/lib/triage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const result = await triageReport(reportId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to triage report" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      triage: result,
    });
  } catch (error) {
    console.error("Error in /api/triage:", error);
    return NextResponse.json(
      { error: "Failed to triage report" },
      { status: 500 }
    );
  }
}
