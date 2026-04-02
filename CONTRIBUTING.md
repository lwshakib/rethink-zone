# Contributing to Rethink Zone

First off, thank you for considering contributing to Rethink Zone! It's people like you that make Rethink Zone a premium, high-quality tool for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issue list. When creating a report, please include:

- A clear and descriptive title.
- Exact steps to reproduce the problem.
- Expected vs. observed behavior.
- Screenshots or screen recordings if relevant.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Please provide:

- A clear description of the proposed enhancement.
- Rationale for why this would improve the user experience.
- Any comparable examples from other applications.

## Development Setup

### Prerequisites

- **Node.js**: 18.0 or higher
- **Bun** (required for this repo; some scripts use `bun x`)
- **PostgreSQL**: 12.0 or higher
- **Git**: Latest version

### Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rethink-zone.git
   cd rethink-zone
   ```
3. **Install dependencies**:
   ```bash
   bun install
   # (or) npm install (Bun is still required for scripts that use `bun x`)
   ```
4. **Environment Configuration**:
   Copy `.env.example` to `.env` and fill in your connection strings. Ensure `AWS_*` and `CLOUDFLARE_AI_GATEWAY_*` variables are set.
5. **Database Initialization**:
   ```bash
   bun run db:migrate
   ```
6. **Infrastructure Setup**:
   Initialize your storage bucket and CORS policy:
   ```bash
   bun run bucket:setup
   ```
7. **Launch Development Server**:
   ```bash
   bun run dev
   ```

## Coding Standards

### TypeScript

- **Strict Typing**: Avoid use of `any`. Use interfaces for object shapes and types for unions.
- **Exhaustive Types**: Ensure all possible states are handled, especially in UI and API logic.

### Standardized Services

- **AIService**: All AI-related interactions (text generation, object generation) must go through the centralized `AIService` to ensure proper routing and model management.
- **S3Service**: Use `S3Service` for all file interactions. Never interact with the S3 bucket directly from components; use the service to generate presigned URLs or handle server-side uploads.

### React & Components

- **Functional Components**: Use modern functional components with hooks.
- **Atomic Design**: Keep components small, focused, and reusable.
- **Theme Awareness**: Use Tailwind theme variables (e.g., `text-foreground`, `bg-background`) instead of hardcoded hex colors.
- **Premium Aesthetics**: Maintain the project's premium look by using glassmorphism, appropriate shadows, and smooth transitions.

### CSS & Styling

- **Tailwind CSS 4**: Leverage the latest Tailwind features and utility classes.
- **Global Styles**: Minimize global CSS; prefer component-level styling or Tailwind utilities.

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests
- `chore`: Updating build tasks, package manager configs, etc.

**Example**: `feat(canvas): add support for custom icon library`

## Pull Request Process

1. **Sync with Main**: Ensure your branch is up-to-date with `upstream/main`.
2. **Standard Checks**: Run `bun run lint` and `bun run format:check`.
3. **Tests**: No automated test runner is configured yet. When tests are added, run them here.
4. **Detail Your Work**: Provide a clear description of what the PR does and why.
5. **UI Changes**: Include screenshots or GIFs for any visual modifications.
6. **Review**: Address feedback from maintainers promptly.

## Project Structure

```
rethink-zone/
├── app/                  # Routes, Layouts, and API Endpoints
├── components/           # UI Primitives and Reusable Components
├── features/             # Core Feature Modules (Canvas, Document, Kanban)
├── actions/              # Server-side mutation logic (Server Actions)
├── hooks/                # Client hooks (e.g., Zustand wiring)
├── services/             # Centralized Business Logic (AI, S3, etc.)
├── scripts/              # One-off automation (bucket setup/teardown)
├── prisma/               # Schema definition and Migrations
├── lib/                  # Shared Utilities and Third-party Configs
├── validations/          # Zod Schemas for Data Integrity
├── public/               # Static assets
└── proxy.ts              # Route/session middleware (auth propagation)
```

Thank you for contributing to Rethink Zone! 🎉
