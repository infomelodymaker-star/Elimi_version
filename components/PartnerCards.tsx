'use client';

import React from 'react';
import Image from 'next/image';

export interface PartnerItem {
  id: string;
  name?: string;
  logoUrl?: string; // e.g., "/assets/icons/social/whatsapp-150x150.png"
  logoNode?: React.ReactNode; // Custom JSX icon or SVG
  href?: string;
  borderHoverClass?: string;
}

export const DEFAULT_PARTNERS: PartnerItem[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    logoUrl: '/assets/icons/social/whatsapp-150x150.png',
    borderHoverClass: 'hover:border-[#25D366]/50',
  },
  {
    id: 'lumicash',
    name: 'LUMICASH',
    logoNode: (
      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
        ☸
      </div>
    ),
    borderHoverClass: 'hover:border-amber-400',
  },
  {
    id: 'ecocash',
    name: 'ECOCASH',
    logoNode: (
      <div className="w-6 h-6 rounded-full bg-[#0B57FF] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
        EC
      </div>
    ),
    borderHoverClass: 'hover:border-blue-400',
  },
  {
    id: 'visa',
    name: 'VISA',
    logoNode: (
      <span className="font-bold italic text-sm text-[#0F172A] tracking-widest px-0.5">
        VISA
      </span>
    ),
    borderHoverClass: 'hover:border-blue-400',
  },
  {
    id: 'mastercard',
    name: 'mastercard',
    logoNode: (
      <div className="flex -space-x-1.5 items-center">
        <div className="w-4 h-4 rounded-full bg-red-500" />
        <div className="w-4 h-4 rounded-full bg-amber-400 opacity-90" />
      </div>
    ),
    borderHoverClass: 'hover:border-red-400',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    logoNode: (
      <div className="w-5 h-3.5 rounded-md bg-red-600 text-white flex items-center justify-center">
        <div className="w-0 h-0 border-y-2 border-y-transparent border-l-4 border-l-white" />
      </div>
    ),
    borderHoverClass: 'hover:border-red-400',
  },
];

interface PartnerCardsProps {
  partners?: PartnerItem[];
  className?: string;
}

export default function PartnerCards({ partners = DEFAULT_PARTNERS, className = '' }: PartnerCardsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {partners.map((partner) => {
        const hasLogo = Boolean(partner.logoUrl || partner.logoNode);
        const hasName = Boolean(partner.name && partner.name.trim().length > 0);

        // Case 1: Logo Only -> Takes the entire card
        if (hasLogo && !hasName) {
          return (
            <div
              key={partner.id}
              className={`bg-white border border-[#0F172A]/8 px-5 py-2.5 rounded-xl flex items-center justify-center min-w-[90px] h-11 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] transition-all duration-200 cursor-pointer ${
                partner.borderHoverClass || 'hover:border-[#0B57FF]/30'
              }`}
              title={partner.id}
            >
              {partner.logoUrl ? (
                <Image
                  src={partner.logoUrl}
                  alt={partner.id}
                  width={24}
                  height={24}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                partner.logoNode
              )}
            </div>
          );
        }

        // Case 2: Name Only -> Takes the entire card
        if (!hasLogo && hasName) {
          return (
            <div
              key={partner.id}
              className={`bg-white border border-[#0F172A]/8 px-5 py-2.5 rounded-xl flex items-center justify-center min-w-[90px] h-11 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] transition-all duration-200 cursor-pointer ${
                partner.borderHoverClass || 'hover:border-[#0B57FF]/30'
              }`}
            >
              <span className="font-semibold text-xs text-[#0F172A] tracking-wide whitespace-nowrap">
                {partner.name}
              </span>
            </div>
          );
        }

        // Case 3: Both Logo & Name -> Standard Card with Logo + Name
        return (
          <div
            key={partner.id}
            className={`bg-white border border-[#0F172A]/8 px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] transition-all duration-200 cursor-pointer ${
              partner.borderHoverClass || 'hover:border-[#0B57FF]/30'
            }`}
          >
            {partner.logoUrl ? (
              <Image
                src={partner.logoUrl}
                alt={partner.name || partner.id}
                width={20}
                height={20}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-5 h-5 object-contain"
              />
            ) : (
              partner.logoNode
            )}
            {hasName && (
              <span className="font-semibold text-xs text-[#0F172A] tracking-wide whitespace-nowrap">
                {partner.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
