import { NextRequest, NextResponse } from "next/server";
import { anchorHashToSolana, isSolanaEnabled } from "@/lib/solana";
import { updateWithSolanaTx, verifyHashChain } from "@/lib/audit";
import { db } from "@/lib/db";
import { auditLog } from "@/drizzle/schema";
import { isNotNull, desc } from "drizzle-orm";

// POST - Anchor a hash to Solana
export async function POST(request: NextRequest) {
  try {
    // Check if Solana is enabled
    if (!isSolanaEnabled()) {
      return NextResponse.json({
        success: false,
        enabled: false,
        message: "Solana integration is not enabled. Using local hash chain only.",
      });
    }

    const body = await request.json();
    const { hash, entryId } = body;

    if (!hash) {
      return NextResponse.json(
        { error: "Hash is required" },
        { status: 400 }
      );
    }

    // Anchor to Solana
    const result = await anchorHashToSolana(hash);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Update audit log entry with tx signature if entryId provided
    if (entryId && result.signature) {
      await updateWithSolanaTx(entryId, result.signature);
    }

    return NextResponse.json({
      success: true,
      signature: result.signature,
      explorerUrl: result.explorerUrl,
    });
  } catch (error) {
    console.error("Error in /api/anchor:", error);
    return NextResponse.json(
      { error: "Failed to anchor hash" },
      { status: 500 }
    );
  }
}

// GET - Get anchor status and verify chain
export async function GET() {
  try {
    // Verify the local hash chain
    const chainStatus = await verifyHashChain();

    // Get the latest anchored entry
    const latestAnchored = await db
      .select()
      .from(auditLog)
      .where(isNotNull(auditLog.solanaTxSignature))
      .orderBy(desc(auditLog.createdAt))
      .limit(1);

    return NextResponse.json({
      solanaEnabled: isSolanaEnabled(),
      chainValid: chainStatus.valid,
      totalEntries: chainStatus.totalEntries,
      latestAnchoredTx: latestAnchored[0]?.solanaTxSignature || null,
      latestAnchoredAt: latestAnchored[0]?.createdAt || null,
    });
  } catch (error) {
    console.error("Error in /api/anchor:", error);
    return NextResponse.json(
      { error: "Failed to get anchor status" },
      { status: 500 }
    );
  }
}
