import { ai } from "./client";
import { CHAT_MODEL_ID } from "./constants";
import { GENERAL_SYSTEM_INSTRUCTION } from "./prompts";

/**
 * Generates text using a multi-turn chat session.
 * @param messages - Array of messages with role and content.
 * @param options - Generation options like temperature and max tokens.
 */
export async function generateText(
  messages: { role: string; content: string }[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  
  const lastMessage = messages[messages.length - 1].content;

  const chat = ai.chats.create({
    model: CHAT_MODEL_ID,
    history,
    config: {
      systemInstruction: GENERAL_SYSTEM_INSTRUCTION,
      temperature: options?.temperature,
      maxOutputTokens: options?.max_tokens,
    },
  });

  const response = await chat.sendMessage({
    message: lastMessage,
  });

  return response.text || "";
}
