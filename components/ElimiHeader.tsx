'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Bell, Bot, ShoppingCart } from 'lucide-react';
import DesktopNavMenu from '@/components/DesktopNavMenu';
import { MobileNavigationMenu } from '@/components/MobileNavigationMenu';
import { getSavedCart } from '@/lib/cart';

interface ElimiHeaderProps {
  className?: string;
  isSticky?: boolean;
  onCartClick?: () => void;
  cartCount?: number;
  showCart?: boolean;
}

export default function ElimiHeader({
  className = '',
  isSticky = true,
  onCartClick,
  cartCount = 0,
  showCart,
}: ElimiHeaderProps) {
  const pathname = usePathname();
  const shouldShowCart = showCart ?? (pathname?.startsWith('/shop') || Boolean(onCartClick));

  const [internalCount, setInternalCount] = useState(cartCount);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateCount = () => {
        const cart = getSavedCart();
        setInternalCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      };
      updateCount();
      window.addEventListener('elimi-cart-updated', updateCount);
      return () => window.removeEventListener('elimi-cart-updated', updateCount);
    }
  }, [cartCount]);

  const displayCount = cartCount > 0 ? cartCount : internalCount;

  return (
    <header className={`${isSticky ? 'sticky top-0 z-40' : 'relative z-30'} w-full bg-white/95 backdrop-blur-md border-b border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] transition-all ${className}`}>
      {/* BEGIN: Desktop Navigation Bar */}
      <div className="hidden lg:flex w-full max-w-[1200px] mx-auto items-center justify-between px-6 py-3.5 gap-4">
        {/* Buy Button */}
        <Link
          href="/shop"
          className="bg-white hover:bg-slate-50 text-[#0F172A] font-semibold py-2.5 px-6 sm:px-8 text-xs sm:text-sm rounded-full flex items-center gap-2 transition-all border border-[#1D4ED8] cursor-pointer shrink-0 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#0B57FF]" />
          <span>Buy</span>
        </Link>

        {/* Center Desktop Navigation Menu */}
        <DesktopNavMenu />

        {/* Right Section: Rent Button & Cart Button at the very right */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/protocol"
            className="bg-white hover:bg-slate-50 text-[#0F172A] font-semibold py-2.5 px-6 sm:px-8 text-xs sm:text-sm rounded-full flex items-center gap-2 transition-all border border-[#1D4ED8] cursor-pointer shrink-0 shadow-xs"
          >
            <span>Rent</span>
            <ArrowUpRight className="w-4 h-4 text-[#0B57FF]" />
          </Link>

          {shouldShowCart && (
            <Link
              href="/shop/cart"
              onClick={onCartClick}
              className="relative bg-[#E0EBFF] hover:bg-blue-100 text-[#0B57FF] p-2.5 rounded-full flex items-center justify-center transition-all shadow-xs hover:scale-105 cursor-pointer shrink-0 border border-[#0B57FF]/20 group"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-105 text-[#0B57FF]" />
              {displayCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 bg-[#0B57FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {displayCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
      {/* END: Desktop Navigation Bar */}

      {/* BEGIN: Mobile Top Navigation Bar */}
      <div className="lg:hidden w-full px-5 py-3.5 flex items-center justify-between">
        <MobileNavigationMenu />
        <Link href="/" className="flex items-center">
          <div className="relative w-8 h-8 mr-2">
            <Image src="/assets/icons/ELIMI_LOGO.svg" alt="Elimi Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="text-[20px] font-bold text-[#0B57FF] leading-none tracking-tight font-sans">ELIMI</span>
            <span className="text-[12px] text-[#64748B] italic font-serif leading-none">Protocol</span>
          </div>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="text-[#0B57FF] relative p-2 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[1.75]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Elimi AI Assistant (Monica) Trigger in Header */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-elimi-ai'));
              }
            }}
            className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#0B57FF] bg-slate-50 shrink-0 cursor-pointer hover:scale-105 transition-all shadow-xs group"
            title="Chat with Monica (Elimi AI Assistant)"
            aria-label="Open Elimi AI Assistant (Monica)"
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtR-s7uWHS8VUe3_jtGxzb-bi7WM0NQRTIWFlGpBEQ8LEIKXXlbBlObvodO21mgRJgwpSua5QI0R4LD-tfvzZ-KpyM-TmQUMyYC0GqB7gp7CIStN4Mcxn0BYLxBzl3x_7KQ4X_7BTG9c0EOegLs6NPEopDeWJD1IVFwEAG3W3J6V_vsvY6vFIUZsXaE-oLTFYjgkoQ09b04i6Pl9OCXlUGZTyHVc4Rxn7E4y3UBs-4pG9IA8t9itY-" 
              alt="Monica - Elimi AI Assistant" 
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#0B57FF] rounded-full flex items-center justify-center text-white border border-white shadow-xs">
              <Bot className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* Cart Icon at the very right of the mobile header bar */}
          {shouldShowCart && (
            <Link
              href="/shop/cart"
              onClick={onCartClick}
              className="relative p-2 rounded-full bg-[#E0EBFF] hover:bg-blue-100 text-[#0B57FF] transition-all cursor-pointer border border-[#0B57FF]/20 shrink-0 group"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-105 text-[#0B57FF]" />
              {displayCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#0B57FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {displayCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
      {/* END: Mobile Top Navigation Bar */}
    </header>
  );
}
