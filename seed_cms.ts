const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialPages = [
  {
    id: 'home', title: 'Home Page', slug: '/', lastUpdated: new Date().toISOString(),
    sections: [
      { id: 'hero', type: 'hero', content: { headline: 'Excellence Beyond Expectations.', subheadline: 'PROFESSIONALISM. PRECISION. PRESENCE.', backgroundImage: '/assets/protocol/PROTOCOL_SECTION.webp' } },
      { id: 'services', type: 'features', content: { title: 'Our Services', items: ['VIP Protocol', 'Premium Shopping', 'Luxury Car Rental', 'Real Estate', 'Media Production', 'Printing Services', 'Nail Salon'] } }
    ]
  },
  {
    id: 'protocol', title: 'Protocol Page', slug: '/protocol', lastUpdated: new Date().toISOString(),
    sections: [{ id: 'hero', type: 'hero', content: { headline: 'Elite VIP Protocol Services', subheadline: 'Professionalism at its peak', backgroundImage: '/assets/protocol/PROTOCOL_SECTION.webp' } }]
  },
  {
    id: 'shop', title: 'Shop Page', slug: '/shop', lastUpdated: new Date().toISOString(),
    sections: [{ id: 'hero', type: 'hero', content: { headline: 'Premium Shopping Experience', subheadline: 'STYLE. ELEGANCE. QUALITY.', backgroundImage: '/assets/shop/shop_hero_showcase.jpg' } }]
  },
  {
    id: 'cars', title: 'Cars Page', slug: '/cars', lastUpdated: new Date().toISOString(),
    sections: [{ id: 'hero', type: 'hero', content: { headline: 'Drive Your Dream', subheadline: 'LUXURY. SPEED. COMFORT.', backgroundImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1600' } }]
  },
  {
    id: 'houses', title: 'Houses Page', slug: '/houses', lastUpdated: new Date().toISOString(),
    sections: [{ id: 'hero', type: 'hero', content: { headline: 'Find Your Home', subheadline: 'SPACE. LIVING. COMFORT.', backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80' } }]
  }
];

async function seed() {
  for (const page of initialPages) {
    await setDoc(doc(db, 'cms_pages', page.id), page);
    console.log(`Seeded ${page.id}`);
  }
  process.exit(0);
}
seed();
