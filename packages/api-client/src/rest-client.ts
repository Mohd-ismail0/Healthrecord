/**
 * REST API Client for HealthTrack
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type {
  Record,
  UploadUrlRequest,
  UploadUrlResponse,
  ParseRequest,
  ParseResponse,
  ManualEntryRequest,
  VerifyRequest,
  RecordsListResponse,
  CoursesListResponse,
  RecordsFilter,
  PaginationParams,
  ApiError,
  CourseData,
  LabReportData,
} from '@healthtrack/schemas';
import { API_BASE_URLS } from '@healthtrack/schemas';

export interface RestClientConfig {
  baseURL?: string;
  environment?: 'production' | 'staging' | 'development';
  accessToken?: string;
  onTokenExpired?: () => Promise<string>;
}

export class HealthTrackRestClient {
  private client: AxiosInstance;
  private onTokenExpired?: () => Promise<string>;

  constructor(config: RestClientConfig = {}) {
    const baseURL = config.baseURL || API_BASE_URLS[config.environment || 'development'];
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.onTokenExpired = config.onTokenExpired;

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401 && this.onTokenExpired) {
          // Token expired, try to refresh
          try {
            const newToken = await this.onTokenExpired();
            this.setAccessToken(newToken);
            
            // Retry the original request
            const originalRequest = error.config!;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(this.normalizeError(error));
      }
    );

    if (config.accessToken) {
      this.setAccessToken(config.accessToken);
    }
  }

  // ===== Auth Management =====

  private accessToken?: string;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  clearAccessToken(): void {
    this.accessToken = undefined;
  }

  // ===== Error Handling =====

  private normalizeError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      error: error.code || 'NETWORK_ERROR',
      message: error.message,
      statusCode: error.response?.status,
    };
  }

  // ===== Upload APIs =====

  /**
   * Request pre-signed S3 upload URL
   */
  async requestUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    const response = await this.client.post<UploadUrlResponse>('/upload', request);
    return response.data;
  }

  /**
   * Upload file to S3 using pre-signed URL
   */
  async uploadFile(uploadUrl: string, file: File | Blob): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  // ===== Parse APIs =====

  /**
   * Parse uploaded document using OCR
   */
  async parseDocument(request: ParseRequest): Promise<ParseResponse> {
    const response = await this.client.post<ParseResponse>('/parse', request);
    return response.data;
  }

  /**
   * Verify and save parsed data
   */
  async verifyRecord(request: VerifyRequest): Promise<Record> {
    const response = await this.client.post<Record>('/verify', request);
    return response.data;
  }

  // ===== Manual Entry APIs =====

  /**
   * Create manual entry
   */
  async createManualEntry(request: ManualEntryRequest): Promise<Record> {
    const response = await this.client.post<Record>('/manual-entry', request);
    return response.data;
  }

  // ===== Partner APIs =====

  /**
   * Create lab report (partner API)
   */
  async createLabReport(data: LabReportData): Promise<Record> {
    const response = await this.client.post<Record>('/lab-report', data);
    return response.data;
  }

  /**
   * Create prescription (partner API)
   */
  async createPrescription(data: CourseData): Promise<Record> {
    const response = await this.client.post<Record>('/prescription', data);
    return response.data;
  }

  // ===== Records APIs =====

  /**
   * List all records
   */
  async listRecords(
    filter?: RecordsFilter,
    pagination?: PaginationParams
  ): Promise<RecordsListResponse> {
    const response = await this.client.get<RecordsListResponse>('/records', {
      params: { ...filter, ...pagination },
    });
    return response.data;
  }

  /**
   * Get specific record
   */
  async getRecord(recordId: string): Promise<Record> {
    const response = await this.client.get<Record>(`/records/${recordId}`);
    return response.data;
  }

  /**
   * Update record
   */
  async updateRecord(recordId: string, data: Partial<Record>): Promise<Record> {
    const response = await this.client.patch<Record>(`/records/${recordId}`, data);
    return response.data;
  }

  /**
   * Delete record
   */
  async deleteRecord(recordId: string): Promise<void> {
    await this.client.delete(`/records/${recordId}`);
  }

  // ===== Courses APIs =====

  /**
   * Get active courses
   */
  async getActiveCourses(): Promise<CoursesListResponse> {
    const response = await this.client.get<CoursesListResponse>('/courses/active');
    return response.data;
  }

  /**
   * Get past courses
   */
  async getPastCourses(): Promise<CoursesListResponse> {
    const response = await this.client.get<CoursesListResponse>('/courses/past');
    return response.data;
  }

  /**
   * Update course status
   */
  async updateCourse(
    courseId: string,
    update: { status?: string; notes?: string }
  ): Promise<CourseData> {
    const response = await this.client.patch<CourseData>(
      `/courses/${courseId}`,
      update
    );
    return response.data;
  }

  // ===== MCP APIs =====

  /**
   * Get MCP context for AI agents
   */
  async getMcpContext(recordId: string): Promise<any> {
    const response = await this.client.get(`/context/${recordId}`, {
      headers: {
        Accept: 'application/ld+json',
      },
    });
    return response.data;
  }

  // ===== Generic Request Method =====

  /**
   * Make a custom API request
   */
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

// Default export for convenience
export default HealthTrackRestClient;
