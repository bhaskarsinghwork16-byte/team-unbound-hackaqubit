import { NextResponse } from 'next/server';
import { realModels } from '@/lib/db-store';

export async function GET() {
  return NextResponse.json({
    success: true,
    count: realModels.length,
    data: realModels,
  });
}
