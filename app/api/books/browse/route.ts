import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const filter = searchParams.get('filter'); // all, premium, free
    const sort = searchParams.get('sort'); // newest, popular, price_asc, price_desc

    // Build where clause
    const where: any = {
      published: true,
    };

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { genre: { contains: query } },
        { author: { 
            OR: [
              { name: { contains: query } },
              { username: { contains: query } }
            ]
          } 
        }
      ];
    }

    if (filter === 'premium') {
      where.isPremium = true;
    } else if (filter === 'free') {
      where.isPremium = false;
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' };

    if (sort === 'popular') {
      orderBy = { purchases: { _count: 'desc' } };
    } else if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    const books = await prisma.book.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            name: true,
            username: true,
          }
        },
        _count: {
          select: {
            purchases: true
          }
        }
      }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Browse books error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
