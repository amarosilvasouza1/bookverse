import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Users, MessageSquare, Calendar, Settings, Shield, Lock, Globe, Sparkles, MoreHorizontal, Heart, Share2 } from 'lucide-react';
import CreatePostForm from '@/components/CreatePostForm';
import { joinCommunity } from '@/app/actions/join-community';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="-mt-6 -mx-6 md:-mt-8 md:-mx-8">
      {/* Immersive Header */}
      <div className={`relative h-64 md:h-80 bg-linear-to-r ${gradient}`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-black border-4 border-black shadow-2xl flex items-center justify-center text-white font-bold text-3xl md:text-5xl shrink-0 relative z-10 -mb-12 md:-mb-16 bg-linear-to-br from-gray-800 to-gray-900">
              {community.name.substring(0, 2).toUpperCase()}
            </div>
            
            {/* Info */}
            <div className="flex-1 mb-2 md:mb-4 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
                    {community.name}
                    {community.privacy === 'CLOSED' && (
                      <Lock className="w-6 h-6 text-white/60" />
                    )}
                  </h1>
                  <p className="text-white/80 max-w-2xl line-clamp-1 md:line-clamp-none text-lg">
                    {community.description || 'No description provided.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {community.isMember ? (
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full font-bold border border-emerald-500/30 backdrop-blur-md">
                        <Shield className="w-4 h-4 mr-2" />
                        Member
                      </div>
                      {community.memberRole === 'ADMIN' && (
                        <Link 
                          href={`/dashboard/communities/${id}/settings`}
                          className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/10 backdrop-blur-md"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      )}
                    </div>
                  ) : community.memberStatus === 'PENDING' ? (
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full font-medium border border-yellow-500/30 backdrop-blur-md">
                      Request Pending
                    </div>
                  ) : (
                    <form action={handleJoin}>
                      <button 
                        type="submit"
                        className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
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
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 md:pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
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
                <div key={post.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all bg-black/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden shrink-0 relative border border-white/10">
                      {post.author.image ? (
                        <Image 
                          src={post.author.image} 
                          alt={post.author.name || ''} 
                          fill
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-linear-to-br from-gray-700 to-gray-800">
                          {(post.author.name || '?')[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white hover:underline cursor-pointer">{post.author.name}</span>
                          <span className="text-sm text-muted-foreground">@{post.author.username}</span>
                          <span className="text-xs text-muted-foreground">• {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button className="text-muted-foreground hover:text-white transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-gray-200 whitespace-pre-wrap mb-4 text-base leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-pink-400 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                            <Heart className="w-4 h-4" />
                          </div>
                          <span>Like</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <span>{post._count.comments} Comments</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-400 transition-colors group ml-auto">
                          <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
          <div className="lg:col-span-4 space-y-6">
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Members
                  </span>
                  <span className="font-bold text-white">{community._count.members}</span>
                </div>
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
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
                    {community.creator.image ? (
                      <Image src={community.creator.image} alt={community.creator.name || ''} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                        {(community.creator.name || '?')[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{community.creator.name}</div>
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
