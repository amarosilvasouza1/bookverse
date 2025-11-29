/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Magic Burst Frame...');

  const magicFrame = await prisma.item.create({
    data: {
      name: 'Mystic Burst',
      description: 'A magical explosion of colors and shapes. Bursting with energy!',
      price: 6000,
      type: 'FRAME',
      rarity: 'MAGIC_BURST',
      data: { cssClass: 'frame-magic' }
    }
  });

  console.log('Created Magic Burst Frame:', magicFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
