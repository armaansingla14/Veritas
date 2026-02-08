import { generateText } from "./gemini";
import {
  findSimilarDocuments,
  hasRelevantContext,
  formatDocumentsForContext,
  type SimilarDocument,
} from "./embeddings";
import type { Language } from "@/components/LanguageSelector";

export interface RAGSource {
  id: number;
  title: string;
  url: string;
  excerpt: string;
  similarity: number;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  confidence: "high" | "medium" | "low" | "none";
  hasReliableSource: boolean;
}

// Language names for the prompt
const languageNames: Record<Language, string> = {
  en: "English",
  fr: "French",
};

// Build the RAG prompt
function buildRAGPrompt(
  question: string,
  context: string,
  language: Language
): string {
  const langName = languageNames[language];

  return `You are a City of Kingston information assistant. Answer ONLY using the provided sources.
If the sources don't contain enough information, say "I cannot find reliable information about this."

SOURCES:
${context}

USER QUESTION: ${question}

Respond with:
1. A clear answer (1-4 paragraphs max)
2. Actionable next steps as bullets (if applicable)
3. For each claim, cite the source as [Source N]

IMPORTANT:
- Never invent information. If unsure, recommend contacting the City directly.
- Keep the answer focused and practical.
- Respond in ${langName}.`;
}

// Build fallback response when no sources found
function buildFallbackResponse(language: Language): string {
  const fallbacks: Record<Language, string> = {
    en: "I cannot find reliable information about this topic in my sources. For accurate information, please contact the City of Kingston directly:\n\n- **Phone**: 613-546-0000\n- **Website**: cityofkingston.ca\n- **In Person**: City Hall, 216 Ontario Street",
    fr: "Je ne trouve pas d'informations fiables sur ce sujet dans mes sources. Pour des informations précises, veuillez contacter directement la Ville de Kingston:\n\n- **Téléphone**: 613-546-0000\n- **Site Web**: cityofkingston.ca\n- **En personne**: Hôtel de Ville, 216 rue Ontario",
  };

  return fallbacks[language] || fallbacks.en;
}

// Main RAG function
export async function askQuestion(
  question: string,
  language: Language = "en"
): Promise<RAGResponse> {
  // Find similar documents
  const similarDocs = await findSimilarDocuments(question, 5, 0.3);

  // Check if we have reliable sources
  if (!hasRelevantContext(similarDocs, 0.4)) {
    return {
      answer: buildFallbackResponse(language),
      sources: [],
      confidence: "none",
      hasReliableSource: false,
    };
  }

  // Format context
  const context = formatDocumentsForContext(similarDocs);

  // Build and send prompt
  const prompt = buildRAGPrompt(question, context, language);
  const answer = await generateText(prompt);

  // Extract sources
  const sources: RAGSource[] = similarDocs.map(({ document, similarity }, index) => ({
    id: index + 1,
    title: document.title,
    url: document.url,
    excerpt: document.content.slice(0, 200) + "...",
    similarity,
  }));

  // Determine confidence based on similarity scores
  const maxSimilarity = similarDocs[0]?.similarity || 0;
  let confidence: RAGResponse["confidence"];
  if (maxSimilarity >= 0.7) {
    confidence = "high";
  } else if (maxSimilarity >= 0.5) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return {
    answer,
    sources,
    confidence,
    hasReliableSource: true,
  };
}
