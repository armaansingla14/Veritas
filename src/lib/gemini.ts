import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Custom error class for Gemini API errors
export class GeminiError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
  }
}

// Parse error from Gemini API response
function parseGeminiError(error: unknown): GeminiError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for rate limiting (429)
  if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("quota")) {
    return new GeminiError("Service is temporarily busy. Please try again in a moment.", "RATE_LIMITED");
  }

  // Check for authentication errors (401, 403)
  if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.toLowerCase().includes("api key")) {
    return new GeminiError("Service configuration error. Please contact support.", "AUTH_ERROR");
  }

  // Check for network errors
  if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch") || errorMessage.toLowerCase().includes("enotfound")) {
    return new GeminiError("Connection error. Please check your internet and try again.", "NETWORK_ERROR");
  }

  // Default error
  return new GeminiError("Failed to generate response. Please try again.", "UNKNOWN_ERROR");
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the Gemini model for generation
export function getGenerativeModel(): GenerativeModel {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// Get the embedding model
export function getEmbeddingModel(): GenerativeModel {
  return genAI.getGenerativeModel({ model: "gemini-embedding-001" });
}

// Retry wrapper with exponential backoff for rate limiting
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isRateLimited = error instanceof GeminiError && error.code === 'RATE_LIMITED';
      if (!isRateLimited || attempt === maxRetries - 1) {
        // If still rate limited after all retries, provide a more helpful message
        if (isRateLimited && attempt === maxRetries - 1) {
          throw new GeminiError(
            "API quota exhausted. The free tier limit has been reached. Please try again later or use a different API key.",
            "QUOTA_EXHAUSTED"
          );
        }
        throw error;
      }
      // Exponential backoff: 2s, 4s, 8s, 16s, 32s
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

// Generate text response
export async function generateText(prompt: string): Promise<string> {
  return withRetry(async () => {
    try {
      const model = getGenerativeModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw parseGeminiError(error);
    }
  });
}

// Generate JSON response
export async function generateJSON<T>(prompt: string): Promise<T> {
  return withRetry(async () => {
    try {
      const model = getGenerativeModel();
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof GeminiError) {
        throw error;
      }
      throw parseGeminiError(error);
    }
  });
}

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  return withRetry(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      throw parseGeminiError(error);
    }
  });
}

// Generate embeddings for multiple texts (batch)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  return embeddings;
}
