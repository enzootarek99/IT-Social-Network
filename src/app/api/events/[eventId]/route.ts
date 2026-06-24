import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, publicUserSelect } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireString } from '@/lib/parsers';

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { eventId } = await context.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: { select: publicUserSelect },
        attendees: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: publicUserSelect },
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      event: {
        ...event,
        attendingByMe: user
          ? event.attendees.some((attendee) => attendee.userId === user.id)
          : false,
        isOrganizer: user?.id === event.organizerId,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { eventId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: 'You can only edit your own events' }, { status: 403 });
    }

    const body = await request.json();
    const startsAt = new Date(requireString(body.startsAt, 'startsAt'));
    const endsAt = body.endsAt ? new Date(body.endsAt) : null;

    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      return NextResponse.json({ error: 'Invalid event date' }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: requireString(body.title, 'title'),
        description: requireString(body.description, 'description'),
        location: requireString(body.location, 'location'),
        startsAt,
        endsAt,
        online: Boolean(body.online ?? false),
        url: typeof body.url === 'string' ? body.url.trim() || null : null,
      },
      include: {
        organizer: { select: publicUserSelect },
        _count: { select: { attendees: true } },
      },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event';
    const status = message.includes('required') ? 400 : 500;

    if (status === 500) {
      console.error('Error updating event:', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { eventId } = await context.params;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own events' }, { status: 403 });
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
