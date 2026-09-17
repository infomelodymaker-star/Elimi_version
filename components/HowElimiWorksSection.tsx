'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import PartnerCards from '@/components/PartnerCards';
import BuildYourPerfectEventSection from '@/components/BuildYourPerfectEventSection';
import ElimiMediaSection from '@/components/ElimiMediaSection';
import OurServicesSection from '@/components/OurServicesSection';
import {
  Shield,
  ShieldCheck,
  Lock,
  Headphones,
  Award,
  Zap,
  Bot,
  Search,
  Calculator,
  MessageCircle,
  MessageSquare,
  ArrowRight,
  Star,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  Building2,
  Check,
  Smartphone,
  Laptop
} from 'lucide-react';

export default function HowElimiWorksSection() {
  // Active Testimonial Index for Carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Background image state with fallbacks
  const [step1Img, setStep1Img] = useState(
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'
  );
  const [step2Img, setStep2Img] = useState(
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80'
  );
  const [step3Img, setStep3Img] = useState(
    'https://images.unsplash.com/photo-1556742049-0a670f4a45a7?auto=format&fit=crop&w=1000&q=80'
  );

  // Interactive AI search demo state inside Step 1
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('Find me a Prado in Bujumbura for 2 days');
  const [showAiModal, setShowAiModal] = useState(false);

  // Interactive Package modal state for Step 2
  const [showPackageModal, setShowPackageModal] = useState(false);

  // WhatsApp modal state for Step 3
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Testimonials Data
  const testimonials = [
    {
      id: 't1',
      name: 'Sarah N.',
      role: 'Diaspora Client',
      location: 'Belgium 🇧🇪',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      fallbackAsset: '/assets/testimonials/sarah.jpg',
      rating: 5,
      quote:
        'Elimi made planning my wedding in Bujumbura from Belgium so easy. The VIP package, protocol team, and video coverage were absolutely perfect!'
    },
    {
      id: 't2',
      name: 'Jean B.',
      role: 'Business Owner',
      location: 'Bujumbura 🇧🇮',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      fallbackAsset: '/assets/testimonials/jean.jpg',
      rating: 5,
      quote:
        'Rented a Prado for a business trip to Gitega. The process was fast, the car was spotless, and the service was top-notch.'
    },
    {
      id: 't3',
      name: 'Aline M.',
      role: 'Customer',
      location: 'Ngozi 🇧🇮',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      fallbackAsset: '/assets/testimonials/aline.jpg',
      rating: 5,
      quote:
        'I discovered amazing products on Elimi Média and bought them instantly. Love the integration of content and shopping!'
    }
  ];

  return (
    <section className="w-full bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-12 text-[#181B25] font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ====================================================================
            SECTION 1: "HOW ELIMI WORKS" (3-STEP PROCESS)
           ==================================================================== */}
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 bg-[#EBF1FF] text-[#0D52FF] px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase mb-3 border border-[#0D52FF]/20 shadow-2xs">
                <div className="w-4 h-4 bg-[#0D52FF] text-white rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>HOW ELIMI WORKS</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#181B25]">
                Simple Process. <span className="text-[#0D52FF]">Exceptional Experience.</span>
              </h2>

              {/* Subtitle */}
              <p className="mt-2 text-[#525866] text-base sm:text-lg font-medium max-w-2xl">
                From discovery to delivery—Elimi makes everything seamless.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="hidden lg:block">
              <button
                onClick={() => setShowAiModal(true)}
                className="bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold px-6 py-3 rounded-full text-sm shadow-md transition-all flex items-center gap-2 group"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Elimi AI Assistant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Top Feature Row (4-column micro-banner) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Banner Item 1 */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#181B25]">Secure & Reliable</h4>
                <p className="text-xs text-[#525866]">Your data is protected</p>
              </div>
            </div>

            {/* Banner Item 2 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#181B25]">100% Safe Payments</h4>
                <p className="text-xs text-[#525866]">Mobile Money & Bank</p>
              </div>
            </div>

            {/* Banner Item 3 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#181B25]">Lundi - Vendredi</h4>
                <p className="text-xs text-[#525866]">9h - 17h</p>
              </div>
            </div>

            {/* Banner Item 4 */}
            <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#0D52FF] flex items-center justify-center shrink-0 border border-[#0D52FF]/10">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#181B25]">Trusted by Thousands</h4>
                <p className="text-xs text-[#525866]">Across Burundi & Beyond</p>
              </div>
            </div>
          </div>

          {/* 3-STEP CARD LAYOUT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

            {/* STEP 1: Search or Ask Elimi AI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-h-[280px] flex flex-col justify-between"
            >
              {/* Background Image on Right Side */}
              <div className="absolute top-0 bottom-0 right-0 left-[15%] sm:left-[25%] pointer-events-none overflow-hidden z-0">
                <Image
                  src={step1Img}
                  alt="Step 1 Elimi AI Search"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  onError={() => setStep1Img('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80')}
                  className="w-full h-full object-cover object-right opacity-95 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 via-30% to-transparent pointer-events-none" />
              </div>

              {/* Left Content Container */}
              <div className="p-6 sm:p-7 relative z-10 w-full sm:w-[80%] lg:w-[85%] space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Circle Badge 1 */}
                  <div className="w-8 h-8 bg-[#0D52FF] text-white font-extrabold text-sm rounded-full flex items-center justify-center shadow-md shrink-0">
                    1
                  </div>
                  {/* Sub-tag */}
                  <div className="inline-flex items-center gap-1 bg-[#EBF1FF] text-[#0D52FF] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#0D52FF]/15">
                    <Zap className="w-3 h-3 fill-[#0D52FF]" />
                    <span>Sub-second speed</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#181B25] leading-snug">
                  Search or Ask Elimi AI
                </h3>

                <p className="text-[#525866] text-xs sm:text-sm leading-relaxed">
                  Use the search bar or chat with our 24/7 AI assistant to find rentals, event services, or products.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="bg-[#0D52FF] hover:bg-[#0B44D8] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-xs flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Try Elimi AI</span>
                  </button>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="border border-slate-200 hover:bg-slate-50 text-[#181B25] text-xs font-bold px-3.5 py-2.5 rounded-full transition flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5 text-[#525866]" />
                    <span>Search Now</span>
                  </button>
                </div>
              </div>

              {/* Desktop Transition Arrow 1->2 */}
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white text-[#181B25] rounded-full shadow-md border border-slate-200 items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>


            {/* STEP 2: Customize Your Package */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-h-[280px] flex flex-col justify-between"
            >
              {/* Background Image on Right Side */}
              <div className="absolute top-0 bottom-0 right-0 left-[15%] sm:left-[25%] pointer-events-none overflow-hidden z-0">
                <Image
                  src={step2Img}
                  alt="Step 2 Customize Package"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  onError={() => setStep2Img('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80')}
                  className="w-full h-full object-cover object-right opacity-95 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 via-30% to-transparent pointer-events-none" />
              </div>

              {/* Left Content Container */}
              <div className="p-6 sm:p-7 relative z-10 w-full sm:w-[80%] lg:w-[85%] space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Circle Badge 2 */}
                  <div className="w-8 h-8 bg-[#0D52FF] text-white font-extrabold text-sm rounded-full flex items-center justify-center shadow-md shrink-0">
                    2
                  </div>
                  {/* Sub-tag */}
                  <div className="inline-flex items-center gap-1 bg-[#EBF1FF] text-[#0D52FF] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#0D52FF]/15">
                    <Calculator className="w-3 h-3" />
                    <span>Transparent pricing</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#181B25] leading-snug">
                  Customize Your Package
                </h3>

                <p className="text-[#525866] text-xs sm:text-sm leading-relaxed">
                  Select dates, locations, or custom event options with real-time price estimation in BIF or USD.
                </p>

                {/* Feature Tags Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="inline-flex items-center gap-1 bg-[#F8FAFC] text-[#181B25] px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200">
                    <Zap className="w-3 h-3 text-[#0D52FF]" />
                    <span>Real-time Estimation</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#F8FAFC] text-[#181B25] px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-[#0D52FF]" />
                    <span>Multiple Options</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#F8FAFC] text-[#181B25] px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200">
                    <Lock className="w-3 h-3 text-[#0D52FF]" />
                    <span>BIF & USD Pricing</span>
                  </span>
                </div>
              </div>

              {/* Desktop Transition Arrow 2->3 */}
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white text-[#181B25] rounded-full shadow-md border border-slate-200 items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>


            {/* STEP 3: Confirm via WhatsApp or Mobile Money */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-h-[280px] flex flex-col justify-between"
            >
              {/* Background Image on Right Side */}
              <div className="absolute top-0 bottom-0 right-0 left-[15%] sm:left-[25%] pointer-events-none overflow-hidden z-0">
                <Image
                  src={step3Img}
                  alt="Step 3 Confirm via WhatsApp"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  onError={() => setStep3Img('https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80')}
                  className="w-full h-full object-cover object-right opacity-95 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 via-30% to-transparent pointer-events-none" />
              </div>

              {/* Left Content Container */}
              <div className="p-6 sm:p-7 relative z-10 w-full sm:w-[80%] lg:w-[85%] space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Circle Badge 3 */}
                  <div className="w-8 h-8 bg-[#0D52FF] text-white font-extrabold text-sm rounded-full flex items-center justify-center shadow-md shrink-0">
                    3
                  </div>
                  {/* Sub-tag */}
                  <div className="inline-flex items-center gap-1 bg-[#EBF1FF] text-[#0D52FF] px-2.5 py-1 rounded-full text-[11px] font-bold border border-[#0D52FF]/15">
                    <Zap className="w-3 h-3 stroke-[2.5]" />
                    <span>Instant coordination</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#181B25] leading-snug">
                  Confirm via WhatsApp or Mobile Money
                </h3>

                <p className="text-[#525866] text-xs sm:text-sm leading-relaxed">
                  Connect directly with an Elimi agent on WhatsApp to finalize booking details and secure payment.
                </p>

                {/* Double CTAs */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href="https://wa.me/25764444546?text=Hello%20Elimi%20Team!%20I%20would%20like%20to%20confirm%20my%20booking."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-xs flex items-center gap-1.5"
                  >
                    <Image
                      src="/assets/icons/social/whatsapp-150x150.png"
                      alt="WhatsApp"
                      width={16}
                      height={16}
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 shrink-0 object-contain"
                    />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    className="border border-slate-200 hover:bg-slate-50 text-[#181B25] text-xs font-bold px-3.5 py-2.5 rounded-full transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0D52FF]" />
                    <span>Pay Securely</span>
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ====================================================================
            BUILD YOUR PERFECT EVENT SECTION
           ==================================================================== */}
        <BuildYourPerfectEventSection />

        {/* ====================================================================
            ELIMI MÉDIA INTERACTIVE SHOPPING SECTION
           ==================================================================== */}
        <ElimiMediaSection />

        {/* ====================================================================
            OUR SERVICES MARQUEE SECTION
           ==================================================================== */}
        <OurServicesSection />

        {/* ====================================================================
            SECTION 2: "WHAT OUR CLIENTS SAY" (TESTIMONIALS)
           ==================================================================== */}
        <div className="space-y-8 pt-6 border-t border-slate-200/80">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#181B25]">
                What Our Clients Say
              </h3>
              <p className="text-[#525866] text-sm mt-1">
                Our clients&apos; satisfaction is our greatest reward.
              </p>
            </div>

            <button
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="text-[#0D52FF] hover:text-[#0B44D8] text-sm font-extrabold flex items-center gap-1 group self-start sm:self-auto"
            >
              <span>View All Testimonials</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Testimonial Cards (3-Column Grid / Carousel on Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`bg-white rounded-[20px] p-6 border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                  activeTestimonial === idx ? 'border-[#0D52FF] ring-2 ring-[#0D52FF]/10' : 'border-slate-200/80'
                }`}
              >
                {/* Background Quote Mark */}
                <span className="absolute top-4 right-6 text-6xl font-serif text-slate-100 select-none pointer-events-none">
                  “
                </span>

                {/* Top Avatar & Rating Row */}
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#EBF1FF] shadow-xs shrink-0"
                  />
                  <div>
                    {/* 5-Star Rating */}
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-[#525866] text-sm leading-relaxed italic mb-6 relative z-10">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Client Info Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-sm text-[#181B25]">{testimonial.name}</h5>
                    <p className="text-xs text-[#525866] font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{testimonial.role} – {testimonial.location}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`transition-all ${
                  activeTestimonial === idx
                    ? 'w-6 h-2 bg-[#0D52FF] rounded-full'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400 rounded-full'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>


        {/* ====================================================================
            SECTION 3: SECURITY, TRUST & PARTNER LOGOS + BOTTOM CTA BANNER
           ==================================================================== */}
        <div className="space-y-6 pt-6 border-t border-slate-200/80">
          
          {/* 2-Column Split: Security Left | Partners Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Card: Trusted. Secure. Reliable. */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
              <div className="flex items-start gap-4">
                {/* Big Blue Shield Icon Badge */}
                <div className="w-12 h-12 rounded-2xl bg-[#0D52FF] text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#181B25]">
                    Trusted. Secure. Reliable.
                  </h4>
                  <p className="text-xs sm:text-sm text-[#525866] mt-1 leading-relaxed">
                    We use bank-level security and verified payment channels to ensure every transaction is safe and protected.
                  </p>
                </div>
              </div>

              {/* Micro Badges Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-[#F8FAFC] border border-slate-200 px-3 py-2 rounded-xl text-[11px] font-bold text-[#181B25] flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0D52FF]" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-200 px-3 py-2 rounded-xl text-[11px] font-bold text-[#181B25] flex items-center justify-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#0D52FF]" />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-200 px-3 py-2 rounded-xl text-[11px] font-bold text-[#181B25] flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#0D52FF]" />
                  <span>Verified Business</span>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-200 px-3 py-2 rounded-xl text-[11px] font-bold text-[#181B25] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D52FF]" />
                  <span>100% Secure</span>
                </div>
              </div>
            </div>

            {/* Right Card: Our Trusted Partners */}
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8C92A4] mb-4">
                  OUR TRUSTED PARTNERS
                </h4>

                {/* Partner Logos Flex Wrap */}
                <PartnerCards />
              </div>
            </div>

          </div>

          {/* Bottom Full-width Light Blue Banner */}
          <div className="bg-[#EBF1FF] rounded-[24px] p-5 sm:p-6 border border-[#0D52FF]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0D52FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-[#181B25] max-w-3xl leading-relaxed">
                Join thousands of happy customers who trust Elimi for mobility, events, media, shopping and protocol services.
              </p>
            </div>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="bg-[#0D52FF] hover:bg-[#0B44D8] text-white text-xs sm:text-sm font-extrabold px-6 py-3 rounded-full shadow-md transition whitespace-nowrap flex items-center gap-2 shrink-0 group"
            >
              <span>Explore Elimi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>

      {/* ==================== INTERACTIVE MODALS ==================== */}

      {/* 1. AI Search Assistant Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-slate-100"
            >
              <button
                onClick={() => setShowAiModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0D52FF] text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xl text-[#181B25]">Elimi AI Assistant</h4>
                  <p className="text-xs text-[#525866]">Ask anything about vehicles, protocol, or shopping in Burundi</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <p className="font-bold text-[#181B25]">Try sample prompt:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAiPromptInput('Find me a Prado in Bujumbura for 2 days')}
                      className="bg-white hover:bg-slate-100 text-[#0D52FF] font-semibold border border-slate-200 px-3 py-1.5 rounded-full text-xs"
                    >
                      &quot;Find me a Prado in Bujumbura for 2 days&quot;
                    </button>
                    <button
                      onClick={() => setAiPromptInput('I need 4 protocol guards for a VIP reception')}
                      className="bg-white hover:bg-slate-100 text-[#0D52FF] font-semibold border border-slate-200 px-3 py-1.5 rounded-full text-xs"
                    >
                      &quot;I need 4 protocol guards&quot;
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="Type your request here..."
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-xs font-medium text-[#181B25] focus:outline-none focus:border-[#0D52FF]"
                  />
                  <button
                    onClick={() => {
                      if (aiPromptInput) setActiveQuery(aiPromptInput);
                      setShowAiModal(false);
                    }}
                    className="absolute right-2 top-2 bg-[#0D52FF] text-white p-1.5 rounded-xl hover:bg-[#0B44D8] transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-[#181B25] font-bold rounded-full py-3 text-xs transition"
              >
                Close Assistant
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. WhatsApp Direct Connect Modal */}
      <AnimatePresence>
        {showWhatsAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100"
            >
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center font-bold">
                  <MessageCircle className="w-6 h-6 fill-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xl text-[#181B25]">ELIMI WhatsApp Booking</h4>
                  <p className="text-xs text-[#525866]">Instant Response Team</p>
                </div>
              </div>

              <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-2xl text-xs text-[#525866] mb-6 border border-slate-200/80">
                <p className="font-bold text-[#181B25]">How WhatsApp payment works:</p>
                <p>1. Our agent reviews your request immediately.</p>
                <p>2. We generate an Lumicash or Ecocash payment prompt.</p>
                <p>3. Your booking is instantly locked with 100% money-back guarantee.</p>
              </div>

              <a
                href="https://wa.me/25764444546?text=Hello%20Elimi%20Team!%20I%20would%20like%20to%20confirm%20my%20booking."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppModal(false)}
                className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold rounded-full py-3.5 px-6 shadow-md transition flex items-center justify-center gap-2 text-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Continue to WhatsApp (+257 64 44 45 46)</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
