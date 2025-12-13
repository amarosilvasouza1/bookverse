/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Chat Bubbles...');

  const bubbles = [
    {
      name: 'Snowy Whisper',
      description: 'A chilly breeze carries your words with falling snowflakes.',
      price: 2500,
      type: 'BUBBLE',
      rarity: 'RARE',
      data: { cssClass: 'bubble-snow' }
    },
    {
      name: 'Spooky Message',
      description: 'Boo! A haunted bubble for the brave.',
      price: 3000,
      type: 'BUBBLE',
      rarity: 'EPIC',
      data: { cssClass: 'bubble-halloween' }
    },
    {
      name: 'Starry Night',
      description: 'Send your messages written in the stars.',
      price: 5000,
      type: 'BUBBLE',
      rarity: 'LEGENDARY',
      data: { cssClass: 'bubble-starry' }
    },
    {
      name: 'Sunny Day',
      description: 'A bright and cheerful bubble with a sun and cloud.',
      price: 2000,
      type: 'BUBBLE',
      rarity: 'RARE',
      data: { cssClass: 'bubble-sky' }
    },
    {
      name: 'Sakura Bloom',
      description: 'Pixelated cherry blossoms for a retro aesthetic.',
      price: 4500,
      type: 'BUBBLE',
      rarity: 'EPIC',
      data: { cssClass: 'bubble-sakura' }
    },
    {
      name: 'Floral Symphony',
      description: 'A flashy burst of spring flowers.',
      price: 3500,
      type: 'BUBBLE',
      rarity: 'RARE',
      data: { cssClass: 'bubble-spring' }
    }
  ];

  for (const bubble of bubbles) {
    const existing = await prisma.item.findFirst({
      where: { name: bubble.name }
    });

    if (!existing) {
      const created = await prisma.item.create({
        data: bubble
      });
      console.log(`Created bubble: ${created.name}`);
    } else {
      console.log(`Bubble already exists: ${existing.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
