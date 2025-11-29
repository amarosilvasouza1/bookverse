
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldUsername = '$kyland';
  const newUsername = 'Skyland';

  console.log(`Fixing user: ${oldUsername} -> ${newUsername}`);

  try {
    const user = await prisma.user.findUnique({
      where: { username: oldUsername },
    });

    if (!user) {
      console.log(`User '${oldUsername}' not found.`);
      return;
    }

    // Check if new username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existingUser) {
      console.log(`User '${newUsername}' already exists. Cannot rename.`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        username: newUsername,
      },
    });

    console.log('User updated successfully:', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
