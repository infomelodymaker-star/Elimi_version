'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Phone, ArrowLeft, MessageCircle, Menu, X } from 'lucide-react';

interface ShopHeaderProps {
  cartCount: number;
  onOpenCart?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function ShopHeader({
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: ShopHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#F2F4F8] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#0A2351] flex items-center justify-center text-white font-black text-sm tracking-widest shadow-sm group-hover:bg-[#0D52FF] transition-colors">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#0A2351] tracking-tight group-hover:text-[#0D52FF] transition-colors leading-none">
                ELIMI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D52FF]">
                Boutique
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F2F4F8] p-1 rounded-full border border-slate-200/60 text-xs font-semibold text-[#525866]">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full hover:text-[#181B25] hover:bg-white/60 transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main Platform</span>
            </Link>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#0D52FF] text-white shadow-xs font-bold'
                  : 'hover:text-[#181B25] hover:bg-white/60'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setSelectedCategory('Fashion')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'Fashion'
                  ? 'bg-[#0D52FF] text-white shadow-xs font-bold'
                  : 'hover:text-[#181B25] hover:bg-white/60'
              }`}
            >
              Fashion
            </button>
            <button
              onClick={() => setSelectedCategory('Electronics')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'Electronics'
                  ? 'bg-[#0D52FF] text-white shadow-xs font-bold'
                  : 'hover:text-[#181B25] hover:bg-white/60'
              }`}
            >
              Electronics
            </button>
            <button
              onClick={() => setSelectedCategory('Cultural')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'Cultural'
                  ? 'bg-[#0D52FF] text-white shadow-xs font-bold'
                  : 'hover:text-[#181B25] hover:bg-white/60'
              }`}
            >
              Cultural Craft
            </button>
            <button
              onClick={() => setSelectedCategory('Nails & Beauty')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedCategory === 'Nails & Beauty'
                  ? 'bg-[#0D52FF] text-white shadow-xs font-bold'
                  : 'hover:text-[#181B25] hover:bg-white/60'
              }`}
            >
              Nails & Beauty
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* WhatsApp Direct Concierge */}
          <a
            href="https://wa.me/25779000000?text=Hello%20ELIMI%20Boutique,%20I%20have%20an%20inquiry%20about%20a%20product"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-[#F2F4F8] hover:bg-slate-200/80 text-[#181B25] font-semibold text-xs py-2 px-3.5 rounded-full border border-slate-200/70 transition-colors"
          >
            <Image
              src="/assets/icons/social/whatsapp-150x150.png"
              alt="WhatsApp"
              width={16}
              height={16}
              unoptimized
              referrerPolicy="no-referrer"
              className="w-4 h-4 object-contain"
            />
            <span>Seller Support</span>
          </a>

          {/* Cart Button */}
          <Link
            href="/shop/cart"
            onClick={onOpenCart}
            className="relative bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold text-xs py-2.5 px-4 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer group"
          >
            <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-white text-[#0D52FF] font-black text-[11px] px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {cartCount}
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#F2F4F8] text-[#181B25] hover:bg-slate-200 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col gap-1 text-xs font-semibold text-[#181B25]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#0D52FF]" />
              <span>Back to ELIMI Main Platform</span>
            </Link>
            <div className="text-[10px] uppercase font-bold text-[#525866] tracking-wider px-3 pt-2">
              Boutique Categories
            </div>
            {['All', 'Fashion', 'Electronics', 'Cultural', 'Nails & Beauty'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-xl text-left transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0D52FF] text-white font-bold'
                    : 'hover:bg-[#F2F4F8] text-[#181B25]'
                }`}
              >
                {cat === 'All' ? 'All Boutique Products' : cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
