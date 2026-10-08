import { NextResponse } from 'next/server';
import { getCampById, updateCamp } from '@/lib/db-store';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const camp = await getCampById(params.id);
    if (!camp) {
      return NextResponse.json(
        { success: false, error: 'Camp not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: camp });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch camp' },
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
    const camp = await updateCamp(params.id, body);
    if (!camp) {
      return NextResponse.json(
        { success: false, error: 'Camp not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: camp });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update camp' },
      { status: 500 }
    );
  }
}
