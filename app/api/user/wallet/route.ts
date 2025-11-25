import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch sales where the user is the seller
    const sales = await prisma.purchase.findMany({
      where: { sellerId: session.id as string },
      include: {
        book: {
          select: { title: true, coverImage: true }
        },
        buyer: {
          select: { name: true, username: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total earnings
    const totalEarnings = sales.reduce((acc, sale) => acc + sale.amount, 0);

    // Get monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyEarnings = sales
      .filter(sale => new Date(sale.createdAt) >= thirtyDaysAgo)
      .reduce((acc, sale) => acc + sale.amount, 0);

    return NextResponse.json({
      totalEarnings,
      monthlyEarnings,
      sales
    });

  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
