"use client";

import React, { useState, useSyncExternalStore } from "react";
import ElimiHeader from "@/components/ElimiHeader";
import ShopHero from "@/components/shop/ShopHero";
import ProductGrid, {
  Product,
} from "@/components/shop/ProductGrid";
import ProductDetailModal from "@/components/shop/ProductDetailModal";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import {
  subscribeCart,
  getCartSnapshot,
  getServerCartSnapshot,
  addToCart,
} from "@/lib/cart";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Central Cart State via SyncExternalStore
  const cartItems = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-[#0F172A] font-sans flex flex-col justify-between antialiased">
      {/* Home Page Navigation Header */}
      <ElimiHeader
        cartCount={totalCartCount}
        showCart={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Boutique Hero Section */}
        <ShopHero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onSearchSubmit={() => {
            // Smoothly scroll to product grid if needed
            const gridEl = document.getElementById("boutique-catalog");
            if (gridEl) {
              gridEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* Product Catalog */}
        <div id="boutique-catalog">
          <ProductGrid
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Value Proposition & Guarantees Banner */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)] grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B57FF]/10 text-[#0B57FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-[#0F172A]">
                  Verified Sellers Only
                </h4>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Every item is inspected and authenticated before delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B57FF]/10 text-[#0B57FF] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-[#0F172A]">
                  Burundi &amp; Diaspora Shipping
                </h4>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Fast door-to-door delivery in Bujumbura, Gitega, and worldwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B57FF]/10 text-[#0B57FF] flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-[#0F172A]">
                  Instant WhatsApp Order
                </h4>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Pay with Mobile Money (Lumicash, Ecocash) or Cash on Delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Shopping Cart Button linking directly to /shop/cart */}
      <Link
        href="/shop/cart"
        className="fixed bottom-6 right-6 z-40 bg-[#0B57FF] hover:bg-[#0948D9] text-white py-3 px-5 rounded-full shadow-lg flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105"
        aria-label="View Shopping Cart"
      >
        <ShoppingCart className="w-5 h-5 text-white" />
        <span className="font-semibold text-xs">Cart</span>
        <span className="bg-white text-[#0B57FF] font-bold text-xs px-2 py-0.5 rounded-full">
          {totalCartCount}
        </span>
      </Link>

      {/* Product Quick Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
