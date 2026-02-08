import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import type { Language } from "@/components/LanguageSelector";

const languageNames: Record<Language, string> = {
  en: "English",
  fr: "French",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body as {
      text: string;
      targetLanguage: Language;
    };

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Text and target language are required" },
        { status: 400 }
      );
    }

    // Don't translate if target is English
    if (targetLanguage === "en") {
      return NextResponse.json({ translatedText: text });
    }

    const langName = languageNames[targetLanguage];
    if (!langName) {
      return NextResponse.json(
        { error: "Invalid target language" },
        { status: 400 }
      );
    }

    const prompt = `Translate the following text to ${langName}.
Keep any markdown formatting, links, and special characters intact.
Only return the translated text, no explanations or notes.

Text to translate:
${text}`;

    const translatedText = await generateText(prompt);

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Error in /api/translate:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
