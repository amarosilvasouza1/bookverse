'use client';

import { useState } from 'react';
import { MessageSquare, Users, Loader2, ArrowRight } from 'lucide-react';
import { joinCommunity } from '@/app/actions/join-community';
import { useRouter } from 'next/navigation';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string | null;
    _count: {
      members: number;
      posts: number;
    };
  };
  isMember: boolean;
}

export default function CommunityCard({ community, isMember }: CommunityCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation when clicking join
    setLoading(true);
    try {
      const result = await joinCommunity(community.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to join', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate a deterministic gradient based on the community name
  const getGradient = (name: string) => {
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-amber-500',
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  const gradient = getGradient(community.name);

  return (
    <div className="group relative h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
      {/* Header / Banner Placeholder */}
      <div className={`h-32 bg-linear-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
        
        {/* Animated sheen effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-4 border-zinc-900 flex items-center justify-center text-white font-bold text-2xl shadow-xl group-hover:scale-110 transition-transform duration-500">
            {community.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-6 pt-10 flex-1 flex flex-col bg-black/20 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
            {community.name}
          </h3>
        </div>

        <p className="text-sm text-gray-400 mb-6 line-clamp-2 h-10 leading-relaxed group-hover:text-gray-300 transition-colors">
          {community.description || 'Join this community to connect with others and share your passion.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
          <div className="flex gap-4 text-xs font-medium text-gray-500 group-hover:text-gray-400 transition-colors">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {community._count.members}
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {community._count.posts}
            </div>
          </div>

          {isMember ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-lg shadow-emerald-900/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Member
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="text-xs font-bold bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-xl transition-all flex items-center group/btn shadow-lg shadow-white/5 hover:shadow-white/20 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  Join
                  <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
