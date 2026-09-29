export interface ProductReview {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
  verified?: boolean;
}

export interface ShippingDetails {
  discount: string;
  packageType: string;
  deliveryTime: string;
  estimatedArrival: string;
  costUSD?: number;
  costBIF?: number;
  pickupBureauAddress?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  badgeTag?: string;
  priceBIF: number;
  priceUSD: number;
  originalPriceUSD?: number;
  discountPercentage?: number;
  shippingCostUSD?: number;
  shippingCostBIF?: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  image: string;
  gallery: string[];
  description: string;
  descriptionFit?: string;
  seller: string;
  inStock: boolean;
  active?: boolean;
  stockQuantity: number;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  shipping?: ShippingDetails;
  reviews?: ProductReview[];
  ratingBreakdown?: { [key: number]: number };
}

export const DEFAULT_SHIPPING_COST_USD = 2.5;
export const DEFAULT_SHIPPING_COST_BIF = 7500;
export const DEFAULT_BUREAU_ADDRESS = 'Chaussée du Peuple Murundi, Rohero I, Bujumbura (Central Bureau)';

export function getEffectiveShippingCost(product: Partial<Product> | null | undefined): { costUSD: number; costBIF: number } {
  if (!product) {
    return { costUSD: DEFAULT_SHIPPING_COST_USD, costBIF: DEFAULT_SHIPPING_COST_BIF };
  }
  const costUSD =
    typeof product.shippingCostUSD === 'number'
      ? product.shippingCostUSD
      : typeof product.shipping?.costUSD === 'number'
      ? product.shipping.costUSD
      : DEFAULT_SHIPPING_COST_USD;

  const costBIF =
    typeof product.shippingCostBIF === 'number'
      ? product.shippingCostBIF
      : typeof product.shipping?.costBIF === 'number'
      ? product.shipping.costBIF
      : Math.round(costUSD * 3000) || DEFAULT_SHIPPING_COST_BIF;

  return { costUSD, costBIF };
}

export const BOUTIQUE_PRODUCTS: Product[] = [];

/*
// STATIC PRODUCTS COMMENTED OUT - Products are loaded strictly from Firestore database
export const STATIC_BOUTIQUE_PRODUCTS: Product[] = [
  {
    id: 'loose-fit-hoodie',
    name: 'Loose Fit Hoodie',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Man Fashion',
    priceBIF: 75000,
    priceUSD: 24.99,
    originalPriceUSD: 49.99,
    discountPercentage: 50,
    rating: 4.5,
    reviewsCount: 50,
    badge: 'Popular Choice',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Loose-fit sweatshirt hoodie in medium weight cotton-blend fabric with a generous, but not oversized silhouette. Jersey-lined, drawstring hood, dropped shoulders, long sleeves, and a kangaroo pocket. Wide ribbing at cuffs and hem. Soft, brushed inside.',
    descriptionFit:
      'Loose fit: A roomy silhouette with ample space through chest and arms, designed for effortless layering and casual streetwear aesthetics. Soft, brushed interior provides thermal insulation while remaining breathable.',
    seller: 'ELIMI Apparel & NextGen Studio',
    inStock: true,
    stockQuantity: 18,
    shippingCostUSD: 2.5,
    shippingCostBIF: 7500,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Burgundy Maroon', hex: '#651C2C' },
      { name: 'Pitch Black', hex: '#18181B' },
      { name: 'Heather Gray', hex: '#9CA3AF' },
    ],
    shipping: {
      discount: 'Disc 50%',
      packageType: 'Regular Package',
      deliveryTime: '3-4 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: {
      5: 35,
      4: 10,
      3: 3,
      2: 1,
      1: 1,
    },
    reviews: [
      {
        id: 'r1',
        author: 'Alex Mathio',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        date: '13 Oct 2024',
        rating: 5,
        comment:
          "NextGen's dedication to sustainability and ethical practices resonates strongly with today's consumers, positioning the brand as a responsible choice in the fashion world. The fabric feel is outstanding!",
        verified: true,
      },
    ],
  },
  {
    id: 'polo-contrast',
    name: 'Polo with Contrast Trims',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Man Fashion',
    priceBIF: 636000,
    priceUSD: 212.0,
    originalPriceUSD: 242.0,
    discountPercentage: 20,
    rating: 4.0,
    reviewsCount: 28,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Classic pique knit polo shirt featuring crisp contrast ribbed collar, button placket, and embroidered heritage emblem on the chest.',
    descriptionFit:
      'Regular fit tailored through shoulders and chest with subtle side slits for movement.',
    seller: 'ELIMI Clothing Line',
    inStock: true,
    stockQuantity: 12,
    shippingCostUSD: 3.0,
    shippingCostBIF: 9000,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'gradient-graphic-tshirt',
    name: 'Gradient Graphic T-shirt',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Streetwear',
    priceBIF: 435000,
    priceUSD: 145.0,
    rating: 3.5,
    reviewsCount: 16,
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Heavyweight 240 GSM organic cotton t-shirt with screen-printed gradient graphic artwork on chest and back.',
    descriptionFit: 'Boxy relaxed oversized streetwear cut with drop shoulders.',
    seller: 'ELIMI Urban Collection',
    inStock: true,
    stockQuantity: 20,
    shippingCostUSD: 2.0,
    shippingCostBIF: 6000,
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'p1',
    name: 'Custom Gel Press-On Nail Kit',
    category: 'Nails & Beauty',
    subCategory: 'Press-On Nails',
    badgeTag: 'Beauty & Nails',
    priceBIF: 25000,
    priceUSD: 8.0,
    originalPriceUSD: 16.0,
    discountPercentage: 50,
    rating: 4.8,
    reviewsCount: 36,
    badge: 'In Stock',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Reusable hand-crafted press-on nail set with salon gel finish, cuticle oil, adhesive tabs, and nail glue.',
    seller: 'Aura Beauty Bujumbura',
    inStock: true,
    stockQuantity: 14,
    sizes: ['XS (Petite)', 'S (Natural)', 'M (Standard)', 'L (Wide)'],
  },
  {
    id: 'p2',
    name: 'JBL Charge 5 Bluetooth Speaker',
    category: 'Electronics',
    subCategory: 'Audio & Speakers',
    badgeTag: 'Electronics',
    priceBIF: 150000,
    priceUSD: 50.0,
    originalPriceUSD: 75.0,
    discountPercentage: 33,
    rating: 4.7,
    reviewsCount: 42,
    badge: 'Best Audio',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Portable waterproof Bluetooth speaker with powerbank feature and deep bass punch.',
    seller: 'Kiryama Tech Direct',
    inStock: true,
    stockQuantity: 8,
  },
  {
    id: 'p10',
    name: 'Modern Tailored African Suit',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'VIP Protocol',
    priceBIF: 180000,
    priceUSD: 65.0,
    originalPriceUSD: 100.0,
    discountPercentage: 35,
    rating: 4.9,
    reviewsCount: 42,
    badge: 'Exclusive',
    image: '/assets/shop/african-suit.jpg',
    gallery: [
      '/assets/shop/african-suit.jpg',
    ],
    description:
      'Bespoke modern African suit tailored with premium authentic fabric.',
    seller: 'ELIMI Tailors Bujumbura',
    inStock: true,
    stockQuantity: 7,
    sizes: ['M (48)', 'L (50)', 'XL (52)', 'XXL (54)', 'Custom Tailored'],
  },
  {
    id: 'p11',
    name: 'Authentic Burundi Handwoven Agaseke',
    category: 'Cultural',
    subCategory: 'Baskets & Weaving',
    badgeTag: 'Cultural Craft',
    priceBIF: 75000,
    priceUSD: 28.0,
    rating: 5.0,
    reviewsCount: 19,
    badge: 'Heritage',
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Traditional peace basket handwoven by artisan women cooperatives in Gitega.',
    seller: 'Gitega Artisans Collective',
    inStock: true,
    stockQuantity: 11,
    sizes: ['Small (18cm)', 'Medium (28cm)', 'Large (40cm)'],
  },
  {
    id: 'arctic-blue-gel-polish',
    name: 'Arctic Blue Gel Polish',
    category: 'Nails & Beauty',
    subCategory: 'Gel Polish',
    badgeTag: 'Salon Formula',
    priceBIF: 39000,
    priceUSD: 13.0,
    originalPriceUSD: 18.0,
    discountPercentage: 28,
    rating: 5.0,
    reviewsCount: 48,
    badge: 'Best Seller',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKr7yk41LeyONNJzqYJpP3uYPwEDw0UCD3HrI_2Kk8h-XjJQxLw7uy2_RNCL7sYsA0tC1iIVN-yXzLvPvHBvZKqvL7vOOyTyihwBlySsyLKJXoEljsuCCoffOwJv5WP-4S_L3NYjHgqkC5M4U9-VxrC2kUoqv8tvOHIaBwvcFLomevU3Eghjqj2j4X5cTXrNb3ecmgSXCsCE4itzXPN1ap7NSA8s4ppUFHnAtAxbkpOuxs8liM2ox88g',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKr7yk41LeyONNJzqYJpP3uYPwEDw0UCD3HrI_2Kk8h-XjJQxLw7uy2_RNCL7sYsA0tC1iIVN-yXzLvPvHBvZKqvL7vOOyTyihwBlySsyLKJXoEljsuCCoffOwJv5WP-4S_L3NYjHgqkC5M4U9-VxrC2kUoqv8tvOHIaBwvcFLomevU3Eghjqj2j4X5cTXrNb3ecmgSXCsCE4itzXPN1ap7NSA8s4ppUFHnAtAxbkpOuxs8liM2ox88g',
    ],
    description:
      'Ultra-pigmented salon-grade gel polish with mirror-gloss shine.',
    seller: 'ELIMI Nails Studio Bujumbura',
    inStock: true,
    stockQuantity: 25,
  }
];
*/

export function getProductById(_id: string): Product | undefined {
  return undefined;
}

export function getRelatedProducts(_currentId: string, _count = 4): Product[] {
  return [];
}
