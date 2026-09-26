'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ElimiHeader from '@/components/ElimiHeader';
import RentalLightbox from '@/components/allocations/RentalLightbox';
import { useSettings } from '@/components/SettingsProvider';
import {
  useRealtimeRentalItem,
  useRealtimeRentalItems,
  RentalItem,
} from '@/lib/firestore-rentals';
import {
  createCheckoutOrder,
  generateClientWhatsAppGreetingUrl,
} from '@/lib/firestore-orders';
import {
  Heart,
  ChevronRight,
  Menu,
  User,
  X,
  ShoppingCart,
  Check,
  Facebook,
  Instagram,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Fallback curated mock items for "Vous aimerez aussi" matching image.png exactly
const SIMILAR_ITEMS_MOCK = [
  {
    id: 'jean-pompon',
    name: 'Jean Pompon',
    brand: 'Grace & Mila',
    badge: 'LE LOOK',
    price: '45,00€',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'chemise-bonita',
    name: 'Chemise Bonita',
    brand: "Peace n' love",
    badge: null,
    price: '39,00€',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'chemise-onlria',
    name: 'Chemise Onlria',
    brand: 'Only',
    badge: null,
    price: '35,00€',
    imageUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'chemise-chelsy',
    name: 'Chemise Chelsy',
    brand: 'La Petite Etoile',
    badge: null,
    price: '42,00€',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'chemise-marylin',
    name: 'Chemise Marylin',
    brand: 'So Sweet',
    badge: null,
    price: '49,00€',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=600',
  },
];

// Customer reviews matching image.png exactly
const REVIEWS_DATA = [
  {
    rating: 5,
    date: '06/06/2026',
    text: '“Taille impeccable. L\'imprimé est joli et attire l\'oeil.”',
  },
  {
    rating: 5,
    date: '02/06/2026',
    text: '“Magnifique”',
  },
  {
    rating: 5,
    date: '30/05/2026',
    text: '“J\'adore ! Tres belle chemise”',
  },
];

export default function AllocationItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = (params?.id as string) || '';

  const { item: liveItem, loading: loadingItems } = useRealtimeRentalItem(itemId);
  const { items } = useRealtimeRentalItems();
  const { whatsappNumber } = useSettings();

  // Find requested item with fallback if needed
  const item: RentalItem | undefined = useMemo(() => {
    if (liveItem) return liveItem;
    return items.find((i) => i.id === itemId) || (items.length > 0 ? items[0] : undefined);
  }, [liveItem, items, itemId]);

  // Gallery Photos (2x2 grid matching image.png)
  const photos = useMemo(() => {
    if (!item) return [];
    const list: string[] = [];
    if (item.imageUrl) list.push(item.imageUrl);
    if (item.gallery && Array.isArray(item.gallery)) {
      item.gallery.forEach((url) => {
        if (url && !list.includes(url)) list.push(url);
      });
    }

    // Default fallback angles for high-fashion multi-photo showcase
    const defaults = [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=900',
    ];

    defaults.forEach((def) => {
      if (list.length < 4 && !list.includes(def)) {
        list.push(def);
      }
    });

    return list.slice(0, 4);
  }, [item]);

  // Customer photos ("Photos des Closys")
  const customerPhotos = useMemo(() => {
    if (item?.clientPhotos && item.clientPhotos.length > 0) {
      return item.clientPhotos.slice(0, 2);
    }
    return [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    ];
  }, [item]);

  // UI States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isExpandedDetails, setIsExpandedDetails] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // WhatsApp Checkout States
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Available sizes
  const sizesList = useMemo(() => {
    if (item?.sizes && item.sizes.length > 0) {
      return item.sizes;
    }
    return ['S/M', 'M/L', 'L/XL'];
  }, [item]);

  // Open Lightbox
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  /**
   * WHATSAPP CHECKOUT HANDLER
   * Reuses the backend API (/api/orders/create) as in /shop_checkout
   * Generates orderID, saves to Firestore `orders` collection,
   * and opens WhatsApp with ONLY a greeting message containing that OrderId.
   */
  const handleWhatsAppCheckout = async () => {
    if (!item) return;
    if (!selectedSize) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const priceUSD = item.pricePerDay || 69;
      const priceBIF = priceUSD * 3000;

      const orderPayload = {
        items: [
          {
            productId: item.id,
            name: item.name,
            image: item.imageUrl || photos[0] || '',
            priceUSD: priceUSD,
            priceBIF: priceBIF,
            quantity: 1,
            selectedSize: selectedSize,
            shippingCostUSD: 0,
            shippingCostBIF: 0,
          },
        ],
        deliveryMethod: 'home_delivery',
        deliveryCostUSD: 0,
        deliveryCostBIF: 0,
        subtotalUSD: priceUSD,
        subtotalBIF: priceBIF,
        discountUSD: 0,
        discountBIF: 0,
        totalUSD: priceUSD,
        totalBIF: priceBIF,
        customerNotes: `Réservation Closet: ${item.name} (Taille: ${selectedSize})`,
      };

      // 1. Create and store order in Firestore directly
      const result = await createCheckoutOrder(orderPayload as any);

      if (result.success && result.orderId) {
        // 2. Set placed order and open success modal
        setPlacedOrder(result.order);
        setShowSuccessModal(true);

        // 3. Open WhatsApp in new tab
        const waUrl = generateClientWhatsAppGreetingUrl(result.orderId, whatsappNumber);
        if (typeof window !== 'undefined') {
          try {
            window.open(waUrl, '_blank', 'noopener,noreferrer');
          } catch {
            // Modal button fallback provided
          }
        }
      } else {
        throw new Error('Erreur lors de la création de la commande');
      }
    } catch (err: unknown) {
      console.error('WhatsApp checkout error:', err);
      setCheckoutError(err instanceof Error ? err.message : 'Échec de la commande');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Loading State
  if (loadingItems && !item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#0D52FF] rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-neutral-500 font-serif">Chargement...</p>
      </div>
    );
  }

  // Fallback Item if database is empty
  const currentItem = item || {
    id: 'item-dianne',
    name: 'Chemise Dianne',
    brand: 'Musy Muse',
    pricePerDay: 69,
    originalPrice: 69,
    reviewsCount: 72,
    rating: 5,
    sizes: ['S/M', 'M/L', 'L/XL'],
    description:
      'Portez cette chemise avec un jean taille haute et des bottines pour un look cosy et tendance cet...',
    details:
      'Composition : 100% Coton biologique. Coupe décontractée avec broderies contrastées en fil de coton rouge. Nettoyage à sec écoresponsable certifié.',
    imageUrl: photos[0],
    gallery: photos,
    available: true,
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-[#0D52FF] selection:text-white">
      {/* =========================================================================
          TOP NAVIGATION HEADER (Main Platform Header)
         ========================================================================= */}
      <ElimiHeader />

      {/* Side Slide-out Menu (when hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                <span className="text-2xl font-serif font-bold tracking-tight lowercase">closet</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-neutral-800 hover:text-[#0D52FF]"
                >
                  Accueil ELIMI
                </Link>
                <Link
                  href="/allocations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-[#0D52FF]"
                >
                  Locations &amp; Allocations Closet
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-neutral-800 hover:text-[#0D52FF]"
                >
                  Boutique / Vente
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-neutral-800 hover:text-[#0D52FF]"
                >
                  Tableau de bord admin
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-neutral-100 text-xs text-neutral-400">
              © 2026 LE CLOSET • Mode circulaire &amp; location
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN PRODUCT SECTION (2-COLUMN LAYOUT MATCHING image.png)
         ========================================================================= */}
      <main className="w-full max-w-[1440px] mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 items-start">
          {/* =====================================================================
              LEFT COLUMN: 2x2 MULTI-PHOTO GALLERY GRID
              (Side-by-side tall portrait photos matching image.png & video)
             ===================================================================== */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {photos.map((photoUrl, index) => (
                <div
                  key={index}
                  onClick={() => handleOpenLightbox(index)}
                  className="relative aspect-[3/4] sm:aspect-[4/5] bg-neutral-100 overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={photoUrl}
                    alt={`${currentItem.name} angle ${index + 1}`}
                    fill
                    priority={index < 2}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 1024px) 50vw, 35vw"
                  />
                  {/* Subtle hover overlay hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: MINIMALIST & REFINED RENTAL EXPERIENCE
              Focused on streamlined size selection, direct WhatsApp ordering & verified concierge info
             ===================================================================== */}
          <div className="lg:col-span-5 px-5 sm:px-8 py-6 lg:py-2 lg:sticky lg:top-24 space-y-6">
            {/* Top Bar: Brand, Category, Rating & Wishlist */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {currentItem.categoryName || 'Location'}
                </span>
                {currentItem.badge && (
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#0D52FF] border border-blue-100">
                    {currentItem.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex text-[#0D52FF] text-xs tracking-tight">
                    {'★★★★★'}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    ({currentItem.reviewsCount || 72})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-700 hover:text-black transition-all active:scale-95 cursor-pointer"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite
                        ? 'fill-[#0D52FF] text-[#0D52FF]'
                        : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            </div>

            {/* Product Title & Rental Pricing */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
                {currentItem.name}
              </h1>
              <p className="text-xs text-neutral-500 font-medium">
                Marque / Créateur : <span className="text-neutral-800 font-semibold">{currentItem.brand || 'Musy Muse'}</span>
              </p>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {currentItem.pricePerDay || 69},00 $
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  / jour de location
                </span>
                {currentItem.originalPrice && (
                  <span className="text-xs text-neutral-400 line-through">
                    Valeur boutique: {currentItem.originalPrice},00 $
                  </span>
                )}
              </div>
            </div>

            {/* Streamlined Size Selection */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Taille disponible
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-[#0D52FF] hover:underline font-medium cursor-pointer"
                >
                  Guide des tailles
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sizesList.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[54px] px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#0D52FF] bg-[#0D52FF] text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {!selectedSize && (
                <p className="text-[11px] text-[#0D52FF] font-medium pt-0.5">
                  Sélectionnez votre taille pour valider directement avec notre conseiller WhatsApp.
                </p>
              )}
            </div>

            {/* Direct WhatsApp Concierge Checkout Action */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={!selectedSize || isCheckingOut}
                onClick={handleWhatsAppCheckout}
                className={`w-full py-3.5 px-5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm ${
                  !selectedSize
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                    : 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-500/15 active:scale-[0.99]'
                }`}
              >
                <div className="relative w-5 h-5 shrink-0">
                  <Image
                    src="/assets/icons/whatsapp_icon.svg"
                    alt="WhatsApp"
                    fill
                    className="object-contain"
                  />
                </div>

                {isCheckingOut ? (
                  <span>Préparation de la réservation...</span>
                ) : (
                  <span>Réserver via WhatsApp</span>
                )}
              </button>

              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {checkoutError}
                </div>
              )}

              {/* Verified Service Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[#0D52FF] font-bold">✓</span>
                  <span>Pressing éco inclus</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[#0D52FF] font-bold">✓</span>
                  <span>Conseiller dédié 7j/7</span>
                </div>
              </div>
            </div>

            {/* Description & Composition (Managed in Firestore Database) */}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Description &amp; Détails
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {currentItem.description ||
                  'Pièce exclusive disponible pour location événementielle et shooting.'}
              </p>

              {isExpandedDetails && currentItem.details && (
                <p className="text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100 mt-2">
                  {currentItem.details}
                </p>
              )}

              {currentItem.details && (
                <button
                  type="button"
                  onClick={() => setIsExpandedDetails(!isExpandedDetails)}
                  className="text-xs text-[#0D52FF] hover:underline font-semibold cursor-pointer block pt-1"
                >
                  {isExpandedDetails ? 'Voir moins' : 'En savoir plus'}
                </button>
              )}
            </div>

            {/* Closy Client Photos (if available in Firestore) */}
            {customerPhotos.length > 0 && (
              <div className="pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                  Photos portées
                </h3>

                <div className="flex items-center gap-3">
                  {customerPhotos.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenLightbox(idx)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 cursor-pointer group hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={url}
                        alt={`Photo portée ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION: "Vous aimerez aussi" (Matching image.png exactly)
           ========================================================================= */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-neutral-200">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-center text-neutral-950 mb-8">
            Vous aimerez aussi
          </h2>

          {/* Horizontal row of similar fashion items */}
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4">
              {SIMILAR_ITEMS_MOCK.map((simItem) => (
                <div key={simItem.id} className="group relative flex flex-col">
                  {/* Portrait Card Image */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-100">
                    <Image
                      src={simItem.imageUrl}
                      alt={simItem.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />

                    {/* Optional LE LOOK badge with Blue accent */}
                    {simItem.badge && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#0D52FF] text-white text-[10px] font-bold rounded">
                        {simItem.badge}
                      </span>
                    )}

                    {/* Heart button */}
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-neutral-600 shadow-xs cursor-pointer transition-transform hover:scale-110"
                      aria-label="Favori"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info below image */}
                  <div className="mt-2.5 text-center">
                    <h3 className="text-xs font-bold text-neutral-900 group-hover:text-[#0D52FF] transition-colors">
                      {simItem.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {simItem.brand}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right arrow scroll hint */}
            <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 items-center justify-center text-neutral-600 pointer-events-none">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION: "Notes & Avis" (Matching image.png exactly)
           ========================================================================= */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-neutral-200 text-center">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-950">
            Notes &amp; Avis
          </h2>
          <p className="text-xs text-neutral-500 mt-1 mb-8">
            72 avis
          </p>

          {/* 3 Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left max-w-5xl mx-auto">
            {REVIEWS_DATA.map((rev, i) => (
              <div
                key={i}
                className="bg-neutral-50/80 rounded-xl p-5 border border-neutral-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#0D52FF] text-sm tracking-tighter">
                      {'★'.repeat(rev.rating)}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {rev.date}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 italic leading-relaxed">
                    {rev.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Voir tout Button */}
          <div className="mt-8">
            <button
              type="button"
              className="px-8 py-2.5 rounded-full border border-neutral-400 hover:border-[#0D52FF] hover:bg-[#0D52FF] hover:text-white text-xs font-semibold text-neutral-800 transition-all cursor-pointer"
            >
              Voir tout
            </button>
          </div>
        </section>
      </main>

      {/* =========================================================================
          SITE FOOTER (Matching image.png exactly)
         ========================================================================= */}
      <footer className="mt-20 border-t border-neutral-200 bg-white pt-14 pb-10 text-xs text-neutral-600">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 pb-12">
            {/* Column 1: Logo */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-3xl font-serif font-black lowercase tracking-tight text-neutral-950 block mb-4">
                closet
              </span>
            </div>

            {/* Column 2: Aide */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-sm mb-3">Aide</h4>
              <p><a href="#" className="hover:underline">Centre d&apos;aide</a></p>
              <p><a href="#" className="hover:underline">Contactez-nous</a></p>
              <p><a href="#" className="hover:underline">Préférences cookies</a></p>

              <div className="pt-4">
                <h4 className="font-bold text-neutral-900 text-sm mb-3">Services</h4>
                <p><a href="/allocations" className="hover:underline">Catalogue</a></p>
                <p><a href="#" className="hover:underline">Cartes cadeaux</a></p>
                <p><a href="#" className="hover:underline">Comment ça marche</a></p>
              </div>
            </div>

            {/* Column 3: À propos */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-sm mb-3">À propos</h4>
              <p><a href="#" className="hover:underline">Nos marques</a></p>
              <p><a href="#" className="hover:underline">Les avis</a></p>
              <p><a href="#" className="hover:underline">Notre vision</a></p>
              <p><a href="#" className="hover:underline">Mode responsable</a></p>
              <p><a href="#" className="hover:underline">Presse</a></p>
              <p><a href="#" className="hover:underline">Morphologies</a></p>
              <p><a href="#" className="hover:underline">Location de vêtements de grossesse</a></p>
              <p><a href="#" className="hover:underline">Devenir ambassadrice</a></p>
            </div>

            {/* Column 4: Nous suivre */}
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm mb-3">Nous suivre</h4>
              <div className="flex items-center gap-4 text-neutral-800">
                <a href="#" className="hover:text-black" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-black font-serif font-bold text-sm" aria-label="Pinterest">
                  P
                </a>
                <a href="#" className="hover:text-black" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-4 flex items-center gap-2 text-neutral-900 font-semibold">
                <Smartphone className="w-4 h-4" />
                <span>App disponible iOS / Android</span>
              </div>
            </div>
          </div>

          {/* Language selector & Legal */}
          <div className="pt-8 border-t border-neutral-100 flex flex-col items-center gap-4 text-center">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <span>Langue du site :</span>
              <span className="font-medium text-neutral-800">🇫🇷 Français ⌄</span>
            </div>

            <div className="text-[11px] text-[#0D52FF] flex items-center gap-3">
              <a href="#" className="hover:underline">Conditions générales</a>
              <span>|</span>
              <a href="#" className="hover:underline">Mentions légales</a>
            </div>

            <div className="text-[11px] text-neutral-400">
              © 2026 LE CLOSET
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          LIGHTBOX MODAL (Matching Video 00:20 - 00:43)
         ========================================================================= */}
      <RentalLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={currentItem.name}
        modelInfo="Emma , 170cm, taille S/M"
      />

      {/* =========================================================================
          SIZE GUIDE MODAL
         ========================================================================= */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-neutral-900 mb-1">
              Guide des tailles
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Mesures standard pour les chemises et tops de créateurs.
            </p>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400">
                  <th className="py-2">Taille</th>
                  <th className="py-2">Tour de poitrine</th>
                  <th className="py-2">Tour de taille</th>
                  <th className="py-2">Bassin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                <tr>
                  <td className="py-2.5 font-bold text-neutral-900">S/M</td>
                  <td>84 - 90 cm</td>
                  <td>66 - 72 cm</td>
                  <td>90 - 96 cm</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-neutral-900">M/L</td>
                  <td>90 - 96 cm</td>
                  <td>72 - 78 cm</td>
                  <td>96 - 102 cm</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-neutral-900">L/XL</td>
                  <td>96 - 104 cm</td>
                  <td>78 - 86 cm</td>
                  <td>102 - 110 cm</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-5 p-3 rounded-lg bg-neutral-50 text-[11px] text-neutral-600">
              💡 <strong>Conseil coupe :</strong> La Chemise Dianne présente une coupe légèrement fluide. Prenez votre taille habituelle pour un porté décontracté.
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {showSuccessModal && placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-extrabold border border-emerald-200/60 uppercase">
                Réservation enregistrée dans Firestore
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Commande Confirmée!
              </h3>
              <p className="text-xs text-neutral-600">
                ID Commande: <span className="font-mono font-bold text-neutral-900">{placedOrder.id}</span>
              </p>
              <p className="text-xs text-neutral-500">
                Votre réservation est enregistrée dans notre système. Cliquez ci-dessous pour ouvrir WhatsApp et confirmer avec l&apos;équipe ELIMI.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Total:</span>
                <span className="text-[#0D52FF] font-bold">${placedOrder.totalUSD?.toFixed(2) || '0.00'} USD ({placedOrder.totalBIF?.toLocaleString() || '0'} BIF)</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-medium">
                <span>Statut:</span>
                <span className="text-amber-600 font-bold uppercase">{placedOrder.status}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={generateClientWhatsAppGreetingUrl(placedOrder.id, whatsappNumber)}
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
                <span>Ouvrir WhatsApp pour confirmer</span>
              </a>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-neutral-700 font-bold rounded-full py-3 px-6 transition text-xs cursor-pointer"
              >
                Fermer &amp; Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
