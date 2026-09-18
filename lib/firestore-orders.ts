import {
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from './products';
import { WHATSAPP_NUMBER } from './utils';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  priceUSD: number;
  priceBIF: number;
  quantity: number;
  selectedSize?: string;
  shippingCostUSD: number;
  shippingCostBIF: number;
}

export interface BoutiqueOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  deliveryMethod: 'home_delivery' | 'pickup';
  deliveryCostUSD: number;
  deliveryCostBIF: number;
  subtotalUSD: number;
  subtotalBIF: number;
  discountUSD: number;
  discountBIF: number;
  discountCode?: string;
  totalUSD: number;
  totalBIF: number;
  pickupBureau?: string;
  customerNotes?: string;
  status: 'pending' | 'finished' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const ORDERS_STORAGE_KEY = 'elimi_orders_storage';
export const ORDERS_SYNC_EVENT = 'elimi_sync_orders';

/**
 * Recursively cleans any object/array to remove keys with `undefined` values.
 * Firestore rejects documents containing `undefined` values with:
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ELM-ORD-${timestamp}-${random}`;
}

export async function createCheckoutOrder(orderData: Omit<BoutiqueOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<{ success: boolean; orderId: string; order: BoutiqueOrder }> {
  const orderId = orderData.id || generateOrderId();
  const now = new Date().toISOString();

  const newOrder: BoutiqueOrder = {
    ...orderData,
    id: orderId,
    orderNumber: orderId.replace('ELM-ORD-', '#'),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Immediately persist to resilient local storage & broadcast to dashboard
  const currentOrders = getStoredItems<BoutiqueOrder>(ORDERS_STORAGE_KEY, []);
  const updatedOrders = [newOrder, ...currentOrders.filter((o) => o.id !== orderId)];
  saveStoredItems(ORDERS_STORAGE_KEY, updatedOrders, ORDERS_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const orderDocRef = doc(db, 'orders', orderId);
    const sanitizedOrder = sanitizeForFirestore(newOrder);
    await setDoc(orderDocRef, sanitizedOrder);
  }, 1200, `Create checkout order ${orderId}`);

  return { success: true, orderId, order: newOrder };
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'finished' | 'cancelled'): Promise<boolean> {
  const now = new Date().toISOString();
  // 1. Immediately update local storage
  const currentOrders = getStoredItems<BoutiqueOrder>(ORDERS_STORAGE_KEY, []);
  const updatedOrders = currentOrders.map((o) =>
    o.id === orderId ? { ...o, status, updatedAt: now } : o
  );
  saveStoredItems(ORDERS_STORAGE_KEY, updatedOrders, ORDERS_SYNC_EVENT);

  // 2. Non-blocking background sync to Firestore
  runFirestoreTaskSafe(async () => {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(
      orderDocRef,
      {
        status,
        updatedAt: now,
      },
      { merge: true }
    );
  }, 1200, `Update order status ${orderId}`);

  return true;
}

export function generateClientWhatsAppGreetingUrl(orderId: string, customPhone?: string): string {
  const cleanPhone = customPhone ? customPhone.replace(/[^0-9]/g, '') : WHATSAPP_NUMBER;
  const phone = cleanPhone || WHATSAPP_NUMBER;
  const message = `Hello ELIMI Boutique! I would like to confirm my order ID: *${orderId}*. Please verify my order details and confirm availability!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppOrderConfirmationText(order: BoutiqueOrder): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (x${item.quantity}${item.selectedSize ? `, Size: ${item.selectedSize}` : ''})\n   ↳ $${(item.priceUSD * item.quantity).toFixed(2)} USD (${(item.priceBIF * item.quantity).toLocaleString()} BIF) [Delivery: $${item.shippingCostUSD.toFixed(2)}]`
    )
    .join('\n');

  const formattedDate = new Date(order.createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const discountText =
    order.discountUSD > 0
      ? `\n🏷️ *Discount (${order.discountCode || 'Promo'}):* -$${order.discountUSD.toFixed(2)} USD (-${order.discountBIF.toLocaleString()} BIF)`
      : '';

  const deliveryDetail =
    order.deliveryMethod === 'home_delivery'
      ? `🏠 *Home Delivery (Bujumbura):* $${order.deliveryCostUSD.toFixed(2)} USD (${order.deliveryCostBIF.toLocaleString()} BIF)`
      : `🏢 *Pickup at Bureau:* Free (0 BIF) - ${order.pickupBureau || 'Rohero I Central Bureau'}`;

  return `📋 *ELIMI BOUTIQUE - ORDER CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* ${order.id}
📅 *Date:* ${formattedDate}
📌 *Status:* ${order.status.toUpperCase()}

🛍️ *Ordered Products (${order.items.length}):*
${itemsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* $${order.subtotalUSD.toFixed(2)} USD (${order.subtotalBIF.toLocaleString()} BIF)
${deliveryDetail}${discountText}

💵 *TOTAL PAYABLE:* *$${order.totalUSD.toFixed(2)} USD (${order.totalBIF.toLocaleString()} BIF)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 *Payment Methods:* Lumicash, Ecocash & Cash on Delivery.
Thank you for shopping with ELIMI Boutique! ✨`;
}

