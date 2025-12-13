const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      name: 'Zinc Frame',
      description: 'A simple, sturdy frame for beginners.',
      price: 10,
      type: 'FRAME',
      rarity: 'COMMON',
      data: { cssClass: 'frame-common' }
    },
    {
      name: 'Neon Blue',
      description: 'A glowing blue frame that stands out.',
      price: 50,
      type: 'FRAME',
      rarity: 'RARE',
      data: { cssClass: 'frame-rare' }
    },
    {
      name: 'Royal Purple',
      description: 'An elegant purple aura for distinguished authors.',
      price: 150,
      type: 'FRAME',
      rarity: 'EPIC',
      data: { cssClass: 'frame-epic' }
    },
    {
      name: 'Golden Shimmer',
      description: 'A legendary golden frame that shimmers with success.',
      price: 500,
      type: 'FRAME',
      rarity: 'LEGENDARY',
      data: { cssClass: 'frame-legendary' }
    },
    {
      name: 'Cosmic Void',
      description: 'A super beautiful, animated cosmic frame.',
      price: 1000,
      type: 'FRAME',
      rarity: 'COSMIC',
      data: { cssClass: 'frame-cosmic' }
    }
  ];

  for (const item of items) {
    const existing = await prisma.item.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.item.create({ data: item });
      console.log(`Created ${item.name}`);
    } else {
      console.log(`Skipped ${item.name} (exists)`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
