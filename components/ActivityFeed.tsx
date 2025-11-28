'use client';

import { useEffect, useState } from 'react';
import { getActivityFeed } from '@/app/actions/activity';
import { Book, Heart, MessageSquare, UserPlus, Clock } from 'lucide-react';
import Link from 'next/link';

interface ActivityMetadata {
  title?: string;
  coverImage?: string;
  authorName?: string;
  [key: string]: unknown;
}

interface Activity {
  id: string;
  type: string;
  entityId: string;
  metadata: ActivityMetadata;
  createdAt: Date;
  user: {
    name: string | null;
    username: string;
    image: string | null;
  };
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const result = await getActivityFeed();
        if (result.success && result.data) {
          // Cast the result to match our frontend interface
          setActivities(result.data as unknown as Activity[]);
        }
      } catch (error) {
        console.error('Failed to load feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-white/10 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="group relative flex gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
          {/* Avatar */}
          <Link href={`/dashboard/profile/${activity.user.username}`} className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
              {activity.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activity.user.image} alt={activity.user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-500 font-bold">
                  {activity.user.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/dashboard/profile/${activity.user.username}`} className="font-medium text-white hover:underline truncate">
                {activity.user.name || activity.user.username}
              </Link>
              <span className="text-zinc-500 text-xs">• {new Date(activity.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-zinc-400 text-sm flex items-center gap-2">
              {activity.type === 'PUBLISH_BOOK' && (
                <>
                  <Book className="w-4 h-4 text-indigo-400" />
                  <span>published a new book:</span>
                  <Link href={`/dashboard/books/${activity.entityId}`} className="text-indigo-400 hover:underline font-medium truncate">
                    {activity.metadata?.title || 'Untitled Book'}
                  </Link>
                </>
              )}
              {activity.type === 'REVIEW_BOOK' && (
                <>
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>reviewed a book</span>
                </>
              )}
              {activity.type === 'LIKE_BOOK' && (
                <>
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>liked a book</span>
                </>
              )}
              {activity.type === 'FOLLOW_USER' && (
                <>
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>started following a user</span>
                </>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
