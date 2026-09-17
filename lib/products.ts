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

export const BOUTIQUE_PRODUCTS: Product[] = [
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
      {
        id: 'r2',
        author: 'Sarah Ndikumana',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        date: '08 Oct 2024',
        rating: 5,
        comment:
          'Super comfortable fit, heavyweight cotton and warm inside fleece. Delivered within 24 hours in Bujumbura!',
        verified: true,
      },
      {
        id: 'r3',
        author: 'Christian Bizimana',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        date: '02 Oct 2024',
        rating: 4,
        comment:
          'Great hoodie, color is true to photo. The stitching around the cuffs is sturdy and well made.',
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
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
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
    shipping: {
      discount: 'Disc 20%',
      packageType: 'Luxury Gift Box',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '11 - 13 October 2024',
    },
    ratingBreakdown: { 5: 18, 4: 7, 3: 2, 2: 1, 1: 0 },
    reviews: [
      {
        id: 'r-pc1',
        author: 'Eric Mugisha',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        date: '10 Oct 2024',
        rating: 4,
        comment: 'High quality cotton pique. Perfect for smart casual outfits.',
        verified: true,
      },
    ],
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
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=80',
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
    shipping: {
      discount: 'Standard',
      packageType: 'Eco Polybag',
      deliveryTime: '3-4 Working Days',
      estimatedArrival: '12 - 14 October 2024',
    },
    ratingBreakdown: { 5: 7, 4: 5, 3: 3, 2: 1, 1: 0 },
    reviews: [
      {
        id: 'r-gt1',
        author: 'David Kaneza',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        date: '05 Oct 2024',
        rating: 4,
        comment: 'Nice heavyweight cotton that holds its shape after washing.',
        verified: true,
      },
    ],
  },
  {
    id: 'polo-tipping-details',
    name: 'Polo with Tipping Details',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Man Fashion',
    priceBIF: 540000,
    priceUSD: 180.0,
    rating: 4.5,
    reviewsCount: 31,
    badge: 'Popular Choice',
    image: 'https://images.unsplash.com/photo-1625910513413-7e15bf91349f?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1625910513413-7e15bf91349f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Pure mercerized cotton polo shirt featuring subtle twin-tipping stripe accents on the collar and sleeve bands.',
    descriptionFit: 'Modern slim-tailored fit with mother-of-pearl buttons.',
    seller: 'ELIMI Tailors',
    inStock: true,
    stockQuantity: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    shipping: {
      discount: 'Free Shipping',
      packageType: 'Regular Package',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 20, 4: 8, 3: 2, 2: 1, 1: 0 },
    reviews: [
      {
        id: 'r-pt1',
        author: 'Arnaud Habimana',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
        date: '12 Oct 2024',
        rating: 5,
        comment: 'Silky smooth feel and elegant collar structure.',
        verified: true,
      },
    ],
  },
  {
    id: 'striped-jacket',
    name: 'Striped Windbreaker Jacket',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Outerwear',
    priceBIF: 360000,
    priceUSD: 120.0,
    originalPriceUSD: 160.0,
    discountPercentage: 30,
    rating: 5.0,
    reviewsCount: 19,
    badge: 'Sale -30%',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Water-repellent nylon ripstop jacket with retro contrast horizontal stripe paneling, elasticated cuffs, and adjustable bungee hem.',
    descriptionFit: 'Sporty relaxed fit with full zip and packable hood.',
    seller: 'ELIMI Clothing Line',
    inStock: true,
    stockQuantity: 9,
    sizes: ['M', 'L', 'XL'],
    shipping: {
      discount: 'Disc 30%',
      packageType: 'Regular Package',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 16, 4: 3, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-sj1',
        author: 'Fabrice Nkurunziza',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        date: '14 Oct 2024',
        rating: 5,
        comment: 'Lightweight, windproof and looks super crisp in person.',
        verified: true,
      },
    ],
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
      'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Reusable hand-crafted press-on nail set with salon gel finish, cuticle oil, adhesive tabs, and nail glue.',
    descriptionFit:
      'Custom sizing kit includes 24 nail tips in 10 different sizes for a natural fit on any nail bed shape.',
    seller: 'Aura Beauty Bujumbura',
    inStock: true,
    stockQuantity: 14,
    sizes: ['XS (Petite)', 'S (Natural)', 'M (Standard)', 'L (Wide)'],
    shipping: {
      discount: 'Disc 50%',
      packageType: 'Velvet Cosmetic Pouch',
      deliveryTime: '1-2 Working Days',
      estimatedArrival: '10 - 11 October 2024',
    },
    ratingBreakdown: { 5: 30, 4: 4, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p1-1',
        author: 'Kelly Irakoze',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        date: '11 Oct 2024',
        rating: 5,
        comment: 'Lasted over 2 weeks with the glue provided. High gloss finish looks like salon acrylics!',
        verified: true,
      },
    ],
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
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Portable waterproof Bluetooth speaker with powerbank feature and deep bass punch. Up to 20 hours of playtime with IP67 water and dust resistance.',
    descriptionFit: 'Rugged exterior with dual passive radiators and separate tweeter.',
    seller: 'Kiryama Tech Direct',
    inStock: true,
    stockQuantity: 8,
    shipping: {
      discount: 'Special Promo',
      packageType: 'Shockproof Box',
      deliveryTime: '24h Bujumbura Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 32, 4: 8, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p2-1',
        author: 'Jean-Paul Nsengiyumva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        date: '09 Oct 2024',
        rating: 5,
        comment: 'Loud, clear bass, and the battery lasts through whole weekend parties.',
        verified: true,
      },
    ],
  },
  {
    id: 'p3',
    name: 'Elimi Varsity Jacket Unisex',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Man Fashion',
    priceBIF: 85000,
    priceUSD: 28.0,
    originalPriceUSD: 45.0,
    discountPercentage: 38,
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Staff Pick',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Classic wool-blend varsity jacket with faux-leather sleeves and embroidered ELIMI chest emblem. Snap front closure and striped knit collar.',
    descriptionFit: 'Relaxed classic varsity cut designed for layering over hoodies.',
    seller: 'ELIMI Clothing Line',
    inStock: true,
    stockQuantity: 22,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    shipping: {
      discount: 'Disc 38%',
      packageType: 'Garment Cover',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 24, 4: 4, 3: 1, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p3-1',
        author: 'Pacifique Niyongabo',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        date: '07 Oct 2024',
        rating: 5,
        comment: 'Top quality leather sleeves and thick wool lining. Looks luxurious.',
        verified: true,
      },
    ],
  },
  {
    id: 'p4',
    name: "Men's Leather Loafers",
    category: 'Fashion',
    subCategory: 'Footwear & Shoes',
    badgeTag: 'Footwear',
    priceBIF: 70000,
    priceUSD: 23.0,
    originalPriceUSD: 40.0,
    discountPercentage: 42,
    rating: 4.6,
    reviewsCount: 18,
    badge: 'Handmade',
    image: '/assets/shop/leather-shoes.jpg',
    gallery: [
      '/assets/shop/leather-shoes.jpg',
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Hand-stitched genuine leather slip-on loafers designed for comfort and modern business casual styling with cushioned insole.',
    descriptionFit: 'Standard shoe width with flexible anti-slip rubber outsole.',
    seller: 'ELIMI Footwear Bujumbura',
    inStock: true,
    stockQuantity: 12,
    sizes: ['40 EU', '41 EU', '42 EU', '43 EU', '44 EU', '45 EU'],
    shipping: {
      discount: 'Disc 42%',
      packageType: 'Shoe Box with Dust Bags',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 13, 4: 4, 3: 1, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p4-1',
        author: 'Aimé Gahungu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        date: '04 Oct 2024',
        rating: 5,
        comment: 'Very soft leather, fits true to size and comfortable all day.',
        verified: true,
      },
    ],
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
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Bespoke modern African suit tailored with premium authentic fabric, designed for formal protocol occasions, weddings, and executive delegations.',
    descriptionFit: 'Modern tailored slim cut. Custom measurements can be sent via WhatsApp.',
    seller: 'ELIMI Tailors Bujumbura',
    inStock: true,
    stockQuantity: 7,
    sizes: ['M (48)', 'L (50)', 'XL (52)', 'XXL (54)', 'Custom Tailored'],
    shipping: {
      discount: 'Bespoke Care',
      packageType: 'VIP Garment Bag',
      deliveryTime: '2-4 Working Days',
      estimatedArrival: '11 - 13 October 2024',
    },
    ratingBreakdown: { 5: 38, 4: 4, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p10-1',
        author: 'Hon. Alexis Manirakiza',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        date: '15 Oct 2024',
        rating: 5,
        comment: 'Outstanding tailoring and fabric drape. Perfect for high-level events.',
        verified: true,
      },
    ],
  },
  {
    id: 'p12',
    name: 'DJI Mini 4 Pro 4K Drone Fly More Combo',
    category: 'Electronics',
    subCategory: 'Drones & Cameras',
    badgeTag: 'Elimi Média Gear',
    priceBIF: 2100000,
    priceUSD: 750.0,
    rating: 4.9,
    reviewsCount: 15,
    badge: 'Pro Grade',
    image: '/assets/shop/dji-drone.jpg',
    gallery: [
      '/assets/shop/dji-drone.jpg',
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Sub-249g lightweight drone with 4K/60fps HDR video, omnidirectional obstacle sensing, and 34-min flight time. Includes RC-2 smart controller with screen and 3 intelligent batteries.',
    descriptionFit: 'Ultra-portable folding design. No pilot license required for sub-250g class in most regions.',
    seller: 'Elimi Média Supplies',
    inStock: true,
    stockQuantity: 4,
    shipping: {
      discount: 'Official Warranty',
      packageType: 'Fly More Shoulder Bag',
      deliveryTime: 'Same-Day Handover',
      estimatedArrival: 'Immediate / Bujumbura',
    },
    ratingBreakdown: { 5: 14, 4: 1, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p12-1',
        author: 'Cedric Média Tech',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
        date: '10 Oct 2024',
        rating: 5,
        comment: 'Flies like a dream, stunning vertical 4K video for our social media productions.',
        verified: true,
      },
    ],
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
      'https://images.unsplash.com/photo-1611591475179-62cd34eb91e6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Traditional peace basket handwoven by artisan women cooperatives in Gitega. A sacred symbol of friendship, hospitality, and Burundian heritage.',
    descriptionFit: 'Handcrafted from sisal and natural vegetable dyes. Approx 28cm height.',
    seller: 'Gitega Artisans Collective',
    inStock: true,
    stockQuantity: 11,
    sizes: ['Small (18cm)', 'Medium (28cm)', 'Large (40cm)'],
    shipping: {
      discount: 'Artisan Direct',
      packageType: 'Gift Wrapped with Certificate',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 19, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p11-1',
        author: 'Claire Dupont',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        date: '06 Oct 2024',
        rating: 5,
        comment: 'Breathtaking craftsmanship! The geometric pattern is so crisp and vibrant.',
        verified: true,
      },
    ],
  },
  {
    id: 'p6',
    name: 'AirPods Pro 2nd Generation',
    category: 'Electronics',
    subCategory: 'Audio & Speakers',
    badgeTag: 'Apple Pro',
    priceBIF: 490000,
    priceUSD: 150.0,
    originalPriceUSD: 249.0,
    discountPercentage: 40,
    rating: 4.8,
    reviewsCount: 52,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Active Noise Cancellation up to 2x more, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and MagSafe USB-C charging case with speaker.',
    descriptionFit: 'Includes 4 pairs of silicone ear tips (XS, S, M, L) for all-day comfort.',
    seller: 'Kiryama Tech Direct',
    inStock: true,
    stockQuantity: 5,
    sizes: ['Standard (MagSafe USB-C Case)'],
    shipping: {
      discount: 'Disc 40%',
      packageType: 'Original Sealed Box',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 44, 4: 6, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p6-1',
        author: 'Thierry Bigirimana',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        date: '14 Oct 2024',
        rating: 5,
        comment: 'Original serial number verified on Apple coverage. Noise cancellation is magic.',
        verified: true,
      },
    ],
  },
  {
    id: 'p7',
    name: 'Traditional Beaded Bracelet',
    category: 'Cultural',
    subCategory: 'Jewelry & Beads',
    badgeTag: 'Cultural Jewelry',
    priceBIF: 12000,
    priceUSD: 4.0,
    rating: 4.9,
    reviewsCount: 15,
    badge: 'In Stock',
    image: 'https://images.unsplash.com/photo-1611591475179-62cd34eb91e6?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1611591475179-62cd34eb91e6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Authentic handmade beaded bracelet woven with traditional Burundian colors and brass centerpiece.',
    seller: 'Gitega Artisans Collective',
    inStock: true,
    stockQuantity: 30,
    sizes: ['Adjustable Cord'],
    shipping: {
      discount: 'Artisan Direct',
      packageType: 'Eco Kraft Box',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 14, 4: 1, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p7-1',
        author: 'Diane Hakizimana',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        date: '08 Oct 2024',
        rating: 5,
        comment: 'Beautiful colors, comfortable elastic fitting.',
        verified: true,
      },
    ],
  },
  {
    id: 'p8',
    name: 'Unisex Hoodie Elimi Brand',
    category: 'Fashion',
    subCategory: "Women's Clothing",
    badgeTag: 'Man & Woman Fashion',
    priceBIF: 60000,
    priceUSD: 20.0,
    originalPriceUSD: 35.0,
    discountPercentage: 42,
    rating: 4.7,
    reviewsCount: 33,
    badge: 'Cozy Wear',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Ultra-soft fleece hoodie featuring kangaroo pocket, matching drawstring, and subtle ELIMI print.',
    seller: 'ELIMI Clothing Line',
    inStock: true,
    stockQuantity: 16,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    shipping: {
      discount: 'Disc 42%',
      packageType: 'Regular Package',
      deliveryTime: '2-3 Working Days',
      estimatedArrival: '10 - 12 October 2024',
    },
    ratingBreakdown: { 5: 25, 4: 6, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p8-1',
        author: 'Bella Uwase',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        date: '10 Oct 2024',
        rating: 5,
        comment: 'My favorite daily sweater. Soft fleece inside and fits oversized nicely.',
        verified: true,
      },
    ],
  },
  {
    id: 'p9',
    name: 'Nail Drill Machine Portable',
    category: 'Nails & Beauty',
    subCategory: 'Tools & Equipment',
    badgeTag: 'Salon Pro',
    priceBIF: 85000,
    priceUSD: 28.0,
    rating: 4.8,
    reviewsCount: 19,
    badge: 'In Stock',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Rechargeable 35,000 RPM electric nail file machine with 6 drill bits for acrylic, gel, and cuticle care.',
    seller: 'Aura Beauty Bujumbura',
    inStock: true,
    stockQuantity: 9,
    shipping: {
      discount: 'Includes 6 Bits',
      packageType: 'Hardcase Travel Kit',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 16, 4: 2, 3: 1, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p9-1',
        author: 'Nina Nahimana',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        date: '03 Oct 2024',
        rating: 5,
        comment: 'Very quiet motor and almost zero vibration. High RPM takes off gel in seconds.',
        verified: true,
      },
    ],
  },
  {
    id: 'p14',
    name: 'Anker PowerCore 20000mAh Power Bank',
    category: 'Electronics',
    subCategory: 'Mobile & Accessories',
    badgeTag: 'Tech Accessories',
    priceBIF: 95000,
    priceUSD: 32.0,
    rating: 4.8,
    reviewsCount: 64,
    badge: 'High Capacity',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Ultra-high capacity portable charger with dual USB fast-charging ports for phones and tablets.',
    seller: 'Kiryama Tech Direct',
    inStock: true,
    stockQuantity: 20,
    shipping: {
      discount: 'Best Seller',
      packageType: 'Sealed Retail Box',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 55, 4: 7, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p14-1',
        author: 'Arthur Ndayisaba',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        date: '12 Oct 2024',
        rating: 5,
        comment: 'Charges my phone 4.5 times on a single charge. Crucial during load shedding!',
        verified: true,
      },
    ],
  },
  {
    id: 'p18',
    name: 'Samsung Galaxy Watch 6 Classic',
    category: 'Electronics',
    subCategory: 'Mobile & Accessories',
    badgeTag: 'Smartwatch',
    priceBIF: 650000,
    priceUSD: 210.0,
    rating: 4.7,
    reviewsCount: 19,
    badge: 'Rotating Bezel',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Rotating bezel smartwatch with sleep coaching, ECG monitor, sapphire crystal glass, and water resistance.',
    seller: 'Kiryama Tech Direct',
    inStock: true,
    stockQuantity: 7,
    sizes: ['43mm Black', '47mm Silver'],
    shipping: {
      discount: 'Official Warranty',
      packageType: 'Sealed Samsung Box',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 15, 4: 3, 3: 1, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-p18-1',
        author: 'Gilbert Ntahomvukiye',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        date: '07 Oct 2024',
        rating: 5,
        comment: 'The physical rotating bezel is so satisfying to use.',
        verified: true,
      },
    ],
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
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80',
    ],
    description:
      'Ultra-pigmented salon-grade gel polish with mirror-gloss shine. 21+ days chip-resistant wear when cured under UV/LED lamp.',
    descriptionFit: '15ml bottle with custom curved brush for smooth cuticle line application.',
    seller: 'ELIMI Nails Studio Bujumbura',
    inStock: true,
    stockQuantity: 25,
    shipping: {
      discount: 'Disc 28%',
      packageType: 'Safe Bubble Mailer',
      deliveryTime: '24h Bujumbura Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 45, 4: 3, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'r-ab-1',
        author: 'Vanessa N.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        date: '16 Oct 2024',
        rating: 5,
        comment: 'The pigment is so rich, just two coats gave full opacity and incredible gloss.',
        verified: true,
      },
    ],
  },
  {
    id: 'nail-art-liner-brush-set',
    name: 'Nail Art Liner Brush Set (3PCS)',
    category: 'Nails & Beauty',
    subCategory: 'Nail Art Tools',
    badgeTag: 'Pro Tools',
    priceBIF: 30000,
    priceUSD: 10.0,
    originalPriceUSD: 15.0,
    discountPercentage: 33,
    rating: 5.0,
    reviewsCount: 32,
    badge: 'Popular',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUxf0ksUrna4frhHONn6dzOU3CyeE1918yhRWiBQ_SdzjaGPQNYcUCYtrcUBzL7YnGXWrGpU-zwQw3EK4J7PNB2LvDzXK67iYXfLn_obt7YZb16JTSE9TIVT_nMwhYUAzUehJ3JrW_7ZBrCpB7_OFA_tcz0fhBuv_VUjWJrli2fJ0uMdEj508zbQ4BMLJcf8GZcDjiyLHao4ck6Jjb2XPW1yUnO4zKtFyKumJvJ9AEGWq4OrNJ6W-kqw',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUxf0ksUrna4frhHONn6dzOU3CyeE1918yhRWiBQ_SdzjaGPQNYcUCYtrcUBzL7YnGXWrGpU-zwQw3EK4J7PNB2LvDzXK67iYXfLn_obt7YZb16JTSE9TIVT_nMwhYUAzUehJ3JrW_7ZBrCpB7_OFA_tcz0fhBuv_VUjWJrli2fJ0uMdEj508zbQ4BMLJcf8GZcDjiyLHao4ck6Jjb2XPW1yUnO4zKtFyKumJvJ9AEGWq4OrNJ6W-kqw',
    ],
    description:
      'Precision ultra-fine detail liner brushes (7mm, 9mm, 11mm) with premium Japanese synthetic bristles for fine line art, french tips, and intricate geometric designs.',
    seller: 'ELIMI Nails Studio Bujumbura',
    inStock: true,
    stockQuantity: 18,
    shipping: {
      discount: 'Disc 33%',
      packageType: 'Protective Sleeve',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 30, 4: 2, 3: 0, 2: 0, 1: 0 },
  },
  {
    id: 'holographic-glitter-set',
    name: 'Holographic Glitter Set (6 Jars)',
    category: 'Nails & Beauty',
    subCategory: 'Nail Art Decor',
    badgeTag: 'Decor & Sparkle',
    priceBIF: 54000,
    priceUSD: 18.0,
    originalPriceUSD: 24.0,
    discountPercentage: 25,
    rating: 5.0,
    reviewsCount: 27,
    badge: 'Trending',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFpGeTCuDUNHPknZfBQ0jw4dRyTih41c56Py8K4oJIhKjHwYhhagprdC_u3MNzfSLMIw6499L5h07bHhle8k0vkmCcXrAX0U5iSlyMJrKKtWQdIDmBr7eu4mrpKDEt-dEyMbbEGQ1-pILPN1bRlgO9PrV428T5Qcd-8hPVyAvv7pZgdWAv-gB9WMr4g3jP_BPv1SBU9_OVjCP8s3VcQYyLoDpG_kY9XH5zGN_qhvg0gUeYbvmBVblTCg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFpGeTCuDUNHPknZfBQ0jw4dRyTih41c56Py8K4oJIhKjHwYhhagprdC_u3MNzfSLMIw6499L5h07bHhle8k0vkmCcXrAX0U5iSlyMJrKKtWQdIDmBr7eu4mrpKDEt-dEyMbbEGQ1-pILPN1bRlgO9PrV428T5Qcd-8hPVyAvv7pZgdWAv-gB9WMr4g3jP_BPv1SBU9_OVjCP8s3VcQYyLoDpG_kY9XH5zGN_qhvg0gUeYbvmBVblTCg',
    ],
    description:
      'Chameleon multi-chrome reflective cosmetic glitters for encapsulating inside gel, acrylic, and polygel nail extensions.',
    seller: 'ELIMI Nails Studio Bujumbura',
    inStock: true,
    stockQuantity: 15,
    shipping: {
      discount: 'Disc 25%',
      packageType: 'Cosmetic Box',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 25, 4: 2, 3: 0, 2: 0, 1: 0 },
  },
  {
    id: 'gold-foil-nail-stickers',
    name: 'Gold Foil Nail Art Stickers',
    category: 'Nails & Beauty',
    subCategory: 'Nail Stickers',
    badgeTag: 'Luxury Stickers',
    priceBIF: 42000,
    priceUSD: 14.0,
    originalPriceUSD: 20.0,
    discountPercentage: 30,
    rating: 5.0,
    reviewsCount: 39,
    badge: 'Staff Pick',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk-Gy80pJGlNraOAsTQqJ-eus3d5iqcAJKGplu8XZ3b5M2Gu4yBkJFc6F3xVwrOYx5j9YT5RjizNMz5aWDjJR7G2WR6LjytKXvJmpTn_rX7bRjcjG5jDbWNXbe1Z6FzWNymt3aRQk3t7DcFydX7eZpHDhifonnN5fySj-GzedMNHGUELKbKivVy57_0vVu6qvQfDCtwGlY7DyCYPD72Ng_C7gZ7hP-RZGSqgwjhWLifEaF5Wo1hk-TXg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDk-Gy80pJGlNraOAsTQqJ-eus3d5iqcAJKGplu8XZ3b5M2Gu4yBkJFc6F3xVwrOYx5j9YT5RjizNMz5aWDjJR7G2WR6LjytKXvJmpTn_rX7bRjcjG5jDbWNXbe1Z6FzWNymt3aRQk3t7DcFydX7eZpHDhifonnN5fySj-GzedMNHGUELKbKivVy57_0vVu6qvQfDCtwGlY7DyCYPD72Ng_C7gZ7hP-RZGSqgwjhWLifEaF5Wo1hk-TXg',
    ],
    description:
      'Self-adhesive metallic gold foil decals featuring celestial stars, minimal lines, and luxury geometric motifs.',
    seller: 'ELIMI Nails Studio Bujumbura',
    inStock: true,
    stockQuantity: 22,
    shipping: {
      discount: 'Disc 30%',
      packageType: 'Protective Board',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 38, 4: 1, 3: 0, 2: 0, 1: 0 },
  },
  {
    id: 'elegant-nude-press-on-nails',
    name: 'Elegant Nude Press On Nails',
    category: 'Nails & Beauty',
    subCategory: 'Press-On Nails',
    badgeTag: 'Handmade Set',
    priceBIF: 48000,
    priceUSD: 16.0,
    originalPriceUSD: 25.0,
    discountPercentage: 36,
    rating: 5.0,
    reviewsCount: 54,
    badge: 'Top Seller',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV1FSV1kUVkkpkxnpoXnM7cGZ9OWlMe3cE8iawxYiiGk8IieYOxbV4n6145_Y8QNRbrKWBcumVzgDCM5aGcxVco7He8RPoKwDEIm_4J9WQUqFhjNNSHsaR-QyKwphhRTv5H96EzTeufjRzsjunA9uINQo77PcLxVJt_-lwH_C2haAaNfwv_9LOlneAHjYSFjfbuB51VI7hIWW_y8evrVIiWLTZtKo_TEsyU5Oh8VoFkYq2EmdD1dj0YA',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAV1FSV1kUVkkpkxnpoXnM7cGZ9OWlMe3cE8iawxYiiGk8IieYOxbV4n6145_Y8QNRbrKWBcumVzgDCM5aGcxVco7He8RPoKwDEIm_4J9WQUqFhjNNSHsaR-QyKwphhRTv5H96EzTeufjRzsjunA9uINQo77PcLxVJt_-lwH_C2haAaNfwv_9LOlneAHjYSFjfbuB51VI7hIWW_y8evrVIiWLTZtKo_TEsyU5Oh8VoFkYq2EmdD1dj0YA',
    ],
    description:
      'Handcrafted almond nude press-on nails with ombre blush french fade. Includes full prep kit with nail glue and sticky tabs.',
    seller: 'ELIMI Nails Studio Bujumbura',
    inStock: true,
    stockQuantity: 16,
    sizes: ['XS', 'S', 'M', 'L'],
    shipping: {
      discount: 'Disc 36%',
      packageType: 'Velvet Presentation Box',
      deliveryTime: '24h Delivery',
      estimatedArrival: 'Tomorrow',
    },
    ratingBreakdown: { 5: 50, 4: 4, 3: 0, 2: 0, 1: 0 },
  },
];

export function getProductById(id: string): Product | undefined {
  const found = BOUTIQUE_PRODUCTS.find((p) => p.id === id);
  if (found) return found;
  // If id is not matched directly, handle fallbacks like p8 for loose-fit-hoodie or similar
  if (id === 'p8' || id === 'hoodie' || id === 'loose-fit-hoodie') {
    return BOUTIQUE_PRODUCTS[0];
  }
  return BOUTIQUE_PRODUCTS[0]; // safe fallback
}

export function getRelatedProducts(currentId: string, count = 4): Product[] {
  const current = getProductById(currentId);
  const others = BOUTIQUE_PRODUCTS.filter((p) => p.id !== current?.id);
  
  // Prioritize same category first
  const sameCategory = others.filter((p) => p.category === current?.category);
  const differentCategory = others.filter((p) => p.category !== current?.category);
  
  const combined = [...sameCategory, ...differentCategory];
  return combined.slice(0, count);
}
