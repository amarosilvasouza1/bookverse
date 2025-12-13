/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting unified seeding...');

  // --- ITEMS (Frames & Bubbles) ---
  const items = [
    // Frames
    {
      name: 'Autumn Breeze',
      description: 'Leaves falling gently in the wind. Swirls when you hover!',
      price: 2500,
      type: 'FRAME',
      rarity: 'AUTUMN_LEAVES',
      data: { cssClass: 'frame-autumn' }
    },
    {
      name: 'Dragon Breath',
      description: 'A legendary frame forged in dragon fire. Features a rotating dragon spirit.',
      price: 5000,
      type: 'FRAME',
      rarity: 'DRAGON',
      data: { cssClass: 'frame-dragon' }
    },
    {
      name: 'Neon Pulse',
      description: 'A vibrant, pulsing neon frame for the cyber-enhanced.',
      price: 1000,
      type: 'FRAME',
      rarity: 'EPIC',
      data: { cssClass: 'frame-epic' }
    },
    {
      name: 'Neon Party',
      description: 'A vibrant celebration of cyan, magenta, and blue. Let the colors dance!',
      price: 5000,
      type: 'FRAME',
      rarity: 'NEON_BURST',
      data: { cssClass: 'frame-neon' }
    },
    {
      name: 'Event Horizon',
      description: 'A singularity that bends light and time. Features a dynamic particle simulation.',
      price: 5000,
      type: 'FRAME',
      rarity: 'BLACK_HOLE',
      data: { cssClass: 'frame-blackhole' }
    },
    {
      name: 'Sakura Breeze',
      description: 'Gentle cherry blossom petals drifting in the wind. Reacts to your presence.',
      price: 2500,
      type: 'FRAME',
      rarity: 'SAKURA_BREEZE', // Updated from CHERRY_BLOSSOM to match latest seed
      data: { cssClass: 'frame-sakura' }
    },
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
    },
    {
      name: 'Mystic Burst',
      description: 'A magical explosion of colors and shapes. Bursting with energy!',
      price: 6000,
      type: 'FRAME',
      rarity: 'MAGIC_BURST',
      data: { cssClass: 'frame-magic' }
    },
    {
      name: "Grok's Horizon",
      description: 'A mysterious gravitational anomaly. It reveals its true form when you get close.',
      price: 8000,
      type: 'FRAME',
      rarity: 'GROK_BLACK_HOLE',
      data: { cssClass: 'frame-grok' }
    },
    {
      name: 'Liquid Soul',
      description: 'A mesmerizing liquid distortion effect. Your avatar flows like water.',
      price: 7000,
      type: 'FRAME',
      rarity: 'WATER_DISTORTION',
      data: { cssClass: 'frame-water' }
    },
    {
      name: 'Electric Aura',
      description: 'A high-voltage field of pure energy that surrounds your avatar.',
      price: 2500,
      type: 'FRAME',
      rarity: 'ELECTRIC',
      data: { cssClass: 'electric-frame' }
    },
    {
      name: 'Electric Blue',
      description: 'A high-voltage field of pure blue energy.',
      price: 3000,
      type: 'FRAME',
      rarity: 'ELECTRIC_BLUE',
      data: { cssClass: 'electric-frame-blue' }
    },

    // Bubbles
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

  for (const item of items) {
    const existing = await prisma.item.findFirst({
      where: { name: item.name }
    });

    if (!existing) {
      await prisma.item.create({ data: item });
      console.log(`✅ Created item: ${item.name}`);
    } else {
      console.log(`⚠️ Skipped item: ${item.name} (Already exists)`);
    }
  }

  // --- ACHIEVEMENTS ---
  const achievements = [
    {
      id: 'achievement-beta-tester',
      name: 'Beta Tester',
      description: 'Participated in the early testing phase of BookVerse.',
      icon: 'TestTube',
      criteriaType: 'MANUAL',
      criteriaValue: 1,
      xpReward: 500
    },
    {
      id: 'achievement-dev',
      name: 'Developer',
      description: 'One of the creators of BookVerse.',
      icon: 'Code',
      criteriaType: 'MANUAL',
      criteriaValue: 1,
      xpReward: 1000
    }
  ];

  for (const ach of achievements) {
    const upserted = await prisma.achievement.upsert({
      where: { id: ach.id },
      update: {},
      create: ach
    });
    console.log(`✅ Upserted achievement: ${upserted.name}`);
  }

  console.log('🏁 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
