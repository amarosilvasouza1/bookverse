'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function deleteBook(bookId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return { error: 'Book not found' };
    }

    if (book.authorId !== session.id) {
      return { error: 'Unauthorized' };
    }

    await prisma.book.delete({
      where: { id: bookId },
    });

    revalidatePath('/dashboard/books');
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    return { error: 'Failed to delete book' };
  }
}
