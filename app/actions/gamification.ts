'use server';

import { prisma } from '@/lib/prisma';

// Get top readers (by XP)
export async function getTopReaders(limit: number = 10) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        xp: true,
        level: true,
        items: {
          where: { equipped: true, item: { type: 'FRAME' } },
          select: { item: { select: { rarity: true } } },
          take: 1
        }
      }
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Failed to get top readers:', error);
    return { error: 'Failed to get leaderboard' };
  }
}

// Get top authors (by total book likes/reviews)
export async function getTopAuthors(limit: number = 10) {
  try {
    const authors = await prisma.user.findMany({
      where: {
        books: { some: {} } // Has at least one book
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        xp: true,
        level: true,
        items: {
          where: { equipped: true, item: { type: 'FRAME' } },
          select: { item: { select: { rarity: true } } },
          take: 1
        },
        books: {
          select: {
            _count: {
              select: { likes: true, reviews: true }
            }
          }
        }
      },
      take: 100 // Get more, then sort by engagement
    });

    // Calculate engagement score
    const authorsWithScore = authors.map(author => {
      const totalLikes = author.books.reduce((sum, b) => sum + b._count.likes, 0);
      const totalReviews = author.books.reduce((sum, b) => sum + b._count.reviews, 0);
      return {
        ...author,
        engagementScore: totalLikes + (totalReviews * 3), // Reviews worth more
        totalLikes,
        totalReviews,
        books: undefined // Remove nested books from response
      };
    });

    // Sort and limit
    authorsWithScore.sort((a, b) => b.engagementScore - a.engagementScore);

    return { success: true, data: authorsWithScore.slice(0, limit) };
  } catch (error) {
    console.error('Failed to get top authors:', error);
    return { error: 'Failed to get leaderboard' };
  }
}

// Get user rank
export async function getUserRank(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    });

    if (!user) return { error: 'User not found' };

    const rank = await prisma.user.count({
      where: { xp: { gt: user.xp } }
    }) + 1;

    return { success: true, rank };
  } catch (error) {
    console.error('Failed to get user rank:', error);
    return { error: 'Failed to get rank' };
  }
}
