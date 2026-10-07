import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatabase, checkMongoHealth } from '@/lib/mongodb';
import { getPatients, getScreeningRecords, getReferrals } from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mongoStatus = await checkMongoHealth();
    const dataDir = path.join(process.cwd(), 'data');

    // Check files on disk
    const getFileSize = (filename: string) => {
      try {
        const filePath = path.join(dataDir, filename);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          return {
            exists: true,
            sizeBytes: stats.size,
            sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
            updatedAt: stats.mtime.toISOString(),
          };
        }
      } catch {}
      return { exists: false, sizeBytes: 0, sizeFormatted: '0 KB', updatedAt: null };
    };

    const patients = await getPatients();
    const screenings = await getScreeningRecords();
    const referrals = await getReferrals();

    const collections = [
      {
        name: 'screenings',
        displayName: 'Screening Encounters',
        count: screenings.length,
        fileInfo: getFileSize('screenings.json'),
        description: 'Retinal fundus & oral mucosal image captures, quality metrics, Laplacian blur scores, and AI triage findings.',
        documents: screenings,
      },
      {
        name: 'patients',
        displayName: 'Registered Patients',
        count: patients.length,
        fileInfo: getFileSize('patients.json'),
        description: 'Community patient demographics, contact numbers, ages, and medical encounter histories.',
        documents: patients,
      },
      {
        name: 'referrals',
        displayName: 'Specialist Referrals',
        count: referrals.length,
        fileInfo: getFileSize('referrals.json'),
        description: 'Secondary care escalation slips, destination hospitals, priorities, and tele-consult notes.',
        documents: referrals,
      },
    ];

    return NextResponse.json({
      success: true,
      database: {
        name: process.env.MONGODB_DB || 'healthscreen_ai',
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthscreen_ai',
        connected: mongoStatus.connected,
        statusMessage: mongoStatus.message,
        storageEngine: mongoStatus.connected ? 'MongoDB Atlas / Local' : 'Persistent Local File Store (Offline-First)',
        dataDirectory: dataDir,
      },
      collections,
    });
  } catch (error) {
    console.error('Error fetching database info:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
