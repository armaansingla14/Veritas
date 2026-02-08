import { NextRequest, NextResponse } from "next/server";
import { askQuestion } from "@/lib/rag";
import { logAction } from "@/lib/audit";
import { GeminiError } from "@/lib/gemini";
import type { Language } from "@/components/LanguageSelector";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, language = "en" } = body as {
      question: string;
      language?: Language;
    };

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "Question is too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Get RAG response
    const response = await askQuestion(question, language);

    // Log the action for audit trail
    await logAction("qa", {
      question,
      language,
      hasReliableSource: response.hasReliableSource,
      confidence: response.confidence,
      sourceCount: response.sources.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/ask:", error);

    // Return specific error messages for GeminiError
    if (error instanceof GeminiError) {
      const statusCode = error.code === "RATE_LIMITED" ? 429 :
                         error.code === "AUTH_ERROR" ? 503 : 500;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to process question. Please try again." },
      { status: 500 }
    );
  }
}
