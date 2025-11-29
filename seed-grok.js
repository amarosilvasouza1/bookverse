/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Grok Black Hole Frame...');

  const grokFrame = await prisma.item.create({
    data: {
      name: "Grok's Horizon",
      description: 'A mysterious gravitational anomaly. It reveals its true form when you get close.',
      price: 8000,
      type: 'FRAME',
      rarity: 'GROK_BLACK_HOLE',
      data: { cssClass: 'frame-grok' }
    }
  });

  console.log('Created Grok Black Hole Frame:', grokFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
