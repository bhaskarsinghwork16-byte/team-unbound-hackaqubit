import { NextResponse } from 'next/server';
import { checkMongoHealth } from '@/lib/mongodb';

export async function GET() {
  const mongoStatus = await checkMongoHealth();

  return NextResponse.json({
    status: 'healthy',
    application: 'HealthScreen AI',
    tagline: 'Early screening. Anywhere.',
    version: '1.2.0',
    mode: 'Edge-First Telemedicine Engine',
    database: mongoStatus,
    timestamp: new Date().toISOString(),
  });
}
