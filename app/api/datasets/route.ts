import { NextResponse } from 'next/server';
import { getDatasets } from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const datasets = await getDatasets();
  return NextResponse.json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
}

