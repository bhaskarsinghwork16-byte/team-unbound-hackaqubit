import { NextRequest, NextResponse } from 'next/server';
import { getPatientById, updatePatient, getScreeningRecords, getReferrals } from '@/lib/db-store';
import { Role } from '@/lib/security/types';
import { hasPermission, canAccessPatient } from '@/lib/security/authorization/rbac';

/**
 * GET /api/patients/[id]
 * Returns full patient record along with their linked screenings & referrals.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;
    const patient = await getPatientById(patientId);

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const userRole = _request.headers.get('x-user-role') as Role;
    const userId = _request.headers.get('x-user-id') as string;
    
    if (!userRole || !hasPermission(userRole, 'PATIENT_READ') || !canAccessPatient(userRole, userId, patient.facilityId)) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }


    // Fetch linked screenings and referrals for this patient
    const allScreenings = await getScreeningRecords();
    const patientScreenings = allScreenings.filter(
      (s) => s.patientId.toUpperCase() === patientId.toUpperCase()
    );

    const allReferrals = await getReferrals();
    const patientReferrals = allReferrals.filter(
      (r) => r.patientId.toUpperCase() === patientId.toUpperCase()
    );

    return NextResponse.json({
      success: true,
      patient,
      screenings: patientScreenings,
      referrals: patientReferrals,
    });
  } catch (error) {
    console.error(`[API /api/patients/${params.id} GET]`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve patient profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/patients/[id]
 * Updates patient notes, follow-up status, phone, etc.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;
    const body = await request.json();

    const userRole = request.headers.get('x-user-role') as Role;
    const userId = request.headers.get('x-user-id') as string;
    
    if (!userRole || !hasPermission(userRole, 'PATIENT_UPDATE')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const patient = await getPatientById(patientId);
    if (!patient || !canAccessPatient(userRole, userId, patient.facilityId)) {
      return NextResponse.json({ success: false, error: 'Access denied or patient not found' }, { status: 404 });
    }

    const updated = await updatePatient(patientId, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Patient not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: updated,
    });
  } catch (error) {
    console.error(`[API /api/patients/${params.id} PATCH]`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update patient record' },
      { status: 500 }
    );
  }
}
