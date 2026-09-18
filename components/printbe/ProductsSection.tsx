'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, Star, Plus } from 'lucide-react';
import { Product } from './types';

interface ProductsSectionProps {
  onSelectProduct: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
  content?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
}

export const initialProducts: Product[] = [
  {
    id: 'prod-mug',
    name: 'Photo Mug',
    category: 'Promotional',
    priceRange: '$14.00 - $20.00',
    minPrice: 14.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO-eyAFhEWpLIVxkg-C2VnqFKDE4fCyd_cVNrxlK6ILS7d160epmf2dyousKV7rw5Ztt9tgwzq2g8gADA204NMhylEAvVegJPdK0rZd2OuHOozsyAQL-cWt2sYP71RZXQLYI1R3HgbkO6_T0lMqeCJE3l4Hy40qnxhgX9iAiow9G9N9RL90lXIq3Y2A-G3SJVbsOn-WEZJkB2_v2FMuO9konkUu0TnioDO3Ws4SXChUJ3QeL9erC_E',
    description: 'Custom ceramic photo mug with dishwasher-safe dye sublimation print. Vibrant full-wrap printing.',
    badge: 'Best Seller',
    options: {
      finishes: ['Glossy Ceramic', 'Matte Finish', 'Color Changing Magic'],
      quantities: [10, 25, 50, 100, 250],
    },
  },
  {
    id: 'prod-hoodie',
    name: 'Hoodie',
    category: 'Apparel',
    priceRange: '$35.00 - $50.00',
    minPrice: 35.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBJdFNOR5vYpik5beFUwnX3CG0z6dEvLnmLkiIfOiwSYTyzZbk5fK3MFOwNqiTjVCUxuqKjX30y2yPMTP3HeuGMyBGo7tgjr0MbnJQEPYeLV-E6T2wmoadi-2ZUlBeEB3HY3TUeg21tnL0eys7UfSOZlW_MRdgmxBQZP_mw9Z8BrYMqxUDgXTORuW637xBuqYkGFvo5XTZtYhurFZgrh-0ZTBZatHUSvj1snPBSRJlWFB8MPzlNavm',
    description: 'Heavyweight fleece hoodie with premium screen print or embroidery placement on chest & back.',
    badge: 'Popular Apparel',
    options: {
      finishes: ['Screen Print', 'Embroidered Chest', 'DTG Print'],
      quantities: [5, 15, 30, 50, 100],
    },
  },
  {
    id: 'prod-sticker',
    name: 'Sticker Pack',
    category: 'Packaging',
    priceRange: '$5.00 - $15.00',
    minPrice: 5.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3XhonsnbmNqBU5ZHxI4jDDHP4imIuBeGpEHcFcvSZV1VmPx1IAj-4mdUwd3xHRZZSQSUcEv22wpYMAHTyq9PI66m4BTRmehEdrY6t5WQnIa_9TDgU90Acj6Lm-XtIwUaC2D81ijqW6K925j_w8WtAxQrxM2oeXMKe3RfZOgaVwMQX3hmzLJLS_ldY9eDj3thqB58igB4cxwD__PE-gUUckBu9j0wwd2LBQCsK_5sUnaFi8fuXPbvn',
    description: 'Durable vinyl sticker pack with die-cut shapes, waterproof laminate finish, and high UV resistance.',
    badge: 'Trending',
    options: {
      finishes: ['Matte Vinyl', 'Glossy Holographic', 'Clear Backing'],
      quantities: [50, 100, 250, 500, 1000],
    },
  },
  {
    id: 'prod-tote',
    name: 'Tote Bag',
    category: 'Promotional',
    priceRange: '$12.00 - $18.00',
    minPrice: 12.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeJ4SAMBNVXwYRbmbfL0YNxJLtCb9Oob0X-WuZ33zn6lvnGgmJ0BceiQRML7HeN21uPGVzSx57XpXziaA9ul3GPC-RPR1vJ7U9kJdc68SmS0NOlMyBQ8ZSH_-ZPam82A2iiTVB5awtmNi65Wlb0TeNGFknvsuwQzUh26yEMFNy3bwBofaGUNUMuPENk8BzJQP3wC5WGPR9gf692lWZUDq0rqO0yZiN6R9eKBYM7RS4tiXHY2TEOIyQ',
    description: '100% natural organic cotton canvas tote bag with reinforced handles and full-color screen print.',
    badge: 'Eco Friendly',
    options: {
      finishes: ['Natural Canvas', 'Black Canvas', 'Heavyweight Organic'],
      quantities: [25, 50, 100, 250, 500],
    },
  },
];

export default function ProductsSection({ onSelectProduct, onAddToCartDirect, content }: ProductsSectionProps) {
  const [activeDot, setActiveDot] = useState(0);

  const badge = content?.badge || 'Featured Catalog';
  const title = content?.title || 'Curated Print Items';
  const subtitle = content?.subtitle || 'Select any item to configure finishes, upload artwork, and preview exact unit pricing.';

  return (
    <section id="products" className="py-16 lg:py-24 bg-white border-t border-[#0F172A]/8 text-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#0B57FF]/20">
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-medium text-[#0F172A] leading-tight font-heading tracking-[-0.02em]">
            {title}
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base mt-3 font-normal">
            {subtitle}
          </p>
        </div>

        {/* 4 Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialProducts.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-[#0F172A]/8 hover:border-[#0B57FF]/30 hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] transition-all duration-300 group text-center flex flex-col justify-between relative"
            >
              {/* Product Badge */}
              {item.badge && (
                <span className="absolute top-4 left-4 z-10 bg-[#0F172A] text-white font-semibold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}

              <div>
                {/* Image Box */}
                <div 
                  onClick={() => onSelectProduct(item)}
                  className="bg-[#F8F9FA] rounded-xl p-5 h-52 mb-4 flex items-center justify-center overflow-hidden relative cursor-pointer group-hover:bg-[#E0EBFF]/30 transition-colors border border-[#0F172A]/4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-[#0F172A]/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCartDirect(item);
                      }}
                      className="bg-white text-[#0F172A] px-3.5 py-2 rounded-full font-semibold text-xs shadow-md hover:bg-[#0B57FF] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>

                {/* Title & Category */}
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block mb-1">
                  {item.category}
                </span>
                <h3 
                  onClick={() => onSelectProduct(item)}
                  className="font-bold text-lg text-[#0F172A] mb-1.5 hover:text-[#0B57FF] transition-colors cursor-pointer"
                >
                  {item.name}
                </h3>

                {/* Price */}
                <p className="text-[#0B57FF] font-bold text-sm mb-4">
                  {item.priceRange}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#0F172A]/8 flex gap-2">
                <button
                  onClick={() => onAddToCartDirect(item)}
                  className="w-full bg-[#0B57FF] hover:bg-[#0948d9] text-white font-semibold py-2.5 px-3 rounded-full text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-10 gap-2">
          {[0, 1, 2].map((dot) => (
            <button
              key={dot}
              onClick={() => setActiveDot(dot)}
              className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeDot === dot ? 'w-6 bg-[#0B57FF]' : 'w-2 bg-[#0F172A]/20 hover:bg-[#0F172A]/40'
              }`}
              aria-label={`Page ${dot + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
