import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import CommunityDetailsClient from './CommunityDetailsClient';

async function getCommunity(id: string, userId: string) {
  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          members: { where: { status: 'APPROVED' } },
          posts: true,
        },
      },
      members: {
        where: { userId },
      },
      posts: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
              username: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          likes: {
            where: { userId },
            select: { userId: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      creator: {
        select: {
          name: true,
          username: true,
          image: true
        }
      }
    },
  });

  if (!community) return null;

  const member = community.members[0];

  return {
    ...community,
    memberStatus: member?.status || null,
    memberRole: member?.role || null,
    isMember: member?.status === 'APPROVED',
  };
}

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const community = await getCommunity(id, session?.id as string);

  if (!community) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CommunityDetailsClient community={community as any} session={session as any} />;
}
