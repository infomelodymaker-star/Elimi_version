'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle, Truck, ArrowRight } from 'lucide-react';

interface ProcessSectionProps {
  onLearnMoreBulk: () => void;
  onStartUpload: () => void;
}

export default function ProcessSection({ onLearnMoreBulk, onStartUpload }: ProcessSectionProps) {
  return (
    <section id="process" className="bg-white py-16 lg:py-24 text-[#0F172A] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-14 sm:mb-18 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#0B57FF]/20">
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-medium mb-3 leading-tight font-heading tracking-[-0.02em] text-[#0F172A]">
            Precision Print in <span className="text-[#0B57FF] font-semibold">3 Clear Steps</span>
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base font-normal">
            From digital artwork submission to nationwide logistics, experience effortless print management.
          </p>
        </div>

        {/* 3 Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16 relative">
          
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 flex flex-col items-center cursor-pointer group hover:bg-white hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] hover:border-[#0B57FF]/30 transition-all duration-300"
            onClick={onStartUpload}
          >
            <div className="w-16 h-16 bg-[#E0EBFF] text-[#0B57FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#0B57FF] group-hover:text-white transition-all duration-300 border border-[#0B57FF]/20">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
              1. Upload Artwork
            </h3>
            <p className="text-[#64748B] text-xs sm:text-sm max-w-xs leading-relaxed font-normal">
              Upload vector graphics, logos, or print files. Instant automatic format check &amp; CMYK profile conversion.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-8 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 flex flex-col items-center group hover:bg-white hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] hover:border-[#0B57FF]/30 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-[#E0EBFF] text-[#0B57FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#0B57FF] group-hover:text-white transition-all duration-300 border border-[#0B57FF]/20">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
              2. Proof &amp; Approval
            </h3>
            <p className="text-[#64748B] text-xs sm:text-sm max-w-xs leading-relaxed font-normal">
              Inspect high-fidelity digital proofs. Verify bleed boundaries, substrate weights, and finishing details.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-8 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 flex flex-col items-center group hover:bg-white hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] hover:border-[#0B57FF]/30 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-[#E0EBFF] text-[#0B57FF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#0B57FF] group-hover:text-white transition-all duration-300 border border-[#0B57FF]/20">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
              3. Production &amp; Delivery
            </h3>
            <p className="text-[#64748B] text-xs sm:text-sm max-w-xs leading-relaxed font-normal">
              Precision digital or offset printing with rigorous QA checks, dispatched nationwide with real-time tracking.
            </p>
          </motion.div>
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
                Volume Scaling
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-medium mb-3 text-[#0F172A] leading-tight font-heading tracking-[-0.02em]">
              Order in Bulk &amp; <br />
              <span className="text-[#0B57FF] font-semibold">Save Up To 30%</span>
            </h3>

            <p className="text-[#64748B] mb-6 max-w-md text-sm leading-relaxed font-normal">
              Scale corporate stationery, marketing collateral, or packaging. Tiered volume discounts automatically apply at checkout for qualifying quantities.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLearnMoreBulk}
              className="bg-[#0B57FF] hover:bg-[#0948d9] text-white px-6 py-3 rounded-full font-semibold text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Calculate Bulk Savings</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative z-10">
            <div className="relative group max-w-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1LSbuSdsvyupryCiMxlCe552i3ij-ADw8v-M0OuJAOH_cLzgQb2ulAbNMVJwz4i_fMmRNmexjzY3psMJttD1kZDrxlb98fbluMeR59nsK7CgaO5sChvcpww2xZn4WFCvO5yX7ezQiMtA4mW7UT8hOXPCMYeh_Kaemg1fRQChUpk1k0BBmKpn0h92Phel052QytxWeTwvc_GZlg6HqBxrT_iHdqh3E3Z7twtFDp0uSIapUCFINBUuU"
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
