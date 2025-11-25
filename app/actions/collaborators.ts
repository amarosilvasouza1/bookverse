'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addCollaborator(bookId: string, username: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // Verify ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { collaborators: true }
    });

    if (!book) {
      return { error: 'Book not found' };
    }

    if (book.authorId !== session.id) {
      return { error: 'Only the author can add collaborators' };
    }

    // Check limit (max 4 collaborators)
    if (book.collaborators.length >= 4) {
      return { error: 'Maximum 4 collaborators allowed' };
    }

    // Find user to add
    const userToAdd = await prisma.user.findUnique({
      where: { username }
    });

    if (!userToAdd) {
      return { error: 'User not found' };
    }

    if (userToAdd.id === session.id) {
      return { error: 'You are already the author' };
    }

    // Check if already a collaborator
    const existing = await prisma.bookCollaborator.findUnique({
      where: {
        bookId_userId: {
          bookId,
          userId: userToAdd.id
        }
      }
    });

    if (existing) {
      return { error: 'User is already a collaborator' };
    }

    await prisma.bookCollaborator.create({
      data: {
        bookId,
        userId: userToAdd.id,
        role: 'EDITOR'
      }
    });

    revalidatePath(`/dashboard/create-book`);
    return { success: true };
  } catch (error) {
    console.error('Error adding collaborator:', error);
    return { error: 'Failed to add collaborator' };
  }
}

export async function removeCollaborator(bookId: string, userId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return { error: 'Book not found' };
    }

    // Only author can remove collaborators
    if (book.authorId !== session.id) {
      return { error: 'Only the author can remove collaborators' };
    }

    await prisma.bookCollaborator.delete({
      where: {
        bookId_userId: {
          bookId,
          userId
        }
      }
    });

    revalidatePath(`/dashboard/create-book`);
    return { success: true };
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return { error: 'Failed to remove collaborator' };
  }
}
