'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EMIL_SPRINGS } from '@/lib/motion-constants';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { Product } from './ProductGrid';
import { WHATSAPP_NUMBER } from '@/lib/utils';
import { createCheckoutOrder, generateClientWhatsAppGreetingUrl } from '@/lib/firestore-orders';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function ShoppingCartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: ShoppingCartDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  const totalBIF = cartItems.reduce(
    (sum, item) => sum + item.product.priceBIF * item.quantity,
    0
  );
  const totalUSD = cartItems.reduce(
    (sum, item) => sum + item.product.priceUSD * item.quantity,
    0
  );

  const formatCartSummaryForWhatsApp = () => {
    if (cartItems.length === 0) return '';
    const itemLines = cartItems
      .map(
        (item) =>
          `• ${item.product.name} (x${item.quantity}) - ${(
            item.product.priceBIF * item.quantity
          ).toLocaleString()} BIF`
      )
      .join('\n');

    return `Hello ELIMI Boutique team! I would like to place an order for:\n\n${itemLines}\n\nTotal: ${totalBIF.toLocaleString()} BIF (~$${totalUSD} USD).\n\nPlease confirm availability and delivery location.`;
  };

  const whatsappCheckoutUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    formatCartSummaryForWhatsApp()
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { transform: 'translateX(100%)' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { transform: 'translateX(0%)' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { transform: 'translateX(100%)' }}
            transition={shouldReduceMotion ? { duration: 0.15 } : EMIL_SPRINGS.drawer}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between relative will-change-transform"
          >
            {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0D52FF] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 tracking-tight">
                  Your Cart
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items in your bag
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-[#0D52FF] flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-neutral-900">
                  Your cart is empty
                </h4>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Browse our Fashion, Electronics, Cultural Crafts, and Beauty items to add products.
                </p>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-start gap-3.5"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl bg-[#F0F2F5] border border-slate-200/60 p-1.5 shrink-0 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                        {product.name}
                      </h5>
                      {/* Red Trash button matching reference */}
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-full transition cursor-pointer -mt-1 -mr-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {product.category || 'Boutique'}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-neutral-900">
                          ${(product.priceUSD * quantity).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {(product.priceBIF * quantity).toLocaleString()} BIF
                        </div>
                      </div>

                      {/* Quantity Stepper Pill */}
                      <div className="bg-[#F0F2F5] rounded-full px-2.5 py-1 flex items-center gap-2.5 text-xs font-bold text-neutral-900 border border-slate-200/60">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[14px] text-center">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Block - Order Summary Style */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ${totalUSD.toFixed(2)} ({totalBIF.toLocaleString()} BIF)
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery in Bujumbura</span>
                  <span className="text-emerald-600 font-semibold">Fast delivery</span>
                </div>
                <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-[#0D52FF]">
                    ${totalUSD.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-neutral-600">
                      ({totalBIF.toLocaleString()} BIF)
                    </span>
                  </span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 pt-1">
                {/* View Full Cart Page Button */}
                <Link
                  href="/shop/cart"
                  onClick={onClose}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-full py-3 px-5 transition flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xs cursor-pointer"
                >
                  <span>Go to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Direct WhatsApp Checkout Button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const orderItems = cartItems.map((item) => ({
                        productId: item.product.id,
                        name: item.product.name,
                        image: item.product.image || '/assets/shop/african-suit.jpg',
                        priceUSD: item.product.priceUSD,
                        priceBIF: item.product.priceBIF,
                        quantity: item.quantity,
                        shippingCostUSD: 0,
                        shippingCostBIF: 0,
                      }));

                      const orderPayload = {
                        items: orderItems,
                        deliveryMethod: 'home_delivery' as const,
                        deliveryCostUSD: 0,
                        deliveryCostBIF: 0,
                        subtotalUSD: totalUSD,
                        subtotalBIF: totalBIF,
                        discountUSD: 0,
                        discountBIF: 0,
                        totalUSD: totalUSD,
                        totalBIF: totalBIF,
                        customerNotes: 'WhatsApp Concierge order from drawer',
                      };

                      const result = await createCheckoutOrder(orderPayload);
                      const url = result.success && result.orderId
                        ? generateClientWhatsAppGreetingUrl(result.orderId)
                        : whatsappCheckoutUrl;
                      
                      onClearCart();
                      onClose();

                      if (typeof window !== 'undefined') {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    } catch {
                      if (typeof window !== 'undefined') {
                        window.open(whatsappCheckoutUrl, '_blank', 'noopener,noreferrer');
                      }
                      onClose();
                    }
                  }}
                  className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1EBE5D] font-bold rounded-full py-2.5 px-5 transition flex items-center justify-center gap-2 text-xs border border-[#25D366]/30 cursor-pointer"
                >
                  <Image
                    src="/assets/icons/social/whatsapp-150x150.png"
                    alt="WhatsApp"
                    width={16}
                    height={16}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 object-contain"
                  />
                  <span>WhatsApp Concierge</span>
                </button>
              </div>

              <div className="text-[10px] text-center text-neutral-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D52FF]" />
                <span>Mobile Money & Cash on Delivery Available</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
}
