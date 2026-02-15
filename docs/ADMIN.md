# Administrator Guide

This guide covers the administration of a LibreCampus deployment.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Campus Configuration](#campus-configuration)
3. [User Management](#user-management)
4. [Classroom Management](#classroom-management)
5. [Academic Year Setup](#academic-year-setup)
6. [Timetable Configuration](#timetable-configuration)
7. [System Monitoring](#system-monitoring)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### First Login

After deploying LibreCampus and running the seed script, log in with the default admin credentials:

- **Email**: `admin@librecampus.local`
- **Password**: `Admin123!@#`

**Immediately** after login:

1. Navigate to **Settings** → Change your password
2. Enable **MFA** (two-factor authentication)
3. Update the campus name and settings

### Campus Configuration

Navigate to **Admin** → **Campus Settings** to configure:

- **Campus Name**: Your school's display name
- **Domain**: Primary domain for the campus
- **Timezone**: School timezone for scheduling
- **Academic Year Format**: e.g., "2024-2025"

---

## User Management

### Creating Users

1. Navigate to **Admin** → **Users**
2. Click **Create User**
3. Fill in:
   - First name, last name, email
   - Role: **ADMIN**, **TEACHER**, **STUDENT**, or **GUARDIAN**
4. The user will receive a temporary password via email

### Bulk User Import

For large schools, use the API directly:

```bash
# Example: Create multiple users via API
curl -X POST http://localhost:4000/api/v1/users/bulk \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '[
    {"email": "teacher1@school.edu", "firstName": "Jane", "lastName": "Doe", "roles": ["TEACHER"]},
    {"email": "student1@school.edu", "firstName": "John", "lastName": "Smith", "roles": ["STUDENT"]}
  ]'
```

### Managing Roles

- **ADMIN**: Full system access, user management, audit logs
- **TEACHER**: Classroom management, grading, attendance, announcements
- **STUDENT**: View classrooms, submit assignments, view grades
- **GUARDIAN**: View linked student's grades and attendance (read-only)

### Deactivating Users

Instead of deleting users (which would break referential integrity), deactivate them:

1. Navigate to **Admin** → **Users**
2. Find the user
3. Click **Deactivate**

Deactivated users cannot log in but their historical data is preserved.

---

## Classroom Management

### Creating Classrooms

1. Navigate to **Classrooms** → **Create Classroom**
2. Fill in:
   - **Name**: e.g., "Mathematics 10A"
   - **Subject**: Course subject
   - **Grade Level**: Target grade
   - **Academic Year**: e.g., "2024-2025"
   - **Semester**: Fall, Spring, Full Year

### Enrollments

After creating a classroom:

1. Open the classroom detail page
2. Use the **Students** tab to enroll students
3. Use the **Teachers** tab to assign teachers
4. One teacher can be marked as **Primary**

### Classroom Codes

Each classroom automatically receives a unique code that can be shared with students for self-enrollment (if enabled).

---

## Academic Year Setup

At the start of each academic year:

1. Create new classrooms with the updated academic year
2. Enroll students and assign teachers
3. Configure the timetable
4. Optionally archive or deactivate previous year's classrooms

---

## Timetable Configuration

### Setting Up the Schedule

1. Navigate to **Timetable**
2. For each classroom, add time slots:
   - **Day of Week**: Monday through Friday
   - **Start/End Time**: Class period times
   - **Room**: Physical room number

### Conflict Detection

The system automatically detects:
- **Room conflicts**: Same room, same day, overlapping times
- **Teacher conflicts**: Same teacher assigned to overlapping slots

Conflicting slots will be rejected with an error message.

---

## System Monitoring

### Audit Logs

Navigate to **Admin** → **Audit Log** to view:
- All user actions (login, data changes, deletions)
- IP addresses and timestamps
- Filterable by action type, user, and date range

### Analytics Dashboard

The admin dashboard provides:
- Total user counts by role
- Active classroom count
- Enrollment statistics
- Recent audit activity

### Health Checks

Monitor service health:

```bash
# API health
curl http://localhost:4000/api/v1/health

# Check Docker service status
docker compose ps

# View logs
docker compose logs -f api
docker compose logs -f worker
```

---

## Backup & Recovery

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U postgres librecampus > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
0 2 * * * docker compose exec -T postgres pg_dump -U postgres librecampus > /backups/librecampus_$(date +\%Y\%m\%d).sql
```

### Database Restore

```bash
# Restore from backup
docker compose exec -T postgres psql -U postgres librecampus < backup_20250115.sql
```

### File Storage Backup

```bash
# MinIO backup using mc (MinIO Client)
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mirror local/librecampus /backups/minio/
```

---

## Troubleshooting

### Common Issues

**Users cannot log in**
- Check that the user account is active (not deactivated)
- Verify the password is correct
- Check if MFA is enabled and the TOTP code is valid
- Check API logs: `docker compose logs api`

**Emails not sending**
- Verify SMTP configuration in `.env`
- Check the worker logs: `docker compose logs worker`
- In development, check Mailpit at http://localhost:8025

**File uploads failing**
- Check MinIO is running: `docker compose ps minio`
- Verify S3 credentials in `.env`
- Check file size is under the `MAX_FILE_SIZE` limit (default 50MB)

**Database connection errors**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running: `docker compose ps postgres`
- Check connection limits: `docker compose exec postgres psql -U postgres -c "SHOW max_connections;"`

**Slow performance**
- Check Redis is running for caching/queues
- Review PostgreSQL query performance
- Consider adding database indexes for frequently queried fields
- Scale horizontally using Kubernetes

### Resetting Admin Password

If you lose admin access:

```bash
# Connect to the database
docker compose exec postgres psql -U postgres librecampus

# Update password (bcrypt hash for 'NewPassword123!')
UPDATE "User" SET "passwordHash" = '$2b$12$...' WHERE email = 'admin@librecampus.local';
```

Or re-run the seed script to reset to defaults (warning: may duplicate data).

---

## Updates

To update LibreCampus:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Run database migrations
docker compose exec api npx prisma migrate deploy

# Rebuild and restart
docker compose build
docker compose up -d
```

Always review the changelog before updating for breaking changes.
