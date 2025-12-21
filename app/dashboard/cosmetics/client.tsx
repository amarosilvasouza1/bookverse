'use client';

import { useState } from 'react';
import { ShoppingBag, Shirt, Plus } from 'lucide-react';
import Link from 'next/link';
import { buyCosmetic, equipCosmetic } from '@/app/actions/cosmetics';
import { toast } from 'sonner';

// Mock User type since next-auth import might fail if types aren't set up
interface User {
    id: string;
    username?: string;
    email?: string;
    image?: string | null;
    ink?: number;
}

// ... rest of code

// Fix quote escaping at line 141 (in original) - search for "don't"
// <p className="text-zinc-500 col-span-full">You don&apos;t own any cosmetics yet.</p>

interface Cosmetic {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  author: { username: string };
}

interface UserCosmetic {
  id: string;
  cosmeticId: string;
  equipped: boolean;
  cosmetic: Cosmetic;
}

export default function CosmeticShopClient({ 
  user, 
  initialShop, 
  initialInventory 
}: { 
  user: User, 
  initialShop: Cosmetic[], 
  initialInventory: UserCosmetic[] 
}) {
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [buying, setBuying] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);

  const handleBuy = async (id: string, price: number) => {
    // @ts-ignore
    if ((user.ink || 0) < price) {
        toast.error("Not enough Ink!");
        return;
    }
    
    setBuying(id);
    const result = await buyCosmetic(user.id, id);
    if (result.success) {
        toast.success("Purchased!");
        // Typically we'd refresh or update state optimistically, relying on page refresh for now via router
        window.location.reload(); 
    } else {
        toast.error(result.error);
    }
    setBuying(null);
  };

  const handleEquip = async (userCosmeticId: string) => {
    setEquipping(userCosmeticId);
    const result = await equipCosmetic(user.id, userCosmeticId);
    if (result.success) {
        toast.success("Equipped!");
        window.location.reload();
    } else {
        toast.error(result.error);
    }
    setEquipping(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'shop' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Shop
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'inventory' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Shirt className="w-4 h-4" /> Inventory
        </button>
        <Link 
            href="/dashboard/cosmetics/create"
            className="ml-auto px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2 text-white"
        >
           <Plus className="w-4 h-4" /> Create Cosmetic
        </Link>
      </div>

      {activeTab === 'shop' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {initialShop.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-purple-500/50 transition-colors group">
               <div 
                 className="w-24 h-24 rounded-full bg-black/50 flex items-center justify-center relative overflow-hidden"
                 style={item.type === 'FRAME' ? { 
                    border: '4px solid transparent',
                    backgroundImage: `url(${item.image})`, // Simplified CSS application
                    backgroundSize: 'cover'
                 } : {}}
               >
                 {item.type === 'BUBBLE' && (
                    <div className="bg-zinc-800 p-2 rounded-lg text-[10px]" style={{ 
                        borderImage: `url(${item.image}) 30 fill` 
                    }}>
                        Chat Bubble
                    </div>
                 )}
                 {item.type === 'FRAME' && <div className="w-full h-full bg-zinc-800 rounded-full" />}
               </div>
               
               <div className="text-center w-full">
                  <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-zinc-500">by {item.author.username}</p>
               </div>

               <div className="mt-auto pt-2 w-full">
                 <button
                   onClick={() => handleBuy(item.id, item.price)}
                   disabled={buying === item.id}
                   className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                 >
                   {buying === item.id ? 'Buying...' : `${item.price} 💧`}
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
           {initialInventory.length === 0 && (
             <p className="text-zinc-500 col-span-full">You don't own any cosmetics yet.</p>
           )}
           {initialInventory.map((ui) => (
             <div key={ui.id} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
               <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center">
                   {/* Preview Mock */}
                   <span className="text-xs text-zinc-600">{ui.cosmetic.type}</span>
               </div>
               <h3 className="font-bold text-white text-sm">{ui.cosmetic.name}</h3>
               
               <button
                 onClick={() => handleEquip(ui.id)}
                 disabled={equipping === ui.id || ui.equipped}
                 className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                    ui.equipped 
                    ? 'bg-green-500/20 text-green-500 cursor-default'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                 }`}
               >
                 {ui.equipped ? 'Equipped' : equipping === ui.id ? 'Equipping...' : 'Equip'}
               </button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
