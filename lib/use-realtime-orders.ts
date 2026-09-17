'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { BoutiqueOrder, ORDERS_STORAGE_KEY, ORDERS_SYNC_EVENT } from './firestore-orders';
import { getStoredItems, saveStoredItems } from './firestore-sync';

// React hook for real-time orders in Admin Dashboard
export function useRealtimeOrders() {
  const [orders, setOrders] = useState<BoutiqueOrder[]>(() =>
    getStoredItems<BoutiqueOrder>(ORDERS_STORAGE_KEY, [])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Listen to custom sync events
    const handleSync = () => {
      const updated = getStoredItems<BoutiqueOrder>(ORDERS_STORAGE_KEY, []);
      setOrders(updated);
    };

    window.addEventListener(ORDERS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Live Firestore listener without blocking
    let unsubscribe: (() => void) | undefined;
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const loaded: BoutiqueOrder[] = [];
            snapshot.forEach((docSnap) => {
              loaded.push(docSnap.data() as BoutiqueOrder);
            });
            saveStoredItems(ORDERS_STORAGE_KEY, loaded);
            setOrders(loaded);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Real-time orders onSnapshot note (using resilient cache):', err?.message || err);
          setLoading(false);
        }
      );
    } catch {
      // Retain existing cached orders and state
    }

    return () => {
      window.removeEventListener(ORDERS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { orders, loading, error };
}

