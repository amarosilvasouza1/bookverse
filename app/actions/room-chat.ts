'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function sendRoomMessage(roomId: string, content: string) {
  try {
    const session = await getSession() as { id: string } | null;
    if (!session?.id) {
      return { error: 'Unauthorized' };
    }

    if (!content.trim()) {
      return { error: 'Message cannot be empty' };
    }

    // @ts-ignore - ReadingRoomMessage not generated yet
    const message = await prisma.readingRoomMessage.create({
      data: {
        roomId,
        userId: session.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/dashboard/books/${roomId}`); // Revalidate relevant path if needed
    return { success: true, message };
  } catch (error) {
    console.error('Error sending room message:', error);
    return { error: 'Failed to send message' };
  }
}

export async function getRoomMessages(roomId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // @ts-ignore - ReadingRoomMessage not generated yet
    const messages = await prisma.readingRoomMessage.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 50, // Limit to last 50 messages
    });

    return { success: true, messages };
  } catch (error) {
    console.error('Error fetching room messages:', error);
    return { error: 'Failed to fetch messages' };
  }
}
