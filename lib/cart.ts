'use client';

import { Product } from '@/components/shop/ProductGrid';
import { BOUTIQUE_PRODUCTS, getEffectiveShippingCost } from '@/lib/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface DeliveryFeeSummary {
  costUSD: number;
  costBIF: number;
  uniqueProductsCount: number;
  breakdown: Array<{
    productId: string;
    productName: string;
    quantity: number;
    feeUSD: number;
    feeBIF: number;
  }>;
}

/**
 * Calculates delivery fee for items in the cart according to the business rule:
 * - Each distinct product has its own delivery fee.
 * - Multiple items of the same product (e.g. 2, 3, or different sizes of the same product)
 *   incur ONLY ONE delivery fee.
 * - The cart total delivery fee is the sum of the delivery fees of each distinct product.
 */
export function calculateCartDeliveryFee(cartItems: CartItem[]): DeliveryFeeSummary {
  if (!cartItems || cartItems.length === 0) {
    return { costUSD: 0, costBIF: 0, uniqueProductsCount: 0, breakdown: [] };
  }

  // Deduplicate products by id: if the same product is added with multiple items (quantity >= 1),
  // they only incur a SINGLE delivery fee.
  const productMap = new Map<string, { product: Product; totalQuantity: number }>();
  for (const item of cartItems) {
    if (!item.product?.id) continue;
    const existing = productMap.get(item.product.id);
    if (existing) {
      existing.totalQuantity += item.quantity;
    } else {
      productMap.set(item.product.id, { product: item.product, totalQuantity: item.quantity });
    }
  }

  let totalUSD = 0;
  let totalBIF = 0;
  const breakdown: Array<{
    productId: string;
    productName: string;
    quantity: number;
    feeUSD: number;
    feeBIF: number;
  }> = [];

  for (const { product, totalQuantity } of productMap.values()) {
    const fee = getEffectiveShippingCost(product);
    totalUSD += fee.costUSD;
    totalBIF += fee.costBIF;
    breakdown.push({
      productId: product.id,
      productName: product.name,
      quantity: totalQuantity,
      feeUSD: fee.costUSD,
      feeBIF: fee.costBIF,
    });
  }

  return {
    costUSD: Number(totalUSD.toFixed(2)),
    costBIF: Math.round(totalBIF),
    uniqueProductsCount: productMap.size,
    breakdown,
  };
}

const CART_STORAGE_KEY = 'elimi_boutique_cart';

const EMPTY_CART: CartItem[] = [];
let cachedCart: CartItem[] = EMPTY_CART;
let cachedRaw: string | null = null;

export function getSavedCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return EMPTY_CART;
  }
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      if (cachedRaw === null && cachedCart === EMPTY_CART) {
        return EMPTY_CART;
      }
      cachedRaw = null;
      cachedCart = EMPTY_CART;
      return EMPTY_CART;
    }
    if (raw === cachedRaw && cachedCart !== null) {
      return cachedCart;
    }
    cachedRaw = raw;
    const parsed = JSON.parse(raw);
    cachedCart = Array.isArray(parsed) ? parsed : EMPTY_CART;
    return cachedCart;
  } catch (err) {
    console.error('Failed to read cart from localStorage', err);
    return cachedCart || EMPTY_CART;
  }
}

export function subscribeCart(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('elimi-cart-updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('elimi-cart-updated', callback);
    window.removeEventListener('storage', callback);
  };
}

const SERVER_EMPTY_CART: CartItem[] = [];

export function getCartSnapshot(): CartItem[] {
  return getSavedCart();
}

export function getServerCartSnapshot(): CartItem[] {
  return SERVER_EMPTY_CART;
}

export function getCartCountSnapshot(): number {
  const items = getSavedCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getServerCartCountSnapshot(): number {
  return 0;
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem(CART_STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedCart = items;
    window.dispatchEvent(new CustomEvent('elimi-cart-updated', { detail: items }));
  } catch (err) {
    console.error('Failed to write cart to localStorage', err);
  }
}

export function addToCart(
  product: Product,
  quantity = 1,
  selectedSize?: string,
  selectedColor?: string
): CartItem[] {
  const current = getSavedCart();
  const existingIndex = current.findIndex(
    (item) =>
      item.product.id === product.id &&
      (selectedSize ? item.selectedSize === selectedSize : true)
  );

  let updated: CartItem[];
  if (existingIndex > -1) {
    updated = current.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    updated = [
      ...current,
      {
        product,
        quantity,
        selectedSize: selectedSize || 'Standard',
        selectedColor: selectedColor || 'Default',
      },
    ];
  }
  saveCart(updated);
  return updated;
}

export function updateCartItemQuantity(productId: string, delta: number): CartItem[] {
  const current = getSavedCart();
  const updated = current
    .map((item) => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    })
    .filter(Boolean) as CartItem[];
  saveCart(updated);
  return updated;
}

export function removeCartItem(productId: string): CartItem[] {
  const current = getSavedCart();
  const updated = current.filter((item) => item.product.id !== productId);
  saveCart(updated);
  return updated;
}

export function clearCart(): CartItem[] {
  saveCart([]);
  return [];
}
