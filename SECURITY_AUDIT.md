# HealthScreen AI Security Audit & Boundaries Map

This document tracks the current security boundaries, assumptions, and missing controls as established during Phase 1.

## 1. Application Boundaries

- **Flutter Mobile App**: 100% offline edge AI. Stores data locally via SQLite.
- **Next.js Web Platform**: Server-rendered React application acting as the dashboard and primary API interface.
- **API Routes (`app/api/*`)**: Exposes REST-like endpoints for clients. Needs full rate limiting, authentication, authorization, and input validation.
- **MongoDB Database**: The source of truth when online.
- **Local Fallback Data**: `data/*.json` files used when MongoDB is inaccessible. Needs protection as it may contain PII.

## 2. API Endpoints Map (Needs Protection in Phase 2/3)

- `/api/analytics`: Reads analytics metrics.
- `/api/datasets`: Exposes dataset metadata.
- `/api/health`: Health check endpoint.
- `/api/metrics`: Generic metrics endpoint.
- `/api/models`: Exposes model metadata.
- `/api/patients`: CRUD operations for patient records.
- `/api/referrals`: CRUD operations for clinical referrals.
- `/api/reports`: Report generation endpoint.
- `/api/screenings`: Core screening inference and saving endpoint.

## 3. Data Entry/Exit Paths

- **Patient Intake**: Web UI and Mobile UI forms. (Needs strict sanitization to prevent XSS/NoSQLi).
- **Image Capture**: Uploaded via Web or captured via Mobile. (Needs strict MIME type and content validation, EXIF stripping).
- **Offline Sync Queue**: Mobile syncs via API when online. (Needs replay protection and authentication).
- **Database Reads/Writes**: `lib/db-store.ts` handles MongoDB operations. No raw NoSQL injection detected, but schemas and rigid types must be enforced on all parameters.

## 4. Current State Deficiencies

- **Authentication / Authorization**: None currently present. Anyone can hit the endpoints and access data.
- **Data Protection at Rest**: Local JSON and SQLite data are currently plaintext.
- **Audit Logging**: Application currently logs with `console.log` which can leak PII if error objects are logged entirely. (Mitigated in Phase 1 via `lib/security/logger.ts`).
- **CORS / Rate Limiting**: Not implemented natively yet.

## 5. Assumptions

- We are building on Next.js 14 API routes (serverless environment).
- The `lib/db-store.ts` is the central choke point for database access and is the ideal place to enforce data boundaries before storage.
- The Mobile app handles its own offline caching but API security must treat the Mobile app as untrusted.
