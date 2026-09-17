"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged, signOut, deleteUser, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  useRegisteredAccounts,
  checkUserRegistration,
  registerUserWithQuotaCheck,
  MAX_ALLOWED_ACCOUNTS,
} from "@/lib/firestore-users";
import DashboardAuthScreen from "@/components/DashboardAuthScreen";
import ProductsManagementView from "@/components/dashboard/ProductsManagementView";
import OrdersManagementView from "@/components/dashboard/OrdersManagementView";
import CarsManagementView from "@/components/dashboard/CarsManagementView";
import HousesManagementView from "@/components/dashboard/HousesManagementView";
import AllocationsManagementView from "@/components/dashboard/AllocationsManagementView";
import CmsManagementView from "@/components/dashboard/CmsManagementView";
import SettingsManagementView from "@/components/dashboard/SettingsManagementView";
import { useRealtimeProducts } from "@/lib/firestore-products";
import { useRealtimeRentalItems } from "@/lib/firestore-rentals";

interface SectionRow {
  id: string;
  header: string;
  sectionType: string;
  status: "Done" | "In Process" | "Draft" | "Blocked";
  target: number;
  limit: number;
  reviewer: string;
  reviewerInitials: string;
  checked: boolean;
}

const INITIAL_ROWS: SectionRow[] = [
  {
    id: "row-1",
    header: "Cover page",
    sectionType: "Cover page",
    status: "Done",
    target: 3,
    limit: 5,
    reviewer: "Eddie Lake",
    reviewerInitials: "EL",
    checked: true,
  },
  {
    id: "row-2",
    header: "Table of contents",
    sectionType: "Table of contents",
    status: "Done",
    target: 2,
    limit: 2,
    reviewer: "Eddie Lake",
    reviewerInitials: "EL",
    checked: true,
  },
  {
    id: "row-3",
    header: "Executive summary",
    sectionType: "Narrative",
    status: "Done",
    target: 4,
    limit: 6,
    reviewer: "Eddie Lake",
    reviewerInitials: "EL",
    checked: true,
  },
  {
    id: "row-4",
    header: "Technical approach",
    sectionType: "Technical content",
    status: "In Process",
    target: 12,
    limit: 15,
    reviewer: "Jamik Tashpulatov",
    reviewerInitials: "JT",
    checked: true,
  },
  {
    id: "row-5",
    header: "Design",
    sectionType: "Visual",
    status: "In Process",
    target: 8,
    limit: 10,
    reviewer: "Jamik Tashpulatov",
    reviewerInitials: "JT",
    checked: false,
  },
  {
    id: "row-6",
    header: "Capabilities",
    sectionType: "Planning",
    status: "Done",
    target: 5,
    limit: 5,
    reviewer: "Assign reviewer",
    reviewerInitials: "",
    checked: false,
  },
  {
    id: "row-7",
    header: "Integration with existing systems",
    sectionType: "Technical content",
    status: "In Process",
    target: 10,
    limit: 12,
    reviewer: "Jamik Tashpulatov",
    reviewerInitials: "JT",
    checked: false,
  },
  {
    id: "row-8",
    header: "Innovation and Advantages",
    sectionType: "Research",
    status: "Done",
    target: 7,
    limit: 8,
    reviewer: "Eddie Lake",
    reviewerInitials: "EL",
    checked: true,
  },
];

const TIME_RANGES = ["Last 3 months", "Last 30 days", "Last 7 days"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

const TABS = [
  { id: "outline", label: "Outline", count: null },
  { id: "past_performance", label: "Past Performance", count: 3 },
  { id: "key_personnel", label: "Key Personnel", count: 2 },
  { id: "focus_documents", label: "Focus Documents", count: null },
];

export default function DashboardPage() {
  // Authentication lock state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { count: registeredCount, remainingSlots } = useRegisteredAccounts();

  useEffect(() => {
    let isMounted = true;

    // Hard fallback: never stay in loading state longer than 1800ms
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setAuthLoading(false);
      }
    }, 1800);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          if (isMounted) {
            setUser(null);
          }
          return;
        }

        // Fast verify against authorized accounts
        const check = await checkUserRegistration(currentUser.uid, currentUser.email);
        if (!isMounted) return;

        if (check.isRegistered) {
          setUser(currentUser);
        } else {
          // If capacity is full, reject and sign out
          if (check.totalRegistered >= MAX_ALLOWED_ACCOUNTS) {
            try {
              await deleteUser(currentUser);
            } catch {
              // ignore
            }
            try {
              await signOut(auth);
            } catch {
              // ignore
            }
            if (isMounted) {
              setUser(null);
            }
          } else {
            const reg = await registerUserWithQuotaCheck(
              currentUser,
              currentUser.providerData[0]?.providerId === "google.com" ? "google" : "password"
            );
            if (reg.success && isMounted) {
              setUser(currentUser);
            } else if (isMounted) {
              try {
                await deleteUser(currentUser);
              } catch {
                // ignore
              }
              try {
                await signOut(auth);
              } catch {
                // ignore
              }
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.warn("Auth listener error:", err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Navigation & layout state
  const [activeNav, setActiveNav] = useState<"dashboard" | "products" | "orders" | "cars" | "houses" | "allocations" | "cms" | "settings">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("outline");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("Last 3 months");
  const [channelFilter, setChannelFilter] = useState("Desktop & Mobile");

  // Fetch real-time metrics
  const { products } = useRealtimeProducts();
  const { items: rentals } = useRealtimeRentalItems();

  // Table state
  const [rows, setRows] = useState<SectionRow[]>(INITIAL_ROWS);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string>("row-1");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState("Narrative");

  // Inspector form state (controlled from selected row)
  const selectedRow = useMemo(
    () => rows.find((r) => r.id === selectedRowId) || rows[0],
    [rows, selectedRowId],
  );

  const [formHeader, setFormHeader] = useState(selectedRow?.header || "");
  const [formType, setFormType] = useState(selectedRow?.sectionType || "");
  const [formStatus, setFormStatus] = useState<SectionRow["status"]>(
    selectedRow?.status || "Done",
  );
  const [formTarget, setFormTarget] = useState(selectedRow?.target || 0);
  const [formLimit, setFormLimit] = useState(selectedRow?.limit || 0);
  const [formReviewer, setFormReviewer] = useState(
    selectedRow?.reviewer || "Eddie Lake",
  );
  const [formAuditNote, setFormAuditNote] = useState("");

  // Sync inspector form when selected row changes
  const handleSelectRow = (row: SectionRow) => {
    setSelectedRowId(row.id);
    setFormHeader(row.header);
    setFormType(row.sectionType);
    setFormStatus(row.status);
    setFormTarget(row.target);
    setFormLimit(row.limit);
    setFormReviewer(row.reviewer);
    setInspectorOpen(true);
  };

  // Save inspector changes back to rows
  const handleSaveChanges = () => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === selectedRowId) {
          const initials =
            formReviewer === "Eddie Lake"
              ? "EL"
              : formReviewer === "Jamik Tashpulatov"
                ? "JT"
                : "";
          return {
            ...r,
            header: formHeader,
            sectionType: formType,
            status: formStatus,
            target: Number(formTarget),
            limit: Number(formLimit),
            reviewer: formReviewer,
            reviewerInitials: initials,
          };
        }
        return r;
      }),
    );
  };

  // Checkbox handlers
  const toggleRowChecked = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r)),
    );
  };

  const allChecked = rows.every((r) => r.checked);
  const checkedCount = rows.filter((r) => r.checked).length;

  const toggleAllChecked = () => {
    const nextVal = !allChecked;
    setRows((prev) => prev.map((r) => ({ ...r, checked: nextVal })));
  };

  // Add section handler
  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    const newId = `row-${Date.now()}`;
    const newRow: SectionRow = {
      id: newId,
      header: newSectionName.trim(),
      sectionType: newSectionType,
      status: "Draft",
      target: 5,
      limit: 8,
      reviewer: "Assign reviewer",
      reviewerInitials: "",
      checked: true,
    };
    setRows((prev) => [...prev, newRow]);
    setSelectedRowId(newId);
    setFormHeader(newRow.header);
    setFormType(newRow.sectionType);
    setFormStatus(newRow.status);
    setFormTarget(newRow.target);
    setFormLimit(newRow.limit);
    setFormReviewer(newRow.reviewer);
    setIsAddModalOpen(false);
    setNewSectionName("");
    setInspectorOpen(true);
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!filterQuery.trim()) return rows;
    const q = filterQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.header.toLowerCase().includes(q) ||
        r.sectionType.toLowerCase().includes(q) ||
        r.reviewer.toLowerCase().includes(q),
    );
  }, [rows, filterQuery]);

  // Interactive chart state
  const [hoverX, setHoverX] = useState<number>(720);
  const [isHoveringChart, setIsHoveringChart] = useState<boolean>(false);

  const chartTooltipData = useMemo(() => {
    // Linear interpolation based on hoverX (0 to 1000)
    const ratio = Math.max(0, Math.min(1, hoverX / 1000));
    const desktopVal = Math.round(180 + ratio * 320 + Math.sin(ratio * 12) * 50);
    const mobileVal = Math.round(120 + ratio * 180 + Math.cos(ratio * 8) * 35);
    // Approximate date
    const dateNames = [
      "Apr 01",
      "Apr 15",
      "May 01",
      "May 15",
      "Jun 01",
      "Jun 15",
      "Jun 24",
      "Jun 30",
    ];
    const idx = Math.min(
      dateNames.length - 1,
      Math.floor(ratio * dateNames.length),
    );
    const dateStr = dateNames[idx] ? `${dateNames[idx]}, 2024` : "Jun 24, 2024";

    return {
      date: dateStr,
      desktop: desktopVal,
      mobile: mobileVal,
      desktopY: 110 - ratio * 70,
      mobileY: 160 - ratio * 70,
    };
  }, [hoverX]);

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    setHoverX(Math.round(x));
    setIsHoveringChart(true);
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center text-white selection:bg-zinc-800 p-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-4 shadow-lg p-2 overflow-hidden">
          <Image
            src="/assets/icons/ELIMI_LOGO.svg"
            alt="ELIMI Logo"
            width={32}
            height={32}
            className="w-full h-full object-contain filter invert brightness-200"
            priority
          />
        </div>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-zinc-400 font-mono tracking-wider uppercase mb-6">Authenticating session...</span>
        <button
          type="button"
          onClick={() => setAuthLoading(false)}
          className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-colors"
        >
          Taking too long? Open Login
        </button>
      </div>
    );
  }

  if (!user) {
    return <DashboardAuthScreen onAuthenticated={(u) => setUser(u)} />;
  }

  const userInitials = user.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user.email
      ? user.email.slice(0, 2).toUpperCase()
      : "AC";
  const userEmail = user.email || "m@example.com";
  const userName = user.displayName || userEmail.split("@")[0] || "ELIMI Admin";

  return (
    <>
      {/* Global Style and Google Fonts injection to match provided HTML specifications */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />
      <style>{`
        /* Editorial layout typography and anti-AI-slop tokens */
        .acme-dashboard {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          background-color: #F8F9FA !important;
        }
        .acme-dashboard * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .acme-dashboard .font-display {
          font-family: 'Syne', 'Plus Jakarta Sans', sans-serif !important;
        }
        .acme-dashboard .font-mono,
        .acme-dashboard .tabular-nums,
        .acme-dashboard kbd {
          font-family: 'JetBrains Mono', monospace !important;
        }
        .acme-dashboard .material-symbols-outlined {
          font-family: 'Material Symbols Outlined' !important;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
          font-size: 18px;
          line-height: 1;
          display: inline-block;
          vertical-align: middle;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
        }
        /* Custom scrollbar matching Light Theme System */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(15, 23, 42, 0.12);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(15, 23, 42, 0.22);
        }
        /* Hide global background footer / chat widget on this isolated dashboard */
        #elimi-ai-chat-trigger,
        #elimi-ai-chat-window,
        footer {
          display: none !important;
        }
      `}</style>

      {/* Main Full-Viewport Dashboard Container */}
      <div className="acme-dashboard fixed inset-0 z-40 bg-[#F8F9FA] text-[#0F172A] antialiased selection:bg-[#E0EBFF] selection:text-[#0B57FF] min-h-screen overflow-hidden flex">
        {/* =========================================================================
            SIDEBAR (Light Theme System with Electric Cobalt Accents)
           ========================================================================= */}
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } lg:flex flex-col justify-between h-screen w-64 p-3 border-r border-[#0F172A]/8 bg-white z-40 shrink-0 select-none transition-all duration-200 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)]`}
        >
          {/* Top Section & Navigation */}
          <div className="flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            {/* Brand Header */}
            <div className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B57FF] flex items-center justify-center text-white shadow-sm shadow-[#0B57FF]/25">
                  <span className="material-symbols-outlined text-white text-[18px]">
                    token
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display text-[15px] font-semibold text-[#0F172A] tracking-[-0.02em] leading-snug">
                    ELIMI
                  </span>
                  <span className="font-mono text-[11px] text-[#64748B] leading-none">
                    Admin Console
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#64748B] text-[16px]">
                unfold_more
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 px-1">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 h-8.5 bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-[12px] font-medium rounded-full transition-all active:scale-95 shadow-sm shadow-[#0B57FF]/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                <span>Quick Create</span>
              </button>
              <button
                type="button"
                className="w-8.5 h-8.5 flex items-center justify-center rounded-full border border-[#0F172A]/8 bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors active:scale-95 cursor-pointer"
                title="Inbox"
              >
                <span className="material-symbols-outlined text-[16px]">
                  inbox
                </span>
              </button>
            </div>

            {/* Main Navigation Menu */}
            <div className="space-y-1 pt-1">
              <div className="px-2.5 pb-1.5 text-[10px] text-[#64748B] tracking-wider uppercase font-semibold">
                Platform
              </div>
              {/* Dashboard */}
              <button
                type="button"
                onClick={() => setActiveNav("dashboard")}
                className={`w-full font-medium rounded-xl px-3 py-2 flex items-center justify-between group transition-all cursor-pointer ${
                  activeNav === "dashboard"
                    ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                    : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#0F172A]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      activeNav === "dashboard" ? "text-[#0B57FF]" : "text-[#64748B]"
                    }`}
                  >
                    dashboard
                  </span>
                  <span className="text-[13px]">Dashboard</span>
                </div>
                {activeNav === "dashboard" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                )}
              </button>
              {/* Products (Replaced Lifecycle menu item) */}
              <button
                type="button"
                onClick={() => setActiveNav("products")}
                className={`w-full font-medium rounded-xl px-3 py-2 flex items-center justify-between group transition-all cursor-pointer ${
                  activeNav === "products"
                    ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                    : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#0F172A]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      activeNav === "products" ? "text-[#0B57FF]" : "text-[#64748B]"
                    }`}
                  >
                    inventory_2
                  </span>
                  <span className="text-[13px]">Products</span>
                </div>
                {activeNav === "products" ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] font-semibold">
                    Shop
                  </span>
                )}
              </button>
              {/* Orders (Replaced Analytics menu item) */}
              <button
                type="button"
                onClick={() => setActiveNav("orders")}
                className={`w-full font-medium rounded-xl px-3 py-2 flex items-center justify-between group transition-all cursor-pointer ${
                  activeNav === "orders"
                    ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                    : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#0F172A]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      activeNav === "orders" ? "text-[#0B57FF]" : "text-[#64748B]"
                    }`}
                  >
                    shopping_bag
                  </span>
                  <span className="text-[13px]">Orders</span>
                </div>
                {activeNav === "orders" ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold">
                    Ledger
                  </span>
                )}
              </button>
              {/* Cars (Replaced Projects tab) */}
              <button
                type="button"
                onClick={() => setActiveNav("cars")}
                className={`w-full font-medium rounded-xl px-3 py-2 flex items-center justify-between group transition-all cursor-pointer ${
                  activeNav === "cars"
                    ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                    : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#0F172A]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      activeNav === "cars" ? "text-[#0B57FF]" : "text-[#64748B]"
                    }`}
                  >
                    directions_car
                  </span>
                  <span className="text-[13px]">Cars</span>
                </div>
                {activeNav === "cars" ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
                    Fleet
                  </span>
                )}
              </button>
              {/* Houses (Replaced Team tab) */}
              <button
                type="button"
                onClick={() => setActiveNav("houses")}
                className={`w-full font-medium rounded-xl px-3 py-2 flex items-center justify-between group transition-all cursor-pointer ${
                  activeNav === "houses"
                    ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                    : "text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#0F172A]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      activeNav === "houses" ? "text-[#0B57FF]" : "text-[#64748B]"
                    }`}
                  >
                    home
                  </span>
                  <span className="text-[13px]">Houses</span>
                </div>
                {activeNav === "houses" ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 font-semibold">
                    Estates
                  </span>
                )}
              </button>
            </div>

            {/* Collapsible Group: Clouds */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between px-2.5 py-0.5 text-[#64748B]">
                <span className="text-[10px] uppercase tracking-wider font-semibold">
                  Clouds
                </span>
                <span className="material-symbols-outlined text-[14px]">
                  expand_more
                </span>
              </div>
              <div className="pl-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveNav("allocations")}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer text-[13px] transition-all ${
                    activeNav === "allocations"
                      ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        activeNav === "allocations" ? "text-[#0B57FF]" : "text-[#64748B]"
                      }`}
                    >
                      inventory_2
                    </span>
                    <span>Allocation</span>
                  </div>
                  {activeNav === "allocations" ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                  ) : (
                    <span className="font-mono text-[10px] bg-[#E0EBFF] text-[#0B57FF] px-2 py-0.5 rounded-full font-semibold">
                      Rentals
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav("settings")}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer text-[13px] transition-all ${
                    activeNav === "settings"
                      ? "bg-[#E0EBFF] text-[#0B57FF] font-semibold"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        activeNav === "settings" ? "text-[#0B57FF]" : "text-[#64748B]"
                      }`}
                    >
                      settings
                    </span>
                    <span>Settings</span>
                  </div>
                  {activeNav === "settings" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF]"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Secondary Navigation & Profile */}
          <div className="space-y-2 border-t border-[#0F172A]/8 pt-3">
            <div className="space-y-0.5">
              <a
                href="#settings"
                className="text-[#64748B] font-normal rounded-xl px-3 py-1.5 hover:bg-[#F8F9FA] hover:text-[#0F172A] transition-colors flex items-center space-x-2.5 text-[13px]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#64748B]">
                  settings
                </span>
                <span>Settings</span>
              </a>
              <a
                href="#help"
                className="text-[#64748B] font-normal rounded-xl px-3 py-1.5 hover:bg-[#F8F9FA] hover:text-[#0F172A] transition-colors flex items-center space-x-2.5 text-[13px]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#64748B]">
                  help
                </span>
                <span>Get Help</span>
              </a>
              <a
                href="#search"
                className="text-[#64748B] font-normal rounded-xl px-3 py-1.5 hover:bg-[#F8F9FA] hover:text-[#0F172A] transition-colors flex items-center justify-between text-[13px]"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#64748B]">
                    search
                  </span>
                  <span>Search</span>
                </div>
                <kbd className="font-mono text-[11px] px-2 py-0.5 rounded-full border border-[#0F172A]/8 bg-[#F8F9FA] text-[#64748B]">
                  ⌘K
                </kbd>
              </a>
            </div>

            {/* User Profile Widget */}
            <div className="border-t border-[#0F172A]/8 pt-2">
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F8F9FA] transition-colors group">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#0B57FF] flex items-center justify-center font-semibold text-white text-xs shrink-0 shadow-sm shadow-[#0B57FF]/20">
                    {userInitials}
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="text-[13px] font-medium text-[#0F172A] leading-tight truncate">
                      {userName}
                    </span>
                    <span className="font-mono text-[11px] text-[#64748B] leading-tight truncate">
                      {userEmail}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out / Lock"
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 ml-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">
                    logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN INSET WRAPPER (Light Mode Surface)
           ========================================================================= */}
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8F9FA] p-0 md:p-3 overflow-hidden">
          <div className="flex-1 flex flex-col bg-white rounded-none md:rounded-2xl border-0 md:border md:border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] overflow-hidden">
            {/* Site Header */}
            <header className="h-14 border-b border-[#0F172A]/8 px-5 flex items-center justify-between bg-white sticky top-0 z-30 shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-8.5 h-8.5 flex items-center justify-center rounded-full border border-[#0F172A]/8 bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                  title="Toggle sidebar"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    dock_to_left
                  </span>
                </button>
                <div className="h-4 w-px bg-[#0F172A]/10" />
                <div className="flex items-center space-x-2.5">
                  <span className="font-display text-[16px] text-[#0F172A] font-semibold tracking-[-0.02em]">
                    {activeNav === "products"
                      ? "Shop Products"
                      : activeNav === "orders"
                      ? "Boutique Orders"
                      : activeNav === "cars"
                      ? "Fleet & Vehicles"
                      : activeNav === "houses"
                      ? "Real Estate & Houses"
                      : activeNav === "allocations"
                      ? "Other Allocations (Rentals)"
                      : "Documents"}
                  </span>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 font-semibold flex items-center gap-1.5">
                    {activeNav === "products" || activeNav === "cars" || activeNav === "houses" || activeNav === "allocations" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Firestore Real-time
                      </>
                    ) : activeNav === "orders" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Live Orders
                      </>
                    ) : (
                      "v4.1"
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Authenticated Status Badge */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0EBFF] border border-[#0B57FF]/20 text-[#0B57FF] text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-pulse" />
                  <span className="font-mono text-[11px] max-w-[140px] truncate">{userEmail}</span>
                </div>

                {/* Lock / Sign out button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1.5 h-8.5 px-3 rounded-full border border-[#0F172A]/8 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#64748B] transition-colors text-[12px] cursor-pointer"
                  title="Lock Dashboard & Sign Out"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    lock
                  </span>
                  <span className="hidden sm:inline font-medium">Lock</span>
                </button>
              </div>
            </header>

            {/* Dashboard Scrollable Workspace */}
            <main className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 custom-scrollbar bg-[#F8F9FA]">
              {activeNav === "products" ? (
                <ProductsManagementView />
              ) : activeNav === "orders" ? (
                <OrdersManagementView />
              ) : activeNav === "cars" ? (
                <CarsManagementView />
              ) : activeNav === "houses" ? (
                <HousesManagementView />
              ) : activeNav === "allocations" ? (
                <AllocationsManagementView />
              ) : activeNav === "cms" ? (
                <CmsManagementView />
              ) : activeNav === "settings" ? (
                <SettingsManagementView />
              ) : (
                <>
                  {/* SECTION 1: 4 Metric Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {/* Metric 1: Shop Products */}
                <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#64748B]">
                      Shop Products
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#E0EBFF] flex items-center justify-center text-[#0B57FF]">
                      <span className="material-symbols-outlined text-[18px]">
                        shopping_bag
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-[32px] font-semibold text-[#0F172A] tracking-[-0.03em] leading-none">
                      {products.length}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20">
                      Live
                    </span>
                  </div>
                  <div className="mt-4 flex items-center text-[#64748B] text-[12px] border-l-2 border-[#0B57FF] pl-2.5">
                    <span>Products available in store</span>
                  </div>
                </div>

                {/* Metric 2: Total Rentals */}
                <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#64748B]">
                      Total Rentals
                    </span>
                    <div className="w-8 h-8 rounded-full bg-purple-50 border border-[#0F172A]/8 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined text-[18px]">
                        inventory_2
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-[32px] font-semibold text-[#0F172A] tracking-[-0.03em] leading-none">
                      {rentals.length}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      Catalog
                    </span>
                  </div>
                  <div className="mt-4 flex items-center text-[#64748B] text-[12px] border-l-2 border-purple-400 pl-2.5">
                    <span>Items registered in rentals</span>
                  </div>
                </div>

                {/* Metric 3: Registered Accounts */}
                <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#64748B]">
                      Active Users
                    </span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined text-[18px]">
                        account_circle
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-[32px] font-semibold text-[#0F172A] tracking-[-0.03em] leading-none">
                      {registeredCount}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <div className="mt-4 flex items-center text-[#64748B] text-[12px] border-l-2 border-emerald-500 pl-2.5">
                    <span>Registered admin accounts</span>
                  </div>
                </div>

                {/* Metric 4: Available Rentals */}
                <div className="relative overflow-hidden rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#64748B]">
                      Available Rentals
                    </span>
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                      <span className="material-symbols-outlined text-[18px]">
                        event_available
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-[32px] font-semibold text-[#0F172A] tracking-[-0.03em] leading-none">
                      {rentals.filter(r => r.available).length}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                      Ready
                    </span>
                  </div>
                  <div className="mt-4 flex items-center text-[#64748B] text-[12px] border-l-2 border-orange-500 pl-2.5">
                    <span>Rentals ready for booking</span>
                  </div>
                </div>
              </section>

              {/* SECTION 2: ChartAreaInteractive */}
              <section className="rounded-2xl border border-[#0F172A]/8 bg-white p-6 md:p-8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#0F172A]/8">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-display text-[17px] font-semibold text-[#0F172A] tracking-[-0.02em]">
                        Total Visitors
                      </h3>
                      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 font-semibold">
                        Live telemetry
                      </span>
                    </div>
                    <p className="text-[13px] text-[#64748B] mt-1">
                      Total for the {selectedTimeRange.toLowerCase()}
                    </p>
                  </div>

                  {/* Controls: Time Range Toggle Group & Select */}
                  <div className="flex items-center space-x-2">
                    <div className="hidden md:inline-flex p-1 rounded-full border border-[#0F172A]/8 bg-[#F8F9FA]">
                      {TIME_RANGES.map((tr) => (
                        <button
                          key={tr}
                          type="button"
                          onClick={() => setSelectedTimeRange(tr)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                            selectedTimeRange === tr
                              ? "bg-[#0B57FF] text-white shadow-xs font-semibold"
                              : "text-[#64748B] hover:text-[#0F172A]"
                          }`}
                        >
                          {tr}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <select
                        value={channelFilter}
                        onChange={(e) => setChannelFilter(e.target.value)}
                        className="h-8.5 pl-3.5 pr-8 py-1 rounded-full border border-[#0F172A]/8 bg-white text-[12px] text-[#0F172A] focus:outline-none focus:border-[#0B57FF] cursor-pointer appearance-none shadow-xs font-medium"
                      >
                        <option>Desktop &amp; Mobile</option>
                        <option>Desktop Only</option>
                        <option>Mobile Only</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-[16px] text-[#64748B]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dual Layer Interactive Area Chart */}
                <div className="relative pt-6 pb-2">
                  {/* Metric Legend */}
                  <div className="flex items-center space-x-6 pb-3 px-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-1.5 rounded-full bg-[#0B57FF]" />
                      <span className="text-[12px] text-[#0F172A] font-semibold">
                        Desktop
                      </span>
                      <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                        24,492 avg
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-1.5 rounded-full bg-[#94A3B8]" />
                      <span className="text-[12px] text-[#64748B] font-medium">
                        Mobile
                      </span>
                      <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                        13,210 avg
                      </span>
                    </div>
                  </div>

                  {/* SVG Vector Area Representation */}
                  <div className="relative h-64 w-full group/chart select-none">
                    <svg
                      className="w-full h-full overflow-visible cursor-crosshair"
                      preserveAspectRatio="none"
                      viewBox="0 0 1000 240"
                      onMouseMove={handleChartMouseMove}
                      onMouseEnter={() => setIsHoveringChart(true)}
                    >
                      <defs>
                        <linearGradient
                          id="desktopGrad"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0B57FF"
                            stopOpacity="0.18"
                          />
                          <stop
                            offset="100%"
                            stopColor="#0B57FF"
                            stopOpacity="0.01"
                          />
                        </linearGradient>
                        <linearGradient
                          id="mobileGrad"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#94A3B8"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="#94A3B8"
                            stopOpacity="0.01"
                          />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Subtle Dashed Guidelines */}
                      <line
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        x1="0"
                        x2="1000"
                        y1="40"
                        y2="40"
                      />
                      <line
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        x1="0"
                        x2="1000"
                        y1="100"
                        y2="100"
                      />
                      <line
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                        x1="0"
                        x2="1000"
                        y1="160"
                        y2="160"
                      />
                      <line
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        x1="0"
                        x2="1000"
                        y1="220"
                        y2="220"
                      />

                      {/* Mobile Layer (Background Vector) */}
                      {channelFilter !== "Desktop Only" && (
                        <>
                          <polygon
                            fill="url(#mobileGrad)"
                            points="0,220 0,160 80,170 160,140 240,155 320,130 400,145 480,120 560,135 640,105 720,125 800,95 880,110 960,85 1000,90 1000,220"
                          />
                          <polyline
                            fill="none"
                            points="0,160 80,170 160,140 240,155 320,130 400,145 480,120 560,135 640,105 720,125 800,95 880,110 960,85 1000,90"
                            stroke="#94A3B8"
                            strokeWidth="1.75"
                          />
                        </>
                      )}

                      {/* Desktop Layer (Foreground Vector) */}
                      {channelFilter !== "Mobile Only" && (
                        <>
                          <polygon
                            fill="url(#desktopGrad)"
                            points="0,220 0,110 80,125 160,95 240,105 320,80 400,88 480,60 560,75 640,50 720,68 800,45 880,55 960,35 1000,40 1000,220"
                          />
                          <polyline
                            fill="none"
                            points="0,110 80,125 160,95 240,105 320,80 400,88 480,60 560,75 640,50 720,68 800,45 880,55 960,35 1000,40"
                            stroke="#0B57FF"
                            strokeWidth="2.25"
                          />
                        </>
                      )}

                      {/* Interactive Vertical Guideline & Indicator circles */}
                      <line
                        opacity="0.6"
                        stroke="#0B57FF"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                        x1={hoverX}
                        x2={hoverX}
                        y1="0"
                        y2="220"
                      />
                      {channelFilter !== "Mobile Only" && (
                        <circle
                          cx={hoverX}
                          cy={68}
                          fill="#ffffff"
                          r="4.5"
                          stroke="#0B57FF"
                          strokeWidth="2.5"
                        />
                      )}
                      {channelFilter !== "Desktop Only" && (
                        <circle
                          cx={hoverX}
                          cy={125}
                          fill="#ffffff"
                          r="4.5"
                          stroke="#94A3B8"
                          strokeWidth="2.5"
                        />
                      )}
                    </svg>

                    {/* Interactive Floating Tooltip (Jun 24, 2024 by default) */}
                    <div
                      style={{
                        left: `${Math.max(15, Math.min(85, (hoverX / 1000) * 100))}%`,
                      }}
                      className="absolute top-[12%] pointer-events-none -translate-x-1/2 rounded-xl border border-[#0F172A]/8 bg-white/95 p-3 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] backdrop-blur-sm z-20 min-w-[150px] transition-all duration-75"
                    >
                      <div className="font-mono text-[11px] text-[#64748B] font-medium border-b border-[#0F172A]/8 pb-1 mb-1.5">
                        {chartTooltipData.date}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#0B57FF]" />{" "}
                            Desktop:
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-[#0B57FF] tabular-nums">
                            {chartTooltipData.desktop}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-[#64748B]">
                            <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />{" "}
                            Mobile:
                          </span>
                          <span className="font-mono text-[11px] font-medium text-[#64748B] tabular-nums">
                            {chartTooltipData.mobile}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between pt-2 px-1 font-mono text-[11px] text-[#64748B] uppercase tracking-wider">
                    <span>Apr 01</span>
                    <span>Apr 15</span>
                    <span>May 01</span>
                    <span>May 15</span>
                    <span>Jun 01</span>
                    <span>Jun 15</span>
                    <span>Jun 30</span>
                  </div>
                </div>
              </section>

              {/* SECTION 3: Comprehensive Data Table (DataTable) */}
              <section className="rounded-2xl border border-[#0F172A]/8 bg-white overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)]">
                {/* Tabs & Actions Toolbar */}
                <div className="p-5 border-b border-[#0F172A]/8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                  {/* Table Tabs Header */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                          activeTab === tab.id
                            ? "bg-[#0B57FF] text-white shadow-xs font-semibold"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== null && (
                          <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                            activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#E0EBFF] text-[#0B57FF]"
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    {/* Search in table */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2 text-[15px] text-[#64748B]">
                        search
                      </span>
                      <input
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="h-8.5 pl-8.5 pr-3.5 rounded-full border border-[#0F172A]/8 bg-white text-[12px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#0B57FF] w-40 sm:w-56 shadow-xs"
                        placeholder="Filter sections..."
                        type="text"
                      />
                    </div>

                    {/* Customize Columns */}
                    <div className="relative">
                      <button
                        type="button"
                        className="h-8.5 px-3.5 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#0F172A] text-[12px] flex items-center space-x-1.5 transition-colors cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#64748B]">
                          tune
                        </span>
                        <span className="hidden sm:inline">
                          Customize Columns
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-[#64748B]">
                          expand_more
                        </span>
                      </button>
                    </div>

                    {/* Add Section Button */}
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="h-8.5 px-4 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-[12px] font-semibold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm shadow-[#0B57FF]/20 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        add
                      </span>
                      <span>Add Section</span>
                    </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#0F172A]/8 bg-[#F8F9FA] text-[#64748B] text-[11px] uppercase tracking-wider font-semibold">
                        <th className="w-10 p-3.5 text-center">
                          <span className="material-symbols-outlined text-[16px] text-[#64748B]">
                            drag_indicator
                          </span>
                        </th>
                        <th className="w-10 p-3.5">
                          <input
                            checked={allChecked}
                            onChange={toggleAllChecked}
                            className="rounded border-[#0F172A]/20 bg-white text-[#0B57FF] accent-[#0B57FF] focus:ring-[#0B57FF] cursor-pointer w-4 h-4"
                            type="checkbox"
                          />
                        </th>
                        <th className="p-3.5 font-semibold text-[#0F172A]">
                          Header
                        </th>
                        <th className="p-3.5 font-semibold text-[#0F172A]">
                          Section Type
                        </th>
                        <th className="p-3.5 font-semibold text-[#0F172A]">
                          Status
                        </th>
                        <th className="p-3.5 font-semibold text-[#0F172A] text-right">
                          Target
                        </th>
                        <th className="p-3.5 font-semibold text-[#0F172A] text-right">
                          Limit
                        </th>
                        <th className="p-3.5 font-semibold text-[#0F172A]">
                          Reviewer
                        </th>
                        <th className="w-10 p-3.5 text-center" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0F172A]/8 text-[13px] bg-white">
                      {filteredRows.map((row) => {
                        const isSelected = row.id === selectedRowId;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => handleSelectRow(row)}
                            className={`hover:bg-[#F8F9FA] transition-colors group cursor-pointer ${
                              isSelected ? "bg-[#E0EBFF]/30 border-l-3 border-l-[#0B57FF]" : ""
                            }`}
                          >
                            <td className="p-3.5 text-center text-[#64748B]/60 group-hover:text-[#64748B]">
                              <span className="material-symbols-outlined text-[16px] cursor-grab">
                                drag_indicator
                              </span>
                            </td>
                            <td className="p-3.5">
                              <input
                                checked={row.checked}
                                onChange={(e) => toggleRowChecked(row.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-[#0F172A]/20 bg-white text-[#0B57FF] accent-[#0B57FF] focus:ring-[#0B57FF] cursor-pointer w-4 h-4"
                                type="checkbox"
                              />
                            </td>
                            <td className="p-3.5 font-medium text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
                              {row.header}
                            </td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] border border-[#0F172A]/8 text-[#0F172A] bg-[#F8F9FA] font-medium">
                                {row.sectionType}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {row.status === "Done" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold">
                                  <span className="material-symbols-outlined text-[12px]">
                                    check_circle
                                  </span>{" "}
                                  Done
                                </span>
                              ) : row.status === "In Process" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-[#0B57FF] bg-[#E0EBFF] border border-[#0B57FF]/20 font-semibold">
                                  <span className="material-symbols-outlined text-[12px] animate-spin">
                                    progress_activity
                                  </span>{" "}
                                  In Process
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] text-[#64748B] bg-[#F8F9FA] border border-[#0F172A]/8 font-medium">
                                  {row.status}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right font-mono text-[12px] tabular-nums text-[#64748B]">
                              {row.target}
                            </td>
                            <td className="p-3.5 text-right font-mono text-[12px] tabular-nums text-[#64748B]">
                              {row.limit}
                            </td>
                            <td className="p-3.5">
                              {row.reviewerInitials ? (
                                <span className="inline-flex items-center gap-2 text-[12px] text-[#0F172A] font-medium">
                                  <span className="w-5.5 h-5.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 flex items-center justify-center text-[10px] font-semibold">
                                    {row.reviewerInitials}
                                  </span>
                                  {row.reviewer}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#0F172A]">
                                  <span className="material-symbols-outlined text-[15px]">
                                    person_add
                                  </span>
                                  {row.reviewer}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-center text-[#64748B] hover:text-[#0F172A]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectRow(row);
                                }}
                                className="p-1 rounded-full hover:bg-[#F8F9FA] cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  more_vert
                                </span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="px-5 py-3.5 border-t border-[#0F172A]/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#64748B] bg-white">
                  <div className="font-mono text-[11px]">
                    <span className="text-[#0B57FF] font-semibold">
                      {checkedCount}
                    </span>{" "}
                    of{" "}
                    <span className="text-[#0F172A] font-semibold">
                      {rows.length}
                    </span>{" "}
                    row(s) selected.
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span>Rows per page</span>
                      <select className="h-7.5 px-2.5 rounded-full border border-[#0F172A]/8 bg-white text-[#0F172A] text-xs focus:outline-none focus:border-[#0B57FF] font-medium">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="text-xs font-medium text-[#0F172A]">
                      Page 1 of 7
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        disabled
                        className="w-7.5 h-7.5 flex items-center justify-center rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] disabled:opacity-40"
                        title="First page"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          first_page
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled
                        className="w-7.5 h-7.5 flex items-center justify-center rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] disabled:opacity-40"
                        title="Previous page"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          chevron_left
                        </span>
                      </button>
                      <button
                        type="button"
                        className="w-7.5 h-7.5 flex items-center justify-center rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#0F172A] cursor-pointer"
                        title="Next page"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          chevron_right
                        </span>
                      </button>
                      <button
                        type="button"
                        className="w-7.5 h-7.5 flex items-center justify-center rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#0F172A] cursor-pointer"
                        title="Last page"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          last_page
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
                </>
              )}
            </main>
          </div>
        </div>

        {/* Quick Add Section Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/30 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-[#0F172A]/8 shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-5 py-4 border-b border-[#0F172A]/8 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2.5">
                  <span className="material-symbols-outlined text-[#0B57FF] text-[20px]">
                    add_circle
                  </span>
                  <span className="font-display text-[15px] font-semibold text-[#0F172A]">
                    Add New Section
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
                    Section Header Name
                  </label>
                  <input
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="e.g. Risk Assessment"
                    className="w-full h-9.5 px-3.5 rounded-xl border border-[#0F172A]/8 bg-white text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0B57FF]"
                    type="text"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">
                    Section Type
                  </label>
                  <select
                    value={newSectionType}
                    onChange={(e) => setNewSectionType(e.target.value)}
                    className="w-full h-9.5 px-3.5 rounded-xl border border-[#0F172A]/8 bg-white text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0B57FF] cursor-pointer font-medium"
                  >
                    <option>Cover page</option>
                    <option>Table of contents</option>
                    <option>Narrative</option>
                    <option>Technical content</option>
                    <option>Visual</option>
                    <option>Planning</option>
                    <option>Research</option>
                    <option>Legal</option>
                    <option>Financial</option>
                  </select>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-[#0F172A]/8 bg-[#F8F9FA] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#0F172A]/8 bg-white text-[#0F172A] hover:bg-[#F8F9FA] text-[13px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSection}
                  disabled={!newSectionName.trim()}
                  className="px-5 py-2 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 disabled:opacity-40 text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm shadow-[#0B57FF]/20"
                >
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
