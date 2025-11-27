'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  console.log('updateProfile action called');
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const imageEntry = formData.get('image');
    const bannerEntry = formData.get('banner');

    let image = '';
    if (imageEntry instanceof File) {
      const buffer = await imageEntry.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      image = `data:${imageEntry.type};base64,${base64}`;
    } else if (typeof imageEntry === 'string') {
      image = imageEntry;
    }

    let banner = '';
    if (bannerEntry instanceof File) {
      const buffer = await bannerEntry.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      banner = `data:${bannerEntry.type};base64,${base64}`;
    } else if (typeof bannerEntry === 'string') {
      banner = bannerEntry;
    }
    
    console.log('Received profile update request');
    console.log('Image size:', image?.length || 0);
    console.log('Banner size:', banner?.length || 0);

    const socialLinks = formData.get('socialLinks') as string;
    const geminiApiKey = formData.get('geminiApiKey') as string;

    await prisma.user.update({
      where: { id: session.id as string },
      data: {
        name,
        bio,
        image,
        banner,
        socialLinks,
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
