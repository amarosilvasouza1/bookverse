'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, CreditCard, Star, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'PREMIUM' }),
      });

      if (res.ok) {
        await fetchSubscription();
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to subscribe', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel? You will lose access immediately.')) return;
    
    setProcessing(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchSubscription();
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to cancel', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPremium = subscription?.status === 'ACTIVE' && subscription?.plan === 'PREMIUM';

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          Upgrade Your Experience
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock unlimited access to premium books, exclusive features, and support the platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl flex flex-col relative overflow-hidden">
          <div className="space-y-4 mb-8">
            <h3 className="text-2xl font-bold text-white">Free</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">Perfect for getting started</p>
          </div>

          <div className="space-y-4 flex-1">
            {['Access to free books', 'Create up to 3 books', 'Basic community features', 'Standard support'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button 
              disabled
              className="w-full py-4 rounded-xl bg-white/5 text-white/50 font-medium cursor-not-allowed border border-white/5"
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/25">
              POPULAR
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="space-y-4 mb-8 relative">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              Premium
              <Star className="w-5 h-5 text-purple-400 fill-purple-400" />
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-purple-200/70">For serious readers & writers</p>
          </div>

          <div className="space-y-4 flex-1 relative">
            {[
              'Unlimited access to ALL books',
              'Unlimited book creation',
              'Advanced AI writing assistant',
              'Priority support',
              'Exclusive community badges',
              'Early access to new features'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-purple-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8 relative">
            {isPremium ? (
              <button 
                onClick={handleCancel}
                disabled={processing}
                className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Subscription'}
              </button>
            ) : (
              <button 
                onClick={handleSubscribe}
                disabled={processing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Subscribe Now
                    <Zap className="w-4 h-4 fill-white" />
                  </>
                )}
              </button>
            )}
            <p className="text-center text-xs text-muted-foreground mt-3">
              Secure payment via Stripe • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
        {[
          { icon: Shield, title: 'Secure Payment', desc: 'Your payment information is encrypted and secure.' },
          { icon: Zap, title: 'Instant Access', desc: 'Start reading premium content immediately after subscribing.' },
          { icon: Star, title: 'Support Creators', desc: 'Your subscription directly supports the authors you love.' }
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <item.icon className="w-6 h-6 text-white/50" />
            </div>
            <h4 className="font-bold text-white">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
