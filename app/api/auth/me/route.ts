import { NextResponse } from 'next/server';

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's basic info from headers injected by middleware.
 * The middleware validates the JWT and injects x-user-id and x-user-role.
 */
export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');
  const role = req.headers.get('x-user-role');

  if (!userId || !role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ userId, role });
}
