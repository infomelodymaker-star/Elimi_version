'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EMIL_SPRINGS, EMIL_EASINGS } from '@/lib/motion-constants';
import { X, Star, ShieldCheck, Truck, ShoppingCart, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { Product } from './ProductGrid';
import { createCheckoutOrder, generateClientWhatsAppGreetingUrl } from '@/lib/firestore-orders';
import { WHATSAPP_NUMBER } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showStockBubble, setShowStockBubble] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor(null);
      }
      setQuantity(1);
      setShowStockBubble(false);
    }
  }, [product]);

  const maxStock = product?.stockQuantity ? Math.max(1, product.stockQuantity) : 99;
  const isAtStockLimit = quantity >= maxStock;

  const handleIncrement = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    } else {
      setShowStockBubble(true);
      setTimeout(() => setShowStockBubble(false), 2800);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const colorText = selectedColor ? ` | Color: ${selectedColor.name}` : '';
  const sizeText = selectedSize ? ` | Size: ${selectedSize}` : '';
  const whatsappMessage = product
    ? `Hello ELIMI Boutique, I am interested in purchasing ${quantity}x "${product.name}"${sizeText}${colorText} (${(product.priceBIF * quantity).toLocaleString()} BIF / $${product.priceUSD * quantity} USD). Please let me know availability and delivery details.`
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
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto will-change-transform font-sans"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-[#F2F4F8] hover:bg-slate-200 text-[#525866] transition-[transform,background-color] duration-150 active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Left Image Showcase */}
              <div className="space-y-3">
                <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-[#F8FAFC] border border-slate-200/60 p-4 flex items-center justify-center overflow-hidden">
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

                {/* Stock Indicator */}
                <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
                  <span>Remaining stock:</span>
                  <span className="font-bold text-[#0D52FF]">
                    {product.stockQuantity !== undefined ? `${product.stockQuantity} items in stock` : 'Available'}
                  </span>
                </div>
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
                    {(product.priceBIF * quantity).toLocaleString()} BIF
                  </div>
                  <div className="text-xs text-[#525866] font-medium">
                    Approx. ${(product.priceUSD * quantity).toFixed(2)} USD {quantity > 1 ? `(${quantity} items)` : ''}
                  </div>
                </div>

                {/* Color Chooser Option (Rounded Buttons with only BG of the colors) */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#181B25]">
                      <span>Select Color:</span>
                      <span className="text-[#0D52FF] font-bold">
                        {selectedColor ? selectedColor.name : 'Choose a color'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {product.colors.map((color, idx) => {
                        const isSelected = selectedColor?.hex === color.hex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            title={color.name}
                            style={{ backgroundColor: color.hex }}
                            className={`w-7 h-7 rounded-full transition-all duration-150 relative cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-[#0D52FF] ring-offset-2 scale-110 shadow-sm'
                                : 'border border-black/20 hover:scale-105 opacity-90 hover:opacity-100'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fff'
                                      ? 'bg-black'
                                      : 'bg-white'
                                  }`}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Chooser Option */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#181B25]">
                      <span>Select Size:</span>
                      <span className="text-[#0D52FF] font-bold">{selectedSize || 'Choose size'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {product.sizes.map((sz) => {
                        const isSelected = selectedSize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0D52FF] text-white border-[#0D52FF] shadow-xs'
                                : 'bg-[#F8FAFC] text-[#525866] border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Chooser with Stock Limit bubble */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#181B25]">
                    <span>Quantity:</span>
                    <span className="text-slate-400 text-[11px]">Max {maxStock} available</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-[#F8FAFC] p-1">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#525866] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-[#181B25]">
                        {quantity}
                      </span>

                      {/* Plus button with Stock Limit Tooltip / Bubble */}
                      <div
                        className="relative"
                        onMouseEnter={() => {
                          if (isAtStockLimit) setShowStockBubble(true);
                        }}
                        onMouseLeave={() => {
                          setShowStockBubble(false);
                        }}
                      >
                        <button
                          type="button"
                          onClick={handleIncrement}
                          disabled={isAtStockLimit}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isAtStockLimit
                              ? 'opacity-40 bg-transparent text-slate-400 cursor-not-allowed'
                              : 'text-[#525866] hover:bg-white cursor-pointer'
                          }`}
                          title={isAtStockLimit ? 'Cannot exceed numbers of items in stock' : 'Increase quantity'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Bubble Tooltip */}
                        {showStockBubble && isAtStockLimit && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-48 bg-[#0F172A] text-white text-[11px] font-medium py-1.5 px-2.5 rounded-lg shadow-xl text-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <span>Cannot exceed numbers of items in stock</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F172A]" />
                          </div>
                        )}
                      </div>
                    </div>
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
                          name: `${product.name}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` [${selectedColor.name}]` : ''}`,
                          image: product.image || '/assets/shop/african-suit.jpg',
                          priceUSD: product.priceUSD,
                          priceBIF: product.priceBIF,
                          quantity: quantity,
                          selectedSize: selectedSize || undefined,
                          selectedColor: selectedColor?.name || undefined,
                          shippingCostUSD: 0,
                          shippingCostBIF: 0,
                        };
                        const orderPayload = {
                          items: [singleItem],
                          deliveryMethod: 'home_delivery' as const,
                          deliveryCostUSD: 0,
                          deliveryCostBIF: 0,
                          subtotalUSD: product.priceUSD * quantity,
                          subtotalBIF: product.priceBIF * quantity,
                          discountUSD: 0,
                          discountBIF: 0,
                          totalUSD: product.priceUSD * quantity,
                          totalBIF: product.priceBIF * quantity,
                          customerNotes: `Direct modal checkout for ${product.name} (Qty: ${quantity}${selectedSize ? `, Size: ${selectedSize}` : ''}${selectedColor ? `, Color: ${selectedColor.name}` : ''})`,
                        };
                        const result = await createCheckoutOrder(orderPayload);
                        const url = result.success && result.orderId
                          ? generateClientWhatsAppGreetingUrl(result.orderId, undefined, result.order)
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
                      onAddToCart(product, selectedSize || undefined, selectedColor?.name || undefined, quantity);
                      onClose();
                    }}
                    className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] active:scale-[0.97] transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] text-white font-extrabold rounded-full py-3 px-5 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart ({quantity})</span>
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


