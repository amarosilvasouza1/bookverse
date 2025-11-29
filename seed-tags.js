/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tags & Achievements...');

  // Beta Tester Achievement
  const betaAchievement = await prisma.achievement.upsert({
    where: { id: 'achievement-beta-tester' }, // Using a fixed ID for simplicity or find by name if unique
    update: {},
    create: {
      id: 'achievement-beta-tester',
      name: 'Beta Tester',
      description: 'Participated in the early testing phase of BookVerse.',
      icon: 'TestTube', // Lucide icon name
      criteriaType: 'MANUAL',
      criteriaValue: 1,
      xpReward: 500
    }
  });
  console.log('Upserted Beta Tester Achievement:', betaAchievement);

  // Dev Achievement
  const devAchievement = await prisma.achievement.upsert({
    where: { id: 'achievement-dev' },
    update: {},
    create: {
      id: 'achievement-dev',
      name: 'Developer',
      description: 'One of the creators of BookVerse.',
      icon: 'Code', // Lucide icon name
      criteriaType: 'MANUAL',
      criteriaValue: 1,
      xpReward: 1000
    }
  });
  console.log('Upserted Dev Achievement:', devAchievement);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
