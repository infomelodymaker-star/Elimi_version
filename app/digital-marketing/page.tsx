'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ElimiHeader from '@/components/ElimiHeader';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Search,
  PenTool,
  Layers,
  Zap,
  Play,
  X,
  Send,
  MessageSquare,
  Award,
  Calendar,
  Check
} from 'lucide-react';

interface ServiceDetail {
  id: string;
  name: string;
  category: string;
  number: string;
  title: string;
  description: string;
  highlights: string[];
  metrics: { label: string; value: string };
  deliverables: string[];
}

const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'Digital Strategy',
    number: '01',
    title: 'Omnichannel Digital Strategy',
    description:
      'Data-driven digital roadmaps designed to position your brand at the forefront of your industry, identifying high-yield opportunities and customer journeys.',
    highlights: ['Competitor Intelligence & Auditing', 'Audience Persona Mapping', 'Multi-Channel Budget Allocation', 'Funnel Architecture'],
    metrics: { label: 'Average ROI Uplift', value: '+240%' },
    deliverables: ['Quarterly Growth Roadmap', 'Channel Strategy Blueprint', 'KPI Tracking Framework']
  },
  {
    id: 'content',
    name: 'Content Creation',
    category: 'Creative Production',
    number: '02',
    title: 'High-Impact Content Creation',
    description:
      'Compelling visual and written storytelling that captures audience attention, sparks organic virality, and articulates your unique value proposition.',
    highlights: ['High-Production Video & Reels', 'Interactive Visual Assets', 'Thought-Leadership Copywriting', 'Brand Asset Libraries'],
    metrics: { label: 'Engagement Rate Increase', value: '4.8x' },
    deliverables: ['Monthly Asset Production Pack', 'Copywriting & Script Bank', 'Visual Brand Guidelines']
  },
  {
    id: 'seo',
    name: 'SEO',
    category: 'Search Optimization',
    number: '03',
    title: 'Technical & Organic SEO',
    description:
      'Dominate organic search with comprehensive technical health audits, high-intent keyword mapping, authoritative link building, and content optimization.',
    highlights: ['Core Web Vitals Optimization', 'High-Intent Semantic Keywords', 'Authoritative Editorial Backlinks', 'Local & Global Search Dominance'],
    metrics: { label: 'Organic Traffic Growth', value: '+310%' },
    deliverables: ['Technical SEO Audit', 'Keyword Matrix & Content Plan', 'Monthly Ranking Reports']
  },
  {
    id: 'social',
    name: 'Social Media Management',
    category: 'Social Growth',
    number: '04',
    title: 'Social Media Management',
    description:
      'Transform your digital footprint with data-backed content strategies, continuous community engagement, and multi-channel campaign orchestration designed to turn followers into loyal brand advocates.',
    highlights: ['End-to-End Content Calendars', 'Active Community Moderation', 'Influencer & Creator Partnerships', 'Real-Time Sentiment Monitoring'],
    metrics: { label: 'Audience Reach Multiplier', value: '5.2x' },
    deliverables: ['30-Day Content Scheduling', 'Community Response Engine', 'Weekly Analytics Reports']
  },
  {
    id: 'design',
    name: 'Design',
    category: 'Brand Experience',
    number: '05',
    title: 'UI/UX & Brand Design',
    description:
      'Bespoke digital design systems, high-converting landing page layouts, and modern visual identities that leave an unforgettable impression.',
    highlights: ['Conversion-Focused Landing Pages', 'Design Systems & Component Kits', 'Interactive Prototypes', 'Motion & Graphic Assets'],
    metrics: { label: 'Conversion Lift', value: '+68%' },
    deliverables: ['Figma Design Files', 'Design System Library', 'Interactive Web Prototypes']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    category: 'Data & Insights',
    number: '06',
    title: 'Advanced Analytics & Attribution',
    description:
      'Eliminate guesswork with full-funnel attribution models, custom real-time dashboards, and behavioral telemetry that pinpoint exactly where revenue comes from.',
    highlights: ['Multi-Touch Attribution', 'GA4 & Server-Side Tagging', 'Custom Executive Dashboards', 'Cohort Retention Analysis'],
    metrics: { label: 'Attribution Accuracy', value: '99.4%' },
    deliverables: ['Live BI Dashboard Setup', 'Tag Management Audit', 'Weekly Executive Summaries']
  },
  {
    id: 'email',
    name: 'Email Marketing',
    category: 'Lifecycle Retention',
    number: '07',
    title: 'Lifecycle & Email Marketing',
    description:
      'Hyper-personalized automated email workflows, SMS sequences, and VIP retention campaigns that maximize customer lifetime value (LTV) on autopilot.',
    highlights: ['Behavior-Triggered Drip Series', 'Predictive Segmentation', 'Dynamic Content Personalization', 'Deliverability Optimization'],
    metrics: { label: 'Average Open Rate', value: '42.6%' },
    deliverables: ['Automated Flow Blueprints', 'Custom HTML Email Templates', 'A/B Testing Framework']
  },
  {
    id: 'performance',
    name: 'Performance Ads',
    category: 'Paid Acquisition',
    number: '08',
    title: 'Paid Media & PPC Campaigns',
    description:
      'High-velocity ad creative testing, algorithmic bidding management, and cross-platform campaign scaling across Google Ads, Meta, LinkedIn, and TikTok.',
    highlights: ['Algorithmic Bid Strategy', 'High-Velocity Creative Testing', 'Omnichannel Retargeting Loops', 'Strict ROAS Safeguards'],
    metrics: { label: 'Target ROAS Achieved', value: '4.2x' },
    deliverables: ['Ad Creative Variations', 'Campaign Structure Setup', 'Daily Spend Optimization']
  }
];

const CAPABILITIES_CARDS = [
  {
    id: 'video-marketing',
    title: 'Video Marketing & Campaigns',
    subtitle: 'High-conversion short-form Reels, TikToks, YouTube strategies, and video ad funnels engineered for maximum ROI.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    tag: 'Video Marketing',
    badgeText: '$450/mo',
    badges: ['⭐ 4.9', 'Viral Scripting', 'High ROAS'],
    buttonText: 'Book now',
    accent: '#0B57FF'
  },
  {
    id: 'video-production',
    title: 'Video & Commercial Production',
    subtitle: 'Studio-grade 4K/8K cinematography, brand documentaries, high-impact TV commercials, and product shoots.',
    image: 'https://images.unsplash.com/photo-1579632652988-699ee21786d6?auto=format&fit=crop&w=600&q=80',
    tag: 'Video Production',
    badgeText: '$1.2k',
    badges: ['⭐ 5.0', 'Cinematic 4K', 'Full Edit'],
    buttonText: 'Book now',
    accent: '#0B57FF'
  },
  {
    id: 'audio-production',
    title: 'Audio & Music Production',
    subtitle: 'Professional audio mastering, sonic branding, custom jingles, sound design, and broadcast mixing.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    tag: 'Audio Production',
    badgeText: '$290',
    badges: ['⭐ 4.8', 'Dolby Atmos', 'Mix & Master'],
    buttonText: 'Book now',
    accent: '#0B57FF'
  },
  {
    id: 'podcast-voiceover',
    title: 'Podcast & Voiceover Studio',
    subtitle: 'Full-service podcast production, global voiceover talent casting, noise cancellation, and RSS distribution.',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80',
    tag: 'Podcast & Audio',
    badgeText: '$390',
    badges: ['⭐ 4.9', 'HQ Recording', 'Vocal Casting'],
    buttonText: 'Book now',
    accent: '#0B57FF'
  }
];

export default function DigitalMarketingPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('social');
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'Social Media Management',
    budget: '$5,000 - $15,000 / mo',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeService = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[3];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setIsContactModalOpen(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      service: 'Social Media Management',
      budget: '$5,000 - $15,000 / mo',
      message: ''
    });
  };

  return (
    <div id="digital-marketing-root" className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col font-sans selection:bg-[#0B57FF] selection:text-white">
      
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* Hero Section */}
      <section className="relative min-h-[480px] sm:min-h-[540px] w-full flex items-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#E0EBFF] border border-[#0B57FF]/20 text-[#0B57FF] font-semibold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Award-Winning Growth Agency</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-medium tracking-[-0.02em] text-[#0F172A] leading-[1.1] mb-5 font-heading">
              Digital Marketing <br />
              <span className="text-[#0B57FF] font-semibold">Services & Growth</span>
            </h1>

            <p className="text-[#64748B] text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Comprehensive multi-channel marketing, high-production content studio, technical SEO, and conversion optimization engineered to accelerate market share.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="w-full sm:w-auto bg-[#0B57FF] hover:bg-[#0948d9] text-white font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full transition-colors uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Schedule Consultation
              </button>
              <a
                href="#services-overview"
                className="w-full sm:w-auto border border-[#1D4ED8] bg-transparent text-[#0F172A] hover:bg-[#E0EBFF]/50 font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full transition-colors uppercase tracking-wider text-center"
              >
                Explore Solutions
              </a>
            </div>
          </div>

          <div className="w-full md:w-5/12 aspect-[4/3] relative rounded-2xl overflow-hidden border border-[#0F172A]/8 bg-[#F8F9FA] shadow-xs">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85"
              alt="Digital Marketing Director"
              fill
              priority
              className="object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Core Solutions Grid Card */}
        <div 
          id="services-overview"
          className="bg-white text-[#0F172A] rounded-2xl shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] p-6 sm:p-10 border border-[#0F172A]/8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Left Column: Interactive Services Menu */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#0F172A]/8 pb-6 lg:pb-0 lg:pr-8 flex flex-col justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] mb-5">
                  Core Solutions
                </p>
                
                <ul className="space-y-2">
                  {SERVICES_DATA.map((service) => {
                    const isSelected = service.id === selectedServiceId;
                    return (
                      <li key={service.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`w-full text-left flex items-center gap-3 py-2 px-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                            isSelected
                              ? 'bg-[#E0EBFF] text-[#0B57FF] font-bold'
                              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-all ${
                              isSelected ? 'bg-[#0B57FF]' : 'bg-[#0F172A]/20 group-hover:bg-[#0B57FF]/60'
                            }`}
                          />
                          <span>{service.name}</span>
                          {isSelected && (
                            <ChevronRight className="w-4 h-4 ml-auto text-[#0B57FF]" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Quick stats mini tag */}
              <div className="mt-8 pt-6 border-t border-[#0F172A]/8 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E0EBFF] flex items-center justify-center text-[#0B57FF]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">98.6% Client Retention</p>
                    <p className="text-[11px] text-[#64748B]">Over 350+ enterprise rollouts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Selected Service Showcase */}
            <div className="lg:col-span-8 flex flex-col justify-between py-2 lg:pl-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0B57FF] bg-[#E0EBFF] px-2.5 py-0.5 rounded-full">
                    {activeService.category}
                  </span>
                  <span className="text-xs text-[#64748B]">•</span>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Phase {activeService.number}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#0F172A] leading-tight mb-4 font-heading">
                  {activeService.title}
                </h2>

                <p className="text-[#64748B] text-sm sm:text-base leading-relaxed mb-6">
                  {activeService.description}
                </p>

                {/* Key feature pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {activeService.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0F172A] bg-[#F8F9FA] p-3 rounded-xl border border-[#0F172A]/4">
                      <CheckCircle2 className="w-4 h-4 text-[#0B57FF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button & Metric */}
              <div className="pt-6 border-t border-[#0F172A]/8 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, service: activeService.title }));
                    setIsContactModalOpen(true);
                  }}
                  className="bg-[#0B57FF] hover:bg-[#0948d9] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-colors cursor-pointer shadow-xs uppercase tracking-wider"
                >
                  Configure Service
                </button>

                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0B57FF] leading-none">{activeService.metrics.value}</p>
                  <p className="text-xs text-[#64748B] mt-1">{activeService.metrics.label}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Creative Studio & Media Production */}
        <section id="capabilities-section" className="mt-20">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#0B57FF]/20">
                <span>Creative Studio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#0F172A] font-heading">
                Video &amp; Audio Production
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="text-xs sm:text-sm text-[#0F172A] hover:text-[#0B57FF] border border-[#0F172A]/10 hover:border-[#0B57FF]/40 bg-white px-5 py-2.5 rounded-full transition-all cursor-pointer font-semibold shadow-xs"
            >
              Schedule Studio Session
            </button>
          </div>

          {/* 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPABILITIES_CARDS.map((card) => (
              <div
                key={card.id}
                className="relative overflow-hidden rounded-2xl bg-white border border-[#0F172A]/8 min-h-[460px] flex flex-col justify-end p-5 group transition-all duration-300 shadow-xs hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)] hover:border-[#0B57FF]/30"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover w-full h-full group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent" />
                </div>

                {/* Card Content Overlay */}
                <div className="relative z-10 w-full flex flex-col">
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-[#E0EBFF] transition-colors font-heading">
                    {card.title}
                  </h3>

                  {/* Subtitle Description */}
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed line-clamp-3">
                    {card.subtitle}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {card.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="bg-white/10 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-white/15"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    onClick={() => window.open('https://wa.me/', '_blank')}
                    className="mt-4 w-full bg-white hover:bg-[#E0EBFF] text-[#0F172A] font-semibold py-2.5 rounded-full text-xs transition-colors text-center cursor-pointer shadow-xs uppercase tracking-wider"
                  >
                    Book Consultation
                  </button>

                </div>
              </div>
            ))}
          </div>

        </section>

      </main>

      {/* Contact & Consultation Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#0F172A]/8 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl text-[#0F172A] max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={resetForm}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F8F9FA] hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 bg-[#E0EBFF] text-[#0B57FF] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0B57FF]/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-heading">Proposal Request Received!</h3>
                <p className="text-[#64748B] text-sm max-w-md mx-auto mb-6">
                  Thank you for reaching out. One of our Senior Digital Strategists will analyze your requirements and get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#0B57FF] hover:bg-[#0948d9] text-white font-semibold px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0B57FF] bg-[#E0EBFF] px-2.5 py-0.5 rounded-full inline-block mb-2">
                    Inquire Now
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-heading">
                    Start Your Growth Journey
                  </h3>
                  <p className="text-[#64748B] text-xs sm:text-sm mt-1">
                    Tell us about your project or current bottlenecks. We’ll craft a custom growth plan.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Jenkins"
                        className="w-full bg-[#F8F9FA] border border-[#0F172A]/10 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#0B57FF] focus:ring-1 focus:ring-[#0B57FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@company.com"
                        className="w-full bg-[#F8F9FA] border border-[#0F172A]/10 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#0B57FF] focus:ring-1 focus:ring-[#0B57FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Apex Brands Ltd."
                        className="w-full bg-[#F8F9FA] border border-[#0F172A]/10 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#0B57FF] focus:ring-1 focus:ring-[#0B57FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                        Primary Service
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full bg-[#F8F9FA] border border-[#0F172A]/10 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#0B57FF] focus:ring-1 focus:ring-[#0B57FF]"
                      >
                        {SERVICES_DATA.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Estimated Monthly Budget
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-[#F8F9FA] border border-[#0F172A]/10 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#0B57FF] focus:ring-1 focus:ring-[#0B57FF]"
                    >
                      <option value="$2,500 - $5,000 / mo">$2,500 - $5,000 / mo</option>
                      <option value="$5,000 - $15,000 / mo">$5,000 - $15,000 / mo</option>
                      <option value="$15,000 - $50,000 / mo">$15,000 - $50,000 / mo</option>
                      <option value="$50,000+ / mo">$50,000+ / mo (Enterprise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Project Goals &amp; Details
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your goals, current challenges, target timelines..."
                      className="w-full bg-[#F8F9FA] border border-[#0F172A]/10 rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#0B57FF] focus:ring-1 focus:ring-[#0B57FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0B57FF] hover:bg-[#0948d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-full text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting Proposal Request...</span>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
