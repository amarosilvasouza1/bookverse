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
    <div className="group relative h-full flex flex-col glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Header / Banner Placeholder */}
      <div className={`h-24 bg-linear-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity relative`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
        <div className="absolute -bottom-6 left-6">
          <div className="w-12 h-12 rounded-xl bg-black border-4 border-black flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {community.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-6 pt-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
            {community.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 h-10 leading-relaxed">
          {community.description || 'Join this community to connect with others.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {community._count.members}
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              {community._count.posts}
            </div>
          </div>

          {isMember ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Member
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="text-xs font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-all flex items-center group/btn"
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
