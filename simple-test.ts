import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting...');
  try {
    await prisma.$connect();
    console.log('Connected!');
    const users = await prisma.user.count();
    console.log('Users:', users);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
