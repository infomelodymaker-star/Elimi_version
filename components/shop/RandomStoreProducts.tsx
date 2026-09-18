'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  Sparkles,
  ExternalLink,
  X,
  MessageCircle
} from 'lucide-react';
import { Product, BOUTIQUE_PRODUCTS } from './ProductGrid';
import { useRealtimeProducts } from '@/lib/firestore-products';
import { createCheckoutOrder, generateClientWhatsAppGreetingUrl } from '@/lib/firestore-orders';
import { getEffectiveShippingCost } from '@/lib/products';
import { useSettings } from '@/components/SettingsProvider';

interface RandomStoreProductsProps {
  count?: number;
  title?: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
  showTrustBanner?: boolean;
  showRefreshButton?: boolean;
  showShuffleButton?: boolean;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

// Helper to pick unique random products on every page visit/reload
function getRandomSlice(items: Product[], count: number): Product[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

export default function RandomStoreProducts({
  count = 3,
  title = 'Products from Our Store',
  subtitle = 'Verified authentic merchandise, apparel & electronics available for instant delivery.',
  theme = 'light',
  showTrustBanner = true,
  showRefreshButton = true,
  onSelectProduct,
  onAddToCart,
  className = '',
}: RandomStoreProductsProps) {
  const router = useRouter();
  const { products: realtimeProducts } = useRealtimeProducts();
  const { whatsappNumber } = useSettings();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => BOUTIQUE_PRODUCTS.slice(0, count));
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [showOrderToast, setShowOrderToast] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
      const source = realtimeProducts && realtimeProducts.length > 0 ? realtimeProducts : BOUTIQUE_PRODUCTS;
      setProducts([...source].sort(() => Math.random() - 0.5).slice(0, count));
    });
  }, [count, realtimeProducts]);

  const handleRefresh = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsShuffling(true);
    setTimeout(() => {
      const source = realtimeProducts && realtimeProducts.length > 0 ? realtimeProducts : BOUTIQUE_PRODUCTS;
      setProducts([...source].sort(() => Math.random() - 0.5).slice(0, count));
      setIsShuffling(false);
    }, 250);
  };


  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setShowOrderToast(`Added ${product.name} to Cart!`);
    setTimeout(() => setShowOrderToast(null), 3000);
  };

  const isDark = theme === 'dark';

  const handleDirectWhatsAppCheckoutModal = async (product: Product) => {
    const ship = getEffectiveShippingCost(product);
    const orderPayload = {
      items: [{
        productId: product.id,
        name: product.name,
        image: product.image || '/assets/shop/african-suit.jpg',
        priceUSD: product.priceUSD,
        priceBIF: product.priceBIF,
        quantity: 1,
        shippingCostUSD: ship.costUSD,
        shippingCostBIF: ship.costBIF,
      }],
      deliveryMethod: 'home_delivery',
      deliveryCostUSD: ship.costUSD,
      deliveryCostBIF: ship.costBIF,
      subtotalUSD: product.priceUSD,
      subtotalBIF: product.priceBIF,
      discountUSD: 0,
      discountBIF: 0,
      totalUSD: product.priceUSD + ship.costUSD,
      totalBIF: product.priceBIF + ship.costBIF,
      customerNotes: 'Order placed via Direct WhatsApp checkout from quick view modal',
    };

    const result = await createCheckoutOrder(orderPayload as any);
    if (result.success && result.orderId) {
      const url = generateClientWhatsAppGreetingUrl(result.orderId, whatsappNumber);
      window.open(url, '_blank');
      setSelectedProductForModal(null);
    } else {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello ELIMI Concierge, I would like to order: ${product.name} (${product.priceBIF.toLocaleString()} BIF)`
      )}`, '_blank');
      setSelectedProductForModal(null);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className={`w-full rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-7 border transition-all ${
        isDark
          ? 'bg-[#181818] border-white/10 text-white font-[\'Roboto\',sans-serif]'
          : 'bg-gradient-to-br from-[#EBF2FF] via-[#F2F6FF] to-[#EEF4FE] border-[#0D52FF]/15 text-[#181B25]'
      } ${className}`}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showOrderToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#0D52FF] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold font-['Roboto',sans-serif]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{showOrderToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/5 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isDark
                  ? 'bg-[#0D52FF]/20 text-[#3EA6FF] border border-[#0D52FF]/40'
                  : 'bg-[#0D52FF]/10 text-[#0D52FF]'
              }`}
            >
              ELIMI Boutique Store
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              In Stock & Ready
            </span>
          </div>

          <h3
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-[#181B25]'
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
              isDark ? 'text-[#AAAAAA]' : 'text-[#525866]'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Action Controls: Shuffle & Visit Store */}
        <div className="flex items-center gap-2 shrink-0">
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={isShuffling}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                isDark
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                  : 'bg-white hover:bg-slate-50 text-[#181B25] border border-slate-200/80'
              }`}
              title="Shuffle to see different fresh products"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin text-[#0D52FF]' : ''}`} />
              <span>{isShuffling ? 'Loading...' : 'Fresh Items'}</span>
            </button>
          )}

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Visit Full Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Product Cards Container: Single horizontally scrollable row on mobile & tablet, standard grid on desktop (lg+) */}
      <div
        className={`flex overflow-x-auto no-scrollbar pb-3 pt-4 sm:pt-5 gap-3 sm:gap-4 snap-x snap-mandatory lg:grid lg:overflow-visible lg:pb-0 ${
          count >= 4 ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-3'
        } lg:gap-4`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => {
              router.push(`/shop/${product.id}`);
            }}
            className={`shrink-0 w-[210px] sm:w-[240px] lg:w-auto snap-start rounded-[18px] sm:rounded-[22px] p-3 sm:p-4 border transition-all flex flex-col justify-between space-y-2.5 sm:space-y-3.5 h-full group/card cursor-pointer relative ${
              isDark
                ? 'bg-[#212121] border-white/10 hover:border-[#3EA6FF]/50 shadow-md hover:shadow-xl'
                : 'bg-white border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-slate-200'
            }`}
          >
            {/* Category / Badge pill */}
            <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] font-bold">
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-full truncate max-w-[90px] sm:max-w-none ${
                  isDark
                    ? 'bg-white/10 text-[#AAAAAA]'
                    : 'bg-slate-100 text-[#525866]'
                }`}
              >
                {product.category}
              </span>
              <span className="text-amber-500 flex items-center gap-0.5 sm:gap-1 shrink-0">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500" />
                <span>{product.rating}</span>
              </span>
            </div>

            {/* Product Image Box */}
            <div
              className={`w-full h-[135px] sm:h-[150px] lg:h-[160px] relative flex items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 ${
                isDark ? 'bg-[#181818]' : 'bg-[#F8FAFC]'
              }`}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-contain p-1.5 sm:p-2 group-hover/card:scale-105 transition-transform duration-300"
              />

              {/* Hover Quick Action Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  className="bg-[#0D52FF] hover:bg-[#0B44D8] text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5 transform translate-y-1 group-hover/card:translate-y-0 transition-transform"
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span className="hidden sm:inline">Add to Bag</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Product Title */}
            <div className="space-y-0.5">
              <h4
                className={`font-medium sm:font-bold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[30px] sm:min-h-[38px] ${
                  isDark ? 'text-[#F1F1F1] group-hover/card:text-[#3EA6FF]' : 'text-[#181B25] group-hover/card:text-[#0D52FF]'
                } transition-colors`}
              >
                {product.name}
              </h4>
              <p
                className={`text-[10px] sm:text-[11px] line-clamp-1 ${
                  isDark ? 'text-[#AAAAAA]' : 'text-[#717784]'
                }`}
              >
                {product.seller}
              </p>
            </div>

            {/* Price & Action Row */}
            <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-black/5 dark:border-white/10 gap-1.5 sm:gap-2 mt-auto">
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-bold text-xs sm:text-sm lg:text-base tracking-tight truncate ${
                    isDark ? 'text-[#3EA6FF]' : 'text-[#0D52FF]'
                  }`}
                >
                  {product.priceBIF.toLocaleString()} BIF
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#AAAAAA] truncate">
                  ~ ${product.priceUSD.toFixed(0)} USD
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <a
                  href={`https://wa.me/25769000000?text=${encodeURIComponent(
                    `Hello ELIMI Shop, I would like to order: ${product.name} (${product.priceBIF.toLocaleString()} BIF)`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all shrink-0 shadow-xs"
                  title="Direct WhatsApp Order"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>

                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    isDark
                      ? 'bg-white/10 hover:bg-[#0D52FF] text-white'
                      : 'border border-[#0D52FF]/20 hover:border-[#0D52FF] bg-[#0D52FF]/5 hover:bg-[#0D52FF] text-[#0D52FF] hover:text-white'
                  }`}
                  title="Add to Shopping Cart"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      {showTrustBanner && (
        <div
          className={`rounded-2xl px-4 py-3.5 shadow-sm border mt-6 ${
            isDark
              ? 'bg-[#212121] border-white/10'
              : 'bg-white border-slate-200/60'
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
            {/* Item 1 */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#0D52FF]" />
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#181B25]'}`}>
                  Authentic Guaranteed
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#AAAAAA] truncate">
                  Direct Verified Sellers
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-[#0D52FF]" />
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#181B25]'}`}>
                  Fast Express Delivery
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#AAAAAA] truncate">
                  Bujumbura & Nationwide
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-[#0D52FF]" />
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#181B25]'}`}>
                  Pay on Delivery
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#AAAAAA] truncate">
                  Lumicash & EcoCash
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-[#0D52FF]" />
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#181B25]'}`}>
                  Easy Exchanges
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#AAAAAA] truncate">
                  7-Day Support
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Product Modal if clicked without onSelectProduct override */}
      <AnimatePresence>
        {selectedProductForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-['Roboto',sans-serif]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181818] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-white"
            >
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#AAAAAA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#212121] relative overflow-hidden shrink-0 p-2">
                  <Image
                    src={selectedProductForModal.image}
                    alt={selectedProductForModal.name}
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#3EA6FF] bg-[#0D52FF]/20 px-2 py-0.5 rounded-full">
                    {selectedProductForModal.category}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                    {selectedProductForModal.name}
                  </h3>
                  <p className="text-xs text-[#AAAAAA]">
                    Seller: {selectedProductForModal.seller}
                  </p>
                  <div className="text-sm font-extrabold text-[#3EA6FF] pt-1">
                    {selectedProductForModal.priceBIF.toLocaleString()} BIF (~ ${selectedProductForModal.priceUSD.toFixed(2)} USD)
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#212121] p-3.5 rounded-2xl border border-white/5">
                {selectedProductForModal.description}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDirectWhatsAppCheckoutModal(selectedProductForModal)}
                  className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Order</span>
                </button>

                <Link
                  href="/shop"
                  className="flex-1 bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold py-3 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>View in Store</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
