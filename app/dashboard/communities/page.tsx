import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CommunityCard from '@/components/CommunityCard';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">Engage with your readers and other authors</p>
        </div>
        <Link 
          href="/dashboard/communities/create"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </Link>
      </div>

      {communities.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No communities yet</p>
          <p className="text-sm mb-6">Be the first to start a discussion!</p>
          <Link href="/dashboard/communities/create" className="text-primary hover:underline">
            Create a Community
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link key={community.id} href={`/dashboard/communities/${community.id}`}>
              <CommunityCard community={community} isMember={community.isMember} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
