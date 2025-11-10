/**
 * CRUD Handler
 * Handles CRUD operations for health records
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { getRecord, queryRecordsByUser, updateRecord, deleteRecord } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub || 'anonymous';
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const recordId = pathParameters.recordId;

    // GET /records - List all records
    if (httpMethod === 'GET' && !recordId) {
      const records = await queryRecordsByUser(userId);
      return successResponse({
        records,
        total: records.length,
        limit: 50,
        offset: 0,
        hasMore: false,
      });
    }

    // GET /records/:recordId - Get specific record
    if (httpMethod === 'GET' && recordId) {
      const record = await getRecord(recordId, userId);
      if (!record) {
        return errorResponse('Record not found', 404, 'NOT_FOUND');
      }
      return successResponse(record);
    }

    // PATCH /records/:recordId - Update record
    if (httpMethod === 'PATCH' && recordId) {
      const body = JSON.parse(event.body || '{}');
      const updates = {
        ...body,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedRecord = await updateRecord(recordId, userId, updates);
      return successResponse(updatedRecord);
    }

    // DELETE /records/:recordId - Delete record
    if (httpMethod === 'DELETE' && recordId) {
      await deleteRecord(recordId, userId);
      return successResponse({ message: 'Record deleted successfully' });
    }

    return errorResponse('Invalid request', 400, 'BAD_REQUEST');
  } catch (error) {
    console.error('CRUD handler error:', error);
    return errorResponse('Operation failed', 500);
  }
};
