'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import UserAvatar from '@/components/UserAvatar';

interface UserWithFrame {
  name: string | null;
  username: string;
  image: string | null;
  items: {
    item: {
      rarity: string;
    };
  }[];
}

interface Sale {
  id: string;
  amount: number;
  createdAt: string;
  book: {
    title: string;
    coverImage: string | null;
  };
  buyer: UserWithFrame;
}

interface Tip {
  id: string;
  amount: number;
  message: string | null;
  createdAt: string;
  sender: UserWithFrame;
}

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    balance: number;
    totalEarnings: number;
    monthlyEarnings: number;
    sales: Sale[];
    tips: Tip[];
  } | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/user/wallet');
      if (res.ok) {
        const walletData = await res.json();
        setData(walletData);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Wallet & Earnings</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <ShoppingBag className="w-6 h-6" />
              <h3 className="font-medium">Current Balance</h3>
            </div>
            <p className="text-5xl font-bold">${data?.balance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-2">Available to spend</p>
          </div>
        </div>
        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-green-400">
              <DollarSign className="w-6 h-6" />
              <h3 className="font-medium">Total Earnings</h3>
            </div>
            <p className="text-5xl font-bold">${data?.totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <TrendingUp className="w-6 h-6" />
              <h3 className="font-medium">This Month</h3>
            </div>
            <p className="text-5xl font-bold">${data?.monthlyEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="glass-card rounded-2xl overflow-hidden h-fit">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Recent Sales
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {data?.sales.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>No sales yet. Keep writing great books!</p>
              </div>
            ) : (
              data?.sales.map((sale) => (
                <div key={sale.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gray-800 rounded-md overflow-hidden shrink-0 relative">
                      {sale.book.coverImage ? (
                        <Image 
                          src={sale.book.coverImage} 
                          alt={sale.book.title} 
                          fill
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Cover</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{sale.book.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <UserAvatar 
                            src={sale.buyer.image} 
                            alt={sale.buyer.username} 
                            size={20} 
                            rarity={sale.buyer.items[0]?.item.rarity}
                          />
                          <span>{sale.buyer.name || sale.buyer.username}</span>
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    +${sale.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tips */}
        <div className="glass-card rounded-2xl overflow-hidden h-fit">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Recent Tips
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {data?.tips?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>No tips yet. Share your work to get support!</p>
              </div>
            ) : (
              data?.tips?.map((tip) => (
                <div key={tip.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={tip.sender.image} 
                        alt={tip.sender.username} 
                        size={40} 
                        rarity={tip.sender.items[0]?.item.rarity}
                      />
                      <div>
                        <div className="font-bold">{tip.sender.name || tip.sender.username}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tip.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      +${tip.amount.toFixed(2)}
                    </div>
                  </div>
                  {tip.message && (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl text-sm text-zinc-300 italic">
                      &quot;{tip.message}&quot;
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
