"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ElimiHeader from "@/components/ElimiHeader";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  videoUrl: string;
  posterUrl: string;
}

function ServiceVideoCard({
  service,
  variants,
}: {
  service: ServiceItem;
  variants: any;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Video playback interrupted:", err);
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <motion.div
      id={`protocol-service-card-${service.id}`}
      variants={variants}
      className="group flex flex-col h-full rounded-2xl overflow-hidden border border-[#0F172A]/8 bg-white transition-all duration-300 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] hover:-translate-y-1"
    >
      {/* Real Video Player Container */}
      <div
        className="relative w-full aspect-[4/3] bg-slate-900 flex items-center justify-center overflow-hidden border-b border-[#0F172A]/8 cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={service.videoUrl}
          poster={service.posterUrl}
          playsInline
          muted={isMuted}
          loop
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Video overlay shade when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/25 transition-opacity" />
        )}

        {/* Play/Pause Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto shadow-md backdrop-blur-sm ${
              isPlaying
                ? "bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-[#0B57FF]"
                : "bg-white/95 text-[#0B57FF] opacity-100 hover:scale-110 hover:bg-[#0B57FF] hover:text-white"
            }`}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            )}
          </button>
        </div>

        {/* Video Controls Badges (Mute & Status) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full shadow-xs">
            {isPlaying ? "Playing" : "Video"}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-[#0B57FF] text-white flex items-center justify-center transition-colors pointer-events-auto shadow-xs backdrop-blur-sm"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-7 flex flex-col flex-grow text-center items-center justify-start space-y-2.5">
        <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
          {service.title}
        </h3>
        <p className="text-[#64748B] leading-relaxed text-xs sm:text-sm">
          {service.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function ProtocolPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans antialiased flex flex-col">
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* HERO SECTION */}
      <section className="relative w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 overflow-hidden border-b border-[#0F172A]/8">
        <div className="relative z-10 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="z-10 space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1 rounded-full text-xs font-bold tracking-tight border border-[#0B57FF]/20">
                <span>Diplomatic Standard VIP Handling</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-medium text-[#0F172A] tracking-[-0.03em]">
                ELIMI <br className="hidden sm:inline" />
                <span className="text-[#0B57FF]">PROTOCOL &amp;</span> <br />
                VIP Services
              </h1>

              <p className="text-sm sm:text-base text-[#64748B] max-w-lg leading-relaxed border-l-2 border-[#0B57FF] pl-4">
                Operating in Burundi with international-standard event coordination, airport arrival hosting, delegation transport, and official logistics representation.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <a
                  href="#services"
                  className="bg-[#0B57FF] text-white px-8 py-3.5 rounded-full hover:bg-[#0948D9] transition-all duration-300 text-xs sm:text-sm font-semibold shadow-xs inline-flex items-center gap-2"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="tel:+25779000000"
                  className="bg-white border border-[#1D4ED8] text-[#0F172A] hover:bg-slate-50 px-8 py-3.5 rounded-full transition-colors duration-300 text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#0B57FF]" />
                  <span>Contact Protocol Desk</span>
                </a>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-square flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full h-full max-h-[540px] rounded-2xl overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] border border-[#0F172A]/8 bg-slate-100">
                <Image
                  src="/assets/protocol/protocol_Girls.webp"
                  alt="Protocol Services"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
                <div className="absolute bottom-3 left-3 right-3 text-white lg:hidden">
                  <span className="text-xs font-semibold bg-[#0B57FF] text-white px-3 py-1 rounded-full shadow-xs">
                    Official VIP Handling
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION SECTION */}
      <section className="w-full bg-white px-4 sm:px-6 lg:px-8 py-16 md:py-[113px] border-b border-[#0F172A]/8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8"
        >
          <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block">
            Our Purpose &amp; Standard
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-[-0.03em] leading-snug sm:leading-relaxed text-[#0F172A]">
            ELIMI Protocol delivers elite diplomatic standards in Burundi, specializing in summit event coordination, airport arrival hosting &amp; assistance, VIP handling, and logistics representation.
          </h2>
          <div>
            <a
              href="#services"
              className="bg-transparent border border-[#1D4ED8] text-[#0F172A] px-8 py-3.5 rounded-full hover:bg-slate-50 transition-all duration-300 text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
            >
              <span>Learn About Our Protocol</span>
              <ChevronRight className="w-4 h-4 text-[#0B57FF]" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* OUR SERVICES SECTION */}
      <section
        id="services"
        className="w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-8 py-16 md:py-[113px]"
      >
        <div className="max-w-[1200px] mx-auto space-y-12 sm:space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block mb-3">
              Protocol Solutions
            </span>
            <motion.h2
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]"
            >
              Our Protocol Services
            </motion.h2>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                id: "event-coordination",
                title: "Event Coordination",
                desc: "Comprehensive planning and flawless execution of high-profile corporate, governmental, and international summits.",
                icon: ShieldCheck,
                videoUrl:
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                posterUrl:
                  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
              },
              {
                id: "airport-arrival",
                title: "Airport Arrival Hosting",
                desc: "Seamless airport tarmac reception, fast-track customs clearance, and elite reception for visiting delegations.",
                icon: Sparkles,
                videoUrl:
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                posterUrl:
                  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
              },
              {
                id: "vip-handling",
                title: "VIP Handling",
                desc: "Specialized protocol security, armored convoys, discretion, and bespoke care for diplomats and VIP guests.",
                icon: Star,
                videoUrl:
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                posterUrl:
                  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
              },
              {
                id: "logistics-rep",
                title: "Logistics Representation",
                desc: "Professional logistics management, executive ground transport, and official representation across Burundi.",
                icon: MapPin,
                videoUrl:
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
                posterUrl:
                  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
              },
            ].map((service) => (
              <ServiceVideoCard
                key={service.id}
                service={service}
                variants={fadeInUp}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* GALLERY / HIGHLIGHTS SECTION */}
      <section className="w-full bg-white px-4 sm:px-6 lg:px-8 py-16 md:py-20 border-t border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-3">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block mb-2">
                Photo Highlights
              </span>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#0F172A]">
                Protocol in Action
              </h3>
            </div>
            <span className="text-xs sm:text-sm text-[#64748B]">
              Official delegations &amp; summit services
            </span>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              "https://picsum.photos/seed/protocol1/600/800",
              "https://picsum.photos/seed/protocol2/600/800",
              "https://picsum.photos/seed/protocol3/600/800",
              "https://picsum.photos/seed/protocol4/600/800",
            ].map((img, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xs border border-[#0F172A]/8 bg-slate-100"
              >
                <Image
                  src={img}
                  alt={`Highlight ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TRAININGS SCHEDULE SECTION */}
      <section className="w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-8 py-16 md:py-20 border-t border-b border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-2xl space-y-4"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block">
              Diplomatic Academy
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Trainings &amp; Diplomatic Etiquette
            </h2>
            <p className="text-[#64748B] leading-relaxed text-sm md:text-base border-l-2 border-[#0B57FF] pl-4">
              Mastering International Protocol, Etiquette, and Soft Diplomacy for Business Success: ELIMI helps organizations, public figures, and executives in Burundi master these essential skills.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full md:w-auto"
          >
            <a
              href="tel:+25779000000"
              className="w-full md:w-auto bg-[#0B57FF] hover:bg-[#0948D9] text-white px-8 py-3.5 rounded-full transition-all duration-300 text-xs sm:text-sm font-semibold shadow-xs text-center inline-flex items-center justify-center gap-2"
            >
              <span>View Training Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* TOP RECOMMENDED TRAINING SECTION */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-[1200px] mx-auto relative rounded-2xl overflow-hidden min-h-[360px] sm:min-h-[420px] md:aspect-[21/9] flex flex-col justify-end shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] border border-[#0F172A]/8 bg-slate-900"
        >
          <Image
            src="/assets/protocol/PROTOCOL_SECTION.webp"
            alt="Recommended Training"
            fill
            unoptimized
            className="object-cover hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />

          <div className="relative z-10 w-full p-8 lg:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#0B57FF] px-3.5 py-1.5 rounded-full text-white text-xs font-bold tracking-wider shadow-xs">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>TOP RECOMMENDED TRAINING</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.03em] text-white leading-tight">
                The Art of International Protocol &amp; VIP Management by ELIMI
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg">
                Intensive certification covering diplomatic precedence, VIP convoy coordination, and summit etiquette.
              </p>
            </div>
            <a
              href="tel:+25779000000"
              className="w-full sm:w-auto bg-white text-[#0F172A] hover:bg-slate-100 px-8 py-3.5 rounded-full transition-colors duration-300 text-xs sm:text-sm font-semibold whitespace-nowrap text-center shadow-md inline-flex items-center justify-center gap-2"
            >
              <span>Join Next Cohort</span>
              <ArrowRight className="w-4 h-4 text-[#0B57FF]" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* HONORING TRADITIONS SECTION */}
      <section className="w-full bg-[#E0EBFF]/30 px-4 sm:px-6 lg:px-8 py-16 md:py-[113px] border-t border-b border-[#0B57FF]/15">
        <div className="max-w-[1200px] mx-auto space-y-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center space-y-3 flex flex-col items-center max-w-2xl mx-auto"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block">
              Cultural &amp; Diplomatic Heritage
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Honoring Traditions, Elevating Occasions
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base font-normal">
              Tailored for Diplomats, Executives &amp; High-Profile VIPs in Burundi.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              "/assets/elimi-images/regenerated_image_1787569895057.webp",
              "https://picsum.photos/seed/tradition2/600/800",
              "https://picsum.photos/seed/tradition3/600/800",
            ].map((img, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xs border border-[#0F172A]/8 bg-white"
              >
                <Image
                  src={img}
                  alt={`Tradition ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ASSOCIATES & PARTNERS SECTION */}
      <section className="w-full bg-white px-4 sm:px-6 lg:px-8 py-16 md:py-[113px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-4 space-y-4 text-center lg:text-left"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block">
              Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Associates &amp; Partners
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed border-l-2 border-[#0B57FF] pl-4">
              Your trusted network of official liaison experts and diplomatic allies in Burundi.
            </p>
            <div className="pt-2">
              <a
                href="tel:+25779000000"
                className="bg-[#0B57FF] hover:bg-[#0948D9] text-white px-8 py-3.5 rounded-full transition-colors duration-300 text-xs sm:text-sm font-semibold shadow-xs inline-flex items-center gap-2"
              >
                <span>Partner Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center justify-items-center"
          >
            {[
              "ELIMI PARTNERS",
              "BUJUMBURA HUB",
              "BURUNDI ALLIANCE",
              "E.A. ACADEMY",
            ].map((logo, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="w-full bg-[#F8F9FA] border border-[#0F172A]/8 p-6 rounded-2xl text-center text-xs sm:text-sm font-semibold text-[#0F172A] hover:text-[#0B57FF] hover:border-[#0B57FF]/30 transition-all shadow-xs"
              >
                {logo}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* OUR CLIENTS SECTION */}
      <section className="w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-8 py-16 border-t border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto space-y-8 sm:space-y-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left"
          >
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 px-3.5 py-1 rounded-full inline-block mb-2">
                Trust &amp; Precedence
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#0F172A]">
                Organizations &amp; Summit Delegations
              </h2>
            </div>
            <Link
              href="tel:+25779000000"
              className="text-[#0B57FF] font-semibold text-xs sm:text-sm inline-flex items-center justify-center sm:justify-start gap-1 hover:underline"
            >
              <span>Book Protocol Team</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center"
          >
            {[
              "ECOBANK BURUNDI",
              "UNIVERSITY OF BURUNDI",
              "BURUNDI INVEST",
              "LUMITEL",
              "MIN. OF CULTURE",
            ].map((logo, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="w-full bg-white border border-[#0F172A]/8 p-4 rounded-xl text-center text-[11px] sm:text-xs font-semibold text-[#0F172A] tracking-wide shadow-xs"
              >
                {logo}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
