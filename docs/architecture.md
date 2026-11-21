# BreatheWise AI — System Architecture Specification

## 1. Executive Product Vision
BreatheWise AI is an enterprise-grade, privacy-first, GenAI-augmented environmental decision-support application built for families and communities facing severe winter smog and urban air pollution.

Instead of serving as a passive telemetry display, BreatheWise AI implements a dual-layer architecture combining an audited **deterministic environmental decision engine** with **Google Cloud Vertex AI (Gemini 1.5/2.0 Flash)**.

---

## 2. End-to-End Processing Pipeline

```
[Real-Time Telemetry: Open-Meteo / CPCB Sensors]
                        │
                        ▼
       [Data Ingestion & In-Memory TTL Cache (15m)]
                        │
                        ▼
         [Piecewise CPCB NAQI Interpolation]
   (Sub-indices calculated for PM2.5, PM10, NO2, SO2, CO, O3)
                        │
                        ▼
       [Vulnerability & Lifestyle Context Fusion]
(Children, Elderly, Asthmatics, Commute Habits, Home Archetype)
                        │
                        ▼
         [Deterministic Rule & Impact Engine]
 (4 Diurnal Time Slots, Low-Cost Indoor Hacks, Transit Shifts)
                        │
                        ▼
         [Vertex AI Grounding Layer (Gemini)]
(Injects Telemetry + Context + Rules; Forbids Medical Claims)
                        │
                        ▼
     [Responsive Client UI (React 18 + Vite + Tailwind)]
 (AQI Intelligence, Routine Planner, Hacks, Impact Tracker)
```

---

## 3. Google Cloud Architecture

BreatheWise AI leverages Google Cloud Platform services where they provide genuine architectural and operational value:

1. **Google Cloud Run:**
   - Serverless container execution hosting the Express API and compiled static assets.
   - Autoscaling from 0 to N instances, scaling to zero during idle hours to eliminate operational costs.
   - Non-root container security with healthcheck probes.
2. **Google Vertex AI:**
   - Connects to `gemini-1.5-flash` or `gemini-2.0-flash` models.
   - Powers conversational explanations, multi-turn follow-ups, and natural language advice.
   - Strict context grounding enforces that the model cannot contradict deterministic CPCB classifications.
   - Graceful local fallback ensures zero downtime when offline.
3. **Google Cloud Firestore (Native Mode):**
   - NoSQL document store persisting user preferences, action history, and conversation sessions.
   - Dual-mode architecture automatically engages an in-memory session store during local development or testing.
4. **Google Cloud Logging & Monitoring:**
   - Structured JSON logs capturing HTTP methods, status codes, latency, and model response times.
5. **Google Cloud Build & Artifact Registry:**
   - Reproducible multi-stage Docker build pipeline configured via `cloudbuild.yaml`.

---

## 4. Key Architectural Differentiators

| Capability | Generic AQI Apps | BreatheWise AI |
| :--- | :--- | :--- |
| **Decision Engine** | Passive graphs only | Deterministic time-slotted routines + room-by-room hacks |
| **Indian AQI Math** | Generic US-EPA only | Exact piecewise CPCB NAQI linear interpolation |
| **GenAI Role** | Ungrounded generic LLM | Grounded in live verified telemetry + deterministic constraints |
| **Indoor Guidance** | "Buy expensive purifier" | Open-source DIY Corsi-Rosenthal filter builder ($400 CADR equivalent) + wet mopping |
| **Environmental Impact** | None or fabricated | Verified lung dose avoided ($\mu\text{g}$) and transit CO2e formulas |
| **Reliability** | Fails if API drops | Seamless in-memory caching + comprehensive demo simulation fixtures |
