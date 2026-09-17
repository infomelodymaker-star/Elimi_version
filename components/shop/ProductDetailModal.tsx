'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EMIL_SPRINGS, EMIL_EASINGS } from '@/lib/motion-constants';
import { X, Star, ShieldCheck, Truck, ShoppingCart, Check } from 'lucide-react';
import { Product } from './ProductGrid';
import { createCheckoutOrder, generateClientWhatsAppGreetingUrl } from '@/lib/firestore-orders';
import { WHATSAPP_NUMBER } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const shouldReduceMotion = useReducedMotion();

  const whatsappMessage = product
    ? `Hello ELIMI Boutique, I am interested in purchasing "${product.name}" (${product.priceBIF.toLocaleString()} BIF / $${product.priceUSD} USD). Please let me know availability and delivery details.`
    : '';

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EMIL_EASINGS.easeOut }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 10 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97, y: 6 }
            }
            transition={shouldReduceMotion ? { duration: 0.15 } : EMIL_SPRINGS.modal}
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: 'center' }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto will-change-transform"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-[#F2F4F8] hover:bg-slate-200 text-[#525866] transition-[transform,background-color] duration-150 active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Left Image Showcase */}
              <div className="relative w-full h-64 sm:h-80 rounded-2xl bg-[#F8FAFC] border border-slate-200/60 p-4 flex items-center justify-center overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-contain p-2"
                />
                {product.badge && (
                  <div className="absolute top-4 left-4 bg-[#0A2351] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Right Details Block */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#525866] mb-1">
                    <span className="font-bold text-[#0D52FF]">{product.category}</span>
                    <span>•</span>
                    <span>{product.seller}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#181B25] leading-snug">
                    {product.name}
                  </h3>
                </div>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#181B25]">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400">({product.reviewsCount} customer reviews)</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                    In Stock
                  </span>
                </div>

                {/* Price Block */}
                <div className="bg-[#F2F4F8] p-3.5 rounded-2xl border border-slate-200/70">
                  <div className="text-[#0D52FF] text-2xl font-black">
                    {product.priceBIF.toLocaleString()} BIF
                  </div>
                  <div className="text-xs text-[#525866] font-medium">
                    Approx. ${product.priceUSD} USD
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
                  {product.description}
                </p>

                {/* Trust Features */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#181B25] font-semibold pt-1">
                  <div className="flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-xl text-[#0D52FF]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Verified Quality</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50/50 p-2 rounded-xl text-[#0D52FF]">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Express Delivery</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!product) return;
                      try {
                        const singleItem = {
                          productId: product.id,
                          name: product.name,
                          image: product.image || '/assets/shop/african-suit.jpg',
                          priceUSD: product.priceUSD,
                          priceBIF: product.priceBIF,
                          quantity: 1,
                          shippingCostUSD: 0,
                          shippingCostBIF: 0,
                        };
                        const orderPayload = {
                          items: [singleItem],
                          deliveryMethod: 'home_delivery' as const,
                          deliveryCostUSD: 0,
                          deliveryCostBIF: 0,
                          subtotalUSD: product.priceUSD,
                          subtotalBIF: product.priceBIF,
                          discountUSD: 0,
                          discountBIF: 0,
                          totalUSD: product.priceUSD,
                          totalBIF: product.priceBIF,
                          customerNotes: `Direct modal checkout for ${product.name}`,
                        };
                        const result = await createCheckoutOrder(orderPayload);
                        const url = result.success && result.orderId
                          ? generateClientWhatsAppGreetingUrl(result.orderId)
                          : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
                        if (typeof window !== 'undefined') {
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      } catch {
                        if (typeof window !== 'undefined') {
                          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
                        }
                      }
                      onClose();
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.97] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] text-white font-extrabold rounded-full py-3 px-5 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    <Image
                      src="/assets/icons/social/whatsapp-150x150.png"
                      alt="WhatsApp"
                      width={18}
                      height={18}
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 object-contain"
                    />
                    <span>Order Directly via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] active:scale-[0.97] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] text-white font-extrabold rounded-full py-3 px-5 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

