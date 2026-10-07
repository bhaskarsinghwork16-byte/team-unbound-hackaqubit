export type ScreeningType = 'eye' | 'oral';

export type QualityGrade = 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNUSABLE';

export type ResultState = 
  | 'no_abnormality'        // State 1: No obvious abnormality detected
  | 'potential_finding'     // State 2: Potential finding detected (Clinical review recommended)
  | 'low_confidence'        // State 3: Unable to determine reliably (Borderline confidence)
  | 'quality_insufficient'  // State 4: Image quality insufficient (UNUSABLE)
  | 'analysis_unavailable'; // State 5: Analysis unavailable (System or service failure)

export type RiskLevel = 'lower_risk' | 'higher_risk' | 'inconclusive';

export type ReviewStatus = 'pending' | 'reviewed' | 'escalated';

export type ReferralPriority = 'routine' | 'priority' | 'urgent';

export type ReferralStatus = 
  | 'pending'
  | 'reviewed'
  | 'referral_recommended'
  | 'completed'
  | 'follow_up_required';

export type UserRole = 'chw' | 'clinician' | 'admin';

/**
 * Permanent Patient Record
 */
export interface PatientRecord {
  patientId: string;       // Permanent unique identifier (e.g., PT-1042)
  name: string;            // Patient full name
  age: number;             // Age in years
  sex: 'Female' | 'Male' | 'Other';
  phone?: string;          // Phone contact
  contact?: string;        // Phone or village contact (backwards compatibility)
  address?: string;        // Village / Ward / Address
  facilityId: string;      // Healthcare facility code
  registeredDate: string;  // ISO timestamp
  lastScreeningDate?: string; // Date of most recent screening
  needsFollowUp?: boolean; // Follow-up required flag
  notes?: string;
  riskContext?: string[];  // Known clinical risks (Diabetes, Hypertension, etc.)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Raw Computer Vision Measurements (Real pixel calculations)
 */
export interface RawQualityMeasurements {
  laplacianVariance: number;  // Focus / motion blur measurement
  meanLuminance: number;      // 0 - 255 exposure
  stdDevLuminance: number;    // Contrast dynamic range
  noiseResidue: number;       // High-frequency sensor noise
  width: number;
  height: number;
}

/**
 * Normalized Quality Metrics (0-100)
 */
export interface ImageQualityMetrics {
  sharpness: number;
  brightness: number;
  contrast: number;
  noiseLevel: number;
  framing: number;
}

export type DetectedImageType = 'retina' | 'oral' | 'skin_hand' | 'face' | 'document' | 'random_object';

export interface ImageTypeValidationResult {
  detectedType: DetectedImageType;
  expectedType: ScreeningType;
  isValidType: boolean;
  typeConfidence: number; // 0 - 100
  reason: string;
}

export type PipelineValidationStatus = 
  | 'valid_usable'               // Type valid & quality passed -> continue to medical model
  | 'wrong_image_type'           // Wrong image category -> reject and explain
  | 'correct_type_poor_quality'; // Correct image but poor quality -> ask for retake

/**
 * Quality Assessment Output
 */
export interface ImageQualityResult {
  grade: QualityGrade;
  score: number;
  isAcceptable: boolean;
  canProceedWithWarning: boolean;
  metrics: ImageQualityMetrics;
  measurements?: RawQualityMeasurements;
  feedback: string;
  warnings: string[];
  typeValidation?: ImageTypeValidationResult;
  validationStatus: PipelineValidationStatus;
}

/**
 * Clinical Screening Record
 */
export interface ScreeningRecord {
  screeningId: string;        // Unique screening identifier (e.g., SCR-407556)
  id?: string;                // Backwards-compatible ID alias
  patientId: string;          // Linked permanent patient ID
  patientName?: string;       // Linked patient name for rapid display
  facilityId?: string;        // Facility identifier (defaults to FAC-MAIN if omitted)
  screeningType?: ScreeningType; // Preferred screening type
  type?: ScreeningType;       // Backwards-compatible screening type alias
  imageReference: string;     // Base64 or relative image URI
  imageQuality: ImageQualityResult;
  resultState: ResultState;
  riskLevel: RiskLevel;
  prediction: string;         // Clinical finding summary
  confidence: number;         // Model confidence percentage (e.g. 88)
  modelVersion: string;
  reviewStatus?: ReviewStatus;// Clinical review status (defaults to pending)
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  referralStatus?: ReferralStatus; // Referral status (defaults to none)
  referralId?: string;
  recommendation: string;
  clinicalCaveat: string;
  explanationSupported: boolean;
  explanationText?: string;
  heatmapCoordinates?: { x: number; y: number; radius: number; intensity: number }[];
  modelMode?: 'real' | 'demo';
  dataSource?: 'real' | 'demo';
  deviceInfo?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Backwards compatible alias for existing imports
 */
export type ScreeningResult = ScreeningRecord;

/**
 * Patient Referral Record
 */
export interface ReferralRecord {
  referralId: string;             // Unique identifier (e.g., REF-5021)
  patientId: string;              // Linked patient ID
  patientName: string;            // Patient full name
  screeningId: string;            // Linked screening ID
  facilityId: string;             // Initiating health centre
  screeningType: ScreeningType;
  specialistType: string;         // e.g. "Ophthalmologist" | "Oral Medicine / ENT"
  destinationFacility: string;    // e.g. "District Civil Hospital"
  reason: string;                 // Clinical reason for referral
  priority: ReferralPriority;     // Routine / Priority / Urgent
  status: ReferralStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Operational Metrics for Overview Dashboard
 */
export interface OperationalMetrics {
  todayScreenings: number;
  patientsScreened: number;
  awaitingReview: number;
  activeReferrals: number;
}

/**
 * Reports Summary Data
 */
export interface ReportsSummary {
  totalScreenings: number;
  retinaScreenings: number;
  oralScreenings: number;
  qualityFailures: number;
  reviewRecommendedCount: number;
  averageQualityScore: number;
  outcomesBreakdown: {
    lowerRisk: number;
    higherRisk: number;
    inconclusive: number;
  };
  referralsBreakdown: {
    pending: number;
    reviewed: number;
    referralRecommended: number;
    completed: number;
    followUpRequired: number;
  };
  dailyVolume: { date: string; eye: number; oral: number }[];
}

/**
 * Backward compatible AnalyticsSummary alias
 */
export interface AnalyticsSummary {
  screeningsTotal: number;
  retinaScreenings: number;
  oralScreenings: number;
  qualityFailures: number;
  reviewRecommendations: number;
  averageImageQuality: number;
  offlineScreenings: number;
  outcomesBreakdown: {
    lowerRisk: number;
    higherRisk: number;
    inconclusive: number;
  };
  volumeByDay: { date: string; eye: number; oral: number }[];
  isRealDataPresent: boolean;
}

/**
 * Technical Model Specifications (For Settings / System Admin only)
 */
export interface ModelMeta {
  modelName: string;
  version: string;
  task: string;
  architecture: string;
  inputResolution: string;
  sizeMb: number;
  latencyArmCpuMs: number;
  framework: string;
  quantization: string;
  metrics: {
    accuracy: number | null;
    sensitivity: number | null;
    specificity: number | null;
    f1Score: number | null;
    rocAuc: number | null;
  };
  biasesAndLimitations: string;
}

/**
 * Dataset Provenance Specifications (For Settings / System Admin only)
 */
export interface DatasetMeta {
  name: string;
  source: string;
  task: string;
  classes: string[];
  license: string;
  imageCount: number;
  kaggleUrl: string;
  limitations: string;
}

/**
 * Model inference output from the screening pipeline (used by modelProvider.ts)
 */
export interface ModelOutput {
  task: ScreeningType;
  class: string;
  probability: number;
  modelVersion: string;
  inferenceTimeMs: number;
  explanationSupported: boolean;
  explanationText?: string;
  heatmapCoordinates?: { x: number; y: number; radius: number; intensity: number }[];
}

/**
 * Backward-compatible alias for legacy patient intake records (used in old db-store API)
 */
export interface PatientInfo {
  patientId: string;
  screeningType?: string;
  createdAt: string;
  [key: string]: unknown;
}
