'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Star,
  Eye,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Heart,
  ShoppingCart,
  Check,
  Loader2,
  Database,
  Plus,
  Radio,
  Search,
  RotateCcw,
  ArrowUp,
} from 'lucide-react';
import CategorySidebar from './CategorySidebar';
import { Product, BOUTIQUE_PRODUCTS } from '@/lib/products';
import { useRealtimeProducts } from '@/lib/firestore-products';
import { useCurrency } from '@/components/SettingsProvider';

export type { Product };
export { BOUTIQUE_PRODUCTS };

interface ProductGridProps {
  searchQuery: string;
  setSearchQuery?: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export default function ProductGrid({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  onSelectProduct,
}: ProductGridProps) {
  const router = useRouter();
  const { products: realtimeProducts, loading: isLoadingFirestore, isLive } = useRealtimeProducts();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Sidebar Filter States matching reference picture
  const [maxPrice, setMaxPrice] = useState<number>(2500000);
  const [currency, setCurrency] = useState<'BIF' | 'USD'>('BIF');
  const [stockLocation, setStockLocation] = useState<string>('All Locations');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const gridTopRef = useRef<HTMLElement | null>(null);

  const handleResetAndScrollTop = () => {
    handleResetFilters();
    if (setSearchQuery) setSearchQuery('');
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-collapse Category Chooser on mobile/tablet when clicking outside
  useEffect(() => {
    if (!showMobileFilters) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowMobileFilters(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMobileFilters]);

  // Infinite Scroll pagination states
  const [extraItemsLoaded, setExtraItemsLoaded] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Compute pagination key based on filters to automatically derive base items count
  const filterKey = `${searchQuery}-${selectedCategory}-${selectedSubCategory}-${maxPrice}-${stockLocation}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState<string>(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setExtraItemsLoaded(0);
  }

  const visibleCount = 8 + extraItemsLoaded;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setMaxPrice(2500000);
    setCurrency('BIF');
    setStockLocation('All Locations');
    setExtraItemsLoaded(0);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { toBIF, formatBIF } = useCurrency();

  // Filter & Sort real-time products from Firestore
  const filteredProducts = useMemo(() => {
    const rawProducts = realtimeProducts && realtimeProducts.length > 0 ? realtimeProducts : BOUTIQUE_PRODUCTS;
    const sourceProducts = rawProducts.map(p => ({ ...p, priceBIF: toBIF(p.priceUSD) }));
    return sourceProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      const matchesSubCategory =
        !selectedSubCategory ||
        selectedSubCategory === 'All' ||
        product.subCategory === selectedSubCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.seller.toLowerCase().includes(query);
      
      const matchesPrice = product.priceBIF <= maxPrice;

      const matchesLocation =
        stockLocation === 'All Locations' ||
        (stockLocation === 'Bujumbura' && product.seller.toLowerCase().includes('bujumbura')) ||
        (stockLocation === 'Gitega' && product.seller.toLowerCase().includes('gitega')) ||
        (stockLocation === 'Diaspora Direct' && !product.seller.toLowerCase().includes('bujumbura') && !product.seller.toLowerCase().includes('gitega'));

      return matchesCategory && matchesSubCategory && matchesSearch && matchesPrice && matchesLocation;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.priceBIF - b.priceBIF;
      if (sortBy === 'price-high') return b.priceBIF - a.priceBIF;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [realtimeProducts, searchQuery, selectedCategory, selectedSubCategory, maxPrice, stockLocation, sortBy, toBIF]);

  // Infinite scroll intersection observer effect
  useEffect(() => {
    const observerElement = observerRef.current;
    if (!observerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && visibleCount < filteredProducts.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setExtraItemsLoaded((prev) => prev + 4);
            setIsLoadingMore(false);
          }, 500);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(observerElement);
    return () => {
      observer.unobserve(observerElement);
    };
  }, [visibleCount, filteredProducts.length, isLoadingMore]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleAddClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section ref={gridTopRef} className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      {/* Grid Controls Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            {/* Main Heading styled with Playfair Display (font-serif) */}
            <h2 className="font-serif text-xl sm:text-2xl font-black text-[#181B25] tracking-tight">
              {selectedCategory === 'All'
                ? 'Curated Boutique Collection'
                : selectedSubCategory === 'All'
                ? `${selectedCategory} Items`
                : `${selectedCategory} › ${selectedSubCategory}`}
            </h2>
          </div>

          {/* Sub-heading text styled with Inter (font-sans) */}
          <p className="font-sans text-xs text-[#525866] mt-0.5">
            Showing <span className="font-bold text-[#0D52FF]">{displayedProducts.length}</span> of <span className="font-bold text-[#181B25]">{filteredProducts.length}</span> verified live products
          </p>
        </div>

        {/* Desktop Sort Dropdown */}
        <div className="hidden lg:flex items-center gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 text-xs text-[#525866] font-semibold bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#0D52FF]" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#181B25] font-bold focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Search Bar & Filter Options */}
      <div className="lg:hidden mb-6 space-y-3 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input Bar */}
          {setSearchQuery && (
            <div className="flex-1 bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-2 transition-all focus-within:border-[#0D52FF] focus-within:ring-2 focus-within:ring-[#0D52FF]/20">
              <div className="pl-3 text-[#525866] shrink-0">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clothes, phones, crafts, nail kits..."
                className="w-full bg-transparent text-xs text-[#181B25] placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                className="bg-[#0D52FF] hover:bg-[#0B44D8] text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                Search
              </button>
            </div>
          )}

          {/* Filter options component (Side-by-side with Search on tablets, below Search on mobile) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            {/* Mobile/Tablet Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-[#181B25] font-bold bg-white px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200/80 shadow-2xs cursor-pointer hover:border-[#0D52FF]/50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0D52FF]" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-[#525866] font-semibold bg-white px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#0D52FF]" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#181B25] font-bold focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Fixed Category Sidebar on Left + Products Grid on Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Panel: Category & Filter Sidebar (Sticky on Scroll) */}
        <div
          ref={sidebarRef}
          className={`w-full lg:w-72 shrink-0 lg:sticky lg:top-6 self-start ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
        >
          <CategorySidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            currency={currency}
            setCurrency={setCurrency}
            stockLocation={stockLocation}
            setStockLocation={setStockLocation}
            onResetFilters={handleResetFilters}
            onCloseMobileFilters={() => setShowMobileFilters(false)}
          />
        </div>

        {/* Right Panel: Products Catalog */}
        <div className="flex-1 min-w-0 w-full">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 space-y-3 font-sans">
              <div className="w-12 h-12 rounded-full bg-[#0D52FF]/10 text-[#0D52FF] mx-auto flex items-center justify-center">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#181B25]">No matching products found</h3>
              <p className="text-xs text-[#525866] max-w-md mx-auto">
                Try expanding your price range, clearing location filter, or choosing another category.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 bg-[#0D52FF] text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-xs hover:bg-[#0B44D8] transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {displayedProducts.map((product) => {
                  const isJustAdded = addedItemIds[product.id];
                  const isFav = favorites[product.id];
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => {
                        router.push(`/shop/${product.id}`);
                      }}
                      className="bg-white rounded-2xl p-2.5 xs:p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden font-sans"
                    >
                      {/* Full-width Product Image Container with Absolute Badge & Icon Overlay */}
                      <div className="relative w-[calc(100%+1.25rem)] xs:w-[calc(100%+1.75rem)] sm:w-[calc(100%+2rem)] -mx-2.5 xs:-mx-3.5 sm:-mx-4 -mt-2.5 xs:-mt-3.5 sm:-mt-4 h-32 xs:h-40 sm:h-52 bg-[#F8FAFC] overflow-hidden flex items-center justify-center mb-3 rounded-t-2xl">
                        {/* Top Overlay Badge & Wishlist Button */}
                        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-20 flex items-center justify-between pointer-events-none">
                          <span className="pointer-events-auto bg-emerald-50/95 backdrop-blur-xs text-emerald-600 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-200/80 shadow-2xs font-sans">
                            {product.stockQuantity ? `${product.stockQuantity} items` : '12 items'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(e, product.id)}
                            className="pointer-events-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-2xs border border-white/80 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            aria-label="Wishlist"
                          >
                            <Heart
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                isFav ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Full-width Image element with zero internal padding */}
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-contain p-0 w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Category Label */}
                      <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mb-0.5 font-sans">
                        {product.category === 'Cultural' ? 'Cultural Articles' : product.category}
                      </div>

                      {/* Product Name (Heading in Playfair Display font-serif) */}
                      <h3 className="font-serif font-extrabold text-xs sm:text-sm text-[#181B25] group-hover:text-[#0D52FF] transition-colors leading-snug line-clamp-2 mb-1.5 min-h-[32px] sm:min-h-[36px]">
                        {product.name}
                      </h3>

                      {/* Price Line: BIF in Blue + / $USD in Muted Gray (Inter font-sans) */}
                      <div className="flex flex-col xs:flex-row xs:items-baseline gap-0.5 xs:gap-1.5 mb-1.5 font-sans">
                        <span className="text-[#0D52FF] font-black text-[11px] sm:text-sm tracking-tight leading-none">
                          {product.priceBIF.toLocaleString()} BIF
                        </span>
                        <span className="text-slate-400 font-medium text-[9px] sm:text-[11px] leading-none">
                          / ${product.priceUSD.toFixed(0)} USD
                        </span>
                      </div>

                      {/* Rating Stars & Count */}
                      <div className="flex items-center gap-1 mb-2.5 sm:mb-3 text-[10px] sm:text-[11px] font-sans">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                star <= Math.floor(product.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 fill-slate-200'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-slate-500 text-[9px] sm:text-[10px] ml-0.5">
                          ({product.rating})
                        </span>
                      </div>

                      {/* Bottom Action Row: See Details Button + Cart Icon Button */}
                      <div className="flex items-center gap-1.5 pt-1 mt-auto font-sans">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/shop/${product.id}`);
                          }}
                          className="flex-1 bg-[#0D52FF] hover:bg-[#0B44D8] text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-xl transition-all cursor-pointer shadow-2xs text-center whitespace-nowrap"
                        >
                          See Details
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAddClick(e, product)}
                          className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-[#F0F4FF] hover:bg-blue-100 text-[#0D52FF] border-blue-200/80'
                          }`}
                          aria-label="Add to cart"
                        >
                          {isJustAdded ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Infinite Scroll Sentinel & Loader */}
              {visibleCount < filteredProducts.length && (
                <div ref={observerRef} className="py-8 flex flex-col items-center justify-center space-y-2 font-sans">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D52FF] bg-[#F0F4FF] px-4 py-2.5 rounded-full border border-blue-200/80 shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0D52FF]" />
                    <span>Loading more boutique products...</span>
                  </div>
                </div>
              )}

              {visibleCount >= filteredProducts.length && filteredProducts.length > 0 && (
                <div className="py-10 flex flex-col items-center justify-center gap-3 font-sans">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200/60">
                    You&apos;ve viewed all {filteredProducts.length} verified items
                  </span>

                  <button
                    type="button"
                    onClick={handleResetAndScrollTop}
                    className="group flex items-center gap-2 text-xs font-bold text-[#0D52FF] bg-[#F0F4FF] hover:bg-[#0D52FF] hover:text-white px-5 py-2.5 rounded-full border border-blue-200/80 shadow-2xs transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:-rotate-90" />
                    <span>Reset Filters &amp; Back to Top</span>
                    <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

