'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronRight,
  ShoppingCart,
  Tag,
  Truck,
  Store,
  Check,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';
import ElimiHeader from '@/components/ElimiHeader';
import Footer from '@/components/Footer';
import { useCurrency } from '@/components/SettingsProvider';
import {
  CartItem,
  getSavedCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  calculateCartDeliveryFee,
} from '@/lib/cart';
import { getEffectiveShippingCost, DEFAULT_BUREAU_ADDRESS } from '@/lib/products';
import { subscribeToNewsletter } from '@/lib/firestore-newsletter';
import {
  BoutiqueOrder,
  OrderItem,
  createCheckoutOrder,
  generateClientWhatsAppGreetingUrl,
} from '@/lib/firestore-orders';

const emptySubscribe = () => () => {};

export default function CartPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      return getSavedCart();
    }
    return [];
  });

  // Order placement success state
  const [placedOrder, setPlacedOrder] = useState<BoutiqueOrder | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Promo code system
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Delivery option state
  const [addDeliveryCost, setAddDeliveryCost] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Checkout submission state (triggers loading skeleton)
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CartItem[]>;
      if (customEvent.detail) {
        setCartItems(customEvent.detail);
      } else {
        setCartItems(getSavedCart());
      }
    };

    window.addEventListener('elimi-cart-updated', handleCartUpdate);
    return () => window.removeEventListener('elimi-cart-updated', handleCartUpdate);
  }, []);

  const handleUpdateQty = (productId: string, delta: number) => {
    const updated = updateCartItemQuantity(productId, delta);
    setCartItems(updated);
  };

  const handleRemove = (productId: string) => {
    const updated = removeCartItem(productId);
    setCartItems(updated);
  };

  const handleClear = () => {
    clearCart();
    setCartItems([]);
  };

  const { toBIF, formatBIF, formatUSD } = useCurrency();

  // Calculations
  const subtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.product.priceUSD * item.quantity,
    0
  );
  const subtotalBIF = toBIF(subtotalUSD);

  // Delivery fee calculation:
  // Each distinct product has its delivery fee. Multiple items of the same product (e.g. 2 or 3)
  // incur only ONE delivery fee. The cart displays the total delivery fee that has been summed.
  const deliveryFeeSummary = calculateCartDeliveryFee(cartItems);
  const effectiveShippingUSD = deliveryFeeSummary.costUSD;
  const effectiveShippingBIF = deliveryFeeSummary.costBIF;

  const deliveryCostUSD = addDeliveryCost ? effectiveShippingUSD : 0;
  const deliveryCostBIF = addDeliveryCost ? effectiveShippingBIF : 0;

  // Discount calculation
  const discountRate = appliedPromo ? appliedPromo.discountPercent / 100 : 0;
  const discountUSD = subtotalUSD * discountRate;
  const discountBIF = Math.round(subtotalBIF * discountRate);

  const finalTotalUSD = Math.max(0, subtotalUSD - discountUSD + deliveryCostUSD);
  const finalTotalBIF = Math.max(0, subtotalBIF - discountBIF + deliveryCostBIF);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Apply promo code handler
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a valid code');
      return;
    }

    if (code === 'ELIMI20' || code === 'SAVE20') {
      setAppliedPromo({ code, discountPercent: 20 });
      setPromoSuccess('20% discount applied successfully!');
    } else if (code === 'WELCOME10' || code === 'VIP10') {
      setAppliedPromo({ code, discountPercent: 10 });
      setPromoSuccess('10% VIP discount applied!');
    } else {
      setPromoError('Invalid promo code. Try "ELIMI20" or "VIP10"');
    }
  };

  // Secured Checkout Handler via Backend API
  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      const orderItems = cartItems.map((item) => {
        const ship = getEffectiveShippingCost(item.product);
        const itemObj: Record<string, unknown> = {
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image || '/assets/shop/african-suit.jpg',
          priceUSD: item.product.priceUSD,
          priceBIF: toBIF(item.product.priceUSD),
          quantity: item.quantity,
          shippingCostUSD: ship.costUSD,
          shippingCostBIF: ship.costBIF,
        };
        if (item.selectedSize) {
          itemObj.selectedSize = item.selectedSize;
        }
        return itemObj;
      });

      const orderPayload: Record<string, unknown> = {
        items: orderItems,
        deliveryMethod: addDeliveryCost ? 'home_delivery' : 'pickup',
        deliveryCostUSD: deliveryCostUSD,
        deliveryCostBIF: deliveryCostBIF,
        subtotalUSD: subtotalUSD,
        subtotalBIF: subtotalBIF,
        discountUSD: discountUSD,
        discountBIF: discountBIF,
        totalUSD: finalTotalUSD,
        totalBIF: finalTotalBIF,
        customerNotes: 'Order placed via Online Cart Checkout',
      };

      if (appliedPromo?.code) {
        orderPayload.discountCode = appliedPromo.code;
      }
      if (!addDeliveryCost) {
        orderPayload.pickupBureau = DEFAULT_BUREAU_ADDRESS;
      }

      // 1. Create and persist the order directly
      const result = await createCheckoutOrder(orderPayload as any);

      if (result.success && result.orderId) {
        // 2. Clear local cart
        clearCart();
        setCartItems([]);

        // 3. Set order state and open modal
        setPlacedOrder(result.order);
        setShowSuccessModal(true);

        // 4. Open WhatsApp cleanly in a new window/tab
        const whatsappUrl = generateClientWhatsAppGreetingUrl(result.orderId);
        if (typeof window !== 'undefined') {
          try {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          } catch {
            // Popup blocker might intercept; the modal provides a direct button fallback
          }
        }
      } else {
        throw new Error('Failed to process order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || newsletterLoading) return;
    setNewsletterLoading(true);
    setNewsletterError('');
    try {
      await subscribeToNewsletter(newsletterEmail, 'boutique_cart');
      setSubscribed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Subscription failed. Please try again.';
      setNewsletterError(msg);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#191919] font-sans antialiased selection:bg-[#0D52FF] selection:text-white">
      {/* Main Header */}
      <ElimiHeader cartCount={totalCartCount} showCart={true} />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-20">
        {/* Breadcrumbs: Home > Cart */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6 sm:mb-8">
          <Link
            href="/"
            className="hover:text-[#0D52FF] transition-colors font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link
            href="/shop"
            className="hover:text-[#0D52FF] transition-colors font-medium"
          >
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold">Cart</span>
        </nav>

        {/* Page Title: YOUR CART */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight uppercase">
            Your Cart
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-neutral-400 hover:text-rose-600 transition font-medium cursor-pointer"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* 2-Column Cart Grid matching reference style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Cart Items Container */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-7 shadow-xs">
              {!isClient || cartItems.length === 0 ? (
                /* Empty Cart State */
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0F4FF] border border-blue-200/80 text-[#0D52FF] flex items-center justify-center mx-auto shadow-2xs">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Your cart is currently empty
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                      Discover our curated Fashion, Tech & Cultural collections from Bujumbura.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition shadow-sm cursor-pointer"
                    >
                      <span>Explore Boutique</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Item Rows */
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => {
                    const { product, quantity, selectedSize, selectedColor } = item;
                    const itemTotalUSD = (product.priceUSD * quantity).toFixed(2);
                    const itemTotalBIF = (toBIF(product.priceUSD) * quantity).toLocaleString();

                    return (
                      <div
                        key={`${product.id}-${selectedSize || 'default'}`}
                        className="py-5 first:pt-0 last:pb-0 flex items-start sm:items-center gap-4 sm:gap-5 group"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F0F2F5] p-2 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Middle & Right Content */}
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Info */}
                          <div className="space-y-1">
                            <div className="flex items-start justify-between sm:hidden">
                              <Link
                                href={`/shop/${product.id}`}
                                className="font-bold text-sm sm:text-base text-neutral-900 hover:text-[#0D52FF] transition line-clamp-1"
                              >
                                {product.name}
                              </Link>
                              {/* Mobile Delete Button */}
                              <button
                                onClick={() => handleRemove(product.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 -mt-1 -mr-1 transition cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <Link
                              href={`/shop/${product.id}`}
                              className="hidden sm:block font-bold text-base text-neutral-900 hover:text-[#0D52FF] transition line-clamp-1"
                            >
                              {product.name}
                            </Link>

                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              <span>
                                Size:{' '}
                                <strong className="text-neutral-700 font-semibold">
                                  {selectedSize || 'Standard'}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Color:{' '}
                                <strong className="text-neutral-700 font-semibold">
                                  {selectedColor || 'Default'}
                                </strong>
                              </span>
                            </div>

                            {/* Product Delivery Fee */}
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium pt-0.5">
                              <Truck className="w-3 h-3 text-[#0D52FF] shrink-0" />
                              <span>
                                Delivery: ${getEffectiveShippingCost(product).costUSD.toFixed(2)} ({getEffectiveShippingCost(product).costBIF.toLocaleString()} BIF)
                                {quantity > 1 ? ` • 1 fee for all ${quantity} items` : ''}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="pt-1 flex items-baseline gap-2">
                              <span className="font-extrabold text-base sm:text-lg text-neutral-900">
                                ${itemTotalUSD}
                              </span>
                              <span className="text-xs text-neutral-500 font-medium">
                                ({itemTotalBIF} BIF)
                              </span>
                            </div>
                          </div>

                          {/* Right Controls: Stepper Pill & Desktop Delete */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0">
                            {/* Stepper Pill: - qty + */}
                            <div className="bg-[#F0F2F5] rounded-full px-3.5 py-1.5 flex items-center gap-3 text-xs sm:text-sm font-bold text-neutral-900 border border-slate-200/60">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(product.id, -1)}
                                className="text-neutral-600 hover:text-neutral-900 transition cursor-pointer p-0.5"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="min-w-[16px] text-center">{quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(product.id, 1)}
                                className="text-neutral-600 hover:text-neutral-900 transition cursor-pointer p-0.5"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Desktop Trash Button */}
                            <button
                              type="button"
                              onClick={() => handleRemove(product.id)}
                              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delivery Details Card */}
            {cartItems.length > 0 && (
              <div className="mt-5 p-5 bg-white rounded-[24px] border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        addDeliveryCost
                          ? 'bg-blue-50 text-[#0D52FF]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">
                          Bujumbura Delivery Option
                        </span>
                        <span className="text-[11px] font-bold text-[#0D52FF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {addDeliveryCost
                            ? `+$${effectiveShippingUSD.toFixed(2)} USD (${effectiveShippingBIF.toLocaleString()} BIF)`
                            : 'Free Bureau Pick-up'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {addDeliveryCost
                          ? 'Home delivery to your doorstep in Bujumbura'
                          : `Pick up personally at ${DEFAULT_BUREAU_ADDRESS}`}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={addDeliveryCost}
                    onClick={() => setAddDeliveryCost(!addDeliveryCost)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      addDeliveryCost ? 'bg-[#0D52FF]' : 'bg-slate-300'
                    }`}
                    aria-label="Toggle delivery option"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        addDeliveryCost ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary Card matching screenshot */}
          <div className="lg:col-span-5 xl:col-span-5 sticky top-24">
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Order Summary
              </h2>

              {/* Rows */}
              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">
                    ${subtotalUSD.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      ({subtotalBIF.toLocaleString()} BIF)
                    </span>
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex items-center justify-between text-rose-600 font-medium">
                    <span>Discount (-{appliedPromo.discountPercent}%)</span>
                    <span className="font-bold">
                      -${discountUSD.toFixed(2)}{' '}
                      <span className="text-xs font-normal">
                        (-{discountBIF.toLocaleString()} BIF)
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <span>Delivery Fee</span>
                    {!addDeliveryCost && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Bureau Pickup
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-neutral-900">
                    {addDeliveryCost ? (
                      <>
                        ${deliveryCostUSD.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-neutral-500">
                          ({deliveryCostBIF.toLocaleString()} BIF)
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-600 font-bold">Free ($0)</span>
                    )}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200/90 pt-3.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-neutral-900">Total</span>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-black text-[#0D52FF]">
                        ${finalTotalUSD.toFixed(2)}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-neutral-600 font-mono">
                        ({finalTotalBIF.toLocaleString()} BIF)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code Input matching screenshot */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F0F2F5] rounded-full px-4 py-2.5 flex items-center gap-2.5 border border-slate-200/60 focus-within:border-[#0D52FF] focus-within:bg-white transition">
                    <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Add promo code"
                      className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-rose-600 pl-4">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-xs text-emerald-600 pl-4 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{promoSuccess}</span>
                  </p>
                )}
              </form>

              {/* Checkout Button */}
              <div className="space-y-2.5 pt-1">
                {isCheckingOut ? (
                  <button
                    disabled
                    type="button"
                    className="w-full bg-[#0D52FF] text-white font-bold text-sm sm:text-base py-4 px-6 rounded-full flex items-center justify-center gap-3 cursor-wait opacity-90 shadow-sm"
                  >
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Processing...</span>
                  </button>
                ) : cartItems.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold text-sm sm:text-base py-4 px-6 rounded-full transition flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
                  >
                    <span>Go to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-200 text-slate-400 font-bold text-sm sm:text-base py-4 px-6 rounded-full cursor-not-allowed"
                  >
                    Go to Checkout
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-2 text-[11px] text-neutral-500 space-y-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0D52FF] shrink-0" />
                  <span>Secure checkout with Lumicash, Ecocash, or Cash on delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free in-person pick-up available at Rohero I, Bujumbura</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM NEWSLETTER BANNER matching screenshot */}
        <div className="mt-16 sm:mt-24 rounded-[28px] bg-linear-to-r from-[#043329] via-[#084D3E] to-[#0A5C4A] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase leading-tight">
                Stay connected about our latest offers
              </h3>
              <p className="text-sm text-emerald-100/80 mt-2 max-w-md">
                Get early access to exclusive fashion drops, VIP protocol discounts, and cultural artisan releases in Burundi.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-emerald-300 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Thank you for subscribing!</span>
                  </div>
                  <p className="text-xs text-white/80">
                    You&apos;ll receive our weekly VIP curated offers.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={newsletterLoading}
                    className="w-full bg-white text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm px-5 py-3.5 rounded-full focus:outline-hidden shadow-xs disabled:opacity-80"
                  />
                  {newsletterError && (
                    <p className="text-xs text-rose-300 font-medium px-2">{newsletterError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full transition shadow-xs cursor-pointer disabled:opacity-75"
                  >
                    {newsletterLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Order Success Modal */}
      {showSuccessModal && placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-extrabold border border-emerald-200/60 uppercase">
                Order Saved to Database
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Order Confirmed!
              </h3>
              <p className="text-xs text-neutral-600">
                Order ID: <span className="font-mono font-bold text-neutral-900">{placedOrder.id}</span>
              </p>
              <p className="text-xs text-neutral-500">
                Your order is safely recorded in our system. Click below to open WhatsApp and confirm your order details with our team.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Items:</span>
                <span className="font-bold text-neutral-900">{placedOrder.items.length} product(s)</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Total Amount:</span>
                <span className="text-[#0D52FF] font-bold">${placedOrder.totalUSD.toFixed(2)} USD ({placedOrder.totalBIF.toLocaleString()} BIF)</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Status:</span>
                <span className="text-amber-600 font-bold uppercase">{placedOrder.status}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={generateClientWhatsAppGreetingUrl(placedOrder.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full py-3.5 px-6 transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
              >
                <Image
                  src="/assets/icons/social/whatsapp-150x150.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 object-contain"
                />
                <span>Open WhatsApp to Confirm</span>
              </a>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-neutral-700 font-bold rounded-full py-3 px-6 transition text-xs cursor-pointer"
              >
                Close &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
