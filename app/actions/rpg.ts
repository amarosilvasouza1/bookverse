'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function getUserSkillTree() {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: "Unauthorized" };
  const userId = session.id as string;

  try {
    let tree = await prisma.userSkillTree.findUnique({
      where: { userId }
    });

    if (!tree) {
       tree = await prisma.userSkillTree.create({
         data: {
           userId,
           points: 5,
           unlockedSkills: "[]"
         }
       });
    }

    return { success: true, data: tree };
  } catch (error) {
    console.error("Get skill tree error:", error);
    return { success: false, error: "Failed to fetch skills" };
  }
}

export async function unlockSkill(skillId: string, cost: number) {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: "Unauthorized" };
  const userId = session.id as string;

  try {
    const tree = await prisma.userSkillTree.findUnique({
      where: { userId }
    });

    if (!tree) return { success: false, error: "Tree not found" };
    if (tree.points < cost) return { success: false, error: "Not enough points" };

    const unlocked = JSON.parse(tree.unlockedSkills || "[]");
    if (unlocked.includes(skillId)) return { success: true, message: "Already unlocked" };

    unlocked.push(skillId);

    await prisma.userSkillTree.update({
      where: { userId },
      data: {
        points: { decrement: cost },
        unlockedSkills: JSON.stringify(unlocked)
      }
    });

    revalidatePath('/dashboard/skills');
    return { success: true };
  } catch (error) {
    console.error("Unlock skill error:", error);
    return { success: false, error: "Failed to unlock skill" };
  }
}
