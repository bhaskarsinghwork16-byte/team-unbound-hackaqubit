import { NextRequest, NextResponse } from 'next/server';
import { ScreeningType, ValidationApiResponse } from '@/types';
import { assessImageQualitySync } from '@/services/imageQuality';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const screeningType: ScreeningType = body.screeningType === 'oral' ? 'oral' : 'eye';
    const imageUri: string = body.imageUri || body.image || '';

    if (!imageUri) {
      return NextResponse.json<ValidationApiResponse>(
        {
          status: 'invalid',
          imageType: 'unknown',
          confidence: null,
          quality: { blur: 0, brightness: 0, contrast: 0, resolution: '0x0' },
          reason: 'No image provided for validation.',
        },
        { status: 400 }
      );
    }

    // Attempt live validation via Python Microservice on port 5000
    try {
      const pyRes = await fetch('http://localhost:5000/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: screeningType,
          image: imageUri,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (pyRes.ok) {
        const data = (await pyRes.json()) as ValidationApiResponse;
        return NextResponse.json(data);
      }
    } catch {
      // Python microservice unavailable or timed out; fall back to local validator
    }

    // Local fallback using CV imageQuality service
    const localQuality = assessImageQualitySync(imageUri, screeningType);
    const status: 'valid' | 'retake' | 'invalid' = 
      localQuality.validationStatus === 'valid_usable'
        ? 'valid'
        : localQuality.validationStatus === 'wrong_image_type'
        ? 'invalid'
        : 'retake';

    const imageType: 'retina' | 'oral' | 'unknown' =
      localQuality.typeValidation?.detectedType === 'retina'
        ? 'retina'
        : localQuality.typeValidation?.detectedType === 'oral'
        ? 'oral'
        : 'unknown';

    const responsePayload: ValidationApiResponse = {
      status,
      imageType,
      confidence: status === 'valid' ? (localQuality.typeValidation?.typeConfidence ? localQuality.typeValidation.typeConfidence / 100 : 0.90) : null,
      quality: {
        blur: localQuality.metrics.sharpness,
        brightness: localQuality.metrics.brightness,
        contrast: localQuality.metrics.contrast,
        resolution: `${localQuality.measurements?.width || 512}x${localQuality.measurements?.height || 512}`,
      },
      reason: localQuality.feedback,
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    return NextResponse.json<ValidationApiResponse>(
      {
        status: 'invalid',
        imageType: 'unknown',
        confidence: null,
        quality: { blur: 0, brightness: 0, contrast: 0, resolution: '0x0' },
        reason: (err as Error).message || 'Image validation failed',
      },
      { status: 500 }
    );
  }
}
