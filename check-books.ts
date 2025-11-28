import { prisma } from './lib/prisma';

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'login' },
    include: { books: true }
  });

  if (!user) {
    console.log('User login not found');
    return;
  }

  console.log(`User: ${user.username}`);
  console.log(`Books: ${user.books.length}`);
  user.books.forEach(b => {
    console.log(`- ${b.title} (Price: ${b.price}, Premium: ${b.isPremium})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
