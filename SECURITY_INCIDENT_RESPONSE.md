# Security Incident Response Plan

## 1. Preparation & Detection
- The system generates `SECURITY_ALERT` events for repeated failed logins, rate limit triggers, and unauthorized access attempts.
- Monitor `/api/health` and logs for anomalies.

## 2. Containment
If an active threat is detected:
1. **Isolate:** Disconnect the database from external networks. Use AWS/GCP security groups to allow only trusted IPs.
2. **Revoke Sessions:** Run `invalidateAllUserSessions` for affected accounts.
3. **Rotate Secrets:** Rotate `JWT_SECRET` and `ENCRYPTION_KEY` in environment configurations immediately.

## 3. Eradication & Remediation
- Identify the root cause (e.g., leaked credentials, exploit in unpatched dependency).
- Apply patches and restore services from a clean state.
- Verify integrity of MongoDB and offline `data/*.json` files.

## 4. Recovery
- Restore service incrementally.
- Monitor heavily for 48 hours post-incident.

## 5. Post-Incident Review
- Create a post-mortem document.
- Inform users and stakeholders if patient data was compromised per local DPDP/HIPAA guidelines.
