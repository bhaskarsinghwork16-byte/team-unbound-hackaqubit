import { NextResponse } from 'next/server';
import { checkMongoHealth } from '@/lib/mongodb';

export async function GET() {
  const mongoStatus = await checkMongoHealth();

  let mlStatus = {
    connected: false,
    service: 'Python PyTorch Microservice',
    port: 5000,
    message: 'Offline (Fallback to calibrated rules)',
  };

  try {
    const mlRes = await fetch('http://localhost:5000/health', {
      signal: AbortSignal.timeout(800),
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      mlStatus = {
        connected: true,
        service: mlData.service || 'PyTorch Inference Service',
        port: mlData.port || 5000,
        message: 'Online (PyTorch MobileNetV3 + Grad-CAM active)',
      };
    }
  } catch {
    // Offline - gracefully handled
  }

  return NextResponse.json({
    status: 'healthy',
    application: 'HealthScreen AI',
    tagline: 'Early screening. Anywhere.',
    version: '1.2.0',
    mode: 'Edge-First Telemedicine Engine',
    database: mongoStatus,
    mlService: mlStatus,
    timestamp: new Date().toISOString(),
  });
}
