import { ScreeningType, ScreeningResult, ImageQualityResult } from '@/types';
import { assessImageQualitySync } from './imageQuality';
import { getModelProvider, mapModelOutputToScreeningResult } from './modelProvider';

export interface InferenceRunOptions {
  patientId: string;
  screeningType: ScreeningType;
  imageUri: string;
  confidenceThreshold?: number; // 0.60
  targetScenario?: string;
  qualityOverride?: ImageQualityResult;
  modelMode?: 'real' | 'demo';
}

/**
 * AI Screening Orchestration Service
 * Capture → Quality Check (IQA) → Model Inference → Result Interpretation
 */
export async function runScreeningInference(options: InferenceRunOptions): Promise<ScreeningResult> {
  const {
    patientId,
    screeningType,
    imageUri,
    confidenceThreshold = 0.60,
    targetScenario,
    qualityOverride,
    modelMode = options.modelMode || (process.env.MODEL_MODE?.toLowerCase() === 'demo' ? 'demo' : 'real'),
  } = options;

  // 1. Image Type & Quality Validation Gate (Pre-inference)
  const quality = qualityOverride || assessImageQualitySync(imageUri, screeningType);
  const provider = getModelProvider(modelMode);

  // CRITICAL: If image validation fails (wrong type OR poor quality), disease inference is BLOCKED!
  if (!quality.isAcceptable || quality.validationStatus === 'wrong_image_type' || quality.validationStatus === 'correct_type_poor_quality' || quality.grade === 'UNUSABLE') {
    return mapModelOutputToScreeningResult(
      {
        task: screeningType,
        class: quality.validationStatus === 'wrong_image_type' ? 'wrong_image_type' : 'poor_quality',
        probability: 0.0,
        modelVersion: screeningType === 'eye' ? 'HealthScreen-SafetyGate-v1.0' : 'HealthScreen-SafetyGate-v1.0',
        inferenceTimeMs: 0,
        explanationSupported: false,
        explanationText: quality.feedback,
      },
      quality,
      patientId,
      imageUri,
      screeningType,
      confidenceThreshold,
      provider.mode
    );
  }

  // 2. Model Inference via Abstraction Layer (Real vs Demo)
  let modelOutput;

  try {
    if (screeningType === 'eye') {
      modelOutput = await provider.analyzeRetina(imageUri, { confidenceThreshold, targetScenario });
    } else {
      modelOutput = await provider.analyzeOral(imageUri, { confidenceThreshold, targetScenario });
    }
  } catch (err) {
    // Phase 19: State 5 — Analysis unavailable (Real service failure)
    return {
      screeningId: `SCR-${Date.now().toString().slice(-6)}`,
      patientId,
      type: screeningType,
      imageReference: imageUri,
      imageQuality: quality,
      resultState: 'analysis_unavailable',
      riskLevel: 'inconclusive',
      prediction: 'Analysis unavailable',
      confidence: 0,
      recommendation: 'The AI model service is currently unreachable. Please verify system connectivity or switch to Demo Mode.',
      clinicalCaveat: `Inference service error: ${(err as Error).message}`,
      explanationSupported: false,
      explanationText: 'Visual explanation unavailable due to inference failure.',
      modelVersion: 'Service-Offline',
      modelMode: provider.mode,
      dataSource: provider.mode,
      createdAt: new Date().toISOString(),
    };
  }

  // 3. Clinical Interpretation & Mapping
  return mapModelOutputToScreeningResult(
    modelOutput,
    quality,
    patientId,
    imageUri,
    screeningType,
    confidenceThreshold,
    provider.mode
  );
}
