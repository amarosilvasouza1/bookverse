'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function buyBook(bookId: string) {
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

    if (!book.isPremium) {
      return { error: 'This book is free' };
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        bookId,
        buyerId: session.id,
      },
    });

    if (existingPurchase) {
      return { error: 'You already own this book' };
    }

    // Create purchase record
    await prisma.purchase.create({
      data: {
        bookId,
        buyerId: session.id as string,
        sellerId: book.authorId,
        amount: book.price,
      },
    });

    revalidatePath(`/dashboard/books/${bookId}`);
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error buying book:', error);
    return { error: 'Failed to purchase book' };
  }
}
