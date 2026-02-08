import { generateJSON } from "./gemini";
import { db } from "./db";
import { reports } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface TriageResult {
  severity: "low" | "medium" | "high";
  severityReason: string;
  department: string;
  title: string;
  keywords: string[];
}

const TRIAGE_PROMPT = `Analyze this civic issue report and provide:
1. Suggested severity (low/medium/high) with reasoning
2. Suggested department (roads/bylaw/parking/waste/parks/utilities)
3. A short title (max 10 words)
4. Keywords for categorization

Report:
Type: {type}
Description: {description}
Location: {address}

Respond as JSON:
{
  "severity": "high",
  "severityReason": "Safety hazard on main road",
  "department": "roads",
  "title": "Large pothole on Princess Street",
  "keywords": ["pothole", "road damage", "safety"]
}

Guidelines:
- "high" severity: Safety hazards, urgent issues affecting many people
- "medium" severity: Quality of life issues, moderate impact
- "low" severity: Minor issues, cosmetic problems

Department mapping:
- roads: potholes, road damage, signs, traffic
- bylaw: noise, property violations, animals
- parking: illegal parking, meters, permits
- waste: garbage, recycling, dumping
- parks: playground, trails, trees, graffiti on park property
- utilities: streetlights, water, sewer`;

export async function triageReport(reportId: string): Promise<TriageResult | null> {
  try {
    // Fetch the report
    const result = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (result.length === 0) {
      console.error("Report not found:", reportId);
      return null;
    }

    const report = result[0];

    // Build the prompt
    const prompt = TRIAGE_PROMPT
      .replace("{type}", report.type)
      .replace("{description}", report.description)
      .replace("{address}", report.address);

    // Call Gemini for triage
    const triageResult = await generateJSON<TriageResult>(prompt);

    // Update the report with triage results
    await db
      .update(reports)
      .set({
        severity: triageResult.severity,
        suggestedDepartment: triageResult.department,
        triageExplanation: triageResult.severityReason,
        triageTitle: triageResult.title,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId));

    return triageResult;
  } catch (error) {
    console.error("Error triaging report:", error);
    return null;
  }
}

// Batch triage for multiple reports
export async function triageReports(reportIds: string[]): Promise<Map<string, TriageResult | null>> {
  const results = new Map<string, TriageResult | null>();

  for (const id of reportIds) {
    const result = await triageReport(id);
    results.set(id, result);
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}
