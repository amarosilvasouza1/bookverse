'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface StatusData {
  bookId?: string;
  bookTitle?: string;
  coverImage?: string | null;
  chapterTitle?: string;
  releaseDate?: Date | string;
  authorName?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  caption?: string;
}

export async function createStatus(type: string, data: StatusData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    await prisma.status.create({
      data: {
        userId: session.id as string,
        type, 
        expiresAt,
        data: data as any // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    });

    revalidatePath('/dashboard/social');
    return { success: true };
  } catch (error) {
    console.error('Failed to create status:', error);
    return { error: 'Failed to create status' };
  }
}

export async function getStatuses() {
  const session = await getSession();
  if (!session) return [];

  // Get statuses from people I follow + my own
  const userId = session.id as string;

  return await prisma.status.findMany({
    where: {
      expiresAt: { gt: new Date() },
      OR: [
        { userId: userId },
        { user: { followers: { some: { followerId: userId } } } }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
