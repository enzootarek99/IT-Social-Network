import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction, requireAdmin } from '@/lib/admin';
import prisma from '@/lib/db';

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { user, response } = await requireAdmin(request, 'roles:manage');
    const { userId } = await context.params;

    if (response) {
      return response;
    }

    const body = await request.json();
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'USER';

    if (user?.id === userId && role !== 'ADMIN') {
      return NextResponse.json({ error: 'You cannot remove your own admin role' }, { status: 400 });
    }

    const before = await prisma.user.findUnique({ where: { id: userId } });
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        role: true,
      },
    });
    await logAdminAction({
      actorId: user?.id,
      action: 'user.role.update',
      entityType: 'User',
      entityId: userId,
      before,
      after: updatedUser,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { user, response } = await requireAdmin(request, 'users:manage');
    const { userId } = await context.params;

    if (response) {
      return response;
    }

    if (user?.id === userId) {
      return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 });
    }

    const before = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.user.delete({ where: { id: userId } });
    await logAdminAction({
      actorId: user?.id,
      action: 'user.delete',
      entityType: 'User',
      entityId: userId,
      before,
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
