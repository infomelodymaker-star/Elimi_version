export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  currency: string;
  image: string;
  fallbackImage: string;
  badge?: string;
  spec: string;
  shopUrl?: string;
}

export interface MediaVideo {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: 'Fashion & Style' | 'VIP Lifestyle' | 'Tech & Gear' | 'Comedy & Drama' | 'Cultural Heritage' | 'Event Masterclass';
  duration: string;
  views: string;
  uploadedAt: string;
  thumbnail: string;
  channelName: string;
  isVerified: boolean;
  likes: number;
  featuredProducts: FeaturedProduct[];
  tags: string[];
  isFeaturedHero?: boolean;
}

export const MARKET_PRODUCTS: Record<string, FeaturedProduct> = {
  p_suit: {
    id: 'p_suit',
    name: 'African Print Tailored Suit',
    category: 'Fashion',
    price: '85,000',
    currency: 'BIF',
    image: '/assets/shop/african-suit.webp',
    fallbackImage: '/assets/shop/african-suit.jpg',
    badge: 'Trending in Market',
    spec: 'Premium Cotton Blend • Sizes 48-58',
    shopUrl: '/shop'
  },
  p_vclass: {
    id: 'p_vclass',
    name: 'Mercedes V-Class Luxury Chauffeur',
    category: 'VIP Mobility',
    price: '$100',
    currency: '/ day',
    image: '/assets/shop/mercedes-vclass.webp',
    fallbackImage: '/assets/shop/mercedes-vclass.jpg',
    badge: 'VIP Escort',
    spec: 'Leather Captain Seats • VIP Driver',
    shopUrl: '/shop'
  },
  p_shoes: {
    id: 'p_shoes',
    name: 'Handcrafted Italian Leather Shoes',
    category: 'Footwear',
    price: '65,000',
    currency: 'BIF',
    image: '/assets/shop/leather-shoes.webp',
    fallbackImage: '/assets/shop/leather-shoes.jpg',
    badge: 'Authentic',
    spec: 'Genuine Cowhide • Goodyear Welted',
    shopUrl: '/shop'
  },
  p_drone: {
    id: 'p_drone',
    name: 'DJI Mini 3 Pro 4K Drone Kit',
    category: 'Media Gear',
    price: '950,000',
    currency: 'BIF',
    image: '/assets/shop/dji-drone.webp',
    fallbackImage: '/assets/shop/dji-drone.jpg',
    badge: '4K Ultra HD',
    spec: 'Tri-Directional Sensing • 34min Flight',
    shopUrl: '/shop'
  },
  p_watch: {
    id: 'p_watch',
    name: 'Tissot Gentleman Swiss Watch',
    category: 'Luxury Accessories',
    price: '750,000',
    currency: 'BIF',
    image: '/assets/shop/tissot-watch.webp',
    fallbackImage: '/assets/shop/tissot-watch.jpg',
    badge: 'Swiss Made',
    spec: 'Powermatic 80 • Sapphire Crystal',
    shopUrl: '/shop'
  },
  p_shades: {
    id: 'p_shades',
    name: 'ELIMI Gold Signature Aviators',
    category: 'Luxury Accessories',
    price: '45,000',
    currency: 'BIF',
    image: '/assets/shop/aviator-shades.webp',
    fallbackImage: '/assets/shop/aviator-shades.jpg',
    badge: 'UV400 Polarized',
    spec: 'Titanium Frame • Scratch Resistant',
    shopUrl: '/shop'
  },
  p_jacket: {
    id: 'p_jacket',
    name: 'VIP Security Bomber Jacket',
    category: 'Fashion',
    price: '75,000',
    currency: 'BIF',
    image: '/assets/shop/bomber-jacket.webp',
    fallbackImage: '/assets/shop/bomber-jacket.jpg',
    badge: 'Tactical Edition',
    spec: 'Waterproof Nylon • Thermal Lining',
    shopUrl: '/shop'
  },
  p_stand: {
    id: 'p_stand',
    name: 'Heavy Duty 4K Broadcast Tripod',
    category: 'Media Gear',
    price: '180,000',
    currency: 'BIF',
    image: '/assets/shop/tripod-stand.webp',
    fallbackImage: '/assets/shop/tripod-stand.jpg',
    badge: 'Pro Grade',
    spec: 'Carbon Fiber • Fluid Drag Head',
    shopUrl: '/shop'
  },
  p_basket: {
    id: 'p_basket',
    name: 'Handcrafted Traditional Agaseke Basket',
    category: 'Cultural Craft',
    price: '35,000',
    currency: 'BIF',
    image: '/assets/shop/agaseke-basket.webp',
    fallbackImage: '/assets/shop/agaseke-basket.jpg',
    badge: 'Handwoven Artisanal',
    spec: 'Natural Sisal & Raffia • Gitega Crafts',
    shopUrl: '/shop'
  }
};
