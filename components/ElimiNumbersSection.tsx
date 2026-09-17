'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView, animate, useReducedMotion } from 'motion/react';
import { EMIL_SPRINGS } from '@/lib/motion-constants';
import { Zap, Settings, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  separator?: boolean;
  prefix?: string;
  suffix?: string;
}

function Counter({
  from = 0,
  to,
  duration = 2,
  separator = false,
  prefix = '',
  suffix = ''
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-50px 0px -50px 0px' });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (isInView) {
      const controls = animate(from, to, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(value) {
          const rounded = Math.round(value);
          node.textContent = `${prefix}${separator ? rounded.toLocaleString() : rounded}${suffix}`;
        }
      });
      return () => controls.stop();
    } else {
      node.textContent = `${prefix}${separator ? from.toLocaleString() : from}${suffix}`;
    }
  }, [isInView, from, to, duration, separator, prefix, suffix]);

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {prefix}{separator ? from.toLocaleString() : from}{suffix}
    </span>
  );
}

export default function ElimiNumbersSection() {
  const shouldReduceMotion = useReducedMotion();
  // Sample avatars for floating visual impact
  const avatars = [
    {
      id: 1,
      name: 'Claire M.',
      role: 'VIP Event Organizer',
      src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      pos: 'top-2 left-[5%] sm:left-[12%] lg:left-[18%]',
      size: 'w-10 h-10 sm:w-14 sm:h-14',
      ringColor: 'ring-[#0D52FF]/30'
    },
    {
      id: 2,
      name: 'Jean-Pierre B.',
      role: 'Diplomatic Delegation',
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      pos: 'top-8 right-[5%] sm:right-[12%] lg:right-[16%]',
      size: 'w-11 h-11 sm:w-16 sm:h-16',
      ringColor: 'ring-[#0A2351]/30'
    },
    {
      id: 3,
      name: 'Aline N.',
      role: 'Diaspora Bride',
      src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      pos: 'bottom-[42%] left-[2%] sm:left-[6%] lg:left-[10%]',
      size: 'w-10 h-10 sm:w-12 sm:h-12',
      ringColor: 'ring-pink-400/40'
    },
    {
      id: 4,
      name: 'David K.',
      role: 'Corporate Host',
      src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      pos: 'bottom-[38%] right-[2%] sm:right-[6%] lg:right-[10%]',
      size: 'w-11 h-11 sm:w-14 sm:h-14',
      ringColor: 'ring-emerald-400/40'
    }
  ];

  return (
    <section className="w-full bg-[#FAF8F0] relative overflow-hidden py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 text-[#181B25] font-sans antialiased border-t border-amber-900/5">
      {/* Background Graphic: World Map / Dot Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.22] pointer-events-none flex items-center justify-center">
        <svg
          className="w-full h-full max-w-7xl object-cover"
          viewBox="0 0 1000 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle curved dotted continent lines matching the design */}
          <path
            d="M50 350 C 200 280, 400 250, 500 250 C 600 250, 800 280, 950 350"
            stroke="#0A2351"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <path
            d="M20 380 C 220 300, 450 270, 500 270 C 550 270, 780 300, 980 380"
            stroke="#0D52FF"
            strokeWidth="1.5"
            strokeDasharray="3 8"
          />
          {/* Dot matrix grid clusters simulating world map */}
          <g fill="#0A2351" opacity="0.4">
            <circle cx="200" cy="220" r="2" />
            <circle cx="220" cy="210" r="2" />
            <circle cx="240" cy="230" r="2" />
            <circle cx="260" cy="220" r="2" />
            <circle cx="280" cy="240" r="2" />
            <circle cx="300" cy="230" r="2" />
            {/* Africa / East Africa cluster */}
            <circle cx="480" cy="240" r="3" fill="#0D52FF" />
            <circle cx="500" cy="250" r="3.5" fill="#0D52FF" />
            <circle cx="520" cy="245" r="3" fill="#0D52FF" />
            <circle cx="490" cy="260" r="2.5" />
            <circle cx="510" cy="270" r="2.5" />
            {/* Europe cluster */}
            <circle cx="480" cy="180" r="2" />
            <circle cx="500" cy="170" r="2" />
            <circle cx="520" cy="190" r="2" />
            {/* Americas */}
            <circle cx="700" cy="210" r="2" />
            <circle cx="720" cy="220" r="2" />
            <circle cx="740" cy="200" r="2" />
            <circle cx="760" cy="230" r="2" />
          </g>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-12 sm:space-y-16">
        {/* Top Header Pill */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 sm:px-5 py-2 rounded-full border border-amber-900/10 shadow-xs text-xs sm:text-sm font-bold text-[#181B25]"
          >
            <Settings className="w-4 h-4 text-[#0D52FF] animate-spin-slow" />
            <span>ELIMI in Numbers</span>
            <Zap className="w-4 h-4 text-[#0D52FF]" />
          </motion.div>
        </div>

        {/* Center Hero Big Counter & Floating Avatars Block */}
        <div className="relative py-8 sm:py-12 flex flex-col items-center justify-center text-center">
          {/* Floating Avatars around the Hero Number */}
          {avatars.map((avatar) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: avatar.id * 0.15 }}
              className={`absolute ${avatar.pos} z-20 group cursor-pointer`}
            >
              <div className={`relative ${avatar.size} rounded-full overflow-hidden border-2 border-white shadow-lg ring-2 ${avatar.ringColor} transition-transform duration-300 group-hover:scale-115`}>
                <Image
                  src={avatar.src}
                  alt={avatar.name}
                  fill
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-[#0A2351] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                  {avatar.name} • <span className="text-[#0D52FF] font-normal">{avatar.role}</span>
                </div>
                <div className="w-2 h-2 bg-[#0A2351] rotate-45 -mt-1" />
              </div>
            </motion.div>
          ))}

          {/* Main Giant Number with Tilted Badge */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0.2 } : EMIL_SPRINGS.snappy}
            className="relative inline-block my-2"
          >
            {/* Tilted Floating White Badge */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, rotate: -3 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: -6 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0.2 } : { ...EMIL_SPRINGS.gentle, delay: 0.15 }}
              className="absolute -top-6 sm:-top-8 -right-4 sm:-right-12 z-20 bg-white/95 backdrop-blur-md text-[#181B25] px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border border-slate-200/80 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#0D52FF] animate-pulse" />
              <span>Happy VIP Clients</span>
            </motion.div>

            {/* Giant Number Typography */}
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-[#181B25] tracking-tight leading-none select-none">
              <Counter to={15000} separator suffix="+" duration={2} />
            </h1>
          </motion.div>

          <p className="mt-4 text-[#525866] text-sm sm:text-base md:text-lg font-medium max-w-xl mx-auto px-4">
            Delivering excellence in luxury mobility, presidential protocol, turnkey events, and verified shopping across Burundi & the Diaspora.
          </p>
        </div>

        {/* Bottom 3 Stat Columns with Dashed Divider Lines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 pt-6">
          {/* Column 1 */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0.2 } : { ...EMIL_SPRINGS.snappy, delay: 0.05 }}
            className="flex flex-col space-y-3 relative group"
          >
            <div className="relative inline-block self-start">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-serif italic font-bold text-[#181B25] tracking-tight leading-none">
                <Counter to={120} suffix="+" duration={1.8} />
              </span>
              {/* Soft Pink/Purple Pill Badge overlapping */}
              <div className="mt-1 sm:-mt-2 inline-block bg-[#FFEBF2] text-[#D91B5C] px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs border border-[#D91B5C]/10">
                VIP Fleet & Vehicles
              </div>
            </div>

            {/* Horizontal Dashed Divider Line */}
            <div className="w-full border-t border-dashed border-slate-300 my-2" />

            <p className="text-[#525866] text-xs sm:text-sm leading-relaxed font-medium">
              From private Toyota Prado SUVs to luxury Mercedes V-Class vehicles for high-level delegations and weddings.
            </p>
          </motion.div>

          {/* Column 2 */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0.2 } : { ...EMIL_SPRINGS.snappy, delay: 0.1 }}
            className="flex flex-col space-y-3 relative group"
          >
            <div className="relative inline-block self-start">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-serif italic font-bold text-[#181B25] tracking-tight leading-none">
                <Counter to={12} suffix="+" duration={1.5} />
              </span>
              {/* Soft Yellow/Peach Pill Badge overlapping */}
              <div className="mt-1 sm:-mt-2 inline-block bg-[#FFF4E5] text-[#D97706] px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs border border-[#D97706]/10">
                Years of Excellence
              </div>
            </div>

            {/* Horizontal Dashed Divider Line */}
            <div className="w-full border-t border-dashed border-slate-300 my-2" />

            <p className="text-[#525866] text-xs sm:text-sm leading-relaxed font-medium">
              Perfecting protocol, turnkey event management, and seamless logistics in Bujumbura and internationally since 2014.
            </p>
          </motion.div>

          {/* Column 3 */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0.2 } : { ...EMIL_SPRINGS.snappy, delay: 0.15 }}
            className="flex flex-col space-y-3 relative group"
          >
            <div className="relative inline-block self-start">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-serif italic font-bold text-[#181B25] tracking-tight leading-none">
                <Counter to={98} suffix="%" duration={1.8} />
              </span>
              {/* Soft Blue Pill Badge overlapping */}
              <div className="mt-1 sm:-mt-2 inline-block bg-[#E8F2FF] text-[#0D52FF] px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs border border-[#0D52FF]/10">
                Repeat Client Rate
              </div>
            </div>

            {/* Horizontal Dashed Divider Line */}
            <div className="w-full border-t border-dashed border-slate-300 my-2" />

            <p className="text-[#525866] text-xs sm:text-sm leading-relaxed font-medium">
              Most diplomats, diaspora families, and business leaders trust ELIMI again for every upcoming event and journey.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
