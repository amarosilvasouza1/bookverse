'use client';

import { useState, useEffect } from 'react';
import { getUserInventory, equipItem, unequipItem } from '@/app/actions/store';
import { Loader2, Backpack, Check } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

type UserItem = {
  id: string;
  itemId: string;
  equipped: boolean;
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
  };
};

export default function InventorySection() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const res = await getUserInventory();
    if (res.success && res.items) {
      setItems(res.items);
    }
    setLoading(false);
  };

  const handleEquip = async (userItem: UserItem) => {
    setProcessing(userItem.id);
    try {
      if (userItem.equipped) {
        await unequipItem(userItem.item.id);
      } else {
        await equipItem(userItem.item.id);
      }
      await loadInventory(); // Reload to update UI state
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(null);
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

  if (items.length === 0) {
    return (
      <div className="text-center p-12 glass-card rounded-2xl border border-white/10 bg-black/20">
        <Backpack className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Empty Inventory</h3>
        <p className="text-zinc-400">Go to the Store to buy some cool frames!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Backpack className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Inventory</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((userItem) => (
          <div key={userItem.id} className={`glass-card p-4 rounded-2xl border transition-all ${userItem.equipped ? 'border-primary bg-primary/10' : 'border-white/10 bg-black/40'}`}>
            <div className="flex justify-center my-4">
              <UserAvatar 
                src={null} 
                alt={userItem.item.name} 
                size={80} 
                rarity={userItem.item.type === 'FRAME' ? userItem.item.rarity : undefined}
                className="bg-zinc-800"
              />
            </div>

            <h3 className="text-center font-bold text-white mb-1 truncate">{userItem.item.name}</h3>
            <p className="text-center text-xs text-zinc-500 mb-4">{userItem.item.type}</p>

            <button
              onClick={() => handleEquip(userItem)}
              disabled={!!processing}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                userItem.equipped 
                  ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {processing === userItem.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : userItem.equipped ? (
                <>Unequip</>
              ) : (
                <>Equip</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
