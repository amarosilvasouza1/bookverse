import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const {
    GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_APP_URL,
  } = process.env;

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google Client ID not found' }, { status: 500 });
  }

  const redirectUri = `${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
