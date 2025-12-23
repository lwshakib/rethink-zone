# Rethink Zone

<div align="center">
  <img src="public/app.png" alt="Rethink Zone App Demo" width="800"/>
  
  **Interactive workspace builder that blends a rich text editor, Excalidraw canvas, and kanban board into a single experience.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.1-blue)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## 🎯 Overview

Rethink Zone is a modern, full-stack workspace application that combines the power of document editing, visual canvas drawing, and project management into a unified platform. Built with Next.js 16 and React 19, it provides a seamless experience for teams to collaborate, brainstorm, and organize their work.

### Key Highlights

- **Unified Workspace**: Edit documents, draw on canvas, and manage tasks all in one place
- **Real-time Auto-save**: Changes are automatically saved with intelligent debouncing
- **Secure Authentication**: Powered by Clerk for enterprise-grade security
- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS 4
- **Type-safe**: Full TypeScript support with Zod validation
- **Production-ready**: Optimized for performance and scalability

## ✨ Features

### Core Features

- **📝 Rich Text Editor**: Powered by BlockNote with slash commands, block-based editing, and markdown support
- **🎨 Visual Canvas**: Excalidraw integration for infinite canvas drawing and diagramming
- **📋 Kanban Board**: Custom-built kanban board with drag-and-drop functionality
- **💾 Auto-save**: Intelligent debounced auto-save for all workspace content
- **🔐 Authentication**: Secure user authentication and authorization via Clerk
- **🌓 Theme Support**: Dark and light mode with `next-themes`
- **📱 Responsive Design**: Fully responsive UI that works on all devices

### User Experience

- **Landing Page**: Marketing hero section with feature highlights and call-to-action
- **Workspace Management**: Create, edit, and delete workspaces with ease
- **Tabbed Interface**: Switch between combined view, document-only, canvas-only, and kanban views
- **User Profile**: Integrated user profile management with Clerk
- **Optimistic UI**: Smooth interactions with optimistic updates

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16.0.8](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.2.1](https://react.dev/)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Backend

- **API**: Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma 7.1.0](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)

### Editor & Canvas

- **Rich Text**: [BlockNote](https://www.blocknote.dev/) - Block-based editor
- **Canvas**: [Excalidraw](https://excalidraw.com/) - Vector drawing tool
- **Kanban**: Custom implementation with drag-and-drop

### Development Tools

- **Linting**: ESLint with Next.js config
- **Package Manager**: npm
- **Build Tool**: Next.js built-in bundler

## 🏗 Architecture

### High-Level Architecture

```mermaid
flowchart TB
    User[👤 User] -->|Browser| NextJS[Next.js App Router]
    NextJS -->|Auth| Clerk[Clerk Authentication]
    NextJS -->|API Calls| APIRoutes[API Routes]
    APIRoutes -->|Query| Prisma[Prisma ORM]
    Prisma -->|Connect| Postgres[(PostgreSQL Database)]
    
    NextJS -->|Render| BlockNote[BlockNote Editor]
    NextJS -->|Render| Excalidraw[Excalidraw Canvas]
    NextJS -->|Render| Kanban[Kanban Board]
    
    BlockNote -->|Auto-save| APIRoutes
    Excalidraw -->|Auto-save| APIRoutes
    Kanban -->|Auto-save| APIRoutes
    
    style User fill:#e1f5ff
    style NextJS fill:#0070f3
    style Clerk fill:#6c47ff
    style Postgres fill:#336791
    style Prisma fill:#2d3748
```

### Data Flow

1. **Authentication**: User signs in via Clerk → Clerk validates → User session created
2. **Workspace Access**: User requests workspace → API validates ownership → Data fetched from Postgres
3. **Content Editing**: User edits content → Debounced auto-save → API updates database
4. **Data Persistence**: All changes saved to PostgreSQL via Prisma ORM

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher (or yarn/pnpm)
- **PostgreSQL**: 12.0 or higher
- **Clerk Account**: [Sign up](https://clerk.com/) for free

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lwshakib/rethink-zone.git
   cd rethink-zone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/rethink_zone?schema=public

   # Clerk Authentication
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

   **Getting Clerk Keys:**
   - Sign up at [clerk.com](https://clerk.com/)
   - Create a new application
   - Copy the API keys from the dashboard

   **Setting up PostgreSQL:**
   - Install PostgreSQL locally or use a cloud service (Supabase, Neon, etc.)
   - Create a new database
   - Update `DATABASE_URL` with your connection string

4. **Run database migrations**

   ```bash
   npm run migrate:dev
   ```

   This will:
   - Generate Prisma Client
   - Create database tables
   - Set up indexes and relationships

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

   - Landing page: `http://localhost:3000`
   - Sign in: `http://localhost:3000/sign-in`
   - Sign up: `http://localhost:3000/sign-up`
   - Workspaces: `http://localhost:3000/workspaces` (requires authentication)

## 📁 Project Structure

```
rethink-zone/
├── prisma/
│   ├── migrations/          # Database migration files
│   └── schema.prisma        # Prisma schema definition
├── public/
│   ├── app.png              # App demo screenshot
│   ├── logo.svg             # Application logo
│   └── favicon_io/          # Favicon assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Authentication routes
│   │   │   ├── sign-in/     # Sign in page
│   │   │   └── sign-up/     # Sign up page
│   │   ├── (main)/          # Main application routes
│   │   │   └── workspaces/  # Workspace pages
│   │   │       ├── page.tsx              # Workspace list
│   │   │       └── [workspaceId]/        # Workspace detail
│   │   │           ├── page.tsx          # Workspace view
│   │   │           └── _components/      # Workspace components
│   │   │               ├── BothTab.tsx   # Combined view
│   │   │               ├── DocumentTab.tsx
│   │   │               ├── CanvasTab.tsx
│   │   │               └── KanbanTab.tsx
│   │   ├── api/             # API routes
│   │   │   └── workspaces/  # Workspace API endpoints
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── editor/          # Editor components
│   │   │   ├── DynamicEditor.tsx
│   │   │   ├── editor.tsx
│   │   │   └── ExcaliDraw.tsx
│   │   ├── hero-section.tsx # Landing page hero
│   │   ├── footer-section.tsx
│   │   ├── header.tsx
│   │   └── ...
│   ├── lib/                 # Utility functions
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── utils.ts         # Helper functions
│   │   └── validations/     # Zod schemas
│   ├── actions/             # Server actions
│   │   ├── user.ts
│   │   └── workspaces.ts
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   └── proxy.ts             # Proxy configuration
├── generated/               # Generated files
│   └── prisma/              # Generated Prisma Client
├── .gitignore
├── components.json          # shadcn/ui configuration
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration
├── package.json
├── postcss.config.mjs       # PostCSS configuration
├── prisma.config.ts         # Prisma configuration
├── tsconfig.json            # TypeScript configuration
└── README.md
```

### Key Directories Explained

- **`src/app`**: Next.js App Router directory containing routes, layouts, and API endpoints
- **`src/components`**: Reusable React components including UI primitives and feature-specific components
- **`src/lib`**: Shared utilities, database client, and validation schemas
- **`src/actions`**: Server actions for data mutations
- **`prisma`**: Database schema and migrations
- **`public`**: Static assets served by Next.js

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `http://localhost:3000` |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run migrate:dev` | Generate Prisma Client and run migrations in development |
| `npm run migrate:deploy` | Deploy migrations to production database |
| `npm run studio` | Open Prisma Studio (database GUI) |

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side auth | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for client-side | `pk_test_...` |

### Optional Variables

- `NODE_ENV`: Environment mode (`development`, `production`, `test`)
- `PORT`: Server port (default: 3000)

## 🗄 Database Schema

### User Model

```prisma
model User {
  id        String      @id @default(uuid())
  clerkId   String      @unique
  name      String
  email     String      @unique
  imageUrl  String
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  workspaces Workspace[]

  @@index([clerkId])
}
```

### Workspace Model

```prisma
model Workspace {
  id          String    @id @default(uuid())
  clerkId     String
  user        User      @relation(fields: [clerkId], references: [clerkId])
  name        String
  documentData Json?
  canvasData  Json?
  kanbanBoard Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([clerkId])
}
```

### Relationships

- **User → Workspace**: One-to-many (one user can have many workspaces)
- **Workspace → User**: Many-to-one (each workspace belongs to one user)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- How to set up your development environment
- Our coding standards and conventions
- How to submit pull requests
- Our issue reporting guidelines

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Shakib Khan**

- GitHub: [@lwshakib](https://github.com/lwshakib)
- Project: [Rethink Zone](https://github.com/lwshakib/rethink-zone)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Clerk](https://clerk.com/) for authentication infrastructure
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [BlockNote](https://www.blocknote.dev/) for the rich text editor
- [Excalidraw](https://excalidraw.com/) for the canvas functionality
- [shadcn](https://ui.shadcn.com/) for the beautiful UI components
- All contributors and users of this project

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/lwshakib/rethink-zone/issues)
2. Create a new issue with detailed information
3. Review the documentation above

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/lwshakib">lwshakib</a>
</div>
