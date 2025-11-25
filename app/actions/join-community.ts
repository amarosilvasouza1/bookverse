'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function joinCommunity(communityId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.id as string,
          communityId,
        },
      },
    });

    if (existingMember) {
      return { error: 'Already a member' };
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return { error: 'Community not found' };
    }

    const status = community.privacy === 'CLOSED' ? 'PENDING' : 'APPROVED';

    await prisma.communityMember.create({
      data: {
        userId: session.id as string,
        communityId,
        status,
        role: 'MEMBER'
      },
    });

    revalidatePath('/dashboard/communities');
    return { success: true };
  } catch (error) {
    console.error('Error joining community:', error);
    return { error: 'Failed to join community' };
  }
}
