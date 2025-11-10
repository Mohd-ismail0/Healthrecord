/**
 * HealthTrack AWS CDK Stack
 * Defines all AWS infrastructure for HealthTrack
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';

export class HealthTrackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ===== DynamoDB Tables =====

    const recordsTable = new dynamodb.Table(this, 'RecordsTable', {
      tableName: 'healthtrack-records',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'recordId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'healthtrack-users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ===== S3 Buckets =====

    const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `healthtrack-uploads-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedHeaders: ['*'],
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteOldUploads',
          enabled: true,
          expiration: cdk.Duration.days(30),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const processedBucket = new s3.Bucket(this, 'ProcessedBucket', {
      bucketName: `healthtrack-processed-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ===== Cognito User Pool =====

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'healthtrack-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = userPool.addClient('WebClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
      },
    });

    // ===== Lambda Functions =====

    const lambdaEnvironment = {
      RECORDS_TABLE: recordsTable.tableName,
      USERS_TABLE: usersTable.tableName,
      UPLOADS_BUCKET: uploadsBucket.bucketName,
      PROCESSED_BUCKET: processedBucket.bucketName,
    };

    const uploadHandler = new lambda.Function(this, 'UploadHandler', {
      functionName: 'healthtrack-upload-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../api/dist'),
      handler: 'handlers/uploadHandler.handler',
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
    });

    const parseHandler = new lambda.Function(this, 'ParseHandler', {
      functionName: 'healthtrack-parse-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../api/dist'),
      handler: 'handlers/parseHandler.handler',
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
    });

    const manualEntryHandler = new lambda.Function(this, 'ManualEntryHandler', {
      functionName: 'healthtrack-manual-entry-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../api/dist'),
      handler: 'handlers/manualEntryHandler.handler',
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
    });

    const verifyHandler = new lambda.Function(this, 'VerifyHandler', {
      functionName: 'healthtrack-verify-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../api/dist'),
      handler: 'handlers/verifyHandler.handler',
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
    });

    const crudHandler = new lambda.Function(this, 'CrudHandler', {
      functionName: 'healthtrack-crud-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../api/dist'),
      handler: 'handlers/crudHandler.handler',
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
    });

    const mcpAdapterHandler = new lambda.Function(this, 'McpAdapterHandler', {
      functionName: 'healthtrack-mcp-adapter-handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('../api/dist'),
      handler: 'handlers/mcpAdapterHandler.handler',
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30),
    });

    // ===== Grant Permissions =====

    uploadsBucket.grantPut(uploadHandler);
    uploadsBucket.grantRead(parseHandler);
    recordsTable.grantReadWriteData(manualEntryHandler);
    recordsTable.grantReadWriteData(verifyHandler);
    recordsTable.grantReadWriteData(crudHandler);
    recordsTable.grantReadData(mcpAdapterHandler);

    // Grant Textract and Comprehend Medical permissions
    parseHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'textract:AnalyzeDocument',
          'textract:DetectDocumentText',
          'comprehendmedical:DetectEntitiesV2',
          'comprehendmedical:DetectPHI',
        ],
        resources: ['*'],
      })
    );

    // ===== API Gateway =====

    const api = new apigateway.RestApi(this, 'HealthTrackApi', {
      restApiName: 'HealthTrack API',
      description: 'HealthTrack REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // API Resources
    const v1 = api.root.addResource('v1');

    // Upload endpoint
    const upload = v1.addResource('upload');
    upload.addMethod('POST', new apigateway.LambdaIntegration(uploadHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Parse endpoint
    const parse = v1.addResource('parse');
    parse.addMethod('POST', new apigateway.LambdaIntegration(parseHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Manual entry endpoint
    const manualEntry = v1.addResource('manual-entry');
    manualEntry.addMethod('POST', new apigateway.LambdaIntegration(manualEntryHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Verify endpoint
    const verify = v1.addResource('verify');
    verify.addMethod('POST', new apigateway.LambdaIntegration(verifyHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Records endpoints
    const records = v1.addResource('records');
    records.addMethod('GET', new apigateway.LambdaIntegration(crudHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const recordById = records.addResource('{recordId}');
    recordById.addMethod('GET', new apigateway.LambdaIntegration(crudHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    recordById.addMethod('PATCH', new apigateway.LambdaIntegration(crudHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    recordById.addMethod('DELETE', new apigateway.LambdaIntegration(crudHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // MCP Context endpoint
    const context = v1.addResource('context');
    const contextById = context.addResource('{recordId}');
    contextById.addMethod('GET', new apigateway.LambdaIntegration(mcpAdapterHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // ===== Outputs =====

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'UploadsBucketName', {
      value: uploadsBucket.bucketName,
      description: 'S3 Uploads Bucket Name',
    });

    new cdk.CfnOutput(this, 'RecordsTableName', {
      value: recordsTable.tableName,
      description: 'DynamoDB Records Table Name',
    });
  }
}
