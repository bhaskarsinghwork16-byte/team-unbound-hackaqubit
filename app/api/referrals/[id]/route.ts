import { NextRequest, NextResponse } from 'next/server';
import { updateReferralStatus } from '@/lib/db-store';

/**
 * PATCH /api/referrals/[id]
 * Updates status or notes on a referral
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const referralId = params.id;
    const body = await request.json();

    const updated = await updateReferralStatus(referralId, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Referral not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referral: updated,
    });
  } catch (error) {
    console.error(`[API /api/referrals/${params.id} PATCH]`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update referral record' },
      { status: 500 }
    );
  }
}
