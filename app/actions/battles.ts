'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createBattle(theme: string) {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: "Unauthorized" };

  try {
    // @ts-expect-error Prisma generation issue
    const battle = await prisma.writingBattle.create({
      data: {
        theme,
        status: "WAITING",
        startTime: new Date(Date.now() + 5 * 60 * 1000), // Default start in 5 mins if auto-start? Or just placeholder
        participants: {
             create: { userId: session.id as string }
        }
      }
    });

    revalidatePath('/dashboard/battles');
    return { success: true, battleId: battle.id };
  } catch (error) {
    console.error("Create battle error:", error);
    return { success: false, error: "Failed to create battle" };
  }
}

export async function joinBattle(battleId: string) {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: "Unauthorized" };
  const userId = session.id as string;

  try {
    // Check if already joined
    // @ts-expect-error Prisma generation issue
    const existing = await prisma.battleParticipant.findFirst({
      where: { battleId, userId }
    });
    
    if (existing) return { success: true, message: "Already joined" };

    // @ts-expect-error Prisma generation issue
    await prisma.battleParticipant.create({
      data: {
        battleId,
        userId
      }
    });

    revalidatePath(`/dashboard/battles/${battleId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to join" };
  }
}

export async function getActiveBattles() {
  try {
    // @ts-expect-error Prisma generation issue
    const battles = await prisma.writingBattle.findMany({
      where: {
        status: { in: ["WAITING", "IN_PROGRESS", "VOTING"] }
      },
      include: {
        participants: {
            include: { user: { select: { username: true, image: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: battles };
  } catch (error) {
    console.error("Get battles error:", error);
    return { success: false, error: "Failed to list battles" };
  }
}

export async function getBattleState(battleId: string) {
    try {
        // @ts-expect-error Prisma generation issue
        const battle = await prisma.writingBattle.findUnique({
            where: { id: battleId },
            include: {
                participants: {
                    include: { user: { select: { id: true, username: true, image: true } } }
                },
                votes: true
            }
        });
        return { success: true, data: battle };
    } catch (error) {
        return { success: false, error: "Failed to fetch battle" };
    }
}

export async function startBattle(battleId: string) {
    // In real app, verify host. For now, any participant can start? Or just check session.
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        // @ts-expect-error Prisma generation issue
        await prisma.writingBattle.update({
            where: { id: battleId },
            data: { 
                status: "IN_PROGRESS",
                startTime: new Date(),
                endTime: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes duration
            }
        });
        revalidatePath(`/dashboard/battles/${battleId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to start" };
    }
}

export async function submitBattleContent(battleId: string, content: string) {
    const session = await getSession();
    if (!session || !session.id) return { success: false, error: "Unauthorized" };
    const userId = session.id as string;

    try {
        // Find participant ID first? Or use updateMany
        // @ts-expect-error Prisma generation issue
        await prisma.battleParticipant.updateMany({
            where: { battleId, userId },
            data: { content }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to save" };
    }
}

export async function voteForParticipant(battleId: string, participantId: string) {
     const session = await getSession();
     if (!session || !session.id) return { success: false, error: "Unauthorized" };
     
     try {
         // Prevent double voting?
         // @ts-expect-error Prisma generation issue
         const existing = await prisma.battleVote.findFirst({
             where: { battleId, voterId: session.id as string }
         });
         
         if (existing) return { success: false, error: "Already voted" };

         // @ts-expect-error Prisma generation issue
         await prisma.battleVote.create({
             data: {
                 battleId,
                 participantId,
                 voterId: session.id as string
             }
         });
         revalidatePath(`/dashboard/battles/${battleId}`);
         return { success: true };
     } catch(e) {
         return { success: false, error: "Vote failed" };
     }
}
