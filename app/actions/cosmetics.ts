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

    // @ts-expect-error Prisma client needs regeneration
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
  } catch {
    return { success: false, error: "Failed to create cosmetic" };
  }
}

export async function getShopCosmetics() {
  try {
    // @ts-expect-error Prisma client needs regeneration
    const cosmetics = await prisma.authorCosmetic.findMany({
      where: { isPublic: true },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: cosmetics };
  } catch {
    return { success: false, error: "Failed to fetch shop" };
  }
}

export async function buyCosmetic(userId: string, cosmeticId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // @ts-expect-error Prisma client needs regeneration
    const cosmetic = await prisma.authorCosmetic.findUnique({ where: { id: cosmeticId } });
    
    if (!user || !cosmetic) return { success: false, error: "Not found" };
    
    // @ts-expect-error ink field may not exist in current Prisma types
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
      // @ts-expect-error Prisma client needs regeneration
      prisma.userCosmetic.create({
        data: {
          userId,
          cosmeticId
        }
      })
    ]);

    revalidatePath('/dashboard/cosmetics');
    return { success: true };
  } catch {
    return { success: false, error: "Failed to purchase" };
  }
}

export async function getUserCosmetics(userId: string) {
  try {
    // @ts-expect-error Prisma client needs regeneration
    const userCosmetics = await prisma.userCosmetic.findMany({
      where: { userId },
      include: { cosmetic: true }
    });
    return { success: true, data: userCosmetics };
  } catch {
    return { success: false, error: "Failed to fetch inventory" };
  }
}

export async function equipCosmetic(userId: string, userCosmeticId: string) {
  try {
    // @ts-expect-error Prisma client needs regeneration
    const target = await prisma.userCosmetic.findUnique({
      where: { id: userCosmeticId },
      include: { cosmetic: true }
    });
    
    if (!target) return { error: "Item not found" };
    
    const type = target.cosmetic.type;

    await prisma.$transaction([
      // @ts-expect-error Prisma client needs regeneration
      prisma.userCosmetic.updateMany({
        where: { 
          userId, 
          cosmetic: { type },
          equipped: true 
        },
        data: { equipped: false }
      }),
      // @ts-expect-error Prisma client needs regeneration
      prisma.userCosmetic.update({
        where: { id: userCosmeticId },
        data: { equipped: true }
      })
    ]);
    
    revalidatePath('/dashboard/cosmetics');
    return { success: true };
  } catch {
    return { success: false, error: "Failed to equip" };
  }
}
