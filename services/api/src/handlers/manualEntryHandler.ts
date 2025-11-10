/**
 * Manual Entry Handler
 * Handles manual data entry for health records
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { ManualEntryRequestSchema } from '@healthtrack/schemas';
import { putRecord } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = ManualEntryRequestSchema.parse(body);
    
    // Extract user ID from authorizer context
    const userId = event.requestContext.authorizer?.claims?.sub || 'anonymous';
    
    // Create record
    const recordId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const record = {
      recordId,
      userId,
      recordType: validatedData.recordType,
      source: 'manual',
      verified: true, // Manual entries are auto-verified
      version: 1,
      data: validatedData.data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    // Save to DynamoDB
    await putRecord(record);
    
    return successResponse(record, 201);
  } catch (error) {
    console.error('Manual entry handler error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    
    return errorResponse('Failed to create manual entry', 500);
  }
};
