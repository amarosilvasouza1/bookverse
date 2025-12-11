'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { subscribeToPush, unsubscribeFromPush, getPushStatus } from '@/app/actions/push-notifications';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

// VAPID public key - you need to generate this and set it in your environment
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationToggle() {
  const { t } = useLanguage();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      // Check if push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setLoading(false);
        return;
      }

      const status = await getPushStatus();
      setIsSubscribed(status.subscribed);
      setLoading(false);
    };
    checkStatus();
  }, []);

  const handleToggle = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    setProcessing(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const result = await unsubscribeFromPush();
        if (result.success) {
          setIsSubscribed(false);
          toast.success(t('pushDisabled'));
        }
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Notification permission denied');
          setProcessing(false);
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        const subJson = subscription.toJSON();
        const result = await subscribeToPush({
          endpoint: subJson.endpoint!,
          keys: {
            p256dh: subJson.keys!.p256dh,
            auth: subJson.keys!.auth
          }
        });

        if (result.success) {
          setIsSubscribed(true);
          toast.success(t('pushEnabled'));
        } else {
          toast.error(result.error || 'Failed to subscribe');
        }
      }
    } catch (error) {
      console.error('Push toggle error:', error);
      toast.error('Failed to update notification settings');
    }

    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        <span className="text-sm text-zinc-400">Loading...</span>
      </div>
    );
  }

  // Check if push is supported
  if (typeof window !== 'undefined' && (!('serviceWorker' in navigator) || !('PushManager' in window))) {
    return null; // Don't show if not supported
  }

  return (
    <button
      onClick={handleToggle}
      disabled={processing}
      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all
        ${isSubscribed 
          ? 'bg-primary/10 border-primary/30 text-white' 
          : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
    >
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        <div className="text-left">
          <p className="text-sm font-medium">{t('pushNotifications')}</p>
          <p className="text-xs text-zinc-500">
            {isSubscribed ? t('pushEnabledDesc') : t('pushDisabledDesc')}
          </p>
        </div>
      </div>
      
      {processing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${isSubscribed ? 'bg-primary' : 'bg-zinc-700'}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${isSubscribed ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
      )}
    </button>
  );
}
