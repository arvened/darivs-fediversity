# DARIVS Fediversity

**Self-hosted decentralized charitable prediction platform with service portability and federation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub](https://img.shields.io/badge/Status-Active%20Development-brightgreen)

## 📌 About

DARIVS is an open-source platform enabling self-hosted charitable prediction markets. Users participate in skill-based prediction challenges, with **85% of transaction splits automatically routed to registered charities** through immutable smart contracts.

### Key Features

- 🏠 **Self-Hosted**: Deploy independently on your infrastructure
- 🔗 **Federated**: Connect with 50+ other instances
- 🔐 **Service Portability**: Users can migrate data without lock-in
- 📊 **Immutable Audit Trail**: SHA-256 hash chain for compliance
- 🌍 **Multi-Jurisdiction**: Support for EU, UK, UA, PL, DE, CH
- 🎯 **Proof of Skill**: Quality validation (60%+ accuracy threshold)
- ✅ **Open Source**: MIT License, full transparency

## 🎯 Problem Statement

Centralized platforms like GoFundMe and GlobalGiving create:
- **Vendor Lock-In**: Users cannot control their data or infrastructure
- **Data Silos**: Charities cannot access their donor information
- **Surveillance**: Platforms track all transactions
- **High Fees**: Centralized operators take significant cuts

**DARIVS solves this** by enabling any foundation to self-host their platform, maintain their database, and retain full sovereignty.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/arvened/darivs-fediversity.git
cd darivs-fediversity

# Copy environment variables
cp .env.example .env

# Start services
docker-compose up -d

# Check health
curl http://localhost:3000/health
Option 2: Local Development

# Install dependencies
npm install

# Setup database
createdb darivs
psql darivs < src/db/schema.sql

# Copy environment
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm run test

Project Structure
darivs-fediversity/
├── src/
│   ├── app.ts              # Fastify application bootstrap
│   ├── db/
│   │   └── schema.sql      # PostgreSQL schema
│   ├── models/
│   │   └── types.ts        # TypeScript interfaces
│   ├── federation/         # Federation layer (Week 3-4)
│   │   ├── protocol.ts     # JSON-LD federation protocol
│   │   └── registry.ts     # Instance discovery
│   ├── api/
│   │   ├── users/
│   │   ├── predictions/
│   │   ├── charities/
│   │   └── federation/     # Export/import endpoints
│   └── __tests__/          # Test suite
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md

Development Timeline

🔄 Development Timeline

Week 1-2: ✅ COMPLETE

	•	Project setup, database schema, type definitions
	•	CI/CD pipeline (GitHub Actions)
	•	Docker Compose stack
	•	Initial test suite

Week 3-4: IN PROGRESS

	•	Federation Protocol (JSON-LD)
	•	Instance Discovery Registry
	•	Data Export/Import API
	•	Database Migrations

Week 5-7: Backend Enhancements

	•	Split Calculator Service
	•	Hash Chain Implementation
	•	Tax Reporting Module
	•	Oracle Fallback System

Week 8-10: Frontend & UX

	•	Admin Dashboard
	•	Data Portability UI
	•	GDPR Data Download
	•	Real-time Updates

Week 11-13: Federation & Compliance

	•	Multi-Jurisdiction Configuration
	•	Dynamic Geo-Blocking
	•	Tax Report Generation
	•	GDPR Data Subject Requests

Week 14-15: Security Audit

	•	Independent Security Review
	•	Penetration Testing
	•	Cryptographic Verification
	•	Hardening

Week 16: Documentation & Deployment

	•	Self-Hosting Guides
	•	Federation Playbook
	•	API Documentation
	•	Docker Stack Finalization

💰 Transaction Split (85% to Charity)

const split = {
  userWin: 50%,           // User profit/loss
  charityAllocation: 35%, // IMMUTABLE to registered charities
  platformFee: 15%        // ARVEN operations
}
Immutable Audit Trail

Every transaction creates:

	1.	SHA-256 Hash: Current transaction hash
	2.	Hash Chain: Previous hash linked for tamper-proof history
	3.	Compliance Log: 6-phase audit trail
	4.	RSA Signature: Cryptographic verification

Phases: INITIATED → VALIDATED → SETTLED → REPORTED → ARCHIVED → AUDITED

Proof of Skill Validation

	•	Minimum accuracy threshold: 60%
	•	Multi-source oracle verification (3+ sources)
	•	Quality validation for all outcomes
	•	Legal classification: E-commerce (Game of Skill)

🌐 Federation Protocol

Instance Discovery

GET /federation/instances
→ Returns all connected instances + health status
Data Export (GDPR Compliance)

GET /federation/export/users
→ Returns all user data (JSON-LD format)
→ Requires authentication
→ Signed with RSA private key

Data Import (Portability)
POST /federation/import
→ Accept data package from another instance
→ Validate cryptographic signature
→ Check for conflicts
→ Merge or reject
User Migration

Users can migrate between instances by:

	1.	Exporting their complete data (transactions, predictions, profile)
	2.	Importing to target instance
	3.	Verifying data integrity
	4.	Migrating without data loss

🧪 Testing

Target Coverage: 75%+
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test

# Check coverage
open coverage/lcov-report/index.html
Test category
Unit Tests: Split calculation, hash chain, proof of skill
	•	Integration Tests: API endpoints, database operations
	•	E2E Tests: Complete workflows (via Playwright, Week 10+)
	•	Load Tests: 100+ concurrent users, 1000 predictions/min

🚢 Deployment

Docker Compoce ( Production)

# Build and deploy
docker-compose -f docker-compose.yml up -d

# Monitor
docker-compose logs -f api

# Scaling (multiple instances)
docker-compose up -d --scale api=3
Self-Hosted Guide (Weeks 14-16)

Complete guides for:

	•	Ubuntu 20.04+
	•	CentOS/RHEL 8+
	•	Kubernetes (Helm charts)
	•	NixOS

📊 Metrics & Monitoring

Health Endpoints
GET /health              # Basic health check
GET /api/v1/version      # API version info
GET /federation/status   # Federation status

🔧 API Documentation

Base URL

	•	Development: http://localhost:3000
	•	Production: https://api.your-instance.com

Authentication

All endpoints (except /health, /) require JWT token:
Authorization: Bearer <jwt_token>

Predictions

	•	POST /api/v1/predictions - Create prediction
	•	GET /api/v1/predictions/:id - Get prediction details
	•	GET /api/v1/predictions - List user predictions

Charities

	•	GET /api/v1/charities - List charities
	•	POST /api/v1/charities - Register charity
	•	GET /api/v1/charities/:id/transactions - Charity donations

Federation

	•	GET /federation/instances - List instances
	•	GET /federation/export/users - Export data
	•	POST /federation/import - Import data
	•	GET /federation/health - Instance health

Full OpenAPI spec: /api/docs

🛠️ Contributing

We welcome contributions!

	1.	Fork repository
	2.	Create feature branch: git checkout -b feature/week-X-feature-name
	3.	Make atomic commits: git commit -m "[WEEK-X] Feature description"
	4.	Push branch: git push origin feature/week-X-feature-name
	5.	Create Pull Request

Commit Message Format

[WEEK-X] Short description (50 chars max)

Longer explanation if needed, wrapping at 72 chars.
- Include what changed
- Why it changed
- Any breaking changes

[WEEK-X] Short description (50 chars max)

Longer explanation if needed, wrapping at 72 chars.
- Include what changed
- Why it changed
- Any breaking changes
Made












