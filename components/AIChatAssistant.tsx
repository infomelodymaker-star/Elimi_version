"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EMIL_SPRINGS, EMIL_EASINGS } from "@/lib/motion-constants";
import Link from "next/link";
import {
  ArrowUp,
  MessageCircleDashed,
  RotateCw,
  Mic,
  MicOff,
  ExternalLink,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  X,
  Minus,
  Sparkles,
  Headset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useSettings } from "@/components/SettingsProvider";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actions?: Array<{ label: string; href: string; isExternal?: boolean }>;
  thinkingSummary?: string;
  dbStatus?: string;
}

let assistantMsgCount = 0;
function createMessageId(prefix: string): string {
  assistantMsgCount += 1;
  return `${prefix}-${assistantMsgCount}-${Math.random().toString(36).slice(2, 7)}`;
}

function getTimestampString(): string {
  try {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Just now";
  }
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-msg",
    sender: "ai",
    text: `Muraho! 👋 I am **Monica**, your **ELIMI AI Assistant**.\n\nHow can I assist you today with our luxury services in Burundi?\n\n- 👑 **Protocol Staffing & VIP Escort**\n- 🛍️ **Elimi Boutique & Tech Shop**\n- 🖨️ **Print Banners & Custom Branding**\n- 🎬 **Elimi Média Shows & Live Streams**\n- 📞 **Direct WhatsApp Concierge Dispatch**`,
    timestamp: "Just now",
    actions: [
      { label: "👑 Protocol Staffing", href: "/protocol" },
      { label: "🛍️ Shop Boutique", href: "/shop" },
      { label: "🖨️ Print Solutions", href: "/print" },
      { label: "🎬 Elimi Média", href: "/media" },
      {
        label: "💬 WhatsApp Desk",
        href: "https://wa.me/25769992984",
        isExternal: true,
      },
    ],
  },
];

const SUGGESTIONS = [
  "👑 How do I book Protocol VIP hostesses?",
  "👗 What gala dresses or suits are available for rent?",
  "💻 How can Elimi build our mobile app or website?",
  "🚗 How to rent a Mercedes V-Class or Prado?",
  "🛍️ What luxury products are in Elimi Shop?",
  "🖨️ Print roll-up banners & corporate merchandise",
];

const THINKING_STEPS = [
  "Analyzing message intent...",
  "Consulting live database collections...",
  "Synthesizing tailored recommendation...",
];

export default function AIChatAssistant() {
  const settings = useSettings();
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [inputQuery, setInputQuery] = useState<string>("");
  const formattedWhatsApp = (settings.whatsappNumber || "25769992984").replace(/[^0-9]/g, "");

  const initialMessagesList: ChatMessage[] = [
    {
      id: "welcome-msg",
      sender: "ai",
      text: `Muraho! 👋 I am **Monica**, your **ELIMI AI Concierge**.\n\nHow can I assist you today with our luxury services in Burundi?\n\n- 👑 **Protocol Staffing & VIP Escort**\n- 👗 **Allocations & Gala Wardrobe/Gear Rentals**\n- 💻 **Digital Solutions & Web Platforms**\n- 🚗 **Luxury Chauffeured Fleet**\n- 🛍️ **Elimi Boutique & Tech Shop**\n- 🖨️ **Print Banners & Branding**\n- 📞 **Direct WhatsApp Concierge**`,
      timestamp: "Just now",
      actions: [
        { label: "👑 Protocol Hub", href: "/protocol" },
        { label: "👗 Allocations / Rents", href: "/allocations" },
        { label: "💻 Digital Solutions", href: "/digital-solutions" },
        { label: "🚗 Luxury Fleet", href: "/cars" },
        { label: "🛍️ Shop Boutique", href: "/shop" },
        { label: "🖨️ Print Solutions", href: "/print" },
        {
          label: "💬 WhatsApp Desk",
          href: `https://wa.me/${formattedWhatsApp}`,
          isExternal: true,
        },
      ],
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessagesList);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [thinkingStepIndex, setThinkingStepIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollButton(isScrolledUp);
  };

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setThinkingStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom("smooth");
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);

    const handleOpenCustomEvent = () => {
      setIsOpen(true);
      setShowTooltip(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-elimi-ai", handleOpenCustomEvent);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("open-elimi-ai", handleOpenCustomEvent);
      }
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setShowTooltip(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputQuery("");
  };

  // Web Speech Recognition
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: createMessageId("user"),
      sender: "user",
      text: query,
      timestamp: getTimestampString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setThinkingStepIndex(0);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const data = await response.json();
      const replyText =
        data.text ||
        "I am ready to assist you. How can I help with Protocol, Shop, or Print?";

      // Detect relevant action links
      const actions: Array<{
        label: string;
        href: string;
        isExternal?: boolean;
      }> = [];
      const lower = replyText.toLowerCase();
      if (lower.includes("/protocol") || lower.includes("protocol")) {
        actions.push({ label: "👑 Protocol Hub", href: "/protocol" });
      }
      if (
        lower.includes("/shop") ||
        lower.includes("shop") ||
        lower.includes("boutique")
      ) {
        actions.push({ label: "🛍️ Elimi Shop", href: "/shop" });
      }
      if (lower.includes("/print") || lower.includes("print")) {
        actions.push({ label: "🖨️ Print Hub", href: "/print" });
      }
      if (
        lower.includes("/media") ||
        lower.includes("media") ||
        lower.includes("video")
      ) {
        actions.push({ label: "🎬 Elimi Média", href: "/media" });
      }
      actions.push({
        label: "💬 WhatsApp Desk",
        href: "https://wa.me/25769992984",
        isExternal: true,
      });

      const aiMsg: ChatMessage = {
        id: createMessageId("ai"),
        sender: "ai",
        text: replyText,
        timestamp: getTimestampString(),
        actions: actions.length > 0 ? actions : undefined,
        thinkingSummary: data.thinkingSummary,
        dbStatus: data.dbStatus,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: createMessageId("err"),
        sender: "ai",
        text: "Thank you for reaching out! Our team is available on WhatsApp (+257 69 992 984) to assist with all your protocol, fleet, and shopping inquiries in Burundi.",
        timestamp: getTimestampString(),
        actions: [
          {
            label: "💬 Chat on WhatsApp",
            href: "https://wa.me/25769992984",
            isExternal: true,
          },
          { label: "👑 Protocol Page", href: "/protocol" },
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className="h-1.5" />;
      }

      if (line.startsWith("### ")) {
        return (
          <h4
            key={lineIdx}
            className="font-semibold text-xs sm:text-[13px] text-slate-900 mt-2 mb-1"
          >
            {line.replace("### ", "")}
          </h4>
        );
      }

      const isBullet = line.startsWith("- ") || line.startsWith("* ");
      const content = isBullet ? line.substring(2) : line;

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      const regex = /(\*\*(.*?)\*\*)|(\[(.*?)\]\((.*?)\))/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }

        if (match[1]) {
          parts.push(
            <strong
              key={`${lineIdx}-${match.index}`}
              className="font-semibold text-slate-900"
            >
              {match[2]}
            </strong>,
          );
        } else if (match[3]) {
          const linkLabel = match[4];
          const linkHref = match[5];
          const isExternal =
            linkHref.startsWith("http") || linkHref.startsWith("https://wa.me");

          if (isExternal) {
            parts.push(
              <a
                key={`${lineIdx}-${match.index}`}
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0D52FF] hover:underline font-medium inline-flex items-center gap-0.5"
              >
                <span>{linkLabel}</span>
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </a>,
            );
          } else {
            parts.push(
              <Link
                key={`${lineIdx}-${match.index}`}
                href={linkHref}
                className="text-[#0D52FF] hover:underline font-medium"
              >
                {linkLabel}
              </Link>,
            );
          }
        }

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <div
            key={lineIdx}
            className="flex items-start gap-1.5 my-0.5 text-xs sm:text-[13px] text-slate-800"
          >
            <span className="text-[#0D52FF] font-bold">•</span>
            <div className="flex-1 leading-relaxed">{parts}</div>
          </div>
        );
      }

      return (
        <p
          key={lineIdx}
          className="text-xs sm:text-[13px] leading-relaxed text-slate-800 my-0.5"
        >
          {parts}
        </p>
      );
    });
  };

  return (
    <>
      {/* =========================================================================
          COLLAPSED FLOATING CTA BUBBLE TRIGGER
         ========================================================================= */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
            {/* Proactive Floating Tooltip Bubble */}
            {showTooltip && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: shouldReduceMotion ? 0.05 : 0.16, ease: EMIL_EASINGS.easeOut }}
                className="hidden sm:flex items-center gap-2 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-slate-800 relative cursor-pointer"
                onClick={handleOpen}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  👋 Need help? <strong>Ask Monica</strong>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(false);
                  }}
                  className="ml-1 text-slate-400 hover:text-white active:scale-[0.9] transition-transform cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900" />
              </motion.div>
            )}

            {/* Main Floating Trigger Button with only Headset icon */}
            <motion.button
              id="elimi-ai-chat-trigger"
              type="button"
              onClick={handleOpen}
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.05 : 0.2, ease: EMIL_EASINGS.easeOut }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: 1.1,
                      rotate: [0, -6, 6, 0],
                      transition: { duration: 0.25 },
                    }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-[#0B57FF] hover:bg-[#0948D9] text-white shadow-xl shadow-[#0B57FF]/30 border border-white/20 transition-colors duration-200 cursor-pointer"
              aria-label="Open Monica AI Assistant"
            >
              <Headset className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          EXPANDED AI CHAT WINDOW (Matching image font sizes, family & styling)
         ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="elimi-ai-chat-window"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.95,
                    y: 12,
                    transformOrigin: "bottom right",
                  }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 12 }
            }
            transition={shouldReduceMotion ? { duration: 0.05 } : EMIL_SPRINGS.modal}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[580px] max-h-[85vh] flex flex-col font-sans"
          >
            <Card className="h-full w-full gap-0 border-slate-200/90 shadow-2xl bg-white rounded-3xl overflow-hidden flex flex-col">
              {/* Card Header */}
              <CardHeader className="border-b border-slate-100 p-4 pb-3 flex items-center justify-between shrink-0 bg-white">
                <div className="flex flex-col">
                  {/* Title changed from 'New Chat' to 'Elimi AI assistant' */}
                  <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Elimi AI assistant</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    How can I help you today?
                  </CardDescription>
                </div>

                <CardAction className="flex items-center gap-1.5">
                  {/* Reset conversation button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Reset conversation"
                    disabled={messages.length === 0 || isLoading}
                    onClick={handleResetChat}
                    className="h-8 w-8 rounded-full border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>

                  {/* Minimize / Close */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Minimize"
                    onClick={handleClose}
                    className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Close"
                    onClick={handleClose}
                    className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardAction>
              </CardHeader>

              {/* Message Content Area */}
              <CardContent className="min-h-0 flex-1 overflow-hidden p-0 relative bg-slate-50/50">
                {messages.length === 0 ? (
                  <Empty className="h-full flex flex-col justify-center items-center p-6 text-center">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2">
                          <MessageCircleDashed className="h-6 w-6 text-slate-700 stroke-[1.5]" />
                        </div>
                      </EmptyMedia>
                      {/* Empty state greeting with Monica */}
                      <EmptyTitle className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                        Morning, Monica!
                      </EmptyTitle>
                      <EmptyDescription className="text-xs text-slate-500 max-w-[280px] leading-relaxed mt-1">
                        What are we working on today? Press send to start a new
                        conversation
                      </EmptyDescription>
                    </EmptyHeader>

                    {/* Starter Suggestions */}
                    <div className="mt-4 flex flex-col gap-1.5 w-full max-w-[280px]">
                      {SUGGESTIONS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(item)}
                          className="text-left text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-[#0D52FF] hover:border-blue-200 border border-slate-200/90 px-3 py-2 rounded-xl transition shadow-2xs cursor-pointer truncate"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </Empty>
                ) : (
                  <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto p-4 space-y-3.5"
                  >
                    {messages.map((message) => {
                      const isUser = message.sender === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex flex-col ${
                            isUser ? "items-end" : "items-start"
                          } animate-in fade-in slide-in-from-bottom-2 duration-200`}
                        >
                          <div
                            className={`flex items-end gap-2 max-w-[88%] ${
                              isUser ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {/* Avatar with ELIMI Logo instead of Bot icon */}
                            {!isUser && (
                              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-800 flex items-center justify-center p-0.5 shrink-0 shadow-2xs overflow-hidden">
                                <Image
                                  src="/assets/icons/ELIMI_LOGO.svg"
                                  alt="Elimi Logo"
                                  width={18}
                                  height={18}
                                  className="object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Message Bubble - Distinct Backgrounds for User vs AI */}
                            <div
                              className={`rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed relative group shadow-2xs ${
                                isUser
                                  ? "bg-[#0D52FF] text-white rounded-br-xs font-normal"
                                  : "bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs"
                              }`}
                            >
                              {isUser ? (
                                <p className="whitespace-pre-wrap">
                                  {message.text}
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {message.thinkingSummary && (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-1 rounded-md bg-blue-50 border border-blue-100 text-[10px] text-blue-700 font-medium tracking-tight">
                                      <Sparkles className="w-2.5 h-2.5 text-[#0D52FF] shrink-0" />
                                      <span>
                                        Mapped from ELIMI business models &
                                        Firestore
                                      </span>
                                    </div>
                                  )}
                                  {renderFormattedText(message.text)}

                                  {/* Embedded Action Buttons */}
                                  {message.actions &&
                                    message.actions.length > 0 && (
                                      <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
                                        {message.actions.map((act, aIdx) =>
                                          act.isExternal ? (
                                            <a
                                              key={aIdx}
                                              href={act.href}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full transition"
                                            >
                                              <span>{act.label}</span>
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          ) : (
                                            <Link
                                              key={aIdx}
                                              href={act.href}
                                              onClick={() => setIsOpen(false)}
                                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-[#0D52FF] border border-blue-200/80 px-2 py-0.5 rounded-full transition"
                                            >
                                              <span>{act.label}</span>
                                              <ArrowRight className="w-2.5 h-2.5" />
                                            </Link>
                                          ),
                                        )}
                                      </div>
                                    )}
                                </div>
                              )}

                              {/* Copy message button */}
                              {!isUser && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(message.text, message.id)
                                  }
                                  title="Copy text"
                                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/90 rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  {copiedId === message.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {message.timestamp && (
                            <span className="text-[10px] text-slate-400 mt-1 px-1">
                              {message.timestamp}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Thinking & Analyzing Indicator with ELIMI Logo */}
                    {isLoading && (
                      <div className="flex items-end gap-2 max-w-[85%] animate-in fade-in duration-200">
                        <div className="w-6 h-6 rounded-full bg-white border border-[#0F172A]/8 text-slate-800 flex items-center justify-center p-0.5 shrink-0 shadow-2xs overflow-hidden">
                          <Image
                            src="/assets/icons/ELIMI_LOGO.svg"
                            alt="Elimi Logo"
                            width={18}
                            height={18}
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="bg-white border border-[#0B57FF]/20 rounded-2xl rounded-bl-xs p-3 shadow-2xs flex flex-col gap-1 min-w-[210px]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[#0B57FF]">
                              <Sparkles className="w-3 h-3 animate-spin [animation-duration:3s]" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Monica Thinking
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-bounce" />
                            </div>
                          </div>
                          <div className="text-[11px] text-[#64748B] font-medium leading-tight flex items-center gap-1.5 pt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-ping shrink-0" />
                            <span className="truncate">
                              {THINKING_STEPS[thinkingStepIndex]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Jump to bottom button */}
                {showScrollButton && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom("smooth")}
                    className="absolute bottom-3 right-4 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#0F172A]/8 rounded-full p-1.5 shadow-md flex items-center justify-center transition-all animate-in fade-in cursor-pointer z-10"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </CardContent>

              {/* Card Footer: Input Group Box with Mic / Dictation & Send Button */}
              <CardFooter className="flex-col gap-2 p-3 bg-white border-t border-slate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="w-full"
                >
                  <div className="rounded-2xl border border-[#0F172A]/8 bg-[#F8F9FA] focus-within:bg-white focus-within:border-[#0B57FF] focus-within:ring-2 focus-within:ring-[#0B57FF]/20 p-2.5 transition flex flex-col gap-1.5 shadow-2xs">
                    {/* Text Area */}
                    <textarea
                      ref={textareaRef}
                      rows={2}
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask Monica about protocol, shop, mobility, print..."
                      disabled={isLoading}
                      className="w-full bg-transparent resize-none text-xs sm:text-[13px] text-[#0F172A] placeholder:text-[#64748B] outline-none leading-relaxed"
                    />

                    {/* Bottom Actions Row inside Input Box */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      {/* Mic Dictation Button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        aria-label={
                          isListening ? "Stop listening" : "Voice dictation"
                        }
                        title={
                          isListening
                            ? "Listening... click to stop"
                            : "Voice dictation"
                        }
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition cursor-pointer border ${
                          isListening
                            ? "bg-red-500 border-red-500 text-white animate-pulse"
                            : "bg-white border-[#0F172A]/8 text-[#0F172A] hover:bg-slate-100 shadow-2xs"
                        }`}
                      >
                        {isListening ? (
                          <MicOff className="h-3.5 w-3.5" />
                        ) : (
                          <Mic className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Send Button with ArrowUpIcon */}
                      <button
                        type="submit"
                        disabled={!inputQuery.trim() || isLoading}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
                          inputQuery.trim() && !isLoading
                            ? "bg-[#0B57FF] hover:bg-[#0948D9] text-white"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                        <span className="sr-only">Send Message</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Footnote */}
                <div className="text-center text-[10px] text-[#64748B]">
                  Elimi AI assistant (Monica) • Press send or use the mic to ask.
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
