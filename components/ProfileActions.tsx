'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, DollarSign } from 'lucide-react';
import { TipModal } from './TipModal';

interface ProfileActionsProps {
  username: string;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export function ProfileActions({ username, isFollowing: initialIsFollowing, isOwnProfile }: ProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch {
      console.error('Follow action failed');
    } finally {
      setLoading(false);
    }
  };

  if (isOwnProfile) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-6 w-full">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
          isFollowing
            ? 'bg-white/5 text-white hover:bg-white/10'
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck className="w-4 h-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Follow
          </>
        )}
      </button>

      <button
        onClick={() => setShowTipModal(true)}
        className="px-4 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl font-medium flex items-center gap-2 transition-colors"
      >
        <DollarSign className="w-4 h-4" />
        Tip
      </button>

      <TipModal 
        isOpen={showTipModal} 
        onClose={() => setShowTipModal(false)} 
        username={username} 
      />
    </div>
  );
}
