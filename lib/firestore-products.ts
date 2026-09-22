'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  getDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, ProductReview, BOUTIQUE_PRODUCTS } from './products';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe, syncItemToServerCatalog, fetchServerCatalog } from './firestore-sync';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: 'Boutique clothing and apparel',
    order: 1,
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    description: 'Gadgets and tech accessories',
    order: 2,
  },
  {
    id: 'cat-cultural',
    name: 'Cultural',
    slug: 'cultural',
    imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional and heritage items',
    order: 3,
  },
  {
    id: 'cat-nails',
    name: 'Nails & Beauty',
    slug: 'nails-beauty',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
    description: 'Nail extensions and beauty tools',
    order: 4,
  }
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export const PRODUCTS_COLLECTION = 'products';

// Flag to avoid duplicate seeding in memory during the same session
let isSeedingInProgress = false;

/**
 * Seeds initial boutique products to Firestore if the collection is empty.
 */
export async function seedInitialProductsIfEmpty(): Promise<boolean> {
  if (isSeedingInProgress) return false;
  try {
    isSeedingInProgress = true;
    
    // Seed categories
    const catSnap = await getDocs(collection(db, 'shop_categories'));
    const existingCatIds = new Set(catSnap.docs.map((d) => d.id));
    const batch = writeBatch(db);
    let seededCategories = false;
    for (const cat of INITIAL_PRODUCT_CATEGORIES) {
      if (!existingCatIds.has(cat.id)) {
        const dRef = doc(db, 'shop_categories', cat.id);
        batch.set(dRef, {
          ...cat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        seededCategories = true;
      }
    }

    // Seed products
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const existingIds = new Set(snap.docs.map((d) => d.id));
    const missingProducts = BOUTIQUE_PRODUCTS.filter((p) => !existingIds.has(p.id));

    if (missingProducts.length > 0 || seededCategories) {
      console.log(`Seeding shop data into Firestore...`);
      for (const product of missingProducts) {
        const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
        batch.set(docRef, {
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      await batch.commit();
      console.log('Successfully synced boutique data into Firestore');
      isSeedingInProgress = false;
      return true;
    }
    isSeedingInProgress = false;
    return false;
  } catch (err) {
    console.error('Error checking or seeding Firestore products:', err);
    isSeedingInProgress = false;
    return false;
  }
}

export const PRODUCTS_STORAGE_KEY = 'elimi_products_storage';
export const PRODUCTS_SYNC_EVENT = 'elimi_sync_products';

/**
 * Hook to subscribe to real-time products collection from Firestore.
 */
export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>(BOUTIQUE_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initial stored items loaded after mount to prevent SSR mismatch
    queueMicrotask(() => {
      const initialStored = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
      setProducts(initialStored);
      
      // Also fetch latest items from the server-side catalog
      fetchServerCatalog<Product>('products').then((serverItems) => {
        if (serverItems && serverItems.length > 0) {
          saveStoredItems(PRODUCTS_STORAGE_KEY, serverItems);
          setProducts(serverItems);
        }
      }).catch(() => {});
    });

    // 2. Listen to custom sync events and storage
    const handleSync = () => {
      const updated = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
      setProducts(updated);
    };

    window.addEventListener(PRODUCTS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 3. Live subscription to Firestore
    let unsubscribe: (() => void) | undefined;
    try {
      const q = collection(db, PRODUCTS_COLLECTION);
      unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (!snapshot.empty) {
            const liveProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              liveProducts.push({
                ...data,
                id: docSnap.id,
              });
            });

            saveStoredItems(PRODUCTS_STORAGE_KEY, liveProducts);
            setProducts(liveProducts);
            setIsLive(true);
          } else {
            // If empty in Firestore, trigger background seeding so public catalog is ready
            seedInitialProductsIfEmpty().catch(() => {});
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firestore onSnapshot note (using cache):', err?.message || err);
          setProducts(getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS));
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.warn('Firestore products listener setup note:', err);
    }

    return () => {
      window.removeEventListener(PRODUCTS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    products,
    loading,
    error,
    isLive,
  };
}

/**
 * Hook to subscribe in real-time to a single product document by ID.
 */
export function useRealtimeProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(() => {
    if (!productId) return null;
    return BOUTIQUE_PRODUCTS.find((p) => p.id === productId) || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    if (!productId) {
      queueMicrotask(() => {
        setLoading(false);
        setProduct(null);
      });
      return;
    }

    // Check stored items on mount
    queueMicrotask(() => {
      const stored = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
      const foundStored = stored.find((p) => p.id === productId) || BOUTIQUE_PRODUCTS.find((p) => p.id === productId);
      if (foundStored) {
        setProduct(foundStored);
      }
    });

    const handleSync = () => {
      const latestStored = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
      const matched = latestStored.find((p) => p.id === productId);
      if (matched) setProduct(matched);
    };

    window.addEventListener(PRODUCTS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    let unsubscribe: (() => void) | undefined;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const liveDoc = {
              ...(docSnap.data() as Product),
              id: docSnap.id,
            };
            setProduct(liveDoc);
            setIsLive(true);
          } else {
            // Check stored or default fallback
            const latest = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
            const found = latest.find((p) => p.id === productId) || null;
            setProduct(found);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firestore single product listener note:', err);
          setLoading(false);
        }
      );
    } catch {
      queueMicrotask(() => {
        setLoading(false);
      });
    }

    return () => {
      window.removeEventListener(PRODUCTS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, [productId]);

  return { product, loading, isLive };
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

/**
 * Add or save a product directly to Firestore
 */
export async function addProductToFirestore(product: Product): Promise<void> {
  const cleaned: Product = removeUndefinedFields({
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 1. Immediately update local storage and broadcast
  const current = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
  const updatedList = [cleaned, ...current.filter((p) => p.id !== product.id)];
  saveStoredItems(PRODUCTS_STORAGE_KEY, updatedList, PRODUCTS_SYNC_EVENT);

  // 2. Persist to server catalog storage (guarantees cross-device persistence)
  await syncItemToServerCatalog('products', cleaned, 'save');

  // 3. Write to Firestore with safety timeout (never hangs UI)
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, cleaned);
  }, 1500, `Add product ${product.id}`);
}

/**
 * Update an existing product in Firestore
 */
export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
  const existing = current.find((p) => p.id === productId) || BOUTIQUE_PRODUCTS.find((p) => p.id === productId) || { id: productId, name: '', description: '', price: 0, category: 'All', images: [] } as unknown as Product;
  const cleanedUpdates: Product = removeUndefinedFields({
    ...existing,
    ...updates,
    id: productId,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((p) => (p.id === productId ? cleanedUpdates : p));
  if (!updatedList.some((p) => p.id === productId)) {
    updatedList.push(cleanedUpdates);
  }
  saveStoredItems(PRODUCTS_STORAGE_KEY, updatedList, PRODUCTS_SYNC_EVENT);

  // 2. Persist to server catalog storage
  await syncItemToServerCatalog('products', cleanedUpdates, 'save');

  // 3. Write to Firestore with safety timeout (never hangs UI)
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await setDoc(docRef, cleanedUpdates, { merge: true });
  }, 1500, `Update product ${productId}`);
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<Product>(PRODUCTS_STORAGE_KEY, BOUTIQUE_PRODUCTS);
  const updatedList = current.filter((p) => p.id !== productId);
  saveStoredItems(PRODUCTS_STORAGE_KEY, updatedList, PRODUCTS_SYNC_EVENT);

  // 2. Persist deletion to server catalog storage
  await syncItemToServerCatalog('products', productId, 'delete');

  // 3. Delete from Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  }, 1500, `Delete product ${productId}`);
}

/**
 * Calculate review statistics from an array of product reviews.
 */
export function calculateReviewStats(reviews: ProductReview[]) {
  const reviewsCount = reviews.length;
  if (reviewsCount === 0) {
    return {
      reviewsCount: 0,
      rating: 5.0,
      ratingFormatted: '5,0',
      ratingBars: [
        { stars: 5, pct: '100%', count: 0 },
        { stars: 4, pct: '0%', count: 0 },
        { stars: 3, pct: '0%', count: 0 },
        { stars: 2, pct: '0%', count: 0 },
        { stars: 1, pct: '0%', count: 0 },
      ],
    };
  }

  const totalScore = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
  const rating = Number((totalScore / reviewsCount).toFixed(1));
  const ratingFormatted = rating.toFixed(1).replace('.', ',');

  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const ratingBars = [5, 4, 3, 2, 1].map((stars) => {
    const count = starCounts[stars] || 0;
    const pct = `${Math.round((count / reviewsCount) * 100)}%`;
    return { stars, pct, count };
  });

  return {
    reviewsCount,
    rating,
    ratingFormatted,
    ratingBars,
  };
}

/**
 * Saves or updates a review for a specific product in Firestore.
 * - If a review with the same ID or author exists, it updates it.
 * - Updates the product's reviews array, reviewsCount, rating, and ratingBreakdown.
 * - Also persists to the subcollection /products/{productId}/reviews/{reviewId}.
 */
export async function saveProductReviewInFirestore(
  productId: string,
  review: ProductReview,
  fallbackProduct?: Product
): Promise<{ reviews: ProductReview[]; rating: number; reviewsCount: number }> {
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  const docSnap = await getDoc(docRef);

  let existingProductData: Partial<Product> = {};
  let currentReviews: ProductReview[] = [];

  if (docSnap.exists()) {
    existingProductData = docSnap.data() as Partial<Product>;
    if (Array.isArray(existingProductData.reviews)) {
      currentReviews = existingProductData.reviews;
    }
  } else if (fallbackProduct) {
    existingProductData = fallbackProduct;
    if (Array.isArray(fallbackProduct.reviews)) {
      currentReviews = fallbackProduct.reviews;
    }
  } else {
    const staticFallback = BOUTIQUE_PRODUCTS.find((p) => p.id === productId);
    if (staticFallback) {
      existingProductData = staticFallback;
      if (Array.isArray(staticFallback.reviews)) {
        currentReviews = staticFallback.reviews;
      }
    }
  }

  // Check if review already exists to update it, otherwise prepend new review
  const existingIdx = currentReviews.findIndex(
    (r) => r.id === review.id || (r.author.toLowerCase() === review.author.toLowerCase() && review.author.length > 2)
  );

  let updatedReviews: ProductReview[];
  if (existingIdx > -1) {
    updatedReviews = currentReviews.map((r, i) =>
      i === existingIdx ? { ...r, ...review, updatedAt: new Date().toISOString() } : r
    );
  } else {
    updatedReviews = [review, ...currentReviews];
  }

  const { reviewsCount, rating, ratingBars } = calculateReviewStats(updatedReviews);
  const ratingBreakdown: Record<number, number> = {};
  ratingBars.forEach((bar) => {
    ratingBreakdown[bar.stars] = bar.count;
  });

  // 1. Save / merge on the main product document in Firestore
  const updatedDocPayload = removeUndefinedFields({
    ...existingProductData,
    id: productId,
    reviews: updatedReviews,
    reviewsCount,
    rating,
    ratingBreakdown,
    updatedAt: new Date().toISOString(),
  });

  await setDoc(docRef, updatedDocPayload, { merge: true });

  // 2. Also persist in the subcollection /products/{productId}/reviews/{reviewId}
  try {
    const subColReviewRef = doc(db, PRODUCTS_COLLECTION, productId, 'reviews', review.id);
    await setDoc(
      subColReviewRef,
      removeUndefinedFields({
        ...review,
        productId,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (subColErr) {
    console.warn('Subcollection review write note:', subColErr);
  }

  return { reviews: updatedReviews, rating, reviewsCount };
}

/**
 * Hook to retrieve and calculate real-time product reviews and stats directly from Firestore.
 */
export function useRealtimeProductReviews(
  productId: string,
  initialFallbackReviews: ProductReview[] = []
) {
  const fallbackRef = useRef(initialFallbackReviews);
  useEffect(() => {
    fallbackRef.current = initialFallbackReviews;
  }, [initialFallbackReviews]);

  const [reviews, setReviews] = useState<ProductReview[]>(initialFallbackReviews);
  const [loading, setLoading] = useState<boolean>(Boolean(productId));
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    if (!productId) return;

    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
          } else {
            setReviews(fallbackRef.current);
          }
          setIsLive(true);
        } else {
          setReviews(fallbackRef.current);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore reviews listener fallback:', err);
        setReviews(fallbackRef.current);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId]);

  const stats = calculateReviewStats(reviews);

  return {
    reviews,
    ...stats,
    loading,
    isLive,
    saveReview: async (review: ProductReview, fallbackProduct?: Product) => {
      // Optimistic update
      const existingIdx = reviews.findIndex(
        (r) => r.id === review.id || (r.author.toLowerCase() === review.author.toLowerCase() && review.author.length > 2)
      );
      const optimistic =
        existingIdx > -1
          ? reviews.map((r, i) => (i === existingIdx ? { ...r, ...review } : r))
          : [review, ...reviews];
      setReviews(optimistic);

      return await saveProductReviewInFirestore(productId, review, fallbackProduct);
    },
  };
}

/**
 * Add a review to a product document in Firestore (backwards compatibility wrapper).
 */
export async function addReviewToProductInFirestore(
  productId: string,
  review: ProductReview,
  currentReviews: ProductReview[] = [],
  currentRating: number = 5,
  currentReviewsCount: number = 0
): Promise<void> {
  await saveProductReviewInFirestore(productId, review);
}

export const PRODUCT_CATEGORIES_STORAGE_KEY = 'elimi_product_categories_storage';
export const PRODUCT_CATEGORIES_SYNC_EVENT = 'elimi_sync_product_categories';

export function useRealtimeProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_PRODUCT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // 1. Hydrate from storage on mount
    queueMicrotask(() => {
      const stored = getStoredItems<ProductCategory>(PRODUCT_CATEGORIES_STORAGE_KEY, INITIAL_PRODUCT_CATEGORIES);
      setCategories(stored);

      fetchServerCatalog<ProductCategory>('shop_categories').then((serverCats) => {
        if (serverCats && serverCats.length > 0) {
          saveStoredItems(PRODUCT_CATEGORIES_STORAGE_KEY, serverCats);
          setCategories(serverCats);
        }
      }).catch(() => {});
    });

    // 2. Custom sync event listener
    const handleSync = () => {
      const updated = getStoredItems<ProductCategory>(PRODUCT_CATEGORIES_STORAGE_KEY, INITIAL_PRODUCT_CATEGORIES);
      setCategories(updated);
    };

    window.addEventListener(PRODUCT_CATEGORIES_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 3. Live subscription
    let unsubscribe: (() => void) | undefined;
    try {
      const colRef = collection(db, 'shop_categories');
      unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ProductCategory[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...(d.data() as Omit<ProductCategory, 'id'>) });
            });
            list.sort((a, b) => (a.order || 999) - (b.order || 999));

            saveStoredItems(PRODUCT_CATEGORIES_STORAGE_KEY, list);
            setCategories(list);
            setIsLive(true);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Categories onSnapshot note (using resilient cache):', error?.message || error);
          setCategories(getStoredItems<ProductCategory>(PRODUCT_CATEGORIES_STORAGE_KEY, INITIAL_PRODUCT_CATEGORIES));
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription note:', err);
    }

    return () => {
      window.removeEventListener(PRODUCT_CATEGORIES_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { categories, loading, isLive };
}

export async function addProductCategory(category: Omit<ProductCategory, 'id'> & { id?: string }): Promise<string> {
  const id = category.id || `cat-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned: ProductCategory = removeUndefinedFields({
    ...category,
    id,
    createdAt: now,
    updatedAt: now,
  });

  // 1. Immediately update local storage and broadcast
  const current = getStoredItems<ProductCategory>(PRODUCT_CATEGORIES_STORAGE_KEY, INITIAL_PRODUCT_CATEGORIES);
  const updatedList = [...current.filter((c) => c.id !== id), cleaned];
  saveStoredItems(PRODUCT_CATEGORIES_STORAGE_KEY, updatedList, PRODUCT_CATEGORIES_SYNC_EVENT);

  // 2. Persist to server catalog storage
  await syncItemToServerCatalog('shop_categories', cleaned, 'save');

  // 3. Write to Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'shop_categories', id);
    await setDoc(docRef, cleaned);
  }, 1500, `Add category ${id}`);

  return id;
}

export async function updateProductCategory(id: string, updates: Partial<ProductCategory>): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<ProductCategory>(PRODUCT_CATEGORIES_STORAGE_KEY, INITIAL_PRODUCT_CATEGORIES);
  const fallbackCategory = INITIAL_PRODUCT_CATEGORIES.find((c) => c.id === id);
  const existing = current.find((c) => c.id === id) || fallbackCategory || { id, name: '', slug: '', imageUrl: '' };
  const cleaned: ProductCategory = removeUndefinedFields({
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  });

  const updatedList = current.map((c) => (c.id === id ? cleaned : c));
  if (!updatedList.some((c) => c.id === id)) {
    updatedList.push(cleaned);
  }
  saveStoredItems(PRODUCT_CATEGORIES_STORAGE_KEY, updatedList, PRODUCT_CATEGORIES_SYNC_EVENT);

  // 2. Persist to server catalog storage
  await syncItemToServerCatalog('shop_categories', cleaned, 'save');

  // 3. Write to Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'shop_categories', id);
    await setDoc(docRef, cleaned, { merge: true });
  }, 1500, `Update category ${id}`);
}

export async function deleteProductCategory(id: string): Promise<void> {
  // 1. Immediately update local storage
  const current = getStoredItems<ProductCategory>(PRODUCT_CATEGORIES_STORAGE_KEY, INITIAL_PRODUCT_CATEGORIES);
  const updatedList = current.filter((c) => c.id !== id);
  saveStoredItems(PRODUCT_CATEGORIES_STORAGE_KEY, updatedList, PRODUCT_CATEGORIES_SYNC_EVENT);

  // 2. Persist deletion to server catalog storage
  await syncItemToServerCatalog('shop_categories', id, 'delete');

  // 3. Delete from Firestore with safety timeout
  runFirestoreTaskSafe(async () => {
    const docRef = doc(db, 'shop_categories', id);
    await deleteDoc(docRef);
  }, 1500, `Delete category ${id}`);
}

