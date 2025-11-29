'use client';

import { useState } from 'react';
import { ShoppingBag, Backpack } from 'lucide-react';
import StoreSection from '../components/StoreSection';
import InventorySection from '../components/InventorySection';

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<'store' | 'inventory'>('store');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-pink-500" />
          Item Store
        </h1>
        <p className="text-zinc-400">
          Browse exclusive frames and manage your inventory.
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('store')}
            className={`pb-4 px-2 font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'store' ? 'text-pink-500' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Store
            {activeTab === 'store' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 px-2 font-bold transition-all relative flex items-center gap-2 ${
              activeTab === 'inventory' ? 'text-pink-500' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Backpack className="w-4 h-4" />
            Inventory
            {activeTab === 'inventory' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'store' ? <StoreSection /> : <InventorySection />}
        </div>
      </div>
    </div>
  );
}
