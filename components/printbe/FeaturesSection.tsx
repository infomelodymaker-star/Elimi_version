'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Box, Truck, ShieldCheck, Clock } from 'lucide-react';

interface FeaturesSectionProps {
  onLearnMore?: () => void;
}

export default function FeaturesSection({ onLearnMore }: FeaturesSectionProps) {
  return (
    <section id="features" className="py-16 lg:py-24 bg-white text-[#0F172A] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Image Composition & Experience Badge */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main Packaging Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden border border-[#0F172A]/8 bg-[#F8F9FA] shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS"
                  alt="Custom Box Packaging"
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Stacked Secondary Image Overlay */}
              <div className="absolute -bottom-8 -right-4 lg:-right-6 w-2/3 z-20 rounded-2xl overflow-hidden border-4 border-white bg-[#F8F9FA] shadow-lg hidden sm:block">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS"
                  alt="Packaging Mockups"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Floating Badge: 24+ Years of Experience */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="absolute bottom-6 -left-3 sm:-left-6 bg-white p-5 rounded-xl shadow-md border border-[#0F172A]/8 z-30 flex flex-col items-center min-w-[150px]"
              >
                <span className="text-3xl sm:text-4xl font-bold text-[#0B57FF] tracking-tight font-heading">24+</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] mt-0.5">Years Experience</span>
                <span className="text-[10px] text-[#64748B] font-medium">Custom Printing</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Text Content & Key Features */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 mt-8 lg:mt-0"
          >
            <div className="border-l-3 border-[#0B57FF] pl-4 mb-3">
              <span className="text-[#0B57FF] font-semibold uppercase tracking-widest text-xs block">
                Craftsmanship &amp; Engineering
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-medium text-[#0F172A] mb-5 leading-tight font-heading tracking-[-0.02em]">
              Reasons To <span className="text-[#0B57FF] font-semibold">Choose Our</span> Printing Studio
            </h2>

            <p className="text-[#64748B] mb-8 text-sm sm:text-base leading-relaxed font-normal">
              We deliver enterprise-grade printing solutions customized to your brand requirements, ensuring color fidelity, crisp vector detail, and durable substrates across every single piece.
            </p>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 group p-4 rounded-xl hover:bg-[#F8F9FA] transition-colors border border-transparent hover:border-[#0F172A]/6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E0EBFF] text-[#0B57FF] rounded-xl flex items-center justify-center group-hover:bg-[#0B57FF] group-hover:text-white transition-colors duration-200 border border-[#0B57FF]/20">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1 group-hover:text-[#0B57FF] transition-colors">
                    Premium Substrates &amp; Inks
                  </h3>
                  <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">
                    Engineered for vivid gamut range, sharp fine lines, and long-lasting UV &amp; scuff resistance.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 group p-4 rounded-xl hover:bg-[#F8F9FA] transition-colors border border-transparent hover:border-[#0F172A]/6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E0EBFF] text-[#0B57FF] rounded-xl flex items-center justify-center group-hover:bg-[#0B57FF] group-hover:text-white transition-colors duration-200 border border-[#0B57FF]/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1 group-hover:text-[#0B57FF] transition-colors">
                    Expedited Nationwide Dispatch
                  </h3>
                  <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">
                    Reliable turnarounds and real-time tracking so your marketing collateral is ready ahead of schedule.
                  </p>
                </div>
              </div>

              {/* Extra Perks */}
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-[#0F172A]/8 text-xs font-semibold text-[#64748B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Quality Assurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0B57FF]" />
                  <span>Same-Day Digital Proofing</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
