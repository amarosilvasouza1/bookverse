'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { checkAndAwardAchievements } from '@/lib/gamification';
import { logActivity } from '@/app/actions/activity';

export async function createBook(data: {
  id?: string;
  title: string;
  pages: { title: string; content: string; pageNumber: number; scheduledAt?: string }[];
  description?: string;
  coverImage?: string;
  genre?: string;
  isPremium?: boolean;
  allowDownload?: boolean;
  ambience?: string;
  price?: number;
  published?: boolean;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const { id, title, pages, description, coverImage, genre, isPremium, allowDownload, ambience, price, published } = data;

    if (!title || pages.length === 0) {
      return { error: 'Title and at least one page are required' };
    }

    let book;

    if (id) {
      // Update existing book
      // First verify ownership
      const existingBook = await prisma.book.findUnique({
        where: { id },
        include: { collaborators: true }
      });

      if (!existingBook) {
        return { error: 'Book not found' };
      }

      const isCollaborator = existingBook.collaborators.some(c => c.userId === session.id);

      if (existingBook.authorId !== session.id && !isCollaborator) {
        return { error: 'Unauthorized' };
      }

      // Transaction to update book and pages
      book = await prisma.$transaction(async (tx) => {
        const updatedBook = await tx.book.update({
          where: { id },
          data: {
            title,
            description: description || '',
            coverImage,
            genre,
            isPremium: isPremium || false,
            allowDownload: allowDownload || false,
            ambience: ambience || null,
            price: price || 0,
            published: published !== undefined ? published : existingBook.published,
            // Update main content with first page content for backward compatibility/preview
            content: pages[0].content, 
          },
        });

        // Delete existing pages and recreate them (simplest strategy for now)
        await tx.bookPage.deleteMany({
          where: { bookId: id },
        });

        await tx.bookPage.createMany({
          data: pages.map((page) => ({
            bookId: id,
            title: page.title,
            content: page.content,
            pageNumber: page.pageNumber,
            scheduledAt: page.scheduledAt ? new Date(page.scheduledAt) : null,
          })),
        });

        return updatedBook;
      });

    } else {
      // Create new book
      book = await prisma.book.create({
        data: {
          title,
          content: pages[0].content, // Backward compatibility
          description: description || '',
          coverImage,
          genre,
          isPremium: isPremium || false,
          allowDownload: allowDownload || false,
          ambience: ambience || null,
          price: price || 0,
          published: published !== undefined ? published : false,
          authorId: session.id as string,
          pages: {
            create: pages.map((page) => ({
              title: page.title,
              content: page.content,
              pageNumber: page.pageNumber,
              scheduledAt: page.scheduledAt ? new Date(page.scheduledAt) : null,
            })),
          },
        },
      });
    }

    revalidatePath('/dashboard/my-books');
    revalidatePath('/dashboard');
    
    revalidatePath('/dashboard/my-books');
    revalidatePath('/dashboard');
    
    // Check for achievements
    try {
      await checkAndAwardAchievements(session.id as string, 'BOOK_COUNT');
      
      // Log activity if published
      if (published) {
        await logActivity(session.id as string, 'PUBLISH_BOOK', book.id, {
          title: book.title,
          coverImage: book.coverImage,
          authorName: session.name || session.username
        });
      }
    } catch (e) {
      console.error('Error checking achievements/activity:', e);
    }

    return { success: true, bookId: book.id };
  } catch (error) {
    console.error('Error creating/updating book:', error);
    return { error: 'Failed to save book' };
  }
}
