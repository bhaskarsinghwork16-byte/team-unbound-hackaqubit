/**
 * scripts/seed-mongo.js
 * 
 * Imports all data from local JSON files (data/*.json) into MongoDB.
 * Works with local MongoDB (mongodb://localhost:27017) or MongoDB Atlas.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthscreen_ai';
const dbName = process.env.MONGODB_DB || 'healthscreen_ai';
const dataDir = path.join(__dirname, '..', 'data');

async function main() {
  console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
  
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  
  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB!');
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

    console.log('\n🎉 All collections synced into MongoDB successfully!');
  } catch (err) {
    console.error('❌ MongoDB sync failed:', err.message);
    console.log('\nTip: If you are connecting to a local MongoDB instance, ensure mongod is running.');
    console.log('Or use a MongoDB Atlas connection string in .env.local.');
  } finally {
    await client.close();
  }
}

main();
