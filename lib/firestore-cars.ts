'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe, syncItemToServerCatalog, fetchServerCatalog } from './firestore-sync';

export interface AvailableCarUnit {
  unitId: string;
  availableDate: string;
  price: number;
  isRent: boolean;
}

export interface Car {
  id: string;
  title: string;
  description: string;
  price: number; // for sale price
  rentPrice?: number; // for rent price (e.g. per day or per month)
  sales: boolean;
  rent: boolean;
  location: { lat: number; lng: number };
  address: string;
  mapsLink?: string;
  seats: number;
  transmission: string;
  fuelType: string;
  year: number;
  mileage?: string;
  modelTrim: string;
  availableUnits: AvailableCarUnit[];
  amenities: string[];
  photos: string[];
  imageUrl: string;
}

const DEFAULT_CAR_FEATURES = [
  'Professional Chauffeur Available',
  'Executive Leather Interior',
  '4WD / All-Terrain Capability',
  'Advanced GPS & Navigation',
  'Apple CarPlay & Android Auto',
  'Panoramic Sunroof',
  'Surround Sound Audio System',
  'Full Comprehensive Insurance Included'
];

const DEFAULT_CAR_PHOTOS = [
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
];

export const SAMPLE_CARS: Car[] = [
  {
    id: 'car-1',
    title: 'Mercedes-Benz V-Class VIP Edition',
    description: 'Ultra-luxurious 7-seater executive van with recliner massage seats, ambient lighting, and high-speed onboard Wi-Fi.',
    price: 115000,
    rentPrice: 350,
    sales: true,
    rent: true,
    location: { lat: -3.3845, lng: 29.3635 },
    address: 'Rohero VIP Showroom, Boulevard du 28 Novembre, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaRohero',
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel / Hybrid',
    year: 2024,
    mileage: '12,500 km',
    modelTrim: 'V300d Extra Long Luxury',
    availableUnits: [
      { unitId: 'VC-01', availableDate: 'Available Today', price: 350, isRent: true },
      { unitId: 'VC-02', availableDate: 'Available Now', price: 115000, isRent: false }
    ],
    amenities: DEFAULT_CAR_FEATURES,
    photos: [
      '/assets/shop/mercedes-vclass.jpg',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'car-2',
    title: 'Toyota Land Cruiser Prado TX-L',
    description: 'Iconic heavy-duty luxury SUV built for commanding road presence, diplomatic protocol, and rough terrains.',
    price: 85000,
    rentPrice: 200,
    sales: true,
    rent: true,
    location: { lat: -3.3768, lng: 29.3812 },
    address: 'Kiriri Diplomatic Station, Avenue Belvédère, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaKiriri',
    seats: 7,
    transmission: 'Automatic 4WD',
    fuelType: 'Turbo Diesel',
    year: 2024,
    mileage: '8,200 km',
    modelTrim: 'TX-L Premium Package',
    availableUnits: [
      { unitId: 'PR-10', availableDate: 'Available Now', price: 200, isRent: true },
      { unitId: 'PR-11', availableDate: 'Available Now', price: 85000, isRent: false }
    ],
    amenities: [
      'Full-Time 4WD with Multi-Terrain Select',
      'Rear Seat Entertainment',
      'Cool Box Refrigerator',
      'Roof Railing System',
      '360 Panoramic View Monitor',
      'Chauffeur Service Optional'
    ],
    photos: [
      '/assets/elimi-images/4-pillar-section/PRADO.webp',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'car-3',
    title: 'Range Rover Autobiography LWB',
    description: 'The pinnacle of refined British engineering, offering unmatched comfort, serene ride quality, and executive presence.',
    price: 185000,
    rentPrice: 650,
    sales: true,
    rent: true,
    location: { lat: -3.3985, lng: 29.3540 },
    address: 'Kinindo Executive Hub, Avenue du Large, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaKinindo',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Twin-Turbo V8',
    year: 2024,
    mileage: '5,100 km',
    modelTrim: 'Autobiography Long Wheelbase',
    availableUnits: [
      { unitId: 'RR-01', availableDate: 'Available Now', price: 650, isRent: true },
      { unitId: 'RR-02', availableDate: 'Ready for delivery', price: 185000, isRent: false }
    ],
    amenities: DEFAULT_CAR_FEATURES,
    photos: DEFAULT_CAR_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'car-4',
    title: 'Porsche 911 Carrera GTS',
    description: 'Iconic sports car delivering adrenaline-fueled handling, timeless design, and precision performance.',
    price: 160000,
    rentPrice: 500,
    sales: true,
    rent: false,
    location: { lat: -3.3812, lng: 29.3668 },
    address: 'Boulevard de l\'Uprona, Rohero I, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaCentre',
    seats: 4,
    transmission: 'PDK Automatic',
    fuelType: 'Twin-Turbo Flat-6',
    year: 2024,
    mileage: '3,400 km',
    modelTrim: 'Carrera GTS Coupe',
    availableUnits: [
      { unitId: '911-01', availableDate: 'Available Now', price: 160000, isRent: false }
    ],
    amenities: DEFAULT_CAR_FEATURES,
    photos: DEFAULT_CAR_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'car-5',
    title: 'Toyota Land Cruiser 300 GR Sport',
    description: 'The master of all terrains, featuring twin-turbo diesel power and Gazoo Racing suspension tuning for VIP protocol.',
    price: 135000,
    rentPrice: 300,
    sales: true,
    rent: true,
    location: { lat: -3.3615, lng: 29.3885 },
    address: 'Gihosha Diplomatic Route, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaGihosha',
    seats: 7,
    transmission: '10-Speed Automatic',
    fuelType: '3.3L Twin-Turbo Diesel',
    year: 2024,
    mileage: '6,800 km',
    modelTrim: 'LC300 GR-Sport VIP Armor Ready',
    availableUnits: [
      { unitId: 'LC-301', availableDate: 'Available Now', price: 300, isRent: true },
      { unitId: 'LC-302', availableDate: 'Ready for delivery', price: 135000, isRent: false }
    ],
    amenities: DEFAULT_CAR_FEATURES,
    photos: DEFAULT_CAR_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'car-6',
    title: 'Mercedes-Maybach S 580 4MATIC',
    description: 'Presidential comfort with extended legroom, reclining first-class airline style seats, and noise-cancelling cabin.',
    price: 230000,
    rentPrice: 800,
    sales: true,
    rent: true,
    location: { lat: -3.3830, lng: 29.3590 },
    address: 'Mutanga Nord Executive Hub, Bujumbura',
    mapsLink: 'https://maps.app.goo.gl/BujumburaMutanga',
    seats: 4,
    transmission: 'Automatic 9G-TRONIC',
    fuelType: 'V8 Biturbo Mild Hybrid',
    year: 2024,
    mileage: '2,900 km',
    modelTrim: 'Maybach S 580 Executive',
    availableUnits: [
      { unitId: 'MB-580', availableDate: 'Available Today', price: 800, isRent: true },
      { unitId: 'MB-581', availableDate: 'Available Now', price: 230000, isRent: false }
    ],
    amenities: DEFAULT_CAR_FEATURES,
    photos: DEFAULT_CAR_PHOTOS,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
  }
];

export const CARS_COLLECTION = 'cars';

let isCarSeedingInProgress = false;

export async function forceUpdateCarsSchema(): Promise<boolean> {
  if (isCarSeedingInProgress) return false;
  try {
    isCarSeedingInProgress = true;
    console.log('Forcing schema update for all cars in Firestore...');
    const batch = writeBatch(db);
    for (const car of SAMPLE_CARS) {
      const docRef = doc(db, CARS_COLLECTION, car.id);
      batch.set(docRef, {
        ...car,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    await batch.commit();
    console.log('Successfully updated cars schema in Firestore');
    isCarSeedingInProgress = false;
    return true;
  } catch (err) {
    console.error('Error updating Firestore cars schema:', err);
    isCarSeedingInProgress = false;
    return false;
  }
}

export const CARS_STORAGE_KEY = 'elimi_cars_storage';
export const CARS_SYNC_EVENT = 'elimi_sync_cars';

export function useRealtimeCars() {
  const [cars, setCars] = useState<Car[]>(SAMPLE_CARS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial stored items loaded on mount to prevent SSR mismatch
    queueMicrotask(() => {
      const initialStored = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
      setCars(initialStored);

      // Fetch from server catalog to sync across browsers/devices
      fetchServerCatalog<Car>('cars').then((serverCars) => {
        if (serverCars && serverCars.length > 0) {
          saveStoredItems(CARS_STORAGE_KEY, serverCars);
          setCars(serverCars);
        }
      }).catch(() => {});
    });

    // 2. Listen to custom sync events and storage
    const handleSync = () => {
      const updated = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
      setCars(updated);
    };

    window.addEventListener(CARS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 3. Live subscription to Firestore
    let unsubscribe: (() => void) | undefined;
    try {
      const q = collection(db, CARS_COLLECTION);
      unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (!snapshot.empty) {
            const liveCars: Car[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Car;
              liveCars.push({
                ...data,
                id: docSnap.id,
              });
            });

            saveStoredItems(CARS_STORAGE_KEY, liveCars);
            setCars(liveCars);
            setIsLive(true);
          } else {
            forceUpdateCarsSchema().catch(() => {});
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firestore onSnapshot note (using cache):', err?.message || err);
          setCars(getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS));
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.warn('Firestore cars listener setup note:', err);
    }

    return () => {
      window.removeEventListener(CARS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { cars, loading, error, isLive };
}

/**
 * Hook to subscribe in real-time to a single car document by ID.
 */
export function useRealtimeCar(carId: string) {
  const [car, setCar] = useState<Car | null>(() => {
    if (!carId) return null;
    return SAMPLE_CARS.find((c) => c.id === carId) || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    if (!carId) {
      queueMicrotask(() => {
        setLoading(false);
        setCar(null);
      });
      return;
    }

    // Check stored items on mount
    queueMicrotask(() => {
      const stored = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
      const foundStored = stored.find((c) => c.id === carId) || SAMPLE_CARS.find((c) => c.id === carId);
      if (foundStored) {
        setCar(foundStored);
      }
    });

    const handleSync = () => {
      const latestStored = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
      const matched = latestStored.find((c) => c.id === carId);
      if (matched) setCar(matched);
    };

    window.addEventListener(CARS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    let unsubscribe: (() => void) | undefined;
    try {
      const docRef = doc(db, CARS_COLLECTION, carId);
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const liveDoc = {
              ...(docSnap.data() as Car),
              id: docSnap.id,
            };
            setCar(liveDoc);
            setIsLive(true);
          } else {
            const latest = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
            const found = latest.find((c) => c.id === carId) || null;
            setCar(found);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firestore single car listener note:', err);
          setLoading(false);
        }
      );
    } catch {
      queueMicrotask(() => {
        setLoading(false);
      });
    }

    return () => {
      window.removeEventListener(CARS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, [carId]);

  return { car, loading, isLive };
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

export async function addCarToFirestore(car: Car): Promise<void> {
  const cleaned: Car = removeUndefinedFields({
    ...car,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 1. Immediately update local storage and broadcast
  const current = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
  const updatedList = [cleaned, ...current.filter((c) => c.id !== car.id)];
  saveStoredItems(CARS_STORAGE_KEY, updatedList, CARS_SYNC_EVENT);

  // 2. Persist to server catalog storage
  await syncItemToServerCatalog('cars', cleaned, 'save');

  // 3. Write to Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, CARS_COLLECTION, car.id);
    await setDoc(docRef, cleaned);
  }, 1500, `Add car ${car.id}`);
}

export async function updateCarInFirestore(
  carId: string,
  updates: Partial<Car>
): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
  const existing = current.find((c) => c.id === carId) || SAMPLE_CARS.find((c) => c.id === carId) || ({ id: carId, title: '', description: '', price: 0, sales: true, rent: false, photos: [] } as unknown as Car);
  const cleanedUpdates: Car = removeUndefinedFields({
    ...existing,
    ...updates,
    id: carId,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((c) => (c.id === carId ? cleanedUpdates : c));
  if (!updatedList.some((c) => c.id === carId)) {
    updatedList.push(cleanedUpdates);
  }
  saveStoredItems(CARS_STORAGE_KEY, updatedList, CARS_SYNC_EVENT);

  // 2. Persist to server catalog storage
  await syncItemToServerCatalog('cars', cleanedUpdates, 'save');

  // 3. Write to Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, CARS_COLLECTION, carId);
    await setDoc(docRef, cleanedUpdates, { merge: true });
  }, 1500, `Update car ${carId}`);
}

export async function deleteCarFromFirestore(carId: string): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<Car>(CARS_STORAGE_KEY, SAMPLE_CARS);
  const updatedList = current.filter((c) => c.id !== carId);
  saveStoredItems(CARS_STORAGE_KEY, updatedList, CARS_SYNC_EVENT);

  // 2. Persist deletion to server catalog storage
  await syncItemToServerCatalog('cars', carId, 'delete');

  // 3. Delete from Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, CARS_COLLECTION, carId);
    await deleteDoc(docRef);
  }, 1500, `Delete car ${carId}`);
}

export async function seedInitialCarsIfEmpty(): Promise<boolean> {
  return await forceUpdateCarsSchema();
}
