/**
 * MCP (Model Context Protocol) Client for AI Agents
 */

import axios, { AxiosInstance } from 'axios';
import type { McpContext } from '@healthtrack/schemas';
import { MCP_CONTEXT_BASE_URL } from '@healthtrack/schemas';

export interface McpClientConfig {
  baseURL?: string;
  accessToken?: string;
}

export class HealthTrackMcpClient {
  private client: AxiosInstance;
  private accessToken?: string;

  constructor(config: McpClientConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || MCP_CONTEXT_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json',
      },
    });

    this.accessToken = config.accessToken;

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Get MCP context for a specific record
   */
  async getContext(recordId: string): Promise<McpContext> {
    const response = await this.client.get<McpContext>(`/context/${recordId}`);
    return response.data;
  }

  /**
   * Get lab report context
   */
  async getLabReportContext(reportId: string): Promise<McpContext> {
    const response = await this.client.get<McpContext>(`/context/lab-report/${reportId}`);
    return response.data;
  }

  /**
   * Get prescription/course context
   */
  async getPrescriptionContext(courseId: string): Promise<McpContext> {
    const response = await this.client.get<McpContext>(`/context/prescription/${courseId}`);
    return response.data;
  }

  /**
   * Get user's health summary context
   */
  async getUserHealthSummary(userId: string): Promise<McpContext> {
    const response = await this.client.get<McpContext>(`/context/user/${userId}/summary`);
    return response.data;
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.accessToken = undefined;
  }
}

export default HealthTrackMcpClient;
