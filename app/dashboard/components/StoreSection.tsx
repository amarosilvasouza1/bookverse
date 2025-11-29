'use client';

import { useState, useEffect } from 'react';
import { getStoreItems, buyItem } from '@/app/actions/store';
import { Loader2, ShoppingBag, Sparkles } from 'lucide-react';


type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  rarity: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export default function StoreSection() {
  const [items, setItems] = useState<Item[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const res = await getStoreItems();
    if (res.success && res.items) {
      setItems(res.items);
      if (res.userBalance !== undefined) {
        setUserBalance(res.userBalance);
      }
    }
    setLoading(false);
  };

  const handleBuy = async (item: Item) => {
    setBuying(item.id);
    setMessage(null);
    
    try {
      const res = await buyItem(item.id);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Purchased!' });
        setUserBalance(prev => prev - item.price); // Update local balance
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to buy' });
      }
    } catch {
      setMessage({ type: 'error', text: 'System error' });
    } finally {
      setBuying(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'border-zinc-500 text-zinc-400';
      case 'RARE': return 'border-blue-500 text-blue-400';
      case 'EPIC': return 'border-purple-500 text-purple-400';
      case 'LEGENDARY': return 'border-yellow-500 text-yellow-400';
      default: return 'border-zinc-500';
    }
  };

  const getFrameClass = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'frame-common';
      case 'RARE': return 'frame-rare';
      case 'EPIC': return 'frame-epic';
      case 'LEGENDARY': return 'frame-legendary';
      case 'COSMIC': return 'frame-cosmic';
      default: return '';
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-white">Store</h2>
        </div>
        <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold font-mono">
          Balance: ${userBalance.toFixed(2)}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className={`glass-card p-6 rounded-2xl border transition-all hover:scale-[1.02] ${getRarityColor(item.rarity)} bg-black/40`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getRarityColor(item.rarity)} bg-black/50`}>
                  {item.rarity}
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                ${item.price}
              </div>
            </div>

            <div className="flex justify-center my-8">
              <div className={`w-24 h-24 rounded-full bg-zinc-800 ${getFrameClass(item.rarity)}`}>
                 {/* Preview Placeholder */}
                 <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-600">
                    Preview
                 </div>
              </div>
            </div>

            <p className="text-sm text-zinc-400 mb-6 min-h-[40px]">{item.description}</p>

            <button
              onClick={() => handleBuy(item)}
              disabled={buying === item.id || userBalance < item.price}
              className={`w-full py-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
                userBalance < item.price 
                  ? 'bg-white/5 border-white/5 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              {buying === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {userBalance < item.price ? 'Insufficient Funds' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
