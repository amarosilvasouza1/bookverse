import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CommunitySettingsForm from '@/components/CommunitySettingsForm';

export default async function CommunitySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true
            }
          }
        }
      }
    }
  });

  if (!community) redirect('/dashboard/communities');

  // Check if user is admin
  const userMember = community.members.find(m => m.userId === session.id);
  if (!userMember || userMember.role !== 'ADMIN') {
    redirect(`/dashboard/communities/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Settings</h1>
        <p className="text-muted-foreground">Manage your community, members, and requests.</p>
      </div>
      
      <CommunitySettingsForm community={community} />
    </div>
  );
}
