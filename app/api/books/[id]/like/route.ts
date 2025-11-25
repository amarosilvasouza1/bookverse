import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const [likesCount, userLike] = await Promise.all([
      prisma.like.count({ where: { bookId: id } }),
      session ? prisma.like.findUnique({
        where: {
          bookId_userId: {
            bookId: id,
            userId: session.id as string
          }
        }
      }) : null
    ]);

    return NextResponse.json({
      likes: likesCount,
      isLiked: !!userLike
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        bookId_userId: {
          bookId: id,
          userId: session.id
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          bookId_userId: {
            bookId: id,
            userId: session.id
          }
        }
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          bookId: id,
          userId: session.id
        }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
