import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth'; // Using signToken from lib/auth (which exports from lib/jwt)
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_APP_URL,
    } = process.env;

  if (error || !code) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
  }

  try {
    const redirectUri = `${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        console.error('Google Token Error:', tokenData);
        return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=google_token_error`);
    }

    const { access_token } = tokenData;

    // 2. Fetch User Profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
        console.error('Google User Error:', userData);
        return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=google_profile_error`);
    }

    const { email, name, picture } = userData;

    if (!email) {
        return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=google_no_email`);
    }

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
        // Create new user with random password
        const randomPassword = randomBytes(16).toString('hex');
        
        // Ensure username is unique
        let username = email.split('@')[0];
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            username = `${username}_${randomBytes(4).toString('hex')}`;
        }

        user = await prisma.user.create({
            data: {
                email,
                name: name || username,
                username,
                password: randomPassword, // Ideally hashed, but this is a random secure string that won't be used anyway
                image: picture,
                role: 'USER',
            }
        });
    }

    // 4. Create Session (Sign JWT - mimicking lib/auth/login/route.ts logic)
    // NOTE: We're reusing your custom JWT logic here.
    const token = await signToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });

    // 5. Set Cookie and Redirect
    const response = NextResponse.redirect(`${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`);
    
    response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Google Auth Exception:', error);
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=server_error`);
  }
}
