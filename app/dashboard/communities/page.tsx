import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CommunitiesClient from './CommunitiesClient';

async function getCommunities(userId: string) {
  const communities = await prisma.community.findMany({
    include: {
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
      members: {
        where: {
          userId: userId,
        },
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      members: {
        _count: 'desc',
      },
    },
  });

  return communities.map(c => ({
    ...c,
    isMember: c.members.length > 0,
  }));
}

export default async function CommunitiesPage() {
  const session = await getSession();
  const communities = await getCommunities((session?.id as string) || '');

  return <CommunitiesClient communities={communities} />;
}
