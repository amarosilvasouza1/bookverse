'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { getMiniProfile } from '@/app/actions/profile';

import UserAvatar from '@/components/UserAvatar';

interface MiniProfileProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  banner: string | null;
  _count: {
    followers: number;
    following: number;
    books: number;
  };
  isFollowing: boolean;
  items?: { item: { rarity: string } }[];
}

export default function MiniProfile({ userId, isOpen, onClose }: MiniProfileProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      let isMounted = true;
      
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await getMiniProfile(userId);
          if (isMounted && res) setData(res);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-zinc-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : data ? (
          <>
            {/* Banner */}
            <div className="h-24 w-full relative bg-linear-to-r from-indigo-500 to-purple-600">
              {data.banner && (
                <Image src={data.banner} alt="Banner" fill className="object-cover opacity-80" />
              )}
            </div>

            {/* Avatar */}
            <div className="relative px-6 -mt-16 mb-4">
              <div className="relative w-24 h-24 rounded-full border-4 border-zinc-900 overflow-visible bg-zinc-800 shadow-lg flex items-center justify-center">
                <UserAvatar 
                  src={data.image} 
                  alt={data.name || ''} 
                  rarity={data.items?.[0]?.item.rarity}
                  className="w-full h-full"
                  size={96}
                />
              </div>
            </div>

            {/* Info */}
            <div className="px-6 pb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">{data.name}</h2>
                <p className="text-sm text-muted-foreground">@{data.username}</p>
              </div>

              {data.bio && (
                <p className="text-sm text-gray-300 mb-6 line-clamp-3">
                  {data.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-white">{data._count.books}</p>
                  <p className="text-xs text-muted-foreground">Books</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{data._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">{data._count.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>

              {/* Actions */}
              <Link 
                href={`/dashboard/profile/${data.username}`}
                className="block w-full py-2.5 bg-white text-black text-center font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                View Full Profile
              </Link>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            User not found.
          </div>
        )}
      </div>
    </div>
  );
}
