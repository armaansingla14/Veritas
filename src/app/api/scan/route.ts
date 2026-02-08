import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/vision";

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    let base64Data = image;
    if (image.includes(",")) {
      base64Data = image.split(",")[1];
    }

    // Analyze the image
    const result = await analyzeImage(base64Data, mimeType || "image/jpeg");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to analyze image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      detections: result.detections,
      overallDescription: result.overallDescription,
    });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
