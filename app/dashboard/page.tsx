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
  const user = await prisma.user.findUnique({
    where: { id: session.id as string },
    select: {
      name: true,
      image: true,
      items: {
        where: { equipped: true, item: { type: 'FRAME' } },
        include: { item: true }
      }
    }
  });

  // Fetch tags using raw query
  const tagsResult = await prisma.$queryRaw<{ id: string, tags: string | null }[]>`
    SELECT id, tags FROM User WHERE id = ${session.id}
  `;
  const tags = tagsResult[0]?.tags;
  
  const userName = user?.name || 'Author';
  const userImage = user?.image || null;
  const equippedFrame = user?.items[0]?.item || null;

  return <DashboardContent userName={userName} userImage={userImage} equippedFrame={equippedFrame} stats={stats} tags={tags} />;
}
