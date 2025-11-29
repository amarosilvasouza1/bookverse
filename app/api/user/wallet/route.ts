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
          select: { 
            name: true, 
            username: true, 
            image: true,
            items: {
              where: { equipped: true, item: { type: 'FRAME' } },
              include: { item: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch tips where the user is the receiver
    const tips = await prisma.tip.findMany({
      where: { receiverId: session.id as string },
      include: {
        sender: {
          select: { 
            name: true, 
            username: true, 
            image: true,
            items: {
              where: { equipped: true, item: { type: 'FRAME' } },
              include: { item: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total earnings
    const salesTotal = sales.reduce((acc, sale) => acc + sale.amount, 0);
    const tipsTotal = tips.reduce((acc, tip) => acc + tip.amount, 0);
    const totalEarnings = salesTotal + tipsTotal;

    // Get monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlySales = sales
      .filter(sale => new Date(sale.createdAt) >= thirtyDaysAgo)
      .reduce((acc, sale) => acc + sale.amount, 0);

    const monthlyTips = tips
      .filter(tip => new Date(tip.createdAt) >= thirtyDaysAgo)
      .reduce((acc, tip) => acc + tip.amount, 0);

    const monthlyEarnings = monthlySales + monthlyTips;

    // Fetch user balance
    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      select: { balance: true }
    });

    return NextResponse.json({
      balance: user?.balance || 0,
      totalEarnings,
      monthlyEarnings,
      sales,
      tips
    });

  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
