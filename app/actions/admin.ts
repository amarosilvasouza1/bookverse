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

  // --- SPECIAL COMMANDS (Single Word) ---

  // Command: -award-frames-24h
  if (parts[0] === '-award-frames-24h') {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find users who created a book in the last 24h
    const recentAuthors = await prisma.user.findMany({
      where: {
        books: {
          some: {
            createdAt: {
              gte: cutoffDate
            }
          }
        }
      },
      select: { id: true, username: true }
    });

    if (recentAuthors.length === 0) {
      return { success: true, message: 'No authors found in the last 24h.' };
    }

    // Get all frames
    const allFrames = await prisma.item.findMany({
      where: { type: 'FRAME' }
    });

    if (allFrames.length === 0) {
      return { success: false, error: 'No frames found in database.' };
    }

    let awardedCount = 0;

    // Award frames to each author
    for (const author of recentAuthors) {
      const result = await prisma.userItem.createMany({
        data: allFrames.map(frame => ({
          userId: author.id,
          itemId: frame.id
        })),
        skipDuplicates: true
      });
      if (result.count > 0) awardedCount++;
    }

    return { 
      success: true, 
      message: `Processed ${recentAuthors.length} authors. Awarded frames to ${awardedCount} users (others might already have them).` 
    };
  }

  // Command: -award-frames-all
  if (parts[0] === '-award-frames-all') {
    // Find ALL users who created a book
    const allAuthors = await prisma.user.findMany({
      where: {
        books: {
          some: {} // At least one book
        }
      },
      select: { id: true, username: true }
    });

    if (allAuthors.length === 0) {
      return { success: true, message: 'No authors found.' };
    }

    // Get all frames
    const allFrames = await prisma.item.findMany({
      where: { type: 'FRAME' }
    });

    if (allFrames.length === 0) {
      return { success: false, error: 'No frames found in database.' };
    }

    let awardedCount = 0;

    // Award frames to each author
    for (const author of allAuthors) {
      const result = await prisma.userItem.createMany({
        data: allFrames.map(frame => ({
          userId: author.id,
          itemId: frame.id
        })),
        skipDuplicates: true
      });
      if (result.count > 0) awardedCount++;
    }

    return { 
      success: true, 
      message: `Processed ${allAuthors.length} authors. Awarded frames to ${awardedCount} users.` 
    };
  }

  // --- STANDARD COMMANDS (Multi Word) ---

  if (parts.length < 2) {
    return { success: false, error: 'Invalid command format' };
  }

  if (parts[0] === '-user' && parts[1] === 'all') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          balance: true,
          items: {
            where: { equipped: true, item: { type: 'FRAME' } },
            include: { item: true }
          },
          _count: {
            select: {
              followers: true,
              following: true,
              books: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, type: 'USER_LIST', users };
    }

    const targetUsername = parts[0].startsWith('@') ? parts[0].substring(1) : parts[0];
    const action = parts[1]?.toLowerCase();

    if (!action) {
       return { success: false, error: 'Invalid command format' };
    }

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
      // Makes the target user follow 'login' AND 'login' follow the target user (Mutual)
      if (action === 'follow' && parts[2] === 'me') {
        // 1. Target follows Admin
        const targetFollowsAdmin = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: targetUser.id,
              followingId: session.id as string
            }
          }
        });

        if (!targetFollowsAdmin) {
          await prisma.follow.create({
            data: {
              followerId: targetUser.id,
              followingId: session.id as string
            }
          });
        }

        // 2. Admin follows Target
        const adminFollowsTarget = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: session.id as string,
                followingId: targetUser.id
              }
            }
        });

        if (!adminFollowsTarget) {
            await prisma.follow.create({
                data: {
                    followerId: session.id as string,
                    followingId: targetUser.id
                }
            });
        }

        return { success: true, message: `Mutual following established with @${targetUsername}` };
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

      // Command: @username add beta
      if (action === 'add' && parts[2] === 'beta') {
        // 1. Grant Achievement
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: targetUser.id,
              achievementId: 'achievement-beta-tester'
            }
          },
          update: {},
          create: {
            userId: targetUser.id,
            achievementId: 'achievement-beta-tester'
          }
        });

        // 2. Add Tag
        const currentTags = targetUser.tags ? targetUser.tags.split(',') : [];
        if (!currentTags.includes('BETA')) {
          currentTags.push('BETA');
          const newTags = currentTags.join(',');
          
          await prisma.user.update({
            where: { id: targetUser.id },
            data: { tags: newTags }
          });
        }

        return { success: true, message: `Granted Beta Tester status to @${targetUsername}` };
      }

      // Command: @username add dev
      if (action === 'add' && parts[2] === 'dev') {
        // 1. Grant Achievement
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: targetUser.id,
              achievementId: 'achievement-dev'
            }
          },
          update: {},
          create: {
            userId: targetUser.id,
            achievementId: 'achievement-dev'
          }
        });

        // 2. Add Tag
        const currentTags = targetUser.tags ? targetUser.tags.split(',') : [];
        if (!currentTags.includes('DEV')) {
          currentTags.push('DEV');
          const newTags = currentTags.join(',');
          
          await prisma.user.update({
            where: { id: targetUser.id },
            data: { tags: newTags }
          });
        }

        return { success: true, message: `Granted Developer status to @${targetUsername}` };
      }

      // Command: @username add admin
      if (action === 'add' && parts[2] === 'admin') {
        // 1. Update role to ADMIN
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { role: 'ADMIN' }
        });

        // 2. Add ADMIN tag
        const currentTags = targetUser.tags ? targetUser.tags.split(',') : [];
        if (!currentTags.includes('ADMIN')) {
          currentTags.push('ADMIN');
          const newTags = currentTags.join(',');
          
          await prisma.user.update({
            where: { id: targetUser.id },
            data: { tags: newTags }
          });
        }

        return { success: true, message: `Granted Admin privileges to @${targetUsername}` };
      }

      // Command: @username remove admin
      if (action === 'remove' && parts[2] === 'admin') {
        // Prevent removing admin from main admin
        if (targetUsername === 'login') {
          return { success: false, error: 'Cannot remove admin from the main admin account' };
        }

        // 1. Update role to USER
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { role: 'USER' }
        });

        // 2. Remove ADMIN tag
        const currentTags = targetUser.tags ? targetUser.tags.split(',').filter(t => t !== 'ADMIN') : [];
        const newTags = currentTags.join(',');
        
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { tags: newTags || null }
        });

        return { success: true, message: `Removed Admin privileges from @${targetUsername}` };
      }

      // Command: @username md <code>
      if (action === 'md' && parts[2]) {
        const code = parts[2].toUpperCase();
        
        // 1. Find Code
        const redemptionCode = await prisma.redemptionCode.findUnique({
          where: { code },
          include: { item: true }
        });

        if (!redemptionCode) {
          return { success: false, error: 'Invalid code' };
        }

        if (redemptionCode.isUsed) {
          return { success: false, error: 'Code already redeemed' };
        }

        // 2. Grant Item to User
        // Check if user already has this item
        const existingItem = await prisma.userItem.findUnique({
          where: {
            userId_itemId: {
              userId: targetUser.id,
              itemId: redemptionCode.itemId
            }
          }
        });

        if (!existingItem) {
          await prisma.userItem.create({
            data: {
              userId: targetUser.id,
              itemId: redemptionCode.itemId
            }
          });
        }

        // 3. Mark Code as Used
        await prisma.redemptionCode.update({
          where: { id: redemptionCode.id },
          data: {
            isUsed: true,
            usedBy: targetUser.id,
            usedAt: new Date()
          }
        });

        return { success: true, message: `Redeemed ${redemptionCode.item.name} for @${targetUsername}` };
      }

      return { success: false, error: 'Unknown command' };

    } catch (error: unknown) {
      console.error('Admin command error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Command execution failed';
      return { success: false, error: errorMessage };
    }

}
