'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <div className="w-full px-4 sm:px-8 lg:px-12 flex justify-center items-center">
      <div className="w-full max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto">
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
            className="flex flex-col items-center text-center gap-4 mx-auto"
          >
            <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] lg:leading-[1.12] tracking-tight max-w-xl sm:max-w-2xl lg:max-w-3xl">
              {services[index].title}
            </h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md sm:max-w-lg lg:max-w-xl font-medium">
              {services[index].desc}
            </p>
            <Link 
              href={services[index].link} 
              className="w-fit bg-[#0D52FF] hover:bg-blue-700 active:scale-98 text-white font-semibold py-3.5 px-8 lg:py-4 lg:px-8 rounded-full flex items-center justify-center gap-3 transition-colors shadow-lg cursor-pointer"
            >
              <span>{services[index].cta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
