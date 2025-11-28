import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import LandingPageClient from '@/components/LandingPageClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  // Fetch stats
  const [userCount, bookCount, communityCount] = await Promise.all([
    prisma.user.count(),
    prisma.book.count({ where: { published: true } }),
    prisma.community.count(),
  ]);

  // Fetch featured books (latest 4 published)
  const featuredBooks = await prisma.book.findMany({
    where: { published: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      coverImage: true,
      author: {
        select: {
          username: true,
        },
      },
    },
  });

  return (
    <LandingPageClient 
      stats={{
        users: userCount,
        books: bookCount,
        communities: communityCount,
      }}
      featuredBooks={featuredBooks}
      session={session}
    />
  );
}
