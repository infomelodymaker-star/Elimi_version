'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { EMIL_EASINGS } from '@/lib/motion-constants';

const services = [
  { title: "ELIMI Protocol", desc: "Excellence Beyond Expectations.", cta: "Explore Protocol", link: "/protocol" },
  { title: "Cars", desc: "Premium car rentals.", cta: "View Cars", link: "/cars" },
  { title: "Houses", desc: "Luxury real estate.", cta: "View Houses", link: "/houses" },
  { title: "Digital Marketing", desc: "Boost your presence.", cta: "Boost Marketing", link: "/digital-marketing" },
  { title: "Shop", desc: "Browse our collections.", cta: "Shop Now", link: "/shop" },
  { title: "Media", desc: "Capturing your moments.", cta: "View Media", link: "/media" },
  { title: "PrintBe", desc: "Premium printing solutions.", cta: "View Services", link: "/printbe" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % services.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={shouldReduceMotion ? { duration: 0 } : {
          duration: 0.26,
          ease: EMIL_EASINGS.easeOut,
        }}
        className="flex flex-col gap-6"
      >
        <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
          {services[index].title}
        </h1>
        <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-sm font-medium">
          {services[index].desc}
        </p>
        <Link 
          href={services[index].link} 
          className="w-fit bg-[#0D52FF] hover:bg-blue-700 text-white font-semibold py-3 px-6 lg:py-4 lg:px-8 rounded-full flex items-center gap-3 transition-colors shadow-lg active:scale-95"
        >
          {services[index].cta}
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
