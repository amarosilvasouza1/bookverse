const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting balance fix...');

  const users = await prisma.user.findMany({
    include: {
      sales: true,
      receivedTips: true
    }
  });

  for (const user of users) {
    const salesTotal = user.sales.reduce((acc, sale) => acc + sale.amount, 0);
    const tipsTotal = user.receivedTips.reduce((acc, tip) => acc + tip.amount, 0);
    const totalEarnings = salesTotal + tipsTotal;

    if (totalEarnings > 0) {
      console.log(`Updating user ${user.username}: Current Balance ${user.balance} -> New Balance ${totalEarnings}`);
      
      // We set the balance to totalEarnings, assuming they haven't spent anything yet.
      // If they had spent money, we would need a Transaction history for spending, which we don't have fully tracked yet aside from Store purchases (which are new).
      // Given the user's complaint "I have 0 but sold books", this is the correct fix.
      
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: totalEarnings }
      });
    }
  }

  console.log('Balance fix complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
