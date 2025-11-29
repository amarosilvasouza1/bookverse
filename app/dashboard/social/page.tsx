import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SocialMain from '@/components/SocialMain';

async function getSocialData(userId: string) {
  const [communities, statuses] = await Promise.all([
    prisma.community.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true, posts: true } },
        creator: { select: { name: true, image: true } }
      }
    }),
    prisma.status.findMany({
      where: {
        expiresAt: { gt: new Date() }
      },
      include: {
        user: { select: { name: true, image: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { communities, statuses };
}

export default async function SocialPage() {
  const session = await getSession();
  if (!session) return null;

  const { communities, statuses } = await getSocialData(session.id as string);

  return <SocialMain communities={communities} statuses={statuses as unknown as any} />;
}
