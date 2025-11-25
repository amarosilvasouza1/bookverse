import { prisma } from './lib/prisma';

async function test() {
  try {
    console.log('Testing connection...');
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
