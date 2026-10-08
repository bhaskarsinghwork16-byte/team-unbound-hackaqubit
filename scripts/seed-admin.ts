/**
 * scripts/seed-admin.ts
 *
 * One-time script to create the initial SYSTEM_ADMIN account.
 * Run with:   npx ts-node scripts/seed-admin.ts
 *
 * Set env vars first (or copy .env.example to .env):
 *   ADMIN_USERNAME=admin
 *   ADMIN_PASSWORD=YourSecurePassword123!
 *   ADMIN_NAME="Admin User"
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { hashPassword } from '../lib/security/auth/hash';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'HealthAdmin2026!';
  const name = process.env.ADMIN_NAME || 'System Administrator';

  if (!password) {
    console.error('❌  ADMIN_PASSWORD env variable is required.');
    console.error('    Set it in .env or export it before running this script.');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('❌  ADMIN_PASSWORD must be at least 12 characters.');
    process.exit(1);
  }

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load existing users
  let users: any[] = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch {
      users = [];
    }
  }

  // Check if admin already exists
  if (users.find((u: any) => u.username === username)) {
    console.warn(`⚠️   User "${username}" already exists. Skipping.`);
    process.exit(0);
  }

  // Hash password
  console.log('🔐  Hashing password with secure salt…');
  const passwordHash = await hashPassword(password);

  const adminUser = {
    userId: crypto.randomUUID(),
    username,
    passwordHash,
    role: 'SYSTEM_ADMIN',
    name,
    createdAt: new Date().toISOString(),
    active: true,
  };

  users.push(adminUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

  console.log('✅  Admin user created successfully!');
  console.log(`    Username : ${username}`);
  console.log(`    Role     : SYSTEM_ADMIN`);
  console.log(`    User ID  : ${adminUser.userId}`);
  console.log('');
  console.log('   You can now sign in at /login with these credentials.');
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
