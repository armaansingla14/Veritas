import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface DetectedIssue {
  type: "pothole" | "graffiti" | "streetlight" | "sidewalk" | "litter" | "other";
  confidence: number;
  description: string;
  severity: "low" | "medium" | "high";
  suggestedTitle: string;
}

export interface VisionAnalysisResult {
  success: boolean;
  detections: DetectedIssue[];
  overallDescription: string;
  error?: string;
}

const VISION_PROMPT = `You are an AI assistant analyzing a street photo to detect civic issues that should be reported to city authorities.

Analyze this image and identify any of the following issues:
- Potholes or road damage
- Graffiti or vandalism
- Broken or damaged streetlights
- Damaged sidewalks or walkways
- Litter or illegal dumping
- Other civic infrastructure problems

For each issue detected, provide:
1. The type of issue (pothole, graffiti, streetlight, sidewalk, litter, or other)
2. A confidence score (0.0 to 1.0) indicating how certain you are
3. A brief description of the specific issue
4. The severity (low, medium, or high) based on safety impact
5. A suggested title for the report

Also provide an overall description of what you see in the image.

Respond ONLY with valid JSON in this exact format:
{
  "detections": [
    {
      "type": "pothole",
      "confidence": 0.95,
      "description": "Large pothole approximately 1 foot wide on the road surface",
      "severity": "high",
      "suggestedTitle": "Large pothole on road surface"
    }
  ],
  "overallDescription": "Street view showing a residential area with visible road damage"
}

If no issues are detected, return an empty detections array.
Only detect issues that are clearly visible. Do not guess or infer issues that aren't shown.`;

export async function analyzeImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<VisionAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      VISION_PROMPT,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonText);

    // Validate and sanitize the response
    const validTypes = ["pothole", "graffiti", "streetlight", "sidewalk", "litter", "other"];
    const validSeverities = ["low", "medium", "high"];

    const detections: DetectedIssue[] = (parsed.detections || [])
      .filter((d: DetectedIssue) => validTypes.includes(d.type))
      .map((d: DetectedIssue) => ({
        type: d.type,
        confidence: Math.min(1, Math.max(0, d.confidence || 0.5)),
        description: d.description || "No description provided",
        severity: validSeverities.includes(d.severity) ? d.severity : "medium",
        suggestedTitle: d.suggestedTitle || `${d.type} issue detected`,
      }));

    return {
      success: true,
      detections,
      overallDescription: parsed.overallDescription || "Image analyzed successfully",
    };
  } catch (error) {
    console.error("Vision analysis error:", error);
    return {
      success: false,
      detections: [],
      overallDescription: "",
      error: error instanceof Error ? error.message : "Failed to analyze image",
    };
  }
}
