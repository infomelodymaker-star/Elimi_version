'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  RentalItem,
  RentalCategory,
  useRealtimeRentalCategories,
  useRealtimeRentalItems,
  addRentalCategory,
  updateRentalCategory,
  deleteRentalCategory,
  addRentalItem,
  updateRentalItem,
  deleteRentalItem,
  seedInitialRentalsIfEmpty,
} from '@/lib/firestore-rentals';
import { uploadImageSafely } from '@/lib/image-upload';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

const BADGE_PRESETS = ['Popular', 'Back in Stock!', 'New', 'Featured', 'Luxury', 'Event Pro', 'Populaire', 'Coup de cœur'];
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'S/M', 'M/L', 'L/XL', 'Unique', 'Standard'];

export default function AllocationsManagementView() {
  const { categories, loading: loadingCategories, isLive: categoriesLive } = useRealtimeRentalCategories();
  const { items, loading: loadingItems, isLive: itemsLive } = useRealtimeRentalItems();

  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'item' | 'category'; id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recentlyUploadedUrls, setRecentlyUploadedUrls] = useState<string[]>([]);

  // Toast
  const showToast = (message: string, type: ToastInfo['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Item Form State
  const [itemFormData, setItemFormData] = useState<{
    id?: string;
    name: string;
    brand: string;
    categoryId: string;
    categoryName: string;
    pricePerDay: number;
    originalPrice: number;
    badge: string;
    imageUrl: string;
    gallery: string[];
    sizes: string[];
    description: string;
    details: string;
    available: boolean;
  }>({
    name: '',
    brand: '',
    categoryId: '',
    categoryName: '',
    pricePerDay: 50,
    originalPrice: 200,
    badge: '',
    imageUrl: '',
    gallery: [],
    sizes: ['S/M', 'M/L'],
    description: '',
    details: '',
    available: true,
  });

  // State for manual gallery photo URL input and upload progress
  const [newGalleryPhotoUrl, setNewGalleryPhotoUrl] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

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

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'All' || item.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && item.available) ||
        (statusFilter === 'unavailable' && !item.available);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  // Open Create Item Modal
  const handleOpenCreateItem = () => {
    setEditingItemId(null);
    setRecentlyUploadedUrls([]);
    const defaultCat = categories.length > 0 ? categories[0] : null;
    setItemFormData({
      name: '',
      brand: '',
      categoryId: defaultCat?.id || '',
      categoryName: defaultCat?.name || '',
      pricePerDay: 55,
      originalPrice: 220,
      badge: '',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
      gallery: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
      ],
      sizes: ['S/M', 'M/L'],
      description: 'Exclusive designer outfit available for VIP and ceremonial rentals.',
      details: 'Professional dry cleaning included. Free returns managed by our team.',
      available: true,
    });
    setIsItemModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item: RentalItem) => {
    setEditingItemId(item.id);
    setRecentlyUploadedUrls([]);
    setItemFormData({
      id: item.id,
      name: item.name,
      brand: item.brand,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      pricePerDay: item.pricePerDay,
      originalPrice: item.originalPrice || item.pricePerDay * 4,
      badge: item.badge || '',
      imageUrl: item.imageUrl,
      gallery: item.gallery && item.gallery.length > 0 ? item.gallery : [item.imageUrl],
      sizes: item.sizes || ['Unique'],
      description: item.description || '',
      details: item.details || '',
      available: item.available !== false,
    });
    setIsItemModalOpen(true);
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name.trim() || !itemFormData.categoryId) {
      showToast('Item name and category are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === itemFormData.categoryId);
      const payload = {
        ...itemFormData,
        categoryName: selectedCat?.name || itemFormData.categoryName,
        rating: 4.9,
        reviewsCount: 15,
        currency: '$',
      };

      if (editingItemId) {
        await updateRentalItem(editingItemId, payload);
        showToast(`Item "${itemFormData.name}" updated successfully!`);
      } else {
        await addRentalItem(payload);
        showToast(`Item "${itemFormData.name}" added to rental catalog!`);
      }
      setIsItemModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving rental item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Create Category Modal
  const handleOpenCreateCategory = () => {
    setEditingCategoryId(null);
    setCatFormData({
      name: '',
      slug: '',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      description: 'Exclusive pieces and specialized rental equipment.',
      order: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: RentalCategory) => {
    setEditingCategoryId(cat.id);
    setCatFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug || '',
      imageUrl: cat.imageUrl,
      description: cat.description || '',
      order: cat.order || 1,
    });
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug =
        catFormData.slug.trim() ||
        catFormData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const payload = {
        ...catFormData,
        slug,
      };

      if (editingCategoryId) {
        await updateRentalCategory(editingCategoryId, payload);
        showToast(`Category "${catFormData.name}" updated successfully!`);
      } else {
        await addRentalCategory(payload);
        showToast(`Category "${catFormData.name}" created successfully!`);
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    try {
      if (deleteConfirm.type === 'item') {
        await deleteRentalItem(deleteConfirm.id);
        showToast('Item deleted successfully!');
      } else {
        await deleteRentalCategory(deleteConfirm.id);
        showToast('Category deleted successfully!');
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      showToast(err.message || 'Error deleting item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seed default data
  const handleSeedData = async () => {
    setIsReseeding(true);
    try {
      const success = await seedInitialRentalsIfEmpty();
      if (success) {
        showToast('Catalog initialized successfully in Firestore!');
      } else {
        showToast('Data already exists or sync verified', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Initialization error', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  // Upload Cover Image via ImgBB
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageSafely(file, 'allocation-cover');
      if (res.success && res.url) {
        const uploadedUrl = res.url;
        setRecentlyUploadedUrls((prev) => [uploadedUrl, ...prev]);
        setItemFormData((prev) => ({
          ...prev,
          imageUrl: uploadedUrl,
          gallery: [uploadedUrl, ...prev.gallery.filter((u) => u !== uploadedUrl)],
        }));
        if (res.source === 'imgbb') {
          showToast('Cover photo uploaded to ImgBB successfully!');
        } else {
          showToast('Cover photo saved successfully!', 'info');
        }
      } else {
        showToast(res.warning || 'Failed to upload photo', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading photo', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Upload Multi-Photos to Gallery via ImgBB
  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Convert to Array immediately
    const files = Array.from(fileList);
    setIsUploadingGallery(true);
    const addedUrls: string[] = [];
    let imgbbSuccessCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadImageSafely(file, `allocation-gallery-${i}`);
        if (res.success && res.url) {
          addedUrls.push(res.url);
          if (res.source === 'imgbb') {
            imgbbSuccessCount++;
          }
        }
      }

      if (addedUrls.length > 0) {
        // Track newly uploaded photos so they are highlighted in the preview grid
        setRecentlyUploadedUrls((prev) => [...addedUrls, ...prev]);

        setItemFormData((prev) => {
          // Prepend newly uploaded photos to the front of the gallery so they are immediately visible
          const remainingExisting = prev.gallery.filter((u) => !addedUrls.includes(u));
          const combined = [...addedUrls, ...remainingExisting];
          return {
            ...prev,
            // Set the primary cover to the newly uploaded image so the user immediately sees it
            imageUrl: addedUrls[0] || prev.imageUrl || combined[0] || '',
            gallery: combined,
          };
        });

        if (imgbbSuccessCount > 0) {
          showToast(`${addedUrls.length} photo(s) uploaded to ImgBB and added to gallery!`);
        } else {
          showToast(`${addedUrls.length} photo(s) added to gallery!`);
        }
      } else {
        showToast('No photos could be processed', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error uploading gallery photos', 'error');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Add gallery image by URL
  const handleAddGalleryUrl = () => {
    const url = newGalleryPhotoUrl.trim();
    if (!url) return;
    if (!itemFormData.gallery.includes(url)) {
      setRecentlyUploadedUrls((prev) => [url, ...prev]);
      setItemFormData((prev) => ({
        ...prev,
        imageUrl: prev.imageUrl || url,
        gallery: [url, ...prev.gallery],
      }));
    }
    setNewGalleryPhotoUrl('');
    showToast('Photo added to gallery!');
  };

  // Remove photo from gallery
  const handleRemoveGalleryPhoto = (indexToRemove: number) => {
    setItemFormData((prev) => {
      const removedUrl = prev.gallery[indexToRemove];
      const updated = prev.gallery.filter((_, idx) => idx !== indexToRemove);
      let newCover = prev.imageUrl;
      if (prev.imageUrl === removedUrl) {
        newCover = updated[0] || '';
      }
      return {
        ...prev,
        imageUrl: newCover,
        gallery: updated,
      };
    });
    showToast('Photo removed from gallery');
  };

  // Set selected photo as main cover
  const handleSetAsCover = (url: string) => {
    setItemFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
    showToast('Set as primary cover photo', 'info');
  };

  // Category Image Upload via ImgBB
  const handleUploadCategoryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageSafely(file, 'allocation-category');
      if (res.success && res.url) {
        setCatFormData((prev) => ({ ...prev, imageUrl: res.url }));
        if (res.source === 'imgbb') {
          showToast('Category image uploaded to ImgBB!');
        } else {
          showToast('Category image saved!');
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

  return (
    <div className="space-y-8">
      {/* View Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                inventory_2
              </span>
            </span>
            <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
              Allocations &amp; Rental Management
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold border ${
                itemsLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-[#F8F9FA] text-[#64748B] border-[#0F172A]/8'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  itemsLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#64748B]'
                }`}
              />
              {itemsLive ? 'Firestore Live' : 'Offline / Sync'}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1.5 max-w-2xl">
            Manage rental garments, evening gala equipment, accessories, and staff available for hire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/allocations"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#0F172A] text-xs font-semibold transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>View Public Catalog</span>
          </Link>

          <button
            type="button"
            onClick={handleSeedData}
            disabled={isReseeding}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold transition-colors shadow-xs"
            title="Initialize or reseed demo sample data"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748B]">
              sync
            </span>
            <span>{isReseeding ? 'Syncing...' : 'Reset Demo'}</span>
          </button>

          {activeTab === 'items' ? (
            <button
              type="button"
              onClick={handleOpenCreateItem}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-xs font-semibold shadow-sm shadow-[#0B57FF]/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Item</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateCategory}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-xs font-semibold shadow-sm shadow-[#0B57FF]/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Category</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-[#0B57FF]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Items
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">checkroom</span>
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-[#0F172A] mt-2 leading-none">{items.length}</div>
          <div className="text-[12px] text-[#64748B] mt-1.5 border-l-2 border-[#0B57FF] pl-2">In rental catalog</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-[#0B57FF]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
              Categories
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">category</span>
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-[#0F172A] mt-2 leading-none">{categories.length}</div>
          <div className="text-[12px] text-[#64748B] mt-1.5 border-l-2 border-[#0B57FF] pl-2">Active departments</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
              Available
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-emerald-600 mt-2 leading-none">
            {items.filter((i) => i.available).length}
          </div>
          <div className="text-[12px] text-[#64748B] mt-1.5 border-l-2 border-emerald-500 pl-2">Ready for booking</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-[#0B57FF]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
              Avg Price / Day
            </span>
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">attach_money</span>
            </span>
          </div>
          <div className="font-display text-3xl font-bold text-[#0B57FF] mt-2 leading-none">
            ${items.length > 0
              ? Math.round(items.reduce((acc, cur) => acc + cur.pricePerDay, 0) / items.length)
              : 0}
          </div>
          <div className="text-[12px] text-[#64748B] mt-1.5 border-l-2 border-[#0B57FF] pl-2">Per rental day</div>
        </div>
      </div>

      {/* Tabs Switcher: Items vs Categories */}
      <div className="flex items-center justify-start border-b border-[#0F172A]/8 bg-white px-6 rounded-2xl shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`py-4 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'items'
                ? 'border-[#0B57FF] text-[#0B57FF]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">checkroom</span>
            <span>Rental Items ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-4 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#0B57FF] text-[#0B57FF]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            <span>Categories ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: ITEMS MANAGEMENT
         ========================================================================= */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-[18px] text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, brand or category..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] hover:bg-white focus:bg-white text-xs font-medium text-[#0F172A] border border-[#0F172A]/8 rounded-full focus:border-[#0B57FF] outline-none transition-all placeholder:text-[#64748B]"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-[#F8F9FA] hover:bg-white text-xs font-semibold text-[#0F172A] border border-[#0F172A]/8 rounded-full outline-none cursor-pointer focus:border-[#0B57FF] transition-all"
              >
                <option value="All">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 bg-[#F8F9FA] hover:bg-white text-xs font-semibold text-[#0F172A] border border-[#0F172A]/8 rounded-full outline-none cursor-pointer focus:border-[#0B57FF] transition-all"
              >
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-[#0F172A]">
                <thead className="bg-[#F8F9FA] border-b border-[#0F172A]/8 text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Item</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Rental Price</th>
                    <th className="px-5 py-3.5">Sizes</th>
                    <th className="px-5 py-3.5">Badge</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F172A]/8">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#64748B]">
                        No rental items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8F9FA]/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-12 h-14 rounded-xl overflow-hidden border border-[#0F172A]/8 bg-[#F8F9FA] shrink-0">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-[#0F172A] text-[13px]">{item.name}</div>
                              <div className="text-[#64748B] text-[11px] mt-0.5">{item.brand}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-medium text-[#0F172A]">
                          {item.categoryName}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-[#0B57FF] text-[13px]">
                            ${item.pricePerDay}.00 <span className="text-[#64748B] text-[11px] font-normal">/day</span>
                          </div>
                          {item.originalPrice && (
                            <div className="text-[#64748B] text-[10px]">
                              Retail: ${item.originalPrice}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {item.sizes?.map((sz) => (
                              <span
                                key={sz}
                                className="px-2 py-0.5 rounded-full bg-[#F8F9FA] text-[#0F172A] text-[10px] font-mono border border-[#0F172A]/8"
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          {item.badge ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="text-[#64748B]/40">—</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              item.available
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.available ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditItem(item)}
                              className="w-8 h-8 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#E0EBFF] text-[#64748B] hover:text-[#0B57FF] flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({ type: 'item', id: item.id, name: item.name })
                              }
                              className="w-8 h-8 rounded-full border border-[#0F172A]/8 bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CATEGORIES MANAGEMENT
         ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#0F172A]/8 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Rental Categories</h2>
              <p className="text-xs text-[#64748B]">Manage allocation departments</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 bg-[#0B57FF] text-white text-xs font-semibold rounded-full hover:bg-[#0B57FF]/90 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Category
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] overflow-hidden flex flex-col justify-between group hover:border-[#0B57FF]/30 transition-all"
              >
                <div className="relative aspect-[4/3] w-full bg-[#F8F9FA] overflow-hidden">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 250px"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0F172A]/70 text-white backdrop-blur-xs">
                    Order: #{cat.order || 1}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0B57FF] text-white shadow-sm shadow-[#0B57FF]/20">
                    {count} {count > 1 ? 'items' : 'item'}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-sm">{cat.name}</h3>
                    <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                      {cat.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#0F172A]/8">
                    <span className="text-[10px] font-mono text-[#64748B]">ID: {cat.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="w-7 h-7 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#E0EBFF] text-[#64748B] hover:text-[#0B57FF] flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit category"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })
                        }
                        className="w-7 h-7 rounded-full border border-[#0F172A]/8 bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT ITEM
         ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/40 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] border border-[#0F172A]/8 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F172A]/8 bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">checkroom</span>
                </span>
                <h2 className="text-base font-bold text-[#0F172A]">
                  {editingItemId ? 'Edit Rental Item' : 'Add Rental Item'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    placeholder="e.g. Dianne Striped Shirt"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Brand / Label
                  </label>
                  <input
                    type="text"
                    value={itemFormData.brand}
                    onChange={(e) => setItemFormData({ ...itemFormData, brand: e.target.value })}
                    placeholder="e.g. Musy Muse, Atelier Savile"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Rental Category *
                  </label>
                  <select
                    required
                    value={itemFormData.categoryId}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.id === e.target.value);
                      setItemFormData({
                        ...itemFormData,
                        categoryId: e.target.value,
                        categoryName: sel?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Badge / Tag
                  </label>
                  <select
                    value={itemFormData.badge}
                    onChange={(e) => setItemFormData({ ...itemFormData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none bg-white"
                  >
                    <option value="">No badge</option>
                    {BADGE_PRESETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Rental Price ($ / day) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={itemFormData.pricePerDay}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, pricePerDay: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Estimated Retail Value ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={itemFormData.originalPrice}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* Photo Cover & Multi-Photo Gallery via ImgBB */}
              <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-zinc-800 text-xs">
                    Item Photos (ImgBB &amp; Multi-angle Gallery)
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {itemFormData.gallery.length} photo(s) total
                  </span>
                </div>

                {/* Primary Cover Photo Row */}
                <div>
                  <div className="text-[11px] font-semibold text-zinc-600 mb-1">
                    Primary Cover Photo
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0 flex items-center justify-center shadow-2xs">
                      {itemFormData.imageUrl ? (
                        <img
                          src={itemFormData.imageUrl}
                          alt="Cover preview"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-zinc-400 text-lg">image</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={itemFormData.imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItemFormData({
                          ...itemFormData,
                          imageUrl: val,
                          gallery: val && !itemFormData.gallery.includes(val) ? [val, ...itemFormData.gallery] : itemFormData.gallery,
                        });
                      }}
                      placeholder="/uploads/... or image URL"
                      className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none bg-white text-xs font-mono"
                    />
                    <label className={`px-3 py-2 rounded-lg ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs transition-colors text-xs`}>
                      <span className={`material-symbols-outlined text-[16px] ${isUploading ? 'animate-spin' : ''}`}>
                        {isUploading ? 'progress_activity' : 'cloud_upload'}
                      </span>
                      <span>{isUploading ? 'Uploading...' : 'Upload Cover'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleUploadCoverImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Multi-Photo Gallery Upload Row */}
                <div className="pt-1 border-t border-zinc-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Add Secondary &amp; Gallery Photos
                    </span>
                    <label className={`px-2.5 py-1 rounded-md ${isUploadingGallery ? 'bg-zinc-300 cursor-not-allowed' : 'bg-zinc-200 hover:bg-zinc-300'} text-zinc-800 font-medium cursor-pointer shrink-0 flex items-center gap-1 text-[11px] transition-colors`}>
                      <span className={`material-symbols-outlined text-[14px] ${isUploadingGallery ? 'animate-spin' : ''}`}>
                        {isUploadingGallery ? 'progress_activity' : 'add_photo_alternate'}
                      </span>
                      <span>{isUploadingGallery ? 'Uploading...' : 'Select multiple photos'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingGallery}
                        onChange={handleUploadGalleryImages}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Add photo by direct URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGalleryPhotoUrl}
                      onChange={(e) => setNewGalleryPhotoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGalleryUrl();
                        }
                      }}
                      placeholder="Add photo by direct URL (https://...)"
                      className="flex-1 px-2.5 py-1.5 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold border border-zinc-200 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Previews Grid */}
                {itemFormData.gallery.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2">
                      Photos Preview ({itemFormData.gallery.length}) — First photo or starred photo serves as primary cover
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {itemFormData.gallery.map((photoUrl, idx) => {
                        const isCurrentCover = itemFormData.imageUrl === photoUrl;
                        const isNewlyAdded = recentlyUploadedUrls.includes(photoUrl);

                        return (
                          <div
                            key={`${photoUrl.slice(0, 32)}-${idx}`}
                            className={`relative group rounded-lg overflow-hidden border aspect-[3/4] bg-zinc-200 transition-all ${
                              isCurrentCover
                                ? 'border-blue-600 ring-2 ring-blue-500/30'
                                : isNewlyAdded
                                ? 'border-emerald-500 ring-2 ring-emerald-400/20'
                                : 'border-zinc-300'
                            }`}
                          >
                            <img
                              src={photoUrl}
                              alt={`Photo ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Graceful fallback if image fails to load
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600';
                              }}
                              className="w-full h-full object-cover"
                            />

                            {/* Cover Badge */}
                            {isCurrentCover && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white shadow-xs">
                                Cover
                              </span>
                            )}

                            {/* New Badge */}
                            {isNewlyAdded && !isCurrentCover && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shadow-xs">
                                New
                              </span>
                            )}

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              {!isCurrentCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(photoUrl)}
                                  title="Set as primary cover"
                                  className="p-1 rounded bg-white text-blue-600 hover:bg-blue-50 shadow-xs cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[15px]">star</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryPhoto(idx)}
                                title="Remove photo"
                                className="p-1 rounded bg-white text-rose-600 hover:bg-rose-50 shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sizing presets toggle */}
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Available Sizes (click to toggle)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SIZE_PRESETS.map((sz) => {
                    const active = itemFormData.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const updated = active
                            ? itemFormData.sizes.filter((s) => s !== sz)
                            : [...itemFormData.sizes, sz];
                          setItemFormData({ ...itemFormData, sizes: updated });
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Item Description
                </label>
                <textarea
                  rows={2}
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                  placeholder="Fit details, fabric notes, styling advice..."
                />
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={itemFormData.available}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, available: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300"
                />
                <label htmlFor="availCheck" className="font-semibold text-zinc-700 cursor-pointer">
                  Enable for immediate rental booking
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F172A]/8">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white font-semibold text-xs shadow-sm shadow-[#0B57FF]/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT CATEGORY
         ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/40 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] border border-[#0F172A]/8 overflow-hidden my-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F172A]/8 bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">category</span>
                </span>
                <h2 className="text-base font-bold text-[#0F172A]">
                  {editingCategoryId ? 'Edit Rental Category' : 'New Rental Category'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  placeholder="e.g. Office Wear, Gala & Evening..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Category Cover Photo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={catFormData.imageUrl}
                    onChange={(e) => setCatFormData({ ...catFormData, imageUrl: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none font-mono text-xs"
                  />
                  <label className={`px-4 py-2 rounded-full ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#0B57FF] hover:bg-[#0B57FF]/90'} text-white font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm shadow-[#0B57FF]/20 transition-all`}>
                    <span className={`material-symbols-outlined text-[16px] ${isUploading ? 'animate-spin' : ''}`}>
                      {isUploading ? 'progress_activity' : 'cloud_upload'}
                    </span>
                    <span>{isUploading ? 'Uploading...' : 'Upload Cover'}</span>
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
                  <div className="mt-2 relative w-16 h-20 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
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
                <label className="block font-bold text-zinc-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={catFormData.description}
                  onChange={(e) =>
                    setCatFormData({ ...catFormData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                  placeholder="Overview of the pieces in this rental department..."
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Display Order in Carousel
                </label>
                <input
                  type="number"
                  min={1}
                  value={catFormData.order}
                  onChange={(e) =>
                    setCatFormData({ ...catFormData, order: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F172A]/8">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#0F172A]/8 text-[#64748B] hover:text-[#0F172A] font-semibold hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white font-semibold shadow-sm shadow-[#0B57FF]/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#0F172A]/8 shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-[#0F172A] text-sm">
                Confirm Deletion
              </h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-[#0F172A]">&quot;{deleteConfirm.name}&quot;</strong>? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-full border border-[#0F172A]/8 text-[#64748B] hover:text-[#0F172A] font-semibold text-xs hover:bg-[#F8F9FA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#E0EBFF] text-[#0B57FF] border-[#0B57FF]/30'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-white text-[#0F172A] border-[#0F172A]/8'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success'
              ? 'check_circle'
              : toast.type === 'error'
              ? 'error'
              : 'info'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
