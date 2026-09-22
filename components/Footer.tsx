"use client";

import React, { useState } from "react";
import { ArrowUpRight, Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { runFirestoreTaskSafe } from "@/lib/firestore-sync";
import LegacyPoliciesModal from "@/components/LegacyPoliciesModal";

interface FooterLinkItem {
  label: string;
  href: string;
  policyTab?: 'legacy' | 'terms' | 'privacy' | 'refund' | 'license';
}

interface FooterColumn {
  title: string;
  items: FooterLinkItem[];
}

const links: FooterColumn[] = [
  {
    title: "Services",
    items: [
      { label: "Home", href: "/" },
      { label: "Cars", href: "/cars" },
      { label: "Media", href: "/media" },
      { label: "Protocol", href: "/protocol" },
    ],
  },
  {
    title: "Market",
    items: [
      { label: "Shop", href: "/shop" },
      { label: "Houses", href: "/houses" },
      { label: "Print", href: "/print" },
      { label: "Other Rentals", href: "/allocations" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/#contact" },
      { label: "Legacy", href: "#legacy", policyTab: 'legacy' },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Legacy & Policies", href: "#legacy", policyTab: 'legacy' },
      { label: "License", href: "#license", policyTab: 'license' },
      { label: "Privacy", href: "#privacy", policyTab: 'privacy' },
      { label: "Terms", href: "#terms", policyTab: 'terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const settings = useSettings();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Policy Modal state
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<'legacy' | 'terms' | 'privacy' | 'refund' | 'license'>('legacy');

  const handleOpenPolicy = (tab: 'legacy' | 'terms' | 'privacy' | 'refund' | 'license') => {
    setPolicyTab(tab);
    setIsPoliciesOpen(true);
  };

  const whatsappNum = settings?.whatsappNumber || "25769992984";
  const whatsappLink = `https://wa.me/${whatsappNum.replace(/\+/g, "")}`;

  const socials = [
    {
      label: "WhatsApp",
      icon: "/assets/icons/social/whatsapp-150x150.png",
      href: whatsappLink,
    },
    {
      label: "Facebook",
      icon: "/assets/icons/social/facebook-150x150.png",
      href: "https://facebook.com/elimiburundi",
    },
    {
      label: "Instagram",
      icon: "/assets/icons/social/instagram-150x150.png",
      href: "https://instagram.com/elimi_burundi",
    },
    {
      label: "YouTube",
      icon: "/assets/icons/social/Youtube.png",
      href: "https://youtube.com/@elimimedia",
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Store locally
    try {
      const stored = JSON.parse(localStorage.getItem("elimi_newsletter_subscribers") || "[]");
      if (!stored.includes(cleanEmail)) {
        stored.push(cleanEmail);
        localStorage.setItem("elimi_newsletter_subscribers", JSON.stringify(stored));
      }
    } catch {
      // Ignore local storage error
    }

    // Save to Firestore asynchronously
    runFirestoreTaskSafe(async () => {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: cleanEmail,
        subscribedAt: new Date().toISOString(),
        source: "footer",
      });
    }, 1500, "Footer Newsletter Subscription");

    setSubmitting(false);
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-white text-[#0F172A] border-t border-[#0F172A]/8 mt-auto">
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-12 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-[#0F172A]/8 pb-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-semibold tracking-tight group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/icons/ELIMI_LOGO.svg"
                alt="Elimi Logo"
                className="size-6 transition-transform group-hover:scale-105"
              />
              <span className="font-bold tracking-tight text-lg font-heading text-[#0F172A]">ELIMI</span>
            </Link>
            <span className="hidden text-xs text-[#64748B] sm:inline border-l border-[#0F172A]/10 pl-3">
              Luxury Services &amp; Market
            </span>
          </div>

          {/* Newsletter Form */}
          <div className="w-full sm:w-auto">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Check className="size-4 text-emerald-600" />
                <span>Thank you for subscribing to ELIMI!</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full items-center gap-2 rounded-full border border-[#0F172A]/10 bg-[#F8F9FA] p-1.5 sm:w-auto sm:min-w-[340px] focus-within:border-[#0B57FF] focus-within:ring-2 focus-within:ring-[#0B57FF]/10 transition-all"
              >
                <Mail className="ml-3 size-4 text-[#64748B] shrink-0" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Join our newsletter"
                  className="h-9 flex-1 border-0 bg-transparent px-2 text-sm text-[#0F172A] placeholder:text-[#64748B] shadow-none focus-visible:outline-none focus-visible:ring-0"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="rounded-full bg-[#0B57FF] text-white hover:bg-[#0948d9] px-5 text-xs font-semibold shadow-none transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            )}
            {error && <p className="text-[11px] text-rose-600 mt-1 pl-3 font-medium">{error}</p>}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4">
          {links.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {column.items.map((item) => (
                  <li key={item.label}>
                    {item.policyTab ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPolicy(item.policyTab!)}
                        className="text-sm text-[#0F172A]/80 transition-colors hover:text-[#0B57FF] text-left cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="text-sm text-[#0F172A]/80 transition-colors hover:text-[#0B57FF]"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#0F172A]/8 pt-6 text-xs text-[#64748B] sm:flex-row sm:items-center">
          <p>&copy; {year} ELIMI. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="#status"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-[#0F172A]"
            >
              <span className="relative grid size-2 place-items-center">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span
                  aria-hidden
                  className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50"
                />
              </span>
              <span>All systems normal</span>
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#0B57FF]" />
            </a>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-8 place-items-center rounded-full text-[#64748B] bg-[#F8F9FA] border border-[#0F172A]/6 transition-all hover:bg-white hover:border-[#0B57FF]/30 hover:scale-105 p-1.5 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.icon}
                    alt={s.label}
                    className="size-full object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="relative -mt-4 select-none overflow-hidden pointer-events-none">
        <p
          className="block w-full text-center font-bold leading-none text-[#0F172A]/[0.03]"
          style={{
            fontSize: "clamp(4rem, 20vw, 16rem)",
            letterSpacing: "-0.05em",
          }}
        >
          ELIMI
        </p>
      </div>

      <LegacyPoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
        defaultTab={policyTab}
      />
    </footer>
  );
}
