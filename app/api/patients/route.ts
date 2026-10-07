import { NextRequest, NextResponse } from 'next/server';
import { getPatients, savePatient } from '@/lib/db-store';
import { PatientRecord } from '@/types';
import { Role } from '@/lib/security/types';
import { hasPermission } from '@/lib/security/authorization/rbac';
import { patientSchema } from '@/lib/security/validation/schemas';

/**
 * GET /api/patients
 * Query parameters:
 *   - search: string (matches name, patientId, phone)
 *   - filter: 'all' | 'recent' | 'followup'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const filter = searchParams.get('filter') || 'all';

    const userRole = request.headers.get('x-user-role') as Role;
    if (!userRole || !hasPermission(userRole, 'PATIENT_READ')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }


    let patients = await getPatients();

    if (search) {
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.patientId.toLowerCase().includes(search) ||
          (p.phone && p.phone.includes(search))
      );
    }

    if (filter === 'recent') {
      patients = patients.filter((p) => p.lastScreeningDate);
    } else if (filter === 'followup') {
      patients = patients.filter((p) => p.needsFollowUp);
    }

    return NextResponse.json({
      success: true,
      patients,
      total: patients.length,
    });
  } catch (error) {
    console.error('[API /api/patients GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Body: { name, age, sex, phone?, address?, notes?, facilityId? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate with Zod
    const parsedBody = patientSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsedBody.error.issues },
        { status: 400 }
      );
    }
    
    const validBody = parsedBody.data;

    const userRole = request.headers.get('x-user-role') as Role;
    if (!userRole || !hasPermission(userRole, 'PATIENT_CREATE')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }



    // Generate permanent patient identifier (e.g. PT-1042)
    const existing = await getPatients();
    const highestNum = existing.reduce((max, p) => {
      const match = p.patientId.match(/PT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1040);

    const nextId = `PT-${highestNum + 1}`;
    const now = new Date().toISOString();

    const newPatient: PatientRecord = {
      patientId: nextId,
      name: validBody.name.trim(),
      age: Number(validBody.age),
      sex: validBody.sex,
      phone: validBody.phone?.trim() || undefined,
      address: validBody.address?.trim() || undefined,
      facilityId: validBody.facilityId || 'FAC-MAIN',
      registeredDate: now,
      notes: validBody.notes?.trim() || undefined,
      needsFollowUp: false,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await savePatient(newPatient);

    return NextResponse.json({
      success: true,
      patient: saved,
    }, { status: 201 });
  } catch (error) {
    console.error('[API /api/patients POST]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create patient record' },
      { status: 500 }
    );
  }
}
