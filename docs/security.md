# BreatheWise AI — Security, Privacy & Compliance Architecture

## 1. Zero-Trust Client & Secret Management
- **Zero Client Secrets:** The React 18 single-page application contains zero API keys, service account credentials, or Google Cloud access tokens.
- **Backend Mediation:** All external telemetry ingestion, Vertex AI calls, and Firestore persistence operations are mediated strictly by the Express backend API.
- **Production Secret Manager:** In production on Google Cloud Run, third-party API credentials and GCP configuration are mounted directly into memory via Google Cloud Secret Manager. No `.env` files are committed to the repository.

---

## 2. Privacy & Data Minimization
- **Zero Personally Identifiable Information (PII):** BreatheWise AI does not request or store real names, phone numbers, email addresses, or precise GPS coordinates.
- **Coarse Geo-Location:** Location is resolved at the city or metropolitan municipal level.
- **Household Context:** Stored profile attributes are strictly limited to anonymized categories (e.g., residence type, commute modality, general sensitivity tags such as children or asthma).
- **Data Retention:** Conversation sessions and logged sustainability actions are keyed to randomly generated anonymous identifiers stored in client `localStorage`.

---

## 3. Defense Against Generative AI Prompt Injection
- **Input Sanitization:** User chat queries are trimmed and validated with Zod schemas to reject oversized payloads.
- **Strict Anti-Hallucination System Instructions:** The prompt injected into Vertex AI Gemini firmly binds the model to the verified current CPCB AQI and dominant pollutant.
- **Deterministic Override Protection:** Safety rules (e.g., outdoor exercise prohibition during Severe smog events) cannot be bypassed or overridden by natural language queries.

---

## 4. HTTP & Network Hardening
- **Helmet Middleware:** Enforces strict HTTP response headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Rate Limiting:** Sliding-window in-memory rate limiter caps excessive client requests (120 requests/minute per IP) to guard against denial-of-service attempts.
- **CORS Whitelisting:** Configured to restrict cross-origin access to authorized origins.

---

## 5. Public Health Disclaimer & Digital Safety
- **No Clinical Prescriptions:** The system explicitly instructs users that BreatheWise AI provides environmental decision support and lifestyle adaptations.
- **Medical Disclaimer:** The interface displays public health disclaimers directing users with acute respiratory distress or cardiovascular symptoms to consult certified medical professionals.
