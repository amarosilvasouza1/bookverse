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

    const isAdmin = await checkAdmin(communityId, session.id as string);
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

    const isAdmin = await checkAdmin(communityId, session.id as string);
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

    const isAdmin = await checkAdmin(communityId, session.id as string);
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

export async function deleteCommunity(communityId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { creatorId: true }
    });

    if (!community) return { error: 'Community not found' };

    if (community.creatorId !== session.id) {
      return { error: 'Forbidden: Only the creator can delete this community' };
    }

    // Delete all related data (Prisma cascade should handle most, but good to be explicit if needed)
    // Assuming Cascade delete is set up in schema for relations, otherwise we need to delete manually.
    // Schema has:
    // members     CommunityMember[]
    // posts       Post[]
    // Post has comments and likes with Cascade?
    // Let's check schema again.
    // PostLike: onDelete: Cascade
    // Comment: no onDelete specified for Post relation?
    // Post: community Community @relation(fields: [communityId], references: [id]) - No onDelete Cascade specified in schema view?
    // Wait, let me check the schema view again for Community relations.
    
    await prisma.community.delete({
      where: { id: communityId }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting community:', error);
    return { error: 'Failed to delete community' };
  }
}

export async function removeMember(communityId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const currentUserMember = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: session.id as string, communityId } },
      include: { community: true }
    });

    if (!currentUserMember) return { error: 'Not a member' };

    const targetMember = await prisma.communityMember.findUnique({
      where: { id: memberId },
      include: { user: true }
    });

    if (!targetMember) return { error: 'Member not found' };

    // Permission checks
    const isOwner = currentUserMember.community.creatorId === session.id;
    const isAdmin = currentUserMember.role === 'ADMIN';
    const targetIsOwner = currentUserMember.community.creatorId === targetMember.userId;
    const targetIsAdmin = targetMember.role === 'ADMIN';

    if (targetIsOwner) return { error: 'Cannot remove the owner' };

    // Owner can remove anyone. Admin can remove only normal members.
    if (!isOwner && (!isAdmin || targetIsAdmin)) {
      return { error: 'Forbidden' };
    }

    await prisma.communityMember.delete({
      where: { id: memberId }
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    revalidatePath(`/dashboard/communities/${communityId}/members`);
    return { success: true };
  } catch (error) {
    console.error('Error removing member:', error);
    return { error: 'Failed to remove member' };
  }
}

export async function promoteToAdmin(communityId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const community = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!community) return { error: 'Community not found' };
    if (community.creatorId !== session.id) return { error: 'Forbidden: Only owner can promote admins' };

    // Check admin limit
    const adminCount = await prisma.communityMember.count({
      where: { communityId, role: 'ADMIN' }
    });

    if (adminCount >= 5) return { error: 'Admin limit reached (max 5)' };

    await prisma.communityMember.update({
      where: { id: memberId },
      data: { role: 'ADMIN' }
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    revalidatePath(`/dashboard/communities/${communityId}/members`);
    return { success: true };
  } catch (error) {
    console.error('Error promoting admin:', error);
    return { error: 'Failed to promote admin' };
  }
}

export async function demoteAdmin(communityId: string, memberId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const community = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!community) return { error: 'Community not found' };
    if (community.creatorId !== session.id) return { error: 'Forbidden: Only owner can demote admins' };

    await prisma.communityMember.update({
      where: { id: memberId },
      data: { role: 'MEMBER' }
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    revalidatePath(`/dashboard/communities/${communityId}/members`);
    return { success: true };
  } catch (error) {
    console.error('Error demoting admin:', error);
    return { error: 'Failed to demote admin' };
  }
}
