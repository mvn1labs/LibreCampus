export enum Role {
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  CAMPUS_ADMIN = 'CAMPUS_ADMIN',
  TEACHER = 'TEACHER',
  GUARDIAN = 'GUARDIAN',
  STUDENT = 'STUDENT',
  OBSERVER = 'OBSERVER',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SCHOOL_ADMIN]: 100,
  [Role.CAMPUS_ADMIN]: 80,
  [Role.TEACHER]: 60,
  [Role.GUARDIAN]: 40,
  [Role.STUDENT]: 20,
  [Role.OBSERVER]: 10,
};

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  campusId?: string;
  iat?: number;
  exp?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  LATE_SUBMITTED = 'LATE_SUBMITTED',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

export enum NotificationType {
  ASSIGNMENT_CREATED = 'ASSIGNMENT_CREATED',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  GRADE_POSTED = 'GRADE_POSTED',
  ATTENDANCE_MARKED = 'ATTENDANCE_MARKED',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  roles: Role[];
  campusId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomSummary {
  id: string;
  name: string;
  code: string;
  subject: string;
  teacherName: string;
  studentCount: number;
  term: string;
}

export interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClassrooms?: number;
  averageAttendance?: number;
  upcomingAssignments?: number;
  recentGrades?: number;
  unreadMessages?: number;
  announcements?: number;
}

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  assignments: {
    assignmentId: string;
    score?: number;
    maxScore: number;
    weight: number;
    category: string;
  }[];
  totalScore: number;
  percentage: number;
  letterGrade: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroomId: string;
  classroomName: string;
  subject: string;
  teacherName: string;
  room: string;
}

export const LETTER_GRADES: { min: number; grade: string }[] = [
  { min: 93, grade: 'A' },
  { min: 90, grade: 'A-' },
  { min: 87, grade: 'B+' },
  { min: 83, grade: 'B' },
  { min: 80, grade: 'B-' },
  { min: 77, grade: 'C+' },
  { min: 73, grade: 'C' },
  { min: 70, grade: 'C-' },
  { min: 67, grade: 'D+' },
  { min: 63, grade: 'D' },
  { min: 60, grade: 'D-' },
  { min: 0, grade: 'F' },
];

export function getLetterGrade(percentage: number): string {
  const entry = LETTER_GRADES.find((g) => percentage >= g.min);
  return entry?.grade ?? 'F';
}

export function sanitizeForLog(value: string): string {
  return value.replace(/[\n\r\t]/g, ' ').substring(0, 500);
}

export function redactPii(text: string): string {
  return text
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]');
}

export const ATTENDANCE_THRESHOLD_PERCENT = 80;

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
];
