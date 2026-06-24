import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction, requireAdmin } from '@/lib/admin';
import prisma from '@/lib/db';

type RouteContext = {
  params: Promise<{
    contentType: string;
    contentId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { user, response } = await requireAdmin(request, 'content:manage');
    const { contentType, contentId } = await context.params;

    if (response) {
      return response;
    }

    if (contentType === 'posts') {
      const before = await prisma.post.findUnique({ where: { id: contentId } });
      await prisma.post.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'post.delete', entityType: 'Post', entityId: contentId, before });
    } else if (contentType === 'comments') {
      const before = await prisma.comment.findUnique({ where: { id: contentId } });
      await prisma.comment.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'comment.delete', entityType: 'Comment', entityId: contentId, before });
    } else if (contentType === 'opportunities') {
      const before = await prisma.freelanceOpportunity.findUnique({ where: { id: contentId } });
      await prisma.freelanceOpportunity.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'opportunity.delete', entityType: 'FreelanceOpportunity', entityId: contentId, before });
    } else if (contentType === 'events') {
      const before = await prisma.event.findUnique({ where: { id: contentId } });
      await prisma.event.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'event.delete', entityType: 'Event', entityId: contentId, before });
    } else if (contentType === 'conversations') {
      const before = await prisma.conversation.findUnique({ where: { id: contentId } });
      await prisma.conversation.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'conversation.delete', entityType: 'Conversation', entityId: contentId, before });
    } else if (contentType === 'messages') {
      const before = await prisma.message.findUnique({ where: { id: contentId } });
      await prisma.message.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'message.delete', entityType: 'Message', entityId: contentId, before });
    } else if (contentType === 'notifications') {
      const before = await prisma.notification.findUnique({ where: { id: contentId } });
      await prisma.notification.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'notification.delete', entityType: 'Notification', entityId: contentId, before });
    } else if (contentType === 'reports') {
      const before = await prisma.report.findUnique({ where: { id: contentId } });
      await prisma.report.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'report.delete', entityType: 'Report', entityId: contentId, before });
    } else if (contentType === 'reviews') {
      const before = await prisma.opportunityReview.findUnique({ where: { id: contentId } });
      await prisma.opportunityReview.delete({ where: { id: contentId } });
      await logAdminAction({ actorId: user?.id, action: 'review.delete', entityType: 'OpportunityReview', entityId: contentId, before });
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting admin content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
