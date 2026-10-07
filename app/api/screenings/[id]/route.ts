import { NextRequest, NextResponse } from 'next/server';
import { getScreeningRecordById } from '@/lib/db-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const record = await getScreeningRecordById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Screening not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
