import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { hash } = await request.json();

    if (!hash || typeof hash !== "string") {
      return NextResponse.json(
        { error: "Hash is required" },
        { status: 400 }
      );
    }

    // Find entry with this hash
    const entries = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.hash, hash))
      .limit(1);

    if (entries.length === 0) {
      return NextResponse.json({
        found: false,
        message: "No audit entry found with this hash",
      });
    }

    const entry = entries[0];

    // Verify the hash is correct
    const hashData = JSON.stringify({
      prevHash: entry.prevHash,
      actionType: entry.actionType,
      payload: JSON.parse(entry.payload),
      timestamp: entry.createdAt.getTime(),
    });
    const expectedHash = sha256(hashData);
    const hashValid = entry.hash === expectedHash;

    // Check if anchored to Solana
    const isAnchored = !!entry.solanaTxSignature;

    return NextResponse.json({
      found: true,
      hashValid,
      entry: {
        id: entry.id,
        actionType: entry.actionType,
        hash: entry.hash,
        prevHash: entry.prevHash,
        solanaTxSignature: entry.solanaTxSignature,
        createdAt: entry.createdAt,
        payload: JSON.parse(entry.payload),
      },
      isAnchored,
      solanaExplorerUrl: isAnchored
        ? `https://explorer.solana.com/tx/${entry.solanaTxSignature}?cluster=devnet`
        : null,
    });
  } catch (error) {
    console.error("Error verifying hash:", error);
    return NextResponse.json(
      { error: "Failed to verify hash" },
      { status: 500 }
    );
  }
}
