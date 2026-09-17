import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore, BoutiqueOrder } from '@/lib/firestore-orders';
import { WHATSAPP_NUMBER } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderId = body.id || `ELM-ORD-${timestamp}-${random}`;
    const orderNumber = orderId.replace('ELM-ORD-', '#');
    const now = new Date().toISOString();

    const newOrder: BoutiqueOrder = {
      id: orderId,
      orderNumber,
      items: Array.isArray(body.items) ? body.items : [],
      deliveryMethod: body.deliveryMethod === 'home_delivery' ? 'home_delivery' : 'pickup',
      deliveryCostUSD: Number(body.deliveryCostUSD) || 0,
      deliveryCostBIF: Number(body.deliveryCostBIF) || 0,
      subtotalUSD: Number(body.subtotalUSD) || 0,
      subtotalBIF: Number(body.subtotalBIF) || 0,
      discountUSD: Number(body.discountUSD) || 0,
      discountBIF: Number(body.discountBIF) || 0,
      totalUSD: Number(body.totalUSD) || 0,
      totalBIF: Number(body.totalBIF) || 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    if (body.discountCode) {
      newOrder.discountCode = String(body.discountCode);
    }
    if (body.pickupBureau) {
      newOrder.pickupBureau = String(body.pickupBureau);
    }
    if (body.customerNotes) {
      newOrder.customerNotes = String(body.customerNotes);
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
