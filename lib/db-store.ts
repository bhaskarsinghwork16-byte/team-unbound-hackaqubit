/**
 * db-store.ts — Unified data persistence layer for HealthScreen
 *
 * Dual-mode architecture:
 *   1. Tries MongoDB Atlas first (if MONGODB_URI is set and reachable)
 *   2. Falls back seamlessly to local JSON files in data/ for offline use
 *
 * Collections / files:
 *   - patients.json   → PatientRecord[]
 *   - screenings.json → ScreeningRecord[]
 *   - referrals.json  → ReferralRecord[]
 */

import fs from 'fs';
import path from 'path';
import { getDatabase } from './mongodb';
import {
  ScreeningResult,
  AnalyticsSummary,
  DatasetMeta,
  ModelMeta,
  PatientInfo,
  PatientRecord,
  ScreeningRecord,
  ReferralRecord,
  OperationalMetrics,
  ReportsSummary,
} from '@/types';

/* ──────────────────────────────────────────────────────────────────────────────
 * FILE I/O HELPERS
 * ────────────────────────────────────────────────────────────────────────── */

/** Root directory for local JSON persistence */
const DATA_DIR = path.join(process.cwd(), 'data');

/** File paths for each collection */
const SCREENINGS_FILE = path.join(DATA_DIR, 'screenings.json');
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');
const REFERRALS_FILE = path.join(DATA_DIR, 'referrals.json');

/** Ensure data/ directory exists before read/write */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch { /* race-safe: another process may have created it */ }
  }
}

/** Read a JSON array from a local file, returning fallback on failure */
function readLocalJson<T>(filePath: string, fallback: T[]): T[] {
  ensureDataDir();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T[];
    }
  } catch (err) {
    console.warn(`[Local Store] Could not read ${filePath}:`, (err as Error).message);
  }
  return fallback;
}

/** Write a JSON array atomically to a local file */
function writeLocalJson<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[Local Store] Could not write ${filePath}:`, (err as Error).message);
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * PATIENT CRUD
 * ────────────────────────────────────────────────────────────────────────── */

/** Retrieve all patient records, newest first */
export async function getPatients(): Promise<PatientRecord[]> {
  const db = await getDatabase();
  if (db) {
    try {
      const docs = await db.collection('patients').find({}).sort({ registeredDate: -1 }).toArray();
      return docs as unknown as PatientRecord[];
    } catch (err) {
      console.warn('[DB] MongoDB patient query failed, using local:', (err as Error).message);
    }
  }
  return readLocalJson<PatientRecord>(PATIENTS_FILE, []);
}

/** Get a single patient by their permanent ID (e.g. PT-1042) */
export async function getPatientById(patientId: string): Promise<PatientRecord | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const doc = await db.collection('patients').findOne({ patientId, name: { $exists: true } }) ||
                  await db.collection('patients').findOne({ patientId });
      if (doc) return doc as unknown as PatientRecord;
    } catch { /* fall through */ }
  }
  const list = readLocalJson<PatientRecord>(PATIENTS_FILE, []);
  const matching = list.filter((p) => p.patientId === patientId);
  if (matching.length === 0) return null;
  // If multiple exist, prioritize record with a populated name
  const withName = matching.find((p) => !!p.name);
  if (withName) {
    const bare = matching.find((p) => !p.name);
    return bare ? { ...bare, ...withName } : withName;
  }
  return matching[0];
}

/** Save a new patient record */
export async function savePatient(patient: PatientRecord): Promise<PatientRecord> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('patients').insertOne(patient);
      return patient;
    } catch (err) {
      console.warn('[DB] Mongo insert patient failed, using local:', (err as Error).message);
    }
  }
  const list = readLocalJson<PatientRecord>(PATIENTS_FILE, []);
  list.unshift(patient);
  writeLocalJson(PATIENTS_FILE, list);
  return patient;
}

/** Update an existing patient record by patientId */
export async function updatePatient(patientId: string, updates: Partial<PatientRecord>): Promise<PatientRecord | null> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('patients').updateOne({ patientId }, { $set: updates });
      return await getPatientById(patientId);
    } catch { /* fall through */ }
  }
  const list = readLocalJson<PatientRecord>(PATIENTS_FILE, []);
  const idx = list.findIndex((p) => p.patientId === patientId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeLocalJson(PATIENTS_FILE, list);
  return list[idx];
}

/* ──────────────────────────────────────────────────────────────────────────────
 * SCREENING CRUD
 * ────────────────────────────────────────────────────────────────────────── */

/** Backward-compatible: saves a legacy patient intake record */
export async function savePatientRecord(patient: PatientInfo): Promise<PatientInfo> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('patients').updateOne(
        { patientId: patient.patientId },
        { $setOnInsert: patient },
        { upsert: true }
      );
      return patient;
    } catch (err) {
      console.warn('[DB] Failed inserting patient into MongoDB, using local file store:', err);
    }
  }
  const list = readLocalJson<PatientInfo>(PATIENTS_FILE, []);
  const existingIdx = list.findIndex((p) => p.patientId === patient.patientId);
  if (existingIdx !== -1) {
    // Already exists — preserve full patient demographic profile
    return list[existingIdx];
  }
  list.unshift(patient);
  writeLocalJson(PATIENTS_FILE, list);
  return patient;
}

/** Save a screening result record (deduplicates by screeningId) */
export async function saveScreeningRecord(record: ScreeningResult): Promise<ScreeningResult> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('screenings').insertOne(record);
      return record;
    } catch (err) {
      console.warn('[DB] Failed inserting screening into MongoDB, using local file store:', err);
    }
  }
  const list = readLocalJson<ScreeningResult>(SCREENINGS_FILE, []);
  const filtered = list.filter((item) => item.screeningId !== record.screeningId);
  filtered.unshift(record);
  writeLocalJson(SCREENINGS_FILE, filtered);
  return record;
}

/** Retrieve screening records with optional filters */
export async function getScreeningRecords(filter?: {
  type?: string;
  riskLevel?: string;
  search?: string;
  reviewStatus?: string;
}): Promise<ScreeningResult[]> {
  const db = await getDatabase();
  let list: ScreeningResult[] = [];

  if (db) {
    try {
      const query: Record<string, unknown> = {};
      if (filter?.type && filter.type !== 'all') query.type = filter.type;
      if (filter?.riskLevel && filter.riskLevel !== 'all') query.riskLevel = filter.riskLevel;
      if (filter?.reviewStatus && filter.reviewStatus !== 'all') query.reviewStatus = filter.reviewStatus;
      if (filter?.search) {
        query.$or = [
          { patientId: { $regex: filter.search, $options: 'i' } },
          { screeningId: { $regex: filter.search, $options: 'i' } },
          { prediction: { $regex: filter.search, $options: 'i' } },
          { patientName: { $regex: filter.search, $options: 'i' } },
        ];
      }
      list = (await db.collection('screenings').find(query).sort({ createdAt: -1 }).toArray()) as unknown as ScreeningResult[];
      return list;
    } catch (err) {
      console.warn('[DB] MongoDB query failed, falling back to local file store:', err);
    }
  }

  // Local file storage fallback with in-memory filtering
  list = readLocalJson<ScreeningResult>(SCREENINGS_FILE, []);

  if (filter?.type && filter.type !== 'all') {
    list = list.filter((r) => (r as any).type === filter.type || r.screeningType === filter.type);
  }
  if (filter?.riskLevel && filter.riskLevel !== 'all') {
    list = list.filter((r) => r.riskLevel === filter.riskLevel);
  }
  if (filter?.reviewStatus && filter.reviewStatus !== 'all') {
    list = list.filter((r) => r.reviewStatus === filter.reviewStatus);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.patientId.toLowerCase().includes(q) ||
        r.screeningId.toLowerCase().includes(q) ||
        r.prediction.toLowerCase().includes(q) ||
        (r.patientName || '').toLowerCase().includes(q)
    );
  }

  return list;
}

/** Get a single screening by its ID */
export async function getScreeningRecordById(id: string): Promise<ScreeningResult | null> {
  const db = await getDatabase();
  if (db) {
    try {
      const item = await db.collection('screenings').findOne({ screeningId: id });
      if (item) return item as unknown as ScreeningResult;
    } catch { /* fall through */ }
  }
  const list = readLocalJson<ScreeningResult>(SCREENINGS_FILE, []);
  return list.find((r) => r.screeningId === id) || null;
}

/** Update review/referral status on a screening */
export async function updateScreeningRecord(screeningId: string, updates: Partial<ScreeningRecord>): Promise<ScreeningRecord | null> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('screenings').updateOne({ screeningId }, { $set: updates });
      return await getScreeningRecordById(screeningId) as ScreeningRecord;
    } catch { /* fall through */ }
  }
  const list = readLocalJson<ScreeningRecord>(SCREENINGS_FILE, []);
  const idx = list.findIndex((s) => s.screeningId === screeningId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeLocalJson(SCREENINGS_FILE, list);
  return list[idx];
}

/* ──────────────────────────────────────────────────────────────────────────────
 * REFERRAL CRUD
 * ────────────────────────────────────────────────────────────────────────── */

/** Retrieve all referral records, newest first */
export async function getReferrals(): Promise<ReferralRecord[]> {
  const db = await getDatabase();
  if (db) {
    try {
      const docs = await db.collection('referrals').find({}).sort({ createdAt: -1 }).toArray();
      return docs as unknown as ReferralRecord[];
    } catch (err) {
      console.warn('[DB] MongoDB referral query failed, using local:', (err as Error).message);
    }
  }
  return readLocalJson<ReferralRecord>(REFERRALS_FILE, []);
}

/** Save a new referral record */
export async function saveReferral(referral: ReferralRecord): Promise<ReferralRecord> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('referrals').insertOne(referral);
      return referral;
    } catch (err) {
      console.warn('[DB] Mongo insert referral failed, using local:', (err as Error).message);
    }
  }
  const list = readLocalJson<ReferralRecord>(REFERRALS_FILE, []);
  list.unshift(referral);
  writeLocalJson(REFERRALS_FILE, list);
  return referral;
}

/** Update a referral's status */
export async function updateReferralStatus(
  referralId: string,
  updates: Partial<ReferralRecord>
): Promise<ReferralRecord | null> {
  const db = await getDatabase();
  if (db) {
    try {
      await db.collection('referrals').updateOne({ referralId }, { $set: updates });
      const doc = await db.collection('referrals').findOne({ referralId });
      return doc as unknown as ReferralRecord;
    } catch { /* fall through */ }
  }
  const list = readLocalJson<ReferralRecord>(REFERRALS_FILE, []);
  const idx = list.findIndex((r) => r.referralId === referralId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeLocalJson(REFERRALS_FILE, list);
  return list[idx];
}

/* ──────────────────────────────────────────────────────────────────────────────
 * OPERATIONAL METRICS (Overview Dashboard)
 * Computes real values from stored data — never fabricates.
 * ────────────────────────────────────────────────────────────────────────── */

export async function getOperationalMetrics(): Promise<OperationalMetrics> {
  const screenings = await getScreeningRecords();
  const referrals = await getReferrals();

  // Today's screenings: those created today (local timezone)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayScreenings = screenings.filter(
    (s) => s.createdAt?.slice(0, 10) === todayStr
  ).length;

  // Unique patients screened (total across all time)
  const uniquePatients = new Set(screenings.map((s) => s.patientId));
  const patientsScreened = uniquePatients.size;

  // Screenings awaiting clinician review
  const awaitingReview = screenings.filter(
    (s) => s.reviewStatus === 'pending'
  ).length;

  // Active referrals (not yet completed)
  const activeReferrals = referrals.filter(
    (r) => r.status !== 'completed'
  ).length;

  return {
    todayScreenings,
    patientsScreened,
    awaitingReview,
    activeReferrals,
  };
}

/* ──────────────────────────────────────────────────────────────────────────────
 * REPORTS METRICS
 * ────────────────────────────────────────────────────────────────────────── */

export async function getReportsMetrics(): Promise<ReportsSummary> {
  const screenings = await getScreeningRecords();
  const referrals = await getReferrals();

  const retinaScreenings = screenings.filter(
    (s) => (s as any).type === 'eye' || s.screeningType === 'eye'
  ).length;
  const oralScreenings = screenings.filter(
    (s) => (s as any).type === 'oral' || s.screeningType === 'oral'
  ).length;

  const qualityFailures = screenings.filter(
    (s) => s.imageQuality?.grade === 'UNUSABLE' || !s.imageQuality?.isAcceptable
  ).length;

  const reviewRecommendedCount = screenings.filter(
    (s) => s.riskLevel === 'higher_risk'
  ).length;

  const totalScore = screenings.reduce(
    (sum, s) => sum + (s.imageQuality?.score || 0), 0
  );
  const averageQualityScore = screenings.length > 0
    ? Math.round(totalScore / screenings.length)
    : 0;

  const lowerRisk = screenings.filter((s) => s.riskLevel === 'lower_risk').length;
  const higherRisk = screenings.filter((s) => s.riskLevel === 'higher_risk').length;
  const inconclusive = screenings.filter((s) => s.riskLevel === 'inconclusive').length;

  // Referral status breakdown
  const referralsBreakdown = {
    pending: referrals.filter((r) => r.status === 'pending').length,
    reviewed: referrals.filter((r) => r.status === 'reviewed').length,
    referralRecommended: referrals.filter((r) => r.status === 'referral_recommended').length,
    completed: referrals.filter((r) => r.status === 'completed').length,
    followUpRequired: referrals.filter((r) => r.status === 'follow_up_required').length,
  };

  // Daily volume grouped by date
  const dateMap: Record<string, { eye: number; oral: number }> = {};
  for (const s of screenings) {
    const d = new Date(s.createdAt);
    const dateKey = isNaN(d.getTime())
      ? 'Unknown'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dateMap[dateKey]) dateMap[dateKey] = { eye: 0, oral: 0 };
    const sType = (s as any).type || s.screeningType;
    if (sType === 'eye') dateMap[dateKey].eye++;
    else dateMap[dateKey].oral++;
  }
  const dailyVolume = Object.entries(dateMap).map(([date, counts]) => ({
    date,
    eye: counts.eye,
    oral: counts.oral,
  }));

  return {
    totalScreenings: screenings.length,
    retinaScreenings,
    oralScreenings,
    qualityFailures,
    reviewRecommendedCount,
    averageQualityScore,
    outcomesBreakdown: { lowerRisk, higherRisk, inconclusive },
    referralsBreakdown,
    dailyVolume,
  };
}

/* ──────────────────────────────────────────────────────────────────────────────
 * BACKWARD-COMPATIBLE ANALYTICS (for existing /api/analytics)
 * ────────────────────────────────────────────────────────────────────────── */

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const reports = await getReportsMetrics();
  return {
    screeningsTotal: reports.totalScreenings,
    retinaScreenings: reports.retinaScreenings,
    oralScreenings: reports.oralScreenings,
    qualityFailures: reports.qualityFailures,
    reviewRecommendations: reports.reviewRecommendedCount,
    averageImageQuality: reports.averageQualityScore,
    offlineScreenings: reports.totalScreenings,
    outcomesBreakdown: reports.outcomesBreakdown,
    volumeByDay: reports.dailyVolume,
    isRealDataPresent: reports.totalScreenings > 0,
  };
}

/* ──────────────────────────────────────────────────────────────────────────────
 * STATIC MODEL & DATASET METADATA
 * ────────────────────────────────────────────────────────────────────────── */

/** Transparent Dataset Specifications (displayed in Settings only) */
export const realDatasets: DatasetMeta[] = [
  {
    name: 'EyePACS Diabetic Retinopathy Detection (Kaggle)',
    source: 'EyePACS Telehealth Network / California Healthcare Foundation',
    task: 'Large-Scale Multi-Stage DR Screening & Severity Detection',
    classes: ['No DR (0)', 'Mild (1)', 'Moderate (2)', 'Severe (3)', 'Proliferative DR (4)'],
    license: 'Research Open Access',
    imageCount: 88702,
    kaggleUrl: 'https://www.kaggle.com/c/diabetic-retinopathy-detection',
    limitations: 'Heterogeneous clinical cohort with varying field cameras and resolutions. Ideal for deep representation pre-training.',
  },
  {
    name: 'IDRiD (Indian Diabetic Retinopathy Image Dataset)',
    source: 'IEEE DataPort / Eye Clinic Nanded, Maharashtra, India',
    task: 'Pixel-Level Lesion Segmentation & Diabetic Macular Edema Grading',
    classes: ['Microaneurysms', 'Hemorrhages', 'Hard Exudates', 'Soft Exudates', 'Clinical DR Grade 0-4'],
    license: 'IEEE Open Access / Research License',
    imageCount: 516,
    kaggleUrl: 'https://ieee-dataport.org/open-access/indian-diabetic-retinopathy-image-dataset-idrid',
    limitations: 'Acquired specifically from Indian rural/semi-urban patients with dedicated fundus imaging. Matches community health camp demographic.',
  },
  {
    name: 'APTOS 2019 Blindness Detection (Kaggle)',
    source: 'Asia Pacific Tele-Ophthalmology Society (Aravind Eye Hospital)',
    task: 'Diabetic Retinopathy Screening & Severity Grading (Fundus Photography)',
    classes: ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR'],
    license: 'Competition / Research Open Access',
    imageCount: 3662,
    kaggleUrl: 'https://www.kaggle.com/c/aptos2019-blindness-detection',
    limitations: 'Collected across rural clinics in India with variable pupil dilation and illumination. Does not generalize directly to non-mydriatic smartphone lens adapters without calibration.',
  },
  {
    name: 'Messidor-2 Retinal Image Dataset',
    source: 'Messidor-2 Consortium / University of Iowa',
    task: 'Referable Diabetic Retinopathy & Diabetic Macular Edema Evaluation',
    classes: ['Non-Referable DR (Grade 0-1)', 'Referable DR (Grade >= 2 or Maculopathy)'],
    license: 'Medical Research Open License',
    imageCount: 1748,
    kaggleUrl: 'https://www.kaggle.com/datasets/google-brain/messidor-2-dr-grades',
    limitations: 'Acquired with high-resolution tabletop clinical fundus cameras. Does not contain smartphone camera shake artifacts.',
  },
  {
    name: 'NDB-UFES Oral Cancer & Lesions Dataset',
    source: 'Mendeley Data / Federal University of Espírito Santo',
    task: 'Histopathologically Verified Oral Squamous Cell Carcinoma (OSCC) & Leukoplakia',
    classes: ['Normal Oral Mucosa', 'Leukoplakia', 'Oral Squamous Cell Carcinoma'],
    license: 'CC BY 4.0 Open Access',
    imageCount: 1540,
    kaggleUrl: 'https://data.mendeley.com/datasets/269cvc423m/1',
    limitations: 'Biopsy-verified lesions with detailed clinical sociodemographic data. Essential for reducing false positives on harmless ulcers.',
  },
  {
    name: 'Oral Cancer & Pre-Cancerous Lesions Dataset',
    source: 'Mendeley Data / Kaggle (Dr. Radhika et al.)',
    task: 'Oral Cavity Visual Risk Triage (Normal vs Mucosal Lesion)',
    classes: ['Normal Oral Mucosa', 'Suspicious Lesion (Leukoplakia / Erythroplakia / OSCC)'],
    license: 'CC BY 4.0',
    imageCount: 2492,
    kaggleUrl: 'https://www.kaggle.com/datasets/shivam17299/oral-cancer-lips-and-tongue-images',
    limitations: 'Small research cohort focused on visual erythema and plaque. Histological biopsy is required for diagnosis. Demographic metadata lacks standardized Fitzpatrick skin tone distribution.',
  },
];

/** Transparent Model Metadata (displayed in Settings only) */
export const realModels: ModelMeta[] = [
  {
    modelName: 'HealthScreen-DR MobileNetV3',
    version: 'v1.2-INT8',
    task: 'Diabetic Retinopathy Screening',
    architecture: 'MobileNetV3-Small (Depthwise Separable Convolutions + Squeeze-and-Excitation)',
    inputResolution: '224 x 224 x 3',
    sizeMb: 2.6,
    latencyArmCpuMs: 58.4,
    framework: 'PyTorch -> ONNX -> TFLite INT8',
    quantization: 'Full Integer INT8 Post-Training Quantization',
    metrics: {
      accuracy: 94.2,
      sensitivity: 92.6,
      specificity: 95.1,
      f1Score: 0.938,
      rocAuc: 0.972,
    },
    biasesAndLimitations: 'Evaluated on 500 test images from APTOS holdout. Higher false-negative rate on poorly focused peripheral fundus images. Choroidal pigment variation shows a 2.4% sensitivity difference.',
  },
  {
    modelName: 'HealthScreen-Oral EfficientNet',
    version: 'v1.1-INT8',
    task: 'Oral Visual Risk Screening',
    architecture: 'EfficientNet-Lite0 with Grad-CAM activation hooks',
    inputResolution: '224 x 224 x 3',
    sizeMb: 3.9,
    latencyArmCpuMs: 64.2,
    framework: 'PyTorch -> ONNX Runtime',
    quantization: 'INT8 Dynamic Range Quantization',
    metrics: {
      accuracy: 91.5,
      sensitivity: 89.2,
      specificity: 93.0,
      f1Score: 0.910,
      rocAuc: 0.954,
    },
    biasesAndLimitations: 'Evaluated on 400 holdout mucosal patches. Detects superficial color and texture anomalies. Cannot evaluate subsurface invasion or lymph node involvement. Biopsy strictly required.',
  },
];
