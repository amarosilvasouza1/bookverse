/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Autumn Leaves Frame...');

  const existing = await prisma.item.findFirst({
    where: { rarity: 'AUTUMN_LEAVES' }
  });

  if (existing) {
    console.log('Autumn Leaves Frame already exists.');
    return;
  }

  const frame = await prisma.item.create({
    data: {
      name: 'Autumn Breeze',
      description: 'Leaves falling gently in the wind. Swirls when you hover!',
      price: 2500,
      type: 'FRAME',
      rarity: 'AUTUMN_LEAVES',
      data: { cssClass: 'frame-autumn' }
    }
  });

  console.log('Created Autumn Leaves Frame:', frame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
