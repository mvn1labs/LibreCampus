# Contributing to LibreCampus

Thank you for your interest in contributing to LibreCampus! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

By participating in this project you agree to maintain a respectful, inclusive environment. Harassment, discrimination, and disruptive behaviour will not be tolerated.

---

## Getting Started

### Prerequisites

- **Node.js** 20 LTS
- **pnpm** 9.15+ (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- **Docker** & **Docker Compose** v2
- **Git**

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/librecampus.git
cd librecampus

# 2. Install dependencies
pnpm install

# 3. Start infrastructure services
docker compose up -d postgres redis minio mailpit

# 4. Set up environment
cp .env.example .env
# Edit .env as needed

# 5. Generate Prisma client
pnpm --filter @librecampus/api exec prisma generate

# 6. Run database migrations
pnpm --filter @librecampus/api exec prisma migrate deploy

# 7. Seed the database
pnpm --filter @librecampus/api exec ts-node prisma/seed.ts

# 8. Start development servers
pnpm --filter @librecampus/api dev      # API on :4000
pnpm --filter @librecampus/web dev      # Web on :3000
pnpm --filter @librecampus/worker dev   # Worker
```

---

## Development Workflow

### Branch Strategy

- `main` — stable production branch
- `develop` — integration branch for ongoing work
- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- Hotfixes: `hotfix/<short-description>`

### Making Changes

1. Create a branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Make your changes, ensuring:
   - Code compiles without errors (`pnpm -r run typecheck`)
   - Linting passes (`pnpm -r run lint`)
   - Tests pass (`pnpm --filter @librecampus/api test`)
   - New features include tests

3. Commit with conventional commits:
   ```
   feat(classrooms): add bulk enrollment endpoint
   fix(auth): handle expired refresh token gracefully
   docs: update API documentation for timetable
   chore: upgrade prisma to 5.21
   ```

4. Push and open a Pull Request against `develop`.

---

## Coding Standards

### TypeScript

- **Strict mode** enabled (`strict: true` in tsconfig)
- Prefer explicit types over `any`
- Use `readonly` where appropriate
- Use `interface` for object shapes, `type` for unions/intersections
- Export types from `@librecampus/shared` for cross-package usage

### Backend (NestJS)

- One module per feature domain
- Services contain business logic; controllers handle HTTP concerns
- Use DTOs with `class-validator` decorators for input validation
- Use guards for authorization (`@Roles()` decorator + `RolesGuard`)
- All sensitive operations must create audit log entries
- Prisma queries should use `where` clauses that include `campusId` for tenant isolation

### Frontend (Next.js)

- Use the App Router (`app/` directory)
- Server Components by default; use `'use client'` only when needed
- Components in `src/components/`, pages in `src/app/`
- Use `useApiQuery` / `useApiMutation` hooks for data fetching
- Follow shadcn/ui patterns for UI components
- Tailwind CSS for styling — avoid inline styles

### Tests

- Co-locate test files with source: `service.ts` → `service.spec.ts`
- Use `@nestjs/testing` for backend unit tests
- Mock external dependencies (Prisma, external APIs)
- Aim for **≥80% code coverage** on business logic

---

## Project Structure

```
librecampus/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules (auth, users, classrooms, etc.)
│   │   │   ├── common/         # Shared guards, decorators, pipes
│   │   │   ├── prisma.service.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   ├── web/                    # Next.js frontend
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       ├── components/     # UI & layout components
│   │       ├── hooks/          # Custom React hooks
│   │       ├── lib/            # Utilities, API client, stores
│   │       └── styles/         # Global CSS
│   └── worker/                 # BullMQ background processor
│       └── src/
│           └── index.ts
├── packages/
│   └── shared/                 # Shared types & enums
├── infrastructure/
│   └── helm/                   # Kubernetes Helm chart
├── docker-compose.yaml
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Pull Request Guidelines

- **Title**: Use conventional commit format
- **Description**: Explain what changed and why
- **Checklist**:
  - [ ] Code compiles (`pnpm -r run typecheck`)
  - [ ] Lint passes (`pnpm -r run lint`)
  - [ ] Tests pass and new tests added
  - [ ] No `console.log` left in production code
  - [ ] Migration added if schema changed
  - [ ] Documentation updated if API changed

### Review Process

1. At least one maintainer approval required
2. CI pipeline must pass
3. No merge conflicts with `develop`
4. Squash merge preferred for clean history

---

## Database Changes

When modifying the Prisma schema:

```bash
# Create a new migration
pnpm --filter @librecampus/api exec prisma migrate dev --name describe_change

# Generate updated client
pnpm --filter @librecampus/api exec prisma generate
```

- Never edit existing migrations
- Always include both `up` and ensure reversibility
- Test migrations against a fresh database

---

## Adding a New Module

1. Create the module directory: `apps/api/src/modules/<name>/`
2. Create files: `<name>.module.ts`, `<name>.service.ts`, `<name>.controller.ts`, DTOs
3. Register in `app.module.ts`
4. Add shared types to `packages/shared/src/types.ts` if needed
5. Add frontend pages in `apps/web/src/app/(dashboard)/<name>/`
6. Write tests: `<name>.service.spec.ts`

---

## Reporting Issues

Use GitHub Issues with the appropriate label:

- `bug` — something isn't working
- `enhancement` — new feature request
- `documentation` — docs improvements
- `security` — see [SECURITY.md](SECURITY.md) for responsible disclosure

---

## License

By contributing to LibreCampus, you agree that your contributions will be licensed under the AGPL-3.0-only license.
