import { NextResponse } from 'next/server';
import { getReportsMetrics } from '@/lib/db-store';

/**
 * GET /api/reports
 * Returns clinical report metrics calculated from actual MongoDB / local JSON data
 */
export async function GET() {
  try {
    const report = await getReportsMetrics();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('[API /api/reports GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate reports' },
      { status: 500 }
    );
  }
}
