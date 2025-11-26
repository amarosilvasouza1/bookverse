import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken } from './jwt';

export { signToken, verifyToken };

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return;

  // Refresh session if needed
  const parsed = await verifyToken(token);
  if (!parsed) return;
  
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await signToken(parsed),
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return res;
}
