/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sakura Breeze Frame...');

  const existing = await prisma.item.findFirst({
    where: { rarity: 'SAKURA_BREEZE' }
  });

  if (existing) {
    console.log('Sakura Breeze Frame already exists.');
    return;
  }

  const frame = await prisma.item.create({
    data: {
      name: 'Sakura Breeze',
      description: 'Cherry blossoms falling gently. A sign of new beginnings.',
      price: 2500,
      type: 'FRAME',
      rarity: 'SAKURA_BREEZE',
      data: { cssClass: 'frame-sakura' }
    }
  });

  console.log('Created Sakura Breeze Frame:', frame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
