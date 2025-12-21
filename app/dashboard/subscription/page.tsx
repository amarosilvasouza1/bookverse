'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, Star, Shield, Zap, Crown, Sparkles, X, ChevronRight, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
        </div>
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
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header - Cleaner Version */}
        <div className="text-center space-y-6 mb-12 md:mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs md:text-sm font-semibold tracking-wide uppercase"
          >
            <Crown className="w-3.5 h-3.5" />
            {t('upgradeToPremium') || 'Premium Membership'}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl mx-auto"
          >
            {t('upgradeTitle') || 'Unlock Your Full Potential'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t('upgradeSubtitle') || 'Join thousands of creators and readers. Get unlimited access, AI tools, and exclusive perks.'}
          </motion.p>
        </div>

        {/* Billing Toggle - Simpler */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <div className="p-1 bg-zinc-900 border border-white/10 rounded-xl flex items-center relative">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10",
                billingPeriod === 'monthly' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t('monthly') || 'Monthly'}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 flex items-center gap-2",
                billingPeriod === 'yearly' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t('yearly') || 'Yearly'}
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-md border border-emerald-500/20 font-bold">
                -{yearlySavings}%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
          {/* Free Plan - Cleaner */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl p-8 border border-white/10 bg-black/20"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{t('freePlan') || 'Starter'}</h3>
              <p className="text-zinc-500 text-sm">Essentials for casual readers.</p>
            </div>
            
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-zinc-500">/{t('month') || 'mo'}</span>
            </div>

            <div className="space-y-4 mb-8">
              {freeFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-zinc-400">
                  <Check className="w-5 h-5 text-zinc-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              disabled 
              className="w-full py-3 rounded-xl bg-zinc-800/50 text-zinc-500 font-medium border border-white/5 cursor-not-allowed"
            >
              {t('currentPlan') || 'Current Plan'}
            </button>
          </motion.div>

          {/* Premium Plan - Cleaner */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="group relative rounded-3xl p-8 border border-purple-500/30 bg-zinc-900/40 overflow-hidden"
          >
             {/* Subtle Glow Only */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="absolute top-6 right-6">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-bold">
                 MOST POPULAR
               </span>
            </div>

            <div className="mb-6 relative">
              <div className="flex items-center gap-2 mb-2">
                 <h3 className="text-xl font-bold text-white">{t('premiumPlan') || 'Premium'}</h3>
                 <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-zinc-400 text-sm">Unlock the full experience.</p>
            </div>
            
            <div className="mb-6 relative">
              <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold text-white">${currentPrice.toFixed(2)}</span>
                 <span className="text-zinc-500">/{billingPeriod === 'monthly' ? t('month') || 'mo' : t('year') || 'yr'}</span>
              </div>
              {billingPeriod === 'yearly' && (
                 <p className="text-emerald-400 text-sm font-medium mt-1">
                   Save ${(monthlyPrice * 12 - yearlyPrice).toFixed(2)} a year
                 </p>
              )}
            </div>

            <div className="space-y-4 mb-8 relative">
              {premiumFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="relative">
              {isPremium ? (
                 <button 
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                     <>
                        <X className="w-4 h-4" />
                        {t('cancelSubscription') || 'Cancel Subscription'}
                     </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => handleSubscribe('PREMIUM')}
                  disabled={processing}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {t('subscribeNow') || 'Get Started'}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              )}
              <p className="text-center text-xs text-zinc-500 mt-4">
                 {t('securePayment') || 'Secure payment • Cancel anytime'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Features / Benefits Grid */}
        <div className="mt-20 max-w-5xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BenefitCard 
                 icon={Shield} 
                 title="Secure & Private" 
                 desc="Your data is encrypted and transactions are secure." 
                 delay={0.6}
              />
              <BenefitCard 
                 icon={Zap} 
                 title="Instant Access" 
                 desc="Features are unlocked the moment you subscribe." 
                 delay={0.7}
              />
              <BenefitCard 
                 icon={Star} 
                 title="Support Creators" 
                 desc="Directly contribute to the future of the platform." 
                 delay={0.8}
              />
           </div>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, desc, delay }: { icon: LucideIcon; title: string; desc: string; delay: number }) {
   return (
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay }}
         className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 text-center group hover:bg-zinc-900/50 transition-colors"
      >
         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
         </div>
         <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
         <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
      </motion.div>
   );
}
