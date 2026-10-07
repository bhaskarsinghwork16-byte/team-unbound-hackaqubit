import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/security/auth/jwt';
import { invalidateSession } from '../../../../lib/security/auth/session';
import { logger } from '../../../../lib/security/logger';
import { SECURITY_EVENTS } from '../../../../lib/security/constants';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('refresh_token')?.value;

    if (token) {
      const payload = await verifyToken(token, 'refresh');
      if (payload && payload.sessionId) {
        await invalidateSession(payload.sessionId as string);

        logger.securityEvent({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: SECURITY_EVENTS.LOGOUT,
          userId: payload.sub,
          action: 'LOGOUT',
          status: 'SUCCESS',
        });
      }
    }

    const response = NextResponse.json({ success: true });
    
    // Clear cookies
    response.cookies.delete('access_token');
    response.cookies.delete({
      name: 'refresh_token',
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
