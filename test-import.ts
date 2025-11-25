import { prisma } from './lib/prisma';

console.log('Prisma client loaded');
async function main() {
  try {
    await prisma.$connect();
    console.log('Connected');
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
  }
}
main();
