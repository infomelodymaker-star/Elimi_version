'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react';
import { EMIL_SPRINGS, EMIL_EASINGS } from '@/lib/motion-constants';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title?: string;
  categoryBadge?: string;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title,
  categoryBadge,
}: ImageLightboxModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const total = images.length;
  const safeIndex = total > 0 ? (currentIndex + total) % total : 0;
  const currentImage = images[safeIndex] || '';

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      onIndexChange((safeIndex - 1 + total) % total);
    },
    [safeIndex, total, onIndexChange]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      onIndexChange((safeIndex + 1) % total);
    },
    [safeIndex, total, onIndexChange]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (total > 1) {
          onIndexChange((safeIndex - 1 + total) % total);
        }
      } else if (e.key === 'ArrowRight') {
        if (total > 1) {
          onIndexChange((safeIndex + 1) % total);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, safeIndex, total, onClose, onIndexChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="image-lightbox-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: EMIL_EASINGS.subtle }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between items-center p-3 sm:p-6 select-none"
        >
          {/* Top Header Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl flex items-center justify-between text-white py-2 px-1 z-10"
          >
            <div className="flex items-center gap-3">
              {categoryBadge && (
                <span className="text-xs font-semibold uppercase tracking-wider bg-[#0D52FF] text-white px-2.5 py-1 rounded-md">
                  {categoryBadge}
                </span>
              )}
              {title && (
                <h3 className="font-medium text-sm sm:text-base text-gray-200 truncate max-w-[220px] sm:max-w-md">
                  {title}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs sm:text-sm font-medium text-gray-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {safeIndex + 1} / {total}
              </span>
              <button
                id="close-lightbox-button"
                type="button"
                onClick={onClose}
                aria-label="Close image gallery"
                className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Main Image Area with Left/Right Navigation */}
          <div className="relative w-full max-w-6xl flex-grow flex items-center justify-center my-2 sm:my-4 overflow-hidden">
            {/* Previous Button */}
            {total > 1 && (
              <button
                id="lightbox-prev-button"
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer border border-white/20 active:scale-95 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Centered Image with smooth slide/fade transition */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[72vh] sm:max-h-[78vh] max-w-full flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={safeIndex}
                  src={currentImage}
                  alt={title ? `${title} photo ${safeIndex + 1}` : `Gallery photo ${safeIndex + 1}`}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                  transition={shouldReduceMotion ? { duration: 0 } : {
                    duration: 0.2,
                    ease: EMIL_EASINGS.subtle,
                  }}
                  className="max-h-[72vh] sm:max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
                />
              </AnimatePresence>
            </div>

            {/* Next Button */}
            {total > 1 && (
              <button
                id="lightbox-next-button"
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer border border-white/20 active:scale-95 shadow-lg"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl overflow-x-auto py-2 px-2 flex items-center justify-center gap-2 sm:gap-3 scrollbar-none z-10"
          >
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => onIndexChange(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-150 cursor-pointer active:scale-95 ${
                  idx === safeIndex
                    ? 'ring-2 sm:ring-3 ring-[#0D52FF] scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-85 border border-white/20'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
