'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { User, signOut, deleteUser } from 'firebase/auth';
import { useState as ReactState, useEffect as ReactEffect } from 'react';

export const MAX_ALLOWED_ACCOUNTS = 5;
export const USERS_COLLECTION = 'users';
export const REGISTRY_DOC = 'system_metadata/auth_registry';
export const GENERIC_AUTH_ERROR = 'An error occurred. Please try again later.';
const LOCAL_CACHE_KEY = 'elimi_registered_accounts_cache';

export interface RegisteredAccount {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  authProvider: 'password' | 'google' | 'other';
  slotNumber: number; // 1 to 5
  status?: 'approved' | 'pending';
  isSuperAdmin?: boolean;
}

interface AuthRegistryDoc {
  registeredEmails: string[];
  registeredUids: string[];
  accountCount: number;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallbackValue);
      }
    }, timeoutMs);

    promise
      .then((res) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        console.warn('Promise timed out or failed:', err);
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fallbackValue);
        }
      });
  });
}

function getLocalCachedAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read local cache:', e);
  }
  return [];
}

export const USERS_SYNC_EVENT = 'elimi_sync_users';

function saveLocalCachedAccounts(accounts: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new Event(USERS_SYNC_EVENT));
  } catch (e) {
    console.warn('Failed to save local cache:', e);
  }
}

/**
 * Fetch all registered accounts from Firestore with registry synchronization.
 */
export async function getRegisteredAccounts(): Promise<RegisteredAccount[]> {
  const cached = getLocalCachedAccounts();
  try {
    const fetchFirestore = async (): Promise<RegisteredAccount[]> => {
      const usersRef = collection(db, USERS_COLLECTION);
      const snap = await getDocs(usersRef);
      const users: RegisteredAccount[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as RegisteredAccount;
        users.push({
          ...data,
          uid: docSnap.id,
        });
      });

      // Also check registry doc
      try {
        const regDocRef = doc(db, 'system_metadata', 'auth_registry');
        const regSnap = await getDoc(regDocRef);
        if (regSnap.exists()) {
          const regData = regSnap.data() as AuthRegistryDoc;
          if (Array.isArray(regData.registeredEmails)) {
            // If registry has more accounts recorded, ensure count consistency
            for (const email of regData.registeredEmails) {
              if (!users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
                users.push({
                  uid: `reg-${email}`,
                  email: email,
                  displayName: email.split('@')[0],
                  createdAt: new Date().toISOString(),
                  authProvider: 'other',
                  slotNumber: users.length + 1,
                });
              }
            }
          }
        }
      } catch (regErr) {
        console.warn('Registry check warning:', regErr);
      }

      const sorted = users.sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));
      saveLocalCachedAccounts(sorted);
      return sorted;
    };

    return await withTimeout(fetchFirestore(), 2000, cached);
  } catch (err) {
    console.warn('Fallback fetching accounts:', err);
    return cached;
  }
}

/**
 * Check whether a user with given UID or email is already registered.
 */
export async function checkUserRegistration(uid: string, email?: string | null): Promise<{
  isRegistered: boolean;
  account?: RegisteredAccount;
  totalRegistered: number;
}> {
  try {
    const existingAccounts = await getRegisteredAccounts();
    const foundByUid = existingAccounts.find((u) => u.uid === uid);
    if (foundByUid) {
      return { isRegistered: true, account: foundByUid, totalRegistered: existingAccounts.length };
    }

    if (email) {
      const foundByEmail = existingAccounts.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (foundByEmail) {
        return { isRegistered: true, account: foundByEmail, totalRegistered: existingAccounts.length };
      }
    }

    return { isRegistered: false, totalRegistered: existingAccounts.length };
  } catch (err) {
    console.warn('Error checking user registration:', err);
    const cached = getLocalCachedAccounts();
    const found = cached.find((u) => u.uid === uid || (email && u.email.toLowerCase() === email.toLowerCase()));
    return {
      isRegistered: !!found,
      account: found,
      totalRegistered: cached.length,
    };
  }
}

/**
 * Sync centralized registry document in Firestore.
 */
async function syncRegistry(accounts: RegisteredAccount[]): Promise<void> {
  try {
    const regDocRef = doc(db, 'system_metadata', 'auth_registry');
    const emails = Array.from(new Set(accounts.map((a) => a.email.toLowerCase()).filter(Boolean)));
    const uids = Array.from(new Set(accounts.map((a) => a.uid).filter(Boolean)));
    await withTimeout(
      setDoc(
        regDocRef,
        {
          registeredEmails: emails,
          registeredUids: uids,
          accountCount: accounts.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
      8000,
      null
    );
  } catch (e) {
    console.warn('Could not sync auth_registry doc:', e);
  }
}

/**
 * Attempt to register or authorize a user strictly within the 5-account limit.
 * Any attempt by a 6th account (Email or Google Sign-In with a new email)
 * immediately deletes the unapproved auth session and returns a generic discreet error.
 */
export async function registerUserWithQuotaCheck(
  user: User,
  authProvider: 'password' | 'google' | 'other' = 'password'
): Promise<{ success: boolean; error?: string; account?: RegisteredAccount }> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    let existingDocData: RegisteredAccount | null = null;

    try {
      const docSnap = await withTimeout(getDoc(userDocRef), 8000, null as any);
      if (docSnap && docSnap.exists()) {
        existingDocData = docSnap.data() as RegisteredAccount;
      }
    } catch (e) {
      console.warn('Doc check fallback:', e);
    }

    // If user document already exists in Firestore, user is an authorized account
    if (existingDocData) {
      return {
        success: true,
        account: existingDocData,
      };
    }

    // Fetch all current accounts directly from Firestore
    const allAccounts = await getRegisteredAccounts();

    // Check if user is already present by UID in list
    const existingByUid = allAccounts.find((a) => a.uid === user.uid);
    if (existingByUid) {
      return { success: true, account: existingByUid };
    }

    // Check if user matches an existing slot by email (e.g. authorized email using Google login)
    if (user.email) {
      const byEmail = allAccounts.find(
        (a) => a.email.toLowerCase() === user.email?.toLowerCase()
      );
      if (byEmail) {
        const updatedAccount: RegisteredAccount = {
          ...byEmail,
          uid: user.uid,
          photoURL: user.photoURL || byEmail.photoURL,
          displayName: user.displayName || byEmail.displayName,
        };
        try {
          await withTimeout(setDoc(userDocRef, updatedAccount, { merge: true }), 8000, null);
        } catch (setErr) {
          console.warn('Set doc warning:', setErr);
        }
        const updatedList = allAccounts.map((a) => (a.uid === byEmail.uid ? updatedAccount : a));
        saveLocalCachedAccounts(updatedList);
        await syncRegistry(updatedList);
        return { success: true, account: updatedAccount };
      }
    }

    // STRICT 5-ACCOUNT LIMIT:
    // If 5 accounts already exist and this is a NEW email/user (including Google login with new email)
    if (allAccounts.length >= MAX_ALLOWED_ACCOUNTS) {
      try {
        await deleteUser(user);
      } catch (delErr) {
        console.warn('Could not delete unapproved user:', delErr);
      }

      try {
        await signOut(auth);
      } catch (sErr) {
        console.warn('Signout error:', sErr);
      }

      return {
        success: false,
        error: GENERIC_AUTH_ERROR,
      };
    }

    // Find next available slot number (1 to 5)
    const usedSlots = new Set(allAccounts.map((a) => a.slotNumber));
    let nextSlot = 1;
    for (let i = 1; i <= MAX_ALLOWED_ACCOUNTS; i++) {
      if (!usedSlots.has(i)) {
        nextSlot = i;
        break;
      }
    }

    const isSuperAdmin = nextSlot === 1 || allAccounts.length === 0;
    const initialStatus: 'approved' | 'pending' = isSuperAdmin ? 'approved' : 'pending';

    const newAccount: RegisteredAccount = {
      uid: user.uid,
      email: user.email || 'no-email@elimi.app',
      displayName: user.displayName || user.email?.split('@')[0] || `User #${nextSlot}`,
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString(),
      authProvider,
      slotNumber: nextSlot,
      status: initialStatus,
      isSuperAdmin,
    };

    // Store the new authorized account in Firestore
    try {
      await withTimeout(setDoc(userDocRef, newAccount, { merge: true }), 8000, null);
    } catch (setErr) {
      console.warn('Store user doc warning:', setErr);
    }

    const updatedList = [...allAccounts, newAccount];
    saveLocalCachedAccounts(updatedList);
    await syncRegistry(updatedList);

    return {
      success: true,
      account: newAccount,
    };
  } catch (err: unknown) {
    console.error('Error in registerUserWithQuotaCheck:', err);
    try {
      await deleteUser(user);
    } catch {
      // ignore
    }
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    return {
      success: false,
      error: GENERIC_AUTH_ERROR,
    };
  }
}

/**
 * React hook to listen to registered accounts in real-time.
 */
export function useRegisteredAccounts() {
  const [accounts, setAccounts] = ReactState<RegisteredAccount[]>([]);
  const [loading, setLoading] = ReactState<boolean>(false);
  const [error, setError] = ReactState<string | null>(null);

  ReactEffect(() => {
    // 1. Initial stored items loaded on mount to prevent SSR hydration mismatch
    queueMicrotask(() => {
      setAccounts(getLocalCachedAccounts());
    });

    const handleSync = () => {
      setAccounts(getLocalCachedAccounts());
    };

    window.addEventListener(USERS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    let unsubscribe: (() => void) | undefined;
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      unsubscribe = onSnapshot(
        usersRef,
        (snap) => {
          const list: RegisteredAccount[] = [];
          snap.forEach((docSnap) => {
            list.push({
              ...(docSnap.data() as RegisteredAccount),
              uid: docSnap.id,
            });
          });
          list.sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));
          if (list.length > 0) {
            setAccounts(list);
            saveLocalCachedAccounts(list);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Realtime accounts listener fallback:', err);
          setLoading(false);
        }
      );
    } catch (err: unknown) {
      console.warn('Hook initialization fallback:', err);
    }

    return () => {
      window.removeEventListener(USERS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    accounts,
    count: accounts.length,
    remainingSlots: Math.max(0, MAX_ALLOWED_ACCOUNTS - accounts.length),
    isFull: accounts.length >= MAX_ALLOWED_ACCOUNTS,
    loading,
    error,
  };
}

/**
 * Helper to execute admin user actions through secure server API
 */
async function callAdminUserApi(action: 'approve' | 'revoke' | 'delete', targetUid: string): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    const token = currentUser ? await currentUser.getIdToken() : '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, targetUid }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
    return false;
  } catch (err) {
    console.warn('Admin API route notice:', err);
    return false;
  }
}

/**
 * Approve a pending admin account (Super Admin capability)
 */
export async function approveAdminUser(uid: string): Promise<boolean> {
  try {
    const apiSuccess = await callAdminUserApi('approve', uid);
    if (!apiSuccess) {
      // Direct Firestore fallback
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userDocRef, { status: 'approved' }, { merge: true });
    }
    const cached = getLocalCachedAccounts();
    const updated = cached.map((u) => (u.uid === uid ? { ...u, status: 'approved' as const } : u));
    saveLocalCachedAccounts(updated);
    await syncRegistry(updated);
    return true;
  } catch (err) {
    console.error('Failed to approve admin user:', err);
    return false;
  }
}

/**
 * Revoke an approved admin account back to pending (Super Admin capability)
 */
export async function revokeAdminUser(uid: string): Promise<boolean> {
  try {
    const apiSuccess = await callAdminUserApi('revoke', uid);
    if (!apiSuccess) {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userDocRef, { status: 'pending' }, { merge: true });
    }
    const cached = getLocalCachedAccounts();
    const updated = cached.map((u) => (u.uid === uid ? { ...u, status: 'pending' as const } : u));
    saveLocalCachedAccounts(updated);
    await syncRegistry(updated);
    return true;
  } catch (err) {
    console.error('Failed to revoke admin user:', err);
    return false;
  }
}

/**
 * Delete / remove an admin user from Firestore and registry (Super Admin capability)
 */
export async function deleteAdminUser(uid: string): Promise<boolean> {
  try {
    const apiSuccess = await callAdminUserApi('delete', uid);
    if (!apiSuccess) {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      await deleteDoc(userDocRef);
    }
    const cached = getLocalCachedAccounts();
    const updated = cached.filter((u) => u.uid !== uid);
    saveLocalCachedAccounts(updated);
    await syncRegistry(updated);
    return true;
  } catch (err) {
    console.error('Failed to delete admin user:', err);
    return false;
  }
}
