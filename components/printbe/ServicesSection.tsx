'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ServicesSectionProps {
  onSelectCategory: (categoryName: string) => void;
  content?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    items?: Array<{
      id: string;
      title: string;
      subtitle: string;
      image: string;
      tags?: string[];
      badge?: string;
    }>;
  };
}

const defaultServices = [
  {
    id: 'apparel',
    title: 'Custom Apparel',
    subtitle: 'T-Shirts, Hoodies, Polos & Caps',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhSvRw53ZDp7iCDW0qzgcTC09hwaqYUXfiIpp_DLl6N0zDLE-c1WIlH_ArA5fBIxiK7C9jCeJBC7VcLE76WfSrigue4Mx0NjdMROw_IvbkH6z0h_Zs2W7hsX11RqGsWkt_sVa_2rtj9Ka6vvx4tFXUlngoc-C9HAfe-yUSyi6Vt8TuHqD9G0etNHJG4WoBT3rgBxpbn3ATQ3zHo9ws-TkG-iw63hnMHF2HY2KDdqYwjycIXCw3NJeH',
    tags: ['Screen Print', 'Embroidery', 'DTG'],
    badge: 'Popular',
  },
  {
    id: 'stationery',
    title: 'Business Stationery',
    subtitle: 'Business Cards, Letterheads & Envelopes',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmkMZDKFG7Vtk6n5FbbM8NhO4JPHW5WOWB7Ajr37ExAXk0L47VCa4aJgtymW63w-QvLVOETD4EsShOS4MP7sbcwDsDANzG9h3vLMRw9becoEUZZosJ0aD40mSMQ1NNhBO1kdB0QL9mNKD23IFHI4Fd0CJ-RyAUgUnqSI1OM28eV1b87nwQq8fvkutdrrWw9pGJZTBmDLd1BysdOfvr_zSnnIuyWTNCBkMY3vAxbvIV_Xj8FhG8Rvxm',
    tags: ['Foil Stamping', 'Spot UV', 'Textured Paper'],
    badge: 'Essential',
  },
  {
    id: 'packaging',
    title: 'Packaging & Labels',
    subtitle: 'Custom Boxes, Jars, Stickers & Bags',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS',
    tags: ['Corrugated', 'Rigid Boxes', 'Die-Cut Labels'],
    badge: 'Best Value',
  },
  {
    id: 'promotional',
    title: 'Promotional Items',
    subtitle: 'Bottles, Mugs, Notebooks & Swag Kits',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuihW_pUe9stC3071PxkFCybFiONj-Joq-OTe_GcElx3MEKgsREWjQjuImSsM2PcbMudIykONgtdXMM716DZ8Ru0dtfOPpYA-vjiB0te8iBBuiBzM3bhToAmIqf3VUbAXXLxhmFNOKGUZCUx8PT2tgok6FgBo652kvUN2Ci8UKa1vLEb-9NsrjpShyL631d6W_olAEswb5bw6VRgUYk9xdLaLqGHCypmw__8DXqOmvApifka6JgMpm',
    tags: ['Laser Engraved', 'Pad Print', 'Full Wrap'],
    badge: 'Corporate',
  },
];

export default function ServicesSection({ onSelectCategory, content }: ServicesSectionProps) {
  const [activeDot, setActiveDot] = useState(0);

  const title = content?.title || 'Premier Custom Print Solutions';
  const subtitle = content?.subtitle || 'Select a category to explore instant configuration, material choices, and digital proofing options.';
  const badge = content?.badge || 'Specialized Categories';
  const items = content?.items && content.items.length > 0 ? content.items : defaultServices;

  return (
    <section id="services" className="py-16 lg:py-24 bg-[#F8F9FA] border-y border-[#0F172A]/8 text-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#0B57FF]/20">
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-medium text-[#0F172A] leading-tight font-heading tracking-[-0.02em]">
            {title}
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base mt-3 max-w-lg mx-auto font-normal">
            {subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                setActiveDot(idx);
                onSelectCategory(item.title);
              }}
              className="bg-white p-6 rounded-2xl shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-300 text-center group cursor-pointer border border-[#0F172A]/8 flex flex-col items-center justify-between"
            >
              {/* Image Container */}
              <div className="w-full h-48 mb-5 flex items-center justify-center overflow-hidden bg-[#F8F9FA] rounded-xl p-3 border border-[#0F172A]/4">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carousel Pagination Dots Indicator */}
        <div className="flex justify-center mt-10 gap-2">
          {[0, 1, 2].map((dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveDot(dotIdx)}
              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeDot === dotIdx ? 'bg-[#0B57FF] w-6' : 'bg-[#0F172A]/20 hover:bg-[#0F172A]/40'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
