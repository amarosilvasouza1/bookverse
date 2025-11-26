'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getBookAnalytics(bookId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // Verify ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { authorId: true, pages: { select: { id: true } } },
    });

    if (!book || book.authorId !== session.id) {
      return { error: 'Unauthorized' };
    }

    const totalPages = book.pages.length;

    // 1. Total Readers (unique users who have a ReadingProgress entry)
    const totalReaders = await prisma.readingProgress.count({
      where: { bookId },
    });

    // 2. Average Progress
    const progressEntries = await prisma.readingProgress.findMany({
      where: { bookId },
      select: { pageNumber: true },
    });

    const totalProgress = progressEntries.reduce((acc, curr) => acc + curr.pageNumber, 0);
    const avgPage = totalReaders > 0 ? totalProgress / totalReaders : 0;
    const avgPercentage = totalPages > 0 ? (avgPage / totalPages) * 100 : 0;

    // 3. Completion Rate (users who reached the last page)
    const completedReaders = progressEntries.filter(p => p.pageNumber >= totalPages).length;
    const completionRate = totalReaders > 0 ? (completedReaders / totalReaders) * 100 : 0;

    // 4. Reader Funnel (Readers per page)
    // Note: ReadingProgress stores the *current* page. 
    // So if a user is on page 5, they have "passed" pages 1-4.
    // To get a true funnel, we need to calculate how many users have reached at least page X.
    // Since we only store current page, we can assume if someone is on page 5, they read 1-4.
    // So for page X, the count is sum of users on page >= X.
    
    const funnelData = [];
    for (let i = 1; i <= totalPages; i++) {
        const count = progressEntries.filter(p => p.pageNumber >= i).length;
        funnelData.push({ page: i, count });
    }

    return {
      success: true,
      data: {
        totalReaders,
        avgPercentage: Math.round(avgPercentage),
        completionRate: Math.round(completionRate),
        funnelData,
        totalPages
      }
    };

  } catch (error: unknown) {
    console.error('Analytics Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return { error: errorMessage };
  }
}

export async function updateReadingProgress(bookId: string, pageNumber: number) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: session.id as string,
          bookId,
        },
      },
      update: {
        pageNumber,
      },
      create: {
        userId: session.id as string,
        bookId,
        pageNumber,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Update Progress Error:', error);
    return { error: 'Failed to update progress' };
  }
}
