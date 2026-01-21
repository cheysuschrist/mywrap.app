import { SignJWT, jwtVerify } from 'jose';
import { createClient } from '@vercel/kv';

// KV client setup
const kvUrl = process.env.KV_REST_API_URL || process.env.mywrap_KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.mywrap_KV_REST_API_TOKEN;
export const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null;

// JWT secret as Uint8Array for jose
const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

// Cookie configuration
const COOKIE_NAME = 'mywrap_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Create JWT token
export async function createToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
  return token;
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export function setAuthCookie(res, token) {
  const cookieValue = `${COOKIE_NAME}=${token}; HttpOnly; ${COOKIE_OPTIONS.secure ? 'Secure;' : ''} SameSite=${COOKIE_OPTIONS.sameSite}; Path=${COOKIE_OPTIONS.path}; Max-Age=${COOKIE_OPTIONS.maxAge}`;
  res.setHeader('Set-Cookie', cookieValue);
}

// Clear auth cookie
export function clearAuthCookie(res) {
  const cookieValue = `${COOKIE_NAME}=; HttpOnly; ${COOKIE_OPTIONS.secure ? 'Secure;' : ''} SameSite=${COOKIE_OPTIONS.sameSite}; Path=${COOKIE_OPTIONS.path}; Max-Age=0`;
  res.setHeader('Set-Cookie', cookieValue);
}

// Parse cookies from request
export function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie || '';
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = value;
    }
  });
  return cookies;
}

// Get current user from request
export async function getCurrentUser(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  // Fetch fresh user data from Redis
  if (kv) {
    const userData = await kv.hgetall(`user:${payload.sub}`);
    if (userData) {
      return {
        id: payload.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        tier: userData.tier || 'free',
        stripeCustomerId: userData.stripeCustomerId,
        subscriptionStatus: userData.subscriptionStatus,
      };
    }
  }

  // Fallback to JWT payload if Redis unavailable
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    tier: payload.tier || 'free',
  };
}

// Get user's wrap count
export async function getUserWrapCount(userId) {
  if (!kv) return 0;
  return await kv.zcard(`user:${userId}:wraps`) || 0;
}

// Free tier limit
export const FREE_TIER_LIMIT = 2;
