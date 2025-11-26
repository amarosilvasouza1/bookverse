import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    
    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { username }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === session.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.id as string,
          followingId: targetUser.id
        }
      }
    });

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ isFollowing: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.id as string,
          followingId: targetUser.id
        }
      });
      return NextResponse.json({ isFollowing: true });
    }

  } catch {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
