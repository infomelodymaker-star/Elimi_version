'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Product } from '@/lib/products';
import {
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  seedInitialProductsIfEmpty,
} from '@/lib/firestore-products';

interface ManageProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  isLive: boolean;
}

export default function ManageProductsModal({
  isOpen,
  onClose,
  products,
  isLive,
}: ManageProductsModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fashion' as Product['category'],
    subCategory: "Men's Clothing",
    priceBIF: 85000,
    priceUSD: 28,
    seller: 'ELIMI Boutique Hub',
    stockQuantity: 15,
    badge: 'New Arrival',
    image:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80',
    description: 'Premium quality product verified by ELIMI Boutique inspectors.',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'priceBIF' || name === 'priceUSD' || name === 'stockQuantity'
          ? Number(value)
          : value,
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const newId =
        editingProduct?.id ||
        `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const productPayload: Product = {
        id: newId,
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        priceBIF: Number(formData.priceBIF),
        priceUSD: Number(formData.priceUSD),
        seller: formData.seller.trim() || 'ELIMI Boutique Store',
        stockQuantity: Number(formData.stockQuantity) || 10,
        inStock: Number(formData.stockQuantity) > 0,
        rating: editingProduct?.rating || 5.0,
        reviewsCount: editingProduct?.reviewsCount || 1,
        badge: formData.badge.trim() || undefined,
        image:
          formData.image.trim() ||
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80',
        gallery: [
          formData.image.trim() ||
            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80',
        ],
        description: formData.description.trim(),
        reviews: editingProduct?.reviews || [
          {
            id: `rev-${Date.now()}`,
            author: 'Verified Buyer',
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            date: 'Recently',
            rating: 5,
            comment: 'Excellent product quality and prompt delivery service in Burundi.',
            verified: true,
          },
        ],
      };

      if (editingProduct) {
        await updateProductInFirestore(editingProduct.id, productPayload);
        showToast(`Updated "${formData.name}" in Firestore!`);
      } else {
        await addProductToFirestore(productPayload);
        showToast(`Added "${formData.name}" directly to Firestore!`);
      }

      setEditingProduct(null);
      setActiveTab('list');
      setFormData({
        name: '',
        category: 'Fashion',
        subCategory: "Men's Clothing",
        priceBIF: 85000,
        priceUSD: 28,
        seller: 'ELIMI Boutique Hub',
        stockQuantity: 15,
        badge: 'New Arrival',
        image:
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80',
        description: 'Premium quality product verified by ELIMI Boutique inspectors.',
      });
    } catch (err: any) {
      console.error('Error saving product to Firestore:', err);
      showToast(`Error saving product: ${err.message || 'Check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      subCategory: prod.subCategory || "Men's Clothing",
      priceBIF: prod.priceBIF,
      priceUSD: prod.priceUSD,
      seller: prod.seller,
      stockQuantity: prod.stockQuantity || 10,
      badge: prod.badge || '',
      image: prod.image,
      description: prod.description,
    });
    setActiveTab('add');
  };

  const handleDelete = async (prodId: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}" from Firestore?`)) {
      return;
    }
    try {
      await deleteProductFromFirestore(prodId);
      showToast(`Deleted "${prodName}" from Firestore!`);
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`);
    }
  };

  const handleQuickStockUpdate = async (
    prodId: string,
    currentStock: number,
    delta: number
  ) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateProductInFirestore(prodId, {
        stockQuantity: newStock,
        inStock: newStock > 0,
      });
      showToast(`Stock updated to ${newStock}!`);
    } catch (err: any) {
      showToast(`Stock update failed: ${err.message}`);
    }
  };

  const handleReseed = async () => {
    setIsSubmitting(true);
    try {
      await seedInitialProductsIfEmpty();
      showToast('Catalog synchronized with Firestore!');
    } catch (err: any) {
      showToast(`Sync error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
        {/* Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-60 bg-[#0D52FF] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0D52FF]/10 text-[#0D52FF] flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-base sm:text-lg text-[#181B25]">
                    Real-Time Firestore Catalog
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-[#525866]">
                  All changes synchronize across all devices in real time via Firestore.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer border border-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('list');
                  setEditingProduct(null);
                }}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'border-[#0D52FF] text-[#0D52FF]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Live Products ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-[#0D52FF] text-[#0D52FF]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReseed}
              disabled={isSubmitting}
              className="text-[11px] text-[#0D52FF] hover:underline font-bold flex items-center gap-1 pb-3 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>Sync Default Catalog</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'list' ? (
              <div className="space-y-3">
                {products.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                    <Database className="w-8 h-8 mx-auto text-slate-300" />
                    <p>No products currently in Firestore database.</p>
                    <button
                      type="button"
                      onClick={handleReseed}
                      className="bg-[#0D52FF] text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Seed Default Products
                    </button>
                  </div>
                ) : (
                  products.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-200/80 shrink-0 overflow-hidden">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#0D52FF] bg-blue-50 px-1.5 py-0.5 rounded-md">
                              {prod.category}
                            </span>
                            <span className="font-serif font-bold text-xs text-[#181B25] truncate">
                              {prod.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="font-bold text-[#0D52FF]">
                              {prod.priceBIF.toLocaleString()} BIF
                            </span>
                            <span>(${prod.priceUSD} USD)</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">Stock: {prod.stockQuantity || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick Stock adjustments */}
                        <div className="hidden sm:flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200/80 text-xs">
                          <span className="text-[10px] text-slate-400 font-bold mr-1">Qty:</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStockUpdate(prod.id, prod.stockQuantity || 0, -1)
                            }
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-xs">
                            {prod.stockQuantity || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStockUpdate(prod.id, prod.stockQuantity || 0, 1)
                            }
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(prod)}
                          className="p-2 rounded-xl bg-white hover:bg-blue-50 text-[#0D52FF] border border-slate-200/80 transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-500 border border-slate-200/80 transition-colors cursor-pointer"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-[#181B25]">
                      Product Title / Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Handmade Burundian Agaseke Basket"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    >
                      <option value="Fashion">Fashion</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Nails & Beauty">Nails & Beauty</option>
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Sub Category</label>
                    <input
                      type="text"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleFormChange}
                      placeholder="e.g. Traditional Crafts"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Price BIF */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Price in BIF *</label>
                    <input
                      type="number"
                      name="priceBIF"
                      required
                      min={0}
                      step={1000}
                      value={formData.priceBIF}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Price USD */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Price in USD *</label>
                    <input
                      type="number"
                      name="priceUSD"
                      required
                      min={0}
                      step={0.5}
                      value={formData.priceUSD}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Initial Stock Units</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      min={0}
                      value={formData.stockQuantity}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Seller / Store Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Verified Seller</label>
                    <input
                      type="text"
                      name="seller"
                      value={formData.seller}
                      onChange={handleFormChange}
                      placeholder="ELIMI Boutique Hub"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Badge */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Badge Tag</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleFormChange}
                      placeholder="e.g. Trending, Best Seller, New"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#181B25]">Image URL *</label>
                    <input
                      type="url"
                      name="image"
                      required
                      value={formData.image}
                      onChange={handleFormChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-[#181B25]">Description *</label>
                    <textarea
                      name="description"
                      rows={3}
                      required
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Write a clear description of the product..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0D52FF]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('list');
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0D52FF] hover:bg-[#0B44D8] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting
                        ? 'Saving to Firestore...'
                        : editingProduct
                        ? 'Update in Firestore'
                        : 'Publish to Firestore'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
