/**
 * scripts/seed-mongo.js
 * 
 * Imports all data from local JSON files (data/*.json) into MongoDB Atlas.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read URI from .env.local or .env natively
function getMongoConfig() {
  const envFiles = ['.env.local', '.env'];
  let uri = process.env.MONGODB_URI;
  let dbName = process.env.MONGODB_DB || 'healthscreen_ai';

  for (const f of envFiles) {
    const fullPath = path.join(__dirname, '..', f);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('MONGODB_URI=') && !uri) {
          uri = trimmed.substring('MONGODB_URI='.length).trim();
        }
        if (trimmed.startsWith('MONGODB_DB=')) {
          dbName = trimmed.substring('MONGODB_DB='.length).trim();
        }
      }
    }
  }

  return {
    uri: uri || 'mongodb://localhost:27017/healthscreen_ai',
    dbName: dbName || 'healthscreen_ai',
  };
}

const { uri, dbName } = getMongoConfig();
const dataDir = path.join(__dirname, '..', 'data');

async function main() {
  console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
  
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  
  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB Atlas!');
    const db = client.db(dbName);

    // 1. Seed Patients
    const patientsFile = path.join(dataDir, 'patients.json');
    if (fs.existsSync(patientsFile)) {
      const patients = JSON.parse(fs.readFileSync(patientsFile, 'utf-8'));
      if (patients.length > 0) {
        const col = db.collection('patients');
        for (const p of patients) {
          const filter = { patientId: p.patientId };
          await col.updateOne(filter, { $set: p }, { upsert: true });
        }
        console.log(`✅ Upserted ${patients.length} patient records into '${dbName}.patients'`);
      }
    }

    // 2. Seed Screenings
    const screeningsFile = path.join(dataDir, 'screenings.json');
    if (fs.existsSync(screeningsFile)) {
      const screenings = JSON.parse(fs.readFileSync(screeningsFile, 'utf-8'));
      if (screenings.length > 0) {
        const col = db.collection('screenings');
        for (const s of screenings) {
          const filter = { screeningId: s.screeningId };
          await col.updateOne(filter, { $set: s }, { upsert: true });
        }
        console.log(`✅ Upserted ${screenings.length} screening encounters into '${dbName}.screenings'`);
      }
    }

    // 3. Seed Referrals
    const referralsFile = path.join(dataDir, 'referrals.json');
    if (fs.existsSync(referralsFile)) {
      const referrals = JSON.parse(fs.readFileSync(referralsFile, 'utf-8'));
      if (referrals.length > 0) {
        const col = db.collection('referrals');
        for (const r of referrals) {
          const filter = { referralId: r.referralId };
          await col.updateOne(filter, { $set: r }, { upsert: true });
        }
        console.log(`✅ Upserted ${referrals.length} referral records into '${dbName}.referrals'`);
      }
    }

    // 4. Also seed Kaggle datasets, models, and validation cohort
    try {
      require('./seed-kaggle');
    } catch (kErr) {
      console.warn('Note on Kaggle seeding:', kErr.message);
    }

    // 5. Verify counts
    const patientCount = await db.collection('patients').countDocuments();
    const screeningCount = await db.collection('screenings').countDocuments();
    const referralCount = await db.collection('referrals').countDocuments();
    const datasetCount = await db.collection('datasets').countDocuments();
    const modelCount = await db.collection('models').countDocuments();
    const kaggleCohortCount = await db.collection('kaggle_cohort').countDocuments();

    console.log('\n=============================================');
    console.log(`🎉 LIVE DATABASE VERIFICATION: ${dbName}`);
    console.log(`   - patients collection:      ${patientCount} documents`);
    console.log(`   - screenings collection:    ${screeningCount} documents`);
    console.log(`   - referrals collection:     ${referralCount} documents`);
    console.log(`   - datasets (Kaggle):        ${datasetCount} documents`);
    console.log(`   - models (Benchmarks):      ${modelCount} documents`);
    console.log(`   - kaggle_cohort (Cases):    ${kaggleCohortCount} documents`);
    console.log('=============================================');
    console.log('✅ All data + Kaggle collections officially attached to MongoDB Atlas!\n');
  } catch (err) {
    console.error('❌ MongoDB sync failed:', err.message);
  } finally {
    await client.close();
  }
}

main();
