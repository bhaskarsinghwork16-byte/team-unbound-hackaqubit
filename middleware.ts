import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/security/auth/jwt';
import { securityConfig } from './lib/security/config';

// Simple in-memory rate limiter for Edge (Note: state is isolated per isolate, but sufficient for this context)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - record.timestamp > securityConfig.rateLimitWindowMs) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= securityConfig.rateLimitMaxRequests) {
    return true; // Limited
  }

  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting to all /api routes
  if (pathname.startsWith('/api')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // We skip rate limiting for development to prevent locking out local dev easily
    if (process.env.NODE_ENV !== 'development' && isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // Define public API paths that don't need authentication
  const publicPaths = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout', '/api/health'];
  
  if (pathname.startsWith('/api') && !publicPaths.includes(pathname)) {
    // 1. Get token from cookies or Authorization header
    let token = request.cookies.get('access_token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify token
    const payload = await verifyToken(token, 'access');
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // 3. Pass the user info to the route via headers (since we can't mutate req.user in Edge)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub || '');
    requestHeaders.set('x-user-role', payload.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Proceed normally for non-protected or non-API routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
