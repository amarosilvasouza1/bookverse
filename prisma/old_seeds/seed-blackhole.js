/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Black Hole Frame...');

  const blackHoleFrame = await prisma.item.create({
    data: {
      name: 'Event Horizon',
      description: 'A singularity that bends light and time. Features a dynamic particle simulation.',
      price: 5000,
      type: 'FRAME',
      rarity: 'BLACK_HOLE',
      data: { cssClass: 'frame-blackhole' } // Not used by UI, logic is in UserAvatar
    }
  });

  console.log('Created Black Hole Frame:', blackHoleFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
