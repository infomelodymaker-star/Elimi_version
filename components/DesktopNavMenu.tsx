'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/nav-menu-desktop';
import {
  House,
  ShoppingCart,
  Car,
  HousePlus,
  MonitorPlay,
  PrinterCheck,
  UsersRound,
  Brush,
  Bot,
  Sparkles,
  Boxes,
  ExternalLink,
  Phone,
  ArrowRight,
  Code2,
  Globe,
} from 'lucide-react';

export default function DesktopNavMenu() {
  const pathname = usePathname();
  const [marketMode, setMarketMode] = React.useState<'rent' | 'buy'>('rent');

  const handleOpenAI = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-elimi-ai'));
    }
  };

  const navColumnLeft = [
    {
      label: 'Home',
      href: '/',
      icon: House,
      description: 'Concierge & overview',
    },
    {
      label: 'Cars',
      href: '/cars',
      icon: Car,
      description: 'VIP fleet & rentals',
    },
    {
      label: 'Media',
      href: '/media',
      icon: MonitorPlay,
      description: 'Streams & video catalog',
    },
    {
      label: 'Protocol',
      href: '/protocol',
      icon: UsersRound,
      description: 'VIP escort & delegations',
    },
    {
      label: 'Digital Solutions',
      href: '/digital-solutions',
      icon: Code2,
      description: 'Apps, Web & Google Maps',
    },
  ];

  const navColumnRight = [
    {
      label: 'Shop',
      href: '/shop',
      icon: ShoppingCart,
      description: 'Luxury marketplace',
    },
    {
      label: 'Houses',
      href: '/houses',
      icon: HousePlus,
      description: 'Villas & residences',
    },
    {
      label: 'Print',
      href: '/print',
      icon: PrinterCheck,
      description: 'Prints & branding',
    },
    {
      label: 'Other Rentals',
      href: '/allocations',
      icon: Boxes,
      description: 'Staff & équipements à louer',
    },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <NavigationMenu align="center">
        <NavigationMenuList className="glass rounded-full px-2 py-1 shadow-lg border border-white/60 flex items-center gap-1">
          {/* =========================================================================
              1. SERVICES / NAVIGATION MENU (Matches Screenshot Exactly)
             ========================================================================= */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-slate-800 hover:text-[#0D52FF] font-semibold text-xs sm:text-sm">
              Services
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[560px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100">
                {/* Header with Title */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Navigation Menu
                  </span>
                </div>

                {/* 2-Column Navigation Grid matching screenshot */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 py-1">
                  {/* Left Column: Home, Cars, Media, Protocol */}
                  <div className="space-y-1">
                    {navColumnLeft.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/'
                          ? pathname === '/'
                          : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                      return (
                        <NavigationMenuLink
                          key={item.href}
                          render={
                            <Link
                              href={item.href}
                              className={`group flex items-center gap-3 w-full text-left rounded-lg px-3 py-2 text-sm transition-all duration-150 cursor-pointer ${
                                isActive
                                  ? 'bg-blue-50 text-[#0D52FF] font-medium'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <Icon
                                className={`size-4.5 shrink-0 transition-colors ${
                                  isActive
                                    ? 'text-[#0D52FF]'
                                    : 'text-slate-500 group-hover:text-slate-900'
                                }`}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span
                                  className={`text-sm leading-tight ${
                                    isActive
                                      ? 'font-semibold text-[#0D52FF]'
                                      : 'font-medium text-slate-800'
                                  }`}
                                >
                                  {item.label}
                                </span>
                                <span className="text-[11px] text-slate-400 font-normal leading-tight truncate">
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Right Column: Shop, Houses, PrintBe, Nails */}
                  <div className="space-y-1">
                    {navColumnRight.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/'
                          ? pathname === '/'
                          : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                      return (
                        <NavigationMenuLink
                          key={item.href}
                          render={
                            <Link
                              href={item.href}
                              className={`group flex items-center gap-3 w-full text-left rounded-lg px-3 py-2 text-sm transition-all duration-150 cursor-pointer ${
                                isActive
                                  ? 'bg-blue-50 text-[#0D52FF] font-medium'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <Icon
                                className={`size-4.5 shrink-0 transition-colors ${
                                  isActive
                                    ? 'text-[#0D52FF]'
                                    : 'text-slate-500 group-hover:text-slate-900'
                                }`}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span
                                  className={`text-sm leading-tight ${
                                    isActive
                                      ? 'font-semibold text-[#0D52FF]'
                                      : 'font-medium text-slate-800'
                                  }`}
                                >
                                  {item.label}
                                </span>
                                <span className="text-[11px] text-slate-400 font-normal leading-tight truncate">
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="my-2.5 h-px bg-slate-100" />

                {/* Elimi AI Action Item / Card matching screenshot */}
                <NavigationMenuLink
                  render={
                    <button
                      type="button"
                      onClick={handleOpenAI}
                      className="group flex items-center justify-between w-full rounded-xl px-3.5 py-3 bg-blue-50/70 hover:bg-blue-100/70 text-[#0D52FF] transition-all cursor-pointer border border-blue-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Bot className="size-5 shrink-0 text-[#0D52FF]" />
                        <div className="flex flex-col text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#0D52FF] leading-tight">
                              Elimi AI
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-[#0D52FF] text-white px-1.5 py-0.5 rounded-full">
                              AI 24/7
                            </span>
                          </div>
                          <span className="text-[11px] text-blue-600/80 font-normal leading-tight truncate">
                            Smart concierge, pricing &amp; services
                          </span>
                        </div>
                      </div>
                      <Sparkles className="size-4 text-[#0D52FF] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </button>
                  }
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* =========================================================================
              2. MARKET MENU (Shop divided from Rent/Buy for Houses and Cars with Toggle)
             ========================================================================= */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-slate-800 hover:text-[#0D52FF] font-semibold text-xs sm:text-sm">
              Market
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[460px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Markets Offered
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Boutique • Houses • Fleet
                  </span>
                </div>

                {/* Section 1: The Shop (E-Commerce / Boutique) */}
                <div className="py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    Boutique &amp; Retail
                  </span>
                  <NavigationMenuLink
                    render={
                      <Link
                        href="/shop"
                        className={`group flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 mt-1 transition-all duration-150 cursor-pointer ${
                          pathname === '/shop'
                            ? 'bg-slate-50 text-[#0D52FF]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <ShoppingCart className="size-5 text-slate-400 group-hover:text-[#0D52FF] transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0D52FF] transition-colors leading-tight">
                              Shop (Boutique)
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-800 group-hover:bg-blue-50 group-hover:text-[#0D52FF] px-1.5 py-0.5 rounded font-bold uppercase transition-colors">
                              Buy &amp; Order
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 group-hover:text-slate-700 font-normal leading-tight truncate mt-0.5 transition-colors">
                            African fashion suits, luxury accessories &amp; tech
                          </span>
                        </div>
                      </Link>
                    }
                  />
                </div>

                {/* Section Divider with Rent / Buy Switch Toggle */}
                <div className="my-2.5 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between px-3 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Properties &amp; Mobility
                    </span>
                    
                    {/* Switch Toggle matching reference image */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMarketMode('rent')}
                        className={`text-xs transition-colors cursor-pointer ${
                          marketMode === 'rent'
                            ? 'font-bold text-slate-900'
                            : 'font-normal text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Rent
                      </button>

                      {/* Pill Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={marketMode === 'buy'}
                        onClick={() => setMarketMode(marketMode === 'rent' ? 'buy' : 'rent')}
                        className="w-11 h-6 bg-slate-900 rounded-full p-0.5 relative inline-flex items-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D52FF] focus:ring-offset-1 shrink-0"
                        aria-label="Toggle between Rent and Buy"
                      >
                        <span
                          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out transform ${
                            marketMode === 'buy' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setMarketMode('buy')}
                        className={`text-xs transition-colors cursor-pointer ${
                          marketMode === 'buy'
                            ? 'font-bold text-slate-900'
                            : 'font-normal text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Buy
                      </button>
                    </div>
                  </div>

                  {/* Houses Link with active filter mode */}
                  <div className="flex flex-col gap-1">
                    <NavigationMenuLink
                      render={
                        <Link
                          href={`/houses?type=${marketMode === 'rent' ? 'rent' : 'sale'}`}
                          className={`group flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer ${
                            pathname === '/houses'
                              ? 'bg-slate-50 text-[#0D52FF]'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            <HousePlus className="size-5 text-slate-400 group-hover:text-[#0D52FF] transition-colors" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0D52FF] transition-colors leading-tight">
                                Houses &amp; Residences
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-800 group-hover:bg-blue-50 group-hover:text-[#0D52FF] px-1.5 py-0.5 rounded font-bold uppercase transition-colors">
                                {marketMode === 'rent' ? 'For Rent' : 'For Sale'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 group-hover:text-slate-700 font-normal leading-tight truncate mt-0.5 transition-colors">
                              {marketMode === 'rent'
                                ? 'Executive furnished villas & short-stay rentals'
                                : 'Luxury estates, villas & properties for sale'}
                            </span>
                          </div>
                        </Link>
                      }
                    />

                    {/* Cars Link with active filter mode */}
                    <NavigationMenuLink
                      render={
                        <Link
                          href={`/cars?type=${marketMode === 'rent' ? 'rent' : 'sale'}`}
                          className={`group flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer ${
                            pathname === '/cars'
                              ? 'bg-slate-50 text-[#0D52FF]'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            <Car className="size-5 text-slate-400 group-hover:text-[#0D52FF] transition-colors" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0D52FF] transition-colors leading-tight">
                                Cars &amp; VIP Fleet
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-800 group-hover:bg-blue-50 group-hover:text-[#0D52FF] px-1.5 py-0.5 rounded font-bold uppercase transition-colors">
                                {marketMode === 'rent' ? 'For Rent' : 'For Sale'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 group-hover:text-slate-700 font-normal leading-tight truncate mt-0.5 transition-colors">
                              {marketMode === 'rent'
                                ? 'Mercedes V-Class, Prado TX & VIP convoys'
                                : 'Certified luxury cars & executive fleet for purchase'}
                            </span>
                          </div>
                        </Link>
                      }
                    />
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* =========================================================================
              3. HELP & SOCIAL (Elimi AI Assistant + Social PNGs)
             ========================================================================= */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-slate-800 hover:text-[#0D52FF] font-semibold text-xs sm:text-sm">
              Help
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[420px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Support &amp; Community
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    24/7 Available
                  </span>
                </div>

                <div className="space-y-1.5 py-1">
                  {/* Contact Us Page Link */}
                  <NavigationMenuLink
                    render={
                      <Link
                        href="/contact"
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-slate-400 group-hover:text-[#0D52FF] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#0D52FF] transition-colors">
                            Contact Us
                          </div>
                          <div className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate transition-colors">
                            Get in touch & view our details
                          </div>
                        </div>
                      </Link>
                    }
                  />

                  {/* FIRST: Trigger to ELIMI AI Assistant */}
                  <NavigationMenuLink
                    render={
                      <button
                        type="button"
                        onClick={handleOpenAI}
                        className="group flex items-center justify-between w-full rounded-xl px-3.5 py-3 bg-blue-50/70 hover:bg-blue-100/70 text-[#0D52FF] transition-all cursor-pointer border border-blue-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Bot className="size-5 shrink-0 text-[#0D52FF]" />
                          <div className="flex flex-col text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#0D52FF] leading-tight">
                                Ask Monica (Elimi AI)
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#0D52FF] text-white px-1.5 py-0.5 rounded-full">
                                AI 24/7
                              </span>
                            </div>
                            <span className="text-[11px] text-blue-600/80 font-normal leading-tight truncate">
                              Instant quotes, protocol booking &amp; 24/7 answers
                            </span>
                          </div>
                        </div>
                        <Sparkles className="size-4 text-[#0D52FF] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                      </button>
                    }
                  />

                  {/* WhatsApp Link without box borders */}
                  <NavigationMenuLink
                    render={
                      <a
                        href="https://wa.me/25764444546"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <Image
                            src="/assets/icons/social/whatsapp-150x150.png"
                            alt="WhatsApp"
                            width={24}
                            height={24}
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#0D52FF] flex items-center gap-1 transition-colors">
                            WhatsApp Concierge
                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#0D52FF] transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate transition-colors">
                            +257 64 44 45 46 • Instant protocol chat
                          </div>
                        </div>
                      </a>
                    }
                  />

                  {/* Facebook Link without box borders */}
                  <NavigationMenuLink
                    render={
                      <a
                        href="https://facebook.com/elimiburundi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <Image
                            src="/assets/icons/social/facebook-150x150.png"
                            alt="Facebook"
                            width={24}
                            height={24}
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#0D52FF] flex items-center gap-1 transition-colors">
                            Facebook Page
                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#0D52FF] transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate transition-colors">
                            @elimiofficiel • News &amp; updates
                          </div>
                        </div>
                      </a>
                    }
                  />

                  {/* Instagram Link without box borders */}
                  <NavigationMenuLink
                    render={
                      <a
                        href="https://instagram.com/elimi_burundi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <Image
                            src="/assets/icons/social/instagram-150x150.png"
                            alt="Instagram"
                            width={24}
                            height={24}
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#0D52FF] flex items-center gap-1 transition-colors">
                            Instagram Official
                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#0D52FF] transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate transition-colors">
                            @elimiofficiel • Luxury stories &amp; aesthetics
                          </div>
                        </div>
                      </a>
                    }
                  />

                  {/* YouTube Link without box borders */}
                  <NavigationMenuLink
                    render={
                      <a
                        href="https://youtube.com/@elimiofficiel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          <Image
                            src="/assets/icons/social/Youtube.png"
                            alt="YouTube"
                            width={24}
                            height={24}
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#0D52FF] flex items-center gap-1 transition-colors">
                            YouTube Channel
                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#0D52FF] transition-colors" />
                          </div>
                          <div className="text-[11px] text-slate-500 group-hover:text-slate-700 truncate transition-colors">
                            ELIMI Média • Video broadcasts &amp; podcasts
                          </div>
                        </div>
                      </a>
                    }
                  />
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
