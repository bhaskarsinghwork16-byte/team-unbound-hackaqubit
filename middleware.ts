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

// Public API paths — no JWT needed
const PUBLIC_API_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout', '/api/health'];

// Public page paths — no JWT needed (landing page and login page)
const PUBLIC_PAGE_PATHS = ['/login', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Skip Next.js internals and static files ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // ── 2. Rate limiting on all /api routes ──
  if (pathname.startsWith('/api')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Skip rate limiting in development
    if (process.env.NODE_ENV !== 'development' && isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // ── 3. Allow public API paths ──
  if (pathname.startsWith('/api') && PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── 4. Allow public page paths ──
  if (PUBLIC_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── 5. Authenticate protected routes ──
  // Try cookie first, then Authorization header
  let token = request.cookies.get('access_token')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // No token — handle based on whether this is an API or page request
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect browser requests to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const payload = await verifyToken(token, 'access');

  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    // Redirect browser to login — token expired or invalid
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear stale cookies
    response.cookies.delete('access_token');
    return response;
  }

  // ── 6. Pass user info to route handlers via request headers ──
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.sub || '');
  requestHeaders.set('x-user-role', payload.role as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Match all routes except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
