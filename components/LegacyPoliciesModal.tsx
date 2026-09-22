'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Scale, Lock, RefreshCw, Mail, Phone, ExternalLink } from 'lucide-react';
import { useCmsPage } from '@/lib/firestore-cms';

interface LegacyPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'legacy' | 'terms' | 'privacy' | 'refund' | 'license';
}

export default function LegacyPoliciesModal({
  isOpen,
  onClose,
  defaultTab = 'legacy',
}: LegacyPoliciesModalProps) {
  const [activeTab, setActiveTab] = useState<'legacy' | 'terms' | 'privacy' | 'refund' | 'license'>(defaultTab);
  const { data: cmsPolicyPage } = useCmsPage('policies');

  const policyContent = cmsPolicyPage?.sections?.[0]?.content || {
    title: 'ELIMI Official Legacy & Policies',
    subtitle: 'Governing VIP Protocol, Luxury Mobility, Real Estate, E-Commerce, Custom Print & Allocations',
    effectiveDate: 'Effective Date: October 2024',
    legacyMission: `Founded with the ambition to elevate Burundian hospitality, creative print, and commerce to world-class standards, ELIMI stands for unwavering precision, elegance, and integrity. 

Our legacy is built on bridging local craftsmanship and talent with international standards—providing distinguished leaders, visiting delegations, and clients with uncompromised quality across mobility, event protocol, luxury accommodations, and bespoke production. We believe that every interaction must reflect royal dignity and impeccable care.`,
    termsOfService: `1. ACCEPTANCE OF TERMS: By accessing or utilizing any ELIMI service (including VIP Protocol Staffing, Fleet Mobility, Real Estate Brokerage, Custom Print Production, and E-commerce Boutiques), clients agree to be bound by these official Terms of Service.

2. BOOKING & PROTOCOL PROTOCOLS: Vehicle reservations, armed or close protection escorts, and protocol hostess teams require advance scheduling. All drivers and security officers operate under strictly governed legal guidelines and road safety regulations.

3. PAYMENT & SECURITY DEPOSITS: Rentals and allocations may require a refundable security deposit. Payments are accepted via verified channels (Lumicash, Ecocash, Credit Cards, Bank Transfer). Deposits are returned immediately upon inspection of returned assets.

4. INTELLECTUAL PROPERTY & ARTWORK: For Print and production services, clients confirm ownership or commercial authorization for submitted visual assets. ELIMI guarantees commercial color fidelity and substrate quality as agreed in digital proofs.`,
    privacyPolicy: `1. CLIENT CONFIDENTIALITY: ELIMI enforces strict non-disclosure for all VIP, diplomatic, and executive clients. Personal travel itineraries, residential addresses, and private event details are never disclosed to third parties.

2. DATA COLLECTION & STORAGE: We collect necessary transactional information (names, contact numbers, delivery addresses) solely to execute orders and bookings. Data is securely processed with industry-standard encryption.

3. COOKIES & PLATFORM METRICS: Our platform uses minimal operational cookies to maintain your shopping cart, preferred currency, and authenticated sessions. We never sell or monetize client data.`,
    refundPolicy: `1. EVENT & MOBILITY CANCELLATIONS: Notice provided 48 hours prior to deployment is eligible for a full refund or rescheduling credit. Cancellations within 24 hours may incur a 20% operational fee.

2. PRINTED GOODS & MERCHANDISE: Because custom printing is tailored to bespoke client specifications, reprints are issued free of charge in the rare event of verified manufacturing defects or color variance exceeding standard tolerance.

3. REAL ESTATE & ACCOMMODATION: Tenancy and lease deposits are held under formal escrow and governed by the Burundian Civil Code and tenancy agreements.`,
    licensePolicy: `ELIMI is a registered corporate entity operating in full compliance with the Ministry of Commerce, Transport authorities, and public registry of the Republic of Burundi. All security personnel, transport fleet vehicles, and commercial activities are fully insured, certified, and compliant with relevant domestic and international trade treaties.`,
    contactEmail: 'compliance@elimi.bi',
    contactPhone: '+257 69 992 984',
  };

  const tabs = [
    { id: 'legacy', label: 'Company Legacy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'refund', label: 'Refunds & Guarantees', icon: RefreshCw },
    { id: 'license', label: 'License & Compliance', icon: Scale },
  ] as const;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#0F172A]/8 flex flex-col overflow-hidden text-[#0F172A]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#0F172A]/8 flex items-start justify-between bg-[#F8F9FA]/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#0B57FF]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Documentation</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] font-heading">
                {policyContent.title || 'ELIMI Legacy & Policies'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1 font-mono">
                {policyContent.effectiveDate || 'Last updated: Current Session'} • {policyContent.subtitle || 'General Charter'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#0F172A]/8 px-4 sm:px-6 bg-white overflow-x-auto no-scrollbar gap-2 pt-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#0B57FF] text-[#0B57FF]'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B57FF]' : 'text-[#64748B]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-sm text-[#0F172A] leading-relaxed space-y-4">
            {activeTab === 'legacy' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#E0EBFF]/40 rounded-xl border border-[#0B57FF]/20">
                  <h3 className="font-semibold text-base text-[#0B57FF] mb-1">Our Heritage &amp; Mission</h3>
                  <p className="text-xs sm:text-sm text-[#0F172A]/80">
                    A commitment to excellence, integrity, and international prestige in Burundi and across East Africa.
                  </p>
                </div>
                <div className="whitespace-pre-line text-sm sm:text-base text-[#0F172A] leading-relaxed font-normal bg-[#F8F9FA] p-5 rounded-xl border border-[#0F172A]/6">
                  {policyContent.legacyMission}
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#0F172A]/8">
                  <h3 className="font-semibold text-sm text-[#0F172A] mb-1">Standard Terms &amp; Conditions</h3>
                  <p className="text-xs text-[#64748B]">
                    Governing commercial agreements, VIP reservations, vehicle operations, and print proofs.
                  </p>
                </div>
                <div className="whitespace-pre-line text-xs sm:text-sm text-[#0F172A] leading-relaxed font-normal p-4 bg-white rounded-xl border border-[#0F172A]/8 font-sans">
                  {policyContent.termsOfService}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h3 className="font-semibold text-sm text-emerald-900 mb-1">VIP &amp; Diplomatic Confidentiality</h3>
                  <p className="text-xs text-emerald-700">
                    We maintain strict discretion and cryptographic security for all private client data.
                  </p>
                </div>
                <div className="whitespace-pre-line text-xs sm:text-sm text-[#0F172A] leading-relaxed font-normal p-4 bg-white rounded-xl border border-[#0F172A]/8 font-sans">
                  {policyContent.privacyPolicy}
                </div>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#0F172A]/8">
                  <h3 className="font-semibold text-sm text-[#0F172A] mb-1">Refund &amp; Cancellation Policy</h3>
                  <p className="text-xs text-[#64748B]">
                    Clear policies on rental deposits, printed manufacturing warranties, and booking timelines.
                  </p>
                </div>
                <div className="whitespace-pre-line text-xs sm:text-sm text-[#0F172A] leading-relaxed font-normal p-4 bg-white rounded-xl border border-[#0F172A]/8 font-sans">
                  {policyContent.refundPolicy}
                </div>
              </div>
            )}

            {activeTab === 'license' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#0F172A]/8">
                  <h3 className="font-semibold text-sm text-[#0F172A] mb-1">Corporate Registration &amp; Accreditation</h3>
                  <p className="text-xs text-[#64748B]">
                    Authorized under Burundian trade, transport, and private enterprise licensing frameworks.
                  </p>
                </div>
                <div className="whitespace-pre-line text-xs sm:text-sm text-[#0F172A] leading-relaxed font-normal p-4 bg-white rounded-xl border border-[#0F172A]/8 font-sans">
                  {policyContent.licensePolicy}
                </div>
              </div>
            )}
          </div>

          {/* Footer Contact & Action Strip */}
          <div className="p-4 sm:p-5 border-t border-[#0F172A]/8 bg-[#F8F9FA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-4">
              <a
                href={`mailto:${policyContent.contactEmail || 'compliance@elimi.bi'}`}
                className="flex items-center gap-1.5 text-[#0B57FF] hover:underline font-semibold"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{policyContent.contactEmail || 'compliance@elimi.bi'}</span>
              </a>
              <a
                href={`tel:${policyContent.contactPhone || '+25769992984'}`}
                className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{policyContent.contactPhone || '+257 69 992 984'}</span>
              </a>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-full bg-[#0B57FF] text-white font-semibold text-xs hover:bg-[#0948D9] transition-colors cursor-pointer"
            >
              Close Document
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
