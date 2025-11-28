import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Crown } from 'lucide-react';
import MemberManagement from '@/components/MemberManagement';

export default async function CommunityMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await getSession()) as { id: string } | null;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      members: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              bio: true,
              _count: {
                select: {
                  books: true,
                  followers: true
                }
              }
            }
          }
        },
        orderBy: {
          role: 'asc',
        }
      }
    }
  });

  if (!community) notFound();

  // Find current user's member record to check permissions
  const currentUserMember = community.members.find(m => m.userId === session?.id);
  const isCurrentUserOwner = community.creatorId === session?.id;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href={`/dashboard/communities/${id}`}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-muted-foreground">{community.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {community.members.map((member) => {
          const isOwner = community.creatorId === member.userId;
          const isAdmin = member.role === 'ADMIN';

          return (
            <div 
              key={member.user.id}
              className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-primary/50 transition-all relative"
            >
              <div className="flex items-start justify-between gap-4">
                <Link href={`/dashboard/profile/${member.user.username}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative shrink-0">
                    {member.user.image ? (
                      <Image 
                        src={member.user.image} 
                        alt={member.user.name || ''} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold bg-linear-to-br from-gray-700 to-gray-800">
                        {(member.user.name || '?')[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">
                        {member.user.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">@{member.user.username}</p>
                    
                    <div className="flex gap-2 mt-1">
                      {isOwner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20">
                          <Crown className="w-3 h-3" /> OWNER
                        </span>
                      )}
                      {isAdmin && !isOwner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                          <Shield className="w-3 h-3" /> ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {session?.id && session.id !== member.userId && (
                  <MemberManagement 
                    communityId={community.id}
                    memberId={member.id}
                    memberRole={member.role}
                    isTargetOwner={isOwner}
                    currentUserRole={currentUserMember?.role || null}
                    isCurrentUserOwner={isCurrentUserOwner}
                  />
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-white/5 pt-3">
                <div>
                  <span className="font-bold text-white">{member.user._count.books}</span> Books
                </div>
                <div>
                  <span className="font-bold text-white">{member.user._count.followers}</span> Followers
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
