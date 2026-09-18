"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EMIL_EASINGS } from "@/lib/motion-constants";
import {
  Car,
  Building2,
  CalendarCheck,
  Calendar,
  Package,
  Video,
  ShoppingBag,
  Layers,
  ChevronRight,
  CheckCircle2,
  Check,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Clock,
  Phone,
  MessageCircle,
  X,
  Send,
  Zap,
  Play,
  Settings,
  Maximize,
  ShoppingCart,
  Truck,
  CreditCard,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { BOUTIQUE_PRODUCTS, Product } from "@/components/shop/ProductGrid";
import { useRealtimeProducts } from "@/lib/firestore-products";
import { useRealtimeCars } from "@/lib/firestore-cars";
import { useRealtimeHouses } from "@/lib/firestore-houses";

function getLatest20Products(items: Product[]): Product[] {
  if (!items || items.length === 0) return [];
  return [...items]
    .sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
      const timeB = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
      return timeB - timeA;
    })
    .slice(0, 20);
}

interface PillarYouTubeVideo {
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: string;
}

const DEFAULT_PILLAR_VIDEO: PillarYouTubeVideo = {
  youtubeId: "cVSTKKrqKI8",
  title:
    "RABA UKO SEBARUNDI YASHITSE MURI INKEREBUTSI DAY AHEREKEJWE N'UMUTAMBUKANYI WIWE",
  thumbnail: "https://i.ytimg.com/vi/cVSTKKrqKI8/hqdefault.jpg",
  duration: "03:13",
};

export default function FourPillarsSection() {
  const shouldReduceMotion = useReducedMotion();
  // Realtime products from Firestore database
  const { products: allFirestoreProducts } = useRealtimeProducts();
  const { cars: allCars } = useRealtimeCars();
  const { houses: allHouses } = useRealtimeHouses();

  // Realtime YouTube video data from channel
  const [mediaVideo, setMediaVideo] =
    useState<PillarYouTubeVideo>(DEFAULT_PILLAR_VIDEO);

  useEffect(() => {
    async function fetchLiveVideo() {
      try {
        const res = await fetch("/api/youtube");
        if (!res.ok) return;
        const data = await res.json();
        if (
          data.videos &&
          Array.isArray(data.videos) &&
          data.videos.length > 0
        ) {
          const top = data.videos[0];
          setMediaVideo({
            youtubeId: top.youtubeId || "cVSTKKrqKI8",
            title: top.title || DEFAULT_PILLAR_VIDEO.title,
            thumbnail:
              top.thumbnail ||
              `https://i.ytimg.com/vi/${top.youtubeId}/hqdefault.jpg`,
            duration: top.duration || "03:13",
          });
        }
      } catch (err) {
        console.warn("Failed to load YouTube feed in FourPillarsSection:", err);
      }
    }
    fetchLiveVideo();
  }, []);

  // State for Pillar 1 (Rent vs Buy vs Real Estate)
  const [pillar1Tab, setPillar1Tab] = useState<"Rent" | "Buy" | "Real Estate">(
    "Rent",
  );

  const rentCars = React.useMemo(() => allCars.filter((c) => c.rent), [allCars]);
  const saleCars = React.useMemo(() => allCars.filter((c) => c.sales), [allCars]);
  const rentHouses = React.useMemo(() => allHouses.filter((h) => h.rent), [allHouses]);

  const currentPillar1Data = React.useMemo(() => {
    if (pillar1Tab === "Buy") {
      const topSaleCar = saleCars[0] || allCars[0];
      return {
        title: topSaleCar?.title || "Toyota Land Cruiser Prado",
        price: `$${(topSaleCar?.price || 65000).toLocaleString()}`,
        unit: " Buy",
        availability: "Direct Ownership",
        badge: "In Stock",
        image: topSaleCar?.photos?.[0] || topSaleCar?.imageUrl || "/assets/elimi-images/4-pillar-section/PRADO.webp",
        link: topSaleCar ? `/cars/${topSaleCar.id}` : "/cars",
        ctaText: "Explore Vehicles For Sale",
        ctaLink: "/cars",
        checklist: [
          `${saleCars.length > 0 ? saleCars.length : "12+"} Inspected Vehicles in Stock`,
          "Direct Import, Cleared & Certified",
          "Guaranteed Ownership Transfer",
        ],
      };
    }
    if (pillar1Tab === "Real Estate") {
      const topHouse = allHouses[0];
      const isRentHouse = Boolean(topHouse?.rent);
      return {
        title: topHouse?.title || "Executive Residence Villa",
        price: isRentHouse
          ? `$${(topHouse?.rentPrice || 3200).toLocaleString()}`
          : `$${(topHouse?.price ? (topHouse.price >= 1000000 ? `${(topHouse.price / 1000000).toFixed(1)}M` : `${Math.round(topHouse.price / 1000)}k`) : "450k")}`,
        unit: isRentHouse ? "/mo" : " Buy",
        availability: isRentHouse ? "For Long/Short Stay" : "Verified Title",
        badge: isRentHouse ? "For Rent" : "For Sale",
        image: topHouse?.photos?.[0] || topHouse?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
        link: topHouse ? `/houses/${topHouse.id}` : "/houses",
        ctaText: "Explore Real Estate",
        ctaLink: "/houses",
        checklist: [
          `${allHouses.length > 0 ? allHouses.length : "15+"} Prime Villas & Residences`,
          `${rentHouses.length > 0 ? rentHouses.length : "8+"} Short & Long-Stay Rentals`,
          "Full Legal Audit & Secure Verification",
        ],
      };
    }
    // Default: Rent
    const topRentCar = rentCars[0] || allCars[0];
    const minRentPrice = rentCars.length > 0 ? Math.min(...rentCars.map((c) => c.rentPrice || 60)) : 60;
    return {
      title: topRentCar?.title || "Toyota Prado TX-L 2020",
      price: `$${topRentCar?.rentPrice || 60}`,
      unit: "/day",
      availability: "Available Today",
      badge: "Fleet Ready",
      image: topRentCar?.photos?.[0] || topRentCar?.imageUrl || "/assets/elimi-images/4-pillar-section/PRADO.webp",
      link: topRentCar ? `/cars/${topRentCar.id}` : "/cars",
      ctaText: "Explore Rental Fleet",
      ctaLink: "/cars",
      checklist: [
        `${rentCars.length > 0 ? rentCars.length : "20+"} Verified Fleet Vehicles for Rent`,
        `Rates from $${minRentPrice}/day with Chauffeur`,
        "Instant Diplomatic & VIP Booking",
      ],
    };
  }, [pillar1Tab, allCars, saleCars, rentCars, allHouses, rentHouses]);

  const [pillar2Img, setPillar2Img] = useState(
    "/assets/protocol/PROTOCOL_SECTION.webp",
  );

  // Pillar 3 & Pillar 4: Products from Firestore, randomized among the 20 latest uploaded ones on each refresh
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>(() =>
    BOUTIQUE_PRODUCTS.slice(0, 5),
  );
  const [isShufflingShop, setIsShufflingShop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const productsPool =
        allFirestoreProducts && allFirestoreProducts.length > 0
          ? allFirestoreProducts
          : BOUTIQUE_PRODUCTS;
      const latest20 = getLatest20Products(productsPool);
      const shuffled = [...latest20].sort(() => Math.random() - 0.5);
      setShuffledProducts(shuffled.slice(0, 5));
    }, 0);
    return () => clearTimeout(timer);
  }, [allFirestoreProducts]);

  const randomMediaProducts = shuffledProducts.slice(0, 2);
  const randomShopProducts =
    shuffledProducts.slice(2, 5).length === 3
      ? shuffledProducts.slice(2, 5)
      : shuffledProducts.slice(0, 3);

  const shuffleShopProducts = () => {
    setIsShufflingShop(true);
    const productsPool =
      allFirestoreProducts && allFirestoreProducts.length > 0
        ? allFirestoreProducts
        : BOUTIQUE_PRODUCTS;
    const latest20 = getLatest20Products(productsPool);
    const shuffled = [...latest20].sort(() => Math.random() - 0.5);
    setShuffledProducts(shuffled.slice(0, 5));
    setTimeout(() => setIsShufflingShop(false), 200);
  };

  return (
    <section className="w-full bg-[#F2F4F8] py-10 sm:py-12 lg:py-14 px-3 sm:px-4 lg:px-6 text-[#181B25] font-sans antialiased">
      <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0D52FF]/10 text-[#0D52FF] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Core Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#181B25] tracking-tight leading-tight">
            Our Four Strategic Pillars
          </h2>
          <p className="text-[#525866] text-sm sm:text-base leading-relaxed">
            Delivering seamless luxury rentals, turnkey event security, creative
            video production, and verified commerce for Burundi and the
            Diaspora.
          </p>
        </div>

        {/* Grid of Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* ===================================================
              PILLAR 01: Mobility & Living (Hero Card UI)
             =================================================== */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, ease: EMIL_EASINGS.easeOut }}
            className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#F2F4F8] border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 sm:p-7 min-h-[440px] group"
          >
            {/* Background Full-bleed Image */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src={currentPillar1Data.image}
                alt={`${currentPillar1Data.title} - Mobility & Living`}
                fill
                priority
                unoptimized
                referrerPolicy="no-referrer"
                onError={() => {}}
                className="object-cover object-right lg:object-center group-hover:scale-105 transition-transform duration-700"
              />
              {/* Content Overlay Gradient: Left-to-right gradient overlay fading to transparent */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F2F4F8] via-[#F2F4F8]/75 via-45% sm:via-35% to-transparent pointer-events-none" />
            </div>

            {/* Glassmorphism Floating Card (Top-Right) */}
            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 hidden sm:block">
              <div className="bg-white/85 backdrop-blur-[12px] border border-white/60 rounded-[18px] p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] w-[190px] sm:w-[200px] space-y-1.5">
                <div className="text-[#181B25] text-[11px] font-medium tracking-tight truncate">
                  {currentPillar1Data.title}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-[#181B25] tracking-tight">
                    {currentPillar1Data.price}
                  </span>
                  <span className="text-[13px] font-normal text-[#525866]">
                    {currentPillar1Data.unit}
                  </span>
                </div>
                <Link
                  href={currentPillar1Data.link}
                  className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] active:scale-95 text-white text-[11px] font-semibold py-[5px] px-[14px] rounded-full shadow-sm transition-all text-center block mt-1.5 cursor-pointer"
                >
                  {currentPillar1Data.availability}
                </Link>
              </div>
            </div>

            {/* Left Column Content */}
            <div className="relative z-10 max-w-[270px] sm:max-w-xs lg:max-w-[280px] xl:max-w-xs space-y-4">
              {/* Header Badge */}
              <div className="w-[36px] h-[36px] min-w-[36px] min-h-[36px] rounded-xl bg-[#0D52FF] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                01
              </div>

              {/* Hierarchy */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#181B25]">
                  PILLAR 1
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-[#181B25] tracking-tight leading-tight truncate sm:whitespace-normal">
                  Mobility & Living
                </h3>
                <p className="text-[#525866] text-xs sm:text-sm leading-relaxed">
                  Vehicles for rent or sale. Find your perfect ride or dream
                  home.
                </p>
              </div>

              {/* Sub-Navigation Row */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <button
                  onClick={() => setPillar1Tab("Rent")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all ${
                    pillar1Tab === "Rent"
                      ? "bg-[#0D52FF] text-white shadow-sm"
                      : "bg-white/60 hover:bg-white/90 backdrop-blur-md text-[#181B25] border border-white/50"
                  }`}
                >
                  Rent
                </button>
                <button
                  onClick={() => setPillar1Tab("Buy")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all ${
                    pillar1Tab === "Buy"
                      ? "bg-[#0D52FF] text-white shadow-sm"
                      : "bg-white/60 hover:bg-white/90 backdrop-blur-md text-[#181B25] border border-white/50"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setPillar1Tab("Real Estate")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all ${
                    pillar1Tab === "Real Estate"
                      ? "bg-[#0D52FF] text-white shadow-sm"
                      : "bg-white/60 hover:bg-white/90 backdrop-blur-md text-[#181B25] border border-white/50"
                  }`}
                >
                  Real Estate
                </button>
              </div>

              {/* Bullet Checklist with AnimatePresence */}
              <div className="min-h-[76px] pt-0.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pillar1Tab}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EMIL_EASINGS.easeOut }}
                    className="space-y-2"
                  >
                    {currentPillar1Data.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#0D52FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                        <span className="text-xs font-semibold text-[#181B25]" suppressHydrationWarning>
                          {item}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Primary Dynamic CTA */}
              <div className="pt-1">
                <Link
                  href={currentPillar1Data.ctaLink}
                  className="bg-white hover:bg-slate-50 active:scale-95 text-[#181B25] font-extrabold rounded-full py-3 px-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] border border-slate-100/80 transition-all flex items-center gap-2.5 text-xs group/btn cursor-pointer"
                >
                  <Car className="w-4 h-4 shrink-0" />
                  <span>{currentPillar1Data.ctaText}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#0D52FF] group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Mobile Glassmorphism Floating Card */}
            <div className="sm:hidden relative z-10 mt-4">
              <div className="bg-white/85 backdrop-blur-[12px] border border-white/50 rounded-[18px] p-3.5 shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[#181B25] text-xs font-medium truncate max-w-[150px]">
                    {currentPillar1Data.title}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-[#181B25]">
                      {currentPillar1Data.price}
                    </span>
                    <span className="text-xs text-[#525866]">{currentPillar1Data.unit}</span>
                  </div>
                </div>
                <Link
                  href={currentPillar1Data.link}
                  className="bg-[#0D52FF] active:scale-95 transition-transform text-white text-xs font-semibold py-1.5 px-3.5 rounded-full shadow-sm"
                >
                  {currentPillar1Data.availability}
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ===================================================
              PILLAR 02: Turnkey Event Bundles
             =================================================== */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, delay: shouldReduceMotion ? 0 : 0.08, ease: EMIL_EASINGS.easeOut }}
            className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#F2F4F8] border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 sm:p-7 min-h-[440px] group"
          >
            {/* Background Full-bleed Image */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src={pillar2Img}
                alt="Turnkey Event Bundles - Protocol Team"
                fill
                priority
                unoptimized
                referrerPolicy="no-referrer"
                onError={() =>
                  setPillar2Img(
                    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
                  )
                }
                className="object-cover object-right lg:object-center group-hover:scale-105 transition-transform duration-700"
              />
              {/* Left Side Gradient Overlay for Typography Contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F2F4F8] via-[#F2F4F8]/75 via-45% sm:via-35% to-transparent pointer-events-none" />
            </div>

            {/* Left Content Block */}
            <div className="relative z-10 max-w-[270px] sm:max-w-xs lg:max-w-[280px] xl:max-w-xs space-y-4">
              {/* Badge: 36x36px rounded-xl square in #0D52FF */}
              <div className="hidden sm:flex w-[36px] h-[36px] min-w-[36px] min-h-[36px] rounded-xl bg-[#0D52FF] text-white font-extrabold text-sm items-center justify-center shadow-md">
                02
              </div>

              {/* Hierarchy */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#181B25]">
                  PILLAR 2
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#181B25] tracking-tight leading-tight">
                  Turnkey Event Bundles
                </h3>
                <p className="text-[#525866] text-xs sm:text-sm leading-relaxed">
                  Everything you need for unforgettable events.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-2 pt-0.5">
                {[
                  "VIP Fleets",
                  "Protocol Staff",
                  "Catering",
                  "Photography & Video",
                  "Printing & More",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D52FF] fill-[#0D52FF] text-white shrink-0" />
                    <span className="text-xs font-semibold text-[#181B25]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-1">
                <Link
                  href="/#build-event"
                  className="bg-[#0D52FF] hover:bg-[#0B44D8] active:scale-95 text-white font-bold rounded-full py-3 px-5 shadow-sm transition-all flex items-center gap-2 text-xs group/btn cursor-pointer"
                >
                  <span>Configure Your Package</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Floating Bottom Stats Pill */}
            <div className="relative z-10 pt-4 mt-auto w-full">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.06)] grid grid-cols-3 divide-x divide-slate-100">
                {/* Column 1 */}
                <div className="flex flex-col items-center text-center px-1">
                  <Car className="w-4 h-4 text-[#181B25] mb-1" />
                  <div className="text-[11px] font-bold text-[#181B25] leading-tight">
                    VIP Vehicles
                  </div>
                  <div className="text-[10px] text-[#525866]">
                    Premium Fleet
                  </div>
                </div>
                {/* Column 2 */}
                <div className="flex flex-col items-center text-center px-1">
                  <Users className="w-4 h-4 text-[#0D52FF] mb-1" />
                  <div className="text-[11px] font-bold text-[#181B25] leading-tight">
                    Protocol Staff
                  </div>
                  <div className="text-[10px] text-[#525866]">
                    Trained & Elegant
                  </div>
                </div>
                {/* Column 3 */}
                <div className="flex flex-col items-center text-center px-1">
                  <Calendar className="w-4 h-4 text-[#0D52FF] mb-1" />
                  <div className="text-[11px] font-bold text-[#181B25] leading-tight">
                    Events Managed
                  </div>
                  <div className="text-[10px] text-[#525866]">500+</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Row: Asymmetric 2-Column Grid (Pillar 3: 34% | Pillar 4: 66% for wide desktop cards) */}
          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-[34%_1fr] gap-4 lg:gap-5 items-stretch">
            {/* ===================================================
                PILLAR 03: Elimi Média (Dark Navy Card UI)
               =================================================== */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, delay: shouldReduceMotion ? 0 : 0.12, ease: EMIL_EASINGS.easeOut }}
              className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#141A29] border border-white/10 p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-5 text-white shadow-xl group h-full"
            >
              {/* Ambient Radial Gradient Top-Right */}
              <div
                className="absolute top-0 right-0 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] pointer-events-none rounded-full z-0"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(13,82,255,0.22), transparent 60%)",
                }}
              />

              {/* TOP SECTION: BRANDING & ENLARGED VIDEO PLAYER */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-center">
                {/* Left Column (Info) */}
                <div className="space-y-3.5">
                  {/* Badge: 36x36px rounded-xl square in primary blue (#0D52FF) with centered white text "03" */}
                  <div className="w-[36px] h-[36px] min-w-[36px] min-h-[36px] rounded-xl bg-[#0D52FF] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    03
                  </div>

                  {/* Hierarchy */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      PILLAR 3
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      Elimi Média
                    </h3>
                    <p className="text-[#94A3B8] text-xs leading-relaxed max-w-xs">
                      Watch. Enjoy. Discover. Entertainment that connects you to
                      what matters.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-1">
                    <Link
                      href={`/media/watch/${mediaVideo.youtubeId}`}
                      className="bg-[#0D52FF] hover:bg-[#0B44D8] active:scale-95 text-white font-extrabold rounded-full py-2.5 px-5 transition-all inline-flex items-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer group/btn"
                    >
                      <Play className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                      <span>Watch Now</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-1 transition-transform shrink-0" />
                    </Link>
                  </div>
                </div>

                {/* Right Column (Enlarged Video Player Frame) */}
                <Link
                  href={`/media/watch/${mediaVideo.youtubeId}`}
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-lg w-full h-[180px] sm:h-[210px] lg:h-[230px] flex items-center justify-center group/player block cursor-pointer active:scale-[0.99] transition-transform"
                >
                  {/* Video Thumbnail Image with YouTube realtime data */}
                  <Image
                    src={mediaVideo.thumbnail}
                    alt={mediaVideo.title}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover rounded-2xl group-hover/player:scale-105 transition-transform duration-500"
                  />

                  {/* Dark overlay for contrast */}
                  <div className="absolute inset-0 bg-black/30 group-hover/player:bg-black/20 transition-colors pointer-events-none rounded-2xl" />

                  {/* Play Overlay Button */}
                  <div
                    className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-[#0D52FF] flex items-center justify-center shadow-2xl group-hover/player:scale-110 active:scale-95 transition-transform"
                    aria-label="Play Video"
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-[#0D52FF] text-[#0D52FF] ml-0.5" />
                  </div>

                  {/* Video Control Bar */}
                  <div className="absolute bottom-0 inset-x-0 z-10 bg-black/70 backdrop-blur-md px-3.5 py-2 flex items-center gap-2 text-white text-xs border-t border-white/10 rounded-b-[15px]">
                    <div className="hover:text-[#0D52FF] transition-colors">
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                    <span className="text-[10px] font-mono font-medium text-white/90">
                      {mediaVideo.duration}
                    </span>

                    {/* Timeline slider */}
                    <div className="flex-1 h-1.5 bg-white/30 rounded-full relative overflow-hidden">
                      <div className="h-full bg-[#0D52FF] rounded-full w-2/5" />
                    </div>

                    <div
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="Video settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="Fullscreen video"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* BOTTOM SECTION: QUICK-SHOP MICRO-CARDS (Horizontal 2-column grid on mobile & tablet) */}
              <div
                suppressHydrationWarning
                className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1"
              >
                {(randomMediaProducts && randomMediaProducts.length >= 2
                  ? randomMediaProducts.slice(0, 2)
                  : BOUTIQUE_PRODUCTS.slice(0, 2)
                ).map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="bg-white/[0.06] hover:bg-white/[0.09] active:scale-[0.98] border border-white/[0.08] rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 transition-all shadow-sm min-w-0 group cursor-pointer"
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 min-w-[40px] sm:min-w-[48px] md:min-w-[56px] min-h-[40px] sm:min-h-[48px] md:min-h-[56px] rounded-xl overflow-hidden shrink-0 bg-slate-800">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col justify-center space-y-0.5 min-w-0 flex-1">
                      <h4 className="text-white font-bold text-[11px] sm:text-xs truncate group-hover:text-blue-300 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-white font-extrabold text-[11px] sm:text-xs whitespace-nowrap">
                        {product.priceBIF
                          ? `${product.priceBIF.toLocaleString()} BIF`
                          : `$${product.priceUSD || 0}`}
                      </p>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0D52FF] text-white flex items-center justify-center shrink-0 ml-auto shadow-sm">
                      <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* ===================================================
                PILLAR 04: Elimi Shop
               =================================================== */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: shouldReduceMotion ? 0.15 : 0.4, delay: shouldReduceMotion ? 0 : 0.16, ease: EMIL_EASINGS.easeOut }}
              className="bg-gradient-to-br from-[#EBF2FF] via-[#F2F6FF] to-[#EEF4FE] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 lg:p-7 border border-[#0D52FF]/15 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group w-full h-full"
            >
              {/* Top Row: Left compact header block and Right spacious product card grid */}
              <div className="grid grid-cols-1 md:grid-cols-[135px_1fr] lg:grid-cols-[135px_1fr] xl:grid-cols-[145px_1fr] gap-4 sm:gap-5 items-center">
                {/* Left Compact Branding & CTA Header Block */}
                <div className="space-y-3">
                  {/* Badge: 36x36px rounded-xl square in primary blue (#0D52FF) with centered bold white text "04" */}
                  <div className="w-[36px] h-[36px] min-w-[36px] min-h-[36px] rounded-xl bg-[#0D52FF] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    04
                  </div>

                  {/* Typography */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#525866]">
                      PILLAR 4
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#181B25] tracking-tight leading-tight">
                      Elimi Shop
                    </h3>
                    <p className="text-[#525866] text-xs leading-relaxed">
                      Shop fashion, tech, & local favorites.
                    </p>
                  </div>

                  {/* CTA Button & Shuffle Button */}
                  <div className="pt-0.5 flex flex-wrap items-center gap-2">
                    <Link
                      href="/shop"
                      className="bg-[#0D52FF] hover:bg-[#0B44D8] active:scale-95 text-white font-extrabold rounded-full py-2 px-3.5 sm:px-4 shadow-md transition-all flex items-center gap-1.5 text-xs cursor-pointer group/btn w-fit whitespace-nowrap"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Shop Now</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-1 transition-transform shrink-0" />
                    </Link>

                    <button
                      onClick={shuffleShopProducts}
                      disabled={isShufflingShop}
                      className="bg-white hover:bg-slate-50 text-[#181B25] border border-slate-200/80 p-2 rounded-full shadow-xs transition-transform active:scale-95 cursor-pointer"
                      title="Fresh random products"
                      aria-label="Refresh random products"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isShufflingShop ? "animate-spin text-[#0D52FF]" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Right Product Cards: Single scrollable row on mobile & tablet, 3-column grid on desktop (lg+) */}
                <div
                  suppressHydrationWarning
                  className="flex overflow-x-auto no-scrollbar pb-2 pt-1 gap-3 sm:gap-4 snap-x snap-mandatory min-w-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 lg:pt-0 lg:gap-5"
                >
                  {(randomShopProducts.length > 0
                    ? randomShopProducts
                    : BOUTIQUE_PRODUCTS.slice(0, 3)
                  ).map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.id}`}
                      className="shrink-0 w-[170px] sm:w-[220px] md:w-[230px] lg:w-auto snap-start bg-white rounded-[22px] p-3 sm:p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-lg active:scale-[0.98] transition-all flex flex-col justify-between space-y-2.5 sm:space-y-3.5 h-full group/card min-w-0 cursor-pointer"
                    >
                      {/* Centered product photo wrapper */}
                      <div className="w-full aspect-square sm:aspect-square md:h-[130px] lg:h-[140px] xl:h-[150px] relative flex items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#F8FAFC] overflow-hidden shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-contain p-1 group-hover/card:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <h4 className="text-[#181B25] group-hover/card:text-[#0D52FF] font-bold text-xs sm:text-sm leading-snug min-h-[30px] sm:min-h-[34px] flex items-center line-clamp-2 transition-colors">
                          {product.name}
                        </h4>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 text-[11px]">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= Math.floor(product.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-neutral-200 fill-neutral-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-neutral-500 font-medium text-[10px] sm:text-[11px]">
                            {(product.rating || 5).toFixed(1)}/5
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row (Price & ShoppingCart Action Button) */}
                      <div className="flex items-center justify-between pt-1 gap-2 min-w-0 mt-auto">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[#0D52FF] font-black text-xs sm:text-[13px] tracking-tight whitespace-nowrap">
                            {product.priceBIF
                              ? `${product.priceBIF.toLocaleString()} BIF`
                              : `$${product.priceUSD || 0}`}
                          </span>
                          {product.priceUSD && (
                            <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                              ~ ${product.priceUSD.toFixed(0)} USD
                            </span>
                          )}
                        </div>
                        <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 min-w-[32px] min-h-[32px] rounded-full border border-[#0D52FF]/20 hover:border-[#0D52FF] bg-[#0D52FF]/5 hover:bg-[#0D52FF] text-[#0D52FF] hover:text-white flex items-center justify-center transition-all shrink-0">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Full-width white trust banner pill container */}
              <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-200/60 mt-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                  {/* Item 1 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#0D52FF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-bold text-[#181B25] truncate">
                        Authentic Products
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#525866] truncate">
                        Quality Guaranteed
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-[#0D52FF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-bold text-[#181B25] truncate">
                        Fast Delivery
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#525866] truncate">
                        Across Burundi
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-[#0D52FF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-bold text-[#181B25] truncate">
                        Secure Payments
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#525866] truncate">
                        Mobile Money
                      </div>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center shrink-0">
                      <RotateCcw className="w-4 h-4 text-[#0D52FF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-bold text-[#181B25] truncate">
                        Easy Returns
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-[#525866] truncate">
                        Hassle Free
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
