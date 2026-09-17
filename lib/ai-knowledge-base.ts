/**
 * Comprehensive Knowledge Base & Real-Time Context Engine for ELIMI AI Assistant (Monica).
 * Contains domain knowledge, business models, pricing rules, service tiers, and live Firestore sync.
 */

import { BOUTIQUE_PRODUCTS, Product } from './products';
import { SAMPLE_CARS, Car } from './firestore-cars';
import { SAMPLE_HOUSES, House } from './firestore-houses';
import { MARKET_PRODUCTS } from '../app/media/data';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface BusinessKnowledge {
  company: {
    name: string;
    assistantName: string;
    tagline: string;
    location: string;
    operatingRegions: string[];
    phone: string;
    whatsapp: string;
    email: string;
    hours: string;
    currency: {
      primary: string;
      secondary: string;
      exchangeRateNote: string;
    };
  };
  pillars: Record<string, any>;
  faqAndRules: Record<string, string>;
}

export const ELIMI_BUSINESS_KNOWLEDGE: BusinessKnowledge = {
  company: {
    name: 'ELIMI Group',
    assistantName: 'Monica',
    tagline: 'Your Premier VIP Protocol, E-Commerce, Printing & Digital Media Partner in Burundi',
    location: 'Bujumbura, Burundi',
    operatingRegions: ['Bujumbura', 'Gitega', 'Ngozi', 'Kirundo', 'East Africa (EAC)', 'Great Lakes Region'],
    phone: '+257 64 44 45 46',
    whatsapp: 'https://wa.me/25764444546 (+257 64 44 45 46)',
    email: 'elimiofficiel@gmail.com',
    hours: 'Monday to Friday: 09:00 - 17:00 (24/7 on-call VIP concierge dispatch via WhatsApp)',
    currency: {
      primary: 'BIF (Burundian Franc)',
      secondary: 'USD ($)',
      exchangeRateNote: 'Approx. 1 USD = 2,900 - 3,000 BIF. Both currencies accepted for all transactions.',
    },
  },
  pillars: {
    protocolAndMobility: {
      route: '/protocol',
      name: 'ELIMI Protocol & VIP Escort Services',
      description: 'Diplomatic, corporate, and private event protocol staffing, delegation stewardship, and luxury chauffeured fleet.',
      tiers: [
        {
          tier: 'Tier 1: Certified Protocol Officers',
          role: 'Governance, Diplomatic Precedence & Command',
          responsibilities: [
            'State summit & international conference coordination',
            'Order of precedence for heads of state, ministers, and corporate executives',
            'National flag & anthem etiquette and dais/podium choreography',
            'Bilateral treaty and MOU signing ceremony supervision',
          ],
        },
        {
          tier: 'Tier 2: VIP Hostesses & Escorts',
          role: 'High-Level Hospitality & Delegation Flow',
          responsibilities: [
            'Multilingual welcoming (French, English, Kirundi, Swahili)',
            'Airport tarmac receiving lines & VIP lounge stewardess service',
            'Red carpet registration, badge distribution, and reserved seating ushering',
            'Cocktail gala & banquet table coordination',
          ],
        },
        {
          tier: 'Tier 3: Floor & Press Marshals',
          role: 'Operational Security & Media Logistics',
          responsibilities: [
            'Crowd dynamics & high-traffic corridor management',
            'Media pool positioning, press conference staging & microphone coordination',
            'Motorcade staging and executive vehicle arrival/departure alignment',
          ],
        },
        {
          tier: 'Tier 4: Ceremonial & Stage Attendants',
          role: 'Stage Presence & Presentation Logistics',
          responsibilities: [
            'White-glove trophy, medal, and plaque handovers',
            'Ribbon-cutting & ceremonial shears presentation',
            'Speaker timing cues and rostrum readiness',
          ],
        },
      ],
      eventSizingPackages: [
        {
          name: 'Executive Bilateral Package',
          recommendedStaff: '4 - 8 specialists',
          idealFor: 'Diplomatic meetings, executive roundtables, private VIP dinners',
          fleetOption: '1-2 Mercedes V-Class or Prado escort vehicles',
        },
        {
          name: 'Corporate Summit & Conference Package',
          recommendedStaff: '12 - 24 specialists',
          idealFor: 'Regional symposiums, corporate product launches, trade exhibitions',
          fleetOption: 'Convoy of 3-5 executive vehicles with lead escort',
        },
        {
          name: 'State Gala & International Festival Package',
          recommendedStaff: '30 - 60+ specialists',
          idealFor: 'Government state visits, stadium events, major televised awards galas',
          fleetOption: 'Full multi-car fleet with police escort synchronization',
        },
      ],
      fleetRoute: '/cars',
      fleetVehicles: [
        {
          name: 'Mercedes-Benz V-Class VIP Edition',
          seats: 7,
          rentPrice: '$350 / day',
          salePrice: '$115,000',
          features: 'Captain recliner massage seats, ambient starlight ceiling, high-speed Wi-Fi, tinted privacy glass, executive chauffeur.',
        },
        {
          name: 'Toyota Land Cruiser Prado TX-L',
          seats: 7,
          rentPrice: '$200 / day',
          salePrice: '$85,000',
          features: 'Full-time 4WD, all-terrain diplomatic convoy capability, cool box refrigerator, 360 panoramic cameras.',
        },
        {
          name: 'Range Rover Autobiography LWB',
          seats: 5,
          rentPrice: '$650 / day',
          salePrice: '$185,000',
          features: 'Twin-Turbo V8, executive rear lounge, ultra-quiet acoustic glazing.',
        },
        {
          name: 'Mercedes-Maybach S 580 4MATIC',
          seats: 4,
          rentPrice: '$800 / day',
          salePrice: '$230,000',
          features: 'Presidential comfort, first-class airline reclining seats, Burmester 4D sound, active noise cancellation.',
        },
        {
          name: 'Cadillac Escalade ESV Platinum',
          seats: 7,
          rentPrice: '$400 / day',
          salePrice: '$125,000',
          features: 'Curved OLED screen, extended luggage cargo, commanding road presence.',
        },
      ],
    },
    shopAndBoutique: {
      route: '/shop',
      name: 'ELIMI Shop & Luxury Boutique',
      description: 'Curated e-commerce with both instant purchase and rental options across fashion, tech, cultural crafts, and salon beauty.',
      categories: [
        {
          name: 'VIP & African Fashion',
          items: [
            'Modern Tailored African Suit (180,000 BIF / $65) - Bespoke fit for diplomatic and gala events',
            'Loose Fit Hoodie (75,000 BIF / $24.99) - Heavyweight cotton fleece streetwear',
            'Elimi Varsity Jacket Unisex (85,000 BIF / $28) - Wool-blend with leather sleeves',
            'Polo with Contrast Trims (636,000 BIF / $212) - Premium pique knit with heritage badge',
            "Men's Handcrafted Leather Loafers (70,000 BIF / $23) - Italian styled genuine cowhide",
            'Striped Windbreaker Jacket (360,000 BIF / $120) - Water-repellent nylon ripstop',
          ],
        },
        {
          name: 'Electronics & Media Gear',
          items: [
            'DJI Mini 4 Pro 4K Drone Fly More Combo (2,100,000 BIF / $750) - 4K/60fps HDR, 34-min flight, RC-2 screen controller',
            'JBL Charge 5 Bluetooth Speaker (150,000 BIF / $50) - 20h battery, IP67 waterproof with powerbank',
            'Apple AirPods Pro 2nd Gen (490,000 BIF / $150) - Active Noise Cancellation & MagSafe USB-C',
            'Samsung Galaxy Watch 6 Classic (650,000 BIF / $210) - Rotating physical bezel & sapphire glass',
            'Anker PowerCore 20000mAh Power Bank (95,000 BIF / $32) - Dual USB fast charge',
          ],
        },
        {
          name: 'Cultural Heritage Crafts',
          items: [
            'Authentic Burundi Handwoven Agaseke (75,000 BIF / $28) - Sacred peace basket handwoven in Gitega',
            'Traditional Beaded Bracelet (12,000 BIF / $4) - Authentic Burundian colors & brass centerpiece',
          ],
        },
        {
          name: 'Nails & Beauty Studio Supplies',
          items: [
            'Custom Gel Press-On Nail Kit (25,000 BIF / $8) - Handcrafted 24-tip set with glue & tabs',
            'Portable Electric Nail Drill Machine 35,000 RPM (85,000 BIF / $28) - Quiet motor with 6 drill bits',
            'Arctic Blue Gel Polish (39,000 BIF / $13) - Mirror gloss 21+ days wear',
            'Nail Art Liner Brush Set (30,000 BIF / $10) - 3 precision Japanese bristle detail brushes',
            'Holographic Multi-chrome Glitter Set (54,000 BIF / $18) - 6 cosmetic jars for encapsulation',
            'Gold Foil Nail Art Stickers (42,000 BIF / $14) - Celestial stars & luxury motifs',
            'Elegant Nude Press-On Nails (48,000 BIF / $16) - Ombre blush french fade presentation box',
          ],
        },
      ],
      deliveryPolicies: [
        'Bujumbura City: Same-day or 24-hour express courier delivery.',
        'Nationwide Burundi: 2 - 3 business days delivery via trusted regional logistics.',
        'Payment Methods: Cash on delivery, Lumicash, EcoCash, direct bank wire, and international cards.',
        'Sizing & Custom Orders: Customers can send custom body measurements or nail sizes directly via WhatsApp.',
      ],
    },
    printBeSolutions: {
      route: '/printbe',
      name: 'PrintBe Digital, Offset & Merchandise Solutions',
      description: 'High-resolution digital printing, exhibition displays, trade show roll-ups, corporate branding, and luxury event stationery.',
      productsAndServices: [
        {
          name: 'Roll-Up Banners & Exhibition Backdrops',
          specs: 'Sturdy aluminum cassette, anti-curl blockout vinyl, vibrant UV-resistant inks, includes padded carry bag.',
          turnaround: 'Same-day or 24h express turnaround in Bujumbura.',
        },
        {
          name: 'Corporate Merchandise & Branded Apparel',
          specs: 'Custom screen-printed & embroidered polos, hoodies, canvas tote bags, engraved metal pens, premium drinkware.',
        },
        {
          name: 'High-Finish Stationery & Invitations',
          specs: 'Gold/silver foil stamping, soft-touch matte lamination, spot UV coating, embossed executive business cards and VIP invitations.',
        },
        {
          name: 'Trade Show & Conference Packages',
          specs: 'Bulk discounts (10% to 35% on volume orders), full design prepress assistance, on-site setup assistance available.',
        },
      ],
    },
    elimiMedia: {
      route: '/media',
      name: 'ELIMI Média • Digital Broadcast & Shoppable Video',
      description: 'Burundi premier digital entertainment and lifestyle broadcasting hub on YouTube (@elimimedia).',
      features: [
        'High-profile talk shows and VIP celebrity interviews',
        'Hit comedy and drama cinema series including "Police Elimi" and "Muvuto"',
        'Shoppable video player: Viewers can explore and buy the exact outfits, tech drones, and accessories worn on screen',
        'Live stream coverage of national festivals, fashion weeks, and youth leadership forums',
      ],
    },
    nailArtLounge: {
      route: '/nails',
      name: 'ELIMI Nails & Aesthetic Studio',
      description: 'Bespoke nail artistry, luxury gel manicures, Russian cuticle care, bridal pampering, and mobile VIP artist home visits.',
      services: [
        'Custom Press-On Nail Consultations & Fittings',
        'Gel-X, Polygel & Acrylic Extension Sculpting',
        'Hand-Painted Botanical & Geometric Fine Line Art',
        'VIP In-Suite & Bridal Party Nail Packages',
      ],
    },
    digitalMarketing: {
      route: '/digital-marketing',
      name: 'ELIMI Digital Marketing & Brand Strategy',
      description: 'Full-service digital agency powering brand positioning, viral content production, and enterprise customer acquisition.',
      services: [
        'Omnichannel Digital Strategy (+240% average ROI uplift)',
        'High-Impact 4K Video Production, Reels & TikTok Campaigns (4.8x engagement)',
        'Technical & Organic SEO (+310% traffic growth)',
        'End-to-End Social Media Management & Influencer Orchestration (5.2x reach)',
        'UI/UX Design Systems & High-Converting Web Platforms',
        'Advanced Attribution Modeling, Analytics Dashboards & GA4 Tagging',
      ],
    },
    realEstateAndResidences: {
      route: '/houses',
      name: 'ELIMI Luxury Residences & Properties',
      description: 'High-end villas, diplomatic lofts, executive apartments, and beachfront cottages available for purchase and lease.',
    },
  },
  faqAndRules: {
    bookingProtocol: 'To book protocol officers or hostesses, clients can submit requirements on /protocol or message the WhatsApp concierge (+257 64 44 45 46) for instant quote calculation and dispatch.',
    rentingCars: 'Luxury cars like the Mercedes V-Class and Prado are available with professional executive chauffeurs. Daily rates include full insurance and fuel packages upon request.',
    orderingFromShop: 'Add items to cart on /shop or request direct checkout via WhatsApp. We offer same-day delivery in Bujumbura.',
    printBeOrders: 'Upload artwork or request custom graphic design on /printbe. Turnaround is typically 24 hours with express options.',
    customAfricanSuits: 'Suits are tailored with authentic high-grade fabrics. Customers can specify standard sizes (48 to 58) or send custom measurements.',
  },
};

/**
 * Builds a dynamic, comprehensive system instruction for Gemini Flash model
 * that embeds live database records (products, cars, houses) and business knowledge.
 */
export function buildEnhancedSystemInstruction(liveDbData?: {
  products?: Product[];
  cars?: Car[];
  houses?: House[];
}): string {
  const productsList = (liveDbData?.products && liveDbData.products.length > 0)
    ? liveDbData.products
    : BOUTIQUE_PRODUCTS;

  const carsList = (liveDbData?.cars && liveDbData.cars.length > 0)
    ? liveDbData.cars
    : SAMPLE_CARS;

  const housesList = (liveDbData?.houses && liveDbData.houses.length > 0)
    ? liveDbData.houses
    : SAMPLE_HOUSES;

  // Format a compact summary of live inventory for high AI reasoning accuracy
  const productsSummary = productsList
    .slice(0, 20)
    .map(
      (p) =>
        `- [${p.category}] ${p.name}: ${p.priceBIF.toLocaleString()} BIF (~$${p.priceUSD}) | Stock: ${p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'} | Seller: ${p.seller} | Link: /shop`
    )
    .join('\n');

  const carsSummary = carsList
    .slice(0, 10)
    .map(
      (c) =>
        `- ${c.title} (${c.year}, ${c.seats} seats, ${c.transmission}): Rent $${c.rentPrice || 'N/A'}/day | Sale $${c.price.toLocaleString()} | Key Amenities: ${c.amenities?.slice(0, 3).join(', ')} | Link: /cars`
    )
    .join('\n');

  const housesSummary = housesList
    .slice(0, 8)
    .map(
      (h) =>
        `- ${h.title} in ${h.address} (${h.bedrooms} bed, ${h.bathrooms} bath): ${h.rent ? `Rent $${h.rentPrice}/mo` : ''} ${h.sales ? `Sale $${h.price.toLocaleString()}` : ''} | Link: /houses`
    )
    .join('\n');

  return `You are Monica, the intelligent, articulate, highly sophisticated, and warm ELIMI AI assistant representing the entire ELIMI ecosystem in Burundi and East Africa.

YOUR CORE IDENTITY & MISSION:
- Assistant Name: Monica
- Organization: ELIMI Group (Bujumbura, Burundi)
- Contact Phone / WhatsApp: +257 64 44 45 46 (WhatsApp link: https://wa.me/25764444546)
- Email: elimiofficiel@gmail.com
- Your goal: Analyze the user's intent, map it to ELIMI's exact business models, service tiers, and live database inventory (from Firestore), and formulate an elegant, accurate, and highly helpful response.

COGNITIVE REASONING & RESPONSE GUIDELINES:
1. Understand the Request: Determine if the customer is inquiring about VIP Protocol staffing, renting/buying luxury fleet cars, shopping e-commerce products (fashion, tech, cultural crafts, beauty), PrintBe digital printing/banners, Elimi Média YouTube shows, nail salon services, digital marketing consulting, or real estate.
2. Cross-Reference Live Database & Business Models: Always reference verified prices in both BIF (Burundian Franc) and USD, verified stock status, specifications, and service tier distinctions.
3. Structure & Tone:
   - Begin with a warm, polite Burundian / international welcome ("Muraho!", "Hello!", "Bonjour!").
   - Present options clearly using structured bullet points with bold highlights.
   - Embed relevant markdown links so the user can take action immediately:
     * Protocol Staffing & VIP Escorts: [Protocol Staffing](/protocol)
     * Luxury Mobility Fleet: [Luxury Fleet & Cars](/cars)
     * Boutique Marketplace: [Elimi Shop](/shop)
     * PrintBe Solutions: [PrintBe Printing](/printbe)
     * Elimi Média Video Channel: [Elimi Média](/media)
     * Nail Art Studio: [Elimi Nails](/nails)
     * Digital Marketing: [Digital Marketing Agency](/digital-marketing)
     * Real Estate: [Residences & Villas](/houses)
     * WhatsApp Concierge: [WhatsApp Concierge (+257 64 44 45 46)](https://wa.me/25764444546)
4. Concierge Proactivity: If the user asks about an event (e.g. wedding, diplomatic summit, corporate gala), suggest combining Protocol Staffing with Mercedes V-Class or Prado convoy mobility, and custom PrintBe banners or badges for a flawless end-to-end experience.
5. Accuracy: Do not hallucinate prices or fake phone numbers. Stick strictly to the documented ELIMI business models and live data below.

============================================================
LIVE FIRESTORE DATABASE INVENTORY SNAPSHOT
============================================================

SHOP & BOUTIQUE CATALOG (Synced with Firestore 'products'):
${productsSummary}

LUXURY FLEET CATALOG (Synced with Firestore 'cars'):
${carsSummary}

REAL ESTATE & RESIDENCES (Synced with Firestore 'houses'):
${housesSummary}

============================================================
ELIMI CORE BUSINESS PILLARS & SERVICE SPECIFICATIONS
============================================================

1. VIP PROTOCOL & EVENT STAFFING (/protocol):
- Tier 1: Certified Protocol Officers (Diplomatic order of precedence, state protocol, dais/podium choreography, treaty signing).
- Tier 2: VIP Hostesses & Escorts (Multilingual: French, English, Kirundi, Swahili; airport tarmac receiving lines, lounge hospitality, table seating).
- Tier 3: Operational Floor & Press Marshals (Crowd control, media pool cordons, motorcade dispatch).
- Tier 4: Ceremonial & Stage Attendants (Award plaque handover, ribbon cutting, speaker timing).
- Packages: Executive Bilateral (4-8 staff), Corporate Summit (12-24 staff), State Gala (30-60+ staff).

2. PRINTBE DIGITAL & COMMERCIAL PRINTING (/printbe):
- Roll-Up Banners (Sturdy aluminum cassette, anti-curl vinyl, UV print with carry bag).
- Branded Apparel (Polo shirts, hoodies, VIP lanyards, engraved metal pens).
- High-Finish Stationery (Foil stamping, matte lamination, spot UV, embossed luxury invitations).
- Turnaround: 24h express delivery across Bujumbura.

3. ELIMI MÉDIA (/media):
- Official YouTube Channel: @elimimedia
- Signature Series: "Police Elimi", "Muvuto", VIP Lifestyle Talk Shows, Cultural Documentaries.
- Shoppable streams where viewers buy featured outfits and equipment in real-time.

4. ELIMI NAILS & AESTHETICS (/nails):
- Russian manicures, gel extensions, custom press-on sets, bridal packages, and home/hotel VIP visits.

5. DIGITAL MARKETING & GROWTH (/digital-marketing):
- Omnichannel Digital Strategy, 4K Video Production & Reels, SEO Auditing, Social Media Management, UI/UX Design Systems, GA4 Analytics.

6. DIRECT DISPATCH:
- Phone & WhatsApp: +257 64 44 45 46 (WhatsApp link: https://wa.me/25764444546)
- Email: elimiofficiel@gmail.com
- Hours: Lundi - Vendredi: 9h - 17h (24/7 VIP WhatsApp on-call concierge).`;
}

/**
 * Server-side helper to query real-time Firestore database snapshot.
 * Has strict timeout to prevent slow cold starts, falling back gracefully to static state.
 */
export async function fetchLiveFirestoreSnapshot(): Promise<{
  products: Product[];
  cars: Car[];
  houses: House[];
  source: 'live-firestore' | 'static-fallback';
}> {
  try {
    const fetchWithTimeout = async <T>(promise: Promise<T>, ms: number = 2500): Promise<T> => {
      let timeoutId: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Firestore timeout')), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    const [productsSnap, carsSnap, housesSnap] = await Promise.allSettled([
      fetchWithTimeout(getDocs(collection(db, 'products'))),
      fetchWithTimeout(getDocs(collection(db, 'cars'))),
      fetchWithTimeout(getDocs(collection(db, 'houses'))),
    ]);

    const liveProducts: Product[] = [];
    if (productsSnap.status === 'fulfilled' && !productsSnap.value.empty) {
      productsSnap.value.forEach((doc) => {
        liveProducts.push({ ...(doc.data() as Product), id: doc.id });
      });
    }

    const liveCars: Car[] = [];
    if (carsSnap.status === 'fulfilled' && !carsSnap.value.empty) {
      carsSnap.value.forEach((doc) => {
        liveCars.push({ ...(doc.data() as Car), id: doc.id });
      });
    }

    const liveHouses: House[] = [];
    if (housesSnap.status === 'fulfilled' && !housesSnap.value.empty) {
      housesSnap.value.forEach((doc) => {
        liveHouses.push({ ...(doc.data() as House), id: doc.id });
      });
    }

    const hasLive = liveProducts.length > 0 || liveCars.length > 0 || liveHouses.length > 0;

    return {
      products: liveProducts.length > 0 ? liveProducts : BOUTIQUE_PRODUCTS,
      cars: liveCars.length > 0 ? liveCars : SAMPLE_CARS,
      houses: liveHouses.length > 0 ? liveHouses : SAMPLE_HOUSES,
      source: hasLive ? 'live-firestore' : 'static-fallback',
    };
  } catch (err) {
    console.warn('Firestore snapshot error in AI route, using synchronized fallback:', err);
    return {
      products: BOUTIQUE_PRODUCTS,
      cars: SAMPLE_CARS,
      houses: SAMPLE_HOUSES,
      source: 'static-fallback',
    };
  }
}

