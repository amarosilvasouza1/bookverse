/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Water Distortion Frame...');

  const waterFrame = await prisma.item.create({
    data: {
      name: 'Liquid Soul',
      description: 'A mesmerizing liquid distortion effect. Your avatar flows like water.',
      price: 7000,
      type: 'FRAME',
      rarity: 'WATER_DISTORTION',
      data: { cssClass: 'frame-water' }
    }
  });

  console.log('Created Water Distortion Frame:', waterFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
