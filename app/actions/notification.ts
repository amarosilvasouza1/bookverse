'use server';

import { prisma } from '@/lib/prisma';

export async function createNotification(
  userId: string,
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM' | 'MENTION' | 'REACTION' | 'BOOK_UPDATE' | 'NEW_CHAPTER',
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
      },
    });
    // We don't revalidate path here because notifications are polled or fetched client-side usually
    // But if we had a notifications page, we would.
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    
    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return { success: true, data: notifications, unreadCount };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { error: 'Failed to load notifications' };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { error: 'Failed to update notification' };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return { error: 'Failed to update notifications' };
  }
}
