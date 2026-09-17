"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";

/**
 * ============================================================================
 * ELIMI SERVICES DATA ARRAY
 * ----------------------------------------------------------------------------
 * Easily add or edit services by modifying objects in this array.
 * Each service contains an image and the display name.
 * ============================================================================
 */
export interface ElimiService {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  badge?: string;
  detailText?: string;
  link: string;
}

export const SERVICES_LIST: ElimiService[] = [
  {
    id: "elimi-media",
    name: "ELIMI MEDIA",
    category: "Media & Production",
    description:
      "High-definition video production, documentaries, event coverage, and digital media stories across East Africa.",
    image:
      "https://plus.unsplash.com/premium_photo-1688561384438-bfa9273e2c00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fE1lZGlhfGVufDB8fDB8fHww",
    badge: "Media",
    detailText:
      "ELIMI Media produces top-tier cinematic videography, 4K multi-camera streaming, and promotional storytelling tailored for brands and major cultural events.",
    link: "/media",
  },
  {
    id: "elimi-shop",
    name: "ELIMI SHOP",
    category: "Verified E-Commerce",
    description:
      "Curated e-commerce hub for authentic African attire, high-end electronics, luxury watches, and local artisan goods.",
    image: "/assets/shop/african-suit.jpg",
    badge: "Boutique",
    detailText:
      "Browse verified, guaranteed authentic items with fast delivery across Bujumbura and direct international shipping options.",
    link: "/shop",
  },
  {
    id: "elimi-car-rental",
    name: "ELIMI CAR RENTAL",
    category: "Luxury Fleet & Mobility",
    description:
      "Chauffeur-driven and self-drive luxury SUVs, Toyota Prados, Mercedes V-Class vans, and executive sedans.",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    badge: "Fleet",
    detailText:
      "Inspected, fully insured luxury fleet available for daily, weekly, or long-term lease in Burundi with professional drivers.",
    link: "/cars",
  },
  {
    id: "elimi-houses",
    name: "REAL ESTATE & HOUSES",
    category: "Luxury Living & Rentals",
    description:
      "Verified residential villas, modern executive apartments, and commercial real estate properties across Burundi.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    badge: "Real Estate",
    detailText:
      "Explore long-term rentals, luxury vacation stays, and verified real estate listings with full legal transparency.",
    link: "/houses",
  },
  {
    id: "elimi-protocol",
    name: "ELIMI PROTOCOL",
    category: "VIP Security & Escort",
    description:
      "Elite uniformed protocol guards, executive escorts, and multilingual VIP hostesses for high-profile events.",
    image: "/assets/package_calculator/ELIMI_PROTOCOL_GIRL.webp",
    badge: "VIP Protocol",
    detailText:
      "Turnkey event protocol management ensuring guest safety, seamless arrivals, registration desk management, and executive hospitality.",
    link: "/protocol",
  },
  {
    id: "elimi-digital-marketing",
    name: "DIGITAL MARKETING",
    category: "Social & Brand Strategy",
    description:
      "Strategic social media management, viral short-form video campaigns, SEO, and performance brand growth.",
    image:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=600&q=80",
    badge: "Marketing",
    detailText:
      "High-conversion advertising campaigns, social media management, influencer partnerships, and brand positioning.",
    link: "/digital-marketing",
  },
  {
    id: "elimi-web-dev",
    name: "WEB DEVELOPMENT",
    category: "Web & Digital Platforms",
    description:
      "Custom website development, mobile-responsive web apps, e-commerce platforms, and digital solutions.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    badge: "Web Dev",
    detailText:
      "End-to-end web engineering, web applications, and e-commerce portals engineered for modern enterprises.",
    link: "/digital-marketing#web-development",
  },
  {
    id: "elimi-printbe",
    name: "PRINT BE",
    category: "Commercial Printing & Branding",
    description:
      "High-definition roll-up banners, custom corporate apparel, merchandise, signage, and large format printing.",
    image:
      "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fE1lZGlhfGVufDB8fDB8fHww",
    badge: "Printing",
    detailText:
      "Premium corporate print suite delivering promotional materials, custom attire, and event branding with fast turnaround.",
    link: "/printbe",
  },
  {
    id: "elimi-nails",
    name: "NAILS & BEAUTY STUDIO",
    category: "Salon & Beauty Care",
    description:
      "Professional gel nail art, manicures, pedicures, and executive beauty care services.",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80",
    badge: "Beauty",
    detailText:
      "Luxury salon experience offering bespoke nail designs, hand and foot spa treatments, and beauty care.",
    link: "/nails",
  },
  {
    id: "elimi-events",
    name: "ELIMI EVENTS",
    category: "Turnkey Event Planning",
    description:
      "All-in-one event design, stage lighting, sound systems, catering, and decoration for weddings and galas.",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
    badge: "Events",
    detailText:
      "Custom package builder combining vehicles, security, staging, catering, and media coverage into one seamless event management service.",
    link: "/#events",
  },
];

export default function OurServicesSection() {
  // Repeat items to ensure smooth continuous marquee sliding
  const marqueeItems = [...SERVICES_LIST, ...SERVICES_LIST, ...SERVICES_LIST];

  return (
    <section
      className="w-full py-12 sm:py-16 px-0 text-[#0F172A] font-sans antialiased bg-[#F8F9FA]"
      id="services"
    >
      {/* Section Header */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3 border border-[#0B57FF]/20 shadow-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>OUR SERVICES</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Explore <span className="text-[#0B57FF]">Our Services</span>
            </h2>

            {/* Subtitle with accent border */}
            <p className="mt-3 text-[#64748B] text-base sm:text-lg font-normal max-w-2xl border-l-2 border-[#0B57FF] pl-4">
              From media production to VIP protocol, mobility, and verified
              commerce—discover the ELIMI ecosystem.
            </p>
          </div>

          {/* Hover Hint */}
          <div className="hidden sm:inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#0F172A]/8 text-xs font-medium text-[#64748B] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0B57FF] animate-pulse"></span>
            <span>Hover to pause &bull; Click card to explore</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          FULL SCREEN-EXTREMITY DARK STAMP TICKER RIBBON (SUBTLE OBLIQUE ANGLE)
         ==================================================================== */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-10 sm:py-16 my-2 sm:my-6">
        <div className="relative w-[140vw] left-1/2 -translate-x-1/2 bg-[#080E1A] text-white shadow-2xl py-10 sm:py-14 transform -rotate-2 scale-105 sm:scale-108">
          {/* Top Scalloped Stamp Demi-Circles Cutout */}
          <div
            className="absolute top-0 left-0 right-0 h-[18px] w-full z-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 11px 0px, #F8FAFC 9px, transparent 9.5px)",
              backgroundSize: "22px 18px",
              backgroundRepeat: "repeat-x",
            }}
          />

          {/* Bottom Scalloped Stamp Demi-Circles Cutout */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[18px] w-full z-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 11px 18px, #F8FAFC 9px, transparent 9.5px)",
              backgroundSize: "22px 18px",
              backgroundRepeat: "repeat-x",
            }}
          />

          {/* Edge Gradient Smooth Fades */}
          <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#080E1A] via-[#080E1A]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#080E1A] via-[#080E1A]/80 to-transparent z-10 pointer-events-none" />

          {/* Infinite Marquee Motion Container */}
          <div className="flex gap-6 sm:gap-10 animate-marquee hover:[animation-play-state:paused] items-center py-4 px-0 cursor-pointer">
            {marqueeItems.map((service, index) => (
              <Link
                key={`${service.id}-tall-card-${index}`}
                href={service.link}
                className="group flex-none relative w-[280px] sm:w-[350px] md:w-[400px] bg-[#101827] hover:bg-[#18243A] rounded-[24px] border-0 outline-hidden overflow-hidden transition-all duration-300 shadow-2xl hover:scale-[1.03] flex flex-col"
              >
                {/* Bigger Picture Frame */}
                <div className="relative w-full h-[240px] sm:h-[280px] md:h-[320px] overflow-hidden bg-slate-900">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-contain object-center p-2 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Dark Gradient Overlay for Title Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080E1A] via-black/30 to-transparent" />

                  {/* Service Title Floating over the Picture */}
                  <div className="absolute bottom-5 left-6 right-6 z-10">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-none drop-shadow-lg group-hover:text-[#3B72FF] transition-colors">
                      {service.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
