import { BookOpen, Users, DollarSign, TrendingUp, Bell } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

async function getDashboardStats(userId: string) {
  const [
    booksCount,
    communitiesCount,
    totalEarnings,
    recentBooks
  ] = await Promise.all([
    prisma.book.count({ where: { authorId: userId } }),
    prisma.communityMember.count({ where: { userId } }),
    prisma.purchase.aggregate({
      where: { sellerId: userId },
      _sum: { amount: true }
    }),
    prisma.book.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    })
  ]);

  return {
    booksCount,
    communitiesCount,
    totalEarnings: totalEarnings._sum.amount || 0,
    recentBooks
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats(session?.id as string);

  return (
    <div className="space-y-8">
      {/* Welcome Alert */}
      <div className="bg-linear-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/20 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Bell className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2 text-white">Welcome back, {session?.name || 'Author'}! 👋</h2>
          <p className="text-purple-200 max-w-2xl">
            Here's what's happening with your books and communities today. You have {stats.booksCount} published books and are part of {stats.communitiesCount} communities.
          </p>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your creative journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Books</h3>
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{stats.booksCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Published works
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Communities</h3>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{stats.communitiesCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Joined communities
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-green-400 mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Lifetime earnings
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Drafts</h3>
            <BookOpen className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-2xl font-bold">
            {stats.recentBooks.filter(b => !b.published).length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Works in progress
          </p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-6">Recent Books</h3>
          <div className="space-y-4">
            {stats.recentBooks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No books created yet.</p>
            ) : (
              stats.recentBooks.map((book) => (
                <Link href={`/dashboard/create-book?id=${book.id}`} key={book.id} className="flex items-center p-3 hover:bg-white/5 rounded-lg transition-colors group">
                  <div className="w-10 h-14 bg-gray-800 rounded mr-4 overflow-hidden shrink-0">
                    {book.coverImage ? (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <BookOpen className="w-4 h-4 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.published ? 'Published' : 'Draft'} • {new Date(book.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
            <Link href="/dashboard/create-book" className="block text-center text-sm text-primary hover:underline pt-2">
              Create New Book
            </Link>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/create-book" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Write a Book</span>
            </Link>
            <Link href="/dashboard/communities" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-medium">Join Community</span>
            </Link>
            <Link href="/dashboard/settings" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-medium">Setup Profile</span>
            </Link>
            <Link href="/dashboard/books" className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-sm font-medium">Manage Books</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
