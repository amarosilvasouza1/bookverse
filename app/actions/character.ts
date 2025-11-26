'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createCharacter(bookId: string, data: { name: string; description: string; personality: string; avatar?: string }) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { authorId: true },
    });

    if (!book || book.authorId !== session.id) {
      return { error: 'Unauthorized' };
    }

    const character = await prisma.character.create({
      data: {
        ...data,
        bookId,
      },
    });

    revalidatePath(`/dashboard/create-book`);
    return { success: true, data: character };
  } catch (error) {
    return { error: 'Failed to create character' };
  }
}

export async function updateCharacter(characterId: string, data: { name: string; description: string; personality: string; avatar?: string }) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { book: true },
    });

    if (!character || character.book.authorId !== session.id) {
      return { error: 'Unauthorized' };
    }

    const updated = await prisma.character.update({
      where: { id: characterId },
      data,
    });

    revalidatePath(`/dashboard/create-book`);
    return { success: true, data: updated };
  } catch (error) {
    return { error: 'Failed to update character' };
  }
}

export async function deleteCharacter(characterId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: { book: true },
    });

    if (!character || character.book.authorId !== session.id) {
      return { error: 'Unauthorized' };
    }

    await prisma.character.delete({
      where: { id: characterId },
    });

    revalidatePath(`/dashboard/create-book`);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete character' };
  }
}

export async function getCharacters(bookId: string) {
  try {
    const characters = await prisma.character.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: characters };
  } catch (error) {
    return { error: 'Failed to fetch characters' };
  }
}
