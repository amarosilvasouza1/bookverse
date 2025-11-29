'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface StatusData {
  bookId: string;
  bookTitle: string;
  coverImage?: string | null;
  chapterTitle?: string;
  chapterId?: string;
}

export async function createStatus(
  type: 'BOOK_PUBLISH' | 'CHAPTER_RELEASE',
  data: StatusData
) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Status expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.status.create({
      data: {
        userId: session.id as string,
        type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
        expiresAt
      }
    });

    revalidatePath('/dashboard/social');
    return { success: true };
  } catch (error) {
    console.error('Error creating status:', error);
    return { error: 'Failed to create status' };
  }
}
