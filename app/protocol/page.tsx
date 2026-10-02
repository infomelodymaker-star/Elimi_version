"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ElimiHeader from "@/components/ElimiHeader";
import { motion } from "motion/react";
import { useCmsPage } from "@/lib/firestore-cms";
import { useSettings } from "@/components/SettingsProvider";
import { Play, Pause, Volume2, VolumeX, Phone, ArrowRight, ChevronRight, ExternalLink, Video } from "lucide-react";

interface PortraitVideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl?: string;
}

function isInstagramUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("instagram.com") || url.includes("instagr.am");
}

function getInstagramEmbedUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  if (!clean.startsWith("http")) {
    clean = `https://${clean}`;
  }
  const match = clean.match(/instagram\.com\/(?:[^\/]+\/)?reel\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed/`;
  }
  const postMatch = clean.match(/instagram\.com\/(?:[^\/]+\/)?p\/([a-zA-Z0-9_-]+)/);
  if (postMatch && postMatch[1]) {
    return `https://www.instagram.com/p/${postMatch[1]}/embed/`;
  }
  if (clean.includes("/embed")) {
    return clean.endsWith("/") ? clean : `${clean}/`;
  }
  clean = clean.replace(/\/+$/, "");
  return `${clean}/embed/`;
}

function getInstagramDirectUrl(url: string): string {
  if (!url) return "https://www.instagram.com";
  let clean = url.trim();
  if (!clean.startsWith("http")) {
    clean = `https://${clean}`;
  }
  return clean.replace(/\/embed\/?.*$/, "/").replace(/\/+$/, "/");
}

function PortraitVideoCard({ video }: { video: PortraitVideoItem }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isInsta = isInstagramUrl(video.videoUrl);
  const instagramEmbedUrl = isInsta ? getInstagramEmbedUrl(video.videoUrl) : "";
  const instagramDirectUrl = isInsta ? getInstagramDirectUrl(video.videoUrl) : "";

  // Intersection Observer to detect scroll and autoplay when scrolled into view
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (!isInsta && videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                  setIsPlaying(false);
                });
            }
          } else {
            setIsInView(false);
            if (!isInsta && videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(currentContainer);

    return () => {
      observer.disconnect();
    };
  }, [isInsta]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasInteracted(true);
    if (!isInsta && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn("Video play error:", err));
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative flex flex-col h-full w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden border border-[#0F172A]/10 bg-white shadow-[0px_6px_28px_0px_rgba(15,23,42,0.08)] hover:shadow-[0px_12px_36px_0px_rgba(15,23,42,0.14)] transition-all duration-300"
    >
      {/* Video Container with Header & Footer Cleanly Hidden */}
      <div className="relative w-full h-[470px] sm:h-[500px] bg-black flex items-center justify-center overflow-hidden">
        {isInsta ? (
          /* Real Instagram Reel Embed Frame with Header & Footer Cropped Out */
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            {isInView || hasInteracted ? (
              /* Offset -top-[56px] and extended height to crop out top IG banner and bottom footer */
              <div className="absolute inset-x-0 -top-[56px] h-[calc(100%+140px)] w-full overflow-hidden pointer-events-auto">
                <iframe
                  src={instagramEmbedUrl}
                  className="w-full h-full border-0 bg-black scale-[1.01]"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  scrolling="no"
                  title={video.title || "Instagram Reel"}
                  loading="lazy"
                />
              </div>
            ) : (
              /* Pre-load placeholder until user scrolls to it */
              <div
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white cursor-pointer group-hover:bg-slate-850 transition-colors"
                onClick={() => setHasInteracted(true)}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg mb-3 transform group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-white fill-current ml-1" />
                </div>
                <p className="text-sm font-semibold text-white">Tap to Load Reel</p>
                <p className="text-xs text-slate-400 mt-1">Autoplays when scrolled into view</p>
              </div>
            )}
          </div>
        ) : (
          /* Direct HTML5 Video Player */
          <div
            className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.posterUrl}
              playsInline
              muted
              loop
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Dark overlay when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-slate-950/30 transition-opacity" />
            )}

            {/* Play/Pause Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto backdrop-blur-md ${
                  isPlaying
                    ? "bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 hover:bg-[#0B57FF]"
                    : "bg-white text-[#0B57FF] opacity-100 scale-100 hover:scale-110 shadow-lg"
                }`}
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Floating Instagram Link ONLY on Top-Right */}
        {isInsta && (
          <div className="absolute top-3.5 right-3.5 z-30 pointer-events-auto">
            <a
              href={instagramDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/95 hover:text-white flex items-center gap-1.5 bg-slate-950/80 hover:bg-[#0B57FF] px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15 transition-all shadow-md font-medium group/link"
              title="Watch Reel on Instagram"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center overflow-hidden p-0.5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/icons/social/instagram-150x150.png"
                  alt="Instagram"
                  className="w-full h-full object-contain"
                />
              </div>
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
            </a>
          </div>
        )}
      </div>

      {/* Title & Description - Elevated upward to cleanly cover Instagram bottom buttons */}
      <div className="-mt-16 sm:-mt-20 relative z-20 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-slate-100 p-5 flex flex-col flex-grow space-y-2">
        <h3 className="font-semibold text-base text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
          {video.description}
        </p>
      </div>
    </div>
  );
}

export default function ProtocolPage() {
  const settings = useSettings();
  const { data: cmsData } = useCmsPage('protocol');

  const contactPhone = settings.contactPhone || '+257 69 99 29 84';
  const phoneTelLink = `tel:${contactPhone.replace(/\s+/g, '')}`;
  const whatsappNum = settings.whatsappNumber || '25769992984';
  const whatsappLink = `https://wa.me/${whatsappNum.replace(/\+/g, '')}`;

  // Parse CMS sections safely
  const heroSection = cmsData?.sections?.find((s: any) => s.type === 'hero')?.content || {
    headline: 'ELIMI PROTOCOL & VIP Services',
    subheadline: 'Operating in Burundi with international-standard event coordination, airport arrival hosting, delegation transport, and official logistics representation.',
    backgroundImage: '/assets/protocol/protocol_Girls.webp',
  };

  const servicesSection = cmsData?.sections?.find((s: any) => s.type === 'services')?.content || {
    title: 'Diplomatic Standard Protocol Services',
    subtitle: 'ELIMI VIP Handling & Summit Logistics',
    items: [
      {
        id: 'sec-1',
        title: 'Event coordination',
        description: 'Comprehensive planning, execution, and master coordination of high-profile corporate, governmental, and international summits.',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
        badge: 'Coordination',
      },
      {
        id: 'sec-2',
        title: 'Airport arrival hosting & assistance',
        description: 'Seamless airport tarmac reception, fast-track VIP customs clearance, and official delegation hosting.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200',
        badge: 'Airport',
      },
      {
        id: 'sec-3',
        title: 'VIP handling',
        description: 'Specialized protocol security, armored motorcade logistics, discretion, and bespoke care for diplomats.',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
        badge: 'VIP',
      },
      {
        id: 'sec-4',
        title: 'Logistics coordination and representation',
        description: 'Executive ground fleet, multilingual hostesses, and official diplomatic representation.',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        badge: 'Logistics',
      },
    ],
  };

  const videosSection = cmsData?.sections?.find((s: any) => s.type === 'videos')?.content || {
    title: 'Protocol in Motion',
    subtitle: 'Official Instagram reel showcases from our recent diplomatic motorcades & VIP delegations',
    items: [
      {
        id: 'vid-01',
        title: 'Tarmac VIP Reception & Escort',
        description: 'Presidential motorcade arrival and tarmac escort service at Bujumbura Airport.',
        videoUrl: 'https://www.instagram.com/reel/DU56Cquigev/embed/',
        posterUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'vid-02',
        title: 'ELIMI Protocol VIP Delegation',
        description: 'Official VIP delegation coordination, motorcade security, and summit hosting.',
        videoUrl: 'https://www.instagram.com/elimi_protocol/reel/DW83Dt2ijVR/embed',
        posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'vid-03',
        title: 'Executive Convoy & VIP Security',
        description: 'Tactical close protection unit escorting visiting international delegations.',
        videoUrl: 'https://www.instagram.com/reel/DVO3XF5gJOK/embed',
        posterUrl: 'https://images.unsplash.com/photo-1508847154043-be5407f15ad9?auto=format&fit=crop&q=80&w=800',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans antialiased flex flex-col">
      <ElimiHeader />

      {/* HERO SECTION - VISUAL FIRST */}
      <section className="w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 border-b border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#E0EBFF] text-[#0B57FF] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight">
                <span>Diplomatic Standard VIP Protocol</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.03em] leading-[1.1] text-[#0F172A]">
                {heroSection.headline || 'ELIMI PROTOCOL & VIP Services'}
              </h1>

              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl border-l-3 border-[#0B57FF] pl-4">
                {heroSection.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#services"
                  className="bg-[#0B57FF] hover:bg-blue-700 text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <span>View Services</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={phoneTelLink}
                  className="bg-white hover:bg-slate-100 border border-[#1D4ED8] text-[#0F172A] px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#0B57FF]" />
                  <span>Call {contactPhone}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Key Hero Image */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] border border-[#0F172A]/8 bg-white">
                <Image
                  src={heroSection.backgroundImage || '/assets/protocol/protocol_Girls.webp'}
                  alt="Elimi Protocol"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTRAIT VIDEOS SHOWCASE SECTION */}
      {videosSection.items && videosSection.items.length > 0 && (
        <section id="videos" className="w-full bg-white px-4 sm:px-6 lg:px-8 py-16 md:py-[113px] border-b border-[#0F172A]/8">
          <div className="max-w-[1200px] mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] px-3.5 py-1 rounded-full inline-block">
                Portrait Video Showcase
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
                {videosSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                {videosSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
              {videosSection.items.map((vid: PortraitVideoItem) => (
                <PortraitVideoCard key={vid.id} video={vid} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROTOCOL SERVICES GRID */}
      {servicesSection.items && servicesSection.items.length > 0 && (
        <section id="services" className="w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-8 py-16 md:py-[113px]">
          <div className="max-w-[1200px] mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] bg-[#E0EBFF] px-3.5 py-1 rounded-full inline-block">
                {servicesSection.subtitle || 'VIP Solutions'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#0F172A]">
                {servicesSection.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicesSection.items.map((service: any) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-[0px_8px_32px_0px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-[4/3] bg-slate-100 border-b border-[#0F172A]/8">
                      <Image
                        src={service.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'}
                        alt={service.title}
                        fill
                        unoptimized
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {service.badge && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#0B57FF] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                            {service.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-2">
                      <h3 className="font-semibold text-base text-[#0F172A]">
                        {service.title}
                      </h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#E0EBFF] hover:bg-blue-100 text-[#0B57FF] py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Inquire for Protocol</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CALL TO ACTION BANNER */}
      <section className="w-full bg-white px-4 sm:px-6 lg:px-8 py-16 border-t border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto bg-[#F8F9FA] rounded-2xl border border-[#0F172A]/8 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#0F172A]">
              Hosting a Summit or Delegation in Burundi?
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Connect directly with our diplomatic protocol officers for customized planning and escort arrangements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0B57FF] hover:bg-blue-700 text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm inline-flex items-center gap-2"
            >
              <span>WhatsApp Protocol Officer</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
