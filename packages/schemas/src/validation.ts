/**
 * Zod validation schemas for HealthTrack
 */

import { z } from 'zod';
import { RecordType, RecordSource, CourseStatus, Interpretation } from './types';

// ===== Enum Schemas =====

export const RecordTypeSchema = z.nativeEnum(RecordType);
export const RecordSourceSchema = z.nativeEnum(RecordSource);
export const CourseStatusSchema = z.nativeEnum(CourseStatus);
export const InterpretationSchema = z.nativeEnum(Interpretation);

// ===== Course Schemas =====

export const CourseDataSchema = z.object({
  courseId: z.string().uuid(),
  medicine: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  doctor: z.string().min(1, 'Doctor name is required'),
  doctorSpecialty: z.string().optional(),
  status: CourseStatusSchema,
  daysRemaining: z.number().int().optional(),
  notes: z.string().optional(),
});

export const CreateCourseSchema = CourseDataSchema.omit({ 
  courseId: true, 
  daysRemaining: true 
});

export const UpdateCourseSchema = z.object({
  courseId: z.string().uuid(),
  status: CourseStatusSchema.optional(),
  notes: z.string().optional(),
});

// ===== Lab Report Schemas =====

export const LabTestDataSchema = z.object({
  testId: z.string().uuid(),
  testName: z.string().min(1, 'Test name is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  referenceRange: z.string().optional(),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  labName: z.string().optional(),
  interpretation: InterpretationSchema.optional(),
  previousValue: z.number().optional(),
  changePercent: z.number().optional(),
});

export const LabReportDataSchema = z.object({
  reportId: z.string().uuid(),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  labName: z.string().min(1, 'Lab name is required'),
  tests: z.array(LabTestDataSchema).min(1, 'At least one test is required'),
});

export const CreateLabReportSchema = LabReportDataSchema.omit({ reportId: true });

// ===== Record Schemas =====

export const RecordSchema = z.object({
  recordId: z.string().uuid(),
  userId: z.string().min(1),
  recordType: RecordTypeSchema,
  source: RecordSourceSchema,
  verified: z.boolean(),
  version: z.number().int().positive(),
  data: z.union([CourseDataSchema, LabReportDataSchema]),
  mcpContextURI: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ===== API Request Schemas =====

export const UploadUrlRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type'),
});

export const ParseRequestSchema = z.object({
  s3Key: z.string().min(1, 'S3 key is required'),
  recordType: RecordTypeSchema,
});

export const ManualEntryRequestSchema = z.object({
  recordType: RecordTypeSchema,
  data: z.union([CourseDataSchema, LabReportDataSchema]),
});

export const FieldCorrectionSchema = z.object({
  field: z.string().min(1),
  originalValue: z.string(),
  correctedValue: z.string(),
});

export const VerifyRequestSchema = z.object({
  parseId: z.string().uuid(),
  data: z.record(z.any()),
  corrections: z.array(FieldCorrectionSchema).optional(),
});

// ===== User Schemas =====

export const UserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ===== Filter Schemas =====

export const RecordsFilterSchema = z.object({
  recordType: RecordTypeSchema.optional(),
  source: RecordSourceSchema.optional(),
  verified: z.boolean().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const PaginationParamsSchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  cursor: z.string().optional(),
});

// ===== MCP Schemas =====

export const ProvenanceSchema = z.object({
  verifiedBy: z.string().min(1),
  source: z.string().min(1),
  version: z.number().int().positive(),
  recordURI: z.string().url(),
  timestamp: z.string().datetime(),
});

export const McpContextSchema = z.object({
  '@context': z.string().url(),
  type: z.string().min(1),
  userId: z.string().min(1),
  recordId: z.string().min(1),
  entities: z.record(z.any()),
  provenance: ProvenanceSchema,
});

// ===== Helper Functions =====

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely validate data, returning errors instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
