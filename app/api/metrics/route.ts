import { NextResponse } from 'next/server';
import { getOperationalMetrics } from '@/lib/db-store';

/**
 * GET /api/metrics
 * Returns real operational statistics for the Overview dashboard
 */
export async function GET() {
  try {
    const metrics = await getOperationalMetrics();
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('[API /api/metrics GET]', error);
    return NextResponse.json(
      {
        success: false,
        metrics: {
          todayScreenings: 0,
          patientsScreened: 0,
          awaitingReview: 0,
          activeReferrals: 0,
        },
      },
      { status: 500 }
    );
  }
}
