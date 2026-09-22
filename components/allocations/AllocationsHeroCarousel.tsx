'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';

export interface AllocationSlide {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl: string;
  badge?: string;
}

interface AllocationsHeroCarouselProps {
  slides?: AllocationSlide[];
  autoPlayInterval?: number;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackBadge?: string;
  className?: string;
}

const DEFAULT_SLIDES: AllocationSlide[] = [
  {
    id: 'slide-1',
    title: 'Tenues de bureau',
    subtitle: 'Costumes modernes, tailleurs fluides et chemises structurées pour une élégance professionnelle affirmée.',
    buttonText: 'Découvrir la sélection',
    buttonLink: '#catalog-section',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1920',
  },
  {
    id: 'slide-2',
    title: 'Le soir & Gala',
    subtitle: 'Robes de cocktail spectaculaires, fentes sensuelles et costumes sur-mesure pour vos soirées.',
    buttonText: 'Découvrir la sélection',
    buttonLink: '#catalog-section',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1920',
  },
  {
    id: 'slide-3',
    title: 'Romance bohème',
    subtitle: 'Coupes fluides, broderies fines et mailles douces pour vos célébrations et événements.',
    buttonText: 'Découvrir la sélection',
    buttonLink: '#catalog-section',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1920',
  },
  {
    id: 'slide-4',
    title: 'Week-end off',
    subtitle: 'Vestes confortables, pièces décontractées et tenues chics pour vos escapades.',
    buttonText: 'Découvrir la sélection',
    buttonLink: '#catalog-section',
    imageUrl: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&q=80&w=1920',
  },
];

export default function AllocationsHeroCarousel({
  slides: propSlides,
  autoPlayInterval = 5000,
  fallbackTitle,
  fallbackSubtitle,
  fallbackBadge,
  className = '',
}: AllocationsHeroCarouselProps) {
  const activeSlides: AllocationSlide[] = React.useMemo(() => {
    if (propSlides && propSlides.length > 0) {
      return propSlides;
    }
    if (fallbackTitle) {
      return [
        {
          id: 'slide-fallback',
          title: fallbackTitle,
          subtitle: fallbackSubtitle || '',
          buttonText: 'Découvrir le catalogue',
          buttonLink: '#catalog',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1920',
          badge: fallbackBadge,
        },
      ];
    }
    return DEFAULT_SLIDES;
  }, [propSlides, fallbackTitle, fallbackSubtitle, fallbackBadge]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);

  const total = activeSlides.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || isHovered || total <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, total, autoPlayInterval, nextSlide]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handleScrollToCatalog = (e: React.MouseEvent<HTMLAnchorElement>, link?: string) => {
    if (!link || link === '#catalog') {
      e.preventDefault();
      const catalogEl = document.getElementById('catalog-section') || document.getElementById('catalog-search-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      id="allocations-hero-carousel"
      className={`relative w-full overflow-hidden bg-slate-950 select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full-width Hero Container */}
      <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] lg:h-[660px]">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={currentSlide.id || currentIndex}
            custom={direction}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image - Full Bleed */}
            <Image
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              fill
              priority={currentIndex === 0}
              className="object-cover object-[center_35%] md:object-[center_30%]"
              referrerPolicy="no-referrer"
              sizes="100vw"
            />

            {/* Subtle Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/35" />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        </AnimatePresence>

        {/* Centered Editorial Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 pt-16 sm:pt-20 pointer-events-none">
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {/* Display Headline: Polished geometric sans, clean one-line single sentence reflecting categories */}
            <motion.h1
              key={`title-${currentSlide.id || currentIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-sans font-black text-white text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] truncate max-w-full px-2"
            >
              {currentSlide.title}
            </motion.h1>

            {/* Subtitle with font-sans */}
            {currentSlide.subtitle && (
              <motion.p
                key={`sub-${currentSlide.id || currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="font-sans text-xs sm:text-sm md:text-base text-white/90 max-w-xl mx-auto font-medium leading-relaxed drop-shadow-md line-clamp-2 px-2"
              >
                {currentSlide.subtitle}
              </motion.p>
            )}

            {/* Call to Action Pill Button (Deep Burgundy Pill matching reference) */}
            <motion.div
              key={`btn-${currentSlide.id || currentIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="pt-1.5 sm:pt-2 pointer-events-auto"
            >
              <Link
                href={currentSlide.buttonLink || '#catalog-section'}
                onClick={(e) => handleScrollToCatalog(e, currentSlide.buttonLink)}
                className="inline-flex items-center justify-center px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-[#85112B] hover:bg-[#6e0d23] active:bg-[#520a1a] text-white font-sans text-xs sm:text-sm md:text-base font-bold tracking-wide shadow-[0px_8px_30px_rgba(133,17,43,0.4)] hover:shadow-[0px_12px_36px_rgba(133,17,43,0.5)] active:scale-95 transition-all duration-200 cursor-pointer border border-white/15"
              >
                <span>{currentSlide.buttonText || 'Découvrir la sélection'}</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Left Navigation Arrow (Translucent frosted glass squircle - Hidden on Mobile, Visible on Desktop lg:) */}
        {total > 1 && (
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide précédente"
            className="hidden lg:flex absolute left-6 xl:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-white/45 hover:bg-white/80 active:scale-90 backdrop-blur-md text-[#7c142c] hover:text-[#520d1d] border border-white/50 shadow-xl items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 xl:w-7 xl:h-7 stroke-[2.5]" />
          </button>
        )}

        {/* Right Navigation Arrow (Translucent frosted glass squircle - Hidden on Mobile, Visible on Desktop lg:) */}
        {total > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide suivante"
            className="hidden lg:flex absolute right-6 xl:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-white/45 hover:bg-white/80 active:scale-90 backdrop-blur-md text-[#7c142c] hover:text-[#520d1d] border border-white/50 shadow-xl items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 xl:w-7 xl:h-7 stroke-[2.5]" />
          </button>
        )}

        {/* Bottom Right: Play / Pause Control Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Mettre en pause' : 'Reprendre le défilement'}
            title={isPlaying ? 'Pause' : 'Play'}
            className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/80 hover:bg-white active:scale-90 backdrop-blur-md text-slate-900 border border-white/60 shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-slate-900 text-slate-900" />
            ) : (
              <Play className="w-4 h-4 fill-slate-900 text-slate-900 ml-0.5" />
            )}
          </button>
        )}

        {/* Bottom Center: Slide Indicators */}
        {total > 1 && (
          <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Aller à la slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
