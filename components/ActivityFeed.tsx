'use client';

import { useEffect, useState } from 'react';
import { getActivityFeed } from '@/app/actions/activity';
import { Book, Heart, MessageSquare, UserPlus, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';
import { useLanguage } from '@/context/LanguageContext';

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
    items: {
      item: {
        rarity: string;
      };
    }[];
  };
}

interface ActivityFeedProps {
  userId?: string;
  initialLimit?: number;
}

export default function ActivityFeed({ userId, initialLimit = 3 }: ActivityFeedProps) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const result = await getActivityFeed(userId);
        if (result.success && result.data) {
          setActivities(result.data as unknown as Activity[]);
        }
      } catch (error) {
        console.error('Failed to load feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-white/10 rounded" />
              <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-500 bg-white/5 rounded-xl border border-white/5">
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-xs">{t('noRecentActivity') || 'No recent activity'}</p>
      </div>
    );
  }

  const displayedActivities = expanded ? activities : activities.slice(0, initialLimit);
  const hasMore = activities.length > initialLimit;

  return (
    <div className="space-y-2">
      {displayedActivities.map((activity) => (
        <div key={activity.id} className="group relative flex gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all">
          {/* Avatar */}
          <Link href={`/dashboard/profile/${activity.user.username}`} className="shrink-0">
            <UserAvatar 
              src={activity.user.image} 
              alt={activity.user.username} 
              size={32} 
              rarity={activity.user.items[0]?.item.rarity}
            />
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <Link href={`/dashboard/profile/${activity.user.username}`} className="font-medium text-white text-sm hover:underline truncate">
                {activity.user.name || activity.user.username}
              </Link>
              <span className="text-zinc-500 text-[10px]">• {new Date(activity.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-zinc-400 text-xs flex items-center gap-1.5 truncate">
              {activity.type === 'PUBLISH_BOOK' && (
                <>
                  <Book className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">
                    {t('publishedBook') || 'published'}: <span className="text-indigo-400">{activity.metadata?.title || 'Untitled'}</span>
                  </span>
                </>
              )}
              {activity.type === 'REVIEW_BOOK' && (
                <>
                  <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{t('reviewedBook') || 'reviewed a book'}</span>
                </>
              )}
              {activity.type === 'LIKE_BOOK' && (
                <>
                  <Heart className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>{t('likedBook') || 'liked a book'}</span>
                </>
              )}
              {activity.type === 'FOLLOW_USER' && (
                <>
                  <UserPlus className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{t('followedUser') || 'started following someone'}</span>
                </>
              )}
            </p>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {t('showLess') || 'Show Less'}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {t('showMore') || `Show ${activities.length - initialLimit} More`}
            </>
          )}
        </button>
      )}
    </div>
  );
}
