import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SocialMain, { Status } from '@/components/SocialMain';
import { getSuggestedUsers } from '@/app/actions/social';

async function getSocialData() {
  // 1. Fetch communities and suggested users (parallel)
  const communitiesPromise = prisma.community.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { members: true, posts: true } },
      creator: { select: { name: true, image: true } }
    }
  });
  
  const suggestedUsersPromise = getSuggestedUsers(6);

  /* 
     2. Optimized Status Fetch: 
     - First, get IDs sorted (lightweight).
     - Second, get data for those IDs (no DB sorting).
     - Finally, re-sort in memory to match the original ID order.
  */
  const recentStatusIds = await prisma.status.findMany({
    where: { expiresAt: { gt: new Date() } },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const statusesPromise = prisma.status.findMany({
    where: { 
      id: { in: recentStatusIds.map(s => s.id) } 
    },
    include: {
      user: { select: { name: true, image: true, username: true } }
    }
  }).then(unsortedStatuses => {
     // Re-sort in memory to match the ID order from the first query
     const idMap = new Map(unsortedStatuses.map(s => [s.id, s]));
     return recentStatusIds
       .map(idObj => idMap.get(idObj.id))
       .filter((s): s is typeof unsortedStatuses[0] => s !== undefined);
  });

  const [communities, statuses, suggestedUsers] = await Promise.all([
    communitiesPromise,
    statusesPromise,
    suggestedUsersPromise
  ]);

  return { communities, statuses, suggestedUsers };
}

export default async function SocialPage() {
  const session = await getSession();
  if (!session) return null;

  const { communities, statuses, suggestedUsers } = await getSocialData();

  return <SocialMain communities={communities} statuses={statuses as unknown as Status[]} suggestedUsers={suggestedUsers} />;
}
