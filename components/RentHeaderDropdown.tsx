'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, Car, HousePlus, Boxes, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useRealtimeCars } from '@/lib/firestore-cars';
import { useRealtimeHouses } from '@/lib/firestore-houses';
import { useRealtimeRentalItems } from '@/lib/firestore-rentals';

export default function RentHeaderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { cars } = useRealtimeCars();
  const { houses } = useRealtimeHouses();
  const { items: rentalItems } = useRealtimeRentalItems();

  const rentCars = cars.filter((c) => c.rent);
  const rentHouses = houses.filter((h) => h.rent);

  const minCarPrice = rentCars.length > 0 ? Math.min(...rentCars.map((c) => c.rentPrice || 60)) : 60;
  const minHousePrice = rentHouses.length > 0 ? Math.min(...rentHouses.map((h) => h.rentPrice || 1500)) : 1500;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Rent Button Trigger (Exact UI maintained) */}
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`bg-white hover:bg-slate-50 text-[#0F172A] font-semibold py-2.5 px-6 sm:px-8 text-xs sm:text-sm rounded-full flex items-center gap-2 transition-all border border-[#1D4ED8] cursor-pointer shrink-0 shadow-xs outline-none ${
          isOpen ? 'bg-slate-50 ring-2 ring-[#0B57FF]/20' : ''
        }`}
      >
        <span>Rent</span>
        <ArrowUpRight
          className={`w-4 h-4 text-[#0B57FF] transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Hover / Click Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-50 w-[420px] animate-in fade-in-50 zoom-in-95 duration-150 origin-top-right">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 divide-y divide-slate-100">
            {/* Header Title */}
            <div className="flex items-center justify-between pb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rentals &amp; Leases
              </span>
              <span className="text-[11px] font-medium text-[#0B57FF] bg-[#E0EBFF] px-2 py-0.5 rounded-full font-mono">
                Verified Fleet &amp; Properties
              </span>
            </div>

            {/* Rental Categories */}
            <div className="py-2 space-y-1">
              {/* 1. Cars & VIP Fleet */}
              <Link
                href="/cars?type=rent"
                onClick={handleItemClick}
                className="group flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B57FF] shrink-0 group-hover:bg-[#0B57FF] group-hover:text-white transition-colors mt-0.5">
                  <Car className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0B57FF] transition-colors leading-tight">
                      Cars &amp; VIP Fleet
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 group-hover:bg-[#E0EBFF] group-hover:text-[#0B57FF] px-2 py-0.5 rounded-full transition-colors">
                      {rentCars.length > 0 ? `${rentCars.length} Available` : 'Available'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 leading-snug mt-0.5">
                    Luxury SUVs, Mercedes &amp; VIP convoys from ${minCarPrice}/day
                  </p>
                </div>
              </Link>

              {/* 2. Houses & Living Estates */}
              <Link
                href="/houses?type=rent"
                onClick={handleItemClick}
                className="group flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B57FF] shrink-0 group-hover:bg-[#0B57FF] group-hover:text-white transition-colors mt-0.5">
                  <HousePlus className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0B57FF] transition-colors leading-tight">
                      Houses &amp; Residences
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 group-hover:bg-[#E0EBFF] group-hover:text-[#0B57FF] px-2 py-0.5 rounded-full transition-colors">
                      {rentHouses.length > 0 ? `${rentHouses.length} Estates` : 'Available'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 leading-snug mt-0.5">
                    Furnished villas &amp; short-stay apartments from ${minHousePrice}/mo
                  </p>
                </div>
              </Link>

              {/* 3. Other Occasional Rentals */}
              <Link
                href="/allocations"
                onClick={handleItemClick}
                className="group flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#0B57FF] shrink-0 group-hover:bg-[#0B57FF] group-hover:text-white transition-colors mt-0.5">
                  <Boxes className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0B57FF] transition-colors leading-tight">
                      Other Occasional Rentals
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 group-hover:bg-[#E0EBFF] group-hover:text-[#0B57FF] px-2 py-0.5 rounded-full transition-colors">
                      {rentalItems.length > 0 ? `${rentalItems.length} Categories` : 'Staff & Equip'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-700 leading-snug mt-0.5">
                    Staff, protocol hostesses, suits &amp; event equipment
                  </p>
                </div>
              </Link>
            </div>

            {/* Bottom Quick Link */}
            <div className="pt-2.5 flex items-center justify-between">
              <Link
                href="/contact"
                onClick={handleItemClick}
                className="text-xs font-semibold text-[#0B57FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Custom rental inquiry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-slate-400">
                24/7 Diplomatic Support
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
