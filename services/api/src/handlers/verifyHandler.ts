/**
 * Verify Handler
 * Verifies and saves parsed data after user confirmation
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { VerifyRequestSchema } from '@healthtrack/schemas';
import { putRecord, getParseCache, deleteParseCache } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = VerifyRequestSchema.parse(body);
    
    // Extract user ID from authorizer context
    const userId = event.requestContext.authorizer?.claims?.sub || 'anonymous';
    
    // Retrieve parse result from cache using parseId
    const parseCache = await getParseCache(validatedData.parseId);
    
    if (!parseCache) {
      return errorResponse('Parse result not found or expired', 404, 'NOT_FOUND');
    }
    
    // Verify the parse cache belongs to this user
    if (parseCache.userId !== userId) {
      return errorResponse('Unauthorized access to parse result', 403, 'FORBIDDEN');
    }
    
    const recordId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const record = {
      recordId,
      userId,
      recordType: parseCache.recordType,
      source: 'ocr',
      verified: true,
      version: 1,
      data: validatedData.data,
      corrections: validatedData.corrections,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    // Save to DynamoDB
    await putRecord(record);
    
    // Delete parse cache after successful verification
    await deleteParseCache(validatedData.parseId);
    
    return successResponse(record);
  } catch (error) {
    console.error('Verify handler error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    
    return errorResponse('Failed to verify record', 500);
  }
};
