'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getStoreItems() {
  try {
    const session = await getSession();
    let userBalance = 0;

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.id as string },
        select: { balance: true }
      });
      userBalance = user?.balance || 0;
    }

    const items = await prisma.item.findMany({
      orderBy: { price: 'asc' }
    });
    return { success: true, items, userBalance };
  } catch (error) {
    console.error('Error fetching store items:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}

export async function getUserInventory() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const userItems = await prisma.userItem.findMany({
      where: { userId: session.id as string },
      include: { item: true },
      orderBy: { acquiredAt: 'desc' }
    });
    return { success: true, items: userItems };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

export async function buyItem(itemId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    // 1. Get item and user balance
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return { success: false, error: 'Item not found' };

    const user = await prisma.user.findUnique({ 
      where: { id: session.id as string },
      select: { balance: true }
    });
    if (!user) return { success: false, error: 'User not found' };

    // 2. Check if already owned
    const existing = await prisma.userItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.id as string,
          itemId: itemId
        }
      }
    });
    if (existing) return { success: false, error: 'You already own this item' };

    // 3. Check balance
    console.log(`[BuyItem] User Balance: ${user.balance}, Item Price: ${item.price}`);
    if (user.balance < item.price) {
      return { success: false, error: `Insufficient balance (Has: ${user.balance}, Needs: ${item.price})` };
    }

    // 4. Transaction: Deduct balance, add item
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.id as string },
        data: { balance: { decrement: item.price } }
      }),
      prisma.userItem.create({
        data: {
          userId: session.id as string,
          itemId: itemId
        }
      })
    ]);

    revalidatePath('/dashboard');
    return { success: true, message: `Purchased ${item.name}!` };

  } catch (error) {
    console.error('Buy item error:', error);
    return { success: false, error: 'Purchase failed' };
  }
}

export async function equipItem(itemId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    // 1. Verify ownership
    const userItem = await prisma.userItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.id as string,
          itemId: itemId
        }
      },
      include: { item: true }
    });

    if (!userItem) return { success: false, error: 'Item not owned' };

    // 2. Unequip all other items of same type (e.g. FRAME)
    // First, find all equipped items of this type for this user
    const type = userItem.item.type;
    
    // We need to unequip all items of this type.
    // Since we can't easily filter UserItem by Item.type in updateMany,
    // we might need to fetch them first or just unequip everything if we only have frames for now.
    // For robustness, let's fetch equipped items of this type.
    
    const equippedItems = await prisma.userItem.findMany({
      where: {
        userId: session.id as string,
        equipped: true,
        item: { type: type }
      }
    });

    const unequipIds = equippedItems.map(i => i.id);

    await prisma.$transaction([
      // Unequip others
      prisma.userItem.updateMany({
        where: { id: { in: unequipIds } },
        data: { equipped: false }
      }),
      // Equip new one
      prisma.userItem.update({
        where: { id: userItem.id },
        data: { equipped: true }
      })
    ]);

    revalidatePath('/dashboard');
    return { success: true, message: `Equipped ${userItem.item.name}` };

  } catch (error) {
    console.error('Equip item error:', error);
    return { success: false, error: 'Failed to equip item' };
  }
}

export async function unequipItem(itemId: string) {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
  
    try {
      await prisma.userItem.update({
        where: {
            userId_itemId: {
                userId: session.id as string,
                itemId: itemId
            }
        },
        data: { equipped: false }
      });
  
      revalidatePath('/dashboard');
      return { success: true, message: 'Unequipped item' };
    } catch (error) {
      console.error('Unequip error:', error);
      return { success: false, error: 'Failed to unequip' };
    }
}
