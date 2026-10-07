import { NextResponse } from 'next/server';
import { verifyPassword } from '../../../../lib/security/auth/hash';
import { getUserByUsername, createSession } from '../../../../lib/security/auth/session';
import { createAccessToken, createRefreshToken } from '../../../../lib/security/auth/jwt';
import { logger } from '../../../../lib/security/logger';
import { SECURITY_EVENTS } from '../../../../lib/security/constants';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const user = await getUserByUsername(username);

    // Fail safely without indicating if the user exists
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      logger.securityEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: SECURITY_EVENTS.LOGIN_FAILED,
        action: 'LOGIN',
        status: 'FAILURE',
        metadata: { username },
      });
      // Return generic error
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Success - create session
    const sessionId = crypto.randomUUID();
    const family = crypto.randomUUID();
    
    await createSession(sessionId, user.userId, family);

    const accessToken = await createAccessToken(user.userId, user.role);
    const refreshToken = await createRefreshToken(user.userId, user.role, sessionId);

    logger.securityEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: SECURITY_EVENTS.LOGIN_SUCCESS,
      userId: user.userId,
      action: 'LOGIN',
      status: 'SUCCESS',
    });

    const response = NextResponse.json({ success: true });
    
    // Set HTTP-only cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 mins
    });
    
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
