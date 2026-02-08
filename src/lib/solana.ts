import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";

// Memo program ID
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

// Check if Solana integration is enabled
export function isSolanaEnabled(): boolean {
  return (
    process.env.SOLANA_ENABLED === "true" &&
    !!process.env.SOLANA_PRIVATE_KEY
  );
}

// Get connection to Solana devnet
function getConnection(): Connection {
  return new Connection(clusterApiUrl("devnet"), "confirmed");
}

// Get keypair from environment variable
function getKeypair(): Keypair | null {
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKey) return null;

  try {
    const decoded = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decoded);
  } catch (error) {
    console.error("Invalid Solana private key:", error);
    return null;
  }
}

// Anchor a hash to Solana devnet using the Memo program
export async function anchorHashToSolana(hash: string): Promise<{
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  error?: string;
}> {
  if (!isSolanaEnabled()) {
    return {
      success: false,
      error: "Solana integration is not enabled",
    };
  }

  const keypair = getKeypair();
  if (!keypair) {
    return {
      success: false,
      error: "Invalid or missing Solana private key",
    };
  }

  try {
    const connection = getConnection();

    // Create memo instruction with the hash
    const memoData = Buffer.from(`VERITAS:${hash}`);
    const memoInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: keypair.publicKey,
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: MEMO_PROGRAM_ID,
      data: memoData,
    });

    // Create and send transaction
    const transaction = new Transaction().add(memoInstruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      keypair,
    ]);

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

    return {
      success: true,
      signature,
      explorerUrl,
    };
  } catch (error) {
    console.error("Error anchoring to Solana:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Verify a hash exists on Solana
export async function verifyHashOnSolana(signature: string): Promise<{
  verified: boolean;
  hash?: string;
  timestamp?: number;
  error?: string;
}> {
  try {
    const connection = getConnection();
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      return {
        verified: false,
        error: "Transaction not found",
      };
    }

    // Extract memo data from transaction logs
    const logs = tx.meta.logMessages || [];
    const memoLog = logs.find((log) => log.includes("VERITAS:"));

    if (!memoLog) {
      return {
        verified: false,
        error: "No Veritas hash found in transaction",
      };
    }

    // Extract hash from memo
    const hashMatch = memoLog.match(/VERITAS:([a-f0-9]+)/);
    if (!hashMatch) {
      return {
        verified: false,
        error: "Invalid hash format",
      };
    }

    return {
      verified: true,
      hash: hashMatch[1],
      timestamp: tx.blockTime ? tx.blockTime * 1000 : undefined,
    };
  } catch (error) {
    console.error("Error verifying on Solana:", error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get wallet balance (for testing)
export async function getWalletBalance(): Promise<{
  balance: number;
  address: string;
} | null> {
  const keypair = getKeypair();
  if (!keypair) return null;

  try {
    const connection = getConnection();
    const balance = await connection.getBalance(keypair.publicKey);
    return {
      balance: balance / 1e9, // Convert lamports to SOL
      address: keypair.publicKey.toString(),
    };
  } catch (error) {
    console.error("Error getting balance:", error);
    return null;
  }
}
