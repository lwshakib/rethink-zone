/**
 * @file generateObject.ts
 * @description This module handles the orchestration of structured data generation
 * using the GLM-4.7-Flash model. It leverages Zod for schema definition and
 * validation, ensuring the AI output strictly adheres to the requested JSON structure.
 */

import { z } from "zod";
import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from "@/lib/env";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Message Interface
 * Represents a single turn in the conversation with the AI.
 */
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * generateObjectFromAI
 *
 * Communicates with a GLM-4.7-Flash worker to generate a structured JSON response.
 * It uses Cloudflare Workers as a proxy to interact with the LLM.
 *
 * @template T - A Zod schema type.
 * @param messages - An array of chat messages (System prompt, user instructions, etc.).
 * @param outputSchema - The Zod schema that the AI response must satisfy.
 * @returns A Promise that resolves to the parsed and typed JSON object.
 */
export const generateObjectFromAI = async <T extends z.ZodTypeAny>(
  messages: Message[],
  outputSchema: T
): Promise<z.infer<T>> => {
  // --- 1. Environment Validation ---
  // Ensure the necessary API endpoints and keys are available before proceeding.
  if (!GLM_WORKER_URL) {
    throw new Error("GLM_WORKER_URL is not set in environment variables");
  }

  if (!CLOUDFLARE_API_KEY) {
    throw new Error("CLOUDFLARE_API_KEY is not set in environment variables");
  }

  // --- 2. Request Configuration ---
  // Define the target API URL and the authorization headers required by Cloudflare.
  const url = GLM_WORKER_URL;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
  };

  /**
   * 3. Schema Transformation
   * Convert the Zod schema into a standard JSON Schema.
   * This is sent to the AI model to enable 'Strict Schema' mode,
   * which forces the model to generate valid JSON that matches this exact shape.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(outputSchema as any);

  // --- 4. API Request ---
  // Send the request to the GLM worker.
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      messages: messages,
      // response_format dictates how the model should structure its output.
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "response_schema",
          strict: true, // Enforce strict adherence to the schema
          schema: jsonSchema,
        },
      },
    }),
  });

  // --- 5. Response Handling ---
  // Check if the network request was successful.
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GLM-4.7-Flash Worker Error (${response.status}): ${errorText}`
    );
  }

  // Parse the raw JSON envelope from the worker response.
  const result = await response.json();

  // Basic validation of the response structure (standard OpenAI-compatible format).
  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    throw new Error("Unexpected response format from GLM-4.7-Flash Worker");
  }

  // Extract the string content from the message.
  const content = result.choices[0].message.content;

  try {
    /**
     * 6. Parsing & Return
     * Parse the string content returned by the AI into a typed object.
     * Since 'strict' mode was enabled, this should reliably match the Zod schema.
     */
    return JSON.parse(content) as z.infer<T>;
  } catch {
    // Log the failing content for easier debugging.
    console.error("Failed to parse JSON from model response:", content);
    throw new Error("Model returned invalid JSON");
  }
};
