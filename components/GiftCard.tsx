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
      toast.success('Gift accepted!');
    } else {
      toast.error(result.error || 'Failed to accept gift');
    }
    setLoading(false);
  };

  const isPending = status === 'PENDING';
  const isExpired = new Date(expiresAt) < new Date();

  return (
    <div className={cn(
      "w-64 p-4 rounded-xl border relative overflow-hidden transition-all",
      isMe ? "bg-white/10 border-white/20" : "bg-zinc-900 border-zinc-800",
      status === 'ACCEPTED' ? "border-green-500/50" : ""
    )}>
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
          status === 'ACCEPTED' ? "bg-green-500 text-white" : 
          type === 'FRAME' ? "bg-purple-500 text-white" :
          type === 'BUBBLE' ? "bg-pink-500 text-white" :
          "bg-primary text-white"
        )}>
          {type === 'MONEY' && <DollarSign className="w-5 h-5" />}
          {type === 'FRAME' && <Palette className="w-5 h-5" />}
          {type === 'BUBBLE' && <MessageCircle className="w-5 h-5" />}
          {['MONEY', 'FRAME', 'BUBBLE'].indexOf(type) === -1 && <Gift className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">
            {type === 'MONEY' ? `Cash Gift` : 
             type === 'FRAME' ? 'Special Frame' :
             type === 'BUBBLE' ? 'Custom Bubble' :
             'Special Gift'}
          </h4>
          <p className="text-[10px] text-white/60">
            {isPending ? 'Waiting to be opened' : status}
          </p>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-3 mb-3 text-center relative z-10 border border-white/5">
        <p className="text-xl font-bold text-white tracking-widest wrap-break-word">
            {type === 'MONEY' && `$${data.amount}`}
            {type !== 'MONEY' && (data.name || 'Unknown Item')}
        </p>
        {type !== 'MONEY' && data.rarity && (
             <span className={cn(
                 "text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block",
                 data.rarity === 'LEGENDARY' ? "bg-yellow-500/20 text-yellow-500" :
                 data.rarity === 'EPIC' ? "bg-purple-500/20 text-purple-500" :
                 data.rarity === 'RARE' ? "bg-blue-500/20 text-blue-500" :
                 "bg-gray-500/20 text-gray-500"
             )}>{data.rarity}</span>
        )}
      </div>

      {!isMe && isPending && (
        <button
          onClick={handleAccept}
          disabled={loading || isExpired}
          className="w-full py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Opening...' : isExpired ? 'Expired' : 'Open Gift'}
        </button>
      )}

      {status === 'ACCEPTED' && (
        <div className="text-center text-green-400 text-xs font-bold flex items-center justify-center gap-1">
          <CheckCircle className="w-3 h-3" /> Collected
        </div>
      )}
      
      {status === 'RETURNED' && (
        <div className="text-center text-orange-400 text-xs font-bold flex items-center justify-center gap-1">
           <Clock className="w-3 h-3" /> Returned to sender
        </div>
      )}
    </div>
  );
}
