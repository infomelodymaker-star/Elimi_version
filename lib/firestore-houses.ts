'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface AvailableUnit {
  unitId: string;
  availableDate: string;
  price: number;
  isRent: boolean;
}

export interface House {
  id: string;
  title: string;
  description: string;
  price: number; // for sale price
  rentPrice?: number; // for rent price
  sales: boolean;
  rent: boolean;
  location: { lat: number; lng: number };
  address: string;
  mapsLink?: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  floorPlanName: string;
  availableUnits: AvailableUnit[];
  amenities: string[];
  photos: string[];
  imageUrl: string;
}

const DEFAULT_AMENITIES = [
  'Swimming pool with sundeck',
  'Dog park',
  'Fitness center',
  'Attached garage',
  'Townhome floor plans',
  'Fireplace',
  'In-home washer & dryer'
];

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1cd2f9d20b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
];

export const SAMPLE_HOUSES: House[] = [
  {
    id: 'house-1',
    title: 'Luxury Villa in Beverly Hills',
    description: 'Beautiful modern villa with a large pool and garden.',
    price: 3500000,
    sales: true,
    rent: false,
    location: { lat: 34.0736, lng: -118.4004 },
    address: 'Beverly Hills, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_1',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4500,
    floorPlanName: 'The Beverly Estate',
    availableUnits: [
      { unitId: 'BV-01', availableDate: 'Available Now', price: 3500000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-2',
    title: 'Downtown Modern Loft',
    description: 'Exposed brick, high ceilings, in the heart of downtown.',
    price: 850000,
    rentPrice: 3200,
    sales: true,
    rent: true,
    location: { lat: 34.0407, lng: -118.2468 },
    address: 'Downtown Los Angeles, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_2',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    floorPlanName: 'Urban Loft Layout',
    availableUnits: [
      { unitId: 'DT-4A', availableDate: 'Oct 18', price: 3200, isRent: true },
      { unitId: 'DT-5B', availableDate: 'Nov 01', price: 850000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-3',
    title: 'Cozy Beachfront Cottage',
    description: 'Wake up to the sound of waves every morning.',
    price: 1200000,
    rentPrice: 4500,
    sales: false,
    rent: true,
    location: { lat: 34.0259, lng: -118.5155 },
    address: 'Santa Monica, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_3',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    floorPlanName: 'Seaside Plan',
    availableUnits: [
      { unitId: 'SM-02', availableDate: 'Available Now', price: 4500, isRent: true }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-4',
    title: 'Suburban Family Home',
    description: 'Spacious backyard, perfect for a growing family.',
    price: 650000,
    sales: true,
    rent: false,
    location: { lat: 34.1425, lng: -118.2551 },
    address: 'Glendale, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_4',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    floorPlanName: 'Maplewood Family',
    availableUnits: [
      { unitId: 'GL-11', availableDate: 'Available Now', price: 650000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-5',
    title: 'Penthouse with City Views',
    description: 'Luxury living with panoramic views of the skyline.',
    price: 2100000,
    rentPrice: 7500,
    sales: true,
    rent: true,
    location: { lat: 34.0522, lng: -118.2437 },
    address: 'Financial District, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_5',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    floorPlanName: 'Skyline Penthouse',
    availableUnits: [
      { unitId: 'PH-01', availableDate: 'Dec 01', price: 7500, isRent: true },
      { unitId: 'PH-02', availableDate: 'Dec 15', price: 2100000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-6',
    title: 'Rustic Cabin Getaway',
    description: 'A peaceful retreat surrounded by nature.',
    price: 0,
    rentPrice: 1500,
    sales: false,
    rent: true,
    location: { lat: 34.2506, lng: -118.1887 },
    address: 'Angeles National Forest, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_6',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 900,
    floorPlanName: 'Pine Cabin',
    availableUnits: [
      { unitId: 'CB-99', availableDate: 'Available Now', price: 1500, isRent: true }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-7',
    title: 'Modern Smart Home',
    description: 'Fully automated, energy-efficient modern design.',
    price: 1800000,
    sales: true,
    rent: false,
    location: { lat: 34.0195, lng: -118.4912 },
    address: 'Venice, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_7',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3100,
    floorPlanName: 'Tech Haven',
    availableUnits: [
      { unitId: 'VN-44', availableDate: 'Available Now', price: 1800000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-8',
    title: 'Charming Historic Victorian',
    description: 'Beautifully restored Victorian house with original details.',
    price: 950000,
    rentPrice: 3800,
    sales: true,
    rent: true,
    location: { lat: 34.1478, lng: -118.1445 },
    address: 'Pasadena, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_8',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2400,
    floorPlanName: 'Heritage Layout',
    availableUnits: [
      { unitId: 'PA-21', availableDate: 'Available Now', price: 3800, isRent: true }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-9',
    title: 'Studio Apartment Near Campus',
    description: 'Perfect for students, walking distance to major universities.',
    price: 0,
    rentPrice: 1200,
    sales: false,
    rent: true,
    location: { lat: 34.0224, lng: -118.2851 },
    address: 'University Park, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_9',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 600,
    floorPlanName: 'Student Studio',
    availableUnits: [
      { unitId: 'UP-08', availableDate: 'Aug 15', price: 1200, isRent: true },
      { unitId: 'UP-09', availableDate: 'Sep 01', price: 1200, isRent: true }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-10',
    title: 'Spacious Multi-Family Estate',
    description: 'Perfect investment property or for large extended families.',
    price: 2500000,
    sales: true,
    rent: false,
    location: { lat: 34.1808, lng: -118.3090 },
    address: 'Burbank, CA',
    mapsLink: 'https://maps.app.goo.gl/random_house_10',
    bedrooms: 6,
    bathrooms: 5,
    sqft: 5200,
    floorPlanName: 'Grand Estate',
    availableUnits: [
      { unitId: 'BB-77', availableDate: 'Available Now', price: 2500000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800',
  }
];

export const HOUSES_COLLECTION = 'houses';

let isSeedingInProgress = false;

export async function forceUpdateHousesSchema(): Promise<boolean> {
  if (isSeedingInProgress) return false;
  try {
    isSeedingInProgress = true;
    console.log('Forcing schema update for all houses in Firestore...');
    const batch = writeBatch(db);
    for (const house of SAMPLE_HOUSES) {
      const docRef = doc(db, HOUSES_COLLECTION, house.id);
      batch.set(docRef, {
        ...house,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    await batch.commit();
    console.log('Successfully updated houses schema in Firestore');
    isSeedingInProgress = false;
    return true;
  } catch (err) {
    console.error('Error updating Firestore houses schema:', err);
    isSeedingInProgress = false;
    return false;
  }
}

export const HOUSES_STORAGE_KEY = 'elimi_houses_storage';
export const HOUSES_SYNC_EVENT = 'elimi_sync_houses';

export function useRealtimeHouses() {
  const [houses, setHouses] = useState<House[]>(() =>
    getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Listen to custom sync events
    const handleSync = () => {
      const updated = getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES);
      setHouses(updated);
    };

    window.addEventListener(HOUSES_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Optional live subscription to Firestore without blocking the UI
    let unsubscribe: (() => void) | undefined;
    try {
      const q = collection(db, HOUSES_COLLECTION);
      unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (!snapshot.empty) {
            const liveHouses: House[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as House;
              liveHouses.push({
                ...data,
                id: docSnap.id,
              });
            });

            // Merge with local houses
            const currentStored = getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES);
            const liveIds = new Set(liveHouses.map((h) => h.id));
            const locallyAddedOnly = currentStored.filter((h) => !liveIds.has(h.id) && h.id.startsWith('house-'));
            const merged = [...liveHouses, ...locallyAddedOnly];

            saveStoredItems(HOUSES_STORAGE_KEY, merged);
            setHouses(merged);
            setIsLive(true);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firestore onSnapshot error (using resilient cache):', err?.message || err);
          setHouses(getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES));
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.warn('Firestore houses listener setup fallback:', err);
    }

    return () => {
      window.removeEventListener(HOUSES_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { houses, loading, error, isLive };
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

export async function addHouseToFirestore(house: House): Promise<void> {
  const cleaned: House = removeUndefinedFields({
    ...house,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 1. Immediately update local storage and broadcast
  const current = getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES);
  const updatedList = [cleaned, ...current.filter((h) => h.id !== house.id)];
  saveStoredItems(HOUSES_STORAGE_KEY, updatedList, HOUSES_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, HOUSES_COLLECTION, house.id);
    await setDoc(docRef, cleaned);
  }, 1200, `Add house ${house.id}`);
}

export async function updateHouseInFirestore(
  houseId: string,
  updates: Partial<House>
): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES);
  const existing = current.find((h) => h.id === houseId) || SAMPLE_HOUSES.find((h) => h.id === houseId) || { id: houseId, title: '', description: '', price: 0, sales: true, rent: false, photos: [] } as House;
  const cleanedUpdates: House = removeUndefinedFields({
    ...existing,
    ...updates,
    id: houseId,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((h) => (h.id === houseId ? cleanedUpdates : h));
  if (!updatedList.some((h) => h.id === houseId)) {
    updatedList.push(cleanedUpdates);
  }
  saveStoredItems(HOUSES_STORAGE_KEY, updatedList, HOUSES_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    await setDoc(docRef, cleanedUpdates, { merge: true });
  }, 1200, `Update house ${houseId}`);
}

export async function deleteHouseFromFirestore(houseId: string): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES);
  const updatedList = current.filter((h) => h.id !== houseId);
  saveStoredItems(HOUSES_STORAGE_KEY, updatedList, HOUSES_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, HOUSES_COLLECTION, houseId);
    await deleteDoc(docRef);
  }, 1200, `Delete house ${houseId}`);
}

export async function seedInitialHousesIfEmpty(): Promise<boolean> {
  return await forceUpdateHousesSchema();
}

