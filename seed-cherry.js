/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cherry Blossom Frame...');

  const cherryFrame = await prisma.item.create({
    data: {
      name: 'Sakura Breeze',
      description: 'Gentle cherry blossom petals drifting in the wind. Reacts to your presence.',
      price: 4000,
      type: 'FRAME',
      rarity: 'CHERRY_BLOSSOM',
      data: { cssClass: 'frame-cherry' } // Logic is in UserAvatar
    }
  });

  console.log('Created Cherry Blossom Frame:', cherryFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
