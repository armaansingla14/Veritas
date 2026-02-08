import "dotenv/config";
import { db } from "../src/lib/db";
import { reports } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

interface SeedReport {
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  severity: string;
  suggestedDepartment: string;
  triageTitle: string;
  triageExplanation: string;
}

async function seedReports() {
  console.log("Starting report seeding...\n");

  // Read seed data
  const seedPath = path.join(process.cwd(), "src/data/seed-reports.json");
  const seedData: SeedReport[] = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  console.log(`Found ${seedData.length} seed reports\n`);

  // Clear existing reports (optional - comment out to keep existing)
  // await db.delete(reports);
  // console.log("Cleared existing reports\n");

  const now = new Date();
  let insertedCount = 0;

  for (const seed of seedData) {
    // Randomize creation time within the last 2 weeks
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(createdAt.getHours() - hoursAgo);

    const id = uuidv4();

    try {
      await db.insert(reports).values({
        id,
        type: seed.type as any,
        description: seed.description,
        latitude: seed.latitude,
        longitude: seed.longitude,
        address: seed.address,
        photoUrl: null,
        status: seed.status as any,
        severity: seed.severity as any,
        suggestedDepartment: seed.suggestedDepartment,
        triageExplanation: seed.triageExplanation,
        triageTitle: seed.triageTitle,
        sessionId: "demo-seed",
        createdAt,
        updatedAt: createdAt,
      });

      console.log(`  Inserted: ${seed.triageTitle}`);
      insertedCount++;
    } catch (error) {
      console.error(`  Error inserting report:`, error);
    }
  }

  console.log(`\nSeeding complete! Inserted ${insertedCount} reports.`);
}

// Run the seeding
seedReports().catch(console.error);
