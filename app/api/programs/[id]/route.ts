import { NextResponse } from 'next/server';
import { getProgramById, updateProgram } from '@/lib/db-store';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const program = await getProgramById(params.id);
    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const program = await updateProgram(params.id, body);
    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update program' },
      { status: 500 }
    );
  }
}
