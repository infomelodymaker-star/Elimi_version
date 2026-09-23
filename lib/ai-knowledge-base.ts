/**
 * Comprehensive Knowledge Base & Real-Time Context Engine for ELIMI AI Assistant (Monica).
 * Features:
 * 1. Dynamic Contact Information retrieval directly from Firestore 'settings' document.
 * 2. Intent-Based Context Routing: Analyzes incoming user messages to consult ONLY relevant domain data,
 *    substantially reducing token usage and boosting response speed.
 * 3. Real data integration across Allocations/Other Rents, Protocol, Digital Solutions, Luxury Fleet,
 *    Boutique Products, Residences, Print, and Media.
 */

import { BOUTIQUE_PRODUCTS, Product } from './products';
import { SAMPLE_CARS, Car } from './firestore-cars';
import { SAMPLE_HOUSES, House } from './firestore-houses';
import { INITIAL_RENTAL_ITEMS, INITIAL_RENTAL_CATEGORIES, RentalItem, RentalCategory } from './firestore-rentals';
import { INITIAL_EVENT_SERVICES, EventServiceItem } from './firestore-event-services';
import { DEFAULT_SETTINGS, GlobalSettings } from './firestore-settings';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface DomainIntents {
  rentals: boolean;          // Allocations, other rents, gala dresses, suits, AV gear, event items
  protocol: boolean;         // VIP Protocol officers, hostesses, event staffing, summit packages
  digitalSolutions: boolean; // Mobile apps, web development, custom software, SEO, Google Maps integration
  cars: boolean;             // Luxury chauffeured fleet, Mercedes V-Class, Prado, Maybach, Escalade
  houses: boolean;           // High-end villas, apartments, residential real estate for rent/sale
  products: boolean;         // Boutique shop items, fashion, drones, tech, nail kits, baskets
  print: boolean;            // Roll-up banners, merchandise, corporate stationery, fast proofing
  media: boolean;            // YouTube channel @elimimedia, Police Elimi, Muvuto, video productions
  contact: boolean;          // Contact information, phone, WhatsApp, location, exchange rate
  isGeneralQuery: boolean;   // Greeting, general overview, or broad multi-service question
}

export interface TargetedFirestoreData {
  settings: GlobalSettings;
  products?: Product[];
  cars?: Car[];
  houses?: House[];
  rentals?: RentalItem[];
  rentalCategories?: RentalCategory[];
  eventServices?: EventServiceItem[];
  activeIntents: DomainIntents;
  source: 'live-firestore' | 'static-fallback';
}

// In-memory caches with 60-second TTL to balance freshness with speed and quota efficiency
const CACHE_TTL_MS = 60 * 1000;

let cachedSettings: { data: GlobalSettings; timestamp: number } | null = null;
let cachedProducts: { data: Product[]; timestamp: number } | null = null;
let cachedCars: { data: Car[]; timestamp: number } | null = null;
let cachedHouses: { data: House[]; timestamp: number } | null = null;
let cachedRentals: { items: RentalItem[]; categories: RentalCategory[]; timestamp: number } | null = null;
let cachedEventServices: { data: EventServiceItem[]; timestamp: number } | null = null;

/**
 * Fast asynchronous Firestore fetcher with defensive timeout protection.
 */
async function fetchWithTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Firestore timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

/**
 * Retrieves the latest contact information and settings directly from the Firestore 'settings' document.
 */
export async function fetchLiveSettings(): Promise<GlobalSettings> {
  const now = Date.now();
  if (cachedSettings && now - cachedSettings.timestamp < CACHE_TTL_MS) {
    return cachedSettings.data;
  }

  try {
    const docRef = doc(db, 'settings', 'global');
    const snap = await fetchWithTimeout(getDoc(docRef), 1500);
    if (snap.exists()) {
      const data = snap.data() as Partial<GlobalSettings>;
      const freshSettings: GlobalSettings = {
        usdToBifRate: data.usdToBifRate || DEFAULT_SETTINGS.usdToBifRate,
        contactEmail: data.contactEmail || DEFAULT_SETTINGS.contactEmail,
        contactPhone: data.contactPhone || data.phoneNumber || DEFAULT_SETTINGS.contactPhone,
        phoneNumber: data.phoneNumber || data.contactPhone || DEFAULT_SETTINGS.phoneNumber,
        whatsappNumber: data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
      };
      cachedSettings = { data: freshSettings, timestamp: now };
      return freshSettings;
    }
  } catch (err) {
    console.warn('Live settings document fetch note (using fallback):', err);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Analyzes the user's message (and recent conversation history) to detect
 * which specific business domains are being referenced.
 * Enables selective data retrieval to dramatically conserve tokens.
 */
export function analyzeUserIntent(message: string, history?: any[]): DomainIntents {
  const textToScan = [
    message,
    ...(Array.isArray(history)
      ? history.slice(-2).map((h) => (typeof h?.text === 'string' ? h.text : ''))
      : []),
  ]
    .join(' ')
    .toLowerCase();

  const intents: DomainIntents = {
    rentals: /(allocat|other-rent|other rent|location tenue|louer robe|robe|costume|smoking|habit|tenue|tailleur|vetement|camera|sonorisation|sound|micro|dj|materiel|chaise|decor|equipment|gala dress|maternite|denim)/i.test(
      textToScan
    ),
    protocol: /(protocol|protocole|hotesse|hostess|agent|escort|vip|sommet|summit|conference|gala|diplomat|officer|staffing|ceremony|mariage|wedding|precedence)/i.test(
      textToScan
    ),
    digitalSolutions: /(digital|solution|application|app|mobile|website|site web|web|developpement|software|logiciel|crm|dashboard|pos|google map|seo|marketing|flutter|react|fullstack|programme)/i.test(
      textToScan
    ),
    cars: /(car|voiture|vehicule|vehicle|fleet|flotte|mercedes|v-class|vclass|prado|toyota|range rover|maybach|escalade|chauffeur|driver|transport|location voiture)/i.test(
      textToScan
    ),
    houses: /(house|maison|villa|appartement|apartment|residence|immeuble|chambre|bedroom|immobilier|real estate|logement|beachfront)/i.test(
      textToScan
    ),
    products: /(shop|boutique|produit|product|acheter|buy|drone|airpod|hoodie|jacket|agaseke|panier|basket|nail|ongle|drill|polish|gel-x|chaussure|shoes|loafer)/i.test(
      textToScan
    ),
    print: /(print|imprimerie|imprimer|banner|roll-up|rollup|affiche|carte de visite|business card|tote|polo|packaging|merchandise|flyer|depliant)/i.test(
      textToScan
    ),
    media: /(media|m\u00e9dia|youtube|video|police elimi|muvuto|show|broadcast|emission|tournage)/i.test(
      textToScan
    ),
    contact: /(contact|phone|telephone|numero|whatsapp|email|adresse|location|where|office|bureau|heures|hours|taux|rate|exchange|bif|dollar)/i.test(
      textToScan
    ),
    isGeneralQuery: false,
  };

  const domainCount =
    (intents.rentals ? 1 : 0) +
    (intents.protocol ? 1 : 0) +
    (intents.digitalSolutions ? 1 : 0) +
    (intents.cars ? 1 : 0) +
    (intents.houses ? 1 : 0) +
    (intents.products ? 1 : 0) +
    (intents.print ? 1 : 0) +
    (intents.media ? 1 : 0);

  if (domainCount === 0) {
    intents.isGeneralQuery = true;
  }

  return intents;
}

/**
 * Selectively fetches ONLY the data needed for the detected intents from Firestore.
 * Prevents loading all collections simultaneously, keeping token overhead minimal.
 */
export async function fetchTargetedFirestoreData(
  intents: DomainIntents
): Promise<TargetedFirestoreData> {
  const now = Date.now();

  // 1. Always fetch live settings from the database
  const settings = await fetchLiveSettings();

  let products: Product[] | undefined;
  let cars: Car[] | undefined;
  let houses: House[] | undefined;
  let rentals: RentalItem[] | undefined;
  let rentalCategories: RentalCategory[] | undefined;
  let eventServices: EventServiceItem[] | undefined;
  let hasLiveHit = false;

  const fetchTasks: Promise<any>[] = [];

  // Targeted fetch for Rentals / Allocations
  if (intents.rentals) {
    if (cachedRentals && now - cachedRentals.timestamp < CACHE_TTL_MS) {
      rentals = cachedRentals.items;
      rentalCategories = cachedRentals.categories;
    } else {
      fetchTasks.push(
        fetchWithTimeout(getDocs(collection(db, 'rental_items')), 1500)
          .then((snap) => {
            if (!snap.empty) {
              const liveItems: RentalItem[] = [];
              snap.forEach((d) => liveItems.push({ ...(d.data() as RentalItem), id: d.id }));
              rentals = liveItems;
              hasLiveHit = true;
            }
          })
          .catch(() => {})
      );

      fetchTasks.push(
        fetchWithTimeout(getDocs(collection(db, 'rental_categories')), 1500)
          .then((snap) => {
            if (!snap.empty) {
              const liveCats: RentalCategory[] = [];
              snap.forEach((d) => liveCats.push({ ...(d.data() as RentalCategory), id: d.id }));
              rentalCategories = liveCats;
              hasLiveHit = true;
            }
          })
          .catch(() => {})
      );
    }
  }

  // Targeted fetch for Protocol / Event Services
  if (intents.protocol) {
    if (cachedEventServices && now - cachedEventServices.timestamp < CACHE_TTL_MS) {
      eventServices = cachedEventServices.data;
    } else {
      fetchTasks.push(
        fetchWithTimeout(getDocs(collection(db, 'event_services')), 1500)
          .then((snap) => {
            if (!snap.empty) {
              const liveServices: EventServiceItem[] = [];
              snap.forEach((d) => liveServices.push({ ...(d.data() as EventServiceItem), id: d.id }));
              eventServices = liveServices;
              hasLiveHit = true;
            }
          })
          .catch(() => {})
      );
    }
  }

  // Targeted fetch for Luxury Fleet / Cars
  if (intents.cars) {
    if (cachedCars && now - cachedCars.timestamp < CACHE_TTL_MS) {
      cars = cachedCars.data;
    } else {
      fetchTasks.push(
        fetchWithTimeout(getDocs(collection(db, 'cars')), 1500)
          .then((snap) => {
            if (!snap.empty) {
              const liveCars: Car[] = [];
              snap.forEach((d) => liveCars.push({ ...(d.data() as Car), id: d.id }));
              cars = liveCars;
              hasLiveHit = true;
            }
          })
          .catch(() => {})
      );
    }
  }

  // Targeted fetch for Real Estate / Houses
  if (intents.houses) {
    if (cachedHouses && now - cachedHouses.timestamp < CACHE_TTL_MS) {
      houses = cachedHouses.data;
    } else {
      fetchTasks.push(
        fetchWithTimeout(getDocs(collection(db, 'houses')), 1500)
          .then((snap) => {
            if (!snap.empty) {
              const liveHouses: House[] = [];
              snap.forEach((d) => liveHouses.push({ ...(d.data() as House), id: d.id }));
              houses = liveHouses;
              hasLiveHit = true;
            }
          })
          .catch(() => {})
      );
    }
  }

  // Targeted fetch for Boutique Products
  if (intents.products) {
    if (cachedProducts && now - cachedProducts.timestamp < CACHE_TTL_MS) {
      products = cachedProducts.data;
    } else {
      fetchTasks.push(
        fetchWithTimeout(getDocs(collection(db, 'products')), 1500)
          .then((snap) => {
            if (!snap.empty) {
              const liveProducts: Product[] = [];
              snap.forEach((d) => liveProducts.push({ ...(d.data() as Product), id: d.id }));
              products = liveProducts;
              hasLiveHit = true;
            }
          })
          .catch(() => {})
      );
    }
  }

  if (fetchTasks.length > 0) {
    await Promise.allSettled(fetchTasks);
  }

  // Update caches if fresh live data was fetched
  if (intents.rentals) {
    const finalRentals = Array.isArray(rentals) && rentals.length > 0 ? rentals : INITIAL_RENTAL_ITEMS;
    const finalCats = Array.isArray(rentalCategories) && rentalCategories.length > 0 ? rentalCategories : INITIAL_RENTAL_CATEGORIES;
    cachedRentals = { items: finalRentals, categories: finalCats, timestamp: now };
    rentals = finalRentals;
    rentalCategories = finalCats;
  }

  if (intents.protocol) {
    const finalEvents = Array.isArray(eventServices) && eventServices.length > 0 ? eventServices : INITIAL_EVENT_SERVICES;
    cachedEventServices = { data: finalEvents, timestamp: now };
    eventServices = finalEvents;
  }

  if (intents.cars) {
    const finalCars = Array.isArray(cars) && cars.length > 0 ? cars : SAMPLE_CARS;
    cachedCars = { data: finalCars, timestamp: now };
    cars = finalCars;
  }

  if (intents.houses) {
    const finalHouses = Array.isArray(houses) && houses.length > 0 ? houses : SAMPLE_HOUSES;
    cachedHouses = { data: finalHouses, timestamp: now };
    houses = finalHouses;
  }

  if (intents.products) {
    const finalProducts = Array.isArray(products) && products.length > 0 ? products : BOUTIQUE_PRODUCTS;
    cachedProducts = { data: finalProducts, timestamp: now };
    products = finalProducts;
  }

  return {
    settings,
    products,
    cars,
    houses,
    rentals,
    rentalCategories,
    eventServices,
    activeIntents: intents,
    source: hasLiveHit ? 'live-firestore' : 'static-fallback',
  };
}

/**
 * Constructs a dynamic, highly targeted, token-efficient system instruction.
 * Only includes detailed database records for the domains relevant to the user query.
 */
export function buildTargetedSystemInstruction(targetedData: TargetedFirestoreData): string {
  const { settings, activeIntents } = targetedData;
  const rawPhone = settings.contactPhone || settings.phoneNumber || '+257 69 99 29 84';
  const rawWhatsApp = (settings.whatsappNumber || '25769992984').replace(/[^0-9]/g, '');
  const contactEmail = settings.contactEmail || 'elimiofficiel@gmail.com';
  const usdRate = settings.usdToBifRate || 2850;

  const dynamicContextBlocks: string[] = [];

  // 1. Rentals & Allocations Context
  if (activeIntents.rentals && Array.isArray(targetedData.rentals)) {
    const rentalLines = targetedData.rentals
      .slice(0, 10)
      .map(
        (r) =>
          `• [${r.categoryName || 'Allocation'}] ${r.name} (${r.brand || 'ELIMI'}): $${r.pricePerDay}/day (~${(r.pricePerDay * usdRate).toLocaleString()} BIF) | Sizes: ${r.sizes?.join(', ') || 'Standard'}`
      )
      .join('\n');

    dynamicContextBlocks.push(`[CONSULTED DATA: Allocations & Wardrobe/Equipment Rentals (/allocations, /other-rents)]
${rentalLines}
Features: Gala gowns, business suits, maternity attire, cameras, DJ and sound equipment with express delivery.`);
  }

  // 2. VIP Protocol & Event Services Context
  if (activeIntents.protocol) {
    const servicesLines = Array.isArray(targetedData.eventServices)
      ? targetedData.eventServices
          .slice(0, 6)
          .map((s) => `• ${s.title}: $${s.unitPrice} (${s.description})`)
          .join('\n')
      : '';

    dynamicContextBlocks.push(`[CONSULTED DATA: VIP Protocol & Event Staffing (/protocol)]
${servicesLines}
• Tier 1: Certified Protocol Officers (Diplomatic order of precedence, state summits, bilateral MOUs)
• Tier 2: VIP Hostesses & Escorts (Multilingual: French, English, Kirundi, Swahili; airport VIP reception)
• Tier 3: Operational Floor & Press Marshals (Crowd dynamics, motorcade staging)
• Tier 4: Ceremonial & Stage Attendants (Award handovers, ribbon cutting)
Packages: Executive Bilateral (4-8 staff), Corporate Summit (12-24 staff), State Gala (30-60+ staff).`);
  }

  // 3. Digital Solutions & Marketing Context
  if (activeIntents.digitalSolutions) {
    dynamicContextBlocks.push(`[CONSULTED DATA: Digital Solutions & Web Platforms (/digital-solutions, /digital-marketing)]
• Mobile Apps Development: Native iOS & Android with React Native and Flutter, offline sync, biometric auth.
• Web Platforms & Portals: Ultra-fast Next.js architecture, headless CMS, e-commerce checkout.
• Custom Dashboards & ERP: Inventory systems, POS, CRM, and real-time operational analytics.
• Google Maps & Local SEO: Strategic Google Business profile optimization, geo-targeted search dominance.
• Digital Marketing Agency: Omnichannel growth strategies (+240% average ROI), 4K video/reels production, social media management.`);
  }

  // 4. Luxury Mobility Fleet Context
  if (activeIntents.cars && Array.isArray(targetedData.cars)) {
    const carLines = targetedData.cars
      .slice(0, 6)
      .map(
        (c) =>
          `• ${c.title} (${c.year || 2024}, ${c.seats || 5} seats): Rent $${c.rentPrice || 'N/A'}/day | Sale $${(c.price || 0).toLocaleString()} | ${c.amenities?.slice(0, 2).join(', ') || 'Chauffeured'}`
      )
      .join('\n');

    dynamicContextBlocks.push(`[CONSULTED DATA: Luxury Chauffeured Fleet (/cars)]
${carLines}
All vehicles include professional executive chauffeurs, VIP air conditioning, insurance, and diplomatic convoy readiness.`);
  }

  // 5. Real Estate Context
  if (activeIntents.houses && Array.isArray(targetedData.houses)) {
    const houseLines = targetedData.houses
      .slice(0, 5)
      .map(
        (h) =>
          `• ${h.title} in ${h.address} (${h.bedrooms} bed): ${h.rent ? `Rent $${h.rentPrice}/mo` : ''} ${h.sales ? `Sale $${(h.price || 0).toLocaleString()}` : ''}`
      )
      .join('\n');

    dynamicContextBlocks.push(`[CONSULTED DATA: Luxury Residences & Villas (/houses)]
${houseLines}`);
  }

  // 6. Boutique Products Context
  if (activeIntents.products && Array.isArray(targetedData.products)) {
    const prodLines = targetedData.products
      .slice(0, 8)
      .map(
        (p) =>
          `• [${p.category}] ${p.name}: ${p.priceBIF?.toLocaleString()} BIF (~$${p.priceUSD}) | Stock: ${p.stockQuantity > 0 ? `${p.stockQuantity} avail` : 'Pre-order'}`
      )
      .join('\n');

    dynamicContextBlocks.push(`[CONSULTED DATA: Boutique & Tech Store (/shop)]
${prodLines}
Same-day express delivery across Bujumbura.`);
  }

  // 7. Print Solutions Context
  if (activeIntents.print) {
    dynamicContextBlocks.push(`[CONSULTED DATA: ELIMI Print Hub (/print)]
• Roll-Up Banners: Sturdy aluminum cassette, anti-curl vinyl, UV print with carry bag. Same-day turnaround.
• Corporate Merchandise: Screen-printed & embroidered polos, hoodies, canvas totes, engraved pens.
• Luxury Stationery: Gold/silver foil stamping, soft-touch matte lamination, spot UV, embossed invitations.
• Fast Proofing & Bulk Discounts (10% - 35% savings).`);
  }

  // 8. Media Context
  if (activeIntents.media) {
    dynamicContextBlocks.push(`[CONSULTED DATA: ELIMI Média (/media)]
• YouTube Channel @elimimedia: Hit series "Police Elimi", "Muvuto", VIP talk shows, shoppable video streams.`);
  }

  const activeConsultedContext =
    dynamicContextBlocks.length > 0
      ? dynamicContextBlocks.join('\n\n')
      : `[GENERAL PILLARS OVERVIEW]
• VIP Protocol & Staffing (/protocol)
• Allocations & Wardrobe/Equipment Rentals (/allocations, /other-rents)
• Luxury Chauffeured Fleet (/cars)
• Boutique & Tech Marketplace (/shop)
• Digital Solutions & Web Platforms (/digital-solutions, /digital-marketing)
• Precision Print Solutions (/print)
• Luxury Residences & Villas (/houses)
• ELIMI Média Broadcasts (/media)`;

  return `You are Monica, the intelligent, warm, and sophisticated ELIMI AI Concierge representing the ELIMI Group in Burundi and East Africa.

LIVE SETTINGS & CONTACT (FROM DATABASE):
- Phone: ${rawPhone}
- WhatsApp Concierge: https://wa.me/${rawWhatsApp} (${rawPhone})
- Email: ${contactEmail}
- Base Location: Bujumbura, Burundi (operating nationwide in Gitega, Ngozi, Kirundo & EAC region)
- Operating Hours: Monday - Friday 09:00 - 17:00 (24/7 VIP Concierge on WhatsApp)
- Currency Conversion: 1 USD ≈ ${usdRate.toLocaleString()} BIF. Both BIF and USD are accepted.

${activeConsultedContext}

COMMUNICATION & CONCIERGE RULES:
- Greet warmly ("Muraho! / Hello!").
- Give concise, direct, helpful answers formatted with Markdown.
- Quote prices accurately in BIF and USD based on the consulted data and the rate (1 USD ≈ ${usdRate.toLocaleString()} BIF).
- Always provide active markdown links to relevant sections: [Protocol Hub](/protocol), [Allocations](/allocations), [Other Rents](/other-rents), [Luxury Fleet](/cars), [Digital Solutions](/digital-solutions), [Elimi Shop](/shop), [Print Hub](/print), [WhatsApp Concierge](https://wa.me/${rawWhatsApp}), etc.
- When the user asks for contact details or booking, direct them to WhatsApp (https://wa.me/${rawWhatsApp}) or ${rawPhone}.
- Keep replies concise, fast, and high-value without unnecessary fluff.`;
}

/**
 * Legacy compatibility wrapper for existing callers.
 */
export async function fetchLiveFirestoreSnapshot() {
  const targeted = await fetchTargetedFirestoreData({
    rentals: false,
    protocol: false,
    digitalSolutions: false,
    cars: true,
    houses: true,
    products: true,
    print: false,
    media: false,
    contact: true,
    isGeneralQuery: true,
  });

  return {
    products: targeted.products || BOUTIQUE_PRODUCTS,
    cars: targeted.cars || SAMPLE_CARS,
    houses: targeted.houses || SAMPLE_HOUSES,
    source: targeted.source,
  };
}

export function buildEnhancedSystemInstruction(liveDbData?: any): string {
  return buildTargetedSystemInstruction({
    settings: DEFAULT_SETTINGS,
    products: liveDbData?.products || BOUTIQUE_PRODUCTS,
    cars: liveDbData?.cars || SAMPLE_CARS,
    houses: liveDbData?.houses || SAMPLE_HOUSES,
    activeIntents: {
      rentals: true,
      protocol: true,
      digitalSolutions: true,
      cars: true,
      houses: true,
      products: true,
      print: true,
      media: true,
      contact: true,
      isGeneralQuery: true,
    },
    source: 'live-firestore',
  });
}

