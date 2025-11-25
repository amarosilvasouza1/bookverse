'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const content = formData.get('content') as string;
  const communityId = formData.get('communityId') as string;

  if (!content || content.length < 1) {
    return { error: 'Content cannot be empty' };
  }

  try {
    await prisma.post.create({
      data: {
        content,
        communityId,
        authorId: session.id as string,
      },
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: 'Failed to create post' };
  }
}
