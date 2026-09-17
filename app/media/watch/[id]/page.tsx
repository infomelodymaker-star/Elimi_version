'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ElimiHeader from '@/components/ElimiHeader';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ThumbsUp,
  Share2,
  Bookmark,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Play,
  ArrowRight,
  X,
  ExternalLink,
  Flame,
  Radio,
  Eye,
  SlidersHorizontal,
  Clock,
  MoreVertical,
  Layers,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  BadgeCheck,
  MessageCircle
} from 'lucide-react';
import { FeaturedProduct, MediaVideo, MARKET_PRODUCTS } from '../../data';
import RandomStoreProducts from '@/components/shop/RandomStoreProducts';

// Promotional services and publications for the sticky sidebar banner
const PROMO_PUBLICATIONS = [
  {
    id: 'promo-protocol',
    badge: 'VIP Protocol & Mobility',
    badgeColor: 'bg-[#0D52FF]',
    category: 'Executive Service',
    title: 'VIP Protocol, Airport Escorts & Luxury Fleet',
    description: 'Bulletproof SUVs, armored security convoys & certified executive chauffeur services across Bujumbura and Burundi.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Book VIP Protocol',
    ctaLink: '/protocol',
    isExternal: false,
    highlight: '24/7 Security Escorts'
  },
  {
    id: 'promo-shop',
    badge: 'ELIMI Boutique & Store',
    badgeColor: 'bg-emerald-600',
    category: 'Curated Products',
    title: 'Authentic Fashion, Electronics & Signature Merch',
    description: 'Shop bespoke African attires, Samsung/Apple smartphones, luxury watches & verified local Burundian creations.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Boutique',
    ctaLink: '/shop',
    isExternal: false,
    highlight: 'Fast Nationwide Delivery'
  },
  {
    id: 'promo-printbe',
    badge: 'PrintBe Custom Solutions',
    badgeColor: 'bg-amber-600',
    category: 'Corporate Branding',
    title: 'Custom Corporate Apparel, Gifts & Large-Format Prints',
    description: 'High-precision embroidery, branded uniforms, event rollups, executive gifts & digital mockups with same-day turnaround.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Get Custom Quote',
    ctaLink: '/printbe',
    isExternal: false,
    highlight: 'Instant Digital Proofs'
  },
  {
    id: 'promo-real-estate',
    badge: 'Prime Real Estate & Living',
    badgeColor: 'bg-indigo-600',
    category: 'Residences & Land',
    title: 'Furnished VIP Villas, Apartments & Titled Land Plots',
    description: 'Verified luxury residential listings, diplomatic villas in Kiriri & verified titled land plots with comprehensive legal audit.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'View Residences',
    ctaLink: '/houses',
    isExternal: false,
    highlight: 'Full Legal Audit Included'
  },
  {
    id: 'promo-media',
    badge: 'ELIMI Media Production',
    badgeColor: 'bg-red-600',
    category: 'Commercial Broadcasts',
    title: 'Commercial Broadcasts & Ad Placement on ELIMI Media',
    description: 'Sponsor our high-reach YouTube shows, produce 4K documentaries, or feature your brand across our multimedia broadcasts.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Partner With Media',
    ctaLink: 'https://wa.me/25761403663?text=Hello%20ELIMI%20Media,%20I%20would%20like%20to%20inquire%20about%20advertising%20and%20media%20production%20partnerships.',
    isExternal: true,
    highlight: '14.9K+ YouTube Audience'
  }
];

export default function VideoWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const videoId = resolvedParams.id;

  const [currentVideo, setCurrentVideo] = useState<MediaVideo | null>(null);
  const [allVideos, setAllVideos] = useState<MediaVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Promotional Banner automatic slideshow state
  const [promoSlideIndex, setPromoSlideIndex] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);

  useEffect(() => {
    if (isPromoPaused) return;
    const timer = setInterval(() => {
      setPromoSlideIndex((prev) => (prev + 1) % PROMO_PUBLICATIONS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPromoPaused]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPromoSlideIndex((prev) => (prev - 1 + PROMO_PUBLICATIONS.length) % PROMO_PUBLICATIONS.length);
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPromoSlideIndex((prev) => (prev + 1) % PROMO_PUBLICATIONS.length);
  };

  // User interactions
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(320);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);
  const [cartCount, setCartCount] = useState(1);

  // Fetch all videos from /api/youtube
  useEffect(() => {
    async function loadVideos() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/youtube');
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos)) {
          const mapped: MediaVideo[] = data.videos.map((vid: any, idx: number) => {
            let featured: FeaturedProduct[] = [];
            const text = (vid.title + ' ' + vid.description).toLowerCase();
            if (text.includes('suit') || text.includes('sebarundi') || text.includes('arvella') || text.includes('queen')) {
              featured = [MARKET_PRODUCTS.p_suit, MARKET_PRODUCTS.p_shades].filter(Boolean);
            } else if (text.includes('police') || text.includes('muvuto') || text.includes('skit')) {
              featured = [MARKET_PRODUCTS.p_jacket, MARKET_PRODUCTS.p_shoes].filter(Boolean);
            } else if (text.includes('drone') || text.includes('camera') || text.includes('reco')) {
              featured = [MARKET_PRODUCTS.p_drone, MARKET_PRODUCTS.p_stand].filter(Boolean);
            } else if (text.includes('mama') || text.includes('gitega') || text.includes('urwaruka')) {
              featured = [MARKET_PRODUCTS.p_basket, MARKET_PRODUCTS.p_shades].filter(Boolean);
            } else {
              const keys = Object.keys(MARKET_PRODUCTS);
              const k1 = keys[idx % keys.length];
              const k2 = keys[(idx + 1) % keys.length];
              featured = [MARKET_PRODUCTS[k1], MARKET_PRODUCTS[k2]].filter(Boolean);
            }

            return {
              id: vid.id,
              youtubeId: vid.youtubeId,
              title: vid.title,
              description: vid.description,
              category: vid.category as any,
              duration: vid.duration || '14:20',
              views: vid.views,
              uploadedAt: vid.uploadedAt,
              thumbnail: vid.thumbnail,
              channelName: vid.channelName || 'Elimi Media',
              isVerified: true,
              likes: vid.likes || 150,
              featuredProducts: featured,
              tags: vid.tags || [vid.category, 'ElimiMedia']
            };
          });

          setAllVideos(mapped);

          // Find current video by ID or youtubeId
          const cleanId = videoId.replace('yt_', '');
          const found = mapped.find(v => v.youtubeId === cleanId || v.id === videoId || v.id === `yt_${cleanId}`);
          if (found) {
            setCurrentVideo(found);
            setLikeCount(found.likes);
          } else if (mapped.length > 0) {
            // Fallback to custom created object for requested videoId
            setCurrentVideo({
              id: `yt_${cleanId}`,
              youtubeId: cleanId,
              title: 'ELIMI Media Official Broadcast',
              description: 'Official high-definition broadcast streamed directly from ELIMI Media.',
              category: 'VIP Lifestyle',
              duration: '14:20',
              views: '1.5K views',
              uploadedAt: 'Recently',
              thumbnail: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
              channelName: 'Elimi Media',
              isVerified: true,
              likes: 240,
              featuredProducts: [MARKET_PRODUCTS.p_suit, MARKET_PRODUCTS.p_shades],
              tags: ['ElimiMedia', 'Burundi', 'VIP']
            });
          }
        }
      } catch (err) {
        console.error('Failed to load video on watch page:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadVideos();
  }, [videoId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      showToast('Added to your Liked Videos');
    }
  };

  const handleAddToCart = (product: FeaturedProduct) => {
    setCartCount(prev => prev + 1);
    showToast(`Added "${product.name}" to your Market Bag!`);
  };

  // Recommended "You May Also Watch This" videos (latest & random mix, excluding active one)
  const recommendedVideos = useMemo(() => {
    if (!currentVideo || allVideos.length === 0) return allVideos.slice(0, 6);
    const filtered = allVideos.filter(v => v.youtubeId !== currentVideo.youtubeId);
    return filtered.slice(0, 6);
  }, [currentVideo, allVideos]);

  // Shoppable store products for the right sidebar
  const storeProducts = useMemo(() => {
    const productsList = Object.values(MARKET_PRODUCTS);
    if (!currentVideo) return productsList;
    const featuredIds = new Set((currentVideo.featuredProducts || []).map(p => p.id));
    const directFeatured = currentVideo.featuredProducts || [];
    const otherStoreItems = productsList.filter(p => !featuredIds.has(p.id));
    return [...directFeatured, ...otherStoreItems];
  }, [currentVideo]);

  const activeYtId = currentVideo?.youtubeId || videoId.replace('yt_', '');

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#0F172A] font-sans antialiased flex flex-col selection:bg-[#0B57FF] selection:text-white">
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-[#0F172A]/20"
          >
            <CheckCircle2 className="w-5 h-5 text-[#0B57FF]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal Top Navigation / Back Button */}
      <div className="px-4 sm:px-6 pt-4 pb-1 flex items-center justify-between max-w-[1720px] w-full mx-auto">
        <Link
          href="/media"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0F172A] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border border-[#0F172A]/10 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0B57FF]" />
          <span>Back to Media Hub</span>
        </Link>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#0B57FF] hover:bg-[#0948D9] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Store</span>
        </Link>
      </div>

      {/* ====================================================================
          2. MAIN WATCH LAYOUT: 2-COLUMN YOUTUBE THEME (LEFT: VIDEO, RIGHT: STORE)
         ==================================================================== */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================
              LEFT COLUMN (8 COLS): VIDEO PLAYER, METADATA, & "YOU MAY ALSO WATCH THIS"
             ================================================================ */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 2.1 Video Player Iframe Screen */}
            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-xl border border-[#0F172A]/10">
              {activeYtId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeYtId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  title={currentVideo?.title || 'ELIMI Video Player'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0 z-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                  <span>Loading broadcast stream...</span>
                </div>
              )}
            </div>

            {/* 2.2 Video Title */}
            <div className="space-y-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#0F172A] leading-snug tracking-[-0.02em]">
                {currentVideo?.title || 'Loading video title...'}
              </h1>

              {/* 2.3 Channel Bar & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#0F172A]/10">
                
                {/* Channel Profile & Subscribe */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.youtube.com/@elimimedia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border border-[#0B57FF]/20 shadow-xs bg-white"
                    title="View ELIMI Media on YouTube"
                  >
                    <Image
                      src="/assets/icons/ELIMI_MEDIA.svg"
                      alt={currentVideo?.channelName || 'Elimi Media'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </a>
                  <div>
                    <a
                      href="https://www.youtube.com/@elimimedia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 group cursor-pointer"
                    >
                      <span className="font-semibold text-sm sm:text-base text-[#0F172A] group-hover:text-[#0B57FF] transition">
                        {currentVideo?.channelName || 'Elimi Media'}
                      </span>
                      <svg className="w-3.5 h-3.5 text-[#64748B] fill-current shrink-0" viewBox="0 0 24 24" aria-label="Verified">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.2L6.7 12.7l1.4-1.4 2.1 2.1 5.7-5.7 1.4 1.4-7.1 7.1z" />
                      </svg>
                    </a>
                    <span className="text-[11px] sm:text-xs text-[#64748B]">14.9K subscribers • Official Channel</span>
                  </div>

                  {/* Direct YouTube Subscribe Link Button */}
                  <a
                    href="https://www.youtube.com/@elimimedia?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setIsSubscribed(true);
                      showToast('Redirecting to YouTube Subscribe...');
                    }}
                    className={`ml-2 sm:ml-4 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                      isSubscribed
                        ? 'bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20'
                        : 'bg-[#0B57FF] hover:bg-[#0948D9] text-white shadow-xs'
                    }`}
                    title="Subscribe to @elimimedia on YouTube"
                  >
                    <Play className="w-3 h-3 fill-current stroke-none ml-0.5" />
                    <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                  </a>
                </div>

                {/* Like, Share, Save Actions */}
                <div className="flex items-center gap-2">
                  {/* Like button */}
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition border cursor-pointer ${
                      isLiked
                        ? 'bg-[#0B57FF] text-white border-[#0B57FF]'
                        : 'bg-white hover:bg-slate-50 text-[#0F172A] border-[#0F172A]/10 shadow-xs'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{likeCount}</span>
                  </button>

                  {/* Share button */}
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard?.writeText(window.location.href);
                        showToast('Video link copied to clipboard!');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-[#0F172A] border border-[#0F172A]/10 shadow-xs transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  {/* Save button */}
                  <button
                    onClick={() => {
                      setIsSaved(!isSaved);
                      showToast(isSaved ? 'Removed from Watch Later' : 'Saved to Watch Later');
                    }}
                    className={`p-2 sm:px-4 sm:py-2 rounded-full text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-[#0B57FF] text-white border-[#0B57FF]'
                        : 'bg-white hover:bg-slate-50 text-[#0F172A] border-[#0F172A]/10 shadow-xs'
                    }`}
                    title="Save to Watch Later"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2.4 Description Box */}
            <div
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="bg-white hover:bg-slate-50/80 p-4 sm:p-5 rounded-2xl cursor-pointer transition text-xs sm:text-sm text-[#64748B] space-y-2 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center gap-3 font-semibold text-[#0F172A] text-xs">
                <span>{currentVideo?.views || '1.2K views'}</span>
                <span>•</span>
                <span>Uploaded {currentVideo?.uploadedAt || 'Recently'}</span>
                <span>•</span>
                <span className="text-[#0B57FF]">#{currentVideo?.category || 'VIP Lifestyle'}</span>
              </div>

              <p className={`leading-relaxed ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                {currentVideo?.description || 'Watch high definition broadcast from ELIMI Media.'}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-[#0F172A]">
                  {isDescExpanded ? 'Show less' : '...more'}
                </span>
                <span className="text-[11px] text-[#0B57FF] font-semibold">
                  Official ELIMI Production
                </span>
              </div>
            </div>

            {/* ================================================================
                2.5 PRODUCTS FROM OUR STORE
               ================================================================ */}
            <div className="pt-2">
              <RandomStoreProducts
                count={3}
                theme="light"
                title="Products from our store"
                subtitle="Curated boutique fashion, electronics & accessories from ELIMI Shop"
                showTrustBanner={false}
                showRefreshButton={true}
              />
            </div>

            {/* ================================================================
                2.6 "YOU MAY ALSO WATCH THIS" (LATEST & OTHER CHANNEL VIDEOS)
               ================================================================ */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0B57FF]" />
                  <h3 className="text-lg sm:text-xl font-medium tracking-[-0.02em] text-[#0F172A]">
                    You may also watch this
                  </h3>
                </div>
                <a
                  href="https://www.youtube.com/@elimimedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#64748B] hover:text-[#0B57FF] transition"
                >
                  Latest from @elimimedia
                </a>
              </div>

              {/* Responsive Horizontal Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/media/watch/${video.youtubeId}`}
                    className="group cursor-pointer flex flex-col bg-white p-3 rounded-2xl border border-[#0F172A]/8 hover:border-[#0B57FF]/40 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-md transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Duration */}
                      <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-10 bg-black/85 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {video.duration}
                      </div>
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0B57FF] text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white stroke-none ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Card Meta with Profile Picture */}
                    <div className="flex items-start gap-2.5 pt-2.5 px-0.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 bg-[#E0EBFF] border border-[#0B57FF]/20 relative mt-0.5 shadow-xs">
                        <Image
                          src="/assets/icons/ELIMI_MEDIA.svg"
                          alt={video.channelName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#0F172A] font-semibold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#0B57FF] transition min-h-[28px] sm:min-h-[34px]">
                          {video.title}
                        </h4>
                        <div className="text-[#64748B] text-[10px] sm:text-[11px] font-normal flex items-center gap-1 mt-0.5 truncate">
                          <span className="truncate">{video.channelName}</span>
                          <svg className="w-3 h-3 text-[#64748B] fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.2L6.7 12.7l1.4-1.4 2.1 2.1 5.7-5.7 1.4 1.4-7.1 7.1z" />
                          </svg>
                        </div>
                        <div className="text-[#64748B] text-[9px] sm:text-[10px] md:text-[11px] flex items-center gap-1 mt-0.5">
                          <span>▷ {video.views}</span>
                          <span>•</span>
                          <span>{video.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* ================================================================
              RIGHT COLUMN (4 COLS): STICKY PROMOTIONAL BANNER (SERVICES & PUBLICATIONS)
             ================================================================ */}
          <div
            onMouseEnter={() => setIsPromoPaused(true)}
            onMouseLeave={() => setIsPromoPaused(false)}
            className="lg:col-span-4 lg:sticky lg:top-4 self-start space-y-4"
          >
            {/* Promotional Banner Card */}
            <div className="bg-white border border-[#0F172A]/8 rounded-2xl overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] relative group">
              {/* Animated Slides Container */}
              <div className="relative w-full h-[560px] sm:h-[640px] flex flex-col justify-end">
                <AnimatePresence mode="wait">
                  {(() => {
                    const slide = PROMO_PUBLICATIONS[promoSlideIndex];
                    return (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="absolute inset-0 w-full h-full flex flex-col justify-end p-5 sm:p-6 group/img"
                      >
                        {/* Slide Image */}
                        <Image
                          src={slide.image}
                          alt="Promotion Banner"
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
                        />

                        {/* Gradient Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                        {/* Floating Slide Controls Overlay */}
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                          <button
                            onClick={handlePrevSlide}
                            className="w-6 h-6 rounded-full hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                            aria-label="Previous promotion"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-bold text-white px-1">
                            {promoSlideIndex + 1}/{PROMO_PUBLICATIONS.length}
                          </span>
                          <button
                            onClick={handleNextSlide}
                            className="w-6 h-6 rounded-full hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                            aria-label="Next promotion"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* CTA Buttons */}
                        <div className="relative z-20 flex flex-col gap-2.5 w-full">
                          {slide.isExternal ? (
                            <a
                              href={slide.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer group/cta"
                            >
                              <span>{slide.ctaText}</span>
                              <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-0.5 transition-transform" />
                            </a>
                          ) : (
                            <Link
                              href={slide.ctaLink}
                              className="w-full bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer group/cta"
                            >
                              <span>{slide.ctaText}</span>
                              <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                            </Link>
                          )}

                          <a
                            href={`https://wa.me/25764444546?text=${encodeURIComponent(`Hello ELIMI team, I am interested in ${slide.badge} services.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat on WhatsApp</span>
                          </a>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick WhatsApp Assistance Card */}
            <div className="bg-white border border-[#0F172A]/8 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F172A] truncate">Need Direct Assistance?</div>
                  <div className="text-[11px] text-[#64748B] truncate">Chat with ELIMI Concierge</div>
                </div>
              </div>
              <a
                href="https://wa.me/25761403663?text=Hello%20ELIMI%20team,%20I%20am%20watching%20your%20broadcast%20and%20would%20like%20to%20inquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-1.5 rounded-full shadow-xs transition shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Chat</span>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* ====================================================================
          3. QUICK PRODUCT MODAL (Instant Purchase / Spec Sheet)
         ==================================================================== */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-[#0F172A]/10 space-y-4 text-[#0F172A]"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-[#0F172A]/8">
                <Image
                  src={selectedProduct.image || selectedProduct.fallbackImage}
                  alt={selectedProduct.name}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = selectedProduct.fallbackImage || '/assets/shop/african-suit.jpg';
                  }}
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-2.5 py-1 rounded-full">
                  ELIMI Official Store Item
                </span>
                <h3 className="font-medium text-xl text-[#0F172A]">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-[#64748B]">{selectedProduct.spec}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#0F172A]/10">
                <div>
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Price</span>
                  <span className="text-xl font-semibold text-[#0B57FF]">
                    {selectedProduct.price} {selectedProduct.currency}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
