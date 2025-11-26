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
    const { amount, message } = await request.json();

    const targetUser = await prisma.user.findUnique({
      where: { username }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mock payment processing
    // In real app: await stripe.paymentIntents.create(...)

    const tip = await prisma.tip.create({
      data: {
        amount: parseFloat(amount),
        message,
        senderId: session.id as string,
        receiverId: targetUser.id
      }
    });

    return NextResponse.json(tip);

  } catch {
    return NextResponse.json({ error: 'Tip failed' }, { status: 500 });
  }
}
