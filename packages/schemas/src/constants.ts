/**
 * Constants and configuration values
 */

// ===== API Configuration =====

export const API_VERSION = 'v1';

export const API_BASE_URLS = {
  production: 'https://api.healthtrack.io/v1',
  staging: 'https://api-staging.healthtrack.io/v1',
  development: 'http://localhost:3000/v1',
} as const;

export const MCP_CONTEXT_BASE_URL = 'https://mcp.healthtrack.io/schema/v1';

// ===== File Upload =====

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const UPLOAD_URL_EXPIRY = 3600; // 1 hour in seconds

// ===== Pagination =====

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// ===== Date Formats =====

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

// ===== Lab Test Reference Ranges =====

export const COMMON_LAB_TESTS = {
  hemoglobin: {
    name: 'Hemoglobin',
    unit: 'g/dL',
    normalRange: { min: 12.0, max: 16.0 },
  },
  glucose: {
    name: 'Blood Glucose (Fasting)',
    unit: 'mg/dL',
    normalRange: { min: 70, max: 100 },
  },
  cholesterol: {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    normalRange: { min: 0, max: 200 },
  },
  ldl: {
    name: 'LDL Cholesterol',
    unit: 'mg/dL',
    normalRange: { min: 0, max: 100 },
  },
  hdl: {
    name: 'HDL Cholesterol',
    unit: 'mg/dL',
    normalRange: { min: 40, max: 999 },
  },
  triglycerides: {
    name: 'Triglycerides',
    unit: 'mg/dL',
    normalRange: { min: 0, max: 150 },
  },
  creatinine: {
    name: 'Creatinine',
    unit: 'mg/dL',
    normalRange: { min: 0.6, max: 1.2 },
  },
  tsh: {
    name: 'TSH',
    unit: 'mIU/L',
    normalRange: { min: 0.4, max: 4.0 },
  },
} as const;

// ===== Course Status =====

export const COURSE_STATUS_LABELS = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
} as const;

// ===== Interpretation Labels =====

export const INTERPRETATION_LABELS = {
  low: 'Below Normal',
  normal: 'Normal',
  high: 'Above Normal',
  critical: 'Critical',
} as const;

export const INTERPRETATION_COLORS = {
  low: '#FFA500', // Orange
  normal: '#28A745', // Green
  high: '#FFA500', // Orange
  critical: '#DC3545', // Red
} as const;

// ===== Error Messages =====

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network connection failed',
  FILE_TOO_LARGE: `File size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
  INVALID_FILE_TYPE: 'File type not supported',
  PARSE_FAILED: 'Failed to parse document',
} as const;

// ===== Success Messages =====

export const SUCCESS_MESSAGES = {
  RECORD_CREATED: 'Record created successfully',
  RECORD_UPDATED: 'Record updated successfully',
  RECORD_DELETED: 'Record deleted successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  VERIFICATION_COMPLETE: 'Verification completed successfully',
  COURSE_UPDATED: 'Course updated successfully',
} as const;

// ===== AWS Configuration =====

export const AWS_REGIONS = {
  primary: 'us-east-1',
  secondary: 'us-west-2',
} as const;

export const DYNAMODB_TABLES = {
  records: 'healthtrack-records',
  users: 'healthtrack-users',
  parseCache: 'healthtrack-parse-cache',
} as const;

export const S3_BUCKETS = {
  uploads: 'healthtrack-uploads',
  processed: 'healthtrack-processed',
} as const;

// ===== Cognito Configuration =====

export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';

// ===== Lambda Function Names =====

export const LAMBDA_FUNCTIONS = {
  upload: 'healthtrack-upload-handler',
  parse: 'healthtrack-parse-handler',
  manualEntry: 'healthtrack-manual-entry-handler',
  verify: 'healthtrack-verify-handler',
  crud: 'healthtrack-crud-handler',
  recordApi: 'healthtrack-record-api-handler',
  mcpAdapter: 'healthtrack-mcp-adapter-handler',
} as const;
