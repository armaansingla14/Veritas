import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog } from "@/drizzle/schema";
import { desc, isNotNull, count } from "drizzle-orm";
import { verifyHashChain } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get total entries count
    const totalResult = await db
      .select({ count: count() })
      .from(auditLog);
    const totalEntries = totalResult[0]?.count || 0;

    // Get anchored entries count
    const anchoredResult = await db
      .select({ count: count() })
      .from(auditLog)
      .where(isNotNull(auditLog.solanaTxSignature));
    const anchoredCount = anchoredResult[0]?.count || 0;

    // Get last anchor timestamp
    const lastAnchored = await db
      .select({ createdAt: auditLog.createdAt })
      .from(auditLog)
      .where(isNotNull(auditLog.solanaTxSignature))
      .orderBy(desc(auditLog.createdAt))
      .limit(1);
    const lastAnchorTime = lastAnchored[0]?.createdAt || null;

    // Verify hash chain integrity
    const chainStatus = await verifyHashChain();

    // Get recent entries for display
    const recentEntries = await db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(50);

    return NextResponse.json({
      totalEntries,
      anchoredCount,
      anchoredPercentage: totalEntries > 0
        ? Math.round((anchoredCount / totalEntries) * 1000) / 10
        : 0,
      lastAnchorTime,
      chainValid: chainStatus.valid,
      brokenAt: chainStatus.brokenAt,
      entries: recentEntries.map(entry => ({
        id: entry.id,
        actionType: entry.actionType,
        hash: entry.hash,
        prevHash: entry.prevHash,
        solanaTxSignature: entry.solanaTxSignature,
        createdAt: entry.createdAt,
        payload: JSON.parse(entry.payload),
      })),
    });
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit statistics" },
      { status: 500 }
    );
  }
}
