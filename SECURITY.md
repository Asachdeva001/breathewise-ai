# Security Policy — BreatheWise AI Platform

## Overview & Privacy-First Architecture
BreatheWise AI is engineered with defense-in-depth security principles to protect user privacy, prevent unauthorized execution, and ensure environmental decision-support integrity.

---

### 🛡️ Core Security Controls

1. **Zero Personally Identifiable Information (Zero-PII)**:
   - BreatheWise AI collects zero personal names, email addresses, phone numbers, or exact street GPS coordinates.
   - User profiles and vulnerability contexts are anonymized with ephemeral session identifiers and stored client-side or in volatile in-memory sessions.
   - No sensitive medical records are processed or retained.

2. **Network & Header Hardening (Helmet + CSP)**:
   - **Content Security Policy (CSP)**: Strict Helmet directives explicitly restrict script execution to same-origin and trusted CDNs (`'self'`, `'unsafe-inline'`), Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`), and verified telemetry APIs (`https://air-quality-api.open-meteo.com`, `https://geocoding-api.open-meteo.com`).
   - **Frame Protection**: Frame embedding is strictly restricted (`X-Frame-Options: SAMEORIGIN`) to eliminate Clickjacking.
   - **MIME Sniffing Prevention**: Enforced via `X-Content-Type-Options: nosniff`.
   - **Transport Security**: Enforced via `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

3. **Input Validation & Injection Prevention**:
   - Every API endpoint is guarded by strict runtime **Zod schemas** (`server/schemas/api.schemas.ts`).
   - Prototype pollution sanitization recursively strips `__proto__`, `constructor`, and `prototype` keys from all request bodies, query strings, and URL parameters.
   - Chat assistant inputs are sanitized and character-bounded (maximum 2,000 characters) to prevent prompt injection and denial-of-service.

4. **Rate Limiting & Abuse Prevention**:
   - In-memory sliding-window rate limiter restricts client IPs to a maximum of 120 requests per minute per IP.
   - Automated test environments bypass rate limiting cleanly without polluting production thresholds.

5. **Cloud Run Container Isolation**:
   - Production Docker images execute exclusively as an unprivileged user (`USER node`).
   - Multi-stage build isolates build dependencies and compiles static bundles before runtime instantiation.
   - Google Application Default Credentials (ADC) utilize short-lived GCP IAM tokens with least-privilege roles (`roles/aiplatform.user`).

6. **Grounded AI Guardrails**:
   - Vertex AI Gemini prompt contexts are strictly grounded with verified CPCB telemetry and deterministic calculation bounds.
   - System prompts explicitly forbid the model from diagnosing medical illnesses, prescribing clinical treatments, or inventing air pollution figures.

---

## 🔒 Reporting a Vulnerability

If you discover a security vulnerability within BreatheWise AI, please report it responsibly:
- **Email**: `security@breathewise.ai`
- **Response Target**: Within 24 hours of notification.
- Please do not disclose vulnerabilities publicly until a remediated release has been deployed.
