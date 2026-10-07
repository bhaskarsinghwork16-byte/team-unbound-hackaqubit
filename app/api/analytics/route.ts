import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/db-store';

export async function GET() {
  try {
    const data = await getAnalytics();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
