'use server';

interface PushPayload {
  title: string;
  message: string;
  link?: string;
}

/**
 * Send a web push notification to a user via internal API
 * This wraps the call to /api/push which has Node.js runtime for web-push
 */
export async function sendWebPush(
  userId: string,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the base URL from environment or construct it
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-auth': process.env.JWT_SECRET || '',
      },
      body: JSON.stringify({
        userId,
        title: payload.title,
        message: payload.message,
        link: payload.link,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send web push:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
