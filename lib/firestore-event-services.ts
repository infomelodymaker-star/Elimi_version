'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface EventServiceTag {
  iconType: 'car' | 'users' | 'shield' | 'video' | 'zap' | 'utensils' | 'file';
  label: string;
}

export interface EventServiceItem {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  defaultQuantity: number;
  checkedByDefault?: boolean;
  subtext?: string;
  image: string;
  enabled: boolean;
  tags: EventServiceTag[];
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_EVENT_SERVICES: EventServiceItem[] = [
  {
    id: 'vip-fleet',
    title: 'VIP Fleet (3 Mercedes SUVs)',
    description: 'Luxury Mercedes SUVs with professional chauffeurs.',
    unitPrice: 200,
    defaultQuantity: 3,
    checkedByDefault: true,
    subtext: '$200 each',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    enabled: true,
    tags: [
      { iconType: 'car', label: 'Mercedes GLE' },
      { iconType: 'users', label: 'Up to 21 Pax' }
    ]
  },
  {
    id: 'protocol-agents',
    title: 'Protocol Agents (6 Staff)',
    description: 'Professional, uniformed and well-trained protocol agents.',
    unitPrice: 50,
    defaultQuantity: 6,
    checkedByDefault: true,
    subtext: '$50 each',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80',
    enabled: true,
    tags: [
      { iconType: 'users', label: 'Uniformed' },
      { iconType: 'shield', label: 'Trained & Certified' }
    ]
  },
  {
    id: 'photo-drone',
    title: 'Full HD Photo & Drone Video',
    description: 'Full day coverage with professional photo, HD video & drone shots.',
    unitPrice: 250,
    defaultQuantity: 1,
    checkedByDefault: true,
    subtext: '',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
    enabled: true,
    tags: [
      { iconType: 'video', label: 'Full HD' },
      { iconType: 'zap', label: 'Drone Included' }
    ]
  },
  {
    id: 'premium-catering',
    title: 'Premium Catering',
    description: 'Delicious menus, buffet setup and professional service.',
    unitPrice: 150,
    defaultQuantity: 1,
    checkedByDefault: false,
    subtext: '',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80',
    enabled: true,
    tags: [
      { iconType: 'utensils', label: 'Buffet' },
      { iconType: 'file', label: 'Custom Menus' }
    ]
  },
  {
    id: 'invitation-printing',
    title: 'Invitation Printing',
    description: 'High-quality invitation cards with custom design.',
    unitPrice: 150,
    defaultQuantity: 1,
    checkedByDefault: false,
    subtext: 'per 100 cards',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
    enabled: true,
    tags: [
      { iconType: 'shield', label: 'Premium Quality' },
      { iconType: 'file', label: '100 Cards' }
    ]
  }
];

export const EVENT_SERVICES_COLLECTION = 'event_services';
export const EVENT_SERVICES_STORAGE_KEY = 'elimi_event_services_storage';
export const EVENT_SERVICES_SYNC_EVENT = 'elimi_sync_event_services';

export function useRealtimeEventServices() {
  const [services, setServices] = useState<EventServiceItem[]>(() =>
    getStoredItems<EventServiceItem>(EVENT_SERVICES_STORAGE_KEY, INITIAL_EVENT_SERVICES)
  );
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // 1. Sync event handler
    const handleSync = () => {
      const updated = getStoredItems<EventServiceItem>(EVENT_SERVICES_STORAGE_KEY, INITIAL_EVENT_SERVICES);
      setServices(updated);
    };

    window.addEventListener(EVENT_SERVICES_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Safe Firestore live listener
    let unsubscribe: (() => void) | undefined;
    try {
      const q = collection(db, EVENT_SERVICES_COLLECTION);
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveItems: EventServiceItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as EventServiceItem;
              liveItems.push({
                ...data,
                id: docSnap.id,
              });
            });

            // Merge with local items
            const currentStored = getStoredItems<EventServiceItem>(EVENT_SERVICES_STORAGE_KEY, INITIAL_EVENT_SERVICES);
            const liveIds = new Set(liveItems.map((s) => s.id));
            const locallyAddedOnly = currentStored.filter((s) => !liveIds.has(s.id));
            const merged = [...liveItems, ...locallyAddedOnly];

            saveStoredItems(EVENT_SERVICES_STORAGE_KEY, merged);
            setServices(merged);
            setIsLive(true);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Event services onSnapshot note:', err?.message || err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Firestore event services listener setup:', err);
    }

    return () => {
      window.removeEventListener(EVENT_SERVICES_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { services, loading, isLive };
}

function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = removeUndefinedFields(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export async function addEventServiceToFirestore(item: EventServiceItem): Promise<void> {
  const cleaned: EventServiceItem = removeUndefinedFields({
    ...item,
    enabled: item.enabled ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const current = getStoredItems<EventServiceItem>(EVENT_SERVICES_STORAGE_KEY, INITIAL_EVENT_SERVICES);
  const updatedList = [cleaned, ...current.filter((s) => s.id !== item.id)];
  saveStoredItems(EVENT_SERVICES_STORAGE_KEY, updatedList, EVENT_SERVICES_SYNC_EVENT);

  try {
    const docRef = doc(db, EVENT_SERVICES_COLLECTION, item.id);
    await setDoc(docRef, cleaned);
  } catch (err) {
    console.error(`Error adding event service ${item.id} to Firestore:`, err);
  }
}

export async function updateEventServiceInFirestore(
  serviceId: string,
  updates: Partial<EventServiceItem>
): Promise<void> {
  const current = getStoredItems<EventServiceItem>(EVENT_SERVICES_STORAGE_KEY, INITIAL_EVENT_SERVICES);
  const existing = current.find((s) => s.id === serviceId) || INITIAL_EVENT_SERVICES.find((s) => s.id === serviceId) || { id: serviceId, title: '', description: '', unitPrice: 0, defaultQuantity: 1, image: '', enabled: true, tags: [] } as EventServiceItem;
  
  const cleanedUpdates: EventServiceItem = removeUndefinedFields({
    ...existing,
    ...updates,
    id: serviceId,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((s) => (s.id === serviceId ? cleanedUpdates : s));
  if (!updatedList.some((s) => s.id === serviceId)) {
    updatedList.push(cleanedUpdates);
  }
  saveStoredItems(EVENT_SERVICES_STORAGE_KEY, updatedList, EVENT_SERVICES_SYNC_EVENT);

  try {
    const docRef = doc(db, EVENT_SERVICES_COLLECTION, serviceId);
    await setDoc(docRef, cleanedUpdates, { merge: true });
  } catch (err) {
    console.error(`Error updating event service ${serviceId} in Firestore:`, err);
  }
}

export async function deleteEventServiceFromFirestore(serviceId: string): Promise<void> {
  const current = getStoredItems<EventServiceItem>(EVENT_SERVICES_STORAGE_KEY, INITIAL_EVENT_SERVICES);
  const updatedList = current.filter((s) => s.id !== serviceId);
  saveStoredItems(EVENT_SERVICES_STORAGE_KEY, updatedList, EVENT_SERVICES_SYNC_EVENT);

  try {
    const docRef = doc(db, EVENT_SERVICES_COLLECTION, serviceId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting event service ${serviceId} from Firestore:`, err);
  }
}

export async function seedInitialEventServices(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const service of INITIAL_EVENT_SERVICES) {
      const docRef = doc(db, EVENT_SERVICES_COLLECTION, service.id);
      batch.set(docRef, {
        ...service,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Error seeding event services:', err);
  }
}
