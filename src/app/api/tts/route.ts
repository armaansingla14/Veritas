import { NextRequest, NextResponse } from "next/server";
import { textToSpeech, isElevenLabsEnabled } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  if (!isElevenLabsEnabled()) {
    return NextResponse.json(
      { error: "Text-to-speech is not configured" },
      { status: 503 }
    );
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse
    const maxLength = 5000;
    const truncatedText = text.slice(0, maxLength);

    const audioBuffer = await textToSpeech(truncatedText);

    if (!audioBuffer) {
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 }
      );
    }

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
