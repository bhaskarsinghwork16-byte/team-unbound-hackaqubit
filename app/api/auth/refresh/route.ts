import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/security/auth/jwt';
import { getSession, invalidateSession, createSession } from '../../../../lib/security/auth/session';
import { createAccessToken, createRefreshToken } from '../../../../lib/security/auth/jwt';
import { logger } from '../../../../lib/security/logger';
import { SECURITY_EVENTS } from '../../../../lib/security/constants';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('refresh_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const payload = await verifyToken(token, 'refresh');
    if (!payload || !payload.sessionId) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const session = await getSession(payload.sessionId as string);

    // Refresh token reuse detected (session invalidated already but token used)
    if (session && !session.valid) {
      logger.securityEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: SECURITY_EVENTS.TOKEN_REUSE_DETECTED,
        userId: payload.sub,
        action: 'REFRESH',
        status: 'FAILURE',
      });
      // Invalidate all user sessions to protect the account
      // await invalidateAllUserSessions(payload.sub!);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 401 });
    }

    // Invalidate old session (token rotation)
    await invalidateSession(session.sessionId);

    // Create new session
    const newSessionId = crypto.randomUUID();
    await createSession(newSessionId, payload.sub!, session.family);

    const newAccessToken = await createAccessToken(payload.sub!, payload.role as any);
    const newRefreshToken = await createRefreshToken(payload.sub!, payload.role as any, newSessionId);

    logger.securityEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: SECURITY_EVENTS.TOKEN_REFRESH,
      userId: payload.sub,
      action: 'REFRESH',
      status: 'SUCCESS',
    });

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60,
    });
    
    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
