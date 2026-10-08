import { NextResponse } from 'next/server';
import { getCamps, saveCamp } from '@/lib/db-store';
import { ScreeningCamp } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const camps = await getCamps(params.id);
    return NextResponse.json({ success: true, data: camps });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch camps' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const camp: ScreeningCamp = {
      ...body,
      programId: params.id,
      campId: body.campId || `CAMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: body.status || 'DRAFT',
    };
    
    await saveCamp(camp);
    return NextResponse.json({ success: true, data: camp });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create camp' },
      { status: 500 }
    );
  }
}
