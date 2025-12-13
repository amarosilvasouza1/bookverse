import { SignJWT, jwtVerify } from 'jose';

function getSecretKey(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not defined. Please set it in your .env file.');
  }
  return new TextEncoder().encode(secretKey);
}

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

