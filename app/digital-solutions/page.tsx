'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import ElimiHeader from '@/components/ElimiHeader';
import { useSettings } from '@/components/SettingsProvider';
import { useCmsPage } from '@/lib/firestore-cms';
import { generateClientWhatsAppGreetingUrl } from '@/lib/firestore-orders';
import {
  Smartphone,
  Globe,
  LayoutDashboard,
  Boxes,
  MapPin,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Code2,
  Server,
  Sparkles,
  MessageCircle,
  Phone,
  Layers,
  Cpu,
  Database,
  ExternalLink,
  Check,
  Sliders,
  Send,
  Compass,
} from 'lucide-react';

export default function DigitalSolutionsPage() {
  const settings = useSettings();
  const { data: cmsData } = useCmsPage('digital-solutions');

  // Find CMS sections
  const heroSection = cmsData?.sections?.find((s: any) => s.id === 'hero');
  const servicesSection = cmsData?.sections?.find((s: any) => s.id === 'services');
  const googleMapsSection = cmsData?.sections?.find((s: any) => s.id === 'google-maps-spotlight');
  const processSection = cmsData?.sections?.find((s: any) => s.id === 'process');
  const ctaSection = cmsData?.sections?.find((s: any) => s.id === 'cta');

  // Fallback defaults
  const heroContent = {
    badge: heroSection?.content?.badge || 'Digital Solutions & Web Development',
    headline: heroSection?.content?.headline || 'High-Impact Digital Solutions for Growing Businesses.',
    subheadline: heroSection?.content?.subheadline || 'Mobile Apps, Web Platforms, Custom Dashboards, Inventory Systems & Google Maps Local Search Integration.',
    description: heroSection?.content?.description || 'We help entrepreneurs, enterprises, and institutions establish dominant online properties, streamline operations with bespoke software, and rank prominently on Google Maps and search results.',
    backgroundImage: heroSection?.content?.backgroundImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1600',
    backgroundVideoUrl: heroSection?.content?.backgroundVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-41589-large.mp4',
    servicesBgImage: heroSection?.content?.servicesBgImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1600',
    mapsBgImage: heroSection?.content?.mapsBgImage || 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=1600',
    ctaBgImage: heroSection?.content?.ctaBgImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600',
    btnPrimaryText: heroSection?.content?.btnPrimaryText || 'Explore Digital Services',
    btnSecondaryText: heroSection?.content?.btnSecondaryText || 'Direct WhatsApp Inquiry',
  };

  const servicesList = servicesSection?.content?.items || [
    {
      id: 'mobile-apps',
      title: 'Mobile Apps Development',
      subtitle: 'iOS & Android Native & Cross-Platform',
      description: 'Fast, fluid mobile apps engineered with React Native and Flutter. Features offline synchronization, push notifications, biometric security, and full App Store & Google Play publishing support.',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
      tags: ['iOS & Android', 'React Native', 'Flutter', 'Offline Sync', 'Biometrics'],
      badge: 'High Demand',
      icon: Smartphone,
    },
    {
      id: 'websites-creation',
      title: 'Websites & Web Platforms',
      subtitle: 'High-Performance Next.js Architecture',
      description: 'Ultra-fast, SEO-optimized web applications with editorial layout design, intuitive CMS management, frictionless checkout flows, and responsive mobile-first performance.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      tags: ['Next.js 15', 'Tailwind CSS', 'SEO Mastered', 'Sub-second Load', 'E-Commerce'],
      badge: 'Flagship',
      icon: Globe,
    },
    {
      id: 'dashboards-systems',
      title: 'Custom Dashboards & Analytics',
      subtitle: 'Executive Business Intelligence & CRM',
      description: 'Comprehensive business control centers with live KPI charts, multi-branch data synchronization, role-based access control (RBAC), and automated PDF/Excel reports.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
      tags: ['Realtime Charts', 'RBAC Security', 'Cloud Sync', 'Export Analytics'],
      badge: 'Enterprise',
      icon: LayoutDashboard,
    },
    {
      id: 'inventory-systems',
      title: 'Smart Inventory & POS Systems',
      subtitle: 'Multi-Warehouse Stock Management',
      description: 'End-to-end stock and sales tracking software with barcode/QR scanning, instant low-stock notifications, supplier logs, digital receipts, and profit margin intelligence.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
      tags: ['Barcode / QR', 'Stock Alerts', 'Multi-Store', 'Offline POS Mode'],
      badge: 'Operational',
      icon: Boxes,
    },
    {
      id: 'google-maps-identity',
      title: 'Google Maps & Online Brand Identity',
      subtitle: 'Local SEO & Digital Search Verification',
      description: 'We integrate your enterprise directly into Google Maps & Google Business Profile so local and international customers immediately find your phone number, directions, photos, and ratings in search results.',
      image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800',
      tags: ['Google Maps Pin', 'Local SEO Rank', 'Verified Profile', 'Customer Reviews'],
      badge: 'Visibility Boost',
      icon: MapPin,
    },
    {
      id: 'digital-properties',
      title: 'Digital Properties Creation',
      subtitle: 'Domains, Professional Email & Cloud Hosting',
      description: 'Turnkey creation of your company’s online footprint: custom domain registrations (.bi, .com), executive business emails (@yourbrand.com), SSL encryption, and high-availability cloud infrastructure.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      tags: ['Domain & DNS', 'Pro Mailboxes', 'Cloud Security', 'CDN Global'],
      badge: 'Foundation',
      icon: Server,
    },
  ];

  // Interactive Project Estimator State
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Websites Creation & Web Apps',
    'Google Maps & Online Brand Identity',
  ]);
  const [timelineSpeed, setTimelineSpeed] = useState<'standard' | 'express'>('standard');

  const availableOptions = [
    { name: 'Websites Creation & Web Apps', desc: 'Custom Next.js website with responsive UI & CMS', days: 10 },
    { name: 'Mobile Apps Development', desc: 'iOS & Android app with push notifications & offline store', days: 20 },
    { name: 'Custom Dashboards & Analytics', desc: 'Executive dashboard with RBAC and realtime KPI tables', days: 14 },
    { name: 'Smart Inventory & POS Systems', desc: 'Barcode/QR stock management with multi-branch sync', days: 16 },
    { name: 'Google Maps & Online Brand Identity', desc: 'Google Business profile, Maps pin verification & Local SEO', days: 4 },
    { name: 'Digital Properties & Cloud Emails', desc: 'Custom domain, business emails, DNS & Cloud hosting', days: 2 },
  ];

  const toggleOption = (name: string) => {
    if (selectedServices.includes(name)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== name));
      }
    } else {
      setSelectedServices([...selectedServices, name]);
    }
  };

  const estimatedDays = Math.max(
    5,
    selectedServices.reduce((acc, curr) => {
      const item = availableOptions.find((o) => o.name === curr);
      return acc + (item ? Math.round(item.days * 0.75) : 0);
    }, 0)
  );

  const customEstimatorWhatsAppUrl = generateClientWhatsAppGreetingUrl(
    `Hello ELIMI Digital Team! I am interested in building a custom digital project with the following scope:\n- Services: ${selectedServices.join(
      ', '
    )}\n- Delivery Speed: ${timelineSpeed === 'express' ? 'Express VIP Deployment' : 'Standard Agile Rollout'}\n- Estimated Window: ~${
      timelineSpeed === 'express' ? Math.ceil(estimatedDays * 0.65) : estimatedDays
    } business days.\n\nCould we schedule a consultation to discuss specifications and formal quote?`,
    settings.whatsappNumber
  );

  const directWhatsAppUrl = generateClientWhatsAppGreetingUrl(
    'Hello ELIMI Digital Solutions team! I would like to inquire about your web development, mobile apps, and Google Maps integration services.',
    settings.whatsappNumber
  );

  return (
    <div id="digital-solutions-root" className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-[#E0EBFF] selection:text-[#0B57FF]">
      {/* Constant Universal Header */}
      <ElimiHeader />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section id="digital-hero" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-zinc-200/80 bg-white">
          {/* Minimal Dark Video Background Overlay (e.g. Constellation / Tech Network Video) */}
          {heroContent.backgroundVideoUrl ? (
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20 bg-[#0A0E1A]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-30 filter brightness-90 contrast-110"
              >
                <source src={heroContent.backgroundVideoUrl} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-[#0F172A]/40 to-white" />
            </div>
          ) : heroContent.backgroundImage ? (
            <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden -z-10">
              <Image
                src={heroContent.backgroundImage}
                alt="Background Texture"
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#0B57FF_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#E0EBFF]/50 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Editorial Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0EBFF] border border-[#0B57FF]/20 text-[#0B57FF] text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{heroContent.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#0F172A] leading-[1.12]">
                  {heroContent.headline}
                </h1>

                <p className="text-base sm:text-lg text-[#64748B] font-medium leading-relaxed max-w-2xl">
                  {heroContent.description}
                </p>

                {/* Primary Action Buttons (Zero Popups - Clean scroll and direct WhatsApp with /assets/ icon) */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#services-section"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0B57FF] text-white font-semibold text-sm hover:bg-[#0948D4] transition-all shadow-md shadow-blue-500/10 active:scale-98"
                  >
                    <span>{heroContent.btnPrimaryText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-[#0F172A] font-semibold text-sm border-1.5 border-[#1D4ED8] hover:bg-slate-50 transition-all active:scale-98 shadow-xs"
                  >
                    <Image
                      src="/assets/icons/social/whatsapp-150x150.png"
                      alt="WhatsApp"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain shrink-0"
                    />
                    <span>{heroContent.btnSecondaryText}</span>
                  </a>

                  <a
                    href="#pricing-scope"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-[#64748B] hover:text-[#0B57FF] transition-colors"
                  >
                    <span>Instant Scope Estimate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Trust Points / Highlights */}
                <div className="pt-6 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0B57FF] shrink-0" />
                    <span className="text-xs font-semibold text-[#0F172A]">Next.js &amp; Flutter Native</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0B57FF] shrink-0" />
                    <span className="text-xs font-semibold text-[#0F172A]">Google Maps Verification</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0B57FF] shrink-0" />
                    <span className="text-xs font-semibold text-[#0F172A]">Dedicated 24/7 Cloud QA</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Visual Card with Minimalist Video Background */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white space-y-6">
                  {/* Minimalist Looping Ambient Video Background */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-screen"
                  >
                    <source
                      src={heroContent.backgroundVideoUrl}
                      type="video/mp4"
                    />
                  </video>

                  {/* Top Header Badge inside Card */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-300">ELIMI Digital Lab</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      Bujumbura • Global
                    </span>
                  </div>

                  {/* Architecture Diagram preview */}
                  <div className="relative z-10 space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/85 backdrop-blur-sm border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-slate-200">Mobile &amp; Web Engine</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/85 backdrop-blur-sm border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold text-slate-200">Google Maps Local Search</span>
                      </div>
                      <span className="text-[10px] text-blue-400 font-bold">VERIFIED PIN</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/85 backdrop-blur-sm border border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-slate-200">Inventory &amp; POS Sync</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-bold">REALTIME</span>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Performance Target</span>
                    <span className="text-emerald-400 font-bold font-mono">100 / 100 Lighthouse</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORE DIGITAL SERVICES GRID (Images FIRST on every card) */}
        <section id="services-section" className="relative py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden rounded-3xl my-8">
          {/* Dark Minimal Section Background Image Overlay */}
          {heroContent.servicesBgImage && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
              <Image
                src={heroContent.servicesBgImage}
                alt="Minimal Dark Pattern"
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover opacity-[0.03] mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA] via-transparent to-[#F8F9FA]" />
            </div>
          )}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider">
              <span>{servicesSection?.content?.badge || 'Core Digital Capabilities'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              {servicesSection?.content?.title || 'Engineered for Scale & Visibility'}
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
              {servicesSection?.content?.subtitle ||
                'From custom mobile apps and responsive web platforms to Google Maps search optimization and multi-warehouse inventory systems.'}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service: any, sIdx: number) => {
              const serviceWhatsAppUrl = generateClientWhatsAppGreetingUrl(
                `Hello ELIMI Digital Solutions! I am interested in getting a quote for: ${service.title} (${service.subtitle || ''}).`,
                settings.whatsappNumber
              );

              return (
                <div
                  key={service.id || sIdx}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* 1. IMAGE FIRST (at the top of the card with clean hover zoom and badge) */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-xs group/img">
                      <Image
                        src={service.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'}
                        alt={service.title}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      {service.badge && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#0F172A] border border-white/60 shadow-xs">
                            {service.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. TITLE & SUBTITLE */}
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
                        {service.title}
                      </h3>
                      {service.subtitle && (
                        <p className="text-xs font-semibold text-[#0B57FF] mt-0.5">{service.subtitle}</p>
                      )}
                    </div>

                    {/* 3. DESCRIPTION */}
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
                      {service.description}
                    </p>

                    {/* 4. FEATURE TAGS */}
                    {service.tags && Array.isArray(service.tags) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {service.tags.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 5. CARD BOTTOM CTA (Direct WhatsApp link with custom icon and service context) */}
                  <div className="pt-5 mt-5 border-t border-zinc-100">
                    <a
                      href={serviceWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-between gap-2 text-xs font-bold text-[#0F172A] hover:text-[#0B57FF] transition-all py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 group/btn"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src="/assets/icons/social/whatsapp-150x150.png"
                          alt="WhatsApp"
                          width={18}
                          height={18}
                          className="w-4.5 h-4.5 object-contain shrink-0"
                        />
                        <span>Inquire via WhatsApp</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#0B57FF] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. GOOGLE MAPS & LOCAL SEARCH DOMINANCE SPOTLIGHT */}
        <section id="google-maps-section" className="relative py-16 md:py-20 bg-white border-y border-zinc-200/80 overflow-hidden">
          {/* Dark Minimal Maps Background Image Overlay */}
          {heroContent.mapsBgImage && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
              <Image
                src={heroContent.mapsBgImage}
                alt="Maps Background Texture"
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover opacity-[0.04] grayscale"
              />
            </div>
          )}
          {/* Faint subtle grid pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#64748B_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Information */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Google Maps &amp; Local Business Identity</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A] leading-tight">
                  {googleMapsSection?.content?.title || 'Be Seen First When Customers Search for Your Services in Burundi'}
                </h2>

                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal">
                  {googleMapsSection?.content?.description ||
                    'Over 85% of high-intent clients find nearby businesses via Google Maps and localized Google Search. We create, optimize, verify, and manage your Google Business presence so your company appears with phone numbers, directions, photos, and live hours.'}
                </p>

                {/* 3 Pillars of Google Maps */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-zinc-200/80">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">
                        {googleMapsSection?.content?.feature1Title || 'Verified Google Maps Pinpoint & Directions'}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {googleMapsSection?.content?.feature1Desc ||
                          'Accurate geographic marker, turnkey driving instructions, and photos of your storefront or showroom.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-zinc-200/80">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">
                        {googleMapsSection?.content?.feature2Title || 'Local SEO & Keywords Optimization'}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {googleMapsSection?.content?.feature2Desc ||
                          'Rank at the top when users search for your industry in Bujumbura, Burundi, and neighboring regions.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-zinc-200/80">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">
                        {googleMapsSection?.content?.feature3Title || 'Google Business Profile Management'}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {googleMapsSection?.content?.feature3Desc ||
                          'Automated review requests, official WhatsApp/Call integration, and synchronized operating hours.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={generateClientWhatsAppGreetingUrl(
                      'Hello! I would like to get my business verified and registered on Google Maps and Google Search.',
                      settings.whatsappNumber
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0F172A] text-white font-semibold text-xs hover:bg-[#0B57FF] transition-colors shadow-md"
                  >
                    <Image
                      src="/assets/icons/social/whatsapp-150x150.png"
                      alt="WhatsApp"
                      width={18}
                      height={18}
                      className="w-4.5 h-4.5 object-contain shrink-0"
                    />
                    <span>Setup Google Maps Verification</span>
                  </a>
                </div>
              </div>

              {/* Right Simulated Interactive Search Card */}
              <div className="lg:col-span-6">
                <div className="bg-[#F8F9FA] rounded-2xl border border-zinc-200 p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs text-slate-500 shadow-xs">
                    <Search className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-slate-800 font-medium font-mono">
                      Your Business Name Bujumbura
                    </span>
                    <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">
                      #1 RANK
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">Your Brand / Enterprise</h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <span>5.0</span>
                          <span>★★★★★</span>
                          <span className="text-slate-400 font-normal">(48+ Google Reviews)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Boulevard de l&apos;UPRONA, Rohero, Bujumbura</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Phone className="w-3.5 h-3.5 mx-auto text-blue-600 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Call Now</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Compass className="w-3.5 h-3.5 mx-auto text-rose-600 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Directions</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Globe className="w-3.5 h-3.5 mx-auto text-emerald-600 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700 block">Website</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. INTERACTIVE ESTIMATOR & SCOPE BUILDER */}
        <section id="pricing-scope" className="relative py-16 md:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-10 lg:p-12 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)]">
            {/* Dark Minimal CTA Background Image Overlay */}
            {heroContent.ctaBgImage && (
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden rounded-3xl -z-10">
                <Image
                  src={heroContent.ctaBgImage}
                  alt="Minimal Dark CTA Texture"
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Toggles */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Instant Scope Builder</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                    Select Your Digital Requirements
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                    Choose the components your project needs. We will compute the estimated timeline and generate a direct WhatsApp consultation package.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {availableOptions.map((opt) => {
                    const isSelected = selectedServices.includes(opt.name);
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => toggleOption(opt.name)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#E0EBFF]/40 border-[#0B57FF] shadow-xs'
                            : 'bg-[#F8F9FA] border-zinc-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#0F172A]">{opt.name}</span>
                          </div>
                          <p className="text-xs text-[#64748B]">{opt.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected ? 'bg-[#0B57FF] text-white' : 'border border-zinc-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Dynamic Summary & Direct WhatsApp Action */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-[#F8F9FA] rounded-2xl border border-zinc-200 p-6 sm:p-7 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Modules</span>
                    <span className="text-xs font-bold bg-[#0B57FF] text-white px-2 py-0.5 rounded-full">
                      {selectedServices.length} Selected
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {selectedServices.map((service, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0B57FF] shrink-0" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Delivery Mode Toggle */}
                  <div className="pt-4 border-t border-zinc-200 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">Delivery Pace</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTimelineSpeed('standard')}
                        className={`text-xs py-2 px-3 rounded-lg font-semibold border transition-all ${
                          timelineSpeed === 'standard'
                            ? 'bg-white border-[#0B57FF] text-[#0B57FF] shadow-xs'
                            : 'bg-transparent border-zinc-200 text-slate-600'
                        }`}
                      >
                        Standard Agile
                      </button>
                      <button
                        type="button"
                        onClick={() => setTimelineSpeed('express')}
                        className={`text-xs py-2 px-3 rounded-lg font-semibold border transition-all ${
                          timelineSpeed === 'express'
                            ? 'bg-white border-[#0B57FF] text-[#0B57FF] shadow-xs'
                            : 'bg-transparent border-zinc-200 text-slate-600'
                        }`}
                      >
                        Express VIP ⚡
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Estimated Turnaround</span>
                    <span className="text-sm font-bold text-[#0B57FF]">
                      ~{timelineSpeed === 'express' ? Math.ceil(estimatedDays * 0.65) : estimatedDays} Business Days
                    </span>
                  </div>
                </div>

                <a
                  href={customEstimatorWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-[#0B57FF] text-white font-semibold text-sm hover:bg-[#0948D4] transition-all shadow-md shadow-blue-500/10 active:scale-98"
                >
                  <Image
                    src="/assets/icons/social/whatsapp-150x150.png"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span>Send Project Scope on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. DEVELOPMENT LIFECYCLE / PROCESS */}
        <section id="process-section" className="relative py-16 md:py-20 bg-white border-t border-zinc-200/80">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider">
                <span>{processSection?.content?.badge || 'Disciplined Engineering'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
                {processSection?.content?.title || 'From Concept to High-Performance Deployment'}
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
                {processSection?.content?.subtitle ||
                  'A structured 4-step delivery pipeline engineered to eliminate technical debt and maximize business ROI.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: processSection?.content?.step1Title || '1. Discovery & Architecture',
                  desc: processSection?.content?.step1Desc || 'We analyze your workflows, database schema, target audience, and Google Maps presence goals.',
                  icon: Layers,
                },
                {
                  step: '02',
                  title: processSection?.content?.step2Title || '2. UI/UX Design System',
                  desc: processSection?.content?.step2Desc || 'Pixel-perfect wireframes and responsive prototypes tailored for mobile and desktop screens.',
                  icon: Sparkles,
                },
                {
                  step: '03',
                  title: processSection?.content?.step3Title || '3. Full-Stack Engineering',
                  desc: processSection?.content?.step3Desc || 'Clean, performant TypeScript code, robust cloud APIs, secure authentication, and offline capabilities.',
                  icon: Code2,
                },
                {
                  step: '04',
                  title: processSection?.content?.step4Title || '4. Cloud Launch & Google Setup',
                  desc: processSection?.content?.step4Desc || 'Production deployment, Google Maps verification, staff training, and continuous technical support.',
                  icon: Zap,
                },
              ].map((p, idx) => {
                const PIcon = p.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-[#F8F9FA] border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#0B57FF] bg-blue-50 px-2 py-0.5 rounded">
                        {p.step}
                      </span>
                      <PIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{p.title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. CALL TO ACTION FOOTER BANNER */}
        <section id="cta-section" className="py-16 md:py-24 bg-[#0F172A] text-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
              {ctaSection?.content?.title || 'Ready to build your custom digital solution?'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {ctaSection?.content?.description ||
                'Speak directly with our senior software architects to scope your mobile app, website, inventory platform, or Google Maps setup.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#0B57FF] text-white font-bold text-sm hover:bg-[#0948D4] transition-all shadow-lg shadow-blue-500/20 active:scale-98"
              >
                <Image
                  src="/assets/icons/social/whatsapp-150x150.png"
                  alt="WhatsApp"
                  width={22}
                  height={22}
                  className="w-5.5 h-5.5 object-contain shrink-0"
                />
                <span>{ctaSection?.content?.primaryButtonText || 'Chat on WhatsApp'}</span>
              </a>

              <a
                href={`tel:${settings.phoneNumber || '+257 79 000 000'}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-all border border-slate-700"
              >
                <Phone className="w-4 h-4" />
                <span>Call Concierge: {settings.phoneNumber || '+257 79 000 000'}</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
