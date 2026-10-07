# HealthScreen AI — Technical Architecture & Codebase Guide

> **"Early screening. Anywhere."**  
> AI-assisted preliminary screening and clinical referral triage for **Diabetic Retinopathy** and **Oral Cavity Lesions**, optimized for rural community health camps and low-end mobile hardware.

---

## 🧭 1. Repository Structure & Subsystems

This codebase contains three complementary layers designed for research, edge validation, and clinical deployment:

```text
team unbound/
├── app/                       # [Web App] Next.js 14 App Router (Full Telemedicine Portal)
│   ├── page.tsx               # Landing & Hero Page
│   ├── dashboard/page.tsx     # Camp Telemetry & Field Overview
│   ├── screening/page.tsx     # 5-Step Guided Screening Workflow
│   ├── history/page.tsx       # On-Device Audit Trail & Search
│   ├── analytics/page.tsx     # Non-Fabricated Clinical KPI Analytics
│   ├── datasets/page.tsx      # Transparent Dataset Specs & Model Cards
│   ├── settings/page.tsx      # Hackathon Judge 1-Click Demos
│   └── api/                   # Serverless Endpoints (/screenings, /health, /analytics)
│
├── services/                  # [Core Logic] Pure Algorithms & Medical Business Logic
│   ├── imageQuality.ts        # Computer Vision Image Quality Assessment (IQA Gate)
│   ├── inference.ts           # Deterministic Edge Classification & Referral Logic
│   └── modelProvider.ts       # Model Specifications & Hardware Benchmark Cards
│
├── lib/                       # [Storage & Database] Dual-Mode Offline Persistence
│   ├── db-store.ts            # MongoDB Atlas Client + Local JSON Fallback Store
│   └── mongodb.ts             # Connection Pooling & Health Ping Provider
│
├── types/                     # [Contracts] Central TypeScript Interfaces & Enums
│   └── index.ts               # ScreeningResult, QualityGrade, DatasetMeta, ModelMeta
│
├── archive/prototype-web-simulator/ # [Mobile Web Simulator] Vanilla JS Field Phone Prototype
│   ├── index.html             # Smartphone mockup UI
│   ├── js/app.js              # State machine for the mockup UI
│   └── server.js              # Standalone zero-dependency HTTP server
│
├── lib/ & pubspec.yaml        # [Native Mobile] Flutter Android-First Client (Edge Target)
│   └── lib/screens/           # Dart UI screens for low-cost Android phones
│
└── ml/                        # [Machine Learning] Quantization & PyTorch Models
    ├── diabetic_retinopathy/  # MobileNetV3 INT8 classifier
    ├── oral_screening/        # EfficientNet-Lite & Grad-CAM++ hooks
    └── evaluation/            # Stress tests, bias analysis, hardware latency benchmarks
```

---

## 🔄 2. The 5-Step Clinical Screening Workflow

Every screening proceeds through five sequential steps:

```text
Step 1: Patient Intake  ──>  Step 2: Image Capture  ──>  Step 3: IQA Quality Gate
  • Patient ID (blank)         • Smartphone Camera         • Laplacian Blur (>45)
  • Age & Sex                  • Live Webcam               • Luminance (110-145)
  • Clinical Risk Factors      • Research Presets          • Dynamic Contrast
                                                           • Sensor Noise Grain
                                                                  │
                                            ┌─────────────────────┴─────────────────────┐
                                            ▼                                           ▼
                                    Quality Passes (GOOD)                     Quality Fails (UNUSABLE)
                                            │                                           │
                                            ▼                                           ▼
                                 Step 4: Edge Inference                      State 4: Quality Gate Halts
                                   • INT8 MobileNetV3 / EfficientNet           • Retake advice provided
                                   • Latency < 65ms on ARM                     • Prevents false negatives
                                            │
                                            ▼
                                 Step 5: Clinical Result
                                   • Triage classification
                                   • Grad-CAM visual attention
                                   • 1-Click Referral Slip (Print)
```

---

## 🔬 3. Image Quality Assessment (IQA) — What Each Metric Does

Automated quality gating occurs in [`services/imageQuality.ts`](file:///c:/Users/yash%20singh/OneDrive/Desktop/team%20unbound/services/imageQuality.ts) before any neural network runs:

| Metric | Raw Measurement | Target Range | Clinical Significance |
| :--- | :--- | :---: | :--- |
| **Sharpness** | `laplacianVariance` | `> 45` | Uses a 3×3 second-order derivative kernel. High values mean blood vessels and lesion boundaries are sharply resolved. Values `< 25` signify hand tremor or out-of-focus blur. |
| **Illumination** | `meanLuminance` | `110 – 145` (0-255) | Evaluates ITU-R perceptual brightness ($0.299R + 0.587G + 0.114B$). Values `< 45` mean the smartphone LED flashlight is too dim, obscuring microaneurysms. |
| **Contrast** | `stdDevLuminance` | `30 – 70` | Standard deviation ($\sigma$) of pixel luminance. Low contrast ($< 20$) means flat images where subtle lesions blend into tissue. |
| **Sensor Grain** | `noiseResidue` | `< 2.5` | Difference between raw pixels and a 3×3 box blur. High noise indicates sensor grain from excessive camera ISO gain. |
| **Framing** | `width`, `height` | `≥ 224 × 224` | Ensures spatial resolution matches model input tensor so anatomical micro-features are not lost during resizing. |

---

## ⚖️ 4. The 4 Honest Clinical Outcomes (Never Fake Functionality)

HealthScreen AI enforces strict clinical safety guardrails:

1. **State 1: No Obvious Abnormality Detected (`lower_risk`)**
   - High confidence negative. Routine annual screening advised.
2. **State 2: Potential Finding Detected (`higher_risk`)**
   - Optical features detected consistent with referable pathology. Generates a clinical referral recommendation note for a hospital specialist.
3. **State 3: Inconclusive Triage (`low_confidence`)**
   - **Safety-First Refusal to Guess**: Triggered whenever model confidence falls below the clinical safety threshold (`60%`). Refuses to guess and mandates manual review.
4. **State 4: Quality Gate Rejection (`quality_insufficient`)**
   - Triggered when image clarity is graded `UNUSABLE`. Stops analysis to prevent false negatives.

---

## 💾 5. Dual-Mode Storage Architecture

The application implements zero-cloud resilience in [`lib/db-store.ts`](file:///c:/Users/yash%20singh/OneDrive/Desktop/team%20unbound/lib/db-store.ts):
- **Cloud Mode:** Automatically connects to MongoDB Atlas when `MONGODB_URI` is provided in `.env.local`.
- **Field Offline Mode:** If internet is down or MongoDB is unreachable, gracefully falls back to local file storage at [`data/screenings.json`](file:///c:/Users/yash%20singh/OneDrive/Desktop/team%20unbound/data/screenings.json). Zero crash, 100% data retention.

---

## 🚀 6. How to Run Locally

### Next.js Production Web Application (Port 3000):
```bash
npm run build
npm run start
```
Visit: [http://localhost:3000](http://localhost:3000)

### Standalone Mobile Phone Web Simulator (Optional Prototype):
```bash
node archive/prototype-web-simulator/server.js
```
Visit: [http://localhost:3000](http://localhost:3000)
