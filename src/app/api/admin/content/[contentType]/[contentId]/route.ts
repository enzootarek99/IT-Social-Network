import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/db';

type RouteContext = {
  params: Promise<{
    contentType: string;
    contentId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { response } = await requireAdmin(request);
    const { contentType, contentId } = await context.params;

    if (response) {
      return response;
    }

    if (contentType === 'posts') {
      await prisma.post.delete({ where: { id: contentId } });
    } else if (contentType === 'comments') {
      await prisma.comment.delete({ where: { id: contentId } });
    } else if (contentType === 'opportunities') {
      await prisma.freelanceOpportunity.delete({ where: { id: contentId } });
    } else if (contentType === 'events') {
      await prisma.event.delete({ where: { id: contentId } });
    } else if (contentType === 'conversations') {
      await prisma.conversation.delete({ where: { id: contentId } });
    } else if (contentType === 'messages') {
      await prisma.message.delete({ where: { id: contentId } });
    } else if (contentType === 'notifications') {
      await prisma.notification.delete({ where: { id: contentId } });
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting admin content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
