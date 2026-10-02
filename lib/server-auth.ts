import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin';

/**
 * Validates a Firebase Auth JWT token server-side in Next.js route handlers.
 * Verifies signatures, issuer, audience, and expiration using Firebase Admin SDK.
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

    // Verify token cryptographically using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken.uid) {
      return { authenticated: false, error: 'Missing user ID in token claims' };
    }

    return {
      authenticated: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || undefined,
      },
    };
  } catch (err: any) {
    return { authenticated: false, error: err?.message || 'Token verification failed' };
  }
}
