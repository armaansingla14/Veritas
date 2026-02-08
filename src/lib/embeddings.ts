import { db } from "./db";
import { documents, type Document } from "@/drizzle/schema";
import { generateEmbedding } from "./gemini";

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface SimilarDocument {
  document: Document;
  similarity: number;
}

// Find most similar documents to a query
export async function findSimilarDocuments(
  query: string,
  topK: number = 5,
  minSimilarity: number = 0.3
): Promise<SimilarDocument[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Get all documents with embeddings
  const allDocuments = await db.select().from(documents);

  // Calculate similarities
  const withSimilarity: SimilarDocument[] = allDocuments
    .filter((doc) => doc.embedding && Array.isArray(doc.embedding))
    .map((doc) => ({
      document: doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding as number[]),
    }))
    .filter((item) => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return withSimilarity;
}

// Check if we have enough relevant context
export function hasRelevantContext(
  similarDocs: SimilarDocument[],
  threshold: number = 0.5
): boolean {
  if (similarDocs.length === 0) return false;
  return similarDocs[0].similarity >= threshold;
}

// Format documents for context window
export function formatDocumentsForContext(docs: SimilarDocument[]): string {
  return docs
    .map(
      ({ document }, index) =>
        `[Source ${index + 1}] ${document.title}\n${document.content}\nURL: ${document.url}`
    )
    .join("\n\n---\n\n");
}
