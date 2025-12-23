'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SKILL_TREE_CONFIG } from '@/lib/skills-config';
import { revalidatePath } from 'next/cache';

export async function getUserSkillTree() {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    let skillTree = await prisma.userSkillTree.findUnique({
      where: { userId: session.id as string },
    });

    // Create if doesn't exist
    if (!skillTree) {
      skillTree = await prisma.userSkillTree.create({
        data: {
          userId: session.id as string,
          points: 3, // Initial points for testing/starting
          unlockedSkills: JSON.stringify(['novice_writer']), // Start with root unlocked
        },
      });
    }

    // Parse unlockedSkills safely
    const unlockedSkills = JSON.parse(skillTree.unlockedSkills || '[]') as string[];

    return { 
      success: true, 
      data: {
        points: skillTree.points,
        unlockedSkills,
      } 
    };
  } catch (error) {
    console.error('Error fetching skill tree:', error);
    return { error: 'Failed to fetch skill tree' };
  }
}

export async function unlockSkill(skillId: string) {
  const session = await getSession();
  if (!session?.id) return { error: 'Unauthorized' };

  try {
    const skillTree = await prisma.userSkillTree.findUnique({
      where: { userId: session.id as string },
    });

    if (!skillTree) return { error: 'Skill tree not found' };

    const unlockedSkills = JSON.parse(skillTree.unlockedSkills || '[]') as string[];
    
    // 1. Check if already unlocked
    if (unlockedSkills.includes(skillId)) {
      return { error: 'Skill already unlocked' };
    }

    // 2. Find skill config
    const skillConfig = SKILL_TREE_CONFIG.find(s => s.id === skillId);
    if (!skillConfig) return { error: 'Invalid skill' };

    // 3. Check dependencies
    const hasRequirements = skillConfig.requiredSkills.every(reqId => unlockedSkills.includes(reqId));
    if (!hasRequirements) {
      return { error: 'Prerequisites not met' };
    }

    // 4. Check points
    if (skillTree.points < skillConfig.cost) {
      return { error: 'Not enough skill points' };
    }

    // 5. Unlock
    const newUnlocked = [...unlockedSkills, skillId];
    await prisma.userSkillTree.update({
      where: { userId: session.id as string },
      data: {
        points: skillTree.points - skillConfig.cost,
        unlockedSkills: JSON.stringify(newUnlocked),
      },
    });

    revalidatePath('/dashboard/skills');
    return { success: true, message: `Unlocked ${skillConfig.label}!` };

  } catch (error) {
    console.error('Error unlocking skill:', error);
    return { error: 'Failed to unlock skill' };
  }
}
