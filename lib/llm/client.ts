import { GoogleGenAI } from "@google/genai";
import { GOOGLE_API_KEY } from "@/lib/env";

/**
 * Google GenAI Client Instance
 */
export const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});
