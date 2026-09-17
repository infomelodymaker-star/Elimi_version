'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GlobalSettings,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_SYNC_EVENT,
} from '@/lib/firestore-settings';
import { getStoredObject } from '@/lib/firestore-sync';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SettingsContext = createContext<GlobalSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(() =>
    getStoredObject<GlobalSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    // 1. Initial values from storage already loaded in useState
    
    // 2. Listen to custom sync events
    const handleSync = () => {
      setSettings(getStoredObject<GlobalSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS));
    };

    window.addEventListener(SETTINGS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 3. Optional live subscription to Firestore without blocking the UI
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onSnapshot(
        doc(db, 'settings', 'global'),
        (docSnap) => {
          if (docSnap.exists()) {
            setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() } as GlobalSettings);
          }
        },
        (err) => {
          console.warn('Firestore settings snapshot note (using resilient cache):', err?.message || err);
        }
      );
    } catch {
      // Ignore listener failure, resilient cache is active
    }

    return () => {
      window.removeEventListener(SETTINGS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function useCurrency() {
  const settings = useSettings();
  
  const toBIF = (usdValue: number) => {
    return Math.round(usdValue * settings.usdToBifRate);
  };
  
  const formatBIF = (usdValue: number) => {
    return toBIF(usdValue).toLocaleString();
  };
  
  const formatUSD = (usdValue: number) => {
    return usdValue.toFixed(2);
  };
  
  return { toBIF, formatBIF, formatUSD, usdToBifRate: settings.usdToBifRate };
}
