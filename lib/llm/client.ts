import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "@/lib/env";

// The AI client will be initialized with a dummy key if GOOGLE_API_KEY is missing, allowing the build to proceed.

/**
 * Google GenAI Client Instance
 */
export const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});
