// Script to generate a Solana devnet keypair
// Run with: node scripts/generate-solana-key.js

const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");

// Generate a new keypair
const keypair = Keypair.generate();

// Get the secret key as base58 (handle both default and named exports)
const encode = bs58.encode || bs58.default?.encode || bs58;
const privateKeyBase58 = typeof encode === 'function'
  ? encode(keypair.secretKey)
  : Buffer.from(keypair.secretKey).toString('base64');

console.log("=== Solana Devnet Keypair Generated ===\n");
console.log("Public Address:", keypair.publicKey.toString());
console.log("\nPrivate Key (base58):");
console.log(privateKeyBase58);
console.log("\n=== Add this to your .env file ===");
console.log(`SOLANA_PRIVATE_KEY=${privateKeyBase58}`);
console.log("\n=== Get devnet SOL ===");
console.log(`Visit: https://faucet.solana.com/`);
console.log(`Or run: solana airdrop 1 ${keypair.publicKey.toString()} --url devnet`);
