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
  const maxStock = product.stockQuantity !== undefined ? Math.max(1, product.stockQuantity) : 99;
  
  const effectiveSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
  const effectiveColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);

  const existingIndex = current.findIndex(
    (item) =>
      item.product.id === product.id &&
      (item.selectedSize || 'Standard') === effectiveSize &&
      (item.selectedColor || '') === (effectiveColor || '')
  );

  let updated: CartItem[];
  if (existingIndex > -1) {
    updated = current.map((item, idx) => {
      if (idx === existingIndex) {
        const newQty = Math.min(maxStock, item.quantity + quantity);
        return { ...item, quantity: newQty };
      }
      return item;
    });
  } else {
    updated = [
      ...current,
      {
        product,
        quantity: Math.min(maxStock, quantity),
        selectedSize: effectiveSize,
        selectedColor: effectiveColor,
      },
    ];
  }
  saveCart(updated);
  return updated;
}

export function updateCartItemAttributes(
  itemIndex: number,
  newSize?: string,
  newColor?: string
): CartItem[] {
  const current = getSavedCart();
  if (itemIndex < 0 || itemIndex >= current.length) return current;

  const target = current[itemIndex];
  const updatedSize = newSize !== undefined ? newSize : target.selectedSize;
  const updatedColor = newColor !== undefined ? newColor : target.selectedColor;

  // Check if another item in cart already has the exact same product ID, size, and color
  const duplicateIndex = current.findIndex(
    (item, idx) =>
      idx !== itemIndex &&
      item.product.id === target.product.id &&
      (item.selectedSize || 'Standard') === (updatedSize || 'Standard') &&
      (item.selectedColor || '') === (updatedColor || '')
  );

  let updated: CartItem[];
  if (duplicateIndex > -1) {
    // Merge quantity into existing matching item and remove the current duplicate entry
    const maxStock = target.product.stockQuantity !== undefined ? Math.max(1, target.product.stockQuantity) : 99;
    updated = current
      .map((item, idx) => {
        if (idx === duplicateIndex) {
          return {
            ...item,
            quantity: Math.min(maxStock, item.quantity + target.quantity),
          };
        }
        return item;
      })
      .filter((_, idx) => idx !== itemIndex);
  } else {
    updated = current.map((item, idx) => {
      if (idx === itemIndex) {
        return {
          ...item,
          selectedSize: updatedSize,
          selectedColor: updatedColor,
        };
      }
      return item;
    });
  }

  saveCart(updated);
  return updated;
}

export function updateCartItemQuantityByIndex(index: number, delta: number): CartItem[] {
  const current = getSavedCart();
  if (index < 0 || index >= current.length) return current;

  const updated = current
    .map((item, idx) => {
      if (idx === index) {
        const maxStock = item.product.stockQuantity !== undefined ? Math.max(1, item.product.stockQuantity) : 99;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        return { ...item, quantity: Math.min(maxStock, newQty) };
      }
      return item;
    })
    .filter(Boolean) as CartItem[];
  saveCart(updated);
  return updated;
}

export function removeCartItemByIndex(index: number): CartItem[] {
  const current = getSavedCart();
  const updated = current.filter((_, idx) => idx !== index);
  saveCart(updated);
  return updated;
}

export function updateCartItemQuantity(productId: string, delta: number): CartItem[] {
  const current = getSavedCart();
  const updated = current
    .map((item) => {
      if (item.product.id === productId) {
        const maxStock = item.product.stockQuantity !== undefined ? Math.max(1, item.product.stockQuantity) : 99;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        return { ...item, quantity: Math.min(maxStock, newQty) };
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
