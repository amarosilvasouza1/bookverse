import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const communityId = id;

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.id as string,
          communityId,
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member' },
        { status: 400 }
      );
    }

    await prisma.communityMember.create({
      data: {
        userId: session.id as string,
        communityId,
      }
    });

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
