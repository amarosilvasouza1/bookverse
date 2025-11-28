'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  console.log('updateProfile action called');
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (formData.has('name')) dataToUpdate.name = formData.get('name') as string;
    if (formData.has('bio')) dataToUpdate.bio = formData.get('bio') as string;
    if (formData.has('socialLinks')) dataToUpdate.socialLinks = formData.get('socialLinks') as string;
    if (formData.has('geminiApiKey')) dataToUpdate.geminiApiKey = formData.get('geminiApiKey') as string;

    const imageEntry = formData.get('image');
    if (imageEntry && imageEntry instanceof File) {
      const buffer = await imageEntry.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      dataToUpdate.image = `data:${imageEntry.type};base64,${base64}`;
    } else if (typeof imageEntry === 'string' && imageEntry.length > 0) {
      // Validate that it's a valid URL or data URI
      if (imageEntry.startsWith('http') || imageEntry.startsWith('/') || imageEntry.startsWith('data:')) {
        dataToUpdate.image = imageEntry;
      }
    }

    const bannerEntry = formData.get('banner');
    if (bannerEntry && bannerEntry instanceof File) {
      const buffer = await bannerEntry.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      dataToUpdate.banner = `data:${bannerEntry.type};base64,${base64}`;
    } else if (typeof bannerEntry === 'string' && bannerEntry.length > 0) {
      dataToUpdate.banner = bannerEntry;
    }

    await prisma.user.update({
      where: { id: session.id as string },
      data: dataToUpdate,
    });

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile' };
  }
}
