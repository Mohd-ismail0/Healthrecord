/**
 * Parse Handler
 * Parses uploaded documents using AWS Textract and Comprehend Medical
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';
import { ComprehendMedicalClient, DetectEntitiesV2Command } from '@aws-sdk/client-comprehendmedical';
import { v4 as uuidv4 } from 'uuid';
import { ParseRequestSchema } from '@healthtrack/schemas';
import { successResponse, errorResponse } from '../utils/response';

const textractClient = new TextractClient({});
const comprehendClient = new ComprehendMedicalClient({});
const BUCKET_NAME = process.env.UPLOADS_BUCKET || 'healthtrack-uploads';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    const validatedData = ParseRequestSchema.parse(body);
    
    // Extract text using Textract
    const textractCommand = new AnalyzeDocumentCommand({
      Document: {
        S3Object: {
          Bucket: BUCKET_NAME,
          Name: validatedData.s3Key,
        },
      },
      FeatureTypes: ['FORMS', 'TABLES'],
    });
    
    const textractResponse = await textractClient.send(textractCommand);
    
    // Extract text content
    const extractedText = textractResponse.Blocks
      ?.filter((block) => block.BlockType === 'LINE')
      .map((block) => block.Text)
      .join(' ') || '';
    
    // Analyze medical entities using Comprehend Medical
    const comprehendCommand = new DetectEntitiesV2Command({
      Text: extractedText,
    });
    
    const comprehendResponse = await comprehendClient.send(comprehendCommand);
    
    // Extract relevant medical information
    const extractedData: any = {
      rawText: extractedText,
      entities: {},
    };
    
    comprehendResponse.Entities?.forEach((entity) => {
      const category = entity.Category;
      const text = entity.Text;
      
      if (!extractedData.entities[category!]) {
        extractedData.entities[category!] = [];
      }
      
      extractedData.entities[category!].push({
        text,
        score: entity.Score,
        type: entity.Type,
      });
    });
    
    // Calculate confidence score
    const avgConfidence = comprehendResponse.Entities
      ? comprehendResponse.Entities.reduce((sum, e) => sum + (e.Score || 0), 0) / comprehendResponse.Entities.length
      : 0;
    
    const parseId = uuidv4();
    
    // Store parse result in cache (DynamoDB) for verification
    // TODO: Implement parse cache storage
    
    return successResponse({
      parseId,
      extractedData,
      confidence: avgConfidence,
      requiresVerification: avgConfidence < 0.9,
      recordType: validatedData.recordType,
    });
  } catch (error) {
    console.error('Parse handler error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    
    return errorResponse('Failed to parse document', 500);
  }
};
