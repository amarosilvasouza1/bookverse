'use client';

import { useState } from 'react';
import { X, ShoppingBag, Backpack } from 'lucide-react';
import StoreSection from './StoreSection';
import InventorySection from './InventorySection';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreModal({ isOpen, onClose }: StoreModalProps) {
  const [activeTab, setActiveTab] = useState<'store' | 'inventory'>('store');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 text-lg font-bold transition-colors ${
                activeTab === 'store' ? 'text-primary' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Store
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 text-lg font-bold transition-colors ${
                activeTab === 'inventory' ? 'text-primary' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Backpack className="w-5 h-5" />
              Inventory
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/40">
          {activeTab === 'store' ? <StoreSection /> : <InventorySection />}
        </div>
      </div>
    </div>
  );
}
