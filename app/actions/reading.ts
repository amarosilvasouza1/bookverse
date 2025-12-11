'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Start a reading session
export async function startReadingSession(bookId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  const userId = session.id as string;

  try {
    const readingSession = await prisma.readingSession.create({
      data: {
        userId,
        bookId,
      }
    });

    return { success: true, sessionId: readingSession.id };
  } catch (error) {
    console.error('Failed to start reading session:', error);
    return { error: 'Failed to start session' };
  }
}

// End a reading session
export async function endReadingSession(sessionId: string, pagesRead: number) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await prisma.readingSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        pagesRead,
      }
    });

    // Award XP for reading (1 XP per page, max 50 per session)
    const xpGained = Math.min(pagesRead, 50);
    await prisma.user.update({
      where: { id: session.id as string },
      data: { xp: { increment: xpGained } }
    });

    return { success: true, xpGained };
  } catch (error) {
    console.error('Failed to end reading session:', error);
    return { error: 'Failed to end session' };
  }
}

// Get reading statistics for a user
export async function getReadingStats(userId?: string) {
  const session = await getSession();
  const targetUserId = userId || session?.id as string;
  
  if (!targetUserId) return { error: 'User not found' };

  try {
    const sessions = await prisma.readingSession.findMany({
      where: { userId: targetUserId },
      include: { book: { select: { id: true, title: true, coverImage: true } } }
    });

    // Calculate stats
    const totalSessions = sessions.length;
    const totalPagesRead = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const totalTimeMs = sessions.reduce((sum, s) => {
      if (s.endTime) {
        return sum + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime());
      }
      return sum;
    }, 0);
    const totalMinutes = Math.round(totalTimeMs / 1000 / 60);

    // Books read (unique)
    const uniqueBooks = [...new Set(sessions.map(s => s.bookId))];

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSessions = sessions.filter(s => new Date(s.startTime) > weekAgo);
    const recentPages = recentSessions.reduce((sum, s) => sum + s.pagesRead, 0);

    return {
      success: true,
      data: {
        totalSessions,
        totalPagesRead,
        totalMinutes,
        booksRead: uniqueBooks.length,
        recentPages,
        recentSessions: recentSessions.length
      }
    };
  } catch (error) {
    console.error('Failed to get reading stats:', error);
    return { error: 'Failed to get stats' };
  }
}

// --- Bookmarks ---

// Add a bookmark
export async function addBookmark(bookId: string, pageNumber: number, note?: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  const userId = session.id as string;

  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        bookId,
        pageNumber,
        note,
      }
    });

    revalidatePath(`/dashboard/books/${bookId}`);
    return { success: true, bookmark };
  } catch (error) {
    console.error('Failed to add bookmark:', error);
    return { error: 'Failed to add bookmark' };
  }
}

// Remove a bookmark
export async function removeBookmark(bookmarkId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await prisma.bookmark.delete({
      where: { id: bookmarkId }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove bookmark:', error);
    return { error: 'Failed to remove bookmark' };
  }
}

// Get bookmarks for a book
export async function getBookmarks(bookId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  const userId = session.id as string;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, bookId },
      orderBy: { pageNumber: 'asc' }
    });

    return { success: true, data: bookmarks };
  } catch (error) {
    console.error('Failed to get bookmarks:', error);
    return { error: 'Failed to get bookmarks' };
  }
}

// Update bookmark note
export async function updateBookmarkNote(bookmarkId: string, note: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { note }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update bookmark:', error);
    return { error: 'Failed to update bookmark' };
  }
}
