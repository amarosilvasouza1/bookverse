'use client';

import { useState } from 'react';
import { MessageSquare, Users, Loader2, LogIn } from 'lucide-react';
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

  return (
    <div className="glass-card p-6 rounded-xl hover:border-primary/50 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">
          {community.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="px-2 py-1 bg-white/10 rounded text-xs font-medium flex items-center">
          <Users className="w-3 h-3 mr-1" />
          {community._count.members}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors truncate">
        {community.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 h-10">
        {community.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center text-sm text-muted-foreground">
          <MessageSquare className="w-4 h-4 mr-2" />
          {community._count.posts} posts
        </div>

        {isMember ? (
          <span className="text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
            Member
          </span>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="text-xs font-bold bg-white/10 hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-all flex items-center"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3 mr-1" />}
            Join
          </button>
        )}
      </div>
    </div>
  );
}
