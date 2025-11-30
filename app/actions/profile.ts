'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getMiniProfile(userId: string) {
  const session = await getSession();
  const currentUserId = session?.id as string | undefined;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      banner: true,
      _count: {
        select: {
          followers: true,
          following: true,
          books: { where: { published: true } }
        }
      },
      followers: currentUserId ? {
        where: { followerId: currentUserId },
        select: { followerId: true }
      } : false,
      items: {
        where: { equipped: true, item: { type: 'FRAME' } },
        select: { item: { select: { rarity: true } } }
      }
    }
  });

  if (!user) return null;

  return {
    ...user,
    isFollowing: user.followers && user.followers.length > 0
  };
}
