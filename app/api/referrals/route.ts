import { NextRequest, NextResponse } from 'next/server';
import { getReferrals, saveReferral, updateScreeningRecord, updatePatient } from '@/lib/db-store';
import { ReferralRecord } from '@/types';

/**
 * GET /api/referrals
 * Returns all referrals, optional filter by status or priority
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let referrals = await getReferrals();

    if (status && status !== 'all') {
      referrals = referrals.filter((r) => r.status === status);
    }
    if (priority && priority !== 'all') {
      referrals = referrals.filter((r) => r.priority === priority);
    }

    return NextResponse.json({
      success: true,
      referrals,
      total: referrals.length,
    });
  } catch (error) {
    console.error('[API /api/referrals GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referrals
 * Creates a new clinical referral
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.patientId || !body.screeningId || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'patientId, screeningId, and reason are required' },
        { status: 400 }
      );
    }

    const existing = await getReferrals();
    const highestNum = existing.reduce((max, r) => {
      const match = r.referralId.match(/REF-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 5000);

    const nextId = `REF-${highestNum + 1}`;
    const now = new Date().toISOString();

    const referral: ReferralRecord = {
      referralId: nextId,
      patientId: body.patientId,
      patientName: body.patientName || body.patientId,
      screeningId: body.screeningId,
      facilityId: body.facilityId || 'FAC-MAIN',
      screeningType: body.screeningType || 'eye',
      specialistType: body.specialistType || (body.screeningType === 'oral' ? 'Oral Medicine / ENT' : 'Ophthalmologist'),
      destinationFacility: body.destinationFacility || 'District Hospital Specialist Clinic',
      reason: body.reason,
      priority: body.priority || 'routine',
      status: 'pending',
      notes: body.notes || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await saveReferral(referral);

    // Update the screening record linkage
    await updateScreeningRecord(body.screeningId, {
      referralStatus: 'referral_recommended',
      referralId: nextId,
    });

    // Mark patient as needing follow-up
    await updatePatient(body.patientId, {
      needsFollowUp: true,
    });

    return NextResponse.json({
      success: true,
      referral: saved,
    }, { status: 201 });
  } catch (error) {
    console.error('[API /api/referrals POST]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create referral record' },
      { status: 500 }
    );
  }
}
