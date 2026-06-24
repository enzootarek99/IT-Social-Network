import prisma from '@/lib/db';

type CreateNotificationInput = {
  recipientId: string;
  actorId?: string;
  type: string;
  message: string;
  link?: string;
};

export async function createNotification({
  recipientId,
  actorId,
  type,
  message,
  link,
}: CreateNotificationInput) {
  if (actorId && actorId === recipientId) {
    return null;
  }

  return prisma.notification.create({
    data: {
      recipientId,
      actorId,
      type,
      message,
      link,
    },
  });
}
