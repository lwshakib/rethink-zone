import { CLOUDFLARE_API_KEY, GLM_WORKER_URL } from '@/lib/env';

/**
 * Interface for messages compatible with GLM-4.7-Flash.
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool' | 'developer';
  content: string | unknown[];
  name?: string;
  tool_calls?: unknown[];
  tool_call_id?: string;
}

/**
 * Options for the text generation request.
 */
export interface GenerateTextOptions {
  messages: Message[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string[];
  tools?: unknown[];
  tool_choice?: "none" | "auto" | "required";
}

/**
 * Generates text using GLM-4.7-Flash.
 * 
 * @param options - Generation options including messages and parameters.
 * @returns The generated text content from the assistant.
 */
export const generateText = async (options: GenerateTextOptions): Promise<string> => {
  if (!GLM_WORKER_URL) {
    throw new Error('GLM_WORKER_URL is not set in environment variables');
  }

  if (!CLOUDFLARE_API_KEY) {
    throw new Error('CLOUDFLARE_API_KEY is not set in environment variables');
  }

  const url = GLM_WORKER_URL;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
        ...options,
        stream: options.stream ?? false
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM-4.7-Flash Worker Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    throw new Error('Unexpected response format from GLM-4.7-Flash Worker');
  }

  return result.choices[0].message.content;
};
