/**
 * DynamoDB utility functions
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const RECORDS_TABLE = process.env.RECORDS_TABLE || 'healthtrack-records';
const USERS_TABLE = process.env.USERS_TABLE || 'healthtrack-users';

export async function putRecord(item: any) {
  const command = new PutCommand({
    TableName: RECORDS_TABLE,
    Item: item,
  });
  return docClient.send(command);
}

export async function getRecord(recordId: string, userId: string) {
  const command = new GetCommand({
    TableName: RECORDS_TABLE,
    Key: { recordId, userId },
  });
  const result = await docClient.send(command);
  return result.Item;
}

export async function queryRecordsByUser(userId: string, limit = 50) {
  const command = new QueryCommand({
    TableName: RECORDS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Limit: limit,
    ScanIndexForward: false, // Sort by timestamp descending
  });
  const result = await docClient.send(command);
  return result.Items || [];
}

export async function updateRecord(recordId: string, userId: string, updates: any) {
  const updateExpression = Object.keys(updates)
    .map((key, index) => `#${key} = :val${index}`)
    .join(', ');
  
  const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
    acc[`#${key}`] = key;
    return acc;
  }, {} as Record<string, string>);
  
  const expressionAttributeValues = Object.keys(updates).reduce((acc, key, index) => {
    acc[`:val${index}`] = updates[key];
    return acc;
  }, {} as Record<string, any>);

  const command = new UpdateCommand({
    TableName: RECORDS_TABLE,
    Key: { recordId, userId },
    UpdateExpression: `SET ${updateExpression}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });
  
  const result = await docClient.send(command);
  return result.Attributes;
}

export async function deleteRecord(recordId: string, userId: string) {
  const command = new DeleteCommand({
    TableName: RECORDS_TABLE,
    Key: { recordId, userId },
  });
  return docClient.send(command);
}
