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
    title: 'Luxury Villa in Kiriri Hills',
    description: 'Exclusive modern hillside estate with panoramic views of Lake Tanganyika, private infinity pool, lush tropical gardens, and diplomatic security quarters.',
    price: 650000,
    rentPrice: 3500,
    sales: true,
    rent: true,
    location: { lat: -3.3760, lng: 29.3825 },
    address: 'Avenue Belvédère, Kiriri, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaKiririVilla',
    bedrooms: 5,
    bathrooms: 5,
    sqft: 5200,
    floorPlanName: 'The Belvédère Luxury Palace',
    availableUnits: [
      { unitId: 'KV-01', availableDate: 'Available Now', price: 3500, isRent: true },
      { unitId: 'KV-02', availableDate: 'Available for Purchase', price: 650000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-2',
    title: 'Executive Penthouse Rohero I',
    description: 'Sophisticated contemporary penthouse in the heart of Rohero diplomatic district with floor-to-ceiling glass, backup solar power, and 24/7 security concierge.',
    price: 380000,
    rentPrice: 2200,
    sales: true,
    rent: true,
    location: { lat: -3.3855, lng: 29.3640 },
    address: 'Boulevard du 28 Novembre, Rohero I, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaRoheroPenthouse',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    floorPlanName: 'Diplomatic Skyline Penthouse',
    availableUnits: [
      { unitId: 'RH-3A', availableDate: 'Available Today', price: 2200, isRent: true },
      { unitId: 'RH-3B', availableDate: 'Available Now', price: 380000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-3',
    title: 'Lake Tanganyika Beachfront Residence',
    description: 'Private waterfront villa directly overlooking Lake Tanganyika with private pier, terrace bar, sunset deck, and tranquil lake breezes.',
    price: 490000,
    rentPrice: 2800,
    sales: true,
    rent: true,
    location: { lat: -3.4050, lng: 29.3480 },
    address: 'Chaussée d\'Uvira, Kinindo Plage, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaKinindoPlage',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3600,
    floorPlanName: 'Tanganyika Azure Villa',
    availableUnits: [
      { unitId: 'KP-01', availableDate: 'Available Now', price: 2800, isRent: true },
      { unitId: 'KP-02', availableDate: 'Available for Purchase', price: 490000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-4',
    title: 'Modern Family Compound in Gihosha',
    description: 'Spacious 4-bedroom gated residence with manicured lawns, generator backup, water reservoir, and detached staff quarters.',
    price: 295000,
    rentPrice: 1600,
    sales: true,
    rent: true,
    location: { lat: -3.3620, lng: 29.3890 },
    address: 'Quartier Gihosha Rural, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaGihoshaFamily',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3100,
    floorPlanName: 'Gihosha Family Compound',
    availableUnits: [
      { unitId: 'GH-10', availableDate: 'Available Now', price: 1600, isRent: true },
      { unitId: 'GH-11', availableDate: 'Ready for Deed Transfer', price: 295000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-5',
    title: 'Mutanga Nord Diplomatic Residence',
    description: 'Turnkey fully furnished 4-bedroom residence designed for international NGO leaders and foreign embassy dignitaries.',
    price: 420000,
    rentPrice: 2400,
    sales: true,
    rent: true,
    location: { lat: -3.3810, lng: 29.3780 },
    address: 'Avenue de l\'OUA, Mutanga Nord, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaMutangaRes',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3400,
    floorPlanName: 'Mutanga Executive Villa',
    availableUnits: [
      { unitId: 'MN-01', availableDate: 'Available Now', price: 2400, isRent: true },
      { unitId: 'MN-02', availableDate: 'Available Now', price: 420000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-6',
    title: 'Gitega Capital Modern Estate',
    description: 'Spacious ministerial style estate located in Burundi\'s political capital Gitega, featuring grand reception hall and security perimeter.',
    price: 310000,
    rentPrice: 1500,
    sales: true,
    rent: true,
    location: { lat: -3.4275, lng: 29.9248 },
    address: 'Quartier Musinzira, Gitega Political Capital',
    mapsLink: 'https://maps.app.goo.gl/GitegaCapitalEstate',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4100,
    floorPlanName: 'Gitega Capital Manor',
    availableUnits: [
      { unitId: 'GT-01', availableDate: 'Available Now', price: 1500, isRent: true },
      { unitId: 'GT-02', availableDate: 'Ready for Purchase', price: 310000, isRent: false }
    ],
    amenities: DEFAULT_AMENITIES,
    photos: DEFAULT_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'house-10',
    title: 'Rohero II Diplomatic Residence',
    description: 'Premier executive residence near embassies in Rohero II, with expansive gardens, diplomatic security features, and servant quarters.',
    price: 520000,
    rentPrice: 2800,
    sales: true,
    rent: true,
    location: { lat: -3.3885, lng: 29.3695 },
    address: 'Avenue du Large, Rohero II, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/RoheroDiplomaticManor',
    bedrooms: 6,
    bathrooms: 5,
    sqft: 5200,
    floorPlanName: 'Rohero Grand Estate',
    availableUnits: [
      { unitId: 'RH-01', availableDate: 'Available Now', price: 2800, isRent: true },
      { unitId: 'RH-02', availableDate: 'Ready for Purchase', price: 520000, isRent: false }
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
  const [houses, setHouses] = useState<House[]>(SAMPLE_HOUSES);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Hydrate from local storage on client mount
    queueMicrotask(() => {
      const initialStored = getStoredItems<House>(HOUSES_STORAGE_KEY, SAMPLE_HOUSES);
      setHouses(initialStored);
    });

    // 2. Listen to custom sync events
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
  const existing = current.find((h) => h.id === houseId) || SAMPLE_HOUSES.find((h) => h.id === houseId) || ({ id: houseId, title: '', description: '', price: 0, sales: true, rent: false, photos: [] } as unknown as House);
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

