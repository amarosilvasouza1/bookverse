import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Link as LinkIcon, Calendar, Twitter, Github, Instagram } from 'lucide-react';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import { ProfileActions } from '@/components/ProfileActions';
import ProfileContent from './components/ProfileContent';

async function getUserProfile(username: string, currentUserId?: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      followers: currentUserId ? {
        where: { followerId: currentUserId }
      } : false,
      books: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { purchases: true }
          }
        }
      },
      userAchievements: {
        include: {
          achievement: true
        },
        orderBy: {
          unlockedAt: 'desc'
        }
      },
      _count: {
        select: {
          books: { where: { published: true } },
          joinedCommunities: true,
          communities: true,
          userAchievements: true,
          followers: true,
        }
      }
    }
  });

  return user;
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getSession();
  const user = await getUserProfile(username, session?.id as string | undefined);

  if (!user) {
    notFound();
  }

  const isFollowing = user.followers?.length > 0;
  const isOwnProfile = session?.id === user.id;
  const socialLinks = user.socialLinks ? JSON.parse(user.socialLinks) : {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 -mx-4 -mt-4 md:-mx-8 md:-mt-8">
      {/* Banner */}
      <div className="h-48 md:h-80 w-full relative bg-linear-to-r from-purple-900/20 to-pink-900/20">
        {user.banner ? (
          <div className="relative w-full h-full">
            <Image 
              src={user.banner} 
              alt="Profile Banner" 
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-full bg-linear-to-r from-zinc-800 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 md:-mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
          {/* Profile Info Sidebar */}
          <div className="w-full md:w-80 shrink-0 space-y-6 flex flex-col items-center md:items-stretch">
            {/* Avatar */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-zinc-800 shadow-2xl">
              {user.image ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={user.image} 
                    alt={user.name || username} 
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-4xl font-bold">
                  {(user.name || username)[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-4 w-full">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{user.name || username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {/* Profile Actions */}
              <div className="flex justify-center md:justify-start w-full">
                <ProfileActions 
                  username={username} 
                  isFollowing={isFollowing} 
                  isOwnProfile={isOwnProfile} 
                />
              </div>

              {user.bio && (
                <p className="text-gray-300 leading-relaxed text-sm max-w-md mx-auto md:mx-0">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-col gap-2 text-sm text-muted-foreground items-center md:items-start">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {socialLinks.website && (
                  <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <LinkIcon className="w-4 h-4" />
                    <span className="truncate">{socialLinks.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-3 justify-center md:justify-start">
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-[#1DA1F2] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-[#E1306C] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-white/10 w-full">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user._count.books}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user._count.communities}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user._count.userAchievements}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Trophies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user._count.followers}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Followers</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full pt-8 md:pt-32">
            <ProfileContent user={user} isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}
