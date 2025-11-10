# HealthTrack Deployment Guide

This guide covers deploying HealthTrack to AWS and app stores.

## Table of Contents

- [Prerequisites](#prerequisites)
- [AWS Infrastructure](#aws-infrastructure)
- [Frontend Deployment](#frontend-deployment)
- [Mobile App Deployment](#mobile-app-deployment)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)

## Prerequisites

### Required Tools

- Node.js >= 18.0.0
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`
- Expo CLI: `npm install -g expo-cli`
- Expo Application Services (EAS) CLI: `npm install -g eas-cli`

### AWS Account Setup

1. Create an AWS account if you don't have one
2. Configure AWS CLI with credentials:
   ```bash
   aws configure
   ```
3. Ensure you have appropriate IAM permissions for:
   - CloudFormation
   - Lambda
   - API Gateway
   - DynamoDB
   - S3
   - Cognito
   - Textract
   - Comprehend Medical

## AWS Infrastructure

### 1. Build Lambda Functions

```bash
# Navigate to API service
cd services/api

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### 2. Bootstrap CDK (First Time Only)

```bash
cd services/infra
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### 3. Deploy Infrastructure

```bash
# Install dependencies
npm install

# Synthesize CloudFormation template (optional - for review)
npm run synth

# Deploy all stacks
npm run deploy

# Or deploy with approval prompts
cdk deploy --all --require-approval never
```

### 4. Capture Outputs

After deployment, save the CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name HealthTrackStack \
  --query 'Stacks[0].Outputs' \
  --output json > outputs.json
```

Key outputs:
- `ApiUrl`: REST API endpoint
- `UserPoolId`: Cognito User Pool ID
- `UserPoolClientId`: Cognito Client ID
- `UploadsBucketName`: S3 bucket for uploads

## Frontend Deployment

### Web Application

#### Option 1: AWS Amplify

```bash
cd apps/web

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Option 2: S3 + CloudFront

```bash
cd apps/web

# Build production bundle
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Environment Variables

Create `.env.production`:

```env
VITE_API_URL=https://your-api-gateway-url.com/v1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxx
VITE_REGION=us-east-1
```

## Mobile App Deployment

### Setup EAS Build

```bash
cd apps/mobile

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

### Build for App Stores

#### iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

Requirements:
- Apple Developer Account ($99/year)
- iOS Distribution Certificate
- Provisioning Profile

#### Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

Requirements:
- Google Play Developer Account ($25 one-time)
- Keystore for signing

### Submit to Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

### Environment Configuration

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "API_URL": "https://api-dev.healthtrack.io/v1"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_URL": "https://api-staging.healthtrack.io/v1"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://api.healthtrack.io/v1"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy HealthTrack

on:
  push:
    branches: [main]

jobs:
  deploy-infrastructure:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Build API
        run: |
          cd services/api
          npm run build
      
      - name: Deploy CDK
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          cd services/infra
          npm run deploy

  deploy-web:
    needs: deploy-infrastructure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Build web app
        run: |
          cd apps/web
          npm install
          npm run build
      
      - name: Deploy to S3
        run: |
          aws s3 sync apps/web/dist/ s3://${{ secrets.WEB_BUCKET }} --delete

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build mobile app
        run: |
          cd apps/mobile
          eas build --platform all --non-interactive
```

## Monitoring

### CloudWatch Dashboards

```bash
aws cloudwatch put-dashboard \
  --dashboard-name HealthTrack \
  --dashboard-body file://monitoring/dashboard.json
```

### Alarms

```bash
# Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name healthtrack-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

### Logs

View Lambda logs:

```bash
aws logs tail /aws/lambda/healthtrack-upload-handler --follow
```

## Rollback

### Infrastructure

```bash
# List stack versions
aws cloudformation list-stack-resources --stack-name HealthTrackStack

# Rollback to previous version
cdk deploy --rollback
```

### Frontend

```bash
# Web - restore previous S3 version
aws s3api list-object-versions --bucket your-bucket

# Mobile - submit previous build
eas submit --id previous-build-id
```

## Post-Deployment Checklist

- [ ] Verify API endpoints are accessible
- [ ] Test authentication flow
- [ ] Confirm file uploads work
- [ ] Check OCR parsing functionality
- [ ] Verify database writes
- [ ] Test mobile app on physical devices
- [ ] Review CloudWatch logs for errors
- [ ] Set up monitoring alerts
- [ ] Update DNS records if needed
- [ ] Notify team of deployment

## Troubleshooting

### Common Issues

1. **Lambda timeout**: Increase timeout in CDK stack
2. **CORS errors**: Check API Gateway CORS configuration
3. **Cognito auth fails**: Verify User Pool settings
4. **Mobile build fails**: Check EAS credentials

### Support

- AWS Support: https://console.aws.amazon.com/support
- Expo Support: https://expo.dev/support
- GitHub Issues: https://github.com/your-org/healthtrack/issues

## Cost Optimization

- Use DynamoDB on-demand billing
- Set S3 lifecycle policies
- Enable Lambda reserved concurrency for predictable workloads
- Use CloudFront caching
- Monitor costs with AWS Cost Explorer

---

For questions or issues, contact the DevOps team.
