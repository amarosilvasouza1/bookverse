'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: {
  name: string;
  bio: string;
  image: string;
  banner: string;
  socialLinks: Record<string, string> | string;
  geminiApiKey: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const { name, bio, image, banner, socialLinks, geminiApiKey } = data;

    await prisma.user.update({
      where: { id: session.id as string },
      data: {
        name,
        bio,
        image,
        banner,
        socialLinks: typeof socialLinks === 'object' ? JSON.stringify(socialLinks) : socialLinks,
        geminiApiKey,
      },
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile' };
  }
}
