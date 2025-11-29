import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Users, MessageSquare, Calendar, Settings, Shield, Lock, Globe, Sparkles } from 'lucide-react';
import CreatePostForm from '@/components/CreatePostForm';
import { joinCommunity } from '@/app/actions/join-community';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import DeleteCommunityButton from '@/components/DeleteCommunityButton';

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

  const handleJoin = async () => {
    'use server';
    await joinCommunity(id);
  };

  // Deterministic gradient based on name
  const getGradient = (name: string) => {
    const gradients = [
      'from-pink-600 via-purple-600 to-indigo-600',
      'from-blue-600 via-cyan-600 to-teal-600',
      'from-emerald-600 via-green-600 to-lime-600',
      'from-orange-600 via-amber-600 to-yellow-600',
      'from-red-600 via-rose-600 to-pink-600',
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  const gradient = getGradient(community.name);

  return (
    <div className="-mt-4 -mx-4 md:-mt-8 md:-mx-8">
      {/* Immersive Header */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-80`} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        {/* Animated Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full z-20">
          <div className="flex flex-col md:flex-row items-end gap-8">
            {/* Avatar with Glow */}
            <div className="relative group/avatar">
              <div className={`absolute inset-0 bg-linear-to-br ${gradient} blur-2xl opacity-50 group-hover/avatar:opacity-80 transition-opacity duration-500`} />
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-4xl bg-zinc-900 border-4 border-zinc-950 shadow-2xl flex items-center justify-center text-white font-bold text-3xl md:text-6xl shrink-0 relative z-10 -mb-12 md:-mb-20 transform group-hover/avatar:scale-105 transition-transform duration-500">
                {community.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 mb-2 md:mb-6 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {community.privacy === 'CLOSED' && (
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white/80 flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white/80 flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Community
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-none">
                    {community.name}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-gray-300 max-w-2xl line-clamp-2 leading-relaxed">
                    {community.description || 'No description provided.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pb-2">
                  {community.isMember ? (
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-2xl font-bold border border-emerald-500/20 backdrop-blur-md shadow-lg shadow-emerald-900/20">
                        <Shield className="w-5 h-5 mr-2" />
                        Member
                      </div>
                      {community.memberRole === 'ADMIN' && (
                        <Link 
                          href={`/dashboard/communities/${id}/settings`}
                          className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
                        >
                          <Settings className="w-5 h-5 mr-2" />
                          Settings
                        </Link>
                      )}
                      {community.creatorId === session?.id && (
                        <DeleteCommunityButton communityId={community.id} />
                      )}
                    </div>
                  ) : community.memberStatus === 'PENDING' ? (
                    <div className="inline-flex items-center px-6 py-3 bg-yellow-500/10 text-yellow-400 rounded-2xl font-bold border border-yellow-500/20 backdrop-blur-md">
                      Request Pending
                    </div>
                  ) : (
                    <form action={handleJoin}>
                      <button 
                        type="submit"
                        className="bg-white text-black hover:bg-gray-100 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-white/10 hover:scale-105 active:scale-95 text-lg"
                      >
                        {community.privacy === 'CLOSED' ? 'Request to Join' : 'Join Community'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-20 md:pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            {community.isMember && (
              <CreatePostForm communityId={community.id} />
            )}

            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">Community Feed</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm font-medium text-white bg-white/10 rounded-full">Latest</button>
                <button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-white transition-colors">Top</button>
              </div>
            </div>

            <div className="space-y-6">
              {community.posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={session?.id as string} />
              ))}

              {community.posts.length === 0 && (
                <div className="text-center py-16 text-muted-foreground glass-card rounded-2xl border-dashed border-2 border-white/10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-yellow-400/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Quiet in here...</h3>
                  <p>Be the first to spark a conversation in this community!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            {/* About Card */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-black/20 sticky top-24">
              <h3 className="font-bold mb-4 text-lg text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                About Community
              </h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                {community.description || 'Welcome to our community! Connect, share, and grow with us.'}
              </p>
              
              <div className="space-y-4">
                <Link href={`/dashboard/communities/${community.id}/members`} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" /> Members
                  </span>
                  <span className="font-bold text-white">{community._count.members}</span>
                </Link>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Posts
                  </span>
                  <span className="font-bold text-white">{community._count.posts}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Created
                  </span>
                  <span className="font-bold text-white">{new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Created By</h4>
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/profile/${community.creator.username}`} className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative hover:ring-2 hover:ring-primary transition-all">
                    {community.creator.image ? (
                      <Image src={community.creator.image} alt={community.creator.name || ''} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                        {(community.creator.name || '?')[0]}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link href={`/dashboard/profile/${community.creator.username}`} className="text-sm font-bold text-white hover:text-primary hover:underline transition-colors">
                      {community.creator.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">@{community.creator.username}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
