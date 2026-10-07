import { NextRequest, NextResponse } from 'next/server';
import { getScreeningRecords, saveScreeningRecord, savePatientRecord, getPatientById, updatePatient, savePatient } from '@/lib/db-store';
import { runScreeningInference } from '@/services/inference';
import { ScreeningResult } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const riskLevel = searchParams.get('riskLevel') || undefined;
    const search = searchParams.get('search') || undefined;

    const records = await getScreeningRecords({ type, riskLevel, search });
    return NextResponse.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Case 1: If client already passed an evaluated ScreeningResult to persist
    if (body.screeningId && body.resultState) {
      const record = body as ScreeningResult;
      await saveScreeningRecord(record);
      return NextResponse.json({
        success: true,
        data: record,
      }, { status: 201 });
    }

    // Case 2: Run inference & save
    const { 
      patientId, 
      screeningType, 
      imageUri, 
      confidenceThreshold, 
      targetScenario, 
      dataSource,
      qualityOverride 
    } = body;

    if (!patientId || !screeningType || !imageUri) {
      return NextResponse.json(
        { success: false, error: 'patientId, screeningType, and imageUri are required' },
        { status: 400 }
      );
    }

    // Ensure patient profile exists
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      await savePatient({
        patientId,
        name: `Patient ${patientId}`,
        age: 45,
        sex: 'Female',
        facilityId: 'FAC-CAMP',
        registeredDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    const result = await runScreeningInference({
      patientId,
      screeningType,
      imageUri,
      confidenceThreshold: confidenceThreshold ? Number(confidenceThreshold) : 0.60,
      targetScenario,
      qualityOverride,
      modelMode: dataSource === 'real' ? 'real' : (dataSource === 'demo' ? 'demo' : (process.env.MODEL_MODE?.toLowerCase() === 'real' ? 'real' : 'demo')),
    });

    // Fetch patient name if available for rapid record linkage
    const patientObj = await getPatientById(patientId);
    if (patientObj) {
      result.patientName = patientObj.name;
      await updatePatient(patientId, {
        lastScreeningDate: result.createdAt,
      });
    }

    await saveScreeningRecord(result);

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
