# LibreCampus

**Production-ready, self-hostable, privacy-first learning and school management platform for secondary schools.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![CI](https://github.com/your-org/librecampus/actions/workflows/ci.yaml/badge.svg)](https://github.com/your-org/librecampus/actions)

---

## Overview

LibreCampus is an open-source, modular education platform designed for secondary schools. It provides a complete suite of tools for managing classrooms, assignments, grades, attendance, timetables, announcements, messaging, and analytics — all with strict data privacy, role-based access control, and multi-tenant campus isolation.

### Key Features

- **Multi-tenant Campus Isolation** — complete data separation per school
- **Role-Based Access Control** — Admin, Teacher, Student, Guardian roles with granular permissions
- **Classroom Management** — create, enroll, manage classes with subject/grade metadata
- **Assignments & Grading** — create, submit, grade, with weighted category gradebook
- **Attendance Tracking** — session-based bulk marking with PRESENT/ABSENT/LATE/EXCUSED statuses
- **Timetable System** — weekly slot management with room conflict detection
- **Announcements** — campus-wide or role-targeted with pin support
- **Direct Messaging** — secure in-platform messaging between users
- **File Storage** — S3-compatible (MinIO) file uploads with versioning
- **Notifications** — real-time notification system with read/unread tracking
- **Analytics Dashboard** — admin and teacher analytics with grade/attendance insights
- **Audit Logging** — comprehensive audit trail for all sensitive operations
- **MFA Support** — TOTP-based two-factor authentication
- **Privacy-First** — self-hosted, GDPR-aligned, no third-party telemetry

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 10.4, TypeScript 5.5 strict, Prisma 5.20 |
| **Database** | PostgreSQL 16 |
| **Frontend** | Next.js 14.2 (App Router), React 18.3, TypeScript |
| **UI** | Tailwind CSS 3.4, Radix UI, shadcn/ui patterns |
| **State** | Zustand 4.5 (client), TanStack React Query 5.59 (server) |
| **Auth** | JWT + bcrypt + TOTP MFA (otplib) |
| **Worker** | BullMQ + Redis for background jobs |
| **Storage** | MinIO (S3-compatible) |
| **Cache/Queue** | Redis 7 |
| **Infrastructure** | Docker, Docker Compose, Helm/Kubernetes |
| **CI/CD** | GitHub Actions |

---

## Architecture

```
librecampus/
├── apps/
│   ├── api/          # NestJS backend (REST API)
│   ├── web/          # Next.js frontend (App Router)
│   └── worker/       # BullMQ background job processor
├── packages/
│   └── shared/       # Shared TypeScript types & enums
├── infrastructure/
│   └── helm/         # Kubernetes Helm chart
├── docker-compose.yaml
└── ...config files
```

### Monorepo Structure

- **pnpm workspaces** — managed via `pnpm@9.15.0`
- **Shared types** — `@librecampus/shared` for cross-package type safety
- **Independent deployment** — API, Web, and Worker can be scaled independently

---

## Quick Start

### Prerequisites

- **Node.js** 20 LTS
- **pnpm** 9.15+
- **Docker** & **Docker Compose** v2
- **PostgreSQL** 16 (or use Docker)
- **Redis** 7 (or use Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/librecampus.git
cd librecampus

# Copy environment template
cp .env.example .env

# Start all services
docker compose up -d

# Run database migrations
docker compose exec api npx prisma migrate deploy

# Seed initial data (creates admin user)
docker compose exec api node dist/prisma/seed.js
```

The application will be available at:
- **Web UI**: http://localhost:3000
- **API**: http://localhost:4000
- **MinIO Console**: http://localhost:9001
- **Mailpit (dev email)**: http://localhost:8025

### Option 2: Local Development

```bash
# Clone and install
git clone https://github.com/your-org/librecampus.git
cd librecampus
pnpm install

# Start infrastructure services
docker compose up -d postgres redis minio mailpit

# Set up environment
cp .env.example .env
# Edit .env with your local values

# Generate Prisma client & run migrations
pnpm --filter @librecampus/api exec prisma generate
pnpm --filter @librecampus/api exec prisma migrate deploy

# Seed database
pnpm --filter @librecampus/api exec ts-node prisma/seed.ts

# Start all services in development mode
pnpm --filter @librecampus/api dev &
pnpm --filter @librecampus/web dev &
pnpm --filter @librecampus/worker dev &
```

### Default Admin Credentials

After seeding, log in with:
- **Email**: `admin@librecampus.local`
- **Password**: `Admin123!@#`

> **Important**: Change these credentials immediately after first login.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/librecampus` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for JWT signing | *(required)* |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | *(required)* |
| `JWT_EXPIRATION` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL | `7d` |
| `S3_ENDPOINT` | MinIO/S3 endpoint | `http://localhost:9000` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` |
| `S3_BUCKET` | S3 bucket name | `librecampus` |
| `S3_REGION` | S3 region | `us-east-1` |
| `SMTP_HOST` | SMTP server host | `localhost` |
| `SMTP_PORT` | SMTP server port | `1025` |
| `SMTP_USER` | SMTP username | *(optional)* |
| `SMTP_PASS` | SMTP password | *(optional)* |
| `SMTP_FROM` | Default sender email | `noreply@librecampus.local` |
| `MAX_FILE_SIZE` | Maximum upload size in bytes | `52428800` (50MB) |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

---

## API Documentation

The backend exposes a RESTful API. All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email/password (+ MFA) |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/auth/mfa/enable` | Enable MFA (returns QR code) |
| POST | `/api/v1/auth/mfa/verify` | Verify MFA setup |
| POST | `/api/v1/auth/mfa/disable` | Disable MFA |

### Resources

| Module | Base Path | Operations |
|--------|-----------|------------|
| Users | `/api/v1/users` | CRUD, activate/deactivate |
| Classrooms | `/api/v1/classrooms` | CRUD, list by campus |
| Enrollments | `/api/v1/enrollments` | Enroll, unenroll, list |
| Assignments | `/api/v1/assignments` | CRUD, submit, grade |
| Gradebook | `/api/v1/gradebook` | Get grades by classroom/student |
| Attendance | `/api/v1/attendance` | Create session, mark, reports |
| Timetable | `/api/v1/timetable` | CRUD slots, conflict detection |
| Announcements | `/api/v1/announcements` | CRUD, pin/unpin |
| Messaging | `/api/v1/messages` | Send, inbox, sent, read |
| Notifications | `/api/v1/notifications` | List, mark read, count |
| Files | `/api/v1/files` | Upload, download, delete |
| Analytics | `/api/v1/analytics` | Dashboard, grades, attendance |
| Audit | `/api/v1/audit` | Query audit logs (admin) |
| Campus | `/api/v1/campus` | Campus settings (admin) |

---

## Testing

```bash
# Run all backend tests
pnpm --filter @librecampus/api test

# Run with coverage
pnpm --filter @librecampus/api test -- --coverage

# Run specific test file
pnpm --filter @librecampus/api test -- auth.service.spec

# Run frontend tests
pnpm --filter @librecampus/web test
```

Test files follow the convention `*.service.spec.ts` and are co-located with source files.

---

## Deployment

### Docker Compose (Production)

```bash
# Build production images
docker compose -f docker-compose.yaml build

# Start with production env
NODE_ENV=production docker compose up -d
```

### Kubernetes (Helm)

```bash
# Add required secrets
kubectl create secret generic librecampus-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=jwt-secret='...' \
  --from-literal=jwt-refresh-secret='...'

# Install the Helm chart
helm install librecampus ./infrastructure/helm \
  --values ./infrastructure/helm/values.yaml \
  --set ingress.hosts[0].host=campus.example.com
```

See [infrastructure/helm/values.yaml](infrastructure/helm/values.yaml) for all configurable values.

---

## Project Structure — Backend Modules

| Module | Description |
|--------|-------------|
| `auth` | JWT authentication, MFA (TOTP), token refresh/revoke |
| `users` | User CRUD, profile management, role assignment |
| `campus` | Multi-tenant campus configuration |
| `classrooms` | Classroom creation, metadata, listing |
| `enrollments` | Student/teacher enrollment management |
| `assignments` | Assignment lifecycle, submissions, grading |
| `gradebook` | Weighted grade computation per classroom |
| `attendance` | Session-based attendance with bulk marking |
| `timetable` | Weekly slots with room conflict detection |
| `announcements` | Campus/role-targeted announcements |
| `messaging` | Direct user-to-user messaging |
| `notifications` | Push/pull notification system |
| `files` | S3-compatible file storage |
| `analytics` | Aggregated statistics and insights |
| `audit` | Immutable audit log |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and contribution guidelines.

## Security

See [SECURITY.md](SECURITY.md) for our security policy and vulnerability reporting process.

## License

LibreCampus is licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html) (AGPL-3.0-only).

This means:
- You are free to use, modify, and distribute this software
- If you run a modified version as a network service, you must share the source code
- All derivative works must also be AGPL-3.0 licensed

---

Built with care for educators, students, and open-source communities.
