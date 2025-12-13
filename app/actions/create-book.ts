'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { checkAndAwardAchievements } from '@/lib/gamification';
import { logActivity } from '@/app/actions/activity';
import { createStatus, StatusData } from '@/app/actions/status';

export async function createBook(data: {
  id?: string;
  title: string;
  pages: { title: string; content: string; pageNumber: number; scheduledAt?: string }[];
  description?: string;
  coverImage?: string;
  genre?: string;
  tags?: string;
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

    const { id, title, pages, description, coverImage, genre, tags, isPremium, allowDownload, ambience, price, published } = data;

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
            tags, // Add tags
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
          tags,
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

    revalidatePath('/dashboard/books');
    revalidatePath('/dashboard');
    
    revalidatePath('/dashboard/books');
    revalidatePath('/dashboard');
    
    // Check for achievements
    try {
      await checkAndAwardAchievements(session.id as string, 'BOOK_COUNT');
      
      // Log activity and create status if published
      if (published) {
        await logActivity(session.id as string, 'PUBLISH_BOOK', book.id, {
          title: book.title,
          coverImage: book.coverImage,
          authorName: session.name || session.username
        });

        // Create Status for Book Publish
        // Only if it's a new publish (we can't easily check previous state here for new books, but for updates we could have)
        // For now, let's just create it. The user can delete it if they want (future feature).
        // Or better, check if we just switched to published.
        // But for now, let's assume if they hit save and it's published, we announce it.
        // To avoid spam, we might want to check if a status exists recently, but let's keep it simple.
        
        await createStatus('BOOK_PUBLISH', {
          bookId: book.id,
          bookTitle: book.title,
          coverImage: book.coverImage,
          authorName: (session.name || session.username) as string
        } as StatusData);

        // Notify Followers
        const followers = await prisma.follow.findMany({
          where: { followingId: session.id as string },
          select: { followerId: true }
        });

        if (followers.length > 0) {
          await prisma.notification.createMany({
            data: followers.map(f => ({
              userId: f.followerId,
              type: 'NEW_BOOK',
              message: `${session.name || session.username} published a new book: ${book.title}`,
              link: `/dashboard/books/${book.id}`
            }))
          });
        }
      }

      // Check for scheduled chapters
      const scheduledPages = pages.filter(p => p.scheduledAt);
      if (scheduledPages.length > 0) {
        for (const page of scheduledPages) {
           await createStatus('CHAPTER_RELEASE', {
            bookId: book.id,
            bookTitle: book.title,
            coverImage: book.coverImage,
            chapterTitle: page.title,
            releaseDate: page.scheduledAt
          } as StatusData);
        }
      }

    } catch (e) {
      console.error('Error checking achievements/activity/status:', e);
    }

    // Award all FRAMES to the author
    try {
      const allFrames = await prisma.item.findMany({
        where: { type: 'FRAME' }
      });

      if (allFrames.length > 0) {
        await prisma.userItem.createMany({
          data: allFrames.map(frame => ({
            userId: session.id as string,
            itemId: frame.id
          })),
          skipDuplicates: true
        });
        console.log(`Awarded ${allFrames.length} frames to user ${session.id}`);
      }
    } catch (e) {
      console.error('Error awarding frames:', e);
    }

    return { success: true, bookId: book.id };
  } catch (error) {
    console.error('Error creating/updating book:', error);
    return { error: 'Failed to save book' };
  }
}
