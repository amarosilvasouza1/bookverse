'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCommunity(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const privacy = (formData.get('privacy') as string) || 'OPEN';

  if (!name || name.length < 3) {
    return { error: 'Name must be at least 3 characters long' };
  }

  try {
    const community = await prisma.community.create({
      data: {
        name,
        description,
        privacy,
        creatorId: session.id as string,
        members: {
          create: {
            userId: session.id as string,
            role: 'ADMIN',
            status: 'APPROVED'
          },
        },
      },
    });

    revalidatePath('/dashboard/communities');
    return { success: true, communityId: community.id };
  } catch (error) {
    console.error('Error creating community:', error);
    return { error: 'Failed to create community' };
  }
}
