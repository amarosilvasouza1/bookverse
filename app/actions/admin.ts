'use server';

import { prisma } from '@/lib/prisma';

import { getSession } from '@/lib/auth';

export async function executeAdminCommand(command: string) {
  const session = await getSession();

  // STRICT SECURITY CHECK
  if (!session || session.username !== 'login') {
    return { success: false, error: 'Unauthorized' };
  }

  const parts = command.trim().split(' ');
  if (parts.length < 2) {
    return { success: false, error: 'Invalid command format' };
  }

  const targetUsername = parts[0].startsWith('@') ? parts[0].substring(1) : parts[0];
  const action = parts[1].toLowerCase();

  try {
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername }
    });

    if (!targetUser) {
      return { success: false, error: `User @${targetUsername} not found` };
    }

    // Command: @username add money <amount>
    if (action === 'add' && parts[2] === 'money') {
      const amountStr = parts[3];
      if (!amountStr) return { success: false, error: 'Amount required' };
      
      // Parse amount, handling comma as decimal separator if present
      const amount = parseFloat(amountStr.replace(',', '.'));
      
      if (isNaN(amount)) return { success: false, error: 'Invalid amount' };

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { balance: { increment: amount } }
      });

      return { success: true, message: `Added $${amount.toFixed(2)} to @${targetUsername}` };
    }

    // Command: @username set name <new_name>
    if (action === 'set' && parts[2] === 'name') {
      const newName = parts.slice(3).join(' ');
      if (!newName) return { success: false, error: 'Name required' };

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { name: newName }
      });

      return { success: true, message: `Set @${targetUsername}'s name to "${newName}"` };
    }

    // Command: @username follow me
    // Makes the target user follow 'login' (the current session user)
    if (action === 'follow' && parts[2] === 'me') {
      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: targetUser.id,
            followingId: session.id as string
          }
        }
      });

      if (!existingFollow) {
        await prisma.follow.create({
          data: {
            followerId: targetUser.id,
            followingId: session.id as string
          }
        });
        return { success: true, message: `@${targetUsername} is now following you` };
      } else {
        return { success: true, message: `@${targetUsername} is already following you` };
      }
    }

    // Command: @username delete
    if (action === 'delete') {
       // Prevent deleting the admin user 'login'
       if (targetUsername === 'login') {
         return { success: false, error: 'Cannot delete the admin user' };
       }

       await prisma.user.delete({
         where: { id: targetUser.id }
       });
       
       return { success: true, message: `Deleted user @${targetUsername}` };
    }

    return { success: false, error: 'Unknown command' };

  } catch (error) {
    console.error('Admin command error:', error);
    return { success: false, error: 'Command execution failed' };
  }
}
