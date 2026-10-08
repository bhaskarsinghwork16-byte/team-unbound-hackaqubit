import { NextResponse } from 'next/server';
import { getModels } from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const models = await getModels();
  return NextResponse.json({
    success: true,
    count: models.length,
    data: models,
  });
}

