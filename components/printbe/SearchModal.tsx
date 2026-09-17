'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Search, X, ArrowRight, Printer } from 'lucide-react';
import { Product } from './types';
import { initialProducts } from './ProductsSection';
import { EMIL_SPRINGS, EMIL_EASINGS } from '@/lib/motion-constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const results = initialProducts.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: EMIL_EASINGS.subtle }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 }}
            transition={shouldReduceMotion ? { duration: 0 } : {
              ...EMIL_SPRINGS.snappy,
              opacity: { duration: 0.18, ease: EMIL_EASINGS.subtle },
            }}
            className="bg-white text-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 relative overflow-hidden z-10"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
              <Search className="w-5 h-5 text-indigo-600" />
              <input
                type="text"
                autoFocus
                placeholder="Search custom products (e.g., Mug, Hoodie, Sticker, Tote)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-base font-semibold focus:outline-none text-slate-900 placeholder-slate-400"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 active:scale-95 transition-transform"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {results.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No matching custom print items found.</p>
              ) : (
                results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(p);
                    }}
                    className="p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-200 transition-colors group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-slate-100 rounded-xl p-1" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-500">{p.priceRange} • {p.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
