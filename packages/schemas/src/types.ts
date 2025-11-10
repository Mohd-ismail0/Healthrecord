/**
 * Core TypeScript type definitions for HealthTrack
 */

// ===== Enums =====

export enum RecordType {
  LAB_REPORT = 'labReport',
  COURSE = 'course',
}

export enum RecordSource {
  MANUAL = 'manual',
  OCR = 'ocr',
  API = 'api',
}

export enum CourseStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum Interpretation {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  LAB = 'lab',
  AI_AGENT = 'ai_agent',
  ADMIN = 'admin',
}

// ===== Core Types =====

/**
 * Unified health record
 */
export interface Record {
  recordId: string;
  userId: string;
  recordType: RecordType;
  source: RecordSource;
  verified: boolean;
  version: number;
  data: CourseData | LabReportData;
  mcpContextURI?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Medication course data
 */
export interface CourseData {
  courseId: string;
  medicine: string;
  dosage: string;
  frequency?: string;
  startDate: string;
  endDate: string;
  doctor: string;
  doctorSpecialty?: string;
  status: CourseStatus;
  daysRemaining?: number;
  notes?: string;
}

/**
 * Lab test result data
 */
export interface LabTestData {
  testId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange?: string;
  testDate: string;
  labName?: string;
  interpretation?: Interpretation;
  previousValue?: number;
  changePercent?: number;
}

/**
 * Lab report containing multiple tests
 */
export interface LabReportData {
  reportId: string;
  reportDate: string;
  labName: string;
  tests: LabTestData[];
}

/**
 * User profile
 */
export interface User {
  userId: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

// ===== API Request/Response Types =====

/**
 * Upload URL request
 */
export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
}

/**
 * Upload URL response
 */
export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}

/**
 * Parse request
 */
export interface ParseRequest {
  s3Key: string;
  recordType: RecordType;
}

/**
 * Parse response
 */
export interface ParseResponse {
  parseId: string;
  extractedData: Record<string, any>;
  confidence: number;
  requiresVerification: boolean;
  recordType: RecordType;
}

/**
 * Manual entry request
 */
export interface ManualEntryRequest {
  recordType: RecordType;
  data: CourseData | LabReportData;
}

/**
 * Verify request
 */
export interface VerifyRequest {
  parseId: string;
  data: Record<string, any>;
  corrections?: FieldCorrection[];
}

/**
 * Field correction
 */
export interface FieldCorrection {
  field: string;
  originalValue: string;
  correctedValue: string;
}

/**
 * Records list response
 */
export interface RecordsListResponse {
  records: Record[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Courses list response
 */
export interface CoursesListResponse {
  courses: CourseData[];
  total: number;
}

// ===== MCP Types =====

/**
 * MCP context for AI agents
 */
export interface McpContext {
  '@context': string;
  type: string;
  userId: string;
  recordId: string;
  entities: Record<string, any>;
  provenance: Provenance;
}

/**
 * Data provenance information
 */
export interface Provenance {
  verifiedBy: string;
  source: string;
  version: number;
  recordURI: string;
  timestamp: string;
}

// ===== Error Types =====

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

// ===== Filter Types =====

/**
 * Records filter parameters
 */
export interface RecordsFilter {
  recordType?: RecordType;
  source?: RecordSource;
  verified?: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}
