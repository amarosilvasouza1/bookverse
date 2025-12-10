/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting Chat Bubble Distribution...');

  // 1. Fetch all Bubble Items
  const allBubbles = await prisma.item.findMany({
    where: { type: 'BUBBLE' }
  });

  if (allBubbles.length === 0) {
    console.log('No chat bubbles found in database. Run seed script first.');
    return;
  }
  console.log(`Found ${allBubbles.length} bubble variants.`);

  // 2. Fetch all Users
  const allUsers = await prisma.user.findMany();
  console.log(`Found ${allUsers.length} users.`);

  for (const user of allUsers) {
    const isBeta = user.tags && user.tags.includes('BETA');
    
    let bubblesToGive = [];

    if (isBeta) {
      console.log(`User ${user.username} is BETA. Giving ALL bubbles.`);
      bubblesToGive = allBubbles;
    } else {
      // Pick 2 random unique bubbles
      console.log(`User ${user.username} is regular. Picking 2 random bubbles.`);
      const shuffled = [...allBubbles].sort(() => 0.5 - Math.random());
      bubblesToGive = shuffled.slice(0, 2);
    }

    // Assign items
    for (const bubble of bubblesToGive) {
      try {
        // Check if already owns to avoid unique constraint error
        const existing = await prisma.userItem.findUnique({
          where: {
            userId_itemId: {
              userId: user.id,
              itemId: bubble.id
            }
          }
        });

        if (!existing) {
            await prisma.userItem.create({
                data: {
                    userId: user.id,
                    itemId: bubble.id,
                    equipped: false
                }
            });
            // console.log(`   + Given ${bubble.name}`); 
        }
      } catch (e) {
        // Ignore unique constraint violations just in case race condition or other error
        console.error(`   Error giving ${bubble.name} to ${user.username}: ${e.message}`);
      }
    }
  }
  
  console.log('Distribution complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
