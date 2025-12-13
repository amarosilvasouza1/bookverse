'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Get all reading lists for the current user
export async function getMyReadingLists() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const lists = await prisma.readingList.findMany({
      where: { userId: session.id as string },
      include: {
        books: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                author: { select: { username: true, name: true } }
              }
            }
          },
          orderBy: { addedAt: 'desc' }
        },
        _count: { select: { books: true } }
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
    });

    return { success: true, lists };
  } catch (error) {
    console.error('Error fetching reading lists:', error);
    return { error: 'Failed to fetch reading lists' };
  }
}

// Create default lists for new users
export async function createDefaultLists(userId: string) {
  try {
    const existingLists = await prisma.readingList.findMany({
      where: { userId, isDefault: true }
    });

    if (existingLists.length === 0) {
      await prisma.readingList.createMany({
        data: [
          { name: 'Ler Depois', icon: '📚', color: '#3b82f6', isDefault: true, userId },
          { name: 'Favoritos', icon: '❤️', color: '#ef4444', isDefault: true, userId },
          { name: 'Lendo Agora', icon: '📖', color: '#22c55e', isDefault: true, userId }
        ]
      });
    }
  } catch (error) {
    console.error('Error creating default lists:', error);
  }
}

// Create a new reading list
export async function createReadingList(data: { name: string; icon?: string; color?: string }) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const list = await prisma.readingList.create({
      data: {
        name: data.name,
        icon: data.icon || '📋',
        color: data.color || '#8b5cf6',
        userId: session.id as string
      }
    });

    revalidatePath('/dashboard/reading-lists');
    return { success: true, list };
  } catch (error) {
    console.error('Error creating reading list:', error);
    return { error: 'Failed to create reading list' };
  }
}

// Update a reading list
export async function updateReadingList(listId: string, data: { name?: string; icon?: string; color?: string }) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const list = await prisma.readingList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== session.id) return { error: 'Not found or unauthorized' };

    await prisma.readingList.update({
      where: { id: listId },
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color
      }
    });

    revalidatePath('/dashboard/reading-lists');
    return { success: true };
  } catch (error) {
    console.error('Error updating reading list:', error);
    return { error: 'Failed to update reading list' };
  }
}

// Delete a reading list
export async function deleteReadingList(listId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const list = await prisma.readingList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== session.id) return { error: 'Not found or unauthorized' };
    if (list.isDefault) return { error: 'Cannot delete default lists' };

    await prisma.readingList.delete({ where: { id: listId } });

    revalidatePath('/dashboard/reading-lists');
    return { success: true };
  } catch (error) {
    console.error('Error deleting reading list:', error);
    return { error: 'Failed to delete reading list' };
  }
}

// Add book to a reading list
export async function addBookToList(listId: string, bookId: string, note?: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const list = await prisma.readingList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== session.id) return { error: 'List not found' };

    await prisma.readingListBook.create({
      data: { listId, bookId, note }
    });

    revalidatePath('/dashboard/reading-lists');
    revalidatePath(`/dashboard/books/${bookId}`);
    return { success: true };
  } catch (error) {
    // Check if already exists
    if ((error as { code?: string }).code === 'P2002') {
      return { error: 'Book already in this list' };
    }
    console.error('Error adding book to list:', error);
    return { error: 'Failed to add book to list' };
  }
}

// Remove book from a reading list
export async function removeBookFromList(listId: string, bookId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const list = await prisma.readingList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== session.id) return { error: 'Unauthorized' };

    await prisma.readingListBook.deleteMany({
      where: { listId, bookId }
    });

    revalidatePath('/dashboard/reading-lists');
    return { success: true };
  } catch (error) {
    console.error('Error removing book from list:', error);
    return { error: 'Failed to remove book from list' };
  }
}

// Get lists containing a specific book (for showing in book page)
export async function getListsForBook(bookId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const lists = await prisma.readingList.findMany({
      where: { userId: session.id as string },
      include: {
        books: {
          where: { bookId },
          select: { id: true }
        }
      }
    });

    return {
      success: true,
      lists: lists.map(list => ({
        ...list,
        hasBook: list.books.length > 0
      }))
    };
  } catch (error) {
    console.error('Error fetching lists for book:', error);
    return { error: 'Failed to fetch lists' };
  }
}

// Quick add to "Read Later" list
export async function addToReadLater(bookId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    // Find or create "Ler Depois" list
    let list = await prisma.readingList.findFirst({
      where: { userId: session.id as string, name: 'Ler Depois', isDefault: true }
    });

    if (!list) {
      await createDefaultLists(session.id as string);
      list = await prisma.readingList.findFirst({
        where: { userId: session.id as string, name: 'Ler Depois', isDefault: true }
      });
    }

    if (!list) return { error: 'Could not find read later list' };

    return addBookToList(list.id, bookId);
  } catch (error) {
    console.error('Error adding to read later:', error);
    return { error: 'Failed to add to read later' };
  }
}

// Quick add to "Favorites" list
export async function addToFavorites(bookId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    let list = await prisma.readingList.findFirst({
      where: { userId: session.id as string, name: 'Favoritos', isDefault: true }
    });

    if (!list) {
      await createDefaultLists(session.id as string);
      list = await prisma.readingList.findFirst({
        where: { userId: session.id as string, name: 'Favoritos', isDefault: true }
      });
    }

    if (!list) return { error: 'Could not find favorites list' };

    return addBookToList(list.id, bookId);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { error: 'Failed to add to favorites' };
  }
}
