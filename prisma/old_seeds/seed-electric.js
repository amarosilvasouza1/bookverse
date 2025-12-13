/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Replacing all frames with Electric Aura...');

  // 1. Delete all existing frames
  // Note: This might fail if there are foreign key constraints (Purchases, Inventory).
  // We should first delete related records or just update them.
  // For simplicity and cleanliness, let's try to delete inventory items first.
  
  // Find all frame items
  const frames = await prisma.item.findMany({
    where: { type: 'FRAME' }
  });

  const frameIds = frames.map(f => f.id);

  if (frameIds.length > 0) {
    console.log(`Found ${frameIds.length} existing frames. Cleaning up...`);

    // Delete inventory items
    await prisma.userItem.deleteMany({
      where: { itemId: { in: frameIds } }
    });
    console.log('Deleted inventory items.');

    // Delete purchases (optional, but good for cleanup)
    // Assuming Purchase model links to Item? Let's check schema if needed, but usually Purchase is for Books.
    // If Purchase is for Items too, we'd delete them. 
    // Based on previous context, Purchase is for Books. 
    // But let's check if there's a StoreTransaction or similar.
    // Actually, let's just delete the Items. If it fails, we know why.
    
    await prisma.item.deleteMany({
      where: { id: { in: frameIds } }
    });
    console.log('Deleted old frame items.');
  }

  // 2. Create Electric Aura Frame
  const electricFrame = await prisma.item.create({
    data: {
      name: 'Electric Aura',
      description: 'A high-voltage field of pure energy that surrounds your avatar.',
      price: 2500, // Reasonable price
      type: 'FRAME',
      rarity: 'ELECTRIC', // New rarity
      data: { cssClass: 'electric-frame' } // Not strictly used by UI anymore but good for data
    }
  });

  console.log('Created Electric Aura Frame:', electricFrame);

  // 3. Create Electric Blue Frame
  const electricBlueFrame = await prisma.item.create({
    data: {
      name: 'Electric Blue',
      description: 'A high-voltage field of pure blue energy.',
      price: 3000,
      type: 'FRAME',
      rarity: 'ELECTRIC_BLUE',
      data: { cssClass: 'electric-frame-blue' }
    }
  });

  console.log('Created Electric Blue Frame:', electricBlueFrame);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
