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
- **Bun** (Preferred) or **npm**
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
   # or
   npm install
   ```
4. **Environment Configuration**:
   Copy `.env` to `.env.local` and fill in your connection strings.
5. **Database Initialization**:
   ```bash
   npm run db:migrate
   ```
6. **Launch Development Server**:
   ```bash
   npm run dev
   ```

## Coding Standards

### TypeScript
- **Strict Typing**: Avoid use of `any`. Use interfaces for object shapes and types for unions.
- **Exhaustive Types**: Ensure all possible states are handled, especially in UI and API logic.

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
2. **Standard Checks**: Run `npm run lint` and ensure there are no errors.
3. **Detail Your Work**: Provide a clear description of what the PR does and why.
4. **UI Changes**: Include screenshots or GIFs for any visual modifications.
5. **Review**: Address feedback from maintainers promptly.

## Project Structure

```
rethink-zone/
├── app/                  # Routes, Layouts, and API Endpoints
├── components/           # UI Primitives and Layout Elements
├── features/             # Core Feature Modules (Canvas, Document, Kanban)
├── action/               # Server-side mutation logic
├── context/              # Zustand Store & Context providers
└── prisma/               # Schema definition and Migrations
```

Thank you for contributing to Rethink Zone! 🎉
