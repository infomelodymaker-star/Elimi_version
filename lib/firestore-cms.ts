import { doc, getDoc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { useState, useEffect } from 'react';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from './firestore-sync';

export interface CmsSection {
  id: string;
  type: 'hero' | 'text' | 'gallery' | 'features';
  content: any;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  sections: CmsSection[];
  lastUpdated: string;
}

export const INITIAL_CMS_PAGES: CmsPage[] = [
  {
    id: 'print',
    title: 'Print Page',
    slug: '/print',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          badge: 'Premier Printing Hub',
          headline: 'Precision Print & Custom Packaging',
          subheadline: 'Your trusted partner for custom printing solutions. High-fidelity color accuracy, premium substrates, and fast nationwide turnaround delivered to your doorstep.',
          exploreBtnText: 'Explore Products',
          galleryBtnText: 'View Gallery',
          ratingText: '4.9/5 Rating',
          proofingText: 'Fast Proofing',
          savingsText: 'Bulk Savings',
          avatars: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCxRnqsFxxJC3yPYvykWUeIFI3tJecopSYfzl10XZNgCIIxbjwvp7jvNhGqEVns40gd10tPOWuGIwKFqtCtUQ38klIzOJzLHFUHOTrQLlz-zNigs77qY_bekQHQzBWwZfDJKivPz1095jBlOJSd1W4H1UqPrLnRmBoDfXre_tzDC0Udm3agNwkojQSRL0_uY8ZN7bsycRWvefdObzXAvXhh5dz9qwoCZXlaTScZmeThcQfWTVk6uI9r',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDvyw7yDYyDWXy1swZ6TXmGxv8DSm-oCu9Cr0671aQlw8KMJGl981sBVzQgKQ_-xDV0nm9jccZjfsEsvI815AlSF5szhtKuZBxrXbKoGJHQjTKWYkJCM9u0GVpBjg4wjCIZJQsoqC0ocCd6j15et1i6EXgIJuDUk0R8wxeGcx-sgC1iz4K4v0ZXLlVX8sNHjSmzUGZL6oRU9WxVful6PF3SEP1ngfcMd1UrUeFlLILbPpvsbkionfqg',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuB0xTl_0zzHiGRNCLSZiuhzrAiFT8T2Te26jqaBW9hnhxdeuTO7yXPcGv-ASugHvLm0uaJcRZjstzADo27rDPN6agb809aiZEfPzygY6XFFIM7-Xc0-9jfx9_8ZZCjottp3YObEJ8mKJPoduetHBupRkQISAtnGNinhl4nHFeHaDzFlsL6FqUDP-rZqvCWxBkw1wKJtwfxvX6wWsVQPkAFFeLtZu8W05yuht099HWUtK6kC_WHoe9cp',
          ],
          showcaseImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfjh90sExcRfDYSImAmQgvy4JnHa9v-8z9hHPkWtHGiVvqmpU-j3aFsCWZL5XWF9hAejCMD3F4Ej_QjuiJD3QoTy4OHKqQg1eTKa0vlEyfE4RlA9rrMWr6LPp6Cq_rfDvXNNLPtlcJSO9L7NiuTfzwaTJKm-I1GvhmiOya6popyQj7sodvOXGLCeL4Xn34f22MCAtnp4RBV1gjujMAZ6FfK0YFFDq3YmPJgpkSXxtW7EnQnTl1a52f',
        },
      },
      {
        id: 'features',
        type: 'features',
        content: {
          eyebrow: 'Craftsmanship & Engineering',
          title: 'Reasons To Choose Our Printing Studio',
          description: 'We deliver enterprise-grade printing solutions customized to your brand requirements, ensuring color fidelity, crisp vector detail, and durable substrates across every single piece.',
          mainImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS',
          secondaryImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS',
          experienceYears: '24+',
          experienceTitle: 'Years Experience',
          experienceSub: 'Custom Printing',
          feature1Title: 'Premium Substrates & Inks',
          feature1Desc: 'Engineered for vivid gamut range, sharp fine lines, and long-lasting UV & scuff resistance.',
          feature2Title: 'Expedited Nationwide Dispatch',
          feature2Desc: 'Reliable turnarounds and real-time tracking so your marketing collateral is ready ahead of schedule.',
          perk1: '100% Quality Assurance',
          perk2: 'Same-Day Digital Proofing',
        },
      },
      {
        id: 'services',
        type: 'services',
        content: {
          badge: 'Specialized Categories',
          title: 'Premier Custom Print Solutions',
          subtitle: 'Select a category to explore instant configuration, material choices, and digital proofing options.',
          items: [
            {
              id: 'apparel',
              title: 'Custom Apparel',
              subtitle: 'T-Shirts, Hoodies, Polos & Caps',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhSvRw53ZDp7iCDW0qzgcTC09hwaqYUXfiIpp_DLl6N0zDLE-c1WIlH_ArA5fBIxiK7C9jCeJBC7VcLE76WfSrigue4Mx0NjdMROw_IvbkH6z0h_Zs2W7hsX11RqGsWkt_sVa_2rtj9Ka6vvx4tFXUlngoc-C9HAfe-yUSyi6Vt8TuHqD9G0etNHJG4WoBT3rgBxpbn3ATQ3zHo9ws-TkG-iw63hnMHF2HY2KDdqYwjycIXCw3NJeH',
              tags: ['Screen Print', 'Embroidery', 'DTG'],
              badge: 'Popular',
            },
            {
              id: 'stationery',
              title: 'Business Stationery',
              subtitle: 'Business Cards, Letterheads & Envelopes',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmkMZDKFG7Vtk6n5FbbM8NhO4JPHW5WOWB7Ajr37ExAXk0L47VCa4aJgtymW63w-QvLVOETD4EsShOS4MP7sbcwDsDANzG9h3vLMRw9becoEUZZosJ0aD40mSMQ1NNhBO1kdB0QL9mNKD23IFHI4Fd0CJ-RyAUgUnqSI1OM28eV1b87nwQq8fvkutdrrWw9pGJZTBmDLd1BysdOfvr_zSnnIuyWTNCBkMY3vAxbvIV_Xj8FhG8Rvxm',
              tags: ['Foil Stamping', 'Spot UV', 'Textured Paper'],
              badge: 'Essential',
            },
            {
              id: 'packaging',
              title: 'Packaging & Labels',
              subtitle: 'Custom Boxes, Jars, Stickers & Bags',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ylj73groQ5L2TIDkZEVCZUo1JEM5oVBY-xwdq7pUCXZHxPqsjxqp1jbC8M6YPnDG3TdNQgm6sg-dC6VmAUrp28QC8BojveO1BwOgo6MD0t2L2ercosdgiKhS-U45WS7UnYTWxWzPPhghUwe5kSc9HwKYut32W1zKmd_AaGIWxbMnTY3yeFzvzSaS_SFU6eBR7r_ROe8zZtIPb5RL_bq7cl38QhmTc7IBHZ1Rqm9nxfWPC0ezMuHS',
              tags: ['Corrugated', 'Rigid Boxes', 'Die-Cut Labels'],
              badge: 'Best Value',
            },
            {
              id: 'promotional',
              title: 'Promotional Items',
              subtitle: 'Bottles, Mugs, Notebooks & Swag Kits',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuihW_pUe9stC3071PxkFCybFiONj-Joq-OTe_GcElx3MEKgsREWjQjuImSsM2PcbMudIykONgtdXMM716DZ8Ru0dtfOPpYA-vjiB0te8iBBuiBzM3bhToAmIqf3VUbAXXLxhmFNOKGUZCUx8PT2tgok6FgBo652kvUN2Ci8UKa1vLEb-9NsrjpShyL631d6W_olAEswb5bw6VRgUYk9xdLaLqGHCypmw__8DXqOmvApifka6JgMpm',
              tags: ['Laser Engraved', 'Pad Print', 'Full Wrap'],
              badge: 'Corporate',
            },
          ],
        },
      },
      {
        id: 'process',
        type: 'process',
        content: {
          badge: 'Seamless Workflow',
          title: 'Precision Print in 3 Clear Steps',
          subtitle: 'From digital artwork submission to nationwide logistics, experience effortless print management.',
          step1Title: '1. Upload Artwork',
          step1Desc: 'Upload vector graphics, logos, or print files. Instant automatic format check & CMYK profile conversion.',
          step2Title: '2. Proof & Approval',
          step2Desc: 'Inspect high-fidelity digital proofs. Verify bleed boundaries, substrate weights, and finishing details.',
          step3Title: '3. Production & Delivery',
          step3Desc: 'Precision digital or offset printing with rigorous QA checks, dispatched nationwide with real-time tracking.',
          promoBadge: 'Save up to 35% on orders over 500 units',
          promoTitle: 'Volume Commercial Printing & Custom Branding',
          promoDescription: 'Need large-scale corporate merchandise, custom boxes, or event banners? Speak with our print production specialist for contract rates.',
          promoButtonText: 'Claim Bulk Discount',
        },
      },
    ],
  },
  {
    id: 'cars',
    title: 'Cars Page',
    slug: '/cars',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          badge: 'VIP Fleet & Mobility',
          cardBadge: 'Prestige & Escort',
          headline: "Let's find your perfect ride.",
          subheadline: 'Browse prestige vehicles for certified purchase or rent for VIP protocol, executive travel, and special diplomatic missions.',
          backgroundImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1600',
          btnSaleText: 'Browse Cars for Sale',
          btnRentText: 'Browse Cars for Rent',
        },
      },
      {
        id: 'map',
        type: 'map',
        content: {
          badge: 'Live Fleet Map',
          title: 'Map your fleet.',
          description: 'View live vehicle locations across our central Bujumbura station and partner luxury showrooms.',
        },
      },
      {
        id: 'features',
        type: 'features',
        content: {
          feature1Title: 'Diplomatic & Executive Security',
          feature1Desc: 'Certified motorcade drivers, armored vehicle options, and discretion for dignitaries, delegations, and VIPs.',
          feature2Title: 'Pristine Fleet Condition',
          feature2Desc: 'Every vehicle is thoroughly sanitized, fully inspected, and maintained to manufacturer standards before departure.',
          feature3Title: 'Flexible Purchase & Rental',
          feature3Desc: 'From daily ceremonial rentals and airport VIP escort to outright certified purchases with warranty.',
        },
      },
      {
        id: 'cta',
        type: 'cta',
        content: {
          title: 'Ready to take the wheel?',
          description: 'Speak with an ELIMI Mobility advisor to reserve your vehicle, schedule a test drive, or arrange bespoke VIP convoy logistics.',
          primaryButtonText: 'Schedule a Test Drive / Booking',
          secondaryButtonText: 'Call Mobility Concierge',
          phoneNumber: '+257 79 000 000',
        },
      },
    ],
  },
  {
    id: 'houses',
    title: 'Houses Page',
    slug: '/houses',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          badge: 'Luxury Estates & Residences',
          cardBadge: 'Villas & Penthouses',
          headline: "Let's find your perfect fit.",
          subheadline: 'Browse prestige villas, modern apartments, and executive residences for purchase or long-term lease.',
          backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80',
          btnSaleText: 'Browse Homes for Sale',
          btnRentText: 'Browse Homes for Rent',
        },
      },
      {
        id: 'map',
        type: 'map',
        content: {
          badge: 'Prime Locations Map',
          title: 'Explore property locations.',
          description: 'View verified luxury estates, residential districts, and diplomatic quarters across Bujumbura.',
        },
      },
      {
        id: 'features',
        type: 'features',
        content: {
          feature1Title: 'Prime Residential Locations',
          feature1Desc: 'Exclusive villas and penthouses in Kiriri, Rohero, and Gihosha with scenic panoramic vistas and 24/7 security.',
          feature2Title: 'Full Legal Verification',
          feature2Desc: 'Every property has verified title deeds and clear cadastral documentation supervised by notary counsel.',
          feature3Title: 'Flexible Purchase & Lease',
          feature3Desc: 'From turnkey furnished executive rentals for expatriates to permanent luxury property acquisitions.',
        },
      },
      {
        id: 'cta',
        type: 'cta',
        content: {
          title: 'Looking for your dream home?',
          description: 'Speak with an ELIMI Real Estate advisor to arrange a private viewing, negotiate terms, or discuss custom development.',
          primaryButtonText: 'Schedule a Private Viewing',
          secondaryButtonText: 'Call Estate Concierge',
          phoneNumber: '+257 79 000 000',
        },
      },
    ],
  },
  {
    id: 'allocations',
    title: 'Allocations & Rentals',
    slug: '/allocations',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          badge: 'VIP Event Rentals & Allocations',
          headline: 'Elite Event Wardrobe & Tech Allocations',
          subheadline: 'Rent ceremonial protocol suits, evening gala gowns, sound/lighting gear, and event furniture with concierge delivery.',
          backgroundImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1600',
          bannerBadge: 'Concierge Wardrobe & Gear',
          bannerTitle: 'Complete Event Allocation Packages',
          bannerDesc: 'Outfit entire hostesses & protocol teams or rent top-tier audiovisual equipment for international summits.',
        },
      },
      {
        id: 'features',
        type: 'features',
        content: {
          feature1Title: 'Bespoke Styling & Sizing',
          feature1Desc: 'All dresses, suits, and uniforms are professionally dry-cleaned, tailored, and fitted before delivery.',
          feature2Title: 'Express Nationwide Logistics',
          feature2Desc: 'On-site setup and rapid delivery across Bujumbura and nationwide venues.',
          feature3Title: 'Flexible Allocation Terms',
          feature3Desc: 'Daily, multi-day, or corporate event season bookings with dedicated stylist support.',
        },
      },
      {
        id: 'cta',
        type: 'cta',
        content: {
          title: 'Need Custom Allocations for Your Event?',
          description: 'Our event logistics team can coordinate complete wardrobe styling, equipment staging, and VIP setup.',
          primaryButtonText: 'Inquire via WhatsApp',
          phoneNumber: '+257 79 000 000',
        },
      },
    ],
  },
  {
    id: 'policies',
    title: 'Legacy & Policies',
    slug: '/policies',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'policies',
        type: 'policies',
        content: {
          title: 'ELIMI Official Legacy & Policies',
          subtitle: 'Governing VIP Protocol, Luxury Mobility, Real Estate, E-Commerce, Custom Print & Allocations',
          effectiveDate: 'Effective Date: October 2024',
          legacyMission: 'Founded with the ambition to elevate Burundian hospitality and commerce to world-class standards, ELIMI stands for unwavering precision, elegance, and integrity. Our legacy is built on bridging local excellence with international diplomatic standards—providing distinguished leaders, visiting delegations, and local citizens with uncompromised service quality across mobility, event protocol, luxury accommodations, and creative production.',
          termsOfService: `1. ACCEPTANCE OF TERMS: By accessing or utilizing any ELIMI service (including Protocol Staffing, Fleet Mobility, Real Estate, Print, and E-commerce), clients agree to be bound by these Terms of Service.

2. BOOKING & PROTOCOL PROTOCOLS: Vehicle reservations and protocol bodyguard or hostess deployments require advance scheduling. All drivers and security officers operate under strictly governed legal guidelines and road safety regulations.

3. PAYMENT & SECURITY DEPOSITS: Rentals may require a refundable security deposit. Payments are accepted via verified local and international channels (Lumicash, Ecocash, Credit Cards, Bank Transfer).

4. INTELLECTUAL PROPERTY & ARTWORK: For Print services, clients confirm ownership or rights to submitted visual assets. ELIMI guarantees commercial color fidelity and substrate quality as agreed in digital proofs.`,
          privacyPolicy: `1. CLIENT CONFIDENTIALITY: ELIMI enforces strict non-disclosure for all VIP, diplomatic, and executive clients. Personal travel itineraries, residential addresses, and private event details are never disclosed to third parties.

2. DATA COLLECTION & STORAGE: We collect necessary transactional information (names, contact numbers, delivery addresses) solely to execute orders and bookings. Data is securely processed with industry-standard encryption.

3. COOKIES & PLATFORM METRICS: Our platform uses minimal operational cookies to maintain your shopping cart, preferred currency, and authenticated sessions. We do not sell client data.`,
          refundPolicy: `1. EVENT & MOBILITY CANCELLATIONS: Notice provided 48 hours prior to deployment is eligible for a full refund or rescheduling credit. Cancellations within 24 hours may incur a 20% logistics fee.

2. PRINTED GOODS & MERCHANDISE: Because custom printing is tailored to bespoke client specifications, reprints are issued free of charge in the rare event of verified manufacturing defects or color variance exceeding standard tolerance.

3. REAL ESTATE & ACCOMMODATION: Tenancy and lease deposits are held under formal escrow and governed by the Burundian Civil Code and tenancy agreements.`,
          licensePolicy: `ELIMI is a registered enterprise operating in compliance with the Ministry of Commerce and Transport authorities of the Republic of Burundi. All security personnel, transport fleet vehicles, and commercial activities are fully insured, certified, and compliant with relevant domestic and international trade treaties.`,
          contactEmail: 'compliance@elimi.bi',
          contactPhone: '+257 79 000 000',
        },
      },
    ],
  },
  {
    id: 'home',
    title: 'Home Page',
    slug: '/',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Excellence Beyond Expectations.',
          subheadline: 'PROFESSIONALISM. PRECISION. PRESENCE.',
          description: 'ELIMI delivers exceptional hospitality, prestige mobility, luxury real estate, digital engineering, and custom print solutions with world-class elegance.',
          backgroundImage: '/assets/protocol/PROTOCOL_SECTION.webp',
          ctaText: 'Explore Our Services',
          ctaLink: '/protocol',
          protocolCardTitle: 'ELIMI Protocol',
          protocolCardSub: 'Professional Protocol & Hospitality Services',
          protocolCardDesc: 'We provide world-class protocol services that blend sophistication with warmth—ensuring every guest, every time, feels valued and respected.',
        },
      },
      {
        id: 'four-pillars',
        type: 'features',
        content: {
          eyebrow: 'Our 4 Core Pillars',
          title: 'Explore Our Integrated Services',
          description: 'Four specialized divisions operating with seamless synergy across Burundi and international markets.',
          pillar1Title: 'Diplomatic Mobility & Escort',
          pillar1Desc: 'Certified chauffeur drivers, armored luxury SUVs, and presidential motorcade escort.',
          pillar2Title: 'Villas & Prime Real Estate',
          pillar2Desc: 'Turnkey executive rentals, verified title deeds, and luxury lakeside compounds.',
          pillar3Title: 'Digital Solutions & Identity',
          pillar3Desc: 'Mobile apps, custom dashboards, inventory systems, and verified Google Maps search integration.',
          pillar4Title: 'Custom Print & Branding',
          pillar4Desc: 'High-fidelity packaging, corporate apparel, laser engraving, and custom event allocation.',
        },
      },
      {
        id: 'how-it-works',
        type: 'process',
        content: {
          badge: 'How ELIMI Works',
          title: 'Effortless VIP Booking in 4 Steps',
          subtitle: 'From digital inquiry to on-ground concierge execution, experience flawless protocol.',
          step1Title: '1. Select Your Service',
          step1Desc: 'Choose your desired service across mobility, villas, print, digital engineering, or protocol hosting.',
          step2Title: '2. Instant Quote & Tailoring',
          step2Desc: 'Our concierge verifies schedule availability and prepares custom pricing transparently.',
          step3Title: '3. Secure Confirmation',
          step3Desc: 'Confirm effortlessly via local/international channels (Lumicash, Ecocash, Card, Wire).',
          step4Title: '4. Flawless Execution',
          step4Desc: 'Your dedicated ELIMI project manager coordinates all on-ground operations with 24/7 support.',
        },
      },
      {
        id: 'numbers',
        type: 'features',
        content: {
          stat1Value: '500+',
          stat1Label: 'VIP Convoys Executed',
          stat2Value: '120+',
          stat2Label: 'Luxury Properties Managed',
          stat3Value: '99.8%',
          stat3Label: 'On-Time Service Rating',
          stat4Value: '24/7',
          stat4Label: 'Diplomatic Support',
        },
      },
      {
        id: 'home-cta',
        type: 'cta',
        content: {
          title: 'Ready to Experience ELIMI Excellence?',
          description: 'Contact our executive team today to coordinate VIP mobility, reserve premier estates, or engineer your digital properties.',
          primaryButtonText: 'Start Direct Inquiry',
          secondaryButtonText: 'View Digital Solutions',
          phoneNumber: '+257 79 000 000',
        },
      },
    ],
  },
  {
    id: 'digital-solutions',
    title: 'Digital Solutions & Web Dev',
    slug: '/digital-solutions',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          badge: 'Digital Solutions & Web Development',
          cardBadge: 'Enterprise & Local Search',
          headline: 'High-Impact Digital Solutions for Growing Businesses.',
          subheadline: 'Mobile Apps, Web Platforms, Custom Dashboards, Inventory Systems & Google Maps Local Search Integration.',
          description: 'We help entrepreneurs, enterprises, and institutions establish dominant online properties, streamline business operations with custom software, and rank prominently on Google Maps and search results.',
          backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1600',
          backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-41589-large.mp4',
          servicesBgImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1600',
          mapsBgImage: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&q=80&w=1600',
          ctaBgImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600',
          btnPrimaryText: 'Explore Digital Services',
          btnSecondaryText: 'Chat on WhatsApp',
          stats1: '100% Mobile & Web Responsive',
          stats2: 'Google Maps Verified Setup',
          stats3: '24/7 Cloud Support',
        },
      },
      {
        id: 'services',
        type: 'services',
        content: {
          badge: 'Core Competencies',
          title: 'Full-Spectrum Digital Capabilities',
          subtitle: 'From native mobile apps to custom inventory engines and dominant search presence, we build technology that drives measurable revenue.',
          items: [
            {
              id: 'mobile-apps',
              title: 'Mobile Apps Development',
              subtitle: 'iOS & Android Native & Cross-Platform',
              description: 'Fast, fluid mobile apps built with React Native and Flutter. Includes push notifications, offline syncing, biometric auth, and App Store / Google Play publishing.',
              image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
              tags: ['iOS', 'Android', 'React Native', 'Flutter', 'Offline Ready'],
              badge: 'High Demand',
            },
            {
              id: 'websites-creation',
              title: 'Modern Websites & Web Apps',
              subtitle: 'High-Performance Next.js Architecture',
              description: 'Blazing fast, SEO-optimized web applications with editorial aesthetics, custom CMS backends, ultra-responsive layouts, and payment gateway integration.',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
              tags: ['Next.js 15', 'Tailwind CSS', 'SEO Optimised', 'Fast Load', 'E-Commerce'],
              badge: 'Flagship',
            },
            {
              id: 'dashboards-systems',
              title: 'Custom Dashboards & Analytics',
              subtitle: 'Executive Business Intelligence & CRM',
              description: 'Command centers with real-time KPI metrics, role-based access control (RBAC), multi-branch synchronization, and automated data exports.',
              image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
              tags: ['Realtime Charts', 'RBAC Security', 'Cloud Sync', 'Export Reports'],
              badge: 'Enterprise',
            },
            {
              id: 'inventory-systems',
              title: 'Smart Inventory & POS Systems',
              subtitle: 'Multi-Warehouse Stock Management',
              description: 'Complete stock tracking software with barcode/QR scanning, automatic low-stock alerts, supplier tracking, receipt generation, and profit margins analysis.',
              image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
              tags: ['Barcode / QR', 'Stock Alerts', 'Multi-Store', 'Offline POS'],
              badge: 'Operational',
            },
            {
              id: 'google-maps-identity',
              title: 'Google Maps & Online Brand Identity',
              subtitle: 'Local SEO & Digital Search Verification',
              description: 'We build your online properties and integrate your business directly into Google Maps & Google Business Profile so local and international clients find you instantly.',
              image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800',
              tags: ['Google Maps Pin', 'Local SEO', 'Business Profile', 'Reviews System'],
              badge: 'Visibility',
            },
            {
              id: 'digital-properties',
              title: 'Digital Properties Creation',
              subtitle: 'Domains, Hosting & Cloud Architecture',
              description: 'Turnkey setup of company domain names, business professional emails (@yourbrand.com), SSL certificates, CDN distribution, and Google Cloud infrastructure.',
              image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
              tags: ['Domain & DNS', 'Pro Emails', 'Cloud Security', 'CDN Global'],
              badge: 'Foundation',
            },
          ],
        },
      },
      {
        id: 'google-maps-spotlight',
        type: 'features',
        content: {
          eyebrow: 'Google Maps & Local Search Engine Dominance',
          title: 'Be Seen First When Customers Search for Your Services',
          description: 'Over 85% of high-intent clients find nearby businesses via Google Maps and localized Google Search. We create, optimize, verify, and manage your Google Business presence so your company appears with phone numbers, directions, photos, and live hours.',
          feature1Title: 'Verified Google Maps Pinpoint & Directions',
          feature1Desc: 'Accurate geographic marker, turnkey driving instructions, and photos of your storefront or showroom.',
          feature2Title: 'Local SEO & Keywords Optimization',
          feature2Desc: 'Rank at the top when users search for your industry in Bujumbura, Burundi, and neighboring regions.',
          feature3Title: 'Google Business Profile Management',
          feature3Desc: 'Automated review requests, official WhatsApp/Call integration, and synchronized operating hours.',
        },
      },
      {
        id: 'process',
        type: 'process',
        content: {
          badge: 'Our Development Lifecycle',
          title: 'From Concept to High-Performance Deployment',
          subtitle: 'A disciplined, engineering-first methodology ensuring on-time delivery with zero technical debt.',
          step1Title: '1. Discovery & Architecture',
          step1Desc: 'We analyze your workflows, database requirements, target audience, and Google Maps presence goals.',
          step2Title: '2. UI/UX Design System',
          step2Desc: 'Pixel-perfect wireframes and responsive prototypes tailored for mobile and desktop screens.',
          step3Title: '3. Full-Stack Engineering',
          step3Desc: 'Clean, performant TypeScript code, robust cloud APIs, secure authentication, and offline capabilities.',
          step4Title: '4. Cloud Launch & Google Integration',
          step4Desc: 'Production deployment, Google Maps verification, staff training, and continuous technical support.',
          promoBadge: 'Special Package for Emerging Businesses',
          promoTitle: 'Complete Digital Launch Bundle',
          promoDescription: 'Includes Custom Website + Google Maps Setup & Verification + Pro Email Setup + Social Links Integration.',
          promoButtonText: 'Inquire on WhatsApp',
        },
      },
      {
        id: 'cta',
        type: 'cta',
        content: {
          title: 'Ready to build your custom digital solution?',
          description: 'Speak directly with our senior software architects to scope your mobile app, website, inventory platform, or Google Maps setup.',
          primaryButtonText: 'Chat on WhatsApp',
          secondaryButtonText: 'Call Tech Concierge',
          phoneNumber: '+257 79 000 000',
        },
      },
    ],
  },
  {
    id: 'protocol',
    title: 'Protocol Page',
    slug: '/protocol',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'ELIMI PROTOCOL SERVICES',
          subheadline: 'Diplomatic reception, VIP motorcades, executive bodyguards, and elite event hosting with flawless precision.',
          backgroundImage: '/assets/protocol/PROTOCOL_SECTION.webp',
          ctaBadge: '24/7 Diplomatic & Corporate Escort',
        },
      },
      {
        id: 'services',
        type: 'services',
        content: {
          title: 'Our Executive Protocol Services',
          subtitle: 'End-to-end delegation management and VIP reception built on elegance and security',
          items: [
            {
              id: 'sec-01',
              title: 'VIP & Diplomatic Escort',
              description: 'State-level airport tarmac reception, motorcade coordination, and high-security convoy escort.',
              image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1200',
              badge: 'Highest Security',
            },
            {
              id: 'sec-02',
              title: 'Executive Hostesses & Reception',
              description: 'Multilingual professional hostesses trained in international protocol, summit registration, and guest ushering.',
              image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
              badge: 'Bespoke Hospitality',
            },
            {
              id: 'sec-03',
              title: 'Close Bodyguard Protection',
              description: 'Certified tactical bodyguards and discrete executive protection for dignitaries, celebrities, and CEOs.',
              image: 'https://images.unsplash.com/photo-1508847154043-be5407f15ad9?auto=format&fit=crop&q=80&w=1200',
              badge: 'Tactical Clearance',
            },
            {
              id: 'sec-04',
              title: 'Armored & Luxury Fleet Mobility',
              description: 'Bulletproof SUVs, Maybach limousines, and luxury Mercedes buses with trained chauffeur captains.',
              image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
              badge: 'Armored B6',
            },
          ],
        },
      },
      {
        id: 'portraitVideos',
        type: 'videos',
        content: {
          title: 'Protocol in Motion',
          subtitle: 'Live portrait video showcases from our recent diplomatic motorcades & international summit hosting',
          items: [
            {
              id: 'vid-01',
              title: 'Tarmac VIP Reception & Convoy',
              description: 'Presidential motorcade arrival and tarmac escort service.',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-a-modern-office-42861-large.mp4',
              posterUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
            },
            {
              id: 'vid-02',
              title: 'Summit Hostess & Ushering',
              description: 'Multilingual hostess protocol for international economic summit.',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-businesswoman-working-at-a-clean-desk-42862-large.mp4',
              posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
            },
            {
              id: 'vid-03',
              title: 'Executive Protection Detail',
              description: 'Tactical close protection unit escorting visiting delegations.',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-42864-large.mp4',
              posterUrl: 'https://images.unsplash.com/photo-1508847154043-be5407f15ad9?auto=format&fit=crop&q=80&w=800',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'shop',
    title: 'Shop Page',
    slug: '/shop',
    lastUpdated: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          headline: 'Premium Shopping Experience',
          subheadline: 'STYLE. ELEGANCE. QUALITY.',
          backgroundImage: '/assets/shop/shop_hero_showcase.jpg',
        },
      },
    ],
  },
];

export const CMS_STORAGE_KEY = 'elimi_cms_pages_storage';
export const CMS_SYNC_EVENT = 'elimi_sync_cms_pages';

export function useCmsPage(pageId: string) {
  const [data, setData] = useState<any>(() => {
    return INITIAL_CMS_PAGES.find((p) => p.id === pageId) || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Hydrate from storage on mount
    queueMicrotask(() => {
      const pages = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
      const cached = pages.find((p) => p.id === pageId);
      if (cached) setData(cached);
    });

    const handleSync = () => {
      const updated = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
      const matched = updated.find((p) => p.id === pageId);
      if (matched) setData(matched);
    };

    window.addEventListener(CMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // Safe Firestore listener
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onSnapshot(
        doc(db, 'cms_pages', pageId),
        (docSnap) => {
          if (docSnap.exists()) {
            setData(docSnap.data());
          }
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch {
      // Retain existing cached data
    }

    return () => {
      window.removeEventListener(CMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, [pageId]);

  return { data, loading };
}

/**
 * Utility to strip undefined properties recursively for Firestore safe operations.
 */
export function cleanObjectForFirestore<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObjectForFirestore(item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object') {
      cleaned[key] = cleanObjectForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/**
 * Saves a CmsPage to localStorage and syncs with Firestore collection 'cms_pages'.
 */
export async function saveCmsPageToFirestore(page: CmsPage): Promise<void> {
  const updatedPage: CmsPage = {
    ...page,
    lastUpdated: new Date().toISOString(),
  };

  // 1. Instantly update localStorage & notify reactive UI listeners
  const currentPages = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
  const existsIndex = currentPages.findIndex((p) => p.id === updatedPage.id);
  const newPages = [...currentPages];
  if (existsIndex >= 0) {
    newPages[existsIndex] = updatedPage;
  } else {
    newPages.push(updatedPage);
  }
  saveStoredItems(CMS_STORAGE_KEY, newPages, CMS_SYNC_EVENT);

  // 2. Safe background Firestore task
  const cleanedData = cleanObjectForFirestore(updatedPage as any);
  await runFirestoreTaskSafe(
    () => setDoc(doc(db, 'cms_pages', updatedPage.id), cleanedData, { merge: true }),
    3000,
    `Save CMS page ${updatedPage.id}`
  );
}

