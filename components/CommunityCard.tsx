'use client';

import { useState } from 'react';
import { MessageSquare, Users, Loader2, ArrowRight } from 'lucide-react';
import { joinCommunity } from '@/app/actions/join-community';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
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
    <div className="group relative h-full flex flex-col bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Header / Banner - Cleaner */}
      <div className={`h-28 bg-linear-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Subtle sheen */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

        <div className="absolute -bottom-6 left-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-4 border-zinc-900 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
            {community.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-6 pt-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 tracking-tight">
            {community.name}
          </h3>
        </div>

        <p className="text-sm text-zinc-400 mb-6 line-clamp-2 leading-relaxed group-hover:text-zinc-300 transition-colors bg-zinc-900/50">
          {community.description || t('defaultCommunityDesc')}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
          <div className="flex gap-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
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
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('member')}
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-1 group/btn"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  {t('join')}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
