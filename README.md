# Rethink Zone

<div align="center">
  <img src="public/logo.svg" alt="Rethink Zone Logo" width="128"/>
  
  <h1>Rethink Zone</h1>
  
  **A premium, unified workspace that blends professional documents, an intelligent infinite canvas, and synchronized kanban boards.**

  <p align="center">
    <img src="public/dark_demo.png" alt="Rethink Zone Dark Mode" width="800" style="border-radius: 12px; margin-top: 20px; border: 1px solid rgba(255,255,255,0.1);"/>
  </p>
  <p align="center">
    <img src="public/light_demo.png" alt="Rethink Zone Light Mode" width="800" style="border-radius: 12px; margin-top: 10px; border: 1px solid rgba(0,0,0,0.1);"/>
  </p>
  
  <br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8)](https://tailwindcss.com/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-1.4.7-6c47ff)](https://www.better-auth.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Rethink Zone is a modern, full-stack workspace application designed for product teams who need to switch fluidly between structured writing, visual brainstorming, and task execution. Built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**, it provides a cohesive, premium experience where your project's narrative and visuals stay in perfect sync.

### Why Rethink Zone?

- **Unified Flow**: No more tab-switching. Documents, canvases, and boards coexist in a single, intuitive interface.
- **Premium Aesthetics**: Glassmorphism, modern typography, and theme-aware components provide a world-class user experience.
- **Intelligence Built-in**: An intelligent canvas and editor that adapt to your theme and context in real-time.
- **Reliable Persistence**: Optimized with optimistic UI updates and robust server-side synchronization via Prisma.

## ✨ Key Features

### 📝 Premium Document Editor

- **Paper-like Experience**: A focused, distraction-free writing environment.
- **Block-based Editing**: Powered by BlockNote with support for slash commands and rich media.
- **Theme Awareness**: Intelligent dark/light mode switching for optimal readability.

### 🎨 Intelligent Infinite Canvas

- **Custom Native Engine**: Built with a high-performance native canvas engine for smooth interactions.
- **Theme-aware Drawing**: Strokes, fills, and grids automatically adapt to your workspace theme.
- **Rich Elements**: Integrated support for connectors, sticky notes, icons, and cloud architecture components.

### 📋 Synchronized Kanban Board

- **Integrated Lifecycle**: Move tasks from backlog to done without leaving your project context.
- **Premium UI**: Fully themed task cards with priority tracking and ETA management.
- **Drag-and-Drop**: Smooth, intuitive task organization.

### 🔐 Robust Infrastructure

- **Secure Auth**: Powered by Better-Auth with secure session management.
- **Optimistic Persistence**: Real-time autosave with conflict resolution.
- **Split-View Mode**: Simultaneous document and canvas viewing for maximum productivity.

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.2.3](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand 5.0.9](https://zustand-demo.pmnd.rs/)
- **Animations**: [Motion 12.2](https://www.framer.com/motion/)

### Backend

- **ORM**: [Prisma 7.2.0](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Auth**: [Better-Auth 1.4.7](https://www.better-auth.com/)
- **AI Infrastructure**: [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) for unified model access.
- **Storage**: [Cloudflare R2 / AWS S3](https://aws.amazon.com/s3/) for secure media and asset storage.
- **Server Actions**: Native Next.js server actions for secure data mutations.
- **Testing**: No automated test runner is configured yet (use `lint` / `format:check` until tests are added).

## 🏗 Architecture

### System Flow

```mermaid
flowchart TD
    User[Client Browser] --> NextApp[Next.js App Router]
    NextApp --> Zustand[Zustand Store]
    Zustand --> UI[React Components]
    UI --> Canvas[Native Canvas Engine]
    UI --> Editor[BlockNote Editor]
    UI --> Kanban[Kanban Feature]

    Canvas --> Actions[Server Actions / API]
    Editor --> Actions
    Kanban --> Actions

    Actions --> AI[Cloudflare AI Gateway]
    Actions --> S3[Cloudflare R2 / S3]
    Actions --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
```

### Data Synergy

1. **Interaction**: User performs an action (edits a block, moves a task, draws a line).
2. **Optimistic Update**: Zustand updates the local state immediately for zero-latency UI.
3. **Synchronized Persistence**: Debounced calls to Next.js API routes persist changes to PostgreSQL via Prisma.
4. **AI & Media**: Requests for generation or translation are routed through the Cloudflare AI Gateway, while media assets are securely handled via signed S3/R2 URLs.
5. **Theme Management**: `next-themes` coordinates CSS variables across native Canvas drawings and React components.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **Bun**: required for some scripts in this repo (Prisma + bucket setup run via `bun x`)
- **PostgreSQL**: Local instance or managed service (Supabase, Neon)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lwshakib/rethink-zone.git
   cd rethink-zone
   ```

2. **Install dependencies**

   ```bash
   bun install
   # (or) npm install (Bun is still required for scripts that use `bun x`)
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in the values:

   ```env
   # Authentication
   BETTER_AUTH_SECRET=
   BETTER_AUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=

   # Cloudflare & Workers (AI Gateway)
   CLOUDFLARE_AI_GATEWAY_API_KEY=
   CLOUDFLARE_AI_GATEWAY_ENDPOINT=

   # --- MEDIA STORAGE (AWS S3 / CLOUDFLARE R2) ---
   AWS_REGION=auto
   AWS_ENDPOINT=
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_S3_BUCKET_NAME=

   # Database
   DATABASE_URL=

   # Email (Resend)
   RESEND_API_KEY=

   # Public Config
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Initialize Database**

   ```bash
   bun run db:migrate
   ```

5. **Infrastructure Setup**
   Initialize your storage bucket and CORS policy:

   ```bash
   bun run bucket:setup
   ```

6. **Start Developing**
   ```bash
   bun run dev
   ```

## 📁 Project Structure

```
rethink-zone/
├── app/                  # Next.js App Router (Routes & API)
├── components/           # Reusable UI & Core Layout Components
├── features/             # Feature-specific logic (Canvas, Document, Kanban)
├── actions/              # Server-side actions
├── hooks/                # Client hooks (e.g., Zustand store wiring)
├── lib/                  # Shared utilities and configurations
├── prisma/               # Database schema and migrations
├── services/             # Centralized business logic (AI, S3, etc.)
├── scripts/              # One-off automation (bucket setup/teardown)
├── public/               # Static assets
└── validations/          # Zod schemas for data integrity
```

## 📜 Scripts

| Command | Description |
| :-- | :-- |
| `bun run dev` | Starts the development server (`next dev`) |
| `bun run build` | Builds the application for production (`next build`) |
| `bun run start` | Runs the production server (`next start`) |
| `bun run lint` | Runs ESLint |
| `bun run format` | Runs Prettier (`--write .`) |
| `bun run format:check` | Runs Prettier (`--check .`) |
| `bun run db:migrate` | Runs Prisma generate + initial migration |
| `bun run db:studio` | Opens Prisma Studio |
| `bun run bucket:setup` | Creates/updates the S3/R2 bucket and CORS |
| `bun run bucket:teardown` | Tears down the S3/R2 bucket (use with caution) |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to get involved.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/lwshakib">lwshakib</a>
</div>
