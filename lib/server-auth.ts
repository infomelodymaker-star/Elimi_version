import { NextRequest } from 'next/server';
import firebaseConfigData from '../firebase-applet-config.json';

/**
 * Validates a Firebase Auth JWT token server-side in Next.js route handlers.
 * Verifies issuer, audience (projectId), expiration, and user ID.
 */
export interface AuthUser {
  uid: string;
  email?: string;
}

export async function verifyServerAuth(req: NextRequest): Promise<{ authenticated: boolean; user?: AuthUser; error?: string }> {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing or malformed Authorization header' };
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      return { authenticated: false, error: 'Empty token provided' };
    }

    // Split JWT into components
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { authenticated: false, error: 'Invalid JWT structure' };
    }

    // Decode header and payload safely
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    const nowSec = Math.floor(Date.now() / 1000);

    // Validate expiration
    if (payload.exp && payload.exp < nowSec) {
      return { authenticated: false, error: 'Token expired' };
    }

    // Validate audience / projectId
    const expectedProjectId = firebaseConfigData.projectId;
    if (payload.aud !== expectedProjectId) {
      return { authenticated: false, error: `Invalid token audience (${payload.aud} !== ${expectedProjectId})` };
    }

    // Validate issuer
    const expectedIss = `https://securetoken.google.com/${expectedProjectId}`;
    if (payload.iss !== expectedIss) {
      return { authenticated: false, error: `Invalid token issuer` };
    }

    // Validate user ID
    const uid = payload.user_id || payload.sub;
    if (!uid || typeof uid !== 'string') {
      return { authenticated: false, error: 'Missing user ID in token claims' };
    }

    return {
      authenticated: true,
      user: {
        uid,
        email: payload.email || undefined,
      },
    };
  } catch (err: any) {
    return { authenticated: false, error: err?.message || 'Token verification failed' };
  }
}
