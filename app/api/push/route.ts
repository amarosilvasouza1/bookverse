import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime for web-push compatibility
export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push');

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@bookverse.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Internal function to send push - called from server actions
export async function POST(request: Request) {
  try {
    // Verify internal call (this endpoint should only be called from server actions)
    const authHeader = request.headers.get('x-internal-auth');
    if (authHeader !== process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, title, message, link } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Check if web push is configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Web push not configured' 
      });
    }

    // Get user's push subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'No subscription' 
      });
    }

    const sub = user.pushSubscription as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid subscription' 
      });
    }

    // Send the push notification
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      },
      JSON.stringify({
        title: title || 'BookVerse',
        message: message || 'You have a new notification',
        link: link || '/dashboard',
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push notification error:', error);
    
    // Handle expired subscription
    if (error instanceof Error) {
      if (error.message.includes('410') || error.message.includes('404')) {
        // Subscription expired - could clear it here if we had userId
        return NextResponse.json({ 
          success: false, 
          error: 'Subscription expired' 
        });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send notification' 
    });
  }
}

// Test endpoint
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    configured: !!(vapidPublicKey && vapidPrivateKey),
    vapidPublicKey: vapidPublicKey ? 'Set' : 'Not set',
    vapidPrivateKey: vapidPrivateKey ? 'Set' : 'Not set',
  });
}
