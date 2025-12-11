'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from './notification';

// Send notification to all followers when a new chapter is published
export async function notifyNewChapter(bookId: string, chapterTitle: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    // Get the book with author info
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: {
          select: { id: true, name: true, username: true }
        }
      }
    });

    if (!book) return { error: 'Book not found' };
    if (book.authorId !== session.id) return { error: 'Not the author' };

    // Get all followers of the author
    const followers = await prisma.follow.findMany({
      where: { followingId: book.authorId },
      select: { followerId: true }
    });

    // Create notifications for each follower
    const notifications = followers.map(f => 
      createNotification(
        f.followerId,
        'NEW_CHAPTER',
        `${book.author.name || book.author.username} published a new chapter: "${chapterTitle}" in "${book.title}"`,
        `/dashboard/books/${bookId}`
      )
    );

    await Promise.all(notifications);

    return { success: true, notifiedCount: followers.length };
  } catch (error) {
    console.error('Failed to send chapter notifications:', error);
    return { error: 'Failed to send notifications' };
  }
}

// Subscribe to web push notifications
export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await prisma.user.update({
      where: { id: session.id as string },
      data: {
        pushSubscription: subscription as object
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return { error: 'Failed to subscribe' };
  }
}

// Unsubscribe from web push
export async function unsubscribeFromPush() {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    await prisma.user.update({
      where: { id: session.id as string },
      data: { pushSubscription: undefined }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return { error: 'Failed to unsubscribe' };
  }
}

// Get push subscription status
export async function getPushStatus() {
  const session = await getSession();
  if (!session?.id) return { subscribed: false };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      select: { pushSubscription: true }
    });

    return { subscribed: !!user?.pushSubscription };
  } catch {
    return { subscribed: false };
  }
}
