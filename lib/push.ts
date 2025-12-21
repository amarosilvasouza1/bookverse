import { prisma } from '@/lib/prisma';

// Helper to send push to a single user
// We use require here because web-push might not have types or we want to ensure Node logic
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push');

export async function sendPushToUser(userId: string, payload: { title: string; message: string; link: string }) {
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@bookverse.com';

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { sent: false, error: 'Not configured' };
  }

  // Set VAPID details (safe to call multiple times internally by web-push, or check if set? 
  // web-push stores it globally. It's better to set it once, but valid to set here in serverless context)
  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.error('Failed to set VAPID details:', err);
    return { sent: false, error: 'VAPID configuration error' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true }
    });

    if (!user?.pushSubscription) return { sent: false, error: 'No subscription' };

    const sub = user.pushSubscription as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return { sent: false, error: 'Invalid subscription' };
    }

    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      },
      JSON.stringify(payload)
    );

    return { sent: true };
  } catch (error) {
    console.error(`Failed to send push to user ${userId}:`, error);
    // Silent fail for individual errors to not block the batch
    return { sent: false, error: 'Send failed' };
  }
}
