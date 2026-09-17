'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewGallery: () => void;
}

export default function HeroSection({ onGetStarted, onViewGallery }: HeroSectionProps) {
  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-[#F8F9FA] border-b border-[#0F172A]/8 text-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 pr-0 lg:pr-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#0B57FF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]" />
              Premier Printing Hub
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.08] mb-6 tracking-[-0.03em] font-heading text-[#0F172A]">
              Precision Print <br />
              <span className="text-[#0B57FF] font-semibold">
                &amp; Custom Packaging
              </span>
            </h1>

            <p className="text-base sm:text-lg mb-8 text-[#64748B] max-w-lg leading-relaxed font-normal">
              Your trusted partner for custom printing solutions. High-fidelity color accuracy, premium substrates, and fast nationwide turnaround delivered to your doorstep.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="bg-[#0B57FF] hover:bg-[#0948d9] text-white px-7 py-3.5 rounded-full font-semibold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="flex items-center gap-3">
                {/* User Avatars */}
                <div className="flex -space-x-2.5">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxRnqsFxxJC3yPYvykWUeIFI3tJecopSYfzl10XZNgCIIxbjwvp7jvNhGqEVns40gd10tPOWuGIwKFqtCtUQ38klIzOJzLHFUHOTrQLlz-zNigs77qY_bekQHQzBWwZfDJKivPz1095jBlOJSd1W4H1UqPrLnRmBoDfXre_tzDC0Udm3agNwkojQSRL0_uY8ZN7bsycRWvefdObzXAvXhh5dz9qwoCZXlaTScZmeThcQfWTVk6uI9r"
                    alt="Satisfied Client"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvyw7yDYyDWXy1swZ6TXmGxv8DSm-oCu9Cr0671aQlw8KMJGl981sBVzQgKQ_-xDV0nm9jccZjfsEsvI815AlSF5szhtKuZBxrXbKoGJHQjTKWYkJCM9u0GVpBjg4wjCIZJQsoqC0ocCd6j15et1i6EXgIJuDUk0R8wxeGcx-sgC1iz4K4v0ZXLlVX8sNHjSmzUGZL6oRU9WxVful6PF3SEP1ngfcMd1UrUeFlLILbPpvsbkionfqg"
                    alt="Satisfied Client"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0xTl_0zzHiGRNCLSZiuhzrAiFT8T2Te26jqaBW9hnhxdeuTO7yXPcGv-ASugHvLm0uaJcRZjstzADo27rDPN6agb809aiZEfPzygY6XFFIM7-Xc0-9jfx9_8ZZCjottp3YObEJ8mKJPoduetHBupRkQISAtnGNinhl4nHFeHaDzFlsL6FqUDP-rZqvCWxBkw1wKJtwfxvX6wWsVQPkAFFeLtZu8W05yuht099HWUtK6kC_WHoe9cp"
                    alt="Satisfied Client"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                  />
                </div>

                <button
                  onClick={onViewGallery}
                  className="font-medium text-[#0F172A] hover:text-[#0B57FF] transition-colors flex items-center text-sm group cursor-pointer border border-[#0F172A]/10 hover:border-[#0B57FF]/30 px-4 py-2 rounded-full bg-white shadow-xs"
                >
                  <span>View Gallery</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#64748B]" />
                </button>
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-10 pt-6 border-t border-[#0F172A]/8 grid grid-cols-3 gap-4 text-xs font-semibold text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0B57FF] flex-shrink-0" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0B57FF] flex-shrink-0" />
                <span>Fast Proofing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0B57FF] flex-shrink-0" />
                <span>Bulk Savings</span>
              </div>
            </div>
          </motion.div>

          {/* Right Showcase Image Composition */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full lg:w-1/2 relative flex justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden p-2 bg-white border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfjh90sExcRfDYSImAmQgvy4JnHa9v-8z9hHPkWtHGiVvqmpU-j3aFsCWZL5XWF9hAejCMD3F4Ej_QjuiJD3QoTy4OHKqQg1eTKa0vlEyfE4RlA9rrMWr6LPp6Cq_rfDvXNNLPtlcJSO9L7NiuTfzwaTJKm-I1GvhmiOya6popyQj7sodvOXGLCeL4Xn34f22MCAtnp4RBV1gjujMAZ6FfK0YFFDq3YmPJgpkSXxtW7EnQnTl1a52f"
                alt="Printing Products Display"
                className="w-full h-full object-cover rounded-xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
