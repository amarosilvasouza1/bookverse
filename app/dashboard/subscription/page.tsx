'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, Star, Shield, Zap, Crown, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

type BillingPeriod = 'monthly' | 'yearly';

export default function SubscriptionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState<{status: string; plan: string} | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

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

  const handleSubscribe = async (plan: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingPeriod }),
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
    if (!confirm(t('cancelSubscriptionConfirm') || 'Are you sure you want to cancel? You will lose access immediately.')) return;
    
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
  
  const monthlyPrice = 9.99;
  const yearlyPrice = 99.99;
  const yearlySavings = Math.round((1 - (yearlyPrice / (monthlyPrice * 12))) * 100);
  const currentPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;

  const freeFeatures = [
    t('freeFeature1') || 'Access to free books',
    t('freeFeature2') || 'Create up to 3 books',
    t('freeFeature3') || 'Basic community features',
    t('freeFeature4') || 'Standard support',
  ];

  const premiumFeatures = [
    t('premiumFeature1') || 'Unlimited access to ALL books',
    t('premiumFeature2') || 'Unlimited book creation',
    t('premiumFeature3') || 'Advanced AI writing assistant',
    t('premiumFeature4') || 'Priority support 24/7',
    t('premiumFeature5') || 'Exclusive community badges',
    t('premiumFeature6') || 'Early access to new features',
    t('premiumFeature7') || 'Custom profile frames',
    t('premiumFeature8') || 'No ads ever',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 px-4 py-6 md:py-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
          <Crown className="w-4 h-4" />
          {t('upgradeToPremium') || 'Upgrade to Premium'}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-white via-purple-200 to-white/50 bg-clip-text text-transparent">
          {t('upgradeTitle') || 'Unlock Your Full Potential'}
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('upgradeSubtitle') || 'Get unlimited access to premium books, exclusive features, and support the platform.'}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium text-sm md:text-base transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {t('monthly') || 'Monthly'}
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium text-sm md:text-base transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {t('yearly') || 'Yearly'}
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{yearlySavings}%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="glass-card p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl flex flex-col relative overflow-hidden">
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-white">{t('freePlan') || 'Free'}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold text-white">$0</span>
              <span className="text-muted-foreground text-sm md:text-base">/{t('month') || 'month'}</span>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">{t('freeDescription') || 'Perfect for getting started'}</p>
          </div>

          <div className="space-y-3 md:space-y-4 flex-1">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 md:mt-8">
            <button 
              disabled
              className="w-full py-3 md:py-4 rounded-xl bg-white/5 text-white/50 font-medium cursor-not-allowed border border-white/5 text-sm md:text-base"
            >
              {t('currentPlan') || 'Current Plan'}
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="glass-card p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 border-purple-500/40 bg-purple-500/5 backdrop-blur-xl flex flex-col relative overflow-hidden group">
          {/* Popular Badge */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4">
            <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/25 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t('mostPopular') || 'MOST POPULAR'}
            </div>
          </div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-linear-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 relative">
            <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              {t('premiumPlan') || 'Premium'}
              <Star className="w-5 h-5 text-purple-400 fill-purple-400" />
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold text-white">${currentPrice.toFixed(2)}</span>
              <span className="text-muted-foreground text-sm md:text-base">/{billingPeriod === 'monthly' ? t('month') || 'month' : t('year') || 'year'}</span>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-green-400 text-sm font-medium">
                💰 {t('savingsText') || `You save $${((monthlyPrice * 12) - yearlyPrice).toFixed(2)}/year`}
              </p>
            )}
            <p className="text-purple-200/70 text-sm md:text-base">{t('premiumDescription') || 'For serious readers & writers'}</p>
          </div>

          <div className="space-y-3 md:space-y-4 flex-1 relative">
            {premiumFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-purple-400" />
                </div>
                <span className="leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 md:mt-8 relative">
            {isPremium ? (
              <button 
                onClick={handleCancel}
                disabled={processing}
                className="w-full py-3 md:py-4 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : t('cancelSubscription') || 'Cancel Subscription'}
              </button>
            ) : (
              <button 
                onClick={() => handleSubscribe('PREMIUM')}
                disabled={processing}
                className="w-full py-3 md:py-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t('subscribeNow') || 'Subscribe Now'}
                    <Zap className="w-4 h-4 fill-white" />
                  </>
                )}
              </button>
            )}
            <p className="text-center text-[10px] md:text-xs text-muted-foreground mt-3">
              {t('securePayment') || '🔒 Secure payment • Cancel anytime'}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto pt-4 md:pt-8">
        {[
          { icon: Shield, title: t('securePaymentTitle') || 'Secure Payment', desc: t('securePaymentDesc') || 'Your payment information is encrypted and secure.' },
          { icon: Zap, title: t('instantAccessTitle') || 'Instant Access', desc: t('instantAccessDesc') || 'Start reading premium content immediately after subscribing.' },
          { icon: Star, title: t('supportCreatorsTitle') || 'Support Creators', desc: t('supportCreatorsDesc') || 'Your subscription directly supports the authors you love.' }
        ].map((item, i) => (
          <div key={i} className="p-5 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-center space-y-2 md:space-y-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white/50" />
            </div>
            <h4 className="font-bold text-white text-sm md:text-base">{item.title}</h4>
            <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ or Money Back Guarantee */}
      <div className="text-center py-4 md:py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs md:text-sm font-medium">
          <Shield className="w-4 h-4" />
          {t('moneyBackGuarantee') || '30-day money-back guarantee'}
        </div>
      </div>
    </div>
  );
}
