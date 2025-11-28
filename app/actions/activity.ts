'use server';

import { prisma } from '@/lib/prisma';

export type ActivityType = 'PUBLISH_BOOK' | 'REVIEW_BOOK' | 'LIKE_BOOK' | 'FOLLOW_USER';

export async function logActivity(
  userId: string,
  type: ActivityType,
  entityId: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        entityId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: metadata as any,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw, just log error so main action doesn't fail
  }
}

export async function getActivityFeed(userId?: string) {
  try {
    const where = userId ? { userId } : {};

    const activities = await prisma.activity.findMany({
      where,
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error('Failed to fetch activity feed:', error);
    return { error: 'Failed to load feed' };
  }
}
