import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const reviews = await prisma.review.findMany({
      where: { bookId: id },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, content } = await request.json();

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        bookId_userId: {
          bookId: id,
          userId: session.id as string
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this book' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        content,
        bookId: id,
        userId: session.id as string
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
