'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle, Truck, ArrowRight } from 'lucide-react';

interface ProcessSectionProps {
  onLearnMoreBulk: () => void;
  onStartUpload: () => void;
  content?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    steps?: Array<{
      number: string;
      title: string;
      description: string;
      icon?: string;
    }>;
    bannerEyebrow?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerBtnText?: string;
    bannerImage?: string;
  };
}

export default function ProcessSection({ onLearnMoreBulk, onStartUpload, content }: ProcessSectionProps) {
  const badge = content?.badge || 'Seamless Workflow';
  const title = content?.title || 'Precision Print in 3 Clear Steps';
  const subtitle = content?.subtitle || 'From digital artwork submission to nationwide logistics, experience effortless print management.';

  const defaultSteps = [
    {
      number: '1',
      title: '1. Upload Artwork',
      description: 'Upload vector graphics, logos, or print files. Instant automatic format check & CMYK profile conversion.',
    },
    {
      number: '2',
      title: '2. Proof & Approval',
      description: 'Inspect high-fidelity digital proofs. Verify bleed boundaries, substrate weights, and finishing details.',
    },
    {
      number: '3',
      title: '3. Production & Delivery',
      description: 'Precision digital or offset printing with rigorous QA checks, dispatched nationwide with real-time tracking.',
    },
  ];

  const steps = content?.steps && content.steps.length > 0 ? content.steps : defaultSteps;
  const bannerEyebrow = content?.bannerEyebrow || 'Volume Scaling';
  const bannerTitle = content?.bannerTitle || 'Order in Bulk & Save Up To 30%';
  const bannerSubtitle = content?.bannerSubtitle || 'Scale corporate stationery, marketing collateral, or packaging. Tiered volume discounts automatically apply at checkout for qualifying quantities.';
  const bannerBtnText = content?.bannerBtnText || 'Calculate Bulk Savings';
  const bannerImg = content?.bannerImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1LSbuSdsvyupryCiMxlCe552i3ij-ADw8v-M0OuJAOH_cLzgQb2ulAbNMVJwz4i_fMmRNmexjzY3psMJttD1kZDrxlb98fbluMeR59nsK7CgaO5sChvcpww2xZn4WFCvO5yX7ezQiMtA4mW7UT8hOXPCMYeh_Kaemg1fRQChUpk1k0BBmKpn0h92Phel052QytxWeTwvc_GZlg6HqBxrT_iHdqh3E3Z7twtFDp0uSIapUCFINBUuU';

  const icons = [Upload, CheckCircle, Truck];

  return (
    <section id="process" className="bg-white py-16 lg:py-24 text-[#0F172A] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-14 sm:mb-18 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#0B57FF]/20">
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-medium mb-3 leading-tight font-heading tracking-[-0.02em] text-[#0F172A]">
            {title}
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base font-normal">
            {subtitle}
          </p>
        </div>

        {/* Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16 relative">
          {steps.map((step, idx) => {
            const IconComponent = icons[idx % icons.length] || Upload;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 flex flex-col items-center cursor-pointer group hover:bg-white hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] hover:border-[#0B57FF]/30 transition-all duration-300"
                onClick={idx === 0 ? onStartUpload : undefined}
              >
                <div className="w-16 h-16 bg-[#E0EBFF] text-[#0B57FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#0B57FF] group-hover:text-white transition-all duration-300 border border-[#0B57FF]/20">
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
                  {step.title}
                </h3>
                <p className="text-[#64748B] text-xs sm:text-sm max-w-xs leading-relaxed font-normal">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Promo Banner Block */}
        <motion.div 
          id="bulk-discount"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#F8F9FA] rounded-2xl p-8 sm:p-10 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          {/* Left Text */}
          <div className="w-full md:w-1/2 relative z-10">
            <div className="border-l-3 border-[#0B57FF] pl-4 mb-3">
              <span className="text-[#0B57FF] font-semibold uppercase tracking-wider text-xs">
                {bannerEyebrow}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-medium mb-3 text-[#0F172A] leading-tight font-heading tracking-[-0.02em]">
              {bannerTitle}
            </h3>

            <p className="text-[#64748B] mb-6 max-w-md text-sm leading-relaxed font-normal">
              {bannerSubtitle}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLearnMoreBulk}
              className="bg-[#0B57FF] hover:bg-[#0948d9] text-white px-6 py-3 rounded-full font-semibold text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{bannerBtnText}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative z-10">
            <div className="relative group max-w-sm">
              <img
                src={bannerImg}
                alt="Bulk Printing Brochures"
                className="max-w-full h-auto max-h-56 object-contain rounded-xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500 shadow-md"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
