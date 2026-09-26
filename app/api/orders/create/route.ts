import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore, BoutiqueOrder, BoutiqueOrderItem } from '@/lib/firestore-orders';
import { WHATSAPP_NUMBER } from '@/lib/utils';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { sanitizeString, sanitizeNumber } from '@/lib/security-validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: Max 12 order creations per 5 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`order-create-${clientIp}`, 12, 5 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trop de commandes créées récemment. Veuillez patienter quelques instants.',
        },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString() },
        }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Payload de commande invalide' }, { status: 400 });
    }

    // 2. Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Le panier ne contient aucun article' }, { status: 400 });
    }

    // Sanitize and validate items structure
    const sanitizedItems: BoutiqueOrderItem[] = [];
    let calculatedSubtotalUSD = 0;
    let calculatedSubtotalBIF = 0;

    for (const rawItem of body.items) {
      if (!rawItem || typeof rawItem !== 'object') continue;

      const id = sanitizeString(rawItem.id, 60) || `item-${Math.random().toString(36).slice(2, 8)}`;
      const title = sanitizeString(rawItem.title, 150) || 'Article de boutique';
      const category = sanitizeString(rawItem.category, 50);
      const image = typeof rawItem.image === 'string' ? rawItem.image.trim().slice(0, 500) : '';
      const quantity = Math.max(1, Math.min(100, Math.floor(sanitizeNumber(rawItem.quantity, 1, 100, 1))));
      const priceUSD = sanitizeNumber(rawItem.priceUSD, 0, 50000, 0);
      const priceBIF = sanitizeNumber(rawItem.priceBIF, 0, 200000000, 0);
      const selectedSize = rawItem.selectedSize ? sanitizeString(rawItem.selectedSize, 30) : undefined;
      const selectedColor = rawItem.selectedColor ? sanitizeString(rawItem.selectedColor, 30) : undefined;

      sanitizedItems.push({
        id,
        title,
        category,
        image,
        priceUSD,
        priceBIF,
        quantity,
        selectedSize,
        selectedColor,
      });

      calculatedSubtotalUSD += priceUSD * quantity;
      calculatedSubtotalBIF += priceBIF * quantity;
    }

    if (sanitizedItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Aucun article valide trouvé dans la commande' }, { status: 400 });
    }

    // 3. Generate safe unguessable Order ID on server
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ELM-ORD-${timestamp}-${random}`;
    const orderNumber = `#${timestamp}-${random}`;
    const now = new Date().toISOString();

    const deliveryMethod = body.deliveryMethod === 'home_delivery' ? 'home_delivery' : 'pickup';
    const deliveryCostUSD = sanitizeNumber(body.deliveryCostUSD, 0, 1000, deliveryMethod === 'home_delivery' ? 5 : 0);
    const deliveryCostBIF = sanitizeNumber(body.deliveryCostBIF, 0, 5000000, deliveryMethod === 'home_delivery' ? 15000 : 0);
    const discountUSD = sanitizeNumber(body.discountUSD, 0, calculatedSubtotalUSD, 0);
    const discountBIF = sanitizeNumber(body.discountBIF, 0, calculatedSubtotalBIF, 0);

    const totalUSD = Math.max(0, calculatedSubtotalUSD + deliveryCostUSD - discountUSD);
    const totalBIF = Math.max(0, calculatedSubtotalBIF + deliveryCostBIF - discountBIF);

    const newOrder: BoutiqueOrder = {
      id: orderId,
      orderNumber,
      items: sanitizedItems,
      deliveryMethod,
      deliveryCostUSD,
      deliveryCostBIF,
      subtotalUSD: calculatedSubtotalUSD,
      subtotalBIF: calculatedSubtotalBIF,
      discountUSD,
      discountBIF,
      totalUSD,
      totalBIF,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    if (body.discountCode) {
      newOrder.discountCode = sanitizeString(body.discountCode, 30);
    }
    if (body.pickupBureau) {
      newOrder.pickupBureau = sanitizeString(body.pickupBureau, 100);
    }
    if (body.customerNotes) {
      newOrder.customerNotes = sanitizeString(body.customerNotes, 500);
    }

    // Save order document to Firestore
    try {
      const sanitized = sanitizeForFirestore(newOrder);
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, sanitized);
    } catch (dbError) {
      console.error('Error saving order to Firestore in API route:', dbError);
    }

    const message = `Hello ELIMI Boutique! I would like to confirm my order ID: *${orderId}*. Please verify my order details and confirm availability!`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      whatsappUrl,
      order: newOrder,
    });
  } catch (error) {
    console.error('Order creation API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
