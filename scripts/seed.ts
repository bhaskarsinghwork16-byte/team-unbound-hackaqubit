import { hashPassword } from '../lib/security/auth/hash';
import { saveUser } from '../lib/security/auth/session';
import crypto from 'crypto';

async function main() {
  const password = process.argv[2] || 'admin123';
  const username = process.argv[3] || 'admin';
  const role = process.argv[4] || 'SYSTEM_ADMIN';

  console.log(`Seeding user: ${username} with role ${role}`);

  const passwordHash = await hashPassword(password);
  
  await saveUser({
    userId: crypto.randomUUID(),
    username,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  });

  console.log('User created successfully.');
  process.exit(0);
}

main().catch(console.error);
