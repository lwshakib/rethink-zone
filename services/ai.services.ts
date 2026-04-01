import * as env from '@/lib/env';
import { CHAT_MODEL_ID } from '@/lib/constants';

/**
 * AIService Class
 * Centralizes all AI-related operations.
 * Focuses on generateObject and generateText via Cloudflare AI Gateway.
 */
export class AIService {
  private apiKey: string;
  private gatewayUrl: string;

  constructor() {
    this.apiKey = env.CLOUDFLARE_AI_GATEWAY_API_KEY!;
    this.gatewayUrl = env.CLOUDFLARE_AI_GATEWAY_ENDPOINT!;

    if (!this.apiKey || !this.gatewayUrl) {
      // In a production environment, you might want more robust error handling or initialization
      console.warn(
        'AIService Configuration warning: CLOUDFLARE_AI_GATEWAY_API_KEY and CLOUDFLARE_AI_GATEWAY_ENDPOINT are not fully defined in environment.'
      );
    }
  }

  /**
   * Non-streaming Text Generation
   * @param messages - An array of chat messages.
   * @param options - Configuration for the generation (temperature, max_tokens).
   */
  async generateText(
    messages: any[],
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> {
    const { temperature, max_tokens } = options || {};

    const response = await fetch(this.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL_ID,
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${await response.text()}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  }

  /**
   * Structured JSON Generation
   * @param messages - An array of chat messages.
   * @param outputSchema - The JSON schema for the response.
   */
  async generateObject<T>(messages: any[], outputSchema: any): Promise<T> {
    const response = await fetch(this.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL_ID,
        messages: messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "response_schema",
            strict: true,
            schema: outputSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${await response.text()}`);
    }

    const result = await response.json();

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error("Unexpected response format from AI Gateway");
    }

    return JSON.parse(result.choices[0].message.content) as T;
  }
}

export const aiService = new AIService();
