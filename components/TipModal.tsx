'use client';

import { useState } from 'react';
import { X, DollarSign, Send } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function TipModal({ isOpen, onClose, username }: TipModalProps) {
  const [amount, setAmount] = useState('5');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTip = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, message }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Tip failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Send a Tip
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <DollarSign className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Thank You!</h4>
            <p className="text-zinc-400">Your tip has been sent successfully.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {['2', '5', '10'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-3 rounded-xl border font-bold transition-all ${amount === amt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Custom Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a nice message..."
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 min-h-[80px] focus:outline-none focus:border-emerald-500/50 transition-colors"
            />

            <button
              onClick={handleTip}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : `Send $${amount}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
