'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Loader2, ShoppingBag, ArrowUpRight, ArrowDownLeft, Filter, Wallet } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

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

type TransactionType = 'ALL' | 'SALE' | 'TIP';

export default function WalletPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    balance: number;
    totalEarnings: number;
    monthlyEarnings: number;
    sales: Sale[];
    tips: Tip[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TransactionType>('ALL');

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
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string) => {
    toast.info(`${action} ${t('walletFeatureComingSoon') || 'feature coming soon!'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Combine and sort transactions
  const transactions = [
    ...(data?.sales.map(s => ({ ...s, type: 'SALE' as const })) || []),
    ...(data?.tips.map(t => ({ ...t, type: 'TIP' as const })) || [])
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'ALL') return true;
    return t.type === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Card & Stats */}
        <div className="w-full lg:w-1/3 space-y-6">
            
            {/* Digital Card */}
            <div className="relative w-full aspect-[1.586/1] rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] hover:shadow-primary/20 duration-500 group">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-zinc-900"></div>
                
                {/* Animated Glow Elements */}
                <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-linear-to-tr from-primary/30 to-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-full h-full bg-linear-to-tr from-black/0 to-white/5 opacity-50"></div>
                
                {/* Card Content */}
                <div className="relative z-10 w-full h-full p-6 md:p-8 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                           <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-widest opacity-50 border border-white/20 px-2 py-0.5 rounded-full">PREMIUM</span>
                    </div>
                    
                    <div className="space-y-1">
                        <span className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wider">{t('totalBalance')}</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-white to-white/70 overflow-hidden text-ellipsis whitespace-nowrap">
                               ${data?.balance.toFixed(2)}
                           </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex gap-2">
                             <div className="w-10 h-6 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80 shadow-lg"></div>
                        </div>
                        <span className="font-mono text-sm opacity-60 tracking-widest">**** 8842</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleAction('Deposit')}
                    className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all group active:scale-95"
                >
                    <div className="p-3.5 rounded-full bg-green-500/10 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition-all shadow-lg shadow-green-500/5">
                        <ArrowDownLeft className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{t('addFunds')}</span>
                </button>
                <button 
                    onClick={() => handleAction('Withdraw')}
                    className="flex flex-col items-center justify-center gap-3 p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all group active:scale-95"
                >
                    <div className="p-3.5 rounded-full bg-red-500/10 text-red-400 group-hover:scale-110 group-hover:bg-red-500/20 transition-all shadow-lg shadow-red-500/5">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{t('withdraw')}</span>
                </button>
            </div>

            {/* Monthly Stats */}
             <div className="glass-card p-6 rounded-3xl space-y-4 border border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white/90">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {t('monthlyOverview')}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                        <span className="text-xs text-muted-foreground block mb-2">{t('totalEarnings')}</span>
                        <span className="text-xl md:text-2xl font-bold text-white">${data?.totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <span className="text-xs text-primary/70 block mb-2">{t('thisMonth')}</span>
                        <span className="text-xl md:text-2xl font-bold text-green-400 flex items-center gap-1">
                            +${data?.monthlyEarnings.toFixed(2)}
                        </span>
                    </div>
                </div>
             </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-2xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {t('transactions')}
                </h2>
                <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl w-full sm:w-auto">
                    {(['ALL', 'SALE', 'TIP'] as TransactionType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab 
                                    ? "bg-white/10 text-white shadow-lg shadow-black/20 font-bold" 
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab === 'ALL' ? t('allTransactions') : tab === 'SALE' ? t('sales') : t('tips')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden min-h-[500px] border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
                {filteredTransactions.length === 0 ? (
                    <div className="h-[500px] flex flex-col items-center justify-center p-12 text-muted-foreground space-y-6">
                         <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                             <Filter className="w-10 h-10 opacity-30" />
                         </div>
                        <p className="text-lg">{t('noTransactions')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredTransactions.map((tx, i) => (
                            <div 
                                key={`${tx.type}-${tx.id}`} 
                                className="group p-5 md:p-6 flex items-center gap-4 hover:bg-white/5 transition-all animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className={cn(
                                    "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105 shadow-lg",
                                    tx.type === 'SALE' 
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5" 
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
                                )}>
                                    {tx.type === 'SALE' ? <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" /> : <DollarSign className="w-5 h-5 md:w-6 md:h-6" />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className="font-bold truncate text-white text-base md:text-lg">
                                            {tx.type === 'SALE' ? (tx as Sale).book.title : t('receivedTip')}
                                        </h4>
                                        <div className="text-right">
                                            <span className="font-bold text-green-400 whitespace-nowrap text-base md:text-lg block">
                                                +${tx.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {tx.type === 'SALE' ? (
                                                <>
                                                    <span className="hidden md:inline">{t('soldTo')}</span>
                                                    <div className="flex items-center gap-2 p-1 pr-3 bg-white/5 rounded-full border border-white/5 hover:border-white/20 transition-colors">
                                                        <UserAvatar 
                                                            src={(tx as Sale).buyer.image} 
                                                            alt={(tx as Sale).buyer.username} 
                                                            size={20} 
                                                            rarity={(tx as Sale).buyer.items[0]?.item.rarity}
                                                        />
                                                        <span className="text-white/80 font-medium text-xs">{(tx as Sale).buyer.name || (tx as Sale).buyer.username}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="hidden md:inline">{t('from')}</span>
                                                    <div className="flex items-center gap-2 p-1 pr-3 bg-white/5 rounded-full border border-white/5 hover:border-white/20 transition-colors">
                                                        <UserAvatar 
                                                            src={(tx as Tip).sender.image} 
                                                            alt={(tx as Tip).sender.username} 
                                                            size={20} 
                                                            rarity={(tx as Tip).sender.items[0]?.item.rarity}
                                                        />
                                                        <span className="text-white/80 font-medium text-xs">{(tx as Tip).sender.name || (tx as Tip).sender.username}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <span className="opacity-60 text-xs font-mono bg-white/5 px-2 py-0.5 rounded-md">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {tx.type === 'TIP' && (tx as Tip).message && (
                                        <div className="mt-3 text-sm bg-black/40 border border-white/5 p-3 rounded-xl italic text-zinc-400 relative">
                                            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-black/40 border-t border-l border-white/5 rotate-45" />
                                            &quot;{(tx as Tip).message}&quot;
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
