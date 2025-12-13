'use server';

import { prisma } from '@/lib/prisma';

export interface SearchResult {
  books: {
    id: string;
    title: string;
    coverImage: string | null;
    author: { name: string | null; username: string };
    genre: string | null;
    price: number;
    rating: number; // Média de reviews
  }[];
  users: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    _count: { followers: number };
  }[];
  communities: {
    id: string;
    name: string;
    description: string | null;
    _count: { members: number };
  }[];
}

export async function searchGlobal(query: string): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return { books: [], users: [], communities: [] };
  }

  try {
    const [books, users, communities] = await Promise.all([
      // Search Books
      prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { genre: { contains: query } },
            { tags: { contains: query } }
          ],
          published: true
        },
        take: 10,
        select: {
          id: true,
          title: true,
          coverImage: true,
          genre: true,
          price: true,
          author: {
            select: { name: true, username: true }
          },
          reviews: {
            select: { rating: true }
          }
        }
      }),

      // Search Users
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { name: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          _count: {
            select: { followers: true }
          }
        }
      }),

      // Search Communities
      prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: { members: true }
          }
        }
      })
    ]);

    // Process books to calculate average rating
    const processedBooks = books.map(book => ({
      ...book,
      rating: book.reviews.length > 0
        ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length
        : 0
    }));

    return {
      books: processedBooks,
      users,
      communities
    };
  } catch (error) {
    console.error('Search error:', error);
    return { books: [], users: [], communities: [] }; // Return empty on error to avoid crashing UI
  }
}
