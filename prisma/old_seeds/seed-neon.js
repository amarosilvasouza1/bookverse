/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Neon Burst Frame...');

  const neonFrame = await prisma.item.create({
    data: {
      name: 'Neon Party',
      description: 'A vibrant celebration of cyan, magenta, and blue. Let the colors dance!',
      price: 5000,
      type: 'FRAME',
      rarity: 'NEON_BURST',
      data: { cssClass: 'frame-neon' }
    }
  });

  console.log('Created Neon Burst Frame:', neonFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
