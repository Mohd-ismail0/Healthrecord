/**
 * MCP Adapter Handler
 * Serves MCP-formatted context for AI agents
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { getRecord } from '../utils/dynamodb';
import { successResponse, errorResponse } from '../utils/response';

const MCP_CONTEXT_URL = 'https://mcp.healthtrack.io/schema/v1';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub || 'anonymous';
    const pathParameters = event.pathParameters || {};
    const recordId = pathParameters.recordId;

    if (!recordId) {
      return errorResponse('Record ID is required', 400, 'BAD_REQUEST');
    }

    // Retrieve record
    const record = await getRecord(recordId, userId);
    if (!record) {
      return errorResponse('Record not found', 404, 'NOT_FOUND');
    }

    // Transform to MCP context format
    const mcpContext = {
      '@context': MCP_CONTEXT_URL,
      type: record.recordType === 'labReport' ? 'LabReportContext' : 'PrescriptionContext',
      userId: record.userId,
      recordId: record.recordId,
      entities: record.data,
      provenance: {
        verifiedBy: record.verified ? 'User' : 'System',
        source: getSourceLabel(record.source),
        version: record.version,
        recordURI: `https://api.healthtrack.io/v1/records/${record.recordId}`,
        timestamp: record.updatedAt,
      },
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/ld+json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(mcpContext),
    };
  } catch (error) {
    console.error('MCP adapter handler error:', error);
    return errorResponse('Failed to generate MCP context', 500);
  }
};

function getSourceLabel(source: string): string {
  switch (source) {
    case 'manual':
      return 'Manual Entry';
    case 'ocr':
      return 'OCR + Manual Verification';
    case 'api':
      return 'API Integration';
    default:
      return source;
  }
}
