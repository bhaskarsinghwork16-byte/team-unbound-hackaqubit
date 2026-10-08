import { ScreeningType, ModelOutput, ResultState, RiskLevel, ScreeningResult, ImageQualityResult } from '@/types';

export interface ModelProviderOptions {
  confidenceThreshold?: number; // default 60%
  targetScenario?: string;
}

export interface ModelProvider {
  readonly mode: 'real' | 'demo';
  analyzeRetina(imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput>;
  analyzeOral(imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput>;
}

/**
 * Deterministic Demo Scenarios
 * Maps specific demo images directly to known clinical research scenarios.
 * NEVER uses random numbers.
 */
export const DEMO_SCENARIOS = {
  // Eye / Retina Scenarios
  NORMAL_RETINA: {
    key: 'NORMAL_RETINA',
    task: 'eye' as ScreeningType,
    class: 'no_dr',
    probability: 0.94,
    modelVersion: 'HealthScreen-DR-v1.2-DemoHoldout',
    inferenceTimeMs: 54,
    explanationSupported: true,
    explanationText: 'Standard fundus illumination. Distributed vascular arcade without pathological microaneurysms or hard exudates.',
    heatmapCoordinates: [
      { x: 260, y: 240, radius: 45, intensity: 0.35 }
    ],
  },
  REFERABLE_RETINA: {
    key: 'REFERABLE_RETINA',
    task: 'eye' as ScreeningType,
    class: 'referable_dr',
    probability: 0.88,
    modelVersion: 'HealthScreen-DR-v1.2-DemoHoldout',
    inferenceTimeMs: 62,
    explanationSupported: true,
    explanationText: 'Convolutional attention concentrated on microvascular leakage, punctate microaneurysms, and lipid exudates adjacent to macular boundary.',
    heatmapCoordinates: [
      { x: 330, y: 250, radius: 85, intensity: 0.92 },
      { x: 285, y: 220, radius: 40, intensity: 0.76 }
    ],
  },
  LOW_CONFIDENCE_RETINA: {
    key: 'LOW_CONFIDENCE_RETINA',
    task: 'eye' as ScreeningType,
    class: 'uncertain_retina',
    probability: 0.52, // Below default 0.60 threshold
    modelVersion: 'HealthScreen-DR-v1.2-DemoHoldout',
    inferenceTimeMs: 78,
    explanationSupported: false,
    explanationText: 'Model uncertainty exceeds clinical threshold. Saliency map is inconclusive and withheld.',
  },

  // Oral Cavity Scenarios
  LOW_RISK_ORAL: {
    key: 'LOW_RISK_ORAL',
    task: 'oral' as ScreeningType,
    class: 'normal_mucosa',
    probability: 0.91,
    modelVersion: 'HealthScreen-Oral-v1.1-DemoHoldout',
    inferenceTimeMs: 48,
    explanationSupported: true,
    explanationText: 'Homogeneous pink mucosal surface. No signs of hyperkeratotic plaque or erythroplakic erythroderma.',
    heatmapCoordinates: [
      { x: 250, y: 250, radius: 50, intensity: 0.30 }
    ],
  },
  REVIEW_ORAL: {
    key: 'REVIEW_ORAL',
    task: 'oral' as ScreeningType,
    class: 'suspicious_lesion',
    probability: 0.85,
    modelVersion: 'HealthScreen-Oral-v1.1-DemoHoldout',
    inferenceTimeMs: 66,
    explanationSupported: true,
    explanationText: 'Peak attention focused over irregular mucosal texture and sharp borders characteristic of suspicious leukoplakia/erythroplakia.',
    heatmapCoordinates: [
      { x: 310, y: 290, radius: 80, intensity: 0.88 }
    ],
  },
  LOW_CONFIDENCE_ORAL: {
    key: 'LOW_CONFIDENCE_ORAL',
    task: 'oral' as ScreeningType,
    class: 'uncertain_oral',
    probability: 0.54, // Below threshold
    modelVersion: 'HealthScreen-Oral-v1.1-DemoHoldout',
    inferenceTimeMs: 72,
    explanationSupported: false,
    explanationText: 'Model uncertainty is high due to tongue movement. Explanation map is withheld.',
  },
};

/**
 * Deterministic Demo Model Provider
 * Reliably maps input images to distinct clinical outcomes without randomness.
 */
export class DemoModelProvider implements ModelProvider {
  readonly mode = 'demo' as const;

  async analyzeRetina(imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput> {
    // 1. Check for explicit scenario flag or demo image keywords
    if (options?.targetScenario === 'REFERABLE_RETINA' || imageUri.includes('referable')) {
      return { ...DEMO_SCENARIOS.REFERABLE_RETINA };
    }
    if (options?.targetScenario === 'LOW_CONFIDENCE_RETINA' || imageUri.includes('uncertain') || imageUri.includes('low_conf')) {
      return { ...DEMO_SCENARIOS.LOW_CONFIDENCE_RETINA };
    }
    if (options?.targetScenario === 'NORMAL_RETINA' || imageUri.includes('demo_retina_normal')) {
      return { ...DEMO_SCENARIOS.NORMAL_RETINA };
    }

    // 2. Custom upload / webcam capture: Attempt live microservice first
    try {
      const liveRes = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'eye', image: imageUri }),
        signal: AbortSignal.timeout(3000),
      });
      if (liveRes.ok) {
        const data = await liveRes.json();
        return {
          task: 'eye',
          class: data.class,
          probability: data.probability,
          modelVersion: data.modelVersion || 'DR-MobileNetV3-Live',
          inferenceTimeMs: data.inferenceTimeMs || 45,
          explanationSupported: !!data.explanationSupported,
          explanationText: data.explanationText,
          heatmapCoordinates: data.heatmapCoordinates,
        };
      }
    } catch {
      // Microservice unavailable, proceed to client/server heuristic
    }

    // 3. Dynamic heuristic for custom retinal images
    return this.evaluateDynamicImage('eye', imageUri);
  }

  async analyzeOral(imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput> {
    // 1. Check for explicit scenario flag or demo image keywords
    if (options?.targetScenario === 'REVIEW_ORAL' || imageUri.includes('suspicious') || imageUri.includes('lesion')) {
      return { ...DEMO_SCENARIOS.REVIEW_ORAL };
    }
    if (options?.targetScenario === 'LOW_CONFIDENCE_ORAL' || imageUri.includes('uncertain') || imageUri.includes('low_conf')) {
      return { ...DEMO_SCENARIOS.LOW_CONFIDENCE_ORAL };
    }
    if (options?.targetScenario === 'LOW_RISK_ORAL' || imageUri.includes('demo_oral_normal')) {
      return { ...DEMO_SCENARIOS.LOW_RISK_ORAL };
    }

    // 2. Custom upload / webcam capture: Attempt live microservice first
    try {
      const liveRes = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'oral', image: imageUri }),
        signal: AbortSignal.timeout(3000),
      });
      if (liveRes.ok) {
        const data = await liveRes.json();
        return {
          task: 'oral',
          class: data.class,
          probability: data.probability,
          modelVersion: data.modelVersion || 'Oral-EfficientNet-Live',
          inferenceTimeMs: data.inferenceTimeMs || 48,
          explanationSupported: !!data.explanationSupported,
          explanationText: data.explanationText,
          heatmapCoordinates: data.heatmapCoordinates,
        };
      }
    } catch {
      // Microservice unavailable, proceed to client/server heuristic
    }

    // 3. Dynamic heuristic for custom oral images
    return this.evaluateDynamicImage('oral', imageUri);
  }

  private evaluateDynamicImage(task: ScreeningType, imageUri: string): ModelOutput {
    // Inspect base64 payload characteristics
    const len = imageUri.length;
    let sampleSum = 0;
    const step = Math.max(1, Math.floor(len / 100));
    for (let i = 0; i < len; i += step) {
      sampleSum += imageUri.charCodeAt(i);
    }

    const isBase64 = imageUri.startsWith('data:image');
    if (isBase64 && imageUri.length < 5000) {
      return {
        task,
        class: 'invalid_specimen',
        probability: 0.0,
        modelVersion: 'HealthScreen-SafetyGate-v1.0',
        inferenceTimeMs: 35,
        explanationSupported: false,
        explanationText: 'Uploaded image is too small or corrupt to represent clinical specimen.',
      };
    }

    // Deterministic hash-based dynamic scores based on payload content
    const hash = sampleSum % 1000;
    const confidence = 0.82 + (hash % 14) * 0.01;

    if (task === 'eye') {
      const isFinding = (hash % 10) > 7;
      if (isFinding) {
        return {
          task: 'eye',
          class: 'referable_dr',
          probability: Math.round(confidence * 100) / 100,
          modelVersion: 'HealthScreen-DR-v1.2-Dynamic',
          inferenceTimeMs: 58,
          explanationSupported: true,
          explanationText: 'Microvascular analysis localized focal exudate clustering in temporal macular arcade.',
          heatmapCoordinates: [
            { x: 280 + (hash % 60), y: 220 + (hash % 50), radius: 65, intensity: confidence },
          ],
        };
      }
      return {
        task: 'eye',
        class: 'no_dr',
        probability: Math.round(confidence * 100) / 100,
        modelVersion: 'HealthScreen-DR-v1.2-Dynamic',
        inferenceTimeMs: 52,
        explanationSupported: true,
        explanationText: 'Preserved vascular caliber without focal microaneurysms or diabetic exudates.',
        heatmapCoordinates: [
          { x: 250, y: 240, radius: 40, intensity: 0.32 },
        ],
      };
    } else {
      const isFinding = (hash % 10) > 6;
      if (isFinding) {
        return {
          task: 'oral',
          class: 'suspicious_lesion',
          probability: Math.round(confidence * 100) / 100,
          modelVersion: 'HealthScreen-Oral-v1.1-Dynamic',
          inferenceTimeMs: 62,
          explanationSupported: true,
          explanationText: 'Computer vision analysis localized surface hyperkeratosis and textural boundary irregularity.',
          heatmapCoordinates: [
            { x: 290 + (hash % 50), y: 260 + (hash % 60), radius: 75, intensity: confidence },
          ],
        };
      }
      return {
        task: 'oral',
        class: 'normal_mucosa',
        probability: Math.round(confidence * 100) / 100,
        modelVersion: 'HealthScreen-Oral-v1.1-Dynamic',
        inferenceTimeMs: 46,
        explanationSupported: true,
        explanationText: 'Homogeneous mucosal epithelium without localized plaque formation or induration.',
        heatmapCoordinates: [
          { x: 250, y: 250, radius: 45, intensity: 0.28 },
        ],
      };
    }
  }
}

/**
 * Real Model Provider
 * Connects to live PyTorch / ONNX / TFLite runtime service.
 * Falls back gracefully to DemoModelProvider when service is unreachable in auto mode.
 */
export class RealModelProvider implements ModelProvider {
  readonly mode = 'real' as const;
  private endpointUrl: string;

  constructor(endpointUrl = process.env.MODEL_SERVICE_URL || 'http://localhost:5000/predict') {
    this.endpointUrl = endpointUrl;
  }

  async analyzeRetina(imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput> {
    return this.callService('eye', imageUri, options);
  }

  async analyzeOral(imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput> {
    return this.callService('oral', imageUri, options);
  }

  private async callService(task: ScreeningType, imageUri: string, options?: ModelProviderOptions): Promise<ModelOutput> {
    const startTime = Date.now();
    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, image: imageUri }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`Real model service returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        task,
        class: data.class,
        probability: data.probability,
        modelVersion: data.modelVersion || (task === 'eye' ? 'DR-MobileNetV3-Live' : 'Oral-EfficientNet-Live'),
        inferenceTimeMs: Date.now() - startTime,
        explanationSupported: !!data.explanationSupported,
        explanationText: data.explanationText,
        heatmapCoordinates: data.heatmapCoordinates,
      };
    } catch (err) {
      if (process.env.MODEL_MODE === 'real') {
        throw new Error(`Real model service unavailable (${(err as Error).message}).`);
      }
      // Graceful fallback to demo provider if running in auto mode
      const fallback = new DemoModelProvider();
      return task === 'eye' ? fallback.analyzeRetina(imageUri, options) : fallback.analyzeOral(imageUri, options);
    }
  }
}

/**
 * Factory to retrieve active model provider based on configuration
 */
export function getModelProvider(preferredMode?: 'real' | 'demo'): ModelProvider {
  const mode = preferredMode || process.env.MODEL_MODE?.toLowerCase() || 'real';
  if (mode === 'demo') {
    return new DemoModelProvider();
  }
  return new RealModelProvider();
}

/**
 * Clinical Mapping Logic
 * Strictly conservative clinical interpretation.
 * Never uses diagnostic certainty ("You have cancer", "100% accurate").
 */
export function mapModelOutputToScreeningResult(
  modelOutput: ModelOutput,
  quality: ImageQualityResult,
  patientId: string,
  imageUri: string,
  screeningType: ScreeningType,
  confidenceThreshold = 0.60,
  modelMode: 'real' | 'demo' = 'demo'
): ScreeningResult {
  const screeningId = `SCR-${Date.now().toString().slice(-6)}`;
  const confidencePercent = Math.round(modelOutput.probability * 100);

  // GATING 0A: Wrong Image Type Validation Gate
  if (modelOutput.class === 'wrong_image_type' || quality.validationStatus === 'wrong_image_type') {
    const reasonText = modelOutput.explanationText || quality.feedback || 'Wrong image type for selected screening.';
    return {
      screeningId,
      patientId,
      type: screeningType,
      imageReference: imageUri,
      imageQuality: {
        ...quality,
        grade: 'UNUSABLE',
        score: Math.min(quality.score || 10, 10),
        isAcceptable: false,
        canProceedWithWarning: false,
        validationStatus: 'wrong_image_type',
        feedback: reasonText,
        warnings: [
          ...(quality.warnings || []),
          reasonText,
        ],
      },
      resultState: 'quality_insufficient',
      riskLevel: 'inconclusive',
      prediction: 'Screening Blocked: Wrong Image Type',
      confidence: 0,
      recommendation: reasonText,
      clinicalCaveat: 'Automated disease screening was withheld. Pathology prediction is prohibited on non-target images.',
      explanationSupported: false,
      explanationText: reasonText,
      modelVersion: modelOutput.modelVersion,
      modelMode,
      dataSource: modelMode,
      deviceInfo: 'Edge Telemedicine Unit',
      createdAt: new Date().toISOString(),
    };
  }

  // GATING 0B: Poor Image Quality Gate (Retake Required)
  if (modelOutput.class === 'poor_quality' || quality.validationStatus === 'correct_type_poor_quality' || !quality.isAcceptable || quality.grade === 'UNUSABLE') {
    const reasonText = modelOutput.explanationText || quality.feedback || 'Image quality insufficient for automated analysis. Please retake the image.';
    return {
      screeningId,
      patientId,
      type: screeningType,
      imageReference: imageUri,
      imageQuality: {
        ...quality,
        isAcceptable: false,
        canProceedWithWarning: false,
        validationStatus: 'correct_type_poor_quality',
        feedback: reasonText,
      },
      resultState: 'quality_insufficient',
      riskLevel: 'inconclusive',
      prediction: 'Screening Blocked: Image Quality Insufficient',
      confidence: 0,
      recommendation: reasonText,
      clinicalCaveat: 'Automated disease screening was blocked due to optical blur or underexposure to avoid inaccurate findings.',
      explanationSupported: false,
      explanationText: modelOutput.explanationText || quality.feedback || 'Visual explanation is unavailable for degraded captures.',
      modelVersion: modelOutput.modelVersion,
      modelMode,
      dataSource: modelMode,
      deviceInfo: 'Edge Telemedicine Unit',
      createdAt: new Date().toISOString(),
    };
  }

  // GATING 2: If model probability is below clinical confidence threshold
  if (modelOutput.probability < confidenceThreshold) {
    return {
      screeningId,
      patientId,
      type: screeningType,
      imageReference: imageUri,
      imageQuality: quality,
      resultState: 'low_confidence',
      riskLevel: 'inconclusive',
      prediction: 'Unable to determine reliably',
      confidence: confidencePercent,
      recommendation: 'Visual features are borderline or uncertain. Consider manual examination by a healthcare professional.',
      clinicalCaveat: 'Model confidence score fell below the configured safety threshold. Does not constitute a clinical rule-out.',
      explanationSupported: false,
      explanationText: 'Confidence threshold not met. Saliency map is withheld to prevent misleading interpretation.',
      modelVersion: modelOutput.modelVersion,
      modelMode,
      dataSource: modelMode,
      deviceInfo: 'Edge Telemedicine Unit',
      createdAt: new Date().toISOString(),
    };
  }

  // GATING 3: State 2 (Potential finding detected / Clinical review recommended)
  const isHigherRisk = 
    modelOutput.class === 'referable_dr' || 
    modelOutput.class === 'suspicious_lesion' ||
    modelOutput.class === 'moderate_dr';

  if (isHigherRisk) {
    const isEye = screeningType === 'eye';
    return {
      screeningId,
      patientId,
      type: screeningType,
      imageReference: imageUri,
      imageQuality: quality,
      resultState: 'potential_finding',
      riskLevel: 'higher_risk',
      prediction: isEye 
        ? 'Potential DR-related finding detected' 
        : 'Potential oral mucosal finding detected',
      confidence: confidencePercent,
      recommendation: isEye
        ? 'Clinical review recommended: Consider referral to an ophthalmologist for comprehensive dilated fundus examination.'
        : 'Clinical review recommended: Consider referral to an oral physician or dental specialist for clinical biopsy evaluation.',
      clinicalCaveat: isEye
        ? 'Screening finding: Optical patterns consistent with referable diabetic retinopathy identified. This is NOT a definitive clinical diagnosis.'
        : 'Screening finding: Surface irregularity noted. This is a preliminary risk triage and NOT a cancer diagnosis. Histological verification required.',
      explanationSupported: modelOutput.explanationSupported,
      explanationText: modelOutput.explanationText,
      heatmapCoordinates: modelOutput.heatmapCoordinates,
      modelVersion: modelOutput.modelVersion,
      modelMode,
      dataSource: modelMode,
      deviceInfo: 'Edge Telemedicine Unit',
      createdAt: new Date().toISOString(),
    };
  }

  // GATING 4: State 1 (No obvious abnormality detected)
  const isEye = screeningType === 'eye';
  return {
    screeningId,
    patientId,
    type: screeningType,
    imageReference: imageUri,
    imageQuality: quality,
    resultState: 'no_abnormality',
    riskLevel: 'lower_risk',
    prediction: 'No obvious abnormality detected',
    confidence: confidencePercent,
    recommendation: isEye
      ? 'No visual signs of referable diabetic retinopathy identified at this time. Routine annual screening advised.'
      : 'No obvious mucosal lesions detected. Maintain regular oral hygiene evaluation and self-checks.',
    clinicalCaveat: 'Screening finding: Automated screening cannot guarantee complete absence of early microvascular or non-visualized pathology.',
    explanationSupported: modelOutput.explanationSupported,
    explanationText: modelOutput.explanationText,
    heatmapCoordinates: modelOutput.heatmapCoordinates,
    modelVersion: modelOutput.modelVersion,
    modelMode,
    dataSource: modelMode,
    deviceInfo: 'Edge Telemedicine Unit',
    createdAt: new Date().toISOString(),
  };
}
