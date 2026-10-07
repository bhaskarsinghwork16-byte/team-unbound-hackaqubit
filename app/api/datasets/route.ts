import { NextResponse } from 'next/server';
import { realDatasets } from '@/lib/db-store';

export async function GET() {
  return NextResponse.json({
    success: true,
    count: realDatasets.length,
    data: realDatasets,
  });
}
