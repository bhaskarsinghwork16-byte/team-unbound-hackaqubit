import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (process.platform === 'win32') {
      exec(`explorer.exe "${dataDir}"`);
    }
    return NextResponse.json({ success: true, message: 'Opened data folder in Windows Explorer', path: dataDir });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
