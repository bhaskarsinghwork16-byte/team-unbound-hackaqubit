import { NextResponse } from 'next/server';
import { getPrograms, saveProgram } from '@/lib/db-store';
import { ScreeningProgram } from '@/types';

export async function GET() {
  try {
    const programs = await getPrograms();
    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const program: ScreeningProgram = {
      ...body,
      programId: body.programId || `PRG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: body.status || 'DRAFT',
    };
    
    await saveProgram(program);
    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
