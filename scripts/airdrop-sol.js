// Script to request devnet SOL airdrop
// Run with: node scripts/airdrop-sol.js

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

const WALLET_ADDRESS = "2AeGmQQBwNrKf8CFghdttx1sCdAFGbFSpFnZd5EFduCb";

async function requestAirdrop() {
  console.log("Connecting to Solana devnet...");
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const publicKey = new PublicKey(WALLET_ADDRESS);

  console.log(`Requesting 1 SOL airdrop to ${WALLET_ADDRESS}...`);

  try {
    const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    console.log("Airdrop transaction signature:", signature);

    console.log("Waiting for confirmation...");
    await connection.confirmTransaction(signature, "confirmed");

    const balance = await connection.getBalance(publicKey);
    console.log(`\nSuccess! Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    return true;
  } catch (error) {
    console.error("Airdrop failed:", error.message);
    console.log("\n=== Manual Steps Required ===");
    console.log("1. Visit: https://faucet.solana.com/");
    console.log("2. Select 'Devnet'");
    console.log(`3. Paste this address: ${WALLET_ADDRESS}`);
    console.log("4. Click 'Confirm Airdrop'");
    return false;
  }
}

requestAirdrop();
