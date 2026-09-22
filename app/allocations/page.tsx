'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from "@/components/SettingsProvider";
import ElimiHeader from '@/components/ElimiHeader';
import { useCmsPage } from '@/lib/firestore-cms';
import AllocationsHeroCarousel, { AllocationSlide } from '@/components/allocations/AllocationsHeroCarousel';
import {
  useRealtimeRentalCategories,
  useRealtimeRentalItems,
  RentalCategory,
  RentalItem,
} from '@/lib/firestore-rentals';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Heart,
  Sparkles,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function AllocationsPage() {
  const { formatUSD } = useCurrency();
  const { categories, loading: loadingCategories } = useRealtimeRentalCategories();
  const { items, loading: loadingItems } = useRealtimeRentalItems();
  const { data: cmsAllocationsPage } = useCmsPage('allocations');

  const heroContent = cmsAllocationsPage?.sections?.find(s => s.id === 'hero' || s.type === 'hero')?.content;
  const heroBadge = heroContent?.badge;
  const heroTitle = heroContent?.headline || heroContent?.title || 'Tenues de bureau';
  const heroDescription = heroContent?.subheadline || heroContent?.description || 'Costumes modernes, tailleurs fluides et chemises structurées pour une élégance professionnelle affirmée.';
  const heroSlides = heroContent?.slides as AllocationSlide[] | undefined;
  const heroAutoPlayInterval = heroContent?.autoPlayInterval || 5000;

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'popular'>('recommended');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Infinite Scroll State
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Carousel Ref for horizontal category navigation
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);

  // Search Container Ref to handle clicks outside autocomplete dropdown
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when filter changes (storing info from previous render pattern)
  const currentFilterKey = `${searchQuery}-${selectedCategory}-${selectedSize}-${onlyAvailable}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(currentFilterKey);
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // Autocomplete Suggestions
  const autocompleteCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4);
  }, [categories, searchQuery]);

  const autocompleteItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [items, searchQuery]);

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (item) => item.categoryId === selectedCategory || item.categoryName === selectedCategory
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    // Size filter
    if (selectedSize) {
      result = result.filter((item) => item.sizes && item.sizes.includes(selectedSize));
    }

    // Only available filter
    if (onlyAvailable) {
      result = result.filter((item) => item.available);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return result;
  }, [items, selectedCategory, searchQuery, selectedSize, onlyAvailable, sortBy]);

  // Items currently visible via infinite scroll
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setIsLoadingMore(false);
          }, 350);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredItems.length]);

  // Category Carousel scroll buttons
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth } = categoryScrollRef.current;
      const scrollDistance = clientWidth * 0.7;
      categoryScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollDistance : scrollLeft + scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between antialiased selection:bg-[#0D52FF] selection:text-white">
      {/* Platform Header & Full Width Hero Section */}
      <div className="relative w-full">
        {/* Header lies on top of the hero: standard on mobile, transparent on desktop at top, blurry on scroll */}
        <ElimiHeader
          transparentOnDesktopTop={true}
          className="sticky top-0 z-40"
        />

        {/* Full-width Hero Component: 100% full bleed, 0 margin */}
        <div className="w-full -mt-[60px] sm:-mt-[64px] lg:-mt-[68px]">
          <AllocationsHeroCarousel
            slides={heroSlides}
            autoPlayInterval={heroAutoPlayInterval}
            fallbackTitle={heroTitle}
            fallbackSubtitle={heroDescription}
            fallbackBadge={heroBadge}
          />
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation & Catalog Counter */}
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-slate-700 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-[#0D52FF] font-bold">Autres Locations</span>
          </div>

          <div className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:block">
            <span className="text-slate-900 font-bold text-sm">{filteredItems.length}</span>{' '}
            {filteredItems.length > 1 ? 'articles disponibles' : 'article disponible'}
          </div>
        </div>

        {/* =========================================================================
            1. FIRST ROW: CATEGORY CHOOSER CAROUSEL (Matching Screenshots & Video)
           ========================================================================= */}
        <div id="catalog-section" className="space-y-3 relative group pt-2 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Explorer par catégorie
            </h2>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-bold text-[#0D52FF] hover:underline flex items-center gap-1"
              >
                <span>Tout afficher</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            {/* Left Carousel Arrow */}
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#0D52FF] hover:scale-110 transition-all opacity-90 hover:opacity-100 hidden sm:flex"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={categoryScrollRef}
              className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-none snap-x"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id || selectedCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                    className="flex flex-col items-center shrink-0 w-28 sm:w-36 md:w-40 text-center group/card snap-start focus:outline-none"
                  >
                    {/* Category Image Card */}
                    <div
                      className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-2.5 transition-all duration-300 ${
                        isSelected
                          ? 'ring-4 ring-[#0D52FF] ring-offset-2 scale-102 shadow-lg shadow-blue-500/20'
                          : 'border border-slate-200/80 group-hover/card:scale-102 group-hover/card:shadow-md'
                      }`}
                    >
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        sizes="(max-width: 640px) 120px, 160px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    {/* Category Label */}
                    <span
                      className={`text-xs sm:text-sm font-bold leading-tight transition-colors line-clamp-2 ${
                        isSelected
                          ? 'text-[#0D52FF]'
                          : 'text-slate-800 group-hover/card:text-[#0D52FF]'
                      }`}
                    >
                      {cat.name}
                    </span>

                    {/* Active Underline Indicator (Matching Screenshot) */}
                    <div
                      className={`h-0.5 mt-1 transition-all rounded-full ${
                        isSelected ? 'w-8 bg-[#0D52FF]' : 'w-0 bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Carousel Arrow */}
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#0D52FF] hover:scale-110 transition-all opacity-90 hover:opacity-100 hidden sm:flex"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. SEARCH BAR WITH INSTANT AUTOCOMPLETE & FILTERS
           ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search input with live predictive dropdown */}
            <div ref={searchContainerRef} className="relative flex-1">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Rechercher une catégorie ou un article (ex: Chemise Dianne, Denim, Soirée)..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#0D52FF] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 rounded-full hover:bg-slate-200/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Category Matches */}
                  {autocompleteCategories.length > 0 && (
                    <div className="p-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                        Catégories suggérées
                      </div>
                      <div className="space-y-1">
                        {autocompleteCategories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(c.id);
                              setSearchQuery('');
                              setIsSearchFocused(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-blue-50/70 transition-colors group"
                          >
                            <div className="relative w-8 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                              <Image
                                src={c.imageUrl}
                                alt={c.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-slate-800 group-hover:text-[#0D52FF]">
                                {c.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                Voir tous les articles de cette catégorie
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D52FF]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Item Matches with Price Aside */}
                  {autocompleteItems.length > 0 && (
                    <div className="p-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                        Articles & Équipements
                      </div>
                      <div className="space-y-1">
                        {autocompleteItems.map((item) => (
                          <Link
                            key={item.id}
                            href={`/allocations/${item.id}`}
                            onClick={() => {
                              setIsSearchFocused(false);
                            }}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left hover:bg-blue-50/70 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate group-hover:text-[#0D52FF]">
                                  {item.name}
                                </div>
                                <div className="text-xs text-slate-400 truncate">
                                  {item.brand} • {item.categoryName}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-[#0D52FF] text-sm">
                                {formatUSD(item.pricePerDay)}/j
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {autocompleteCategories.length === 0 && autocompleteItems.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">
                      Aucun résultat pour « {searchQuery} »
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-700 border border-slate-200 focus:border-[#0D52FF] outline-none cursor-pointer"
              >
                <option value="recommended">Trier par : Recommandés</option>
                <option value="popular">Trier par : Popularité</option>
                <option value="price-asc">Prix : Croissant</option>
                <option value="price-desc">Prix : Décroissant</option>
              </select>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Active Category Chip */}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0D52FF] text-white shadow-sm">
                <span>
                  Catégorie :{' '}
                  {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-blue-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {/* Availability Toggle */}
            <button
              type="button"
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                onlyAvailable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Disponible uniquement
            </button>

            {/* Size Filters */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-xs font-semibold text-slate-400">Tailles :</span>
              {['S/M', 'M/L', 'L/XL', 'Unique'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedSize === sz
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Reset All Filters if any are active */}
            {(selectedCategory || selectedSize || onlyAvailable || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSize(null);
                  setOnlyAvailable(false);
                  setSearchQuery('');
                }}
                className="ml-auto text-xs font-semibold text-slate-500 hover:text-[#0D52FF] underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. ITEMS GRID WITH PRICE ASIDE NAME & INFINITE SCROLLING
           ========================================================================= */}
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Aucun article ne correspond à votre recherche</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Essayez de modifier votre catégorie ou effacez vos filtres pour découvrir toutes nos pièces.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSize(null);
                setOnlyAvailable(false);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#0D52FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Voir tout le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedItems.map((item) => {
              const isFav = favorites.includes(item.id);
              const secondPhoto = item.gallery && item.gallery.length > 1 ? item.gallery[1] : null;

              return (
                <Link
                  key={item.id}
                  href={`/allocations/${item.id}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  {/* Photo Container with Dual-Photo Hover Swap (Video 00:48 - 01:06) */}
                  <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                    {/* Primary Photo */}
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className={`object-cover transition-all duration-500 ${
                        secondPhoto ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                      }`}
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Second Photo Revealed on Hover if available */}
                    {secondPhoto && (
                      <Image
                        src={secondPhoto}
                        alt={`${item.name} alternate angle`}
                        fill
                        className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    )}

                    {/* Top Right Heart Favorite Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
                        isFav
                          ? 'bg-white text-rose-600 shadow-md scale-110'
                          : 'bg-white/80 hover:bg-white text-slate-500 hover:text-rose-500 shadow-sm'
                      }`}
                      aria-label="Ajouter aux favoris"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>

                    {/* Bottom Left Ribbon Badge */}
                    {item.badge && (
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-white/95 backdrop-blur-md text-[#0D52FF] border border-blue-100 shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Information Row: Price Beside Name */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name and Price on the same line */}
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-[#0D52FF] transition-colors">
                          {item.name}
                        </h3>
                        <span className="font-black text-[#0D52FF] text-sm sm:text-base shrink-0 whitespace-nowrap">
                          {formatUSD(item.pricePerDay)}/j
                        </span>
                      </div>

                      {/* Brand / Designer Subtitle */}
                      <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                        {item.brand} • {item.categoryName}
                      </div>
                    </div>

                    {/* Available sizes tags & rating */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs">
                      <div className="flex gap-1 overflow-hidden">
                        {item.sizes?.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <span className="text-amber-500 font-bold flex items-center gap-1 text-[11px]">
                        ★ {item.rating || 4.9}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            4. INFINITE SCROLL TRIGGER & SKELETON LOADER
           ========================================================================= */}
        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
          {hasMore ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0D52FF]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chargement d&apos;articles supplémentaires...
              </span>
            </div>
          ) : (
            filteredItems.length > 0 && (
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#0D52FF] mb-1">
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tous les articles ont été affichés ({filteredItems.length} au total)
                </div>
              </div>
            )
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
