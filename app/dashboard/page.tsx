import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import DashboardContent from './DashboardContent';

async function getDashboardStats(userId: string) {
  const [
    booksCount,
    communitiesCount,
    totalEarnings,
    recentBooks
  ] = await Promise.all([
    prisma.book.count({ where: { authorId: userId } }),
    prisma.communityMember.count({ where: { userId } }),
    prisma.purchase.aggregate({
      where: { sellerId: userId },
      _sum: { amount: true }
    }),
    prisma.book.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    })
  ]);

  return {
    booksCount,
    communitiesCount,
    totalEarnings: totalEarnings._sum.amount || 0,
    recentBooks
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const stats = await getDashboardStats(session.id as string);
  const userName = (session?.name as string) || 'Author';

  return <DashboardContent userName={userName} stats={stats} />;
}
