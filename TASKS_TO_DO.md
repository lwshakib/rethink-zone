# Project Refactoring Tasks

## Phase 1: Environment & Infrastructure
- [x] Update `.env` and `.env.example`:
  - Remove Cloudflare AI Gateway variables.
  - Add `GOOGLE_API_KEY` for Google AI or gemini.
- [x] Update `lib/env.ts` to reflect the new environment variables.
- [x] Install `@google/genai` package using Bun.
- [x] Create `lib/llm/` directory.
- [x] Create `lib/llm/constants.ts`:
  - Move `CHAT_MODEL_ID` from `lib/constants.ts`.
- [x] Create `lib/llm/client.ts`:
  - Initialize the `GoogleGenAI` client using the API key.
- [x] Create `lib/llm/generateText.ts`:
  - Implement text generation using `ai.chats.create` to support conversation history.
- [x] Create `lib/llm/generateObject.ts`:
  - Implement structured JSON generation using `ai.chats.create` and Zod for multi-turn capability.
- [x] Create `lib/llm/prompts.ts`:
  - Centralize prompts and apply prompt engineering best practices (System instructions, clear descriptions) from `ai-text.md`.

## Phase 2: Service Refactoring (Class to Functions)
- [x] Create `lib/repository.ts`:
  - Migrate logic from `services/repository.services.ts`.
  - Convert `RepositoryService` class into standalone, exported functions.
- [x] Create `lib/s3.ts`:
  - Migrate logic from `services/s3.services.ts`.
  - Convert `S3Service` class into standalone, exported functions.

## Phase 3: Validation Refactoring
- [x] Identify usage of `workspacePayloadSchema` and `workspaceUpdateSchema`.
- [x] Move validation schemas to their respective feature or action files.
- [x] Delete the `validations/` directory.

## Phase 4: Cleanup & Integration
- [x] Update all application code to use the new functions from `lib/` instead of the old services.
- [x] Delete the `services/` directory and all its contents:
  - `services/ai.services.ts`
  - `services/repository.services.ts`
  - `services/s3.services.ts`
- [x] Verify build stability and type safety.
- [ ] Test AI features (Text and Object generation) to ensure parity with the old implementation. (Manual testing required or simulated)
