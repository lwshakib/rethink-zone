# Rethink Zone

Interactive workspace builder that blends a rich text editor, Excalidraw canvas, and kanban board into a single experience. Users sign in with Clerk, create workspaces, edit docs/canvases/boards side-by-side, and changes auto-save to Postgres via Drizzle.

## Features

- Landing page with marketing hero and footer content (`src/app/page.tsx`).
- Authenticated workspace area under `/workspaces` with Clerk-powered login/signup.
- Workspace detail view offering tabs for combined view, document-only (BlockNote), canvas-only (Excalidraw), and kanban board with drag/drop, inline editing, and metadata.
- Auto-save of document, canvas, and kanban changes with debounce to avoid excessive writes.
- Persistent storage in Postgres using Drizzle ORM; per-user isolation enforced in API routes.
- Theme support via `next-themes` and UI built on shadcn + Radix primitives.

## Tech Stack

- Next.js 16 (App Router, TypeScript, React 19)
- Clerk for authentication
- Drizzle ORM + Postgres
- Tailwind CSS 4
- BlockNote (rich text), Excalidraw (canvas), custom Kanban
- shadcn/ui components with Radix + Lucide icons

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/lwshakib/rethink-zone.git
   cd rethink-zone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment variables** (`.env.local`)

   ```bash
   DATABASE_URL=postgres://user:password@host:5432/dbname
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

   Ensure the Clerk keys match your Clerk application; `DATABASE_URL` must point to a reachable Postgres instance.

4. **Run database migrations**

   ```bash
   npm run db:push
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000. Auth routes live at `/sign-in` and `/sign-up`; workspace UI at `/workspaces`.

## Scripts

- `npm run dev` — start Next.js in development.
- `npm run build` — production build.
- `npm run start` — start built app.
- `npm run lint` — run ESLint.
- `npm run db:push` — push Drizzle schema to Postgres.

## Project Structure (high level)

- `src/app` — App Router routes, layouts, API handlers, and workspace UI.
  - `/(main)/workspaces` — workspace list and detail experience.
  - `/api/workspaces` — CRUD routes with Clerk auth and Drizzle persistence.
- `src/components` — shared UI, hero/footer, editor wrappers (BlockNote, Excalidraw), kanban pieces.
- `src/db` — Drizzle schema and client.
- `src/lib` — utility helpers and Zod validation.

## Notes

- Images are configured to allow any HTTPS host via `next.config.ts`.
- Tailwind styles live in `src/app/globals.css`.
- The project assumes Node 18+ (Next 16 requirement) and a Postgres database reachable from the app.
