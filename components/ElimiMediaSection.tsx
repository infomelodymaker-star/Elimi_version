'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EMIL_SPRINGS } from '@/lib/motion-constants';
import {
  Play,
  Pause,
  Subtitles,
  Settings,
  Maximize,
  Minimize,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  X,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon
} from 'lucide-react';
import { useRealtimeProducts } from '@/lib/firestore-products';
import { BOUTIQUE_PRODUCTS, Product } from '@/components/shop/ProductGrid';

interface ProductItem {
  id: string;
  title: string;
  spec: string;
  price: string;
  currency: string;
  image: string;
  fallbackImage: string;
  badge?: string;
  rating?: number;
}

interface YouTubeVideoData {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  uploadedAt: string;
  thumbnail: string;
  channelName: string;
  channelAvatar?: string;
  likes: number;
  comments?: number;
}

const OFFICIAL_CHANNEL_AVATAR = 'https://yt3.googleusercontent.com/s9aYVXGdig6zHjfjsnxDlri33pDDoXDDs-9sh0TPclXs8z2PgeRZ1ukKCaCYiL6zlFBErQ6yi7w=s900-c-k-c0x00ffffff-no-rj';

const DEFAULT_FEATURED_VIDEO: YouTubeVideoData = {
  id: 'yt_emWdX1YxWdY',
  youtubeId: 'emWdX1YxWdY',
  title: "KIGINGI AVUYE MUGACERERE AVUGA IVYABAYE MUGITERAMO CIWE",
  description: "ELIMI MEDIA is a professional media channel delivering impactful content in Entrepreneurship, Entertainment, and Social Culture.",
  duration: '08:45',
  views: '178 views',
  uploadedAt: 'Recently',
  thumbnail: 'https://i.ytimg.com/vi/emWdX1YxWdY/hqdefault.jpg',
  channelName: 'ELIMI Média',
  channelAvatar: OFFICIAL_CHANNEL_AVATAR,
  likes: 5,
  comments: 2
};

const INITIAL_FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    title: 'African Print Suit',
    spec: 'Modern Fit • Size M - XXL',
    price: '85,000',
    currency: 'BIF',
    image: '/assets/shop/african-suit.webp',
    fallbackImage: '/assets/shop/african-suit.jpg',
    badge: 'Best Seller',
    rating: 4.9
  },
  {
    id: 'p2',
    title: 'Mercedes V-Class Rental',
    spec: 'Luxury Van • With Driver',
    price: '$100',
    currency: '/ day',
    image: '/assets/shop/mercedes-vclass.webp',
    fallbackImage: '/assets/shop/mercedes-vclass.jpg',
    badge: 'VIP Mobility',
    rating: 5.0
  },
  {
    id: 'p3',
    title: 'Italian Leather Shoes',
    spec: 'Premium Quality • All Sizes',
    price: '65,000',
    currency: 'BIF',
    image: '/assets/shop/leather-shoes.webp',
    fallbackImage: '/assets/shop/leather-shoes.jpg',
    badge: 'Authentic',
    rating: 4.8
  },
  {
    id: 'p4',
    title: 'DJI Mini 3 Pro Drone',
    spec: '4K Camera • 34 min Flight',
    price: '950,000',
    currency: 'BIF',
    image: '/assets/shop/dji-drone.webp',
    fallbackImage: '/assets/shop/dji-drone.jpg',
    badge: 'Media Gear',
    rating: 4.9
  },
  {
    id: 'p5',
    title: 'Tissot Gentleman Watch',
    spec: 'Automatic • Water Resistant',
    price: '750,000',
    currency: 'BIF',
    image: '/assets/shop/tissot-watch.webp',
    fallbackImage: '/assets/shop/tissot-watch.jpg',
    badge: 'Swiss Made',
    rating: 5.0
  }
];

function getLatest20Products(items: Product[]): Product[] {
  if (!items || items.length === 0) return [];
  return [...items]
    .sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 20);
}

function convertToProductItem(product: Product): ProductItem {
  return {
    id: product.id,
    title: product.name,
    spec: product.description || (product.category ? `${product.category} • Verified Quality` : 'Premium Quality • In Stock'),
    price: product.priceBIF ? product.priceBIF.toLocaleString() : (product.priceUSD ? `${product.priceUSD}` : '0'),
    currency: product.priceBIF ? 'BIF' : (product.priceUSD ? '$' : ''),
    image: product.image,
    fallbackImage: product.image || '/assets/shop/african-suit.jpg',
    badge: product.badge || product.badgeTag || (product.rating && product.rating >= 4.8 ? 'Top Rated' : undefined),
    rating: product.rating || 4.9
  };
}

function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 193;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 193;
}

export default function ElimiMediaSection() {
  const shouldReduceMotion = useReducedMotion();
  // Realtime products from Firestore database
  const { products: allFirestoreProducts } = useRealtimeProducts();
  const [products, setProducts] = useState<ProductItem[]>(() => INITIAL_FALLBACK_PRODUCTS);

  // Live YouTube Featured Video
  const [featuredVideo, setFeaturedVideo] = useState<YouTubeVideoData>(DEFAULT_FEATURED_VIDEO);

  // Video Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(45);
  const duration = parseDurationToSeconds(featuredVideo.duration);
  const [isMuted, setIsMuted] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interactive metadata states
  const [likesCount, setLikesCount] = useState<number>(DEFAULT_FEATURED_VIDEO.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(DEFAULT_FEATURED_VIDEO.comments || 32);

  // Cart & Modal states
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Carousel ref & scroll controls
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch real YouTube videos from Elimi Media channel
  useEffect(() => {
    async function fetchLiveVideo() {
      try {
        const res = await fetch('/api/youtube');
        if (!res.ok) return;
        const data = await res.json();
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          const top = data.videos[0];
          const parsedVideo: YouTubeVideoData = {
            id: top.id || `yt_${top.youtubeId}`,
            youtubeId: top.youtubeId || DEFAULT_FEATURED_VIDEO.youtubeId,
            title: top.title || DEFAULT_FEATURED_VIDEO.title,
            description: top.description || DEFAULT_FEATURED_VIDEO.description,
            duration: top.duration || DEFAULT_FEATURED_VIDEO.duration,
            views: top.views || DEFAULT_FEATURED_VIDEO.views,
            uploadedAt: top.uploadedAt || DEFAULT_FEATURED_VIDEO.uploadedAt,
            thumbnail: top.thumbnail || `https://i.ytimg.com/vi/${top.youtubeId}/hqdefault.jpg`,
            channelName: top.channelName || 'ELIMI Média',
            channelAvatar: top.channelAvatar || OFFICIAL_CHANNEL_AVATAR,
            likes: typeof top.likes === 'number' ? top.likes : DEFAULT_FEATURED_VIDEO.likes,
            comments: typeof top.comments === 'number' ? top.comments : DEFAULT_FEATURED_VIDEO.comments
          };
          setFeaturedVideo(parsedVideo);
          setLikesCount(parsedVideo.likes);
          if (parsedVideo.comments) {
            setCommentsCount(parsedVideo.comments);
          }
        }
      } catch (err) {
        console.warn('Failed to load YouTube feed in ElimiMediaSection:', err);
      }
    }
    fetchLiveVideo();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const productsPool =
        allFirestoreProducts && allFirestoreProducts.length > 0
          ? allFirestoreProducts
          : BOUTIQUE_PRODUCTS;
      const latest20 = getLatest20Products(productsPool);
      const shuffled = [...latest20].sort(() => Math.random() - 0.5);
      const mapped = shuffled.map(convertToProductItem);
      setProducts(mapped.length > 0 ? mapped : INITIAL_FALLBACK_PRODUCTS);
    }, 0);
    return () => clearTimeout(timer);
  }, [allFirestoreProducts]);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleScrollNext = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: 210, behavior: 'smooth' });
      }
    }
  };

  const handleScrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -210, behavior: 'smooth' });
    }
  };

  // Video progress interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = (product: ProductItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCartItems((prev) => [...prev, product.id]);
    setToastMessage(`Added "${product.title}" to your cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
      setToastMessage(`Liked "${featuredVideo.title.substring(0, 32)}..."!`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    setToastMessage(!isSaved ? 'Video saved to your collection!' : 'Video removed from saved.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <section className="w-full bg-[#F8F9FA] py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-[#0F172A] font-sans antialiased">
      <div className="max-w-[1200px] mx-auto space-y-10">

        {/* ====================================================================
            1. HEADER ROW
           ==================================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-[#0B57FF]/20 shadow-xs">
              <div className="w-4 h-4 bg-[#0B57FF] text-white rounded-full flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-white stroke-none ml-0.5" />
              </div>
              <span>ELIMI MÉDIA</span>
            </div>

            {/* Headline with highlighted blue phrase */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Watch. Discover. <span className="text-[#0B57FF]">Shop Instantly.</span>
            </h2>

            {/* Subtitle with accent border */}
            <p className="text-[#64748B] text-base sm:text-lg font-normal max-w-2xl border-l-2 border-[#0B57FF] pl-4">
              Enjoy premium content and shop the items you love—featured in our videos.
            </p>
          </div>

          {/* Right Action Button Pill Link */}
          <div className="shrink-0">
            <Link
              href="/media"
              className="bg-white hover:bg-slate-50 text-[#0F172A] font-semibold px-6 py-3 rounded-full text-sm border border-[#0F172A]/10 shadow-xs transition-all flex items-center gap-2 group hover:border-[#0B57FF]/40"
            >
              <span>View All Videos</span>
              <ArrowRight className="w-4 h-4 text-[#0B57FF] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ====================================================================
            2. 2-COLUMN MAIN LAYOUT (LEFT VIDEO & CAROUSEL | RIGHT SIDEBAR)
           ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* A. LEFT COLUMN - FEATURED VIDEO & CAROUSEL (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Video Player Card */}
            <div className="bg-white rounded-2xl p-3 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] relative group">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 group">
                {/* Background Video Cover Image / Embedded YouTube Player */}
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${featuredVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={featuredVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full object-cover border-0 relative z-10"
                  />
                ) : (
                  <Image
                    src={featuredVideo.thumbnail}
                    alt={featuredVideo.title}
                    fill
                    unoptimized
                    priority
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-105"
                  />
                )}

                {/* Overlays and custom controls - only shown when video is paused/not yet playing */}
                {!isPlaying && (
                  <>
                    {/* Top-Left Badge: Floating solid blue pill "FEATURED" */}
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                      <span className="bg-[#0B57FF] text-white text-[11px] font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow-md border border-white/20">
                        FEATURED
                      </span>
                    </div>

                    {/* Center Big Play Button */}
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 m-auto z-20 w-16 h-16 sm:w-20 sm:h-20 bg-[#0B57FF]/90 hover:bg-[#0B57FF] text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xs transition-transform transform hover:scale-110 cursor-pointer"
                      aria-label="Play video"
                    >
                      <Play className="w-8 h-8 fill-white stroke-none ml-1" />
                    </button>

                    {/* Bottom Custom Media Controls Bar */}
                    <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-3 px-4 flex flex-col gap-2 text-white">
                      {/* Progress Timeline Slider Bar */}
                      <div className="flex items-center gap-3 group/slider cursor-pointer">
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          value={currentTime}
                          onChange={(e) => setCurrentTime(Number(e.target.value))}
                          className="w-full h-1.5 bg-white/30 accent-[#0B57FF] rounded-lg cursor-pointer hover:h-2 transition-all"
                        />
                      </div>

                      {/* Control Buttons & Timestamp Row */}
                      <div className="flex items-center justify-between text-xs font-semibold">
                        {/* Left Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsPlaying(true)}
                            className="hover:text-[#0B57FF] transition p-1 rounded-full cursor-pointer"
                            aria-label="Play"
                          >
                            <Play className="w-5 h-5 fill-white stroke-none" />
                          </button>

                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="hover:text-[#0B57FF] transition p-1 cursor-pointer"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>

                          {/* Time code display */}
                          <span className="text-white/90 text-xs tracking-wider font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3">
                          {/* CC Toggle */}
                          <button
                            onClick={() => setShowCc(!showCc)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              showCc
                                ? 'bg-[#0B57FF] text-white border-[#0B57FF]'
                                : 'bg-transparent text-white/70 border-white/40 hover:text-white'
                            }`}
                            title="Toggle Closed Captions"
                          >
                            CC
                          </button>

                          {/* Settings */}
                          <button
                            onClick={() => {
                              setToastMessage('Video quality set to 1080p60 HD');
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="hover:text-[#0B57FF] transition p-1 cursor-pointer"
                            title="Video Settings"
                          >
                            <Settings className="w-4 h-4" />
                          </button>

                          {/* Fullscreen Toggle */}
                          <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="hover:text-[#0B57FF] transition p-1 cursor-pointer"
                            title="Toggle Fullscreen"
                          >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Video Metadata Bar */}
              <div className="pt-4 pb-2 px-2 space-y-3">
                <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0F172A] leading-snug">
                  {featuredVideo.title}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#0F172A]/8">
                  {/* Channel Tag */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#E0EBFF] border border-[#0B57FF]/30 shrink-0 shadow-xs group cursor-pointer">
                      <Image
                        src={featuredVideo.channelAvatar || OFFICIAL_CHANNEL_AVATAR}
                        alt="ELIMI Média Channel Avatar"
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/icons/ELIMI_MEDIA.svg';
                        }}
                      />
                      {/* Logo Placeholder Fallback */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0B57FF] to-[#0A2351] text-white flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/90" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-[#0F172A]">{featuredVideo.channelName}</span>
                        <CheckCircle2 className="w-4 h-4 fill-[#0B57FF] text-white" />
                      </div>
                      <p className="text-xs text-[#64748B]">{featuredVideo.views} • {featuredVideo.uploadedAt}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Like Button */}
                    <button
                      onClick={handleToggleLike}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition border active:scale-95 ${
                        isLiked
                          ? 'bg-[#0B57FF] text-white border-[#0B57FF]'
                          : 'bg-[#F8F9FA] hover:bg-slate-100 text-[#0F172A] border-[#0F172A]/10'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                      <span>{likesCount >= 1000 ? (likesCount / 1000).toFixed(1) + 'K' : likesCount}</span>
                    </button>

                    {/* Comment Button */}
                    <Link
                      href={`/media/watch/${featuredVideo.youtubeId}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#F8F9FA] hover:bg-slate-100 text-[#0F172A] border border-[#0F172A]/10 transition active:scale-95"
                      title="View all YouTube comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{commentsCount}</span>
                    </Link>

                    {/* Share Button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#F8F9FA] hover:bg-slate-100 text-[#0F172A] border border-[#0F172A]/10 transition active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Share</span>
                    </button>

                    {/* Save Button */}
                    <button
                      onClick={handleToggleSave}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition border active:scale-95 ${
                        isSaved
                          ? 'bg-[#0B57FF] text-white border-[#0B57FF]'
                          : 'bg-[#F8F9FA] hover:bg-slate-100 text-[#0F172A] border-[#0F172A]/10'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Micro-Product Carousel ("You May Like Also") */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base text-[#181B25]">
                  You May Like Also
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#0D52FF] font-bold">{products.length} Items Tagged</span>
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      onClick={handleScrollPrev}
                      disabled={!canScrollLeft}
                      aria-label="Previous items"
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        canScrollLeft
                          ? 'bg-white text-[#181B25] border-slate-200 hover:border-[#0D52FF] hover:text-[#0D52FF] shadow-2xs'
                          : 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleScrollNext}
                      aria-label="Next items"
                      className="w-7 h-7 rounded-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white flex items-center justify-center shadow-2xs transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Scroll Row (Scrollbar completely hidden) */}
              <div
                ref={carouselRef}
                onScroll={checkScroll}
                className="flex items-center gap-4 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
              >
                {products.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.id}`}
                    className="w-44 sm:w-48 shrink-0 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-2.5">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = item.fallbackImage;
                        }}
                      />
                      {item.badge && (
                        <span className="absolute top-2 left-2 bg-[#0D52FF] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-[#181B25] line-clamp-1 group-hover:text-[#0D52FF] transition-colors">
                        {item.title}
                      </h5>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-black text-xs text-[#0D52FF]">
                          {item.price} <span className="text-[10px] text-[#525866] font-normal">{item.currency}</span>
                        </span>

                        {/* Quick Cart Circular Blue Outline Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(item, e);
                          }}
                          className={`w-7 h-7 rounded-full border border-[#0D52FF] flex items-center justify-center transition-all ${
                            cartItems.includes(item.id)
                              ? 'bg-[#0D52FF] text-white'
                              : 'text-[#0D52FF] hover:bg-[#0D52FF] hover:text-white'
                          }`}
                          aria-label={`Add ${item.title} to cart`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Arrow Icon Card indicating to find more products */}
                <div
                  onClick={handleScrollNext}
                  className="w-36 sm:w-40 shrink-0 bg-gradient-to-br from-[#EBF1FF] to-white hover:from-[#0D52FF]/10 hover:to-[#EBF1FF] border-2 border-dashed border-[#0D52FF]/40 hover:border-[#0D52FF] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[190px] shadow-2xs select-none"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0D52FF] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2">
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold text-xs text-[#0D52FF]">
                    {canScrollRight ? 'View More' : 'Back to Start'}
                  </span>
                  <span className="text-[10px] text-[#525866] font-semibold mt-0.5">
                    {canScrollRight ? 'Explore products' : 'First item'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* B. RIGHT COLUMN - "YOU MAY LIKE ALSO" SIDEBAR (col-span-5) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/80 space-y-6">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-xl text-[#181B25]">
                    You May Like Also
                  </h3>
                  <p className="text-xs text-[#525866] mt-0.5">Click any item to view product details</p>
                </div>
                {cartItems.length > 0 && (
                  <span className="bg-[#EBF1FF] text-[#0D52FF] text-xs font-extrabold px-2.5 py-1 rounded-full border border-[#0D52FF]/20">
                    {cartItems.length} in Cart
                  </span>
                )}
              </div>

              {/* Vertical Product Rows (5 Rows) */}
              <div className="divide-y divide-slate-100">
                {products.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.id}`}
                    className="py-3.5 flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50/80 px-2 rounded-xl transition"
                  >
                    {/* Left Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = item.fallbackImage;
                        }}
                      />
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-extrabold text-sm text-[#181B25] group-hover:text-[#0D52FF] transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#525866] truncate">
                        {item.spec}
                      </p>
                      <p className="font-black text-xs text-[#0D52FF]">
                        {item.price} <span className="text-[10px] text-[#525866] font-semibold">{item.currency}</span>
                      </p>
                    </div>

                    {/* Right Outlined White Pill Button "Add to Cart" */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(item, e);
                        }}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
                          cartItems.includes(item.id)
                            ? 'bg-[#0D52FF] text-white border-[#0D52FF]'
                            : 'bg-white hover:bg-[#EBF1FF] text-[#181B25] border-slate-200 hover:border-[#0D52FF]/40 hover:text-[#0D52FF]'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-[#0D52FF]" />
                        <span>{cartItems.includes(item.id) ? 'Added' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-extrabold py-3.5 px-6 rounded-full text-sm shadow-md transition-all flex items-center justify-between group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>View More Products</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* ====================================================================
            3. BOTTOM VALUE PROPOSITION BANNER
           ==================================================================== */}
        <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 md:divide-x divide-slate-100">
            
            {/* Item 1 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 md:px-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10 shadow-2xs">
                <Play className="w-6 h-6 fill-[#0D52FF]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#181B25]">Premium Content</h4>
                <p className="text-xs text-[#525866] mt-0.5">High-quality videos &amp; original shows</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-4 pt-4 sm:pt-0 md:px-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10 shadow-2xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#181B25]">Shop What You See</h4>
                <p className="text-xs text-[#525866] mt-0.5">Buy items featured in videos</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-4 pt-4 sm:pt-0 md:px-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#181B25]">Secure &amp; Trusted</h4>
                <p className="text-xs text-[#525866] mt-0.5">100% authentic products</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-4 pt-4 sm:pt-0 md:px-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10 shadow-2xs">
                <Zap className="w-6 h-6 fill-[#0D52FF]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#181B25]">Instant Checkout</h4>
                <p className="text-xs text-[#525866] mt-0.5">Quick order via WhatsApp or Mobile Money</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ==================== INTERACTIVE MODALS & TOAST ==================== */}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={shouldReduceMotion ? { duration: 0.15 } : EMIL_SPRINGS.toast}
            className="fixed bottom-6 right-6 z-50 bg-[#181B25] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-[#0D52FF] text-white flex items-center justify-center shrink-0 font-bold">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Video Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={shouldReduceMotion ? { duration: 0.15 } : EMIL_SPRINGS.modal}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-slate-100 z-10"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 active:scale-90 transition-transform"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-extrabold text-lg text-[#181B25] mb-2">Share Video</h3>
              <p className="text-xs text-[#525866] mb-4 truncate">{featuredVideo.title}</p>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 text-xs font-mono text-[#525866] truncate mb-4">
                {`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`);
                  setToastMessage('YouTube link copied to clipboard!');
                  setShowShareModal(false);
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold py-3 rounded-full text-xs shadow-md transition active:scale-95"
              >
                Copy Share Link
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
