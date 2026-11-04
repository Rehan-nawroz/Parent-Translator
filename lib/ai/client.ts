import { GoogleGenAI } from "@google/genai";

import { getGeminiConfig } from "@/lib/config/env";

let cached: { apiKey: string; client: GoogleGenAI } | null = null;

/** Returns null when GEMINI_API_KEY is absent so the route can fail safely. */
export function getGeminiClient(): { client: GoogleGenAI; model: string } | null {
  const config = getGeminiConfig();
  if (!config) return null;

  if (!cached || cached.apiKey !== config.apiKey) {
    cached = {
      apiKey: config.apiKey,
      client: new GoogleGenAI({ apiKey: config.apiKey }),
    };
  }

  return { client: cached.client, model: config.model };
}
