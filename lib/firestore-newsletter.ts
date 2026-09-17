'use client';

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  source?: string;
  active?: boolean;
}

export const NEWSLETTER_COLLECTION = 'newsletter_subscribers';
export const NEWSLETTER_STORAGE_KEY = 'elimi_newsletter_subscribers';

/**
 * Subscribes an email to the newsletter collection in Firestore.
 * Always normalizes the email to lowercase before writing.
 */
export async function subscribeToNewsletter(
  rawEmail: string,
  source: string = 'boutique_cart'
): Promise<{ success: boolean; email: string }> {
  if (!rawEmail || typeof rawEmail !== 'string') {
    throw new Error('A valid email address is required.');
  }

  // Convert to lowercase as requested
  const normalizedEmail = rawEmail.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  const subscriber: NewsletterSubscriber = {
    email: normalizedEmail,
    subscribedAt: new Date().toISOString(),
    source,
    active: true,
  };

  // 1. Immediately store in local cache
  const existing = getStoredItems<NewsletterSubscriber>(NEWSLETTER_STORAGE_KEY, []);
  if (!existing.some((s) => s.email === normalizedEmail)) {
    saveStoredItems(NEWSLETTER_STORAGE_KEY, [...existing, subscriber]);
  }

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const subscriberRef = doc(db, NEWSLETTER_COLLECTION, normalizedEmail);
    await setDoc(subscriberRef, subscriber, { merge: true });
  }, 1200, `Subscribe newsletter ${normalizedEmail}`);

  return { success: true, email: normalizedEmail };
}
