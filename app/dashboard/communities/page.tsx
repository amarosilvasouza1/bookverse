import { Plus, Users, Search, Sparkles, Globe } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 p-12 opacity-30">
          <Globe className="w-64 h-64 text-white blur-3xl" />
        </div>
        
        <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-purple-200 backdrop-blur-md mb-2">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              Connect & Collaborate
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Discover Your <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400">Community</span>
            </h1>
            <p className="text-base md:text-lg text-purple-100/80 max-w-lg mx-auto md:mx-0">
              Join discussions, share your stories, and connect with fellow readers and authors in specialized communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Link 
                href="/dashboard/communities/create"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-lg shadow-white/10 hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Community
              </Link>
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search communities..." 
                  className="w-full sm:w-64 bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-purple-300/50 focus:outline-none focus:bg-black/40 focus:border-white/20 transition-all backdrop-blur-md"
                />
              </div>
            </div>
          </div>

          {/* Stats / Visual Element */}
          <div className="hidden md:block">
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transform rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-xl text-white">
                  B
                </div>
                <div>
                  <div className="font-bold text-white">BookVerse Hub</div>
                  <div className="text-xs text-purple-200">Official Community</div>
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-linear-to-r from-pink-500 to-purple-500"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-purple-200">
                <span>1.2k Members</span>
                <span>Active now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories / Filters (Visual) */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {['All Communities', 'Popular', 'Newest', 'My Communities', 'Fiction', 'Non-Fiction', 'Romance', 'Sci-Fi'].map((filter, i) => (
          <button 
            key={filter}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              i === 0 
                ? 'bg-white text-black' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {communities.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center border border-white/5 bg-black/20">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">No communities found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            It looks like there are no communities yet. Why not be the pioneer and create the first one?
          </p>
          <Link 
            href="/dashboard/communities/create" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Community
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link key={community.id} href={`/dashboard/communities/${community.id}`} className="block h-full">
              <CommunityCard community={community} isMember={community.isMember} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
