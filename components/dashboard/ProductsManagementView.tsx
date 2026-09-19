'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Product,
  ShippingDetails,
  BOUTIQUE_PRODUCTS,
} from '@/lib/products';
import {
  useRealtimeProducts,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  seedInitialProductsIfEmpty,
  useRealtimeProductCategories,
  addProductCategory,
  updateProductCategory,
  deleteProductCategory,
  ProductCategory
} from '@/lib/firestore-products';
import { uploadImageSafely } from '@/lib/image-upload';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

const PRESET_SIZES = {
  fashionApparel: ['S', 'M', 'L', 'XL', 'XXL'],
  fashionShoes: ['40 EU', '41 EU', '42 EU', '43 EU', '44 EU', '45 EU'],
  nails: ['XS (Petite)', 'S (Natural)', 'M (Standard)', 'L (Wide)'],
  culturalBaskets: ['Small (18cm)', 'Medium (28cm)', 'Large (40cm)'],
};

export default function ProductsManagementView() {
  const { products, loading, error, isLive } = useRealtimeProducts();
  const { categories, loading: loadingCategories, isLive: categoriesLive } = useRealtimeProductCategories();

  // Tab State
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All');

  // Modal / Drawer state for Create & Edit Items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Modal / Drawer state for Create & Edit Categories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  
  // Category Form State
  const [catFormData, setCatFormData] = useState<{
    id?: string;
    name: string;
    slug: string;
    imageUrl: string;
    description: string;
    order: number;
  }>({
    name: '',
    slug: '',
    imageUrl: '',
    description: '',
    order: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<{ id: string; name: string } | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = (message: string, type: ToastInfo['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form State for Create / Edit Product
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    category: string;
    subCategory: string;
    badgeTag: string;
    badge: string;
    priceUSD: number;
    priceBIF: number;
    originalPriceUSD: number | undefined;
    discountPercentage: number | undefined;
    stockQuantity: number;
    inStock: boolean;
    sizes: string[];
    newSizeInput: string;
    image: string;
    gallery: string[];
    newGalleryUrl: string;
    seller: string;
    description: string;
    descriptionFit: string;
    shippingDiscount: string;
    shippingPackageType: string;
    shippingDeliveryTime: string;
    shippingEstimatedArrival: string;
  }>({
    id: '',
    name: '',
    category: 'Fashion',
    subCategory: "Men's Clothing",
    badgeTag: 'Man Fashion',
    badge: 'Popular Choice',
    priceUSD: 25,
    priceBIF: 75000,
    originalPriceUSD: 50,
    discountPercentage: 50,
    stockQuantity: 15,
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    newSizeInput: '',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
    ],
    newGalleryUrl: '',
    seller: 'ELIMI Apparel & NextGen Studio',
    description: 'High-quality boutique product made with verified premium materials.',
    descriptionFit: 'Regular fit tailored for comfort and durability.',
    shippingDiscount: 'Disc 50%',
    shippingPackageType: 'Regular Package',
    shippingDeliveryTime: '2-3 Working Days',
    shippingEstimatedArrival: '10 - 12 October 2024',
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const total = products.length;
    const inStockCount = products.filter((p) => p.inStock && (p.stockQuantity ?? 0) > 0).length;
    const lowStockCount = products.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 5).length;
    const outOfStockCount = products.filter((p) => !p.inStock || (p.stockQuantity ?? 0) === 0).length;
    const fashionCount = products.filter((p) => p.category === 'Fashion').length;
    const totalRemainingItems = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

    return {
      total,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      fashionCount,
      totalRemainingItems,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      const qty = p.stockQuantity ?? 0;
      if (stockFilter === 'in_stock' && (!p.inStock || qty <= 0)) return false;
      if (stockFilter === 'low_stock' && (qty <= 0 || qty > 5)) return false;
      if (stockFilter === 'out_of_stock' && (p.inStock && qty > 0)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchSub = (p.subCategory || '').toLowerCase().includes(q);
        const matchSeller = (p.seller || '').toLowerCase().includes(q);
        const matchBadge = (p.badgeTag || p.badge || '').toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchSub && !matchSeller && !matchBadge) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormData({
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      category: 'Fashion',
      subCategory: "Men's Clothing",
      badgeTag: 'Man Fashion',
      badge: 'New Arrival',
      priceUSD: 25,
      priceBIF: 75000,
      originalPriceUSD: 50,
      discountPercentage: 50,
      stockQuantity: 15,
      inStock: true,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      newSizeInput: '',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
      ],
      newGalleryUrl: '',
      seller: 'ELIMI Apparel & NextGen Studio',
      description: 'Handcrafted luxury apparel with reinforced stitching and premium cotton finish.',
      descriptionFit: 'Modern comfortable fit designed for versatile daily styling.',
      shippingDiscount: 'Disc 50%',
      shippingPackageType: 'Regular Package',
      shippingDeliveryTime: '2-3 Working Days',
      shippingEstimatedArrival: '10 - 12 October 2024',
    });
    setIsModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    setFormData({
      id: p.id,
      name: p.name,
      category: p.category,
      subCategory: p.subCategory || '',
      badgeTag: p.badgeTag || '',
      badge: p.badge || '',
      priceUSD: p.priceUSD,
      priceBIF: p.priceBIF,
      originalPriceUSD: p.originalPriceUSD,
      discountPercentage: p.discountPercentage,
      stockQuantity: p.stockQuantity ?? 10,
      inStock: p.inStock,
      sizes: p.sizes ? [...p.sizes] : p.category === 'Fashion' ? ['S', 'M', 'L', 'XL'] : [],
      newSizeInput: '',
      image: p.image,
      gallery: p.gallery && p.gallery.length > 0 ? [...p.gallery] : [p.image],
      newGalleryUrl: '',
      seller: p.seller || 'ELIMI Boutique',
      description: p.description || '',
      descriptionFit: p.descriptionFit || '',
      shippingDiscount: p.shipping?.discount || 'Disc 20%',
      shippingPackageType: p.shipping?.packageType || 'Regular Package',
      shippingDeliveryTime: p.shipping?.deliveryTime || '2-3 Working Days',
      shippingEstimatedArrival: p.shipping?.estimatedArrival || '10 - 12 October 2024',
    });
    setIsModalOpen(true);
  };

  // Quick Stock Adjustment in Table (+ or -)
  const handleQuickStockChange = async (productId: string, currentStock: number, delta: number) => {
    const newQty = Math.max(0, currentStock + delta);
    const newInStock = newQty > 0;
    try {
      await updateProductInFirestore(productId, {
        stockQuantity: newQty,
        inStock: newInStock,
      });
      showToast(`Stock updated: ${newQty} items remaining in stock`, 'info');
    } catch (err: any) {
      showToast(`Failed to update stock: ${err.message}`, 'error');
    }
  };

  // Quick Toggle In-Stock boolean
  const handleQuickToggleInStock = async (productId: string, currentStatus: boolean, currentQty: number) => {
    const nextStatus = !currentStatus;
    const nextQty = nextStatus && currentQty === 0 ? 1 : currentQty;
    try {
      await updateProductInFirestore(productId, {
        inStock: nextStatus,
        stockQuantity: nextQty,
      });
      showToast(nextStatus ? 'Product marked In Stock' : 'Product marked Out of Stock', 'info');
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteProductFromFirestore(productId);
      showToast(`Deleted "${productName}" from Firestore`);
      setDeleteConfirmId(null);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Add Size tag
  const handleAddSize = () => {
    if (!formData.newSizeInput.trim()) return;
    const trimmed = formData.newSizeInput.trim();
    if (!formData.sizes.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, trimmed],
        newSizeInput: '',
      }));
    }
  };

  // Remove Size tag
  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  // Upload Main Product Image to ImgBB
  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast('Uploading main product image to ImgBB...', 'info');
    try {
      const res = await uploadImageSafely(file, 'product-main');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        if (res.source === 'imgbb') {
          showToast('Main image uploaded to ImgBB successfully!');
        } else {
          showToast('Main image uploaded and saved to storage!', 'success');
        }
      } else {
        showToast(res.warning || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading image', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Upload Gallery Images to ImgBB
  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    showToast('Uploading gallery images...', 'info');
    let successCount = 0;
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadImageSafely(files[i], `product-gallery-${i}`);
        if (res.success && res.url) {
          newUrls.push(res.url);
          successCount++;
        }
      }
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ...newUrls] }));
        showToast(`${successCount} gallery image(s) uploaded successfully!`);
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading gallery images', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Add Gallery Image URL
  const handleAddGalleryImage = () => {
    if (!formData.newGalleryUrl.trim()) return;
    const url = formData.newGalleryUrl.trim();
    if (!formData.gallery.includes(url)) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, url],
        newGalleryUrl: '',
      }));
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Apply Size Preset
  const handleApplyPresetSizes = (preset: string[]) => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...preset],
    }));
  };

  // Save (Create or Update) Product to Firestore
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingInfo: ShippingDetails = {
        discount: formData.shippingDiscount || 'Disc 20%',
        packageType: formData.shippingPackageType || 'Regular Package',
        deliveryTime: formData.shippingDeliveryTime || '2-3 Working Days',
        estimatedArrival: formData.shippingEstimatedArrival || '10 - 12 October 2024',
      };

      const finalGallery =
        formData.gallery && formData.gallery.length > 0
          ? formData.gallery
          : [formData.image];

      const productPayload: Product = {
        id: formData.id || `prod-${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory.trim() || undefined,
        badgeTag: formData.badgeTag.trim() || undefined,
        badge: formData.badge.trim() || undefined,
        priceUSD: Number(formData.priceUSD) || 0,
        priceBIF: Number(formData.priceBIF) || (Number(formData.priceUSD) * 3000),
        originalPriceUSD: formData.originalPriceUSD ? Number(formData.originalPriceUSD) : undefined,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
        rating: 4.8,
        reviewsCount: 24,
        image: formData.image.trim(),
        gallery: finalGallery,
        description: formData.description.trim(),
        descriptionFit: formData.descriptionFit.trim() || undefined,
        seller: formData.seller.trim() || 'ELIMI Boutique Hub',
        inStock: Boolean(formData.inStock && Number(formData.stockQuantity) > 0),
        stockQuantity: Number(formData.stockQuantity) || 0,
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
        shipping: shippingInfo,
      };

      if (editingProductId) {
        await updateProductInFirestore(editingProductId, productPayload);
        showToast(`Updated "${productPayload.name}" in Firestore!`);
      } else {
        await addProductToFirestore(productPayload);
        showToast(`Created "${productPayload.name}" in Firestore!`);
      }

      setIsModalOpen(false);
      setEditingProductId(null);
    } catch (err: any) {
      console.error('Error saving product to Firestore:', err);
      showToast(`Firestore save error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reseed / Sync from Default Catalog
  const handleReseed = async () => {
    if (!window.confirm('Sync boutique product catalog into Firestore? Existing items with the same IDs will be preserved.')) {
      return;
    }
    setIsReseeding(true);
    try {
      await seedInitialProductsIfEmpty();
      showToast('Synced boutique products to Firestore!');
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  // --- CATEGORY CRUD METHODS ---
  const handleOpenCreateCategory = () => {
    setCatFormData({
      name: '',
      slug: '',
      imageUrl: '',
      description: '',
      order: categories.length + 1,
    });
    setEditingCategoryId(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ProductCategory) => {
    setCatFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      description: cat.description || '',
      order: cat.order || categories.length + 1,
    });
    setEditingCategoryId(cat.id);
    setIsCategoryModalOpen(true);
  };

  const handleUploadCategoryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageSafely(file, 'product-category');
      if (res.success && res.url) {
        setCatFormData((prev) => ({ ...prev, imageUrl: res.url }));
        if (res.source === 'imgbb') {
          showToast('Category image uploaded to ImgBB!');
        } else {
          showToast('Category image uploaded and saved to storage!');
        }
      } else {
        showToast(res.warning || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading image', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name || !catFormData.slug) {
      showToast('Name and Slug are required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCategoryId) {
        await updateProductCategory(editingCategoryId, catFormData);
        showToast('Category updated!');
      } else {
        await addProductCategory(catFormData);
        showToast('Category created!');
      }
      setIsCategoryModalOpen(false);
      setEditingCategoryId(null);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;
    setIsSubmitting(true);
    try {
      await deleteProductCategory(deleteConfirmCategory.id);
      showToast('Category deleted!');
      setDeleteConfirmCategory(null);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- END CATEGORY METHODS ---

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toast.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* SECTION 1: Metrics KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[13px] font-medium text-zinc-700">Total Products</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">inventory_2</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {stats.total}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Live DB
            </span>
          </div>
          <div className="mt-2 text-zinc-500 text-[12px] flex items-center justify-between">
            <span>{stats.fashionCount} Fashion items</span>
            <span className="font-mono text-zinc-400">across 4 categories</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
        </div>

        {/* Total Stock Remaining */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[13px] font-medium text-zinc-700">Total Remaining Stock</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">warehouse</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {stats.totalRemainingItems}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              units total
            </span>
          </div>
          <div className="mt-2 text-zinc-500 text-[12px]">
            <span>{stats.inStockCount} products active in inventory</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        </div>

        {/* Fashion Collection with Sizes */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[13px] font-medium text-zinc-700">Fashion (Size Enabled)</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">checkroom</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {stats.fashionCount}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              S / M / L / XL
            </span>
          </div>
          <div className="mt-2 text-zinc-500 text-[12px]">
            <span>Includes suits, hoodies, polos &amp; shoes</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </div>

        {/* Low / Out of Stock Alert */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-xs hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[13px] font-medium text-zinc-700">Inventory Alerts</span>
            <span className="material-symbols-outlined text-[18px] text-amber-500">warning</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[32px] font-semibold text-zinc-900 tracking-tight leading-none">
              {stats.lowStockCount + stats.outOfStockCount}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {stats.outOfStockCount} out of stock
            </span>
          </div>
          <div className="mt-2 text-zinc-500 text-[12px]">
            <span>{stats.lowStockCount} items low stock (&le; 5 units)</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </div>
      </section>

      {/* TABS FOR SHOP ITEMS VS CATEGORIES */}
      <div className="flex items-center gap-4 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'items'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Shop Items ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {activeTab === 'items' ? (
        <>
          {/* SECTION 2: Filter Toolbar & Action Buttons */}
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => {
              const catName = cat.name;
              const count = products.filter((p) => p.category === catName).length;
              const isSelected = selectedCategory === catName;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  <span>{catName}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReseed}
              disabled={isReseeding}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Sync / Seed sample boutique items into Firestore"
            >
              <span className={`material-symbols-outlined text-[16px] ${isReseeding ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span className="hidden sm:inline">Sync Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Product</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Secondary Filters */}
        <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-zinc-400">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, seller, subcategory..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
              type="text"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">Stock Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="h-8 pl-2.5 pr-7 py-1 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-xs"
            >
              <option value="All">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="low_stock">Low Stock (&le; 5 units)</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 3: Products Data Table */}
      <section className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2">
            <span className="text-[14px] font-semibold text-zinc-900">
              Shop Products ({filteredProducts.length})
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              Real-time Firestore
            </span>
          </div>
          <Link
            href="/shop"
            target="_blank"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
          >
            <span>View Public Storefront</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono uppercase tracking-wider">Syncing live products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
            <div className="text-sm font-medium text-zinc-800">No products matched your criteria</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search query or filters, or add a new boutique product.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Product Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="p-3 w-14 text-center">Image</th>
                  <th className="p-3 min-w-[200px]">Product Name &amp; Category</th>
                  <th className="p-3 min-w-[130px]">Remaining Stock</th>
                  <th className="p-3 min-w-[130px]">Fashion Sizes</th>
                  <th className="p-3 min-w-[120px]">Price (USD / BIF)</th>
                  <th className="p-3 min-w-[140px]">Seller / Store</th>
                  <th className="p-3 w-28 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800 text-[13px]">
                {filteredProducts.map((p) => {
                  const remainingStock = p.stockQuantity ?? 0;
                  const isStockLow = remainingStock > 0 && remainingStock <= 5;
                  const isStockOut = remainingStock === 0 || !p.inStock;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Visual Thumbnail */}
                      <td className="p-3 text-center">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 mx-auto shrink-0 shadow-2xs">
                          <Image
                            src={p.image || '/assets/shop/african-suit.jpg'}
                            alt={p.name}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Product Name, Category & Tag */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                              {p.name}
                            </span>
                            {p.badge && (
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium shrink-0">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 font-medium">
                              {p.category}
                            </span>
                            {p.subCategory && <span>&bull; {p.subCategory}</span>}
                            {p.badgeTag && (
                              <span className="text-blue-600 font-medium">&bull; {p.badgeTag}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Stock Remaining + Quick Increment / Decrement */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                                isStockOut
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isStockLow
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {remainingStock} units left
                            </span>
                          </div>

                          {/* Instant Stock +/- Controls */}
                          <div className="flex items-center gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, remainingStock, -1)}
                              disabled={remainingStock <= 0}
                              className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer shadow-2xs"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(p.id, remainingStock, +1)}
                              className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 flex items-center justify-center text-xs font-bold cursor-pointer shadow-2xs"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickToggleInStock(p.id, p.inStock, remainingStock)}
                              className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                                p.inStock && remainingStock > 0
                                  ? 'border-emerald-200 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                  : 'border-zinc-200 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                              title="Toggle In-Stock Status"
                            >
                              {p.inStock && remainingStock > 0 ? 'Active' : 'Out'}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Fashion Sizes */}
                      <td className="p-3">
                        {p.sizes && p.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {p.sizes.slice(0, 4).map((s, idx) => (
                              <span
                                key={idx}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {p.sizes.length > 4 && (
                              <span className="font-mono text-[10px] text-zinc-400">
                                +{p.sizes.length - 4}
                              </span>
                            )}
                          </div>
                        ) : p.category === 'Fashion' ? (
                          <span className="text-amber-600 text-xs italic font-medium">Add sizes</span>
                        ) : (
                          <span className="text-zinc-400 text-xs font-mono">Standard</span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 font-mono">
                            ${p.priceUSD?.toFixed(2)}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500">
                            {p.priceBIF?.toLocaleString()} BIF
                          </span>
                        </div>
                      </td>

                      {/* Seller Store */}
                      <td className="p-3">
                        <div className="text-xs text-zinc-700 truncate max-w-[140px]" title={p.seller}>
                          {p.seller || 'ELIMI Boutique'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/shop/${p.id}`}
                            target="_blank"
                            className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 flex items-center justify-center transition-colors shadow-2xs"
                            title="Preview on shop details page"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="w-7 h-7 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                            title="Edit product"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="w-7 h-7 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-zinc-400 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                            title="Delete product from Firestore"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="text-base font-semibold text-zinc-900">Delete Product from Firestore?</h4>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete this product? This change will be immediately reflected in Firestore and the live shop across all users.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = products.find((prod) => prod.id === deleteConfirmId);
                  if (p) handleDeleteProduct(p.id, p.name);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-sm cursor-pointer"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT FULL MODAL / DRAWER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-2xl w-full max-w-3xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  {editingProductId ? 'edit_note' : 'add_box'}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {editingProductId ? 'Edit Product Details' : 'Create New Boutique Product'}
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Direct real-time Firestore sync &bull; Updates /shop/[id] page
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Row 1: Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Loose Fit Hoodie, Modern African Suit"
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        // If switching to Fashion, suggest fashion sizes if empty
                        sizes:
                          e.target.value === 'Fashion' && formData.sizes.length === 0
                            ? ['S', 'M', 'L', 'XL']
                            : formData.sizes,
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: SubCategory, Badge Tag & Status Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Sub-Category
                  </label>
                  <input
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Men's Clothing, Audio"
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Badge Tag (Pill Tag)
                  </label>
                  <input
                    value={formData.badgeTag}
                    onChange={(e) => setFormData({ ...formData, badgeTag: e.target.value })}
                    placeholder="e.g. Man Fashion, Beauty &amp; Nails"
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Ribbon Badge
                  </label>
                  <input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Popular Choice, Trending"
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    type="text"
                  />
                </div>
              </div>

              {/* Row 3: Pricing & Remaining Stock Quantity */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Price USD ($) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.priceUSD}
                    onChange={(e) => {
                      const usd = Number(e.target.value);
                      setFormData({
                        ...formData,
                        priceUSD: usd,
                        priceBIF: Math.round(usd * 3000),
                      });
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Price BIF (Francs) *
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.priceBIF}
                    onChange={(e) => setFormData({ ...formData, priceBIF: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Remaining in Stock *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setFormData({
                        ...formData,
                        stockQuantity: qty,
                        inStock: qty > 0,
                      });
                    }}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500 font-semibold text-blue-700"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 h-9 px-3 bg-white rounded-lg border border-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-zinc-800">Item In Stock</span>
                  </label>
                </div>
              </div>

              {/* Row 4: Fashion Sizes (Crucial for Fashion Products) */}
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">
                      straighten
                    </span>
                    <label className="text-xs font-semibold text-zinc-900">
                      Product Sizes (Crucial for Fashion &amp; Sized Items)
                    </label>
                  </div>
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-zinc-400 font-mono">Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes(PRESET_SIZES.fashionApparel)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-medium cursor-pointer"
                    >
                      S-XXL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes(PRESET_SIZES.fashionShoes)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-medium cursor-pointer"
                    >
                      EU Shoes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes(PRESET_SIZES.nails)}
                      className="px-2 py-0.5 rounded bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-medium cursor-pointer"
                    >
                      Nail Kits
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sizes: [] })}
                      className="px-2 py-0.5 rounded bg-white hover:bg-rose-50 border border-zinc-200 text-rose-600 font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Current Sizes Chips */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] p-2 rounded-lg bg-white border border-zinc-200">
                  {formData.sizes.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">
                      No specific sizes assigned. (Click a preset above or add custom size below)
                    </span>
                  ) : (
                    formData.sizes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-medium"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(s)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Size Input */}
                <div className="flex items-center gap-2">
                  <input
                    value={formData.newSizeInput}
                    onChange={(e) => setFormData({ ...formData, newSizeInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                    placeholder="Add custom size (e.g. XXL, 42 EU, Custom Tailored) and press Enter"
                    className="flex-1 h-8 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500"
                    type="text"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-medium cursor-pointer"
                  >
                    Add Size
                  </button>
                </div>
              </div>

              {/* Row 5: Images & Gallery Strip (Analyzed from /shop/[id] page) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-zinc-700">
                    Main Image URL *
                  </label>
                  <label className="relative overflow-hidden cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg transition-colors border border-blue-200">
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    <span>Upload Image (ImgBB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMainImage}
                      disabled={isUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0 shadow-xs flex items-center justify-center">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/shop/african-suit.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-zinc-400 text-xl">image</span>
                    )}
                  </div>
                  <input
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    type="text"
                  />
                </div>

                {/* Gallery Images Strip for Carousel Thumbnails */}
                <div className="pt-2">
                  <div className="text-[11px] font-medium text-zinc-600 mb-1.5 flex items-center justify-between">
                    <span>Gallery Carousel Images (Used for thumbnail strip on product details page):</span>
                    <label className="relative overflow-hidden cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md transition-colors border border-blue-200">
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      <span>Upload Gallery Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadGalleryImages}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {formData.gallery.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-300 bg-zinc-100 group shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery image ${index + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/shop/african-suit.jpg';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      value={formData.newGalleryUrl}
                      onChange={(e) => setFormData({ ...formData, newGalleryUrl: e.target.value })}
                      placeholder="Add another gallery image URL..."
                      className="flex-1 h-8 px-3 rounded-lg border border-zinc-200 bg-white font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500"
                      type="text"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-medium text-zinc-700 cursor-pointer"
                    >
                      + Add to Gallery
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 6: Seller & Description & Fit */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Seller / Store Name
                  </label>
                  <input
                    value={formData.seller}
                    onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                    placeholder="e.g. ELIMI Apparel &amp; NextGen Studio"
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs"
                    type="text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Product Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe materials, texture, craftsmanship..."
                    className="w-full p-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Description &amp; Fit (Accordion content on product details page)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.descriptionFit}
                    onChange={(e) => setFormData({ ...formData, descriptionFit: e.target.value })}
                    placeholder="e.g. Loose fit: A roomy silhouette with ample space through chest and arms..."
                    className="w-full p-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-500 shadow-xs resize-none"
                  />
                </div>
              </div>

              {/* Row 7: Shipping Details Accordion Fields */}
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <div className="text-xs font-semibold text-zinc-800">
                  Shipping Specifications (Product Details Page 2x2 Grid)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Discount</label>
                    <input
                      value={formData.shippingDiscount}
                      onChange={(e) => setFormData({ ...formData, shippingDiscount: e.target.value })}
                      className="w-full h-8 px-2 rounded border border-zinc-200 bg-white text-xs"
                      placeholder="Disc 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Package Type</label>
                    <input
                      value={formData.shippingPackageType}
                      onChange={(e) => setFormData({ ...formData, shippingPackageType: e.target.value })}
                      className="w-full h-8 px-2 rounded border border-zinc-200 bg-white text-xs"
                      placeholder="Regular Package"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Delivery Time</label>
                    <input
                      value={formData.shippingDeliveryTime}
                      onChange={(e) => setFormData({ ...formData, shippingDeliveryTime: e.target.value })}
                      className="w-full h-8 px-2 rounded border border-zinc-200 bg-white text-xs"
                      placeholder="2-3 Working Days"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Estimated Arrival</label>
                    <input
                      value={formData.shippingEstimatedArrival}
                      onChange={(e) => setFormData({ ...formData, shippingEstimatedArrival: e.target.value })}
                      className="w-full h-8 px-2 rounded border border-zinc-200 bg-white text-xs"
                      placeholder="10 - 12 October 2024"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-medium text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving to Firestore...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                        <span>{editingProductId ? 'Save Changes' : 'Create Product'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Categories</h2>
              <p className="text-xs text-zinc-500">Manage categories for shop items</p>
            </div>
            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              + New Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col group hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="relative w-full h-32 rounded-lg bg-zinc-100 overflow-hidden mb-3">
                  {cat.imageUrl ? (
                    <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEditCategory(cat)} className="w-8 h-8 rounded-full bg-white text-blue-600 shadow-sm flex items-center justify-center hover:bg-blue-50 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => setDeleteConfirmCategory(cat)} className="w-8 h-8 rounded-full bg-white text-rose-600 shadow-sm flex items-center justify-center hover:bg-rose-50 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-zinc-900 text-sm leading-tight">{cat.name}</h3>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">Ord: {cat.order}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">{cat.description || 'No description provided.'}</p>
                  <div className="mt-auto pt-3 border-t border-zinc-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-zinc-700 bg-zinc-100 px-2 py-1 rounded-md">{cat.slug}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">category</span>
                {editingCategoryId ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-full hover:bg-zinc-100 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Name *</label>
                <input required type="text" value={catFormData.name} onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm" placeholder="e.g. Footwear" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Slug *</label>
                <input required type="text" value={catFormData.slug} onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm" placeholder="e.g. footwear" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input type="text" value={catFormData.imageUrl} onChange={(e) => setCatFormData({ ...catFormData, imageUrl: e.target.value })} className="flex-1 w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm" placeholder="https://..." />
                  <label className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap">
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleUploadCategoryImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {catFormData.imageUrl && (
                  <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                    <img
                      src={catFormData.imageUrl}
                      alt="Category preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
                <textarea rows={2} value={catFormData.description} onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })} className="w-full py-2 px-3 rounded-lg border border-zinc-200 text-sm resize-none" placeholder="Description..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Display Order</label>
                <input type="number" value={catFormData.order} onChange={(e) => setCatFormData({ ...catFormData, order: Number(e.target.value) })} className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-sm" />
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold">{isSubmitting ? 'Saving...' : 'Save Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY DELETE CONFIRMATION */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border-t-4 border-rose-500">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-zinc-600 mb-6">Are you sure you want to delete <span className="font-semibold">{deleteConfirmCategory.name}</span>? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirmCategory(null)} className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 font-medium text-sm hover:bg-zinc-200 transition-colors">Cancel</button>
              <button onClick={executeDeleteCategory} disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 transition-colors">{isSubmitting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
