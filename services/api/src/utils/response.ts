/**
 * Utility functions for Lambda responses
 */

import { APIGatewayProxyResult } from 'aws-lambda';

export function successResponse(data: any, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data),
  };
}

export function errorResponse(
  message: string,
  statusCode = 500,
  error?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      error: error || 'ERROR',
      message,
    }),
  };
}
