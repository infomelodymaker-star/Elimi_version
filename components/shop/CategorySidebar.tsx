'use client';

import React, { useState } from 'react';
import { Shirt, Smartphone, ChevronDown, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SubCategory {
  id: string;
  label: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  iconType: 'fashion' | 'electronics' | 'cultural' | 'beauty';
  subCategories: SubCategory[];
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: 'Fashion',
    label: 'Fashion',
    iconType: 'fashion',
    subCategories: [
      { id: 'All', label: 'All Fashion' },
      { id: "Men's Clothing", label: "Men's Clothes" },
      { id: "Women's Clothing", label: "Women's Clothes" },
      { id: "Kids & Baby", label: "Baby & Kids Clothes" },
      { id: "Footwear & Shoes", label: "Shoes & Footwear" },
    ],
  },
  {
    id: 'Electronics',
    label: 'Electronics',
    iconType: 'electronics',
    subCategories: [
      { id: 'All', label: 'All Electronics' },
      { id: 'Audio & Speakers', label: 'Audio & Speakers' },
      { id: 'Mobile & Accessories', label: 'Mobile & Accessories' },
      { id: 'Drones & Cameras', label: 'Drones & Cameras' },
    ],
  },
  {
    id: 'Cultural',
    label: 'Cultural Articles',
    iconType: 'cultural',
    subCategories: [
      { id: 'All', label: 'All Cultural' },
      { id: 'Traditional Crafts', label: 'Traditional Crafts' },
      { id: 'Baskets & Weaving', label: 'Baskets & Agaseke' },
      { id: 'Jewelry & Beads', label: 'Jewelry & Beads' },
    ],
  },
  {
    id: 'Nails & Beauty',
    label: 'Nails & Beauty',
    iconType: 'beauty',
    subCategories: [
      { id: 'All', label: 'All Nails & Beauty' },
      { id: 'Press-On Nails', label: 'Press-On Nails' },
      { id: 'Polish & Gel', label: 'Gel & Polish' },
      { id: 'Tools & Equipment', label: 'Tools & Drills' },
    ],
  },
];

interface CategorySidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubCategory?: string;
  setSelectedSubCategory?: (subCategory: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  currency: 'BIF' | 'USD';
  setCurrency: (currency: 'BIF' | 'USD') => void;
  stockLocation: string;
  setStockLocation: (location: string) => void;
  onResetFilters?: () => void;
  onCloseMobileFilters?: () => void;
}

export default function CategorySidebar({
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory = 'All',
  setSelectedSubCategory,
  maxPrice,
  setMaxPrice,
  currency,
  setCurrency,
  stockLocation,
  setStockLocation,
  onResetFilters,
  onCloseMobileFilters,
}: CategorySidebarProps) {
  // Track open accordion state per category ID
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    Fashion: selectedCategory === 'Fashion' || selectedCategory === 'All',
    Electronics: selectedCategory === 'Electronics',
    Cultural: selectedCategory === 'Cultural',
    'Nails & Beauty': selectedCategory === 'Nails & Beauty',
  });

  const [prevCategory, setPrevCategory] = useState(selectedCategory);
  if (prevCategory !== selectedCategory) {
    setPrevCategory(selectedCategory);
    if (selectedCategory && selectedCategory !== 'All') {
      setOpenCategories((prev) => ({
        ...prev,
        [selectedCategory]: true,
      }));
    }
  }

  const toggleAccordion = (catId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory !== catId) {
      setSelectedCategory(catId);
      if (setSelectedSubCategory) {
        setSelectedSubCategory('All');
      }
      setOpenCategories((prev) => ({
        ...prev,
        [catId]: true,
      }));
      onCloseMobileFilters?.();
    } else {
      // Toggle accordion if already selected
      toggleAccordion(catId);
    }
  };

  const handleSubCategoryClick = (e: React.MouseEvent, catId: string, subId: string) => {
    e.stopPropagation();
    if (selectedCategory !== catId) {
      setSelectedCategory(catId);
    }
    if (setSelectedSubCategory) {
      setSelectedSubCategory(subId);
    }
    onCloseMobileFilters?.();
  };

  return (
    <aside className="relative w-full bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-6 lg:sticky lg:top-6 self-start font-sans">
      {/* Top Right Close Button for Mobile & Tablet screens */}
      {onCloseMobileFilters && (
        <button
          type="button"
          onClick={onCloseMobileFilters}
          className="lg:hidden absolute top-4 right-4 p-1.5 text-slate-400 hover:text-[#181B25] hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-20"
          aria-label="Close category chooser"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Categories Header & List */}
      <div>
        <div className="flex items-center justify-between mb-3 pr-8 lg:pr-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0D52FF]" />
            <h3 className="font-serif font-black text-base text-[#181B25] tracking-tight">
              Category Chooser
            </h3>
          </div>
          {(selectedCategory !== 'All' || selectedSubCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                if (setSelectedSubCategory) setSelectedSubCategory('All');
                onCloseMobileFilters?.();
              }}
              className="text-[11px] text-[#0D52FF] font-bold hover:underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {CATEGORY_ITEMS.map((cat) => {
            const isCategorySelected = selectedCategory === cat.id;
            const isOpen = !!openCategories[cat.id];

            return (
              <div key={cat.id} className="rounded-xl overflow-hidden">
                {/* Category Main Row */}
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer group ${
                    isCategorySelected
                      ? 'bg-[#0D52FF]/10 text-[#0D52FF] font-black shadow-2xs border border-[#0D52FF]/20'
                      : 'text-[#181B25] font-bold hover:bg-slate-50 hover:text-[#0D52FF]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon rendering strictly matching reference */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isCategorySelected
                          ? 'bg-[#0D52FF] text-white'
                          : 'bg-blue-50 text-[#0D52FF] group-hover:bg-[#0D52FF] group-hover:text-white'
                      }`}
                    >
                      {cat.iconType === 'fashion' && (
                        <Shirt className="w-4 h-4 fill-current" />
                      )}
                      {cat.iconType === 'electronics' && (
                        <Smartphone className="w-4 h-4" />
                      )}
                      {cat.iconType === 'cultural' && (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6-6 6 6v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
                          <path d="M12 3v18" />
                          <path d="M8 12h8" />
                        </svg>
                      )}
                      {cat.iconType === 'beauty' && (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 3h6v3H9z" />
                          <path d="M8 6h8v4H8z" />
                          <path d="M6 10h12v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10z" />
                          <circle cx="12" cy="16" r="2" />
                        </svg>
                      )}
                    </div>

                    <span className="truncate text-left">{cat.label}</span>
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0D52FF]' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Subcategories Accordion List */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 pr-2 py-1.5 space-y-1 my-1 border-l-2 border-blue-100/80 ml-5">
                        {cat.subCategories.map((sub) => {
                          const isSubSelected =
                            isCategorySelected && selectedSubCategory === sub.id;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={(e) => handleSubCategoryClick(e, cat.id, sub.id)}
                              className={`w-full flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-left ${
                                isSubSelected
                                  ? 'bg-[#0D52FF] text-white font-bold shadow-2xs'
                                  : 'text-slate-600 hover:text-[#0D52FF] hover:bg-blue-50/60 font-medium'
                              }`}
                            >
                              <span>{sub.label}</span>
                              {isSubSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-100" />

      {/* Filters Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-black text-base text-[#181B25] tracking-tight">
            Filters
          </h3>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-slate-400 hover:text-[#0D52FF] flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Price Range Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#181B25]">Price Range</span>
            <span className="font-bold text-[#0D52FF] text-[11px]">
              Up to {currency === 'BIF' ? `${maxPrice.toLocaleString()} BIF` : `$${Math.round(maxPrice / 2800)} USD`}
            </span>
          </div>

          <input
            type="range"
            min={5000}
            max={2500000}
            step={25000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D52FF]"
          />

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-0.5">
            <span>5,000 BIF</span>
            <span>500,000+ BIF</span>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="space-y-2">
          <span className="font-extrabold text-xs text-[#181B25] block">
            Currency
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCurrency('BIF')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currency === 'BIF'
                  ? 'bg-[#0D52FF]/10 text-[#0D52FF] border-2 border-[#0D52FF]/40 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              BIF
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#0D52FF]/10 text-[#0D52FF] border-2 border-[#0D52FF]/40 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {/* Stock Location Dropdown */}
        <div className="space-y-2">
          <span className="font-extrabold text-xs text-[#181B25] block">
            Stock Location
          </span>
          <div className="relative">
            <select
              value={stockLocation}
              onChange={(e) => setStockLocation(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-[#181B25] appearance-none focus:outline-none focus:border-[#0D52FF] cursor-pointer shadow-2xs"
            >
              <option value="All Locations">All Locations</option>
              <option value="Bujumbura">Bujumbura Hub</option>
              <option value="Gitega">Gitega Artisans</option>
              <option value="Diaspora Direct">Diaspora Direct</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  );
}
