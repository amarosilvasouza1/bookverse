'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";

export async function createAuthorCosmetic(
  // userId: string, // Removed insecure arg
  name: string, 
  type: 'FRAME' | 'BUBBLE', 
  image: string, 
  price: number
) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { success: false, error: "Unauthorized" };
    const userId = session.id as string;

    // @ts-expect-error Prisma generation issue
    const cosmetic = await prisma.authorCosmetic.create({
      data: {
        authorId: userId,
        name,
        type,
        image,
        price,
        isPublic: true // Default to true for now
      }
    });
    
    revalidatePath('/dashboard/cosmetics');
    return { success: true, data: cosmetic };
  } catch (error) {
    console.error("Error creating cosmetic:", error);
    return { success: false, error: "Failed to create cosmetic" };
  }
}

export async function getShopCosmetics() {
  try {
    // @ts-expect-error Prisma generation issue
    const cosmetics = await prisma.authorCosmetic.findMany({
      where: { isPublic: true },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: cosmetics };
  } catch (error) {
    console.error("Error fetching cosmetics:", error);
    return { success: false, error: "Failed to fetch shop" };
  }
}

export async function buyCosmetic(userId: string, cosmeticId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // @ts-expect-error Prisma generation issue
    const cosmetic = await prisma.authorCosmetic.findUnique({ where: { id: cosmeticId } });
    
    if (!user || !cosmetic) return { success: false, error: "Not found" };
    
    // Check balance (using 'ink' if available, else fallback or fail)
    // @ts-expect-error Prisma generation issue
    const userInk = user.ink || 0;
    
    if (userInk < cosmetic.price) {
      return { success: false, error: "Insufficient Ink" };
    }

    // Deduct ink and add item
    await prisma.$transaction([
      // @ts-expect-error Prisma generation issue
      prisma.user.update({
        where: { id: userId },
        data: { ink: { decrement: cosmetic.price } }
      }),
      // @ts-expect-error Prisma generation issue
      prisma.userCosmetic.create({
        data: {
          userId,
          cosmeticId
        }
      })
    ]);

    revalidatePath('/dashboard/cosmetics');
    return { success: true };
  } catch (error) {
    console.error("Error buying cosmetic:", error);
    return { success: false, error: "Failed to purchase" };
  }
}

export async function getUserCosmetics(userId: string) {
  try {
    // @ts-expect-error Prisma generation issue
    const userCosmetics = await prisma.userCosmetic.findMany({
      where: { userId },
      include: { cosmetic: true }
    });
    return { success: true, data: userCosmetics };
  } catch (error) {
    console.error("Error fetching user cosmetics:", error);
    return { success: false, error: "Failed to fetch inventory" };
  }
}

export async function equipCosmetic(userId: string, userCosmeticId: string) {
  try {
    // First unequip all of same type? Or just toggle?
    // Let's simplified: unequip all, equip this one.
    
    // Get the cosmetic type first
    // @ts-expect-error Prisma generation issue
    const target = await prisma.userCosmetic.findUnique({
      where: { id: userCosmeticId },
      include: { cosmetic: true }
    });
    
    if (!target) return { error: "Item not found" };
    
    const type = target.cosmetic.type;

    await prisma.$transaction([
      // Unequip others of same type
      // @ts-expect-error Prisma generation issue
      prisma.userCosmetic.updateMany({
        where: { 
          userId, 
          cosmetic: { type },
          equipped: true 
        },
        data: { equipped: false }
      }),
      // Equip new one
      // @ts-expect-error Prisma generation issue
      prisma.userCosmetic.update({
        where: { id: userCosmeticId },
        data: { equipped: true }
      })
    ]);
    
    revalidatePath('/dashboard/cosmetics');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to equip" };
  }
}
