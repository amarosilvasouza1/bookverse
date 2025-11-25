'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin(communityId: string, userId: string) {
  const member = await prisma.communityMember.findUnique({
    where: {
      userId_communityId: {
        userId,
        communityId
      }
    }
  });
  return member?.role === 'ADMIN';
}

export async function approveMember(communityId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const isAdmin = await checkAdmin(communityId, session.id);
    if (!isAdmin) return { error: 'Forbidden' };

    await prisma.communityMember.update({
      where: { id: memberId },
      data: { status: 'APPROVED' }
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    return { success: true };
  } catch (error) {
    console.error('Error approving member:', error);
    return { error: 'Failed to approve member' };
  }
}

export async function rejectMember(communityId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const isAdmin = await checkAdmin(communityId, session.id);
    if (!isAdmin) return { error: 'Forbidden' };

    await prisma.communityMember.delete({
      where: { id: memberId }
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    return { success: true };
  } catch (error) {
    console.error('Error rejecting member:', error);
    return { error: 'Failed to reject member' };
  }
}

export async function updateCommunity(communityId: string, data: { name: string, description: string, privacy: string }) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const isAdmin = await checkAdmin(communityId, session.id);
    if (!isAdmin) return { error: 'Forbidden' };

    await prisma.community.update({
      where: { id: communityId },
      data: {
        name: data.name,
        description: data.description,
        privacy: data.privacy
      }
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating community:', error);
    return { error: 'Failed to update community' };
  }
}
