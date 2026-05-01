import { ai } from "./client";
import { CHAT_MODEL_ID } from "./constants";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { STRUCTURED_OUTPUT_SYSTEM_INSTRUCTION } from "./prompts";

/**
 * Generates a structured JSON object using a chat session.
 * @param messages - Array of messages with role and content.
 * @param schema - Zod schema for the expected output.
 */
export async function generateObject<T>(
  messages: { role: string; content: string }[],
  schema: z.ZodSchema<T>
): Promise<T> {
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;

  const chat = ai.chats.create({
    model: CHAT_MODEL_ID,
    history,
    config: {
      systemInstruction: STRUCTURED_OUTPUT_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(schema as any),
    },
  });

  const response = await chat.sendMessage({
    message: lastMessage,
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  try {
    const parsed = JSON.parse(response.text);
    return schema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", response.text);
    throw new Error("AI response did not match the expected schema");
  }
}
