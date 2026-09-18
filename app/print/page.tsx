'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import ElimiHeader from '@/components/ElimiHeader';
import HeroSection from '@/components/printbe/HeroSection';
import FeaturesSection from '@/components/printbe/FeaturesSection';
import ServicesSection from '@/components/printbe/ServicesSection';
import ProcessSection from '@/components/printbe/ProcessSection';
import ProductsSection from '@/components/printbe/ProductsSection';

import GalleryModal from '@/components/printbe/GalleryModal';
import CartDrawer from '@/components/printbe/CartDrawer';
import SearchModal from '@/components/printbe/SearchModal';
import AuthModal from '@/components/printbe/AuthModal';

import { Product, CartItem } from '@/components/printbe/types';
import { useCmsPage } from '@/lib/firestore-cms';

export default function PrintPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Fetch real-time CMS content for Print page
  const { data: cmsPrintPage } = useCmsPage('print');

  const heroContent = cmsPrintPage?.sections?.find((s) => s.id === 'hero' || s.type === 'hero')?.content;
  const featuresContent = cmsPrintPage?.sections?.find((s) => s.id === 'features' || s.type === 'features')?.content;
  const servicesContent = cmsPrintPage?.sections?.find((s) => s.id === 'services' || s.type === 'services')?.content;
  const processContent = cmsPrintPage?.sections?.find((s) => s.id === 'process' || s.type === 'process')?.content;
  const productsContent = cmsPrintPage?.sections?.find((s) => s.id === 'products' || s.type === 'products')?.content;

  // Cart actions
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === item.productId && i.finish === item.finish);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleAddToCartDirect = (product: Product) => {
    const defaultItem: CartItem = {
      id: 'direct-' + Date.now(),
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      quantity: 10,
      unitPrice: product.minPrice,
      finish: product.options?.finishes?.[0] || 'Standard Finish',
    };
    handleAddToCart(defaultItem);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] antialiased selection:bg-[#0B57FF] selection:text-white flex flex-col font-sans">
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection
          content={heroContent}
          onGetStarted={scrollToProducts}
          onViewGallery={() => setIsGalleryOpen(true)}
        />

        {/* 2. Business Design & Features Section */}
        <FeaturesSection
          content={featuresContent}
          onLearnMore={scrollToProducts}
        />

        {/* 3. Premier Custom Print Solutions Section */}
        <ServicesSection
          content={servicesContent}
          onSelectCategory={() => {
            scrollToProducts();
          }}
        />

        {/* 4. Process & Bulk Savings Section */}
        <ProcessSection
          content={processContent}
          onLearnMoreBulk={scrollToProducts}
          onStartUpload={scrollToProducts}
        />

        {/* 5. Printing Marketplace & Products Section */}
        <ProductsSection
          content={productsContent}
          onSelectProduct={handleAddToCartDirect}
          onAddToCartDirect={handleAddToCartDirect}
        />
      </main>

      {/* Interactive Modals & Slideouts */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onConfigureItem={() => {
          scrollToProducts();
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleAddToCartDirect}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
