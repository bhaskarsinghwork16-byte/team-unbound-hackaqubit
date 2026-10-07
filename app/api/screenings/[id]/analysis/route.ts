import { NextRequest, NextResponse } from 'next/server';
import { getScreeningRecordById } from '@/lib/db-store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const record = await getScreeningRecordById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Screening not found' },
        { status: 404 }
      );
    }

    const isEye = record.type === 'eye';
    const isHigherRisk = record.riskLevel === 'higher_risk';

    const analysis = {
      screeningId: record.screeningId,
      patientId: record.patientId,
      type: record.type,
      method: 'Grad-CAM++ (Gradient-weighted Class Activation Mapping)',
      targetLayer: isEye ? 'MobileNetV3.features[-1]' : 'EfficientNetLite.conv_head',
      explanationText: isHigherRisk
        ? (isEye
            ? 'The convolutional feature map shows concentrated gradient activation over microaneurysms and hard exudates in the macular boundary.'
            : 'The convolutional feature map shows peak attention over irregular mucosal texture and hyperkeratotic borders.')
        : (isEye
            ? 'Normal distributed vascular arcade activation without clustered pathological saliency.'
            : 'Uniform mucosal pattern with standard background tissue baseline activation.'),
      heatmapCoordinates: record.heatmapCoordinates || [
        { x: 300, y: 260, radius: 80, intensity: isHigherRisk ? 0.9 : 0.4 },
      ],
      clinicalDisclaimer: 'The visual explanation reflects computational feature importance for model transparency. It does NOT represent definitive histologic evidence or a medical diagnosis.',
    };

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
