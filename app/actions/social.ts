'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSuggestedUsers(limit = 5) {
  const session = await getSession();
  if (!session) return [];

  // Find users that the current user is NOT following
  // And exclude the current user
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: session.id as string } },
        {
          followers: {
            none: {
              followerId: session.id as string
            }
          }
        }
      ]
    },
    take: limit,
    orderBy: {
      followers: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      _count: {
        select: {
          followers: true,
          books: true
        }
      },
      items: {
        where: { equipped: true, item: { type: 'FRAME' } },
        select: { item: { select: { rarity: true } } }
      }
    }
  });

  return users;
}

export async function followUser(targetUserId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.follow.create({
      data: {
        followerId: session.id as string,
        followingId: targetUserId
      }
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'FOLLOW',
        message: `${session.username || 'Someone'} started following you`,
        link: `/dashboard/profile/${session.username || ''}`
      }
    });

    revalidatePath('/dashboard/social');
    revalidatePath(`/dashboard/profile/${targetUserId}`); // In case we are on their profile
    return { success: true };
  } catch (error) {
    console.error('Follow error:', error);
    // Likely already following
    return { error: 'Failed to follow' };
  }
}

export async function unfollowUser(targetUserId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await prisma.follow.deleteMany({
      where: {
        followerId: session.id as string,
        followingId: targetUserId
      }
    });

    revalidatePath('/dashboard/social');
    revalidatePath(`/dashboard/profile/${targetUserId}`);
    return { success: true };
  } catch (error) {
    console.error('Unfollow error:', error);
    return { error: 'Failed to unfollow' };
  }
}
