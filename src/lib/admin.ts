import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      user: null,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user, response: null };
}
