import { prisma } from './lib/prisma';

async function main() {
  console.log('--- REVENUE REPORT ---');
  
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { sales: true } }
    }
  });

  for (const user of users) {
    const revenue = await prisma.purchase.aggregate({
      where: { sellerId: user.id },
      _sum: { amount: true }
    });
    
    const total = revenue._sum.amount || 0;
    
    if (total > 0 || user.username === 'fnbse') { // Show fnbse even if 0
      console.log(`User: ${user.username} (${user.id})`);
      console.log(`Sales Count: ${user._count.sales}`);
      console.log(`Total Revenue: $${total}`);
      console.log('-------------------');
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
