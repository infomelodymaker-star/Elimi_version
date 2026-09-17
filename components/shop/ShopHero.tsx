'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shirt, Smartphone, Gem, ChevronLeft, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';

interface ShopHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSearchSubmit?: () => void;
}

const CATEGORY_SHOWCASES = [
  {
    id: 'Fashion',
    title: 'Fashion & Luxury',
    subtitle: 'Designer Suits, Handbags & Shoes',
    image: '/assets/shop/cat_fashion.jpg',
    badgeBg: 'bg-[#0D52FF]',
    textColor: 'text-[#0D52FF]',
  },
  {
    id: 'Electronics',
    title: 'Tech & Devices',
    subtitle: '4K Drones, Smartphones & Audio',
    image: '/assets/shop/cat_tech.jpg',
    badgeBg: 'bg-[#0A2351]',
    textColor: 'text-[#0A2351]',
  },
  {
    id: 'Cultural',
    title: 'Cultural Heritage',
    subtitle: 'Handwoven Agaseke & Royal Drums',
    image: '/assets/shop/cat_cultural.jpg',
    badgeBg: 'bg-amber-600',
    textColor: 'text-amber-600',
  },
  {
    id: 'Nails & Beauty',
    title: 'Nails & Beauty',
    subtitle: 'Salon Gel Kits & Organic Skincare',
    image: '/assets/shop/cat_beauty.jpg',
    badgeBg: 'bg-rose-600',
    textColor: 'text-rose-600',
  },
];

export default function ShopHero({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSearchSubmit,
}: ShopHeroProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-slide effect fading in and out one by one into view
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % CATEGORY_SHOWCASES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const activeShowcase = CATEGORY_SHOWCASES[currentSlideIndex];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 space-y-4">
      {/* Hero Banner Container with Background Image */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full rounded-2xl border border-[#0F172A]/8 overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] p-8 md:p-10 min-h-[380px] lg:min-h-[420px] flex flex-col justify-center bg-white"
      >
        {/* Banner Background Image with soft gradient overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/shop/hero-gradient-bg.jpg"
            alt="Elimi Boutique Banner Gradient Background"
            fill
            priority
            unoptimized
            referrerPolicy="no-referrer"
            className="object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Copy & Search */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1 rounded-full text-xs font-bold tracking-tight border border-[#0B57FF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-pulse" />
              <span>Welcome to Elimi Shop</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0F172A] tracking-[-0.03em] leading-[1.15]">
              Discover{' '}
              <span className="text-[#0B57FF]">Fashion</span>,{' '}
              <span className="text-[#0B57FF]">Tech</span>,{' '}
              <span className="text-[#0B57FF]">Cultural Craft</span>{' '}
              &amp; <span className="text-[#0B57FF]">Beauty</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#64748B] text-sm font-normal leading-relaxed max-w-lg border-l-2 border-[#0B57FF] pl-4">
              Quality products from trusted sellers. Fast delivery across Burundi and diaspora communities worldwide.
            </p>

            {/* Integrated Search Input Bar (Desktop Only - Mobile/Tablet search is placed right above product grid) */}
            <div className="pt-1 max-w-xl hidden lg:block">
              <div className="bg-white rounded-full p-1.5 sm:p-2 border border-[#0F172A]/10 shadow-[0_4px_20px_-4px_rgba(11,87,255,0.08)] flex items-center gap-2 transition-all focus-within:border-[#0B57FF] focus-within:ring-2 focus-within:ring-[#0B57FF]/20">
                <div className="pl-3.5 text-[#64748B] shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search clothes, phones, crafts, nail kits..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onSearchSubmit}
                  className="bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-full shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Right Sliding Transparent Image Showcase (Fade In and Out One by One) */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end min-h-[260px] sm:min-h-[300px]">
            <div className="relative w-full max-w-md h-[250px] sm:h-[290px] lg:h-[320px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeShowcase.id}
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  onClick={() => setSelectedCategory(activeShowcase.id)}
                  className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group"
                >
                  {/* Category Image */}
                  <div className="relative w-full h-[200px] sm:h-[230px] mix-blend-multiply filter drop-shadow-xl transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={activeShowcase.image}
                      alt={activeShowcase.title}
                      fill
                      priority
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-contain object-center"
                    />
                  </div>

                  {/* Category Floating Tag Pill */}
                  <div className="mt-2 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#0F172A]/8 shadow-sm flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${activeShowcase.badgeBg} animate-ping`} />
                    <span className={`text-xs font-bold tracking-tight text-[#0F172A]`}>
                      {activeShowcase.title}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      ({activeShowcase.subtitle})
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Dots Indicator */}
              <div className="absolute -bottom-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-[#0F172A]/8 shadow-xs">
                {CATEGORY_SHOWCASES.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-5 bg-[#0B57FF]'
                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Show ${item.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

