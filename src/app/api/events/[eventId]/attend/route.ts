import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { createNotification } from '@/lib/notifications';

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { eventId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        organizerId: true,
        title: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const existingAttendance = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.id,
        },
      },
    });

    if (existingAttendance) {
      await prisma.eventAttendee.delete({ where: { id: existingAttendance.id } });
      return NextResponse.json({ attending: false });
    }

    await prisma.eventAttendee.create({
      data: {
        eventId,
        userId: user.id,
      },
    });
    await createNotification({
      recipientId: event.organizerId,
      actorId: user.id,
      type: 'event_attendance',
      message: `${user.firstName} ${user.lastName} participe à "${event.title}".`,
      link: `/events/${eventId}`,
    });

    return NextResponse.json({ attending: true });
  } catch (error) {
    console.error('Error toggling event attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
