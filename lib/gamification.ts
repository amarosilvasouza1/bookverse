import { prisma } from '@/lib/prisma';

export type AchievementType = 'BOOK_COUNT' | 'POST_COUNT';

export async function checkAndAwardAchievements(userId: string, type: AchievementType) {
  // 1. Get user's current stats based on type
  let currentValue = 0;

  if (type === 'BOOK_COUNT') {
    currentValue = await prisma.book.count({ where: { authorId: userId } });
  } else if (type === 'POST_COUNT') {
    currentValue = await prisma.post.count({ where: { authorId: userId } });
  }

  // 2. Get all achievements of this type that the user hasn't unlocked yet
  const potentialAchievements = await prisma.achievement.findMany({
    where: {
      criteriaType: type,
      criteriaValue: {
        lte: currentValue,
      },
      users: {
        none: {
          userId: userId,
        },
      },
    },
  });

  // 3. Award new achievements
  const newAchievements = [];
  for (const achievement of potentialAchievements) {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });
    newAchievements.push(achievement);
  }

  return newAchievements;
}
