# Threat Model

## Identified Threats & Defenses

| Threat | Attack | Expected Defence |
|---|---|---|
| Stolen account | Credential abuse | JWT/session controls + RBAC + Rate limiting (15 min token expiry) |
| JWT theft/tampering | Modified/replayed token | HS256 signature, expiry enforcement, session invalidation on logout |
| Unauthorized patient access | IDOR | Resource authorization (`canAccessPatient` checks facility ID limits) |
| NoSQL injection | Mongo operators | Strict schemas/allowlists via Zod on API boundaries |
| Malicious image | Disguised/oversized file | Magic byte validation, MIME-type checks, and strict 5MB size limit |
| Data leakage | Logs/API responses | Data minimization and sanitization wrapper over all logging |
| Offline theft | Device/database access | AES-256-GCM encrypted local storage for offline files |
| Sync replay | Duplicate/malicious record | Authenticated API routes and duplicate check (implied in business logic) |
| Brute force | Repeated login attempts | Edge middleware rate limiting and backoff |
| Model tampering | Modified model file | SHA-256 integrity check against expected hash on model load |
| Insider abuse | Excessive permissions | Explicit RBAC and tamper-evident append-only audit trail |
| Token reuse | Refresh token replay | Refresh token rotation and session revocation upon reuse detection |
| CORS abuse | Unauthorized origin | Strict Next.js API allowed origins (configurable via env) |
| Malicious export | Bulk data extraction | `DATA_EXPORT` role requirement + audit trail logging |

## What We Do NOT Solve

The implemented security layer establishes defense-in-depth but does NOT solve:
- **Physical Device Compromise**: If an attacker gains full root access to the unlocked device running the app while the app is open.
- **Diagnostic Accuracy**: We do not validate the clinical accuracy of the AI model.
- **Zero-Day Next.js/Node.js exploits**: If the underlying frameworks have unpatched remote code execution vulnerabilities.
- **HIPAA / GDPR Certification**: We align with DPDP/ABDM principles but do not provide a legally binding certification.
