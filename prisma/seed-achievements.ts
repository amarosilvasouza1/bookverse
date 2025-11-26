import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      name: 'First Word',
      description: 'Create your first book.',
      icon: 'BookOpen',
      criteriaType: 'BOOK_COUNT',
      criteriaValue: 1,
      xpReward: 100,
    },
    {
      name: 'Prolific Writer',
      description: 'Create 5 books.',
      icon: 'Feather',
      criteriaType: 'BOOK_COUNT',
      criteriaValue: 5,
      xpReward: 500,
    },
    {
      name: 'Community Voice',
      description: 'Create your first community post.',
      icon: 'MessageCircle',
      criteriaType: 'POST_COUNT',
      criteriaValue: 1,
      xpReward: 50,
    },
    {
      name: 'Influencer',
      description: 'Create 10 community posts.',
      icon: 'Megaphone',
      criteriaType: 'POST_COUNT',
      criteriaValue: 10,
      xpReward: 300,
    },
  ];

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name },
    });

    if (!existing) {
      await prisma.achievement.create({
        data: achievement,
      });
      console.log(`Created achievement: ${achievement.name}`);
    } else {
      console.log(`Achievement already exists: ${achievement.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
