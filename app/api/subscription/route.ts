import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.id as string },
    });

    return NextResponse.json(subscription || { status: 'INACTIVE' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    // Simulate payment processing
    // In a real app, you would integrate Stripe/LemonSqueezy here

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const subscription = await prisma.subscription.upsert({
      where: { userId: session.id as string },
      update: {
        status: 'ACTIVE',
        plan,
        startDate,
        endDate,
      },
      create: {
        userId: session.id as string,
        status: 'ACTIVE',
        plan,
        startDate,
        endDate,
      },
    });

    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.update({
      where: { userId: session.id as string },
      data: {
        status: 'CANCELED',
        endDate: new Date(), // End immediately
      },
    });

    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
