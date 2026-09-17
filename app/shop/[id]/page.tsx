'use client';

import React, { useState, useEffect, use, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Clock,
  Tag,
  Package,
  Calendar,
  Truck,
  Store,
  Check,
  Menu,
  X,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  ThumbsUp,
  SlidersHorizontal,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  getProductById,
  getRelatedProducts,
  Product,
  ProductReview,
  BOUTIQUE_PRODUCTS,
  getEffectiveShippingCost,
  DEFAULT_BUREAU_ADDRESS,
} from '@/lib/products';
import {
  useRealtimeProduct,
  useRealtimeProducts,
  useRealtimeProductReviews,
  addReviewToProductInFirestore,
} from '@/lib/firestore-products';
import {
  CartItem,
  getSavedCart,
  addToCart as addToCartHelper,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  subscribeCart,
  getCartSnapshot,
  getServerCartSnapshot,
} from '@/lib/cart';
import {
  createCheckoutOrder,
  generateClientWhatsAppGreetingUrl,
  BoutiqueOrder,
  OrderItem,
} from '@/lib/firestore-orders';
import ElimiHeader from '@/components/ElimiHeader';
import { useCurrency } from '@/components/SettingsProvider';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;
  
  // Real-time Product & Catalog from Firestore
  const { product: liveProduct, loading: isProductLoading, isLive } = useRealtimeProduct(productId);
  const { products: allRealtimeProducts } = useRealtimeProducts();
  
  const product: Product = liveProduct || getProductById(productId) || BOUTIQUE_PRODUCTS[0];
  
  // Related products calculated from real-time catalog
  const relatedProducts = (allRealtimeProducts && allRealtimeProducts.length > 0 ? allRealtimeProducts : BOUTIQUE_PRODUCTS)
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // Gallery Active Image
  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image, product.image, product.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Size Selector
  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');

  // Accordion Toggles
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(true);

  // Wishlist / Like State
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Order placement success state
  const [placedOrder, setPlacedOrder] = useState<BoutiqueOrder | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cart State via useSyncExternalStore
  const cartItems = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Countdown timer for next-day delivery (e.g. Order in 02:30:25)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 30, seconds: 25 });

  // Reviews Carousel & Real-time Reviews State
  const defaultFallbackReviews: ProductReview[] = [
    {
      id: 'r-default',
      author: 'Alex Mathio',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      date: '13 Oct 2024',
      rating: 5,
      comment:
        "NextGen's dedication to sustainability and ethical practices resonates strongly with today's consumers, positioning the brand as a responsible choice in the fashion world.",
      verified: true,
    },
  ];

  const initialProductReviews =
    product.reviews && product.reviews.length > 0 ? product.reviews : defaultFallbackReviews;

  const {
    reviews: liveReviews,
    reviewsCount: calculatedReviewsCount,
    rating: calculatedRating,
    ratingFormatted: calculatedRatingFormatted,
    ratingBars: dynamicRatingBars,
    saveReview,
  } = useRealtimeProductReviews(product.id, initialProductReviews);

  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSaving, setReviewSaving] = useState(false);

  // Real-time Firestore reviews are authoritative; fallback to initial reviews
  const customReviews = liveReviews.length > 0 ? liveReviews : initialProductReviews;

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Category filter / search in header
  const [headerSearch, setHeaderSearch] = useState('');

  const { toBIF, formatBIF, formatUSD } = useCurrency();
  const productPriceBIF = toBIF(product.priceUSD);

  // Direct checkout state (triggers loading skeleton)
  const [isDirectCheckingOut, setIsDirectCheckingOut] = useState(false);

  // Direct single-product checkout handler via Backend API
  const handleDirectProductCheckout = async () => {
    if (isDirectCheckingOut) return;
    setIsDirectCheckingOut(true);

    try {
      const ship = getEffectiveShippingCost(product);
      const singleItem: Record<string, unknown> = {
        productId: product.id,
        name: product.name,
        image: product.image || '/assets/shop/african-suit.jpg',
        priceUSD: product.priceUSD,
        priceBIF: productPriceBIF,
        quantity: selectedQuantity,
        shippingCostUSD: ship.costUSD,
        shippingCostBIF: ship.costBIF,
      };
      if (selectedSize) {
        singleItem.selectedSize = selectedSize;
      }

      const orderPayload: Record<string, unknown> = {
        items: [singleItem],
        deliveryMethod: addDeliveryCost ? 'home_delivery' : 'pickup',
        deliveryCostUSD: addDeliveryCost ? shippingCostUSD : 0,
        deliveryCostBIF: addDeliveryCost ? shippingCostBIF : 0,
        subtotalUSD: itemSubtotalUSD,
        subtotalBIF: itemSubtotalBIF,
        discountUSD: 0,
        discountBIF: 0,
        totalUSD: totalCostUSD,
        totalBIF: totalCostBIF,
        customerNotes: `Direct checkout for ${product.name}`,
      };

      if (!addDeliveryCost) {
        orderPayload.pickupBureau = DEFAULT_BUREAU_ADDRESS;
      }

      // 1. Create and store order in Firestore directly
      const result = await createCheckoutOrder(orderPayload as any);

      if (result.success && result.orderId) {
        // 2. Set order state and open modal
        setPlacedOrder(result.order);
        setShowSuccessModal(true);

        // 3. Open WhatsApp cleanly in a new window/tab
        const whatsappUrl = generateClientWhatsAppGreetingUrl(result.orderId);
        if (typeof window !== 'undefined') {
          try {
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          } catch {
            // Fallback provided by modal button
          }
        }
      } else {
        throw new Error('Failed to process order');
      }
    } catch (error) {
      console.error('Direct checkout order creation error:', error);
    } finally {
      setIsDirectCheckingOut(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTwoDigits = (num: number) => String(num).padStart(2, '0');

  // Quantity selector for this product detail page
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Delivery option toggle: add delivery cost or pick up at bureau
  const { costUSD: shippingCostUSD, costBIF: shippingCostBIF } = getEffectiveShippingCost(product);
  const [addDeliveryCost, setAddDeliveryCost] = useState(true);

  // Subtotal & Total calculations
  const itemSubtotalUSD = product.priceUSD * selectedQuantity;
  const itemSubtotalBIF = productPriceBIF * selectedQuantity;
  const deliveryCostUSD = addDeliveryCost ? shippingCostUSD : 0;
  const deliveryCostBIF = addDeliveryCost ? shippingCostBIF : 0;
  const totalCostUSD = Number((itemSubtotalUSD + deliveryCostUSD).toFixed(2));
  const totalCostBIF = itemSubtotalBIF + deliveryCostBIF;

  // Handle Add to Cart using central cart service
  const handleAddToCart = () => {
    addToCartHelper(product, selectedQuantity, selectedSize);

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1600);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    updateCartItemQuantity(id, delta);
  };

  const handleRemoveItem = (id: string) => {
    removeCartItem(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Handle Review submission with Firestore sync
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim() || reviewSaving) return;

    setReviewSaving(true);
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      date: 'Just now',
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      verified: true,
    };

    setActiveReviewIndex(0);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewModalOpen(false);

    // Save or update in Firestore
    try {
      await saveReview(newRev, product);
    } catch (err) {
      console.error('Error persisting review to Firestore:', err);
    } finally {
      setReviewSaving(false);
    }
  };

  const currentReview = customReviews[activeReviewIndex] || customReviews[0];

  const ratingBars = dynamicRatingBars;

  const whatsappMessage = addDeliveryCost
    ? `Hello ELIMI Boutique, I am interested in purchasing "${product.name}" (Qty: ${selectedQuantity}, Size: ${selectedSize}).\n• Delivery: Home Delivery (+${shippingCostUSD.toFixed(2)} USD / ${shippingCostBIF.toLocaleString()} BIF)\n• Total to pay: $${totalCostUSD.toFixed(2)} USD (${totalCostBIF.toLocaleString()} BIF).\nPlease confirm availability and delivery location!`
    : `Hello ELIMI Boutique, I am interested in purchasing "${product.name}" (Qty: ${selectedQuantity}, Size: ${selectedSize}).\n• Delivery: Personal Pick Up at Bureau (Free / 0 BIF)\n• Total to pay: $${itemSubtotalUSD.toFixed(2)} USD (${itemSubtotalBIF.toLocaleString()} BIF).\nPlease prepare my order for pick up at Rohero I Central Bureau!`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#191919] font-sans antialiased selection:bg-[#0D52FF] selection:text-white">
      {/* Home Page Navigation Header */}
      <ElimiHeader
        cartCount={totalCartCount}
        showCart={true}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Breadcrumb Navigation matching reference layout: Home > Shop > Category > Product */}
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
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-500 font-medium">{product.category}</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* 3. HERO PRODUCT SECTION (2-Column Grid matching Screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Large Rounded Photo Showcase with Top Story Bars & Bottom 3 Thumbnails */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4">
            <div className="relative w-full aspect-[4/4.7] sm:aspect-[4/4.8] bg-[#E8E6E1]/70 rounded-[28px] overflow-hidden flex flex-col justify-between p-4 sm:p-6 group border border-neutral-200/60 shadow-xs">
              {/* Story/Progress bars at top */}
              <div className="relative z-10 grid grid-cols-3 gap-2 w-full max-w-[90%] mx-auto pt-1">
                {galleryImages.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className="h-1 rounded-full cursor-pointer overflow-hidden bg-white/40 backdrop-blur-xs transition-all"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        activeImageIndex === idx ? 'bg-[#0D52FF] w-full' : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Main Active Product Photo */}
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
                <Image
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover sm:object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Navigation Arrows for Image Gallery on Hover */}
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev > 0 ? prev - 1 : galleryImages.length - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-[#0D52FF] hover:text-white text-neutral-800 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev < galleryImages.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-[#0D52FF] hover:text-white text-neutral-800 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Bottom Thumbnail Strip (3 rounded cards inside bottom of showcase) */}
              <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3 w-full mt-auto">
                {galleryImages.slice(0, 3).map((imgUrl, index) => {
                  const isActive = activeImageIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-white/90 p-1 border-2 transition-all cursor-pointer shadow-xs ${
                        isActive
                          ? 'border-[#0D52FF] ring-2 ring-[#0D52FF]/30 scale-[1.03]'
                          : 'border-white/80 hover:border-[#0D52FF]/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} angle ${index + 1}`}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover rounded-xl"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Metadata, Size, Add to Cart, Accordions */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 lg:pl-2">
            {/* Category Tag Pill: e.g. "Man Fashion" */}
            <div>
              <span className="inline-block bg-blue-50 text-[#0D52FF] text-[11px] font-bold px-3.5 py-1 rounded-full border border-blue-200/80">
                {product.badgeTag || product.category || 'Man Fashion'}
              </span>
            </div>

            {/* Product Title (Loose Fit Hoodie) */}
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-neutral-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Display */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                ${product.priceUSD.toFixed(2)}
              </span>
              {product.originalPriceUSD && (
                <span className="text-base text-neutral-400 line-through font-medium">
                  ${product.originalPriceUSD.toFixed(2)}
                </span>
              )}
              <span className="text-xs sm:text-sm text-neutral-500 font-medium">
                ({productPriceBIF.toLocaleString()} BIF)
              </span>
            </div>

            {/* Delivery Countdown Banner */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50/80 border border-blue-200/80 rounded-full text-xs text-slate-800 max-w-fit">
              <Clock className="w-3.5 h-3.5 text-[#0D52FF] shrink-0" />
              <span>
                Order in{' '}
                <span className="font-bold text-[#0D52FF] font-mono">
                  {formatTwoDigits(timeLeft.hours)}:{formatTwoDigits(timeLeft.minutes)}:
                  {formatTwoDigits(timeLeft.seconds)}
                </span>{' '}
                for same-day dispatch
              </span>
            </div>

            {/* Select Size & Quantity Selector Row matching screenshot style */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Choose Size
                </span>
                <span className="text-[11px] text-neutral-500">
                  Selected: <strong className="text-neutral-800">{selectedSize}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-10 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-[#F0F2F5] hover:bg-slate-200 text-neutral-700'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Controls */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
                Quantity
              </span>
              <div className="flex items-center gap-3">
                {/* Stepper Pill matching screenshot: - qty + */}
                <div className="bg-[#F0F2F5] rounded-full px-4 py-2.5 flex items-center gap-4 text-sm font-bold text-neutral-900 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                    className="text-neutral-600 hover:text-neutral-900 transition cursor-pointer p-0.5"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-[20px] text-center">{selectedQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((prev) => prev + 1)}
                    className="text-neutral-600 hover:text-neutral-900 transition cursor-pointer p-0.5"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Pill Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded-full text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart ({selectedQuantity})</span>
                    </>
                  )}
                </button>

                {/* Wishlist Heart */}
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-neutral-200 hover:bg-slate-50 text-neutral-700'
                  }`}
                  aria-label="Add to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* ORDER SUMMARY CARD matching reference screenshot */}
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  Order Summary
                </h2>
                <span className="text-xs text-neutral-500 font-medium">
                  {selectedQuantity} {selectedQuantity > 1 ? 'items' : 'item'}
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">
                    ${itemSubtotalUSD.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      ({itemSubtotalBIF.toLocaleString()} BIF)
                    </span>
                  </span>
                </div>

                {/* Delivery Option Toggle */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        addDeliveryCost
                          ? 'bg-blue-50 text-[#0D52FF]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900">
                          Delivery Option
                        </span>
                        <span className="text-[10px] font-bold text-[#0D52FF] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                          {addDeliveryCost
                            ? `+$${shippingCostUSD.toFixed(2)} USD`
                            : 'Free Bureau Pickup'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {addDeliveryCost
                          ? 'Home delivery to your door in Bujumbura'
                          : `Pick up at ${DEFAULT_BUREAU_ADDRESS}`}
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
                    aria-label="Toggle delivery cost"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        addDeliveryCost ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Total Row */}
                <div className="pt-3 border-t border-slate-200/90 flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-bold text-neutral-900">Total</span>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-[#0D52FF]">
                      ${totalCostUSD.toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-neutral-600 font-mono">
                      ({totalCostBIF.toLocaleString()} BIF)
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="space-y-2 pt-2">
                {isDirectCheckingOut ? (
                  <button
                    disabled
                    type="button"
                    className="w-full bg-[#0D52FF] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 cursor-wait opacity-90 shadow-xs"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDirectProductCheckout}
                    className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-full transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Go to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <Link
                  href="/shop/cart"
                  className="w-full bg-[#F0F2F5] hover:bg-slate-200 text-neutral-800 font-bold text-xs py-2.5 px-4 rounded-full transition flex items-center justify-center gap-2 text-center"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#0D52FF]" />
                  <span>View All Items in Cart</span>
                </Link>
              </div>

              <div className="pt-2 text-[10px] text-neutral-500 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Instant Mobile Money (Lumicash, Ecocash) & Cash on delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Central pickup point: Rohero I, Boulevard de l&apos;Uprona</span>
                </div>
              </div>
            </div>

            {/* Accordion 1: Description & Fit */}
            <div className="border-t border-neutral-200 pt-3">
              <button
                type="button"
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full flex items-center justify-between py-2 text-left text-sm font-semibold text-neutral-900 cursor-pointer"
              >
                <span>Description &amp; Fit</span>
                {isDescOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              {isDescOpen && (
                <div className="pt-1 pb-3 text-xs text-neutral-600 leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  {product.descriptionFit && (
                    <p className="text-neutral-500">{product.descriptionFit}</p>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: Shipping (2x2 Grid matching screenshot) */}
            <div className="border-t border-neutral-200 pt-3">
              <button
                type="button"
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                className="w-full flex items-center justify-between py-2 text-left text-sm font-semibold text-neutral-900 cursor-pointer"
              >
                <span>Shipping</span>
                {isShippingOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>
              {isShippingOpen && (
                <div className="pt-2 pb-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Item 1: Discount */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 font-medium">Discount</div>
                        <div className="font-semibold text-neutral-800">
                          {product.shipping?.discount || 'Disc 50%'}
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Package */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 font-medium">Package</div>
                        <div className="font-semibold text-neutral-800">
                          {product.shipping?.packageType || 'Regular Package'}
                        </div>
                      </div>
                    </div>

                    {/* Item 3: Delivery Time */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 font-medium">Delivery Time</div>
                        <div className="font-semibold text-neutral-800">
                          {product.shipping?.deliveryTime || '3-4 Working Days'}
                        </div>
                      </div>
                    </div>

                    {/* Item 4: Estimation Arrive */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0D52FF] flex items-center justify-center shrink-0">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 font-medium">Estimation Arrive</div>
                        <div className="font-semibold text-neutral-800">
                          {product.shipping?.estimatedArrival || '10 - 12 October 2024'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Pickup Breakdown */}
                  <div className="mt-3.5 pt-3 border-t border-neutral-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <Truck className="w-3.5 h-3.5 text-[#0D52FF]" />
                        <span>Home Delivery (Bujumbura):</span>
                      </div>
                      <span className="font-bold text-[#0D52FF]">
                        ${shippingCostUSD.toFixed(2)} USD ({shippingCostBIF.toLocaleString()} BIF)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bureau Pick Up:</span>
                      </div>
                      <span className="font-bold text-emerald-600">Free ($0 / 0 BIF)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. RATING & REVIEWS SECTION (Matching Screenshot) */}
        <section className="mt-16 sm:mt-20 pt-10 border-t border-neutral-200/80">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Rating &amp; Reviews
            </h2>
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="text-xs font-semibold text-[#0D52FF] hover:text-[#0B44D8] underline underline-offset-4 cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Score Block: 4,5 /5 + (50 New Reviews) + Star Distribution Bars */}
            <div className="md:col-span-5 lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <div>
                <div className="text-5xl sm:text-6xl font-black text-[#0D52FF] tracking-tight">
                  {calculatedRatingFormatted}<span className="text-xl sm:text-2xl font-medium text-neutral-400">/5</span>
                </div>
                <div className="text-xs text-neutral-500 font-medium mt-1">
                  ({calculatedReviewsCount} New Reviews)
                </div>
              </div>

              {/* Progress Lines */}
              <div className="flex-1 w-full max-w-[200px] space-y-2 text-xs">
                {ratingBars.map((bar) => (
                  <div key={bar.stars} className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-neutral-600 flex items-center gap-0.5 w-6">
                      ★ {bar.stars}
                    </span>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0D52FF] rounded-full"
                        style={{ width: bar.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Review Card Showcase with Author + Quote + Carousel Controls */}
            <div className="md:col-span-7 lg:col-span-7">
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/70 relative">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      {currentReview.author}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= currentReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-medium">
                    {currentReview.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-4">
                  &ldquo;{currentReview.comment}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative bg-neutral-200">
                      <Image
                        src={currentReview.avatar}
                        alt={currentReview.author}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-600">
                      Verified Buyer
                    </span>
                  </div>

                  {/* Carousel slider indicators & right arrow button */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {customReviews.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveReviewIndex(idx)}
                          className={`h-1 rounded-full transition-all cursor-pointer ${
                            activeReviewIndex === idx
                              ? 'w-5 bg-[#0D52FF]'
                              : 'w-2 bg-neutral-300'
                          }`}
                          aria-label={`Go to review ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveReviewIndex((prev) =>
                          prev < customReviews.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="w-7 h-7 rounded-full bg-white hover:bg-[#0D52FF] hover:text-white border border-neutral-300 hover:border-[#0D52FF] flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
                      aria-label="Next review"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. "YOU MIGHT ALSO LIKE" SECTION (Matching Screenshot) */}
        <section className="mt-20 pt-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-900 tracking-tight mb-8">
            You might also like
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/shop/${item.id}`}
                className="group flex flex-col justify-between space-y-3 cursor-pointer"
              >
                {/* Product Thumbnail Container */}
                <div className="relative aspect-square w-full rounded-[22px] bg-[#E8E6E1]/60 overflow-hidden border border-neutral-200/70 p-3 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#0D52FF] transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Math.floor(item.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-200 fill-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-neutral-500 font-medium">
                      {item.rating.toFixed(1)}/5
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-[#0D52FF]">
                      ${item.priceUSD.toFixed(0)}
                    </span>
                    {item.originalPriceUSD && (
                      <span className="text-xs text-neutral-400 line-through">
                        ${item.originalPriceUSD.toFixed(0)}
                      </span>
                    )}
                    {item.discountPercentage && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                        -{item.discountPercentage}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-neutral-900">Write a Review</h3>
              <p className="text-xs text-neutral-500">
                Share your thoughts on {product.name} with future buyers.
              </p>

              <form onSubmit={handleAddReview} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newReviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Marie Claire"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#0D52FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="How was the fit, material, and delivery?"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-[#0D52FF] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={reviewSaving}
                    className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-semibold py-2.5 rounded-full text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-75"
                  >
                    {reviewSaving ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
