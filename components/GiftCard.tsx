'use client';

import { useState } from 'react';
import { Gift, CheckCircle, Clock, DollarSign, Palette, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { acceptGift } from '@/app/actions/gift';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface GiftCardProps {
  giftId: string;
  type: string;
  data: { amount?: number; name?: string; rarity?: string; [key: string]: unknown }; // Improved type
  status: string; // PENDING, ACCEPTED, REJECTED, RETURNED
  isMe: boolean;
  expiresAt: string;
}

export default function GiftCard({ giftId, type, data, status: initialStatus, isMe, expiresAt }: GiftCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (status !== 'PENDING') return;
    setLoading(true);
    
    // Play confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const result = await acceptGift(giftId);
    if (result.success) {
      setStatus('ACCEPTED');
      toast.success('Presente aceito!');
    } else {
      toast.error(result.error || 'Falha ao aceitar presente');
    }
    setLoading(false);
  };

  const isPending = status === 'PENDING';
  const isExpired = new Date(expiresAt) < new Date();

  // Get gradient based on type
  const getGradient = () => {
    if (status === 'ACCEPTED') return 'from-emerald-500/20 via-green-500/10 to-teal-500/20';
    switch (type) {
      case 'MONEY': return 'from-yellow-500/20 via-amber-500/10 to-orange-500/20';
      case 'FRAME': return 'from-purple-500/20 via-violet-500/10 to-indigo-500/20';
      case 'BUBBLE': return 'from-pink-500/20 via-rose-500/10 to-red-500/20';
      default: return 'from-blue-500/20 via-cyan-500/10 to-teal-500/20';
    }
  };

  const getBorderGlow = () => {
    if (status === 'ACCEPTED') return 'border-emerald-500/50 shadow-emerald-500/20';
    switch (type) {
      case 'MONEY': return 'border-yellow-500/30 shadow-yellow-500/10';
      case 'FRAME': return 'border-purple-500/30 shadow-purple-500/10';
      case 'BUBBLE': return 'border-pink-500/30 shadow-pink-500/10';
      default: return 'border-blue-500/30 shadow-blue-500/10';
    }
  };

  const getIconGradient = () => {
    if (status === 'ACCEPTED') return 'from-emerald-400 to-green-500';
    switch (type) {
      case 'MONEY': return 'from-yellow-400 to-amber-500';
      case 'FRAME': return 'from-purple-400 to-violet-500';
      case 'BUBBLE': return 'from-pink-400 to-rose-500';
      default: return 'from-blue-400 to-cyan-500';
    }
  };

  return (
    <div className={cn(
      "w-40 rounded-xl border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group",
      "bg-linear-to-br backdrop-blur-xl shadow-lg",
      getGradient(),
      getBorderGlow()
    )}>
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Sparkle decorations */}
      <div className="absolute top-1 right-1 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
      <div className="absolute top-3 right-3 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse delay-300" />
      
      {/* Main content */}
      <div className="relative z-10 p-3">
        {/* Header with icon */}
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg bg-linear-to-br",
            getIconGradient(),
            isPending && "animate-pulse"
          )}>
            {type === 'MONEY' && <DollarSign className="w-4 h-4 text-white drop-shadow-sm" />}
            {type === 'FRAME' && <Palette className="w-4 h-4 text-white drop-shadow-sm" />}
            {type === 'BUBBLE' && <MessageCircle className="w-4 h-4 text-white drop-shadow-sm" />}
            {['MONEY', 'FRAME', 'BUBBLE'].indexOf(type) === -1 && <Gift className="w-4 h-4 text-white drop-shadow-sm" />}
          </div>
          <div>
            <h4 className="font-bold text-white text-xs leading-tight drop-shadow-sm">
              {type === 'MONEY' ? '💰 Cash' : 
               type === 'FRAME' ? '🖼️ Frame' :
               type === 'BUBBLE' ? '💬 Bubble' :
               '🎁 Gift'}
            </h4>
            <p className="text-[8px] text-white/70">
              {isPending ? '✨ Tap to open' : status === 'ACCEPTED' ? '✓ Opened' : status}
            </p>
          </div>
        </div>

        {/* Value display */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 mb-2 text-center border border-white/10">
          <p className="text-base font-black text-white tracking-wide drop-shadow-sm">
              {type === 'MONEY' && `$${data.amount}`}
              {type !== 'MONEY' && (data.name || 'Mystery Item')}
          </p>
          {type !== 'MONEY' && data.rarity && (
               <span className={cn(
                   "text-[7px] px-2 py-0.5 rounded-full mt-1 inline-block font-bold uppercase tracking-wider",
                   data.rarity === 'LEGENDARY' ? "bg-linear-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border border-yellow-500/30" :
                   data.rarity === 'EPIC' ? "bg-linear-to-r from-purple-500/30 to-violet-500/30 text-purple-300 border border-purple-500/30" :
                   data.rarity === 'RARE' ? "bg-linear-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-500/30" :
                   "bg-white/10 text-gray-300 border border-white/10"
               )}>{data.rarity}</span>
          )}
        </div>

        {/* Action button */}
        {!isMe && isPending && (
          <button
            onClick={handleAccept}
            disabled={loading || isExpired}
            className={cn(
              "w-full py-2 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1",
              "bg-linear-to-r shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
              getIconGradient(),
              (loading || isExpired) && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? '✨ Opening...' : isExpired ? '⏰ Expired' : '🎁 Open Gift'}
          </button>
        )}

        {/* Status indicators */}
        {status === 'ACCEPTED' && (
          <div className="text-center py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
            <span className="text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" /> Collected!
            </span>
          </div>
        )}
        
        {status === 'RETURNED' && (
          <div className="text-center py-1 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <span className="text-orange-300 text-[10px] font-bold flex items-center justify-center gap-1">
               <Clock className="w-3 h-3" /> Returned
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
