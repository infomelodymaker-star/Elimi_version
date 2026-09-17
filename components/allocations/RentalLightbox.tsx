'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface RentalLightboxProps {
  photos: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  modelInfo?: string;
}

export default function RentalLightbox({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  title = '',
  modelInfo = 'Emma , 170cm, taille S/M',
}: RentalLightboxProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToPhoto = (index: number) => {
    setActivePhotoIndex(index);
    photoRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Scroll to initial index on open
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow render
      const timer = setTimeout(() => {
        setActivePhotoIndex(initialIndex);
        if (photoRefs.current[initialIndex]) {
          photoRefs.current[initialIndex]?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation & Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        scrollToPhoto(Math.max(0, activePhotoIndex - 1));
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        scrollToPhoto(Math.min(photos.length - 1, activePhotoIndex + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activePhotoIndex, photos.length, onClose]);

  // Track which photo is in view while scrolling
  const handleScroll = () => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.scrollTop;
    const offset = 200;

    for (let i = 0; i < photos.length; i++) {
      const el = photoRefs.current[i];
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (containerTop >= top - offset && containerTop < top + height - offset) {
          setActivePhotoIndex(i);
          break;
        }
      }
    }
  };

  if (!isOpen || photos.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="fixed inset-0 z-[100] bg-[#F5F5F3] overflow-y-auto overflow-x-hidden select-none scroll-smooth"
    >
      {/* Top-Right "FERMER" Button - Pure elegant text without unnecessary X indicator matching image.png */}
      <div className="fixed top-4 sm:top-6 right-5 sm:right-10 z-50">
        <button
          type="button"
          onClick={onClose}
          className="text-xs sm:text-sm font-semibold text-neutral-800 hover:text-black uppercase tracking-widest cursor-pointer px-3 py-1.5 transition-all select-none hover:opacity-80 active:scale-95"
          aria-label="Fermer la vue plein écran"
        >
          FERMER
        </button>
      </div>

      {/* Fixed Left Vertical Thumbnails on Desktop (Matches image.png exactly) */}
      {photos.length > 1 && (
        <div className="hidden md:flex fixed left-5 sm:left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 max-h-[80vh] overflow-y-auto p-1 scrollbar-none">
          {photos.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToPhoto(idx)}
              className={`relative w-14 sm:w-16 h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer shadow-sm ${
                activePhotoIndex === idx
                  ? 'border-white ring-2 ring-neutral-900 scale-105 opacity-100'
                  : 'border-white/70 opacity-70 hover:opacity-100 hover:border-white'
              }`}
            >
              <Image
                src={p}
                alt={`Miniature ${idx + 1}`}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fixed Model Information Pill at Bottom-Right (Matches image.png) */}
      {modelInfo && (
        <div className="fixed bottom-4 sm:bottom-6 right-5 sm:right-10 z-40 px-3 py-1 rounded bg-white/80 backdrop-blur-xs text-[11px] sm:text-xs font-medium text-neutral-800 shadow-xs border border-neutral-200/50 pointer-events-none tracking-tight">
          {modelInfo}
        </div>
      )}

      {/* Continuous Vertical Feed of Full-Width High-Res Images
          Covers the ENTIRE screen width (100vw / w-full) without stretching,
          with automatic height maintaining the original image aspect ratio. */}
      <div className="w-full flex flex-col items-center py-0 px-0 m-0">
        {photos.map((photoUrl, index) => (
          <div
            key={index}
            id={`lightbox-photo-${index}`}
            ref={(el) => {
              photoRefs.current[index] = el;
            }}
            className="w-full max-w-none relative flex flex-col items-center justify-start bg-[#F5F5F3] select-none"
          >
            {/* Native img tag ensures 100% viewport width without stretching, automatic natural height */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`${title || 'Closet'} photo ${index + 1}`}
              className="w-full h-auto block object-cover select-none pointer-events-none"
              style={{ width: '100%', height: 'auto', display: 'block', maxWidth: 'none' }}
              loading={index <= 1 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
