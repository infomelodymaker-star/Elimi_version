import {
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from './products';
import { WHATSAPP_NUMBER } from './utils';
import { sanitizeWhatsAppNumber } from './firestore-settings';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  priceUSD: number;
  priceBIF: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  shippingCostUSD: number;
  shippingCostBIF: number;
}

export type BoutiqueOrderItem = OrderItem;

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

export function generateClientWhatsAppGreetingUrl(
  orderId: string,
  customPhone?: string,
  details?:
    | BoutiqueOrder
    | {
        itemName?: string;
        size?: string;
        color?: string;
        quantity?: number;
        items?: Array<{
          name: string;
          quantity?: number;
          selectedSize?: string;
          size?: string;
          selectedColor?: string;
          color?: string;
          priceUSD?: number;
          priceBIF?: number;
        }>;
        totalUSD?: number;
        totalBIF?: number;
      }
): string {
  const phone = sanitizeWhatsAppNumber(customPhone);

  let detailsBlock = '';
  if (details) {
    if ('items' in details && Array.isArray(details.items) && details.items.length > 0) {
      const itemsList = details.items
        .map((item, idx) => {
          const sz = item.selectedSize || (item as any).size;
          const col = item.selectedColor || (item as any).color;
          const sizePart = sz ? ` | Taille/Size: *${sz}*` : '';
          const colorPart = col ? ` | Couleur/Color: *${col}*` : '';
          return `  ${idx + 1}. *${item.name}* (x${item.quantity || 1})${sizePart}${colorPart}`;
        })
        .join('\n');

      const totalPart =
        details.totalUSD !== undefined
          ? `\n💰 *Total:* $${details.totalUSD.toFixed(2)} USD (${details.totalBIF ? details.totalBIF.toLocaleString() : Math.round(details.totalUSD * 3000).toLocaleString()} BIF)`
          : '';

      detailsBlock = `\n\n🛍️ *Détails de la réservation / commande :*\n${itemsList}${totalPart}`;
    } else if ('itemName' in details && details.itemName) {
      const sizePart = details.size ? `\n📏 *Taille / Size:* *${details.size}*` : '';
      const colorPart = details.color ? `\n🎨 *Couleur / Color:* *${details.color}*` : '';
      const qtyPart = details.quantity && details.quantity > 1 ? `\n🔢 *Quantité / Qty:* x${details.quantity}` : '';
      const totalPart =
        details.totalUSD !== undefined
          ? `\n💰 *Total:* $${details.totalUSD.toFixed(2)} USD (${details.totalBIF ? details.totalBIF.toLocaleString() : Math.round(details.totalUSD * 3000).toLocaleString()} BIF)`
          : '';

      detailsBlock = `\n\n🛍️ *Article :* *${details.itemName}*${qtyPart}${sizePart}${colorPart}${totalPart}`;
    }
  }

  const message = `Bonjour ELIMI ! Je souhaite confirmer ma réservation / commande ID: *${orderId}*.${detailsBlock}\n\nMerci de bien vouloir vérifier la disponibilité et confirmer les détails !`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppOrderConfirmationText(order: BoutiqueOrder): string {
  const itemsText = order.items
    .map(
      (item, idx) => {
        const size = item.selectedSize || (item as any).size;
        const color = item.selectedColor || (item as any).color;
        const sizeStr = size ? ` | Taille/Size: *${size}*` : '';
        const colorStr = color ? ` | Couleur/Color: *${color}*` : '';
        return `${idx + 1}. *${item.name}* (x${item.quantity}${sizeStr}${colorStr})\n   ↳ $${(item.priceUSD * item.quantity).toFixed(2)} USD (${(item.priceBIF * item.quantity).toLocaleString()} BIF) [Livraison/Delivery: $${(item.shippingCostUSD || 0).toFixed(2)}]`;
      }
    )
    .join('\n');

  const formattedDate = new Date(order.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const discountText =
    order.discountUSD > 0
      ? `\n🏷️ *Réduction / Discount (${order.discountCode || 'Promo'}):* -$${order.discountUSD.toFixed(2)} USD (-${order.discountBIF.toLocaleString()} BIF)`
      : '';

  const deliveryDetail =
    order.deliveryMethod === 'home_delivery'
      ? `🏠 *Livraison à domicile (Bujumbura):* $${order.deliveryCostUSD.toFixed(2)} USD (${order.deliveryCostBIF.toLocaleString()} BIF)`
      : `🏢 *Retrait au Bureau:* Gratuit (0 BIF) - ${order.pickupBureau || 'Rohero I Central Bureau'}`;

  const notesText = order.customerNotes ? `\n📝 *Notes:* ${order.customerNotes}` : '';

  return `📋 *ELIMI - CONFIRMATION DE COMMANDE / ORDER CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 *ID Commande:* ${order.id}
📅 *Date:* ${formattedDate}
📌 *Statut:* ${order.status.toUpperCase()}

🛍️ *Articles / Products (${order.items.length}):*
${itemsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Sous-total:* $${order.subtotalUSD.toFixed(2)} USD (${order.subtotalBIF.toLocaleString()} BIF)
${deliveryDetail}${discountText}${notesText}

💵 *TOTAL À PAYER:* *$${order.totalUSD.toFixed(2)} USD (${order.totalBIF.toLocaleString()} BIF)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 *Moyens de paiement:* Lumicash, Ecocash & Cash à la livraison.
Merci pour votre confiance avec ELIMI ! ✨`;
}

