import { NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/security/auth/hash';
import { getUserByUsername, saveUser } from '../../../../lib/security/auth/session';
import { logger } from '../../../../lib/security/logger';
import { SECURITY_EVENTS } from '../../../../lib/security/constants';
import type { Role } from '../../../../lib/security/types';
import crypto from 'crypto';

// Only SYSTEM_ADMIN can call this endpoint — enforced by middleware via x-user-role header
export async function POST(req: Request) {
  try {
    // Check caller is SYSTEM_ADMIN
    const callerRole = req.headers.get('x-user-role') as Role | null;
    if (callerRole !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username, password, role, name } = await req.json();

    if (!username || !password || !role || !name) {
      return NextResponse.json({ error: 'Missing required fields: username, password, role, name' }, { status: 400 });
    }

    const validRoles: Role[] = ['HEALTH_WORKER', 'DOCTOR', 'CAMP_ADMIN', 'SYSTEM_ADMIN', 'AUDITOR'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await saveUser({
      userId,
      username,
      passwordHash,
      role,
      name,
      createdAt: new Date().toISOString(),
      active: true,
    });

    logger.securityEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: SECURITY_EVENTS.LOGIN_SUCCESS,
      userId: req.headers.get('x-user-id') || 'unknown',
      action: 'USER_REGISTER',
      status: 'SUCCESS',
      metadata: { newUserId: userId, username, role },
    });

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    console.error('[Register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
