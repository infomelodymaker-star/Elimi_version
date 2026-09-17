export interface Product {
  id: string;
  name: string;
  category: 'Apparel' | 'Stationery' | 'Packaging' | 'Promotional';
  priceRange: string;
  minPrice: number;
  image: string;
  description: string;
  badge?: string;
  options?: {
    finishes?: string[];
    quantities?: number[];
  };
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  image: string;
  quantity: number;
  unitPrice: number;
  finish: string;
  customText?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}
