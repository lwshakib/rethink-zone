import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "@/lib/env";

if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not defined in environment variables");
}

/**
 * Google GenAI Client Instance
 */
export const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});
