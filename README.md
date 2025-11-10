# 🏗️ HealthTrack - Unified Healthcare Record System

A comprehensive healthcare record management system enabling users to upload, parse, verify, or manually enter prescriptions & lab reports — accessible across Web, Android, iOS, and API/MCP consumers.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Security & Compliance](#security--compliance)

## 🎯 Overview

HealthTrack is a serverless, HIPAA-ready healthcare record system with:

- **Multi-platform Support**: React Web + React Native (iOS/Android)
- **Multiple Data Entry Modes**: Upload & OCR, Manual Entry, Partner API Integration
- **AI-Ready**: MCP (Model Context Protocol) support for AI agents
- **Secure & Compliant**: End-to-end encryption, HIPAA/GDPR ready
- **Scalable Architecture**: AWS serverless infrastructure

### Key Features

✅ **Upload & Parse**: OCR extraction from PDFs/images using AWS Textract + Comprehend Medical  
✅ **Manual Entry**: Type prescriptions and lab reports directly  
✅ **Verification Workflow**: User confirms/edits OCR results before saving  
✅ **Courses Tab**: Track active & past medication courses  
✅ **Lab Reports**: View test results with % change tracking  
✅ **MCP Context API**: JSON-LD output for AI agents  
✅ **Cross-Platform**: Single codebase for Web & Mobile  

## 🏛️ Architecture

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
 ┌─────────────────────────────────────┐
 │        AWS Lambda Layer             │
 │─────────────────────────────────────│
 │ • uploadHandler                     │
 │ • parseHandler                      │
 │ • manualEntryHandler                │
 │ • verifyHandler                     │
 │ • crudHandler                       │
 │ • mcpAdapterHandler                 │
 └─────────────────────────────────────┘
        │           │           │
        ▼           ▼           ▼
  [DynamoDB]   [S3 AES-256]  [MCP JSON-LD]
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🛠️ Tech Stack

### Frontend
- **Web**: React 18 + Vite + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo + React Native Paper
- **State Management**: TanStack Query (React Query)
- **Navigation**: React Router (Web), React Navigation (Mobile)

### Backend
- **Compute**: AWS Lambda (Node.js 18)
- **API**: AWS API Gateway (REST) + AppSync (GraphQL)
- **Database**: DynamoDB
- **Storage**: S3 with encryption
- **Auth**: AWS Cognito (JWT/OAuth2)
- **AI/ML**: AWS Textract + Comprehend Medical
- **IaC**: AWS CDK (TypeScript)

### Shared Packages
- **@healthtrack/schemas**: TypeScript types + Zod validation
- **@healthtrack/api-client**: REST/GraphQL/MCP clients
- **@healthtrack/ui-kit**: Shared React Native components

## 📁 Project Structure

```
healthtrack/
├── apps/
│   ├── web/              # React web app (Vite)
│   └── mobile/           # React Native app (Expo)
├── packages/
│   ├── ui-kit/           # Shared React Native components
│   ├── api-client/       # API clients (REST/GraphQL/MCP)
│   └── schemas/          # TypeScript types & Zod schemas
├── services/
│   ├── api/              # Lambda function handlers
│   └── infra/            # AWS CDK infrastructure
├── docs/
│   ├── openapi.yaml      # OpenAPI 3.0 specification
│   ├── graphql-schema.graphql
│   ├── mcp-schema.jsonld
│   └── ARCHITECTURE.md
├── package.json          # Root workspace configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- AWS CLI configured (for deployment)
- Expo CLI (for mobile development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/healthtrack.git
cd healthtrack

# Install dependencies
npm install

# Build shared packages
npm run build
```

### Environment Setup

Create `.env` files in each app:

**apps/web/.env**
```env
VITE_API_URL=http://localhost:3000/v1
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```

**apps/mobile/.env**
```env
API_URL=http://localhost:3000/v1
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
```

## 💻 Development

### Run Web App

```bash
npm run dev:web
# Opens http://localhost:3000
```

### Run Mobile App

```bash
npm run dev:mobile
# Starts Expo Dev Server
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR with Expo Go app
```

### Build Packages

```bash
# Build all packages
npm run build

# Watch mode for development
cd packages/schemas && npm run dev
```

### Run Tests

```bash
npm test
```

### Lint & Format

```bash
npm run lint
npm run format
```

## 🚢 Deployment

### Deploy Infrastructure

```bash
# Navigate to infra directory
cd services/infra

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy all stacks
npm run deploy

# Or deploy specific stack
cdk deploy HealthTrackStack
```

### Deploy Frontend

**Web (to S3 + CloudFront)**
```bash
cd apps/web
npm run build
# Upload dist/ to S3 bucket
```

**Mobile (to App Stores)**
```bash
cd apps/mobile
eas build --platform all
eas submit
```

## 📖 API Documentation

### REST API

- **Base URL**: `https://api.healthtrack.io/v1`
- **Authentication**: Bearer JWT token (Cognito)
- **Full Spec**: [docs/openapi.yaml](docs/openapi.yaml)

**Key Endpoints:**

```
POST   /v1/upload           # Get pre-signed S3 URL
POST   /v1/parse            # Parse document with OCR
POST   /v1/manual-entry     # Create manual record
POST   /v1/verify           # Verify parsed data
GET    /v1/records          # List all records
GET    /v1/records/:id      # Get specific record
GET    /v1/courses/active   # Get active courses
GET    /v1/courses/past     # Get past courses
GET    /v1/context/:id      # MCP context for AI
```

### GraphQL API

- **Endpoint**: `https://api.healthtrack.io/v1/graphql`
- **Schema**: [docs/graphql-schema.graphql](docs/graphql-schema.graphql)

### MCP Context API

- **Format**: JSON-LD
- **Schema**: [docs/mcp-schema.jsonld](docs/mcp-schema.jsonld)
- **Example**: `GET /v1/context/LR456`

## ✨ Features

### 1. Upload & Parse
- Drag & drop file upload
- Camera integration (mobile)
- OCR with AWS Textract
- Medical entity extraction with Comprehend Medical
- User verification workflow

### 2. Courses Tab
- Active medication tracking
- Auto-calculated days remaining
- Status management (active/paused/completed)
- Doctor and dosage information

### 3. Lab Reports
- Tabular view with test history
- % change calculation vs. previous values
- Interpretation indicators (low/normal/high/critical)
- Reference range display

### 4. Data Entry Modes

| Mode | Source | Verification | Use Case |
|------|--------|--------------|----------|
| Manual Entry | User types | Auto-verified | Quick data entry |
| Upload + OCR | File scan | User-verified | PDFs, scans |
| Partner API | External system | System-verified | Labs, EHR integration |

## 🔒 Security & Compliance

### Authentication & Authorization
- AWS Cognito JWT tokens
- OAuth 2.0 support
- Biometric authentication (mobile)
- Role-based access control (RBAC)

### Data Encryption
- **At Rest**: S3 + DynamoDB AES-256 encryption
- **In Transit**: TLS 1.2+
- **Field-Level**: PII encryption in DynamoDB

### Compliance
- **HIPAA**: AWS BAA + encryption + audit logging
- **GDPR**: Data portability, right to deletion
- **Audit Logs**: CloudTrail for all API calls

### Privacy
- User data segregation
- Consent management
- Configurable data retention policies

## 📊 Roadmap

### Phase 1 (Current)
- ✅ Auth + Upload/Parse/Manual flows
- ✅ CRUD API + Courses + Lab Reports UI

### Phase 2 (Next)
- ⏳ Partner APIs + MCP Integration
- ⏳ Push notifications + Reminders
- ⏳ Export functionality (PDF, CSV, FHIR)

### Phase 3 (Future)
- 🔮 AI Insights + Health Trends
- 🔮 FHIR R4 Interoperability
- 🔮 Telemedicine Integration
- 🔮 Wearable Device Sync

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

See [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Email**: support@healthtrack.io

---

**Built with ❤️ for better healthcare data management**

**HIPAA Compliant • Serverless • Cross-Platform • AI-Ready**
