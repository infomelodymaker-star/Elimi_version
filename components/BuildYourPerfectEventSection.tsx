'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { EMIL_SPRINGS } from '@/lib/motion-constants';
import {
  Zap,
  Check,
  ShieldCheck,
  Award,
  Headphones,
  Car,
  Users,
  Video,
  Utensils,
  FileText,
  Minus,
  Plus,
  ArrowRight,
  Lock,
  Calendar,
  Clock,
  Info,
  DollarSign,
  ChevronRight,
  X,
  Layers
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  unitPrice: number;
  quantity: number;
  defaultQuantity: number;
  checked: boolean;
  subtext?: string;
  image: string;
  tags: {
    iconType: 'car' | 'users' | 'shield' | 'video' | 'zap' | 'utensils' | 'file';
    label: string;
  }[];
}

export default function BuildYourPerfectEventSection() {
  const shouldReduceMotion = useReducedMotion();
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'vip-fleet',
      title: 'VIP Fleet (3 Mercedes SUVs)',
      description: 'Luxury Mercedes SUVs with professional chauffeurs.',
      unitPrice: 200,
      quantity: 3,
      defaultQuantity: 3,
      checked: true,
      subtext: '$200 each',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
      tags: [
        { iconType: 'car', label: 'Mercedes GLE' },
        { iconType: 'users', label: 'Up to 21 Pax' }
      ]
    },
    {
      id: 'protocol-agents',
      title: 'Protocol Agents (6 Staff)',
      description: 'Professional, uniformed and well-trained protocol agents.',
      unitPrice: 50,
      quantity: 6,
      defaultQuantity: 6,
      checked: true,
      subtext: '$50 each',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80',
      tags: [
        { iconType: 'users', label: 'Uniformed' },
        { iconType: 'shield', label: 'Trained & Certified' }
      ]
    },
    {
      id: 'photo-drone',
      title: 'Full HD Photo & Drone Video',
      description: 'Full day coverage with professional photo, HD video & drone shots.',
      unitPrice: 250,
      quantity: 1,
      defaultQuantity: 1,
      checked: true,
      subtext: '',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
      tags: [
        { iconType: 'video', label: 'Full HD' },
        { iconType: 'zap', label: 'Drone Included' }
      ]
    },
    {
      id: 'premium-catering',
      title: 'Premium Catering',
      description: 'Delicious menus, buffet setup and professional service.',
      unitPrice: 150,
      quantity: 0,
      defaultQuantity: 1,
      checked: false,
      subtext: '',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80',
      tags: [
        { iconType: 'utensils', label: 'Buffet' },
        { iconType: 'file', label: 'Custom Menus' }
      ]
    },
    {
      id: 'invitation-printing',
      title: 'Invitation Printing',
      description: 'High-quality invitation cards with custom design.',
      unitPrice: 150,
      quantity: 0,
      defaultQuantity: 1,
      checked: false,
      subtext: 'per 100 cards',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
      tags: [
        { iconType: 'shield', label: 'Premium Quality' },
        { iconType: 'file', label: '100 Cards' }
      ]
    }
  ]);

  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showAllServicesModal, setShowAllServicesModal] = useState(false);

  // Toggle checkbox
  const handleToggleCheck = (id: string) => {
    setServices((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextChecked = !item.checked;
          const nextQty = nextChecked
            ? item.quantity > 0
              ? item.quantity
              : item.defaultQuantity
            : item.quantity;
          return { ...item, checked: nextChecked, quantity: nextQty };
        }
        return item;
      })
    );
  };

  // Decrement quantity
  const handleDecrement = (id: string) => {
    setServices((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.quantity <= 1) {
            return { ...item, quantity: 0, checked: false };
          }
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  // Increment quantity
  const handleIncrement = (id: string) => {
    setServices((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + 1;
          return { ...item, quantity: newQty, checked: true };
        }
        return item;
      })
    );
  };

  // Calculations
  const selectedServices = services.filter((s) => s.checked && s.quantity > 0);
  const subtotal = selectedServices.reduce(
    (acc, curr) => acc + curr.unitPrice * curr.quantity,
    0
  );
  // Service fee formula (approx 8.7% to equal exactly $100 fee when subtotal is $1,150)
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.086956) : 0;
  const totalUSD = subtotal + serviceFee;
  // BIF Exchange rate ~2908 BIF per USD ($1250 * 2908 = 3,635,000 BIF)
  const totalBIF = totalUSD * 2908;

  // Render tag icon helper
  const renderTagIcon = (iconType: string) => {
    switch (iconType) {
      case 'car':
        return <Car className="w-3.5 h-3.5 text-[#0D52FF]" />;
      case 'users':
        return <Users className="w-3.5 h-3.5 text-[#0D52FF]" />;
      case 'shield':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#0D52FF]" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-[#0D52FF]" />;
      case 'zap':
        return <Zap className="w-3.5 h-3.5 text-[#0D52FF]" />;
      case 'utensils':
        return <Utensils className="w-3.5 h-3.5 text-[#0D52FF]" />;
      case 'file':
        return <FileText className="w-3.5 h-3.5 text-[#0D52FF]" />;
      default:
        return <Check className="w-3.5 h-3.5 text-[#0D52FF]" />;
    }
  };

  // Helper for small right column icon
  const getItemIcon = (id: string) => {
    switch (id) {
      case 'vip-fleet':
        return <Car className="w-4 h-4 text-[#0D52FF]" />;
      case 'protocol-agents':
        return <Users className="w-4 h-4 text-[#0D52FF]" />;
      case 'photo-drone':
        return <Video className="w-4 h-4 text-[#0D52FF]" />;
      case 'premium-catering':
        return <Utensils className="w-4 h-4 text-[#0D52FF]" />;
      case 'invitation-printing':
        return <FileText className="w-4 h-4 text-[#0D52FF]" />;
      default:
        return <Zap className="w-4 h-4 text-[#0D52FF]" />;
    }
  };

  return (
    <section id="build-event" className="w-full bg-[#F8F9FA] py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-[#0F172A] font-sans antialiased">
      <div className="max-w-[1200px] mx-auto space-y-12">
        
        {/* ====================================================================
            1. SECTION HEADER & TRUST BADGES ROW
           ==================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          
          {/* Header Left */}
          <div>
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3 border border-[#0B57FF]/20 shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-[#0B57FF]" />
              <span>EVENTS</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Build Your <span className="text-[#0B57FF]">Perfect Event</span>
            </h2>

            {/* Subtitle with accent border */}
            <p className="mt-3 text-[#64748B] text-base sm:text-lg font-normal max-w-2xl border-l-2 border-[#0B57FF] pl-4">
              Select your preferred services and get your live estimate in real time.
            </p>
          </div>

          {/* Top Right Trust Badges (3-Column Row) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 bg-white p-4 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)]">
            {/* Badge 1 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#0F172A] leading-tight">
                  Trusted by 500+
                </h4>
                <p className="text-[11px] sm:text-xs text-[#64748B]">Happy Clients</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200" />

            {/* Badge 2 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#0F172A] leading-tight">
                  Premium Quality
                </h4>
                <p className="text-[11px] sm:text-xs text-[#64748B]">Guaranteed</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200" />

            {/* Badge 3 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-[#0F172A] leading-tight">
                  Lundi - Vendredi
                </h4>
                <p className="text-[11px] sm:text-xs text-[#64748B]">9h - 17h</p>
              </div>
            </div>
          </div>

        </div>

        {/* ====================================================================
            2. MAIN 2-COLUMN LAYOUT (SELECTOR + LIVE ESTIMATE SUMMARY)
           ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Interactive Service Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Section Sub-header */}
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0F172A]">
              1. Select Your Services
            </h3>

            {/* Vertical List of 5 Service Cards */}
            <div className="space-y-4">
              {services.map((item) => {
                const isSelected = item.checked && item.quantity > 0;
                const totalItemCost = item.unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-5 md:p-6 border transition-all relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#0B57FF]/40 shadow-[0px_4px_24px_0px_rgba(11,87,255,0.08)]'
                        : 'border-[#0F172A]/8 hover:border-[#0F172A]/16 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)]'
                    }`}
                  >
                    {/* Left: Checkbox + Thumbnail + Details */}
                    <div className="flex items-start gap-3.5 w-full sm:w-auto flex-1">
                      
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleCheck(item.id)}
                        className={`mt-1.5 sm:mt-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-[#0B57FF] border-[#0B57FF] text-white'
                            : 'border-slate-300 bg-white hover:border-[#0B57FF]'
                        }`}
                        aria-label={`Select ${item.title}`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Service Thumbnail */}
                      <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[#0F172A]/8 bg-slate-100">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-[#0F172A] leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-2 pt-1.5">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] bg-[#F8F9FA] border border-[#0F172A]/8 px-2.5 py-0.5 rounded-full"
                            >
                              {renderTagIcon(tag.iconType)}
                              <span>{tag.label}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right: Stepper Counter + Price display */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 gap-2">
                      
                      {/* Stepper Controls */}
                      <div className="inline-flex items-center gap-1.5 bg-[#F8F9FA] border border-[#0F172A]/8 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.id)}
                          className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center justify-center transition disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>

                        <span className="w-6 text-center text-xs font-bold text-[#0F172A]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id)}
                          className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-[#0B57FF] flex items-center justify-center transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Calculated Price */}
                      <div className="text-right">
                        <span className="font-bold text-base sm:text-lg text-[#0B57FF] block leading-tight">
                          ${totalItemCost > 0 ? totalItemCost : item.unitPrice} USD
                        </span>
                        {item.subtext && (
                          <span className="text-[10px] text-[#64748B] font-medium block">
                            {item.subtext}
                          </span>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Note Light Blue Banner */}
            <div className="bg-[#E0EBFF] border border-[#0B57FF]/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-[#0F172A] font-medium">
                <Zap className="w-4 h-4 text-[#0B57FF] shrink-0" />
                <span>
                  <strong className="text-[#0B57FF] font-semibold">More services available:</strong> Decor &amp; Lighting, Venue Setup, Live Streaming and more.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowAllServicesModal(true)}
                className="bg-white hover:bg-slate-50 text-[#0B57FF] font-semibold text-xs px-5 py-2.5 rounded-full border border-[#0B57FF]/30 transition shadow-xs whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Estimate Floating Summary Card (5 Cols) */}
          <div className="lg:col-span-5 sticky top-6">
            
            <div className="rounded-[24px] shadow-xl overflow-visible border border-slate-200/80 bg-[#0A2351]">
              
              {/* Dark Navy Header Wrapper */}
              <div className="relative bg-[#0A2351] rounded-t-[24px] p-6.5 pb-16 pt-9 text-white overflow-visible min-h-[260px] flex flex-col justify-between">
                
                {/* Absolute Transparent Cutout Hostess Image */}
                {/* Breaks out of the top/right boundary naturally */}
                <div className="absolute -right-2 -top-8 sm:top-auto sm:bottom-0 h-[135%] sm:h-[115%] w-[190px] sm:w-[240px] pointer-events-none z-10 overflow-visible">
                  <Image
                    src="/assets/package_calculator/ELIMI_PROTOCOL_GIRL.webp"
                    alt="Protocol Staff"
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-contain object-top sm:object-bottom pointer-events-none drop-shadow-lg"
                  />
                </div>

                {/* Live Estimate Header Content */}
                <div className="relative z-20 space-y-3.5 max-w-[62%] sm:max-w-[65%]">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                      Live Estimate
                    </h3>
                    <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-[10px] text-white/90 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Updating in real time</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-slate-300 font-medium">
                      Estimated Total
                    </p>

                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#38BDF8] drop-shadow-xs">
                      ${totalUSD.toLocaleString()} USD
                    </div>
                  </div>

                  {/* Currency conversion badge */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20">
                      <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>≈ {totalBIF.toLocaleString()} BIF</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Lower White Itemized Summary Body (Overlapping Navy Card with Top Rounded Corners) */}
              <div className="relative z-20 -mt-6 bg-white rounded-[24px] p-6 space-y-5 border border-slate-100 shadow-sm">
                
                {/* Header Title */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-[#181B25]">
                    Your Selected Services ({selectedServices.length})
                  </h4>
                  <span className="text-xs text-[#0D52FF] font-bold">
                    Active
                  </span>
                </div>

                {/* Selected Items List */}
                <div className="space-y-3 min-h-[80px]">
                  {selectedServices.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#525866]">
                      No services selected yet. Check items on the left to build your estimate.
                    </div>
                  ) : (
                    selectedServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs text-[#181B25] gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0">
                            {getItemIcon(s.id)}
                          </div>
                          <span className="font-bold truncate">{s.title}</span>
                          {s.quantity > 1 && (
                            <span className="text-[10px] text-[#525866] bg-slate-100 px-1.5 py-0.5 rounded-md font-semibold">
                              x{s.quantity}
                            </span>
                          )}
                        </div>

                        <span className="font-extrabold shrink-0">
                          ${(s.unitPrice * s.quantity).toLocaleString()} USD
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Pricing Calculation Lines */}
                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#525866]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#181B25]">
                      ${subtotal.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#525866]">
                    <span className="inline-flex items-center gap-1">
                      <span>Service Fee (8%)</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <span className="font-bold text-[#181B25]">
                      ${serviceFee.toLocaleString()} USD
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm sm:text-base font-black">
                    <span className="text-[#181B25]">Estimated Total</span>
                    <span className="text-[#0D52FF] text-lg sm:text-xl font-black">
                      ${totalUSD.toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Security Badge Box */}
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-[#525866] font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0D52FF] shrink-0" />
                  <span>Your information is secure and encrypted.</span>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={() => setShowReserveModal(true)}
                  className="w-full bg-[#0B57FF] hover:bg-[#0948D9] text-white font-semibold py-3.5 px-6 rounded-full shadow-[0px_4px_24px_0px_rgba(11,87,255,0.25)] hover:shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base group"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Customize &amp; Reserve Event</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[11px] text-center text-[#64748B] font-medium">
                  Proceed to <strong className="text-[#0F172A]">/events</strong> to complete your booking
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================================
            3. BOTTOM VALUE PROPOSITION BANNER (4-COLUMN WHITE PILL ROW)
           ==================================================================== */}
        <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 shadow-xs">
          
          {/* Guarantee 1 */}
          <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#181B25]">Flexible Packages</h4>
              <p className="text-xs text-[#525866]">Tailored to your needs</p>
            </div>
          </div>

          {/* Guarantee 2 */}
          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#181B25]">Best Price Guarantee</h4>
              <p className="text-xs text-[#525866]">Premium service, fair prices</p>
            </div>
          </div>

          {/* Guarantee 3 */}
          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#181B25]">Fast Response</h4>
              <p className="text-xs text-[#525866]">Get a quote in minutes</p>
            </div>
          </div>

          {/* Guarantee 4 */}
          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
              <Headphones className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#181B25]">Dedicated Support</h4>
              <p className="text-xs text-[#525866]">We&apos;re here for you</p>
            </div>
          </div>

        </div>

      </div>

      {/* ==================== INTERACTIVE MODALS ==================== */}

      {/* Reservation Modal */}
      <AnimatePresence>
        {showReserveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={shouldReduceMotion ? { duration: 0.15 } : EMIL_SPRINGS.modal}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 space-y-6"
            >
              <button
                type="button"
                onClick={() => setShowReserveModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0D52FF] text-white flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xl text-[#181B25]">Reserve Your Event</h4>
                  <p className="text-xs text-[#525866]">ELIMI Protocol &amp; Event Management</p>
                </div>
              </div>

              {/* Summary Breakdown */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
                <p className="font-bold text-[#181B25] border-b border-slate-200 pb-2">
                  Selected Estimate Summary:
                </p>
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex justify-between text-[#525866]">
                    <span>{s.title} ({s.quantity}x)</span>
                    <span className="font-bold text-[#181B25]">${s.unitPrice * s.quantity} USD</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-[#0D52FF]">
                  <span>Total (Inc. Service Fee):</span>
                  <span>${totalUSD.toLocaleString()} USD (~{totalBIF.toLocaleString()} BIF)</span>
                </div>
              </div>

              <a
                href={`https://wa.me/25700000000?text=Hello%20Elimi%20Team!%20I%20would%20like%20to%20reserve%20an%20event%20package.%20Estimate:%20$${totalUSD}%20USD`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowReserveModal(false)}
                className="w-full bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-extrabold rounded-full py-3.5 px-6 shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <span>Confirm &amp; Proceed to /events</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All Services Modal */}
      <AnimatePresence>
        {showAllServicesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={shouldReduceMotion ? { duration: 0.15 } : EMIL_SPRINGS.modal}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowAllServicesModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EBF1FF] text-[#0D52FF] rounded-2xl flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-[#181B25]">Additional Elimi Services</h4>
                  <p className="text-xs text-[#525866]">Full event ecosystem coverage</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#525866]">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <strong className="text-[#181B25] block">Decor &amp; Stage Lighting</strong>
                  Custom floral arrangements, LED illumination, ambient backdrops.
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <strong className="text-[#181B25] block">Venue Setup &amp; Marquees</strong>
                  Luxury tents, air-conditioned pavilions, seating arrangements.
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <strong className="text-[#181B25] block">Live HD Broadcast &amp; Streaming</strong>
                  Multi-camera setup with global satellite &amp; web stream.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllServicesModal(false)}
                className="w-full bg-[#0D52FF] text-white font-extrabold rounded-full py-3 text-xs shadow-xs hover:bg-[#0B44D8] transition"
              >
                Close &amp; Back to Calculator
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
