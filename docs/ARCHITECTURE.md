# HealthTrack Architecture Documentation

## Table of Contents
- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [Security](#security)
- [Deployment](#deployment)

## System Overview

HealthTrack is a unified healthcare record system that enables users to:
- Upload and parse medical documents (prescriptions, lab reports)
- Manually enter health records
- Verify OCR-parsed data
- Track active and past medication courses
- View lab test results with trend analysis
- Export data via REST, GraphQL, and MCP APIs for AI agents

### Core Principles
1. **API-First**: All functionality accessible via REST, GraphQL, and MCP
2. **Cross-Platform**: React Web + React Native (iOS/Android) monorepo
3. **Serverless**: AWS Lambda + DynamoDB + S3
4. **Secure & Compliant**: HIPAA-ready with end-to-end encryption
5. **Extensible**: Modular architecture for easy feature additions

## Architecture Diagram

```
┌──────────────────────────────────────┐
│ External Systems / AI Agents / Labs  │
│  → REST, GraphQL, or MCP Context APIs │
└──────────────────┬───────────────────┘
                   │
      ┌────────────┴────────────┐
      │   AWS API Gateway       │
      │ (REST + AppSync GQL)    │
      └────────────┬────────────┘
                   │
 ┌─────────────────────────────────────────────────┐
 │           AWS Lambda Layer                       │
 │─────────────────────────────────────────────────│
 │ • uploadHandler → S3 upload + Textract          │
 │ • parseHandler → OCR + Comprehend Medical       │
 │ • manualEntryHandler → manual data input        │
 │ • verifyHandler → confirm parsed data           │
 │ • crudHandler → CRUD for courses/reports        │
 │ • recordAPIHandler → data output APIs           │
 │ • mcpAdapterHandler → MCP context serving       │
 └─────────────────────────────────────────────────┘
        │               │                  │
        ▼               ▼                  ▼
  [DynamoDB]     [S3 Encrypted]    [MCP Context]
  Structured      PDF/Images        JSON-LD AI
      │
      ▼
┌────────────────────────────────────────┐
│  FRONTENDS                             │
│  ├── React Web (Vite)                  │
│  ├── React Native (iOS/Android)        │
│  ├── Upload / Parse / Verify           │
│  ├── Manual Entry Forms                │
│  ├── Courses Tab (Active / Past)       │
│  ├── Lab Reports Table (+ % Change)    │
│  └── Export / AI Insights              │
└────────────────────────────────────────┘
```

## Components

### 1. Frontend Applications

#### Web App (`apps/web`)
- **Framework**: React 18 + Vite
- **State Management**: React Query + Context API
- **UI Library**: Tailwind CSS + Radix UI
- **Features**:
  - File upload with drag-and-drop
  - Data verification interface
  - Responsive tables for lab reports
  - Course management dashboard

#### Mobile App (`apps/mobile`)
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **Features**:
  - Camera integration for document capture
  - Biometric authentication
  - Push notifications for medication reminders
  - Offline-first architecture

### 2. Shared Packages

#### UI Kit (`packages/ui-kit`)
- Shared React Native components
- Cross-platform design system
- Reusable form components
- Theme configuration

#### API Client (`packages/api-client`)
- REST client with axios
- GraphQL client with Apollo
- MCP context utilities
- Type-safe API calls

#### Schemas (`packages/schemas`)
- TypeScript type definitions
- Zod validation schemas
- JSON schema definitions
- GraphQL type generators

### 3. Backend Services

#### API Service (`services/api`)
Lambda handlers for:
- **uploadHandler**: Generate pre-signed S3 URLs
- **parseHandler**: Textract + Comprehend Medical integration
- **manualEntryHandler**: Process manual data entry
- **verifyHandler**: User verification workflow
- **crudHandler**: Record CRUD operations
- **recordAPIHandler**: Partner API endpoints
- **mcpAdapterHandler**: MCP context generation

#### Infrastructure (`services/infra`)
AWS CDK stacks:
- API Gateway + AppSync configuration
- Lambda functions deployment
- DynamoDB tables
- S3 buckets with encryption
- Cognito user pools
- IAM roles and policies

## Data Flow

### 1. Upload & Parse Flow
```
User uploads file
  → Frontend requests upload URL (uploadHandler)
  → File uploaded to S3
  → Frontend triggers parse (parseHandler)
  → Textract extracts text
  → Comprehend Medical extracts entities
  → Parsed data returned to frontend
  → User verifies/edits data
  → Verified data saved (verifyHandler)
  → Record stored in DynamoDB
```

### 2. Manual Entry Flow
```
User fills form
  → Validation on frontend
  → Submit to manualEntryHandler
  → Data saved to DynamoDB (auto-verified)
  → Success response to frontend
```

### 3. Partner API Flow
```
Lab/Hospital POSTs to /lab-report or /prescription
  → Authentication via API key
  → Validation against schema
  → Data saved (system-verified)
  → Webhook notification to user (optional)
```

### 4. MCP Context Flow
```
AI Agent requests /context/:recordId
  → mcpAdapterHandler retrieves record
  → Transforms to JSON-LD format
  → Returns structured context
  → Agent processes with full provenance
```

## Data Model

### Unified Record Schema
```typescript
interface Record {
  recordId: string;        // UUID
  userId: string;          // User identifier
  recordType: 'labReport' | 'course';
  source: 'manual' | 'ocr' | 'api';
  verified: boolean;
  version: number;
  data: object;            // Dynamic per recordType
  mcpContextURI: string;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

### Course Data Structure
```typescript
interface CourseData {
  courseId: string;
  medicine: string;
  dosage: string;
  frequency?: string;
  startDate: string;       // ISO date
  endDate: string;         // ISO date
  doctor: string;
  doctorSpecialty?: string;
  status: 'active' | 'paused' | 'completed';
  daysRemaining?: number;  // Auto-calculated
  notes?: string;
}
```

### Lab Report Data Structure
```typescript
interface LabReportData {
  testId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange?: string;
  testDate: string;
  labName?: string;
  interpretation?: 'low' | 'normal' | 'high' | 'critical';
  previousValue?: number;
  changePercent?: number;  // Auto-calculated
}
```

## Security

### Authentication & Authorization
- **AWS Cognito**: User authentication with JWT tokens
- **OAuth 2.0**: Social login support
- **Biometric**: Optional fingerprint/face authentication on mobile
- **MFA**: Multi-factor authentication for sensitive operations
- **Role-Based Access Control (RBAC)**:
  - Patient: Full access to own records
  - Doctor: Read access to patient records (with consent)
  - Lab: Write access to lab reports only
  - AI Agent: Read-only context access
  - Admin: System administration

### Data Encryption
- **At Rest**: 
  - S3: AES-256 encryption
  - DynamoDB: Encryption at rest enabled
  - Secrets Manager: API keys and credentials
- **In Transit**: TLS 1.2+ for all communications
- **Field-Level Encryption**: PII fields encrypted in DynamoDB

### Compliance
- **HIPAA**: Business Associate Agreement (BAA) with AWS
- **GDPR**: Right to deletion, data portability, consent management
- **Audit Logging**: CloudTrail for all API calls
- **Data Retention**: Configurable retention policies

## Deployment

### CI/CD Pipeline
```
GitHub Actions
  → Lint & Test
  → Build Frontend Apps
  → Package Lambda Functions
  → Deploy Infrastructure (CDK)
  → Deploy Frontend (S3 + CloudFront)
  → Run E2E Tests
  → Production Deployment (manual approval)
```

### Environments
1. **Development**: Auto-deploy on push to `develop` branch
2. **Staging**: Auto-deploy on push to `staging` branch
3. **Production**: Manual deployment with approval

### Monitoring & Observability
- **CloudWatch**: Logs, metrics, and alarms
- **X-Ray**: Distributed tracing
- **CloudWatch Insights**: Log analytics
- **Custom Metrics**: API latency, error rates, user activity
- **Dashboards**: Real-time system health monitoring

### Scalability
- **Lambda**: Auto-scales to handle traffic
- **DynamoDB**: On-demand capacity mode
- **S3**: Unlimited storage
- **API Gateway**: 10,000 RPS per account
- **CloudFront**: Global CDN for frontend

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start web app
npm run dev:web

# Start mobile app
npm run dev:mobile

# Run tests
npm test

# Lint code
npm run lint
```

### Testing Strategy
- **Unit Tests**: Jest for business logic
- **Integration Tests**: Lambda handler testing with LocalStack
- **E2E Tests**: Playwright for web, Detox for mobile
- **API Tests**: Postman/Newman for API contracts

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb style guide
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for linting
- **Conventional Commits**: Standardized commit messages

## Future Enhancements

### Phase 3+ Features
1. **AI Insights**: ML-based health trend analysis
2. **FHIR Integration**: HL7 FHIR R4 compatibility
3. **Telemedicine**: Video consultation integration
4. **Wearable Integration**: Apple Health, Google Fit sync
5. **Medication Reminders**: Smart notifications
6. **Family Sharing**: Multi-user access with permissions
7. **Emergency Access**: Break-glass access for emergencies
8. **International**: Multi-language, multi-region support

## References
- [OpenAPI Specification](./openapi.yaml)
- [GraphQL Schema](./graphql-schema.graphql)
- [MCP Schema](./mcp-schema.jsonld)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [HIPAA Compliance on AWS](https://aws.amazon.com/compliance/hipaa-compliance/)
