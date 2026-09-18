"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ElimiHeader from "@/components/ElimiHeader";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Tag,
  BookOpen,
  Filter,
  ExternalLink,
  Flame,
  Radio,
  Clock,
  Eye,
  SlidersHorizontal,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  Star,
  MoreVertical,
  Sliders,
  RefreshCw,
  Loader2,
  MessageCircle,
  Youtube,
} from "lucide-react";

// Product Interface linked to Media items
export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  currency: string;
  image: string;
  fallbackImage: string;
  badge?: string;
  spec: string;
  shopUrl?: string;
}

// Video Item Interface (YouTube Mock style)
export interface MediaVideo {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category:
    | "Fashion & Style"
    | "VIP Lifestyle"
    | "Tech & Gear"
    | "Comedy & Drama"
    | "Cultural Heritage"
    | "Event Masterclass";
  duration: string;
  views: string;
  uploadedAt: string;
  thumbnail: string;
  channelName: string;
  isVerified: boolean;
  likes: number;
  featuredProducts: FeaturedProduct[];
  tags: string[];
  isFeaturedHero?: boolean;
}

// Pub / Publication Interface
export interface MediaPublication {
  id: string;
  title: string;
  issue: string;
  date: string;
  category: string;
  coverImage: string;
  description: string;
  readTime: string;
  tag: string;
  sponsorName?: string;
  shoppableItemIds?: string[];
  excerpt: string[];
}

// Sample Catalog of Shoppable Products from ELIMI Market
const MARKET_PRODUCTS: Record<string, FeaturedProduct> = {
  p_suit: {
    id: "p_suit",
    name: "African Print Tailored Suit",
    category: "Fashion",
    price: "85,000",
    currency: "BIF",
    image: "/assets/shop/african-suit.webp",
    fallbackImage: "/assets/shop/african-suit.jpg",
    badge: "Trending in Market",
    spec: "Premium Cotton Blend • Sizes 48-58",
    shopUrl: "/shop",
  },
  p_vclass: {
    id: "p_vclass",
    name: "Mercedes V-Class Luxury Chauffeur",
    category: "VIP Mobility",
    price: "$100",
    currency: "/ day",
    image: "/assets/shop/mercedes-vclass.webp",
    fallbackImage: "/assets/shop/mercedes-vclass.jpg",
    badge: "VIP Escort",
    spec: "Leather Captain Seats • VIP Driver",
    shopUrl: "/shop",
  },
  p_shoes: {
    id: "p_shoes",
    name: "Handcrafted Italian Leather Shoes",
    category: "Footwear",
    price: "65,000",
    currency: "BIF",
    image: "/assets/shop/leather-shoes.webp",
    fallbackImage: "/assets/shop/leather-shoes.jpg",
    badge: "Authentic",
    spec: "Genuine Cowhide • Goodyear Welted",
    shopUrl: "/shop",
  },
  p_drone: {
    id: "p_drone",
    name: "DJI Mini 3 Pro 4K Drone Kit",
    category: "Media Gear",
    price: "950,000",
    currency: "BIF",
    image: "/assets/shop/dji-drone.webp",
    fallbackImage: "/assets/shop/dji-drone.jpg",
    badge: "4K Ultra HD",
    spec: "Tri-Directional Sensing • 34min Flight",
    shopUrl: "/shop",
  },
  p_watch: {
    id: "p_watch",
    name: "Tissot Gentleman Swiss Watch",
    category: "Luxury Accessories",
    price: "750,000",
    currency: "BIF",
    image: "/assets/shop/tissot-watch.webp",
    fallbackImage: "/assets/shop/tissot-watch.jpg",
    badge: "Swiss Made",
    spec: "Powermatic 80 • Sapphire Crystal",
    shopUrl: "/shop",
  },
  p_shades: {
    id: "p_shades",
    name: "ELIMI Gold Signature Aviators",
    category: "Luxury Accessories",
    price: "45,000",
    currency: "BIF",
    image: "/assets/shop/aviator-shades.webp",
    fallbackImage: "/assets/shop/aviator-shades.jpg",
    badge: "UV400 Polarized",
    spec: "Titanium Frame • Scratch Resistant",
    shopUrl: "/shop",
  },
  p_jacket: {
    id: "p_jacket",
    name: "VIP Security Bomber Jacket",
    category: "Fashion",
    price: "75,000",
    currency: "BIF",
    image: "/assets/shop/bomber-jacket.webp",
    fallbackImage: "/assets/shop/bomber-jacket.jpg",
    badge: "Tactical Edition",
    spec: "Waterproof Nylon • Thermal Lining",
    shopUrl: "/shop",
  },
  p_stand: {
    id: "p_stand",
    name: "Heavy Duty 4K Broadcast Tripod",
    category: "Media Gear",
    price: "180,000",
    currency: "BIF",
    image: "/assets/shop/tripod-stand.webp",
    fallbackImage: "/assets/shop/tripod-stand.jpg",
    badge: "Pro Grade",
    spec: "Carbon Fiber • Fluid Drag Head",
    shopUrl: "/shop",
  },
  p_basket: {
    id: "p_basket",
    name: "Handcrafted Traditional Agaseke Basket",
    category: "Cultural Craft",
    price: "35,000",
    currency: "BIF",
    image: "/assets/shop/agaseke-basket.webp",
    fallbackImage: "/assets/shop/agaseke-basket.jpg",
    badge: "Handwoven Artisanal",
    spec: "Natural Sisal & Raffia • Gitega Crafts",
    shopUrl: "/shop",
  },
};

// Mock YouTube Video Database with real shoppable hooks - mapped from screenshot & channel
const MOCK_VIDEOS: MediaVideo[] = [
  {
    id: "vid_sebarundi",
    youtubeId: "dQw4w9WgXcQ",
    title: "RABA UKO SEBARUNDI YASHITSE MURI INKEREBUTSI DAY AHEREKEJWE ...",
    description:
      "Sebarundi arrival at Inkerebutsi Day VIP ceremonial event with full diplomatic security motorcade and cultural celebrations.",
    category: "VIP Lifestyle",
    duration: "3:13",
    views: "408",
    uploadedAt: "5d ago",
    thumbnail:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Média Official",
    isVerified: true,
    likes: 312,
    featuredProducts: [MARKET_PRODUCTS.p_suit, MARKET_PRODUCTS.p_vclass],
    tags: ["Sebarundi", "Inkerebutsi", "VIP", "Ceremony", "Burundi"],
  },
  {
    id: "vid_mama_mugira",
    youtubeId: "kJQP7kiw5Fk",
    title:
      "Mama Mugira neza avuze amajambo akomeye ku bakenyezi hamwe n'urwaruka",
    description:
      "Amagambo akomeye y'impanuro no gushigikira iterambere ry'abakenyezi n'urwaruka rwo mu Burundi mu nama nkuru.",
    category: "Cultural Heritage",
    duration: "7:18",
    views: "122",
    uploadedAt: "6d ago",
    thumbnail:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Média Official",
    isVerified: true,
    likes: 89,
    featuredProducts: [MARKET_PRODUCTS.p_suit, MARKET_PRODUCTS.p_shoes],
    tags: ["MamaMugiraNeza", "Inama", "Abakenyezi", "Urwaruka", "Burundi"],
  },
  {
    id: "vid_muvuto_police",
    youtubeId: "L_LUpnjgPso",
    title: "Muvuto afashe azira gukorakora abagore babandi",
    description:
      "POLICE ELIMI: Igice gishya cya filime yerekana ibikorwa bya Polisi no gukumira ibyaha mu mujyi wa Bujumbura.",
    category: "Comedy & Drama",
    duration: "38:35",
    views: "77",
    uploadedAt: "9d ago",
    thumbnail: "/assets/media/burundi-skit-cover.jpg",
    channelName: "POLICE ELIMI Series",
    isVerified: true,
    likes: 450,
    featuredProducts: [MARKET_PRODUCTS.p_shoes, MARKET_PRODUCTS.p_suit],
    tags: ["PoliceElimi", "Muvuto", "Skit", "BurundiDrama", "Comedy"],
  },
  {
    id: "vid_cadeau_lavelle",
    youtubeId: "3JZ_D3ELwOQ",
    title: "CADEAU LAVELLE - IGISUPU NYAMUKURU CYO KWA MAMA RWAGASORE",
    description:
      "Ikinamico nsekeje kandi ifite ubutumwa bukomeye ku muryango no gusigasira umuco nyarwanda n'uw'Uburundi.",
    category: "Comedy & Drama",
    duration: "12:45",
    views: "612",
    uploadedAt: "2w ago",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Comedy Hub",
    isVerified: true,
    likes: 720,
    featuredProducts: [MARKET_PRODUCTS.p_suit, MARKET_PRODUCTS.p_watch],
    tags: ["CadeauLavelle", "Igisupu", "MamaRwagasore", "Comedy"],
  },
  {
    id: "vid_umusore_gitega",
    youtubeId: "fJ9rUzIMcZQ",
    title:
      "UMUSORE W'I GITEGA YATURITSE ARARIRA NYUMA YO GUHABWA IMPANO N'URUBYIRUKO",
    description:
      "Ibyishimo n'amarira y'urukundo mu muhango wo guhemba urubyiruko rwiteje imbere mu buhanzi n'ubukorikori i Gitega.",
    category: "Event Masterclass",
    duration: "18:20",
    views: "940",
    uploadedAt: "3w ago",
    thumbnail:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Média Official",
    isVerified: true,
    likes: 930,
    featuredProducts: [MARKET_PRODUCTS.p_shoes, MARKET_PRODUCTS.p_drone],
    tags: ["Gitega", "Impano", "Urubyiruko", "Heritage", "Burundi"],
  },
  {
    id: "vid_talkshow_police",
    youtubeId: "RgKAFK5djSk",
    title:
      "TALK SHOW: POLICE ELIMI IKIGANIRO CYIHARIYE KURI PROTOCOLE N'UMUTEKANO",
    description:
      "Ikiganiro cyihariye hamwe n'abapolisi bo mu mutwe ushinzwe umutekano w'abanyacyubahiro (VIP Protocol & Escort).",
    category: "VIP Lifestyle",
    duration: "24:10",
    views: "1.2K",
    uploadedAt: "1mo ago",
    thumbnail:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Talkshow",
    isVerified: true,
    likes: 1100,
    featuredProducts: [MARKET_PRODUCTS.p_vclass, MARKET_PRODUCTS.p_watch],
    tags: ["TalkShow", "PoliceElimi", "Protocole", "Security", "VIP"],
  },
  {
    id: "vid_hero",
    youtubeId: "dQw4w9WgXcQ",
    title:
      "Bujumbura Gala Runway: The 2026 African Elegance & Luxury Motors Showcase",
    description:
      "Experience the stunning fusion of bespoke African tailoring and VIP motorcade arrivals at the annual Lake Tanganyika Gala. Discover how fashion meets modern prestige in Burundi.",
    category: "Fashion & Style",
    duration: "14:28",
    views: "248K",
    uploadedAt: "2d ago",
    thumbnail:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    channelName: "ELIMI Média Official",
    isVerified: true,
    likes: 5420,
    featuredProducts: [
      MARKET_PRODUCTS.p_suit,
      MARKET_PRODUCTS.p_vclass,
      MARKET_PRODUCTS.p_watch,
    ],
    tags: ["Fashion", "Runway", "V-Class", "Bujumbura", "Luxury"],
    isFeaturedHero: true,
  },
  {
    id: "vid_drone",
    youtubeId: "3JZ_D3ELwOQ",
    title: "Cinematic Burundi: Gitega Royal Highlands 4K Drone Tour",
    description:
      "Soar across the breathtaking hills of Muramvya and the sacred drums of Gitega captured with the high-performance DJI Mini 3 Pro gear available in the ELIMI Shop.",
    category: "Tech & Gear",
    duration: "11:15",
    views: "92K",
    uploadedAt: "1w ago",
    thumbnail:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Tech & Vision",
    isVerified: true,
    likes: 2100,
    featuredProducts: [MARKET_PRODUCTS.p_drone],
    tags: ["Drone", "4K", "Gitega", "Tourism", "Cinematography"],
  },
  {
    id: "vid_vip",
    youtubeId: "L_LUpnjgPso",
    title: "VIP Chauffeur Experience: Mercedes V-Class Diplomatic Escort",
    description:
      "Step inside our flagship Mercedes V-Class with full leather lounge seating, refreshments bar, and private security escort protocol for dignitaries visiting Bujumbura.",
    category: "VIP Lifestyle",
    duration: "06:50",
    views: "114K",
    uploadedAt: "2w ago",
    thumbnail:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    channelName: "ELIMI Mobility & Protocol",
    isVerified: true,
    likes: 4120,
    featuredProducts: [MARKET_PRODUCTS.p_vclass, MARKET_PRODUCTS.p_watch],
    tags: ["VClass", "VIP", "Chauffeur", "Living", "Diplomatic"],
  },
];

// Mock Publications (Pubs / Brand Features / Circulars)
const MOCK_PUBLICATIONS: MediaPublication[] = [
  {
    id: "pub_1",
    title: "ELIMI Prestige Living & Mobility Lookbook (Spring Edition)",
    issue: "Vol. 04 • Exclusive Edition",
    date: "August 2026",
    category: "Lookbook & Catalogue",
    coverImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    description:
      "Curated editorial featuring executive VIP vehicle fleets, lakeside residence bookings, and bespoke chauffeur protocol packages for diaspora and corporate guests.",
    readTime: "6 min read",
    tag: "Official Publication",
    sponsorName: "ELIMI Fleet & Living",
    shoppableItemIds: ["p_vclass", "p_watch"],
    excerpt: [
      "Welcome to the Spring issue of ELIMI Prestige Living. In this volume, we examine the intersection of high-security mobility and effortless luxury in East Africa.",
      "From customized Mercedes V-Class interiors with onboard Wi-Fi to high-clearance Prado motorcades navigating regional routes, our services guarantee uncompromising safety and prestige.",
      "Explore our full fleet reservation portal directly through the ELIMI Market.",
    ],
  },
  {
    id: "pub_2",
    title: "Artisan Gazette: The New Wave of African Tailoring & Haute Couture",
    issue: "Edition No. 12",
    date: "July 2026",
    category: "Fashion Editorial",
    coverImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    description:
      "Discover how contemporary Burundian designers are re-engineering authentic kitenge and wax patterns into sharp modern business suits and evening wear.",
    readTime: "5 min read",
    tag: "Fashion Pub",
    sponsorName: "ELIMI Couture Studio",
    shoppableItemIds: ["p_suit", "p_shoes"],
    excerpt: [
      "Modern African tailoring is no longer confined to ceremonial wear; it is commanding boardrooms and gala stages worldwide.",
      "Our master tailors blend breathable cotton textures with structured silhouettes, delivering outfits that honor heritage while projecting forward-looking ambition.",
      "All featured suits and bespoke cuts are ready for custom sizing in the Market.",
    ],
  },
  {
    id: "pub_3",
    title: "PrintBe & Creator Tech Bulletin: High-Resolution Visuals & Drones",
    issue: "Tech Quarterly #03",
    date: "August 2026",
    category: "Technology & Press",
    coverImage:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    description:
      "Comprehensive buyer guide for content creators, event documentarians, and corporate marketing teams in Burundi seeking 4K aerial gear and custom digital press.",
    readTime: "8 min read",
    tag: "Gear Spotlight",
    sponsorName: "PrintBe Media Labs",
    shoppableItemIds: ["p_drone"],
    excerpt: [
      "In this edition of Creator Tech, we benchmark the DJI Mini 3 Pro against regional flight conditions, battery heat tolerance, and 4K HDR dynamic color science.",
      "Pair your aerial footage with high-definition large format vinyl and exhibition banners printed locally via PrintBe in Bujumbura.",
      "Instant quotes and drone stock available now in the ELIMI Ecosystem.",
    ],
  },
];

export default function MediaPage() {
  // Real YouTube Live Videos State
  const [videoList, setVideoList] = useState<MediaVideo[]>(MOCK_VIDEOS);
  const [isLoadingLiveFeed, setIsLoadingLiveFeed] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<
    "Home" | "Videos" | "Shorts" | "Live" | "Playlists" | "Posts"
  >("Videos");
  const [sortFilter, setSortFilter] = useState<"Latest" | "Popular" | "Oldest">(
    "Latest",
  );
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Active Video Modal state
  const [activeVideo, setActiveVideo] = useState<MediaVideo | null>(null);
  const [isPlayingModal, setIsPlayingModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interactive user actions
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);
  const [activePublication, setActivePublication] =
    useState<MediaPublication | null>(null);

  // Shopping Cart & Toast feedback
  const [cartCount, setCartCount] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickProductModal, setQuickProductModal] =
    useState<FeaturedProduct | null>(null);

  // Infinite Scroll Pagination State
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch real YouTube videos from Elimi Media channel
  useEffect(() => {
    async function fetchChannelVideos() {
      try {
        setIsLoadingLiveFeed(true);
        const res = await fetch("/api/youtube");
        if (!res.ok) throw new Error("Could not load channel feed");
        const data = await res.json();
        if (
          data.videos &&
          Array.isArray(data.videos) &&
          data.videos.length > 0
        ) {
          // Map products to real videos by category or keywords
          const mappedVideos: MediaVideo[] = data.videos.map(
            (vid: any, idx: number) => {
              let featured: FeaturedProduct[] = [];
              const text = (vid.title + " " + vid.description).toLowerCase();
              if (
                text.includes("suit") ||
                text.includes("sebarundi") ||
                text.includes("arvella") ||
                text.includes("queen")
              ) {
                featured = [
                  MARKET_PRODUCTS.p_suit,
                  MARKET_PRODUCTS.p_shades,
                ].filter(Boolean);
              } else if (
                text.includes("police") ||
                text.includes("muvuto") ||
                text.includes("skit")
              ) {
                featured = [
                  MARKET_PRODUCTS.p_jacket,
                  MARKET_PRODUCTS.p_shoes,
                ].filter(Boolean);
              } else if (
                text.includes("drone") ||
                text.includes("camera") ||
                text.includes("reco")
              ) {
                featured = [
                  MARKET_PRODUCTS.p_drone,
                  MARKET_PRODUCTS.p_stand,
                ].filter(Boolean);
              } else if (
                text.includes("mama") ||
                text.includes("gitega") ||
                text.includes("urwaruka")
              ) {
                featured = [
                  MARKET_PRODUCTS.p_basket,
                  MARKET_PRODUCTS.p_shades,
                ].filter(Boolean);
              } else {
                // Default rotation of curated market products
                const keys = Object.keys(MARKET_PRODUCTS);
                const k1 = keys[idx % keys.length];
                const k2 = keys[(idx + 1) % keys.length];
                featured = [MARKET_PRODUCTS[k1], MARKET_PRODUCTS[k2]].filter(
                  Boolean,
                );
              }

              return {
                id: vid.id,
                youtubeId: vid.youtubeId,
                title: vid.title,
                description: vid.description,
                category: vid.category as any,
                duration: vid.duration || "14:20",
                views: vid.views,
                uploadedAt: vid.uploadedAt,
                thumbnail: vid.thumbnail,
                channelName: vid.channelName || "Elimi Media",
                isVerified: true,
                likes: vid.likes || 120,
                featuredProducts: featured,
                tags: vid.tags || [vid.category, "ElimiMedia"],
                isFeaturedHero: idx === 0,
              };
            },
          );

          setVideoList(mappedVideos);
          setIsLiveConnected(true);
        }
      } catch (err) {
        console.warn("Using fallback channel catalog:", err);
      } finally {
        setIsLoadingLiveFeed(false);
      }
    }

    fetchChannelVideos();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: FeaturedProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCartCount((prev) => prev + 1);
    showToast(`Added "${product.name}" to your shopping bag!`);
  };

  const handleToggleLike = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (likedVideoIds.includes(videoId)) {
      setLikedVideoIds((prev) => prev.filter((id) => id !== videoId));
    } else {
      setLikedVideoIds((prev) => [...prev, videoId]);
      showToast("Liked video! Saved to your activity.");
    }
  };

  const handleToggleSave = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (savedVideoIds.includes(videoId)) {
      setSavedVideoIds((prev) => prev.filter((id) => id !== videoId));
      showToast("Removed from watch later.");
    } else {
      setSavedVideoIds((prev) => [...prev, videoId]);
      showToast("Saved to your watch list.");
    }
  };

  // Filtered & Sorted videos based on Tab, Category, Sort filter and Search query
  const filteredVideos = useMemo(() => {
    let result = videoList.filter((video) => {
      // Tab filter
      if (activeTab === "Shorts") {
        const isShort =
          video.title.toLowerCase().includes("#shorts") ||
          video.title.toLowerCase().includes("short");
        if (!isShort) return false;
      }

      const matchesCategory =
        selectedCategory === "All" || video.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesTitle = video.title.toLowerCase().includes(query);
      const matchesDesc = video.description.toLowerCase().includes(query);
      const matchesTags = video.tags.some((t) =>
        t.toLowerCase().includes(query),
      );
      const matchesProduct = video.featuredProducts.some((p) =>
        p.name.toLowerCase().includes(query),
      );

      return (
        matchesCategory &&
        (matchesTitle || matchesDesc || matchesTags || matchesProduct)
      );
    });

    if (sortFilter === "Popular") {
      result = [...result].sort((a, b) => b.likes - a.likes);
    } else if (sortFilter === "Oldest") {
      result = [...result].reverse();
    }

    return result;
  }, [videoList, activeTab, searchQuery, selectedCategory, sortFilter]);

  // Infinite scroll sliced list
  const visibleVideos = useMemo(() => {
    return filteredVideos.slice(0, visibleCount);
  }, [filteredVideos, visibleCount]);

  const hasMoreVideos = visibleVideos.length < filteredVideos.length;

  const handleLoadMore = React.useCallback(() => {
    if (isLoadingMore || !hasMoreVideos) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 9);
      setIsLoadingMore(false);
    }, 400);
  }, [isLoadingMore, hasMoreVideos]);

  // Derive filter key to cleanly manage pagination
  const filterKey = `${searchQuery}_${selectedCategory}_${activeTab}_${sortFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(9);
  }

  // Infinite Scroll window listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 600
      ) {
        if (!isLoadingMore && hasMoreVideos) {
          handleLoadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMoreVideos, handleLoadMore]);

  const categories = [
    "All",
    "Fashion & Style",
    "VIP Lifestyle",
    "Tech & Gear",
    "Comedy & Drama",
    "Cultural Heritage",
    "Event Masterclass",
  ];

  const heroVideo = videoList[0] || MOCK_VIDEOS[0];

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#0F172A] font-sans antialiased flex flex-col justify-between selection:bg-[#0B57FF] selection:text-white">
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {/* ====================================================================
            1. HERO SECTION: EDITORIAL PRESENTATION WITH COBALT ACCENTS
           ==================================================================== */}
        <section className="w-full bg-[#F8F9FA] p-0 m-0 relative overflow-hidden h-auto max-h-[calc(100dvh-20px)] md:h-[580px] md:max-h-[560px] lg:h-[calc(100dvh-50px)] lg:max-h-[760px] xl:max-h-[820px] flex flex-col">
          <div className="w-full h-full flex-1 bg-white rounded-none rounded-b-[32px] sm:rounded-b-[48px] md:rounded-b-[54px] lg:rounded-b-[72px] text-[#0F172A] shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] relative overflow-hidden px-4 sm:px-6 lg:px-10 pt-2.5 sm:pt-3 lg:pt-4 pb-[30px] sm:pb-0 min-h-[500px] sm:min-h-0 flex flex-col justify-between border-b border-[#0F172A]/8">
            <div className="max-w-[1080px] mx-auto w-full h-full flex flex-col justify-between relative">
              {/* B. HERO CONTENT & STAGE */}
              <div className="relative pt-1 sm:pt-2 flex-1 flex flex-col justify-between min-h-0">
                {/* Top Left Radiant Spoke Burst Doodle (in Electric Cobalt #0B57FF) */}
                <div className="absolute top-0 left-0 sm:left-2 lg:left-4 pointer-events-none select-none z-10">
                  <svg
                    className="w-8 h-8 sm:w-11 sm:h-11 lg:w-16 lg:h-16 text-[#0B57FF]"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    {[...Array(16)].map((_, i) => (
                      <rect
                        key={i}
                        x="46"
                        y="4"
                        width="8"
                        height="26"
                        rx="4"
                        transform={`rotate(${i * 22.5} 50 50)`}
                      />
                    ))}
                  </svg>
                </div>

                {/* Top Right 3-Stripe Angle Doodles (in Electric Cobalt #0B57FF) */}
                <div className="absolute top-0 sm:top-1 right-0 sm:right-4 lg:right-6 pointer-events-none select-none z-10">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-[#0B57FF]"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  >
                    <path d="M12 10 L28 18" />
                    <path d="M20 22 L36 30" />
                    <path d="M28 34 L44 42" />
                  </svg>
                </div>

                {/* Headline: Editorial typography with tight tracking */}
                <div className="text-center max-w-3xl mx-auto px-2 relative z-20 shrink-0 translate-y-[30px] sm:translate-y-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-medium tracking-[-0.03em] text-[#0F172A] leading-[1.1]">
                    Empowering Brands <br className="hidden sm:inline" />
                    Through Creative Solutions
                  </h1>
                  <p className="mt-1 text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#0B57FF]">
                    Watch and discover what matters in our market
                  </p>
                </div>

                {/* STAGE: Left Block + Center Presenter + Right Block */}
                <div className="relative flex-1 w-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] flex items-center justify-between px-1 sm:px-4 translate-y-[30px] sm:translate-y-0">
                  {/* 1. LEFT COLUMN */}
                  <div className="z-20 space-y-2 text-left max-w-[200px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[310px] my-auto">
                    {/* Mini spark doodle on left */}
                    <div className="inline-block">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B57FF]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M4 14 C 8 10, 14 10, 18 6" />
                        <path d="M8 18 C 12 14, 16 14, 20 10" />
                      </svg>
                    </div>

                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal max-w-prose">
                      From web development to branding, we deliver innovative
                      strategies that elevate your brand and drive growth.
                      Let&apos;s create something exceptional together.
                    </p>

                    <div className="relative pt-1">
                      <button
                        onClick={() => {
                          const el = document.getElementById("whats-up-now");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="border border-[#1D4ED8] text-[#0F172A] hover:bg-[#0B57FF] hover:text-white text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer"
                      >
                        Innovate Your Brand
                      </button>

                      {/* Hand-Drawn Looping Arrow Doodle curving toward center */}
                      <div className="hidden sm:block absolute -right-12 sm:-right-14 top-1 pointer-events-none select-none text-[#0F172A]/70 z-30">
                        <svg
                          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 transform rotate-6"
                          viewBox="0 0 60 60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 12 C 5 28, 12 48, 36 42 C 48 39, 48 20, 36 18 C 24 16, 26 38, 48 46" />
                          <path d="M42 48 L50 46 L47 38" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 2. CENTER PRESENTER: Lower z-index (z-10), large size, flush to bottom */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end z-10 pointer-events-none">
                    {/* Subtle Circular Ring Backdrop behind presenter */}
                    <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[370px] md:h-[370px] lg:w-[460px] lg:h-[460px] xl:w-[520px] xl:h-[520px] rounded-full bg-[#E0EBFF]/50 absolute bottom-0 left-1/2 -translate-x-1/2 -z-10" />

                    {/* Big Host Presenter Image Cutout */}
                    <div className="relative w-[280px] sm:w-[360px] md:w-[420px] lg:w-[500px] xl:w-[560px] 2xl:w-[600px] h-[280px] sm:h-[350px] md:h-[390px] lg:h-[50vh] xl:h-[54vh] max-h-[520px] flex items-end justify-center">
                      <Image
                        src="/assets/media/media_hero_presenter.jpg"
                        alt="ELIMI Média Host"
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-contain object-bottom select-none"
                      />
                    </div>
                  </div>

                  {/* 3. DUAL FROSTED PILL CONTROLS */}
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-auto">
                    <div className="bg-white/95 backdrop-blur-xl p-1.5 rounded-full border border-[#0F172A]/10 shadow-[0px_8px_30px_rgba(15,23,42,0.12)] flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const el = document.getElementById("videos");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        Browse Our Media
                      </button>
                      <Link
                        href="/shop"
                        className="text-[#0F172A] hover:text-[#0B57FF] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all hover:bg-[#E0EBFF]/60 border border-[#0F172A]/8 whitespace-nowrap"
                      >
                        Let&apos;s Shop
                      </Link>
                    </div>
                  </div>

                  {/* 4. RIGHT COLUMN */}
                  <div className="z-20 space-y-1 text-left max-w-[150px] sm:max-w-[180px] md:max-w-[200px] my-auto">
                    {/* 5-Star Rating row in Electric Cobalt */}
                    <div className="flex items-center gap-1 text-[#0B57FF]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 fill-[#0B57FF] stroke-none"
                        />
                      ))}
                    </div>

                    <div className="pt-0.5 sm:pt-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-[#0F172A] tracking-[-0.02em] leading-none">
                        10 Years
                      </h2>
                      <p className="text-xs font-medium text-[#64748B] mt-1">
                        Experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. "WHAT'S UP NOW" BROADCAST & SHOPPABLE SHOWCASE
           ==================================================================== */}
        <section
          id="whats-up-now"
          className="relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto"
        >
          <div className="space-y-8">
            {/* Section Header Text & Value Framing */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-[#0B57FF]/20 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-[#0B57FF] animate-pulse" />
                <span>WHAT&apos;S UP NOW • LIVE SPOTLIGHT</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
                Watch the broadcast,{" "}
                <span className="text-[#0B57FF]">buy in the market.</span>
              </h2>

              <p className="text-[#64748B] text-xs sm:text-sm sm:leading-relaxed font-normal max-w-2xl border-l-2 border-[#0B57FF] pl-4">
                Every outfit, accessory, tech gadget, and vehicle featured in
                this spotlight is in stock and ready to order.
              </p>
            </div>

            {/* "What's Up Now" Main Hero Interactive Showcase Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-7 lg:p-9 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] relative overflow-hidden text-[#0F172A]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Left: Hero Image / Video Screen Player */}
                <div className="lg:col-span-7 relative">
                  <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
                    {/* Background Hero Image */}
                    <Image
                      src={heroVideo.thumbnail}
                      alt={heroVideo.title}
                      fill
                      unoptimized
                      priority
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Top Status Badges: "WHAT'S UP NOW" + HD */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="bg-[#0B57FF] text-white text-[11px] font-bold tracking-wider px-3 py-1 rounded-full uppercase flex items-center gap-1.5 shadow-md">
                        <Radio className="w-3 h-3 text-white" />
                        WHAT&apos;S UP NOW
                      </span>
                      <span className="bg-black/60 text-white/90 text-[10px] font-medium px-2 py-0.8 rounded backdrop-blur-xs">
                        4K UHD
                      </span>
                    </div>

                    {/* Top Right Duration */}
                    <div className="absolute top-4 right-4 z-20 bg-black/70 text-white text-xs font-sans font-medium px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      {heroVideo.duration}
                    </div>

                    {/* Center Big Play Button */}
                    <Link
                      href={`/media/watch/${heroVideo.youtubeId}`}
                      className="absolute inset-0 m-auto z-20 w-16 h-16 sm:w-20 sm:h-20 bg-[#0B57FF] hover:bg-[#0948D9] text-white rounded-full flex items-center justify-center shadow-2xl transition-transform transform hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Play broadcast"
                    >
                      <Play className="w-8 h-8 fill-white stroke-none ml-1" />
                    </Link>

                    {/* Bottom Metadata in Image */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                        <span>{heroVideo.channelName}</span>
                        <span>•</span>
                        <span>{heroVideo.views}</span>
                        <span>•</span>
                        <span>{heroVideo.uploadedAt}</span>
                      </div>
                      <h3 className="text-base sm:text-xl font-medium line-clamp-1 text-white">
                        {heroVideo.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Right: "What's Featured In This Spotlight" + Direct Shop Bridge */}
                <div className="lg:col-span-5 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B57FF] uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4 text-[#0B57FF]" />
                      <span>SHOP WHAT YOU SEE</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-medium text-[#0F172A] tracking-[-0.02em]">
                      Featured in this broadcast
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                      Click any item to order immediately or add to your market
                      bag.
                    </p>
                  </div>

                  {/* Product Cards: Single horizontal row on mobile & tablet, vertical stack on desktop (lg+) */}
                  <div className="flex overflow-x-auto no-scrollbar gap-2.5 sm:gap-3 pb-1 snap-x snap-mandatory lg:flex-col lg:overflow-visible lg:gap-3 lg:pb-0">
                    {(heroVideo.featuredProducts || []).map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => setQuickProductModal(prod)}
                        className="shrink-0 w-[240px] sm:w-[270px] lg:w-full snap-start bg-[#F8F9FA] hover:bg-[#E0EBFF]/30 p-3 rounded-xl border border-[#0F172A]/8 hover:border-[#0B57FF]/40 transition flex items-center justify-between gap-2.5 sm:gap-3 group cursor-pointer"
                      >
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-[#0F172A]/8">
                          <Image
                            src={
                              prod?.image ||
                              prod?.fallbackImage ||
                              "/assets/shop/african-suit.jpg"
                            }
                            alt={prod?.name || "Product"}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                prod?.fallbackImage ||
                                "/assets/shop/african-suit.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-xs sm:text-sm text-[#0F172A] truncate group-hover:text-[#0B57FF] transition-colors">
                              {prod?.name}
                            </h4>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
                            {prod?.spec}
                          </p>
                          <p className="text-xs font-bold text-[#0B57FF] mt-0.5">
                            {prod?.price}{" "}
                            <span className="text-[10px] text-[#64748B] font-normal">
                              {prod?.currency}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-[#0B57FF] text-[#0B57FF] hover:text-white border border-[#0F172A]/10 hover:border-[#0B57FF] flex items-center justify-center transition shadow-xs cursor-pointer"
                            title="Add to bag"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Call to action connecting media directly to market */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href="/shop"
                      className="w-full bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold py-3 px-5 rounded-full text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 group"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Browse Full Market Catalogue</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. YOUTUBE CHANNEL GRID (Matching YouTube Channel Layout Screenshot)
           ==================================================================== */}
        <section
          id="videos"
          className="px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto pt-10 space-y-8"
        >
          {/* YouTube Channel Header with Profile Picture, Stats & Direct YouTube Subscribe */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-3.5">
              <a
                href="https://www.youtube.com/@elimimedia"
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#0B57FF]/30 shadow-sm group bg-white"
                title="View @elimimedia on YouTube"
              >
                <Image
                  src="/assets/icons/ELIMI_MEDIA.svg"
                  alt="ELIMI Media"
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </a>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <a
                    href="https://www.youtube.com/@elimimedia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-base sm:text-xl text-[#0F172A] hover:text-[#0B57FF] transition flex items-center gap-1.5"
                  >
                    <span>ELIMI Media</span>
                    <svg
                      className="w-4 h-4 text-[#64748B] fill-current"
                      viewBox="0 0 24 24"
                      aria-label="Verified Channel"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.2L6.7 12.7l1.4-1.4 2.1 2.1 5.7-5.7 1.4 1.4-7.1 7.1z" />
                    </svg>
                  </a>
                </div>
                <div className="text-xs sm:text-[13px] text-[#64748B] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-[#0F172A] font-semibold">@elimimedia</span>
                  <span>•</span>
                  <span>14.9K subscribers</span>
                  <span>•</span>
                  <span>150+ videos</span>
                </div>
              </div>
            </div>

            {/* Direct YouTube Subscribe Button */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.youtube.com/@elimimedia?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
                title="Subscribe to @elimimedia on YouTube"
              >
                <Play className="w-3.5 h-3.5 fill-white stroke-none ml-0.5" />
                <span>Subscribe</span>
              </a>
            </div>
          </div>

          {/* Top YouTube Channel Tabs Navigation Bar */}
          <div className="border-b border-[#0F172A]/10 flex items-center justify-between gap-4 overflow-x-auto [scrollbar-width:none]">
            <div className="flex items-center gap-6 sm:gap-8">
              {(
                [
                  "Home",
                  "Videos",
                  "Shorts",
                  "Live",
                  "Playlists",
                  "Posts",
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm sm:text-base font-semibold whitespace-nowrap transition relative cursor-pointer ${
                      isActive
                        ? "text-[#0B57FF]"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0B57FF] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Icon / Toggle */}
            <div className="flex items-center gap-2 pb-2.5 shrink-0">
              {showSearchInput ? (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="bg-white text-[#0F172A] text-xs px-3 py-1.5 pl-8 rounded-full border border-[#0F172A]/15 focus:border-[#0B57FF] focus:outline-none w-44 sm:w-60 shadow-xs"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5" />
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchInput(false);
                    }}
                    className="absolute right-2 text-[#64748B] hover:text-[#0F172A]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-full hover:bg-[#E0EBFF]/50 transition cursor-pointer"
                  title="Search channel"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-Filters: Latest / Popular / Oldest Pills & Real-time channel indicator */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {(["Latest", "Popular", "Oldest"] as const).map((filter) => {
                const isActive = sortFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setSortFilter(filter)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-[#0B57FF] text-white shadow-xs"
                        : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#0F172A]/10 hover:border-[#0B57FF]/30"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}

              {isLiveConnected && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Feed: @elimimedia</span>
                </div>
              )}
            </div>

            {/* Category dropdown & Refresh Button */}
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white text-[#0F172A] text-xs px-3 py-1.5 rounded-lg border border-[#0F172A]/15 focus:outline-none focus:border-[#0B57FF] shadow-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white text-[#0F172A]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* YouTube Video Grid matching 3-column layout */}
          {filteredVideos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E0EBFF] text-[#0B57FF] mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-[#0F172A]">
                No videos found
              </h3>
              <p className="text-sm text-[#64748B] max-w-md mx-auto">
                No videos match &quot;{searchQuery}&quot;. Try searching for
                &quot;suit&quot;, &quot;skit&quot;, &quot;Sebarundi&quot;, or
                &quot;VIP&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="bg-[#0B57FF] hover:bg-[#0948D9] text-white text-xs font-semibold px-6 py-2.5 rounded-full shadow-md transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {visibleVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/media/watch/${video.youtubeId}`}
                    className="group cursor-pointer flex flex-col bg-white rounded-2xl p-3 sm:p-3.5 border border-[#0F172A]/8 hover:border-[#0B57FF]/40 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-300"
                  >
                    {/* Video Thumbnail (16:9) */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* YouTube Duration Badge Bottom Right */}
                      <div className="absolute bottom-2 right-2 z-10 bg-black/85 text-white text-[11px] sm:text-xs font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {video.duration}
                      </div>

                      {/* Hover Play Button */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <div className="w-12 h-12 rounded-full bg-[#0B57FF] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Video Info Row below Thumbnail */}
                    <div className="flex items-start gap-3 pt-3 px-0.5">
                      {/* Left: YouTube Channel Profile Picture */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-[#E0EBFF] border border-[#0B57FF]/20 relative mt-0.5 shadow-xs">
                        <Image
                          src="/assets/icons/ELIMI_MEDIA.svg"
                          alt={video.channelName || "Elimi Media"}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Right: Title, Channel Name with Verified Badge, Views & Time */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          {/* Video Title */}
                          <h3 className="text-[#0F172A] font-semibold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-[#0B57FF] transition">
                            {video.title}
                          </h3>

                          {/* Three-dots Menu Icon on the Right */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleSave(video.id, e);
                            }}
                            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-slate-100 transition shrink-0 -mt-0.5"
                            title="Save / Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Channel Name with YouTube Verified Checkmark */}
                        <div className="text-[#64748B] text-xs sm:text-[13px] font-normal flex items-center gap-1 mt-1">
                          <span>{video.channelName || "Elimi Media"}</span>
                          <svg
                            className="w-3.5 h-3.5 text-[#64748B] fill-current shrink-0"
                            viewBox="0 0 24 24"
                            aria-label="Verified"
                          >
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.2L6.7 12.7l1.4-1.4 2.1 2.1 5.7-5.7 1.4 1.4-7.1 7.1z" />
                          </svg>
                        </div>

                        {/* Views & Relative Upload Time */}
                        <div className="text-[#64748B] text-xs sm:text-[13px] flex items-center gap-1.5 mt-0.5 font-normal">
                          <span>▷ {video.views}</span>
                          <span>•</span>
                          <span>{video.uploadedAt}</span>
                        </div>

                        {/* Shoppable Tag Badge */}
                        {video.featuredProducts.length > 0 && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-2.5 py-0.5 rounded-full mt-1.5">
                            <ShoppingBag className="w-3 h-3" />
                            <span>
                              {video.featuredProducts.length} Shoppable Items
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Infinite Scroll Indicator / Load More */}
              {hasMoreVideos ? (
                <div className="flex flex-col items-center justify-center pt-4 pb-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-[#0F172A] border border-[#0F172A]/10 text-xs sm:text-sm font-semibold shadow-xs transition hover:border-[#0B57FF]/40 cursor-pointer"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 text-[#0B57FF] animate-spin" />
                        <span>Loading more channel videos...</span>
                      </>
                    ) : (
                      <>
                        <span>Scroll for more or click to load</span>
                        <span className="text-[11px] text-[#64748B]">
                          ({visibleVideos.length} of {filteredVideos.length})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                filteredVideos.length > 6 && (
                  <div className="text-center py-4 text-xs font-semibold text-[#64748B]">
                    You have reached the end of the channel video catalog (
                    {filteredVideos.length} videos)
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* ====================================================================
            5. OUR PUBS & PUBLICATIONS SECTION ("Display Our Pubs")
           ==================================================================== */}
        <section
          id="pubs"
          className="px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto pt-20 space-y-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0F172A]/10 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                <BookOpen className="w-4 h-4 text-[#0B57FF]" />
                <span>ELIMI EDITORIAL &amp; BRAND SPONSORS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
                Our Publications &amp; Brand Pubs
              </h2>
              <p className="text-sm text-[#64748B] max-w-2xl border-l-2 border-[#0B57FF] pl-4">
                Explore our digital magazines, promotional circulars, and
                exclusive partner advertorials. Read the latest trends and
                access direct market coupons.
              </p>
            </div>

            <div className="shrink-0">
              <span className="bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 text-xs font-bold px-4 py-2 rounded-full shadow-xs">
                {MOCK_PUBLICATIONS.length} Official Pubs Available
              </span>
            </div>
          </div>

          {/* Pubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_PUBLICATIONS.map((pub) => (
              <div
                key={pub.id}
                onClick={() => setActivePublication(pub)}
                className="bg-white rounded-2xl overflow-hidden border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] hover:border-[#0B57FF]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer text-[#0F172A]"
              >
                {/* Pub Cover Header */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={pub.coverImage}
                    alt={pub.title}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-[#0B57FF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {pub.tag}
                    </span>
                    <span className="bg-black/60 text-white/90 text-[10px] font-semibold px-2 py-0.8 rounded backdrop-blur-xs">
                      {pub.readTime}
                    </span>
                  </div>

                  {/* Issue Info on Image */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <span className="text-xs font-sans text-white/80 block">
                      {pub.issue} • {pub.date}
                    </span>
                    <h3 className="font-medium text-lg text-white group-hover:text-blue-200 transition-colors line-clamp-1 mt-0.5">
                      {pub.title}
                    </h3>
                  </div>
                </div>

                {/* Pub Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#0B57FF] uppercase tracking-wider">
                      {pub.category}
                    </span>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-3">
                      {pub.description}
                    </p>
                  </div>

                  {/* Sponsor & CTA Row */}
                  <div className="pt-4 border-t border-[#0F172A]/8 flex items-center justify-between">
                    <div className="text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#0F172A] block">
                        Sponsor:
                      </span>
                      <span className="text-[#64748B] font-medium">
                        {pub.sponsorName}
                      </span>
                    </div>

                    <button
                      onClick={() => setActivePublication(pub)}
                      className="bg-white hover:bg-[#0B57FF] text-[#0F172A] hover:text-white font-semibold text-xs px-4 py-2 rounded-full border border-[#0F172A]/15 hover:border-[#0B57FF] transition flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read Pub</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            6. MARKET BRIDGE CTA BANNER (Drawing closer to buy from our market)
           ==================================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto pt-20">
          <div className="bg-gradient-to-br from-[#0B57FF] via-[#0948D9] to-[#083FC2] rounded-3xl p-8 sm:p-12 md:p-14 text-white shadow-xl relative overflow-hidden border border-[#0B57FF]/30">
            {/* Background Light Bubbles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/20 shadow-xs">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-200" />
                <span>DIRECT TO MARKET ACCESS</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] leading-tight">
                Saw something in our media? <br />
                <span className="text-blue-200">
                  Have it delivered to your door.
                </span>
              </h2>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                Every outfit, watch, luxury vehicle rental, and tech gadget
                showcased in ELIMI Média is authenticated and ready for order in
                Bujumbura, Gitega, and shipped across the diaspora.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="bg-white hover:bg-slate-50 text-[#0B57FF] font-semibold px-7 py-3.5 rounded-full text-sm shadow-md transition transform hover:scale-105 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#0B57FF]" />
                  <span>Enter ELIMI Market</span>
                </Link>

                <a
                  href="https://wa.me/25764444546?text=Hello%20Elimi!%20I%20saw%20an%20item%20in%20your%20Media%20video%20and%20want%20to%20buy."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3.5 rounded-full text-sm border border-white/30 backdrop-blur-xs transition flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>WhatsApp Concierge (Lundi - Vendredi : 9h - 17h)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          7. FOOTER (Matching ELIMI Platform standard)
         ==================================================================== */}
      <footer className="bg-[#0F172A] text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-[#0F172A]/10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0B57FF] text-white font-black flex items-center justify-center text-sm shadow-xs">
                E
              </div>
              <span className="font-semibold text-xl tracking-tight">
                ELIMI Média
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Watch and discover what matters. Burundi&apos;s leading media and
              shoppable entertainment hub.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-[#0B57FF] mb-3">
              Media Channels
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Fashion &amp; Style Runway</li>
              <li>VIP Chauffeur &amp; Living Films</li>
              <li>Tech &amp; Drone Reviews</li>
              <li>Burundi Comedy &amp; Drama Skits</li>
              <li>Cultural Heritage Series</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-[#0B57FF] mb-3">
              ELIMI Ecosystem
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Protocol &amp; Hospitality Services
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  ELIMI Market &amp; Boutique
                </Link>
              </li>
              <li>
                <Link href="/printbe" className="hover:text-white transition">
                  PrintBe Digital Press
                </Link>
              </li>
              <li>
                <Link href="/allocations" className="hover:text-white transition">
                  Other Occasional Rentals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-[#0B57FF] mb-3">
              Studio &amp; Contact
            </h5>
            <div className="space-y-2 text-xs text-slate-400">
              <p>📍 Boulevard Mwezi Gisabo, Bujumbura</p>
              <p>📞 Media Desk: +257 64 44 45 46</p>
              <p>✉️ elimiofficiel@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} ELIMI Platform &amp; Média. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/shop" className="hover:text-white transition">
              Market
            </Link>
            <Link href="/media" className="hover:text-white transition">
              Média
            </Link>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          8. INTERACTIVE MODAL: YOUTUBE MOCK VIDEO PLAYER & SHOPPING DRAWER
         ==================================================================== */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-[#0F172A]/10 text-[#0F172A] relative"
            >
              {/* Close Button Top-Right */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close player"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Video Player Header Area */}
              <div className="relative aspect-video w-full bg-black overflow-hidden group">
                {isPlayingModal && activeVideo.youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0 z-10"
                  />
                ) : (
                  <>
                    <Image
                      src={activeVideo.thumbnail}
                      alt={activeVideo.title}
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-cover opacity-90"
                    />

                    {/* Top YouTube Watermark */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/10">
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>ELIMI YouTube Official Channel</span>
                    </div>

                    {/* Center Big Controls */}
                    <button
                      onClick={() => setIsPlayingModal(true)}
                      className="absolute inset-0 m-auto z-20 w-16 h-16 sm:w-20 sm:h-20 bg-[#0B57FF]/90 hover:bg-[#0B57FF] text-white rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-110 cursor-pointer"
                      aria-label="Play on YouTube"
                    >
                      <Play className="w-8 h-8 fill-white stroke-none ml-1" />
                    </button>

                    {/* Bottom Video Progress Bar & Controls */}
                    <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 text-white">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsPlayingModal(true)}
                            className="cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white stroke-none" />
                          </button>
                          <span className="font-sans text-white/80">
                            HD Broadcast • {activeVideo.duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            HD 1080p
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Video Info & Embedded Shoppable Sidebar Area */}
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8F9FA]">
                {/* Left col: Title, Channel, Description, Social Actions (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      {activeVideo.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0F172A] mt-2">
                      {activeVideo.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      {activeVideo.views} • Uploaded {activeVideo.uploadedAt}
                    </p>
                  </div>

                  {/* Channel & Action buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#0F172A]/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#0B57FF] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        E
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-sm text-[#0F172A]">
                          <span>{activeVideo.channelName}</span>
                          <CheckCircle2 className="w-4 h-4 text-[#0B57FF] fill-[#0B57FF]/20" />
                        </div>
                        <span className="text-xs text-[#64748B]">
                          125K Subscribers
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleLike(activeVideo.id, e)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                          likedVideoIds.includes(activeVideo.id)
                            ? "bg-[#0B57FF] text-white border-[#0B57FF]"
                            : "bg-white text-[#0F172A] border-[#0F172A]/15 hover:border-[#0B57FF]/30"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>
                          {activeVideo.likes +
                            (likedVideoIds.includes(activeVideo.id) ? 1 : 0)}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          showToast("Video link copied to clipboard!");
                        }}
                        className="px-3.5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-[#0F172A] border border-[#0F172A]/15 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed bg-white p-4 rounded-2xl border border-[#0F172A]/8">
                    {activeVideo.description}
                  </p>
                </div>

                {/* Right col: "BUY ITEMS FROM THIS VIDEO" (5 cols) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#0F172A]/8 shadow-xs space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B57FF] uppercase tracking-wider">
                      <ShoppingBag className="w-4 h-4 text-[#0B57FF]" />
                      <span>SHOP ITEMS IN THIS VIDEO</span>
                    </div>
                    <h4 className="font-semibold text-base text-[#0F172A] mt-0.5">
                      Available in ELIMI Market
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {(activeVideo.featuredProducts || []).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setQuickProductModal(item)}
                        className="p-3 rounded-xl border border-[#0F172A]/8 hover:border-[#0B57FF]/40 hover:bg-[#F8F9FA] bg-white transition flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#0F172A]/10">
                          <Image
                            src={
                              item?.image ||
                              item?.fallbackImage ||
                              "/assets/shop/african-suit.jpg"
                            }
                            alt={item?.name || "Product"}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                item?.fallbackImage ||
                                "/assets/shop/african-suit.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-xs text-[#0F172A] group-hover:text-[#0B57FF] truncate">
                            {item?.name}
                          </h5>
                          <p className="text-[10px] text-[#64748B] truncate">
                            {item?.spec}
                          </p>
                          <p className="font-semibold text-xs text-[#0B57FF] mt-0.5">
                            {item?.price}{" "}
                            <span className="text-[10px] text-[#64748B] font-normal">
                              {item?.currency}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          <button
                            onClick={(e) => handleAddToCart(item, e)}
                            className="px-3 py-1.5 rounded-full bg-[#0B57FF] text-white hover:bg-[#0948D9] font-semibold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Buy</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/shop"
                    className="w-full bg-[#E0EBFF] hover:bg-[#0B57FF] text-[#0B57FF] hover:text-white border border-[#0B57FF]/20 font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-center"
                  >
                    <span>View More in Market</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          9. INTERACTIVE MODAL: PUBLICATION / PUB READER
         ==================================================================== */}
      <AnimatePresence>
        {activePublication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#0F172A]/10 text-[#0F172A] relative"
            >
              {/* Top Banner Header */}
              <div className="relative aspect-21/9 w-full bg-slate-900 overflow-hidden">
                <Image
                  src={activePublication.coverImage}
                  alt={activePublication.title}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <button
                  onClick={() => setActivePublication(null)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-xs font-sans text-blue-200 font-semibold">
                    {activePublication.issue} • {activePublication.date}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-medium text-white leading-tight">
                    {activePublication.title}
                  </h3>
                </div>
              </div>

              {/* Publication Content Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 text-[#0F172A] bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-[#0F172A]/10">
                  <div>
                    <span className="text-xs font-bold text-[#0B57FF] uppercase tracking-wider">
                      {activePublication.category}
                    </span>
                    <p className="text-xs text-[#64748B]">
                      Sponsored by {activePublication.sponsorName}
                    </p>
                  </div>
                  <span className="bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold px-3 py-1 rounded-full border border-[#0B57FF]/20">
                    {activePublication.readTime}
                  </span>
                </div>

                <div className="space-y-3 text-sm leading-relaxed text-[#64748B]">
                  {activePublication.excerpt.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="bg-[#E0EBFF]/40 p-4 rounded-2xl border border-[#0B57FF]/20 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                  <div>
                    <h5 className="font-semibold text-xs text-[#0B57FF]">
                      Advertised Collection Available in Market
                    </h5>
                    <p className="text-[11px] text-[#64748B]">
                      Order directly or book concierge with instant
                      verification.
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    onClick={() => setActivePublication(null)}
                    className="bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-md transition shrink-0 flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Shop Advertised Deals</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          10. QUICK PRODUCT DETAIL MODAL (Instant Purchase from Media)
         ==================================================================== */}
      <AnimatePresence>
        {quickProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-[#0F172A]/10 space-y-4 text-[#0F172A]"
            >
              <button
                onClick={() => setQuickProductModal(null)}
                className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-[#0F172A]/8">
                <Image
                  src={quickProductModal.image}
                  alt={quickProductModal.name}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = quickProductModal.fallbackImage;
                  }}
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-2.5 py-1 rounded-full">
                  As Seen In ELIMI Média
                </span>
                <h3 className="font-medium text-xl text-[#0F172A]">
                  {quickProductModal.name}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {quickProductModal.spec}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#0F172A]/10">
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase font-semibold">
                    Market Price
                  </p>
                  <p className="font-semibold text-xl text-[#0B57FF]">
                    {quickProductModal.price}{" "}
                    <span className="text-xs text-[#64748B] font-normal">
                      {quickProductModal.currency}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/25764444546?text=Hello%20Elimi!%20I%20want%20to%20order%20the%20${encodeURIComponent(quickProductModal.name)}%20featured%20in%20Elimi%20Media.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      handleAddToCart(quickProductModal);
                      setQuickProductModal(null);
                    }}
                    className="bg-[#25D366] hover:bg-[#1eb855] text-white font-semibold px-4 py-2.5 rounded-full text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          11. TOAST NOTIFICATION
         ==================================================================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-[#0F172A]/20"
          >
            <div className="w-7 h-7 rounded-full bg-[#0B57FF] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
