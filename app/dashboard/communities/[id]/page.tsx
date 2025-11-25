import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Users, MessageSquare, Calendar, Settings, Shield, Lock, Globe } from 'lucide-react';
import CreatePostForm from '@/components/CreatePostForm';
import { joinCommunity } from '@/app/actions/join-community';
import Link from 'next/link';

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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
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

  const handleJoin = async () => {
    'use server';
    await joinCommunity(id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-card p-8 rounded-2xl border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Users className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {community.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                {community.name}
                {community.privacy === 'CLOSED' ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Globe className="w-5 h-5 text-muted-foreground" />
                )}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {community._count.members} members
                </span>
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {community._count.posts} posts
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(community.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-lg text-gray-300 max-w-2xl mb-6">
            {community.description || 'No description provided.'}
          </p>

          <div className="flex items-center gap-3">
            {community.isMember ? (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center px-4 py-2 bg-green-500/10 text-green-400 rounded-full font-medium border border-green-500/20">
                  <Shield className="w-4 h-4 mr-2" />
                  Member
                </div>
                {community.memberRole === 'ADMIN' && (
                  <Link 
                    href={`/dashboard/communities/${id}/settings`}
                    className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium transition-colors border border-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                )}
              </div>
            ) : community.memberStatus === 'PENDING' ? (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full font-medium border border-yellow-500/20">
                Request Pending
              </div>
            ) : (
              <form action={handleJoin}>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-medium transition-colors"
                >
                  {community.privacy === 'CLOSED' ? 'Request to Join' : 'Join Community'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {community.isMember && (
            <CreatePostForm communityId={community.id} />
          )}

          <div className="space-y-6">
            {community.posts.map((post: any) => (
              <div key={post.id} className="glass-card p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0">
                    {post.author.image ? (
                      <img src={post.author.image} alt={post.author.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {(post.author.name || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-white mr-2">{post.author.name}</span>
                        <span className="text-sm text-muted-foreground">@{post.author.username}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 whitespace-pre-wrap mb-4">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {post._count.comments} Comments
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {community.posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No posts yet. Be the first to share something!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="font-bold mb-4 text-lg">About</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Welcome to the {community.name} community! Please be respectful and follow the guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
