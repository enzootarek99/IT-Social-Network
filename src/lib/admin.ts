import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getAuthUserFromToken } from '@/lib/auth';
import prisma from '@/lib/db';

export type AdminPermission =
  | 'dashboard:read'
  | 'users:manage'
  | 'content:manage'
  | 'freelance:manage'
  | 'events:manage'
  | 'appearance:manage'
  | 'pages:manage'
  | 'notifications:manage'
  | 'settings:manage'
  | 'roles:manage'
  | 'logs:read';

const permissionMap: Record<string, AdminPermission[]> = {
  SUPER_ADMIN: [
    'dashboard:read',
    'users:manage',
    'content:manage',
    'freelance:manage',
    'events:manage',
    'appearance:manage',
    'pages:manage',
    'notifications:manage',
    'settings:manage',
    'roles:manage',
    'logs:read',
  ],
  CONTENT_MANAGER: [
    'dashboard:read',
    'content:manage',
    'freelance:manage',
    'events:manage',
    'pages:manage',
    'notifications:manage',
    'logs:read',
  ],
  MODERATOR: ['dashboard:read', 'users:manage', 'content:manage', 'logs:read'],
  SUPPORT: ['dashboard:read', 'notifications:manage', 'logs:read'],
};

export function hasAdminPermission(user: { role?: string | null; adminRole?: string | null } | null, permission: AdminPermission) {
  if (!user || user.role !== 'ADMIN') {
    return false;
  }

  return permissionMap[user.adminRole || 'SUPPORT']?.includes(permission) || false;
}

export async function requireAdmin(request: NextRequest, permission: AdminPermission = 'dashboard:read') {
  const user = await getAuthUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  if (!hasAdminPermission(user, permission)) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user, response: null };
}

export async function requireAdminAction(permission: AdminPermission) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = await getAuthUserFromToken(token);

  if (!hasAdminPermission(user, permission)) {
    throw new Error('Admin permission denied');
  }

  return user!;
}

export async function logAdminAction({
  actorId,
  action,
  entityType,
  entityId,
  before,
  after,
}: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  return prisma.adminLog.create({
    data: {
      actorId: actorId || null,
      action,
      entityType,
      entityId: entityId || null,
      before: before === undefined ? undefined : (before as object),
      after: after === undefined ? undefined : (after as object),
    },
  });
}
