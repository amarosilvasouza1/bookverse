'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createAuthorCosmetic(
  name: string, 
  type: 'FRAME' | 'BUBBLE', 
  image: string, 
  price: number
) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { success: false, error: "Unauthorized" };
    const userId = session.id as string;

    const cosmetic = await prisma.authorCosmetic.create({
      data: {
        authorId: userId,
        name,
        type,
        image,
        price,
        isPublic: true
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
    const cosmetic = await prisma.authorCosmetic.findUnique({ where: { id: cosmeticId } });
    
    if (!user || !cosmetic) return { success: false, error: "Not found" };
    
    const userInk = user.ink || 0;
    
    if (userInk < cosmetic.price) {
      return { success: false, error: "Insufficient Ink" };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        // @ts-expect-error ink field needs Prisma regeneration
        data: { ink: { decrement: cosmetic.price } }
      }),
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
    const target = await prisma.userCosmetic.findUnique({
      where: { id: userCosmeticId },
      include: { cosmetic: true }
    });
    
    if (!target) return { error: "Item not found" };
    
    const type = target.cosmetic.type;

    await prisma.$transaction([
      prisma.userCosmetic.updateMany({
        where: { 
          userId, 
          cosmetic: { type },
          equipped: true 
        },
        data: { equipped: false }
      }),
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
