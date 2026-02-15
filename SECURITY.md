# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Current |

Only the latest release receives security updates.

---

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues responsibly:

1. **Email**: Send details to `security@librecampus.local` (replace with your actual security contact)
2. **Subject**: Include `[SECURITY]` in the subject line
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity
  - **Critical**: Patch within 72 hours
  - **High**: Patch within 1 week
  - **Medium**: Patch within 2 weeks
  - **Low**: Next scheduled release

---

## Security Architecture

### Authentication

- **Password hashing**: bcrypt with 12 salt rounds
- **JWT tokens**: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- **MFA**: TOTP-based two-factor authentication via otplib (RFC 6238)
- **Token revocation**: Refresh tokens stored in database, revocable on logout
- **Rate limiting**: Applied to auth endpoints to prevent brute force

### Authorization

- **Role-Based Access Control (RBAC)**: ADMIN, TEACHER, STUDENT, GUARDIAN
- **Guard-based enforcement**: NestJS guards on every protected endpoint
- **Campus isolation**: All queries scoped by `campusId` — users cannot access data from other campuses

### Data Protection

- **Transit encryption**: TLS required in production (enforced at ingress/load balancer)
- **At-rest encryption**: Depends on database/storage configuration (recommended)
- **No telemetry**: Zero third-party analytics or tracking
- **Self-hosted**: All data stays on your infrastructure
- **Audit logging**: Immutable audit trail for all sensitive operations

### Input Validation

- **DTO validation**: class-validator decorators on all API inputs
- **SQL injection**: Prevented by Prisma ORM parameterized queries
- **XSS**: React's built-in escaping + no `dangerouslySetInnerHTML`
- **CSRF**: SameSite cookies + Bearer token auth
- **File uploads**: Type and size validation (50MB max, configurable)
- **CORS**: Configurable allowed origins

### Infrastructure

- **Container security**: Non-root users in all Docker images (UID 1001)
- **Minimal base images**: Alpine-based Node.js images
- **Network isolation**: Docker Compose internal networks
- **Secret management**: Kubernetes Secrets (Helm) / environment variables
- **Health checks**: Liveness and readiness probes on all services

---

## Security Checklist for Deployers

- [ ] Change all default passwords (database, Redis, MinIO, admin account)
- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (≥64 random characters)
- [ ] Enable TLS/HTTPS via reverse proxy or ingress controller
- [ ] Configure `CORS_ORIGINS` to only your domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable PostgreSQL SSL connections
- [ ] Configure Redis authentication (`requirepass`)
- [ ] Set MinIO access/secret keys to non-default values
- [ ] Enable database backups
- [ ] Review and restrict network access to database/Redis/MinIO ports
- [ ] Set up log monitoring and alerting
- [ ] Regularly update dependencies (`pnpm update`)

---

## Dependency Security

- Dependencies are audited via `pnpm audit` in CI
- Dependabot / Renovate recommended for automated updates
- No known vulnerable dependencies at time of release

---

## Responsible Disclosure

We believe in responsible disclosure and will:
- Work with you to understand and validate the report
- Keep you informed of our progress
- Credit you in release notes (unless you prefer anonymity)
- Not pursue legal action against good-faith security researchers

Thank you for helping keep LibreCampus secure.
