# Contributing to Rethink Zone

First off, thank you for considering contributing to Rethink Zone! It's people like you that make Rethink Zone such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if applicable**
- **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists, if applicable**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and React styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code based on the Documentation Styleguide
- End all files with a newline

## Development Setup

### Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **PostgreSQL**: 12.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with ESLint extension)

### Getting Started

1. **Fork the repository**

   Click the "Fork" button on the GitHub repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/rethink-zone.git
   cd rethink-zone
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/lwshakib/rethink-zone.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment variables**

   Copy `.env.example` to `.env.local` (create `.env.example` if it doesn't exist):

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CLERK_SECRET_KEY`: Your Clerk secret key
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

6. **Set up the database**

   ```bash
   npm run migrate:dev
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **Verify the setup**

   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account
   - Create a workspace
   - Test editing documents, canvas, and kanban board

## Development Process

### Branch Naming

Use descriptive branch names that indicate the type of change:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/changes
- `chore/description` - Build/tooling changes

Examples:
- `feature/add-dark-mode-toggle`
- `fix/workspace-auto-save-bug`
- `docs/update-readme-installation`

### Keeping Your Fork Updated

Regularly sync your fork with the upstream repository:

```bash
# Fetch upstream changes
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Avoid `any` type** - use proper types or `unknown`
- **Use interfaces** for object shapes, types for unions/intersections
- **Enable strict mode** (already configured in `tsconfig.json`)
- **Use type inference** when types are obvious

```typescript
// ✅ Good
interface Workspace {
  id: string;
  name: string;
}

const workspace: Workspace = { id: "1", name: "My Workspace" };

// ❌ Bad
const workspace: any = { id: "1", name: "My Workspace" };
```

### React Components

- **Use functional components** with hooks
- **Use TypeScript** for component props
- **Extract reusable logic** into custom hooks
- **Keep components small** and focused on a single responsibility
- **Use meaningful component names** (PascalCase)

```typescript
// ✅ Good
interface WorkspaceCardProps {
  workspace: Workspace;
  onSelect: (id: string) => void;
}

export function WorkspaceCard({ workspace, onSelect }: WorkspaceCardProps) {
  return (
    <div onClick={() => onSelect(workspace.id)}>
      <h3>{workspace.name}</h3>
    </div>
  );
}

// ❌ Bad
export function Card(props: any) {
  return <div>{props.name}</div>;
}
```

### File Naming

- **Components**: PascalCase (e.g., `WorkspaceCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useWorkspace.ts`)

### Code Formatting

- **Use Prettier** (if configured) or follow consistent formatting
- **2 spaces** for indentation
- **Single quotes** for strings (or double quotes, be consistent)
- **Trailing commas** in multi-line objects/arrays
- **Semicolons** at end of statements

### Import Organization

Order imports as follows:

1. External dependencies (React, Next.js, etc.)
2. Internal absolute imports (`@/components`, `@/lib`)
3. Relative imports (`./`, `../`)
4. Type imports (use `import type` when possible)

```typescript
// ✅ Good
import { useState } from "react";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

import type { Workspace } from "@/types/workspace";
```

### Error Handling

- **Always handle errors** in API routes and async functions
- **Use try-catch blocks** for error handling
- **Return appropriate HTTP status codes**
- **Log errors** for debugging (use `console.error`)

```typescript
// ✅ Good
export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ... rest of code
  } catch (error) {
    console.error("Failed to fetch data", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### API Routes

- **Validate input** using Zod schemas
- **Check authentication** before processing requests
- **Return consistent response format**
- **Use proper HTTP methods** (GET, POST, PUT, DELETE)

```typescript
// ✅ Good
import { workspaceUpdateSchema } from "@/lib/validations/workspace";

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const payload = workspaceUpdateSchema.parse(body);
  // ... rest of code
}
```

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(workspace): add workspace deletion functionality

fix(editor): resolve auto-save debounce issue

docs(readme): update installation instructions

refactor(api): simplify workspace update logic

test(workspace): add unit tests for workspace creation
```

### Commit Best Practices

- **Write clear, descriptive commit messages**
- **Keep commits focused** - one logical change per commit
- **Test your changes** before committing
- **Don't commit commented-out code**
- **Don't commit sensitive data** (API keys, passwords, etc.)

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes from `main`
2. **Run linting** to check for code quality issues:
   ```bash
   npm run lint
   ```
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Add tests** for new features or bug fixes

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass
- [ ] Changes tested locally

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Maintainers will review** your PR
2. **Address feedback** promptly
3. **Make requested changes** and push updates
4. **Wait for approval** before merging
5. **Maintainers will merge** approved PRs

## Project Structure

### Key Directories

- **`src/app`**: Next.js App Router routes and API endpoints
- **`src/components`**: React components (UI primitives and features)
- **`src/lib`**: Utility functions, database client, validations
- **`src/actions`**: Server actions for data mutations
- **`prisma`**: Database schema and migrations

### Adding New Features

1. **Create a feature branch** from `main`
2. **Add necessary components** in appropriate directories
3. **Update database schema** if needed (create migration)
4. **Add API routes** if backend changes required
5. **Update types** and validations
6. **Test thoroughly**
7. **Update documentation**

### Adding New Components

1. **Place UI components** in `src/components/ui/`
2. **Place feature components** in feature-specific directories
3. **Export components** from appropriate index files
4. **Follow naming conventions** (PascalCase)
5. **Add TypeScript types** for props

## Testing

### Manual Testing

Before submitting a PR, manually test:

- [ ] Authentication flow (sign in/up)
- [ ] Workspace creation and deletion
- [ ] Document editing and auto-save
- [ ] Canvas drawing and auto-save
- [ ] Kanban board functionality
- [ ] Theme switching
- [ ] Responsive design on mobile/tablet

### Testing Checklist

- Test on different browsers (Chrome, Firefox, Safari, Edge)
- Test on different screen sizes
- Test error scenarios (network failures, invalid input)
- Test edge cases (empty data, long text, special characters)

## Documentation

### Code Comments

- **Add JSDoc comments** for complex functions
- **Explain "why" not "what"** in comments
- **Keep comments up-to-date** with code changes

```typescript
/**
 * Updates a workspace with debounced auto-save.
 * Uses a 1-second debounce to prevent excessive API calls.
 *
 * @param workspaceId - The ID of the workspace to update
 * @param data - The data to update
 * @returns Promise that resolves when update is complete
 */
export async function updateWorkspace(
  workspaceId: string,
  data: WorkspaceUpdateData
): Promise<void> {
  // Implementation
}
```

### README Updates

When adding features, update:
- Feature list in README
- Installation instructions (if dependencies change)
- Usage examples
- Configuration options

## Questions?

If you have questions about contributing:

1. **Check existing issues** and discussions
2. **Open a new issue** with the `question` label
3. **Contact maintainers** via GitHub

## Recognition

Contributors will be:
- **Listed in the README** (if desired)
- **Mentioned in release notes** for significant contributions
- **Thanked in the project** for their efforts

Thank you for contributing to Rethink Zone! 🎉

