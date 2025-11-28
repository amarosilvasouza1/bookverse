import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield } from 'lucide-react';

export default async function CommunityMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      members: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              bio: true,
              _count: {
                select: {
                  books: true,
                  followers: true
                }
              }
            }
          }
        },
        orderBy: {
          role: 'asc',
        }
      }
    }
  });

  if (!community) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href={`/dashboard/communities/${id}`}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Members</h1>
          <p className="text-muted-foreground">{community.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {community.members.map((member) => (
          <Link 
            key={member.user.id}
            href={`/dashboard/profile/${member.user.username}`}
            className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden relative shrink-0">
                {member.user.image ? (
                  <Image 
                    src={member.user.image} 
                    alt={member.user.name || ''} 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold bg-linear-to-br from-gray-700 to-gray-800">
                    {(member.user.name || '?')[0]}
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">
                    {member.user.name}
                  </h3>
                  {member.role === 'ADMIN' && (
                    <Shield className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">@{member.user.username}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-white/5 pt-3">
              <div>
                <span className="font-bold text-white">{member.user._count.books}</span> Books
              </div>
              <div>
                <span className="font-bold text-white">{member.user._count.followers}</span> Followers
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
