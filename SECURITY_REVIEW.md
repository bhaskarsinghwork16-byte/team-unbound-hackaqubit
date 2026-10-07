# Final Security Review

## Implemented Controls
1. **Authentication:** Argon2id password hashing, `jose` JWT implementation for Access/Refresh tokens, 15-minute token expiry, HTTP-only Secure strict cookies.
2. **Authorization (RBAC):** Explicit role definitions (HEALTH_WORKER, DOCTOR, SYSTEM_ADMIN), fine-grained permission arrays, and API-level authorization checks.
3. **Data Protection (At Rest):** AES-256-GCM encryption on the offline local SQLite/JSON datastores. Opaque patient IDs (`PT-123`).
4. **Data Protection (In Transit):** Strict-Transport-Security, TLS enforcement expected in deployment, CORS restrictions.
5. **Input Validation:** Zod schemas deployed on patient creation/update APIs. Rejection of un-parsed structures protecting the MongoDB driver from NoSQL injections.
6. **Upload Security:** MIME-type validation and magic-byte checks preventing execution of malicious uploads.
7. **Compliance & Audit:** Consent metadata persistence, Tamper-Evident SHA-256 hash-chained security event logger, structured incident response plan.
8. **Rate Limiting:** IP-based sliding window rate-limiting at the Edge Middleware layer.

## Security Test Results
- **Authentication/Authorization tests:** Typescript compilation passes. Zod schemas accurately parse expected JSON payloads and reject invalid `sex` variants. `npx tsc --noEmit` verifies RBAC enums.
- **Dependency Audit:** `npm audit` found 9 vulnerabilities (Critical: `next`, High: `postcss`).
- **Secrets Scan:** `grep_search` confirmed zero hardcoded API keys or JWT secrets in source code.

## Accepted Risks
- **Next.js Critical DoS / SSRF (CVEs via npm audit):** The version `14.2.35` has known Server Component DoS issues. **Risk Accepted** because blind package upgrades during a hackathon/offline-demo state carry a high risk of breaking the build. Upgrades should be thoroughly regression-tested post-hackathon.
- **Edge Middleware limitations:** The in-memory rate limiter in `middleware.ts` is isolated per-isolate/region in Vercel Edge. A distributed rate limiter (like Redis) is required for production, but in-memory is accepted for prototype/hackathon purposes.
- **Fallback Encryption Key:** Local environment uses a deterministic hash if `ENCRYPTION_KEY` is missing in `development` mode to prevent app crashing. **Risk Accepted** for dev, but `throw` is enforced in `production`.

## Known Limitations
- The system does not implement Multi-Factor Authentication (MFA), which was listed as "where practical".
- Full integration of the RBAC layer over the local offline-sync database requires UI changes that are out of scope of the backend security architecture.

## Compliance Assumptions
- We assume that deploying this repository implies the infrastructure (e.g. MongoDB Atlas, Vercel) itself uses TLS and secure OS baselines.
- Alignment with DPDP/ABDM principles is structural (privacy by design, consent records). Legal compliance certification requires third-party auditing.

## Deployment Requirements
Before public launch, the following environment variables MUST be securely injected:
- `JWT_SECRET` (Strong > 32 character cryptographically random string)
- `ENCRYPTION_KEY` (Exact 64-character hex string)
- `MONGODB_URI`

## Future Hardening
- Implement a dedicated KMS (Key Management Service) instead of relying solely on `ENCRYPTION_KEY` in environment variables.
- Connect the append-only JSON audit chain to an external SIEM/Splunk or AWS CloudWatch.
- Implement UI boundaries reflecting the RBAC permissions.
