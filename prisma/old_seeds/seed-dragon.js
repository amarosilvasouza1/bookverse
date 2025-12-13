const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dragon Frame...');

  const dragonFrame = await prisma.item.create({
    data: {
      name: 'Dragon Breath',
      description: 'A legendary frame forged in dragon fire. Features a rotating dragon spirit.',
      price: 5000,
      type: 'FRAME',
      rarity: 'DRAGON',
      data: { cssClass: 'frame-dragon' }
    }
  });

  console.log('Created Dragon Frame:', dragonFrame);

  const neonFrame = await prisma.item.create({
    data: {
      name: 'Neon Pulse',
      description: 'A vibrant, pulsing neon frame for the cyber-enhanced.',
      price: 1000,
      type: 'FRAME',
      rarity: 'EPIC',
      data: { cssClass: 'frame-epic' }
    }
  });

  console.log('Created Neon Frame:', neonFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
