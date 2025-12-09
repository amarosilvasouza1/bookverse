'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { checkAndAwardAchievements } from '@/lib/gamification';

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const content = formData.get('content') as string;
  const communityId = formData.get('communityId') as string;
  const mediaFile = formData.get('media') as File | null;

  if ((!content || content.length < 1) && !mediaFile) {
    return { error: 'Content or media is required' };
  }

  let mediaUrl: string | undefined;
  let mediaType: string | undefined;

  if (mediaFile && mediaFile.size > 0) {
    // Basic validation
    if (mediaFile.size > 5 * 1024 * 1024) { // 5MB limit
        return { error: 'File size too large (max 5MB)' };
    }
    
    const buffer = Buffer.from(await mediaFile.arrayBuffer());
    const mimeType = mediaFile.type;
    const base64 = buffer.toString('base64');
    mediaUrl = `data:${mimeType};base64,${base64}`;
    mediaType = mimeType.startsWith('image/') ? 'IMAGE' : 'VIDEO';
  }

  try {
    await prisma.post.create({
      data: {
        content: content || '',
        communityId,
        authorId: session.id as string,
        mediaUrl,
        mediaType,
      },
    });

    revalidatePath(`/dashboard/communities/${communityId}`);
    revalidatePath(`/dashboard/communities/${communityId}`);

    // Check for achievements
    try {
      await checkAndAwardAchievements(session.id as string, 'POST_COUNT');
    } catch (e) {
      console.error('Error checking achievements:', e);
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: 'Failed to create post' };
  }
}
