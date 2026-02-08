import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { verifyHashOnSolana } from "@/lib/solana";

// GET - Get transaction info for a specific hash
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    // Find the audit log entry with this hash
    const entries = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.hash, hash))
      .limit(1);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Hash not found in audit log" },
        { status: 404 }
      );
    }

    const entry = entries[0];

    // If we have a Solana tx, verify it
    let solanaVerification = null;
    if (entry.solanaTxSignature) {
      solanaVerification = await verifyHashOnSolana(entry.solanaTxSignature);
    }

    return NextResponse.json({
      hash: entry.hash,
      actionType: entry.actionType,
      createdAt: entry.createdAt,
      prevHash: entry.prevHash,
      solanaTxSignature: entry.solanaTxSignature,
      solanaExplorerUrl: entry.solanaTxSignature
        ? `https://explorer.solana.com/tx/${entry.solanaTxSignature}?cluster=devnet`
        : null,
      solanaVerification,
    });
  } catch (error) {
    console.error("Error in /api/anchor/[hash]:", error);
    return NextResponse.json(
      { error: "Failed to get hash info" },
      { status: 500 }
    );
  }
}
