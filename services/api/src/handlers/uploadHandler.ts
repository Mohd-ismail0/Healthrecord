/**
 * Upload Handler
 * Generates pre-signed S3 URLs for file uploads
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { UploadUrlRequestSchema } from '@healthtrack/schemas';
import { successResponse, errorResponse } from '../utils/response';

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.UPLOADS_BUCKET || 'healthtrack-uploads';
const URL_EXPIRY = 3600; // 1 hour

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = UploadUrlRequestSchema.parse(body);
    
    // Extract user ID from authorizer context
    const userId = event.requestContext.authorizer?.claims?.sub || 'anonymous';
    
    // Generate unique S3 key
    const fileExtension = validatedData.fileName.split('.').pop();
    const s3Key = `uploads/${userId}/${uuidv4()}.${fileExtension}`;
    
    // Create pre-signed URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: validatedData.fileType,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: URL_EXPIRY });
    
    return successResponse({
      uploadUrl,
      s3Key,
      expiresIn: URL_EXPIRY,
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    
    return errorResponse('Failed to generate upload URL', 500);
  }
};
