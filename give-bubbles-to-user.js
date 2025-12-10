/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetUsername = 'login';
  console.log(`Assigning bubbles to user: ${targetUsername}...`);

  const user = await prisma.user.findUnique({
    where: { username: targetUsername }
  });

  if (!user) {
    console.error(`User '${targetUsername}' not found!`);
    return;
  }

  const bubbles = await prisma.item.findMany({
    where: { type: 'BUBBLE' }
  });

  console.log(`Found ${bubbles.length} bubble items.`);

  for (const bubble of bubbles) {
    try {
      const userItem = await prisma.userItem.create({
        data: {
          userId: user.id,
          itemId: bubble.id,
          equipped: false // Don't equip automatically, let them choose
        }
      });
      console.log(`Gave '${bubble.name}' to ${targetUsername}`);
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`User already has '${bubble.name}'`);
      } else {
        console.error(`Failed to give '${bubble.name}':`, e.message);
      }
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
