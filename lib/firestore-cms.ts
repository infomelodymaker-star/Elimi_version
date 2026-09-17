import { doc, getDoc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { useState, useEffect } from 'react';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface CmsSection {
  id: string;
  type: 'hero' | 'text' | 'gallery' | 'features';
  content: any;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  sections: CmsSection[];
  lastUpdated: string;
}

export const INITIAL_CMS_PAGES: CmsPage[] = [
  {
    id: 'home',
    title: 'Home Page',
    slug: '/',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Excellence Beyond Expectations.',
          subheadline: 'PROFESSIONALISM. PRECISION. PRESENCE.',
          backgroundImage: '/assets/protocol/PROTOCOL_SECTION.webp',
        },
      },
      {
        id: 'services',
        type: 'features',
        content: {
          title: 'Our Services',
          items: [
            'VIP Protocol',
            'Premium Shopping',
            'Luxury Car Rental',
            'Real Estate',
            'Media Production',
            'Printing Services',
            'Nail Salon',
          ],
        },
      },
    ],
  },
  {
    id: 'protocol',
    title: 'Protocol Page',
    slug: '/protocol',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Elite VIP Protocol Services',
          subheadline: 'Professionalism at its peak',
          backgroundImage: '/assets/protocol/PROTOCOL_SECTION.webp',
        },
      },
    ],
  },
  {
    id: 'shop',
    title: 'Shop Page',
    slug: '/shop',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Premium Shopping Experience',
          subheadline: 'STYLE. ELEGANCE. QUALITY.',
          backgroundImage: '/assets/shop/shop_hero_showcase.jpg',
        },
      },
    ],
  },
  {
    id: 'cars',
    title: 'Cars Page',
    slug: '/cars',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Drive Your Dream',
          subheadline: 'LUXURY. SPEED. COMFORT.',
          backgroundImage:
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1600',
        },
      },
    ],
  },
  {
    id: 'houses',
    title: 'Houses Page',
    slug: '/houses',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Find Your Home',
          subheadline: 'SPACE. LIVING. COMFORT.',
          backgroundImage:
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80',
        },
      },
    ],
  },
];

export const CMS_STORAGE_KEY = 'elimi_cms_pages_storage';
export const CMS_SYNC_EVENT = 'elimi_sync_cms_pages';

export function useCmsPage(pageId: string) {
  const [data, setData] = useState<any>(() => {
    const pages = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
    return pages.find((p) => p.id === pageId) || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      const updated = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
      const matched = updated.find((p) => p.id === pageId);
      if (matched) setData(matched);
    };

    window.addEventListener(CMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // Safe Firestore listener
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onSnapshot(
        doc(db, 'cms_pages', pageId),
        (docSnap) => {
          if (docSnap.exists()) {
            setData(docSnap.data());
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch {
      // Retain existing cached data
    }

    return () => {
      window.removeEventListener(CMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, [pageId]);

  return { data, loading };
}

