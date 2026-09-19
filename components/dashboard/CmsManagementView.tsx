'use client';

import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImageSafely } from '@/lib/image-upload';
import Image from 'next/image';
import {
  CmsPage,
  CmsSection,
  INITIAL_CMS_PAGES,
  CMS_STORAGE_KEY,
  CMS_SYNC_EVENT,
  saveCmsPageToFirestore,
  cleanObjectForFirestore,
} from '@/lib/firestore-cms';
import {
  useRealtimeEventServices,
  EventServiceItem,
  addEventServiceToFirestore,
  updateEventServiceInFirestore,
  deleteEventServiceFromFirestore,
  seedInitialEventServices,
} from '@/lib/firestore-event-services';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from '@/lib/firestore-sync';
import {
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Check,
  X,
  Upload,
  Eye,
  EyeOff,
  Car,
  Users,
  ShieldCheck,
  Video,
  Zap,
  Utensils,
  FileText,
  DollarSign,
  RefreshCw,
  MapPin,
} from 'lucide-react';

export default function CmsManagementView() {
  const [activeTab, setActiveTab] = useState<'event-services' | 'pages'>('event-services');
  
  // Pages State
  const [pages, setPages] = useState<CmsPage[]>(() =>
    getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES)
  );
  const [loading, setLoading] = useState(false);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUploadingImgBB, setIsUploadingImgBB] = useState(false);

  // Event Services Realtime hook
  const { services: eventServices, isLive: isEventServicesLive } = useRealtimeEventServices();
  
  // Event Service Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EventServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<EventServiceItem>>({
    title: '',
    description: '',
    unitPrice: 100,
    defaultQuantity: 1,
    checkedByDefault: false,
    subtext: '',
    image: '',
    enabled: true,
    tags: [{ iconType: 'zap', label: 'VIP Feature' }],
  });

  useEffect(() => {
    // 1. Custom sync listener
    const handleSync = () => {
      const updated = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
      setPages(updated);
    };

    window.addEventListener(CMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Safe live subscription
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onSnapshot(
        collection(db, 'cms_pages'),
        (snapshot) => {
          const liveMap = new Map<string, CmsPage>();
          snapshot.forEach((docSnap) => {
            liveMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as CmsPage);
          });

          const currentStored = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);

          const merged: CmsPage[] = INITIAL_CMS_PAGES.map((initPage) => {
            const fsDoc = liveMap.get(initPage.id);
            const localDoc = currentStored.find((p) => p.id === initPage.id);
            return fsDoc || localDoc || initPage;
          });

          liveMap.forEach((fsDoc, id) => {
            if (!merged.some((p) => p.id === id)) {
              merged.push(fsDoc);
            }
          });

          saveStoredItems(CMS_STORAGE_KEY, merged);
          setPages(merged);
          setLoading(false);
        },
        (err) => {
          console.warn('CMS onSnapshot note:', err?.message || err);
          setLoading(false);
        }
      );
    } catch {
      // Retain cached state
    }

    return () => {
      window.removeEventListener(CMS_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdatePage = async (pageId: string, updatedPage: CmsPage) => {
    setIsSaving(true);
    try {
      await saveCmsPageToFirestore(updatedPage);
      showToast(`CMS section "${updatedPage.title || pageId}" updated & saved to Firestore!`, 'success');
    } catch (err: any) {
      console.error('Error saving CMS page to Firestore:', err);
      showToast(`Error saving to Firestore: ${err?.message || 'Check database connection'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, pageId: string, sectionIdx: number, field: 'backgroundImage' | 'images' | 'showcaseImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImgBB(true);
    showToast('Uploading image...', 'success');
    
    try {
      const result = await uploadImageSafely(file);
      if (result.success && result.url) {
        const newPages = [...pages];
        const p = newPages.find(p => p.id === pageId)!;
        if (field === 'backgroundImage') {
          p.sections[sectionIdx].content.backgroundImage = result.url;
          p.sections[sectionIdx].content.image = result.url;
        } else if (field === 'showcaseImage') {
          p.sections[sectionIdx].content.showcaseImage = result.url;
          p.sections[sectionIdx].content.image = result.url;
        } else if (field === 'images') {
          const currentImages = p.sections[sectionIdx].content.images || [];
          p.sections[sectionIdx].content.images = [...currentImages, result.url];
        }
        setPages(newPages);
        
        // Auto-save to Firestore so changes are immediately live on public site
        try {
          await saveCmsPageToFirestore(p);
          showToast('Image uploaded and CMS saved live!', 'success');
        } catch (fsErr) {
          console.warn('Auto-save to Firestore:', fsErr);
          showToast('Image uploaded successfully!', 'success');
        }
      } else {
        showToast(result.warning || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImgBB(false);
      e.target.value = '';
    }
  };

  const handleItemFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    pageId: string,
    sectionIdx: number,
    itemIdx: number,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImgBB(true);
    showToast('Uploading file...', 'success');

    try {
      const result = await uploadImageSafely(file);
      if (result.success && result.url) {
        const newPages = [...pages];
        const p = newPages.find((p) => p.id === pageId)!;
        if (p.sections[sectionIdx]?.content?.items?.[itemIdx]) {
          p.sections[sectionIdx].content.items[itemIdx][fieldName] = result.url;
        }
        setPages(newPages);
        
        // Auto-save to Firestore so changes are immediately live on public site
        try {
          await saveCmsPageToFirestore(p);
          showToast('File uploaded and CMS updated live!', 'success');
        } catch (fsErr) {
          console.warn('Auto-save item to Firestore:', fsErr);
          showToast('File uploaded successfully!', 'success');
        }
      } else {
        showToast(result.warning || 'Upload failed', 'error');
      }
    } catch {
      showToast('Error uploading file', 'error');
    } finally {
      setIsUploadingImgBB(false);
      e.target.value = '';
    }
  };

  // Event Services Handlers
  const handleOpenAddServiceModal = () => {
    setEditingService(null);
    setServiceFormData({
      title: '',
      description: '',
      unitPrice: 100,
      defaultQuantity: 1,
      checkedByDefault: false,
      subtext: '',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80',
      enabled: true,
      tags: [
        { iconType: 'users', label: 'Uniformed Staff' },
        { iconType: 'shield', label: 'Certified' },
      ],
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditServiceModal = (service: EventServiceItem) => {
    setEditingService(service);
    setServiceFormData({
      title: service.title,
      description: service.description,
      unitPrice: service.unitPrice,
      defaultQuantity: service.defaultQuantity,
      checkedByDefault: service.checkedByDefault,
      subtext: service.subtext,
      image: service.image,
      enabled: service.enabled,
      tags: service.tags ? [...service.tags] : [],
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEventService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.title?.trim()) {
      showToast('Service title is required', 'error');
      return;
    }

    try {
      if (editingService) {
        await updateEventServiceInFirestore(editingService.id, {
          title: serviceFormData.title.trim(),
          description: serviceFormData.description || '',
          unitPrice: Number(serviceFormData.unitPrice) || 0,
          defaultQuantity: Number(serviceFormData.defaultQuantity) || 1,
          checkedByDefault: Boolean(serviceFormData.checkedByDefault),
          subtext: serviceFormData.subtext || '',
          image: serviceFormData.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80',
          enabled: serviceFormData.enabled !== false,
          tags: serviceFormData.tags || [],
        });
        showToast('Service updated successfully!');
      } else {
        const newId = `service-${Date.now()}`;
        const newService: EventServiceItem = {
          id: newId,
          title: serviceFormData.title.trim(),
          description: serviceFormData.description || '',
          unitPrice: Number(serviceFormData.unitPrice) || 0,
          defaultQuantity: Number(serviceFormData.defaultQuantity) || 1,
          checkedByDefault: Boolean(serviceFormData.checkedByDefault),
          subtext: serviceFormData.subtext || '',
          image: serviceFormData.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80',
          enabled: serviceFormData.enabled !== false,
          tags: serviceFormData.tags || [],
        };
        await addEventServiceToFirestore(newService);
        showToast('New event service added!');
      }
      setIsEventModalOpen(false);
    } catch {
      showToast('Failed to save service', 'error');
    }
  };

  const handleDeleteService = async (serviceId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteEventServiceFromFirestore(serviceId);
        showToast(`Service "${title}" deleted`);
      } catch {
        showToast('Failed to delete service', 'error');
      }
    }
  };

  const handleToggleServiceEnabled = async (service: EventServiceItem) => {
    try {
      const nextState = !service.enabled;
      await updateEventServiceInFirestore(service.id, { enabled: nextState });
      showToast(nextState ? `Service "${service.title}" enabled` : `Service "${service.title}" disabled`);
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImgBB(true);
    showToast('Uploading image...', 'success');
    try {
      const result = await uploadImageSafely(file);
      if (result.success && result.url) {
        setServiceFormData((prev) => ({ ...prev, image: result.url }));
        showToast('Image uploaded!');
      } else {
        showToast(result.warning || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImgBB(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading CMS...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* CMS Header & Top Navigation Switcher */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0EBFF] text-[#0B57FF] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-time Dynamic CMS</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Content & Services Management</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage & customize the &quot;Build Your Event&quot; dynamic services catalog and page contents across the platform.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('event-services')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'event-services'
                ? 'bg-white text-[#0B57FF] shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#0B57FF]" />
            <span>Build Your Event Services</span>
            <span className="bg-[#E0EBFF] text-[#0B57FF] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
              {eventServices.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pages'
                ? 'bg-white text-[#0B57FF] shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>Page Sections</span>
            <span className="bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
              {pages.length}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: BUILD YOUR PERFECT EVENT SERVICES MANAGEMENT
         ========================================================================= */}
      {activeTab === 'event-services' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div>
              <h2 className="font-semibold text-zinc-900 text-sm">Event Builder Custom Services</h2>
              <p className="text-xs text-zinc-500">
                Services shown on the homepage interactive bundle calculator. Live synced to Firestore database.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddServiceModal}
                className="bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-[#0B57FF]/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event Service</span>
              </button>
            </div>
          </div>

          {/* Event Services Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  service.enabled !== false ? 'border-zinc-200' : 'border-zinc-200/60 opacity-60 bg-zinc-50/50'
                }`}
              >
                <div>
                  {/* Service Card Top: Thumbnail + Status */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                      <Image
                        src={service.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80'}
                        alt={service.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-zinc-900 text-sm truncate">{service.title}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            service.enabled !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {service.enabled !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{service.description}</p>
                    </div>
                  </div>

                  {/* Price & Defaults Info */}
                  <div className="flex items-center justify-between py-2 border-y border-zinc-100 my-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Unit Price: </span>
                      <span className="font-bold text-[#0B57FF] text-sm">${service.unitPrice}</span>
                      {service.subtext && <span className="text-zinc-400 text-[11px] ml-1">({service.subtext})</span>}
                    </div>
                    <div>
                      <span className="text-zinc-500">Default Qty: </span>
                      <span className="font-semibold text-zinc-800 font-mono">{service.defaultQuantity}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {service.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md"
                        >
                          <span>{tag.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => handleToggleServiceEnabled(service)}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                    title={service.enabled !== false ? 'Disable Service' : 'Enable Service'}
                  >
                    {service.enabled !== false ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Show</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditServiceModal(service)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#0B57FF] bg-[#E0EBFF] hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id, service.title)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PAGE SECTIONS CMS
         ========================================================================= */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          {pages.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-zinc-300 mb-2">find_in_page</span>
              <h3 className="text-sm font-semibold text-zinc-900">No Pages Found</h3>
              <p className="text-xs text-zinc-500 mt-1">Add CMS pages in Firestore to manage content here.</p>
            </div>
          ) : (
            pages.map((page) => (
              <div key={page.id} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden transition-all">
                {/* Page Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors"
                  onClick={() => setExpandedPageId(expandedPageId === page.id ? null : page.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">article</span>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{page.title}</h3>
                      <p className="text-xs text-zinc-500">/{page.slug} • Last updated: {new Date(page.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-zinc-400 transition-transform ${expandedPageId === page.id ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>

                {/* Page Content Builder */}
                {expandedPageId === page.id && (
                  <div className="p-4 border-t border-zinc-200 space-y-6">
                    {page.sections.map((section, idx) => (
                      <div key={section.id} className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-semibold text-zinc-700 capitalize">{section.type} Section</h4>
                        </div>
                        
                        {/* 1. HERO SECTION */}
                        {section.type === 'hero' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Badge / Tag (Optional)</label>
                                <input
                                  type="text"
                                  value={section.content.badge || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.badge = e.target.value;
                                    setPages(newPages);
                                  }}
                                  placeholder="e.g. Premier Printing Hub"
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                              {section.content.cardBadge !== undefined && (
                                <div>
                                  <label className="block text-xs font-medium text-zinc-600 mb-1">Card Badge (Optional)</label>
                                  <input
                                    type="text"
                                    value={section.content.cardBadge || ''}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find(p => p.id === page.id)!;
                                      p.sections[idx].content.cardBadge = e.target.value;
                                      setPages(newPages);
                                    }}
                                    placeholder="e.g. Villas & Penthouses"
                                    className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Headline</label>
                              <input
                                type="text"
                                value={section.content.headline || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.headline = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Subheadline / Paragraph</label>
                              <textarea
                                value={section.content.subheadline || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.subheadline = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                rows={2}
                              />
                            </div>

                            {/* Background / Main Image */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-zinc-600">
                                  {section.content.showcaseImage !== undefined ? 'Showcase / Hero Image URL' : 'Background Image URL'}
                                </label>
                                <div className="relative overflow-hidden cursor-pointer flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, page.id, idx, section.content.showcaseImage !== undefined ? 'showcaseImage' : 'backgroundImage')}
                                    disabled={isUploadingImgBB}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                value={section.content.showcaseImage || section.content.backgroundImage || section.content.image || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  if (p.sections[idx].content.showcaseImage !== undefined) {
                                    p.sections[idx].content.showcaseImage = e.target.value;
                                  } else {
                                    p.sections[idx].content.backgroundImage = e.target.value;
                                    p.sections[idx].content.image = e.target.value;
                                  }
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                placeholder="https://..."
                              />
                              {/* Live Image Preview */}
                              {(section.content.showcaseImage || section.content.backgroundImage || section.content.image) && (
                                <div className="mt-2 relative rounded-lg border border-zinc-200 overflow-hidden bg-zinc-100 max-w-sm h-32 flex items-center justify-center">
                                  <img
                                    src={section.content.showcaseImage || section.content.backgroundImage || section.content.image}
                                    alt="Hero Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Background Video URL for Hero */}
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Background Video URL (MP4 / WebM)</label>
                              <input
                                type="text"
                                value={section.content.backgroundVideoUrl || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.backgroundVideoUrl = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                placeholder="https://assets.mixkit.co/... or /assets/...mp4"
                              />
                            </div>

                            {/* Section Minimal Dark Background Images */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Services Section BG Image</label>
                                <input
                                  type="text"
                                  value={section.content.servicesBgImage || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.servicesBgImage = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Maps Section BG Image</label>
                                <input
                                  type="text"
                                  value={section.content.mapsBgImage || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.mapsBgImage = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">CTA Section BG Image</label>
                                <input
                                  type="text"
                                  value={section.content.ctaBgImage || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.ctaBgImage = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>

                            {/* Buttons & Labels if present */}
                            {(section.content.btnSaleText !== undefined || section.content.exploreBtnText !== undefined || section.content.btnPrimaryText !== undefined) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                {(section.content.exploreBtnText !== undefined || section.content.btnPrimaryText !== undefined) && (
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Primary Button Text</label>
                                    <input
                                      type="text"
                                      value={section.content.btnPrimaryText !== undefined ? section.content.btnPrimaryText : (section.content.exploreBtnText || '')}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find(p => p.id === page.id)!;
                                        if (section.content.btnPrimaryText !== undefined) {
                                          p.sections[idx].content.btnPrimaryText = e.target.value;
                                        } else {
                                          p.sections[idx].content.exploreBtnText = e.target.value;
                                        }
                                        setPages(newPages);
                                      }}
                                      className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white"
                                    />
                                  </div>
                                )}
                                {(section.content.galleryBtnText !== undefined || section.content.btnSecondaryText !== undefined) && (
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Secondary Button Text</label>
                                    <input
                                      type="text"
                                      value={section.content.btnSecondaryText !== undefined ? section.content.btnSecondaryText : (section.content.galleryBtnText || '')}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find(p => p.id === page.id)!;
                                        if (section.content.btnSecondaryText !== undefined) {
                                          p.sections[idx].content.btnSecondaryText = e.target.value;
                                        } else {
                                          p.sections[idx].content.galleryBtnText = e.target.value;
                                        }
                                        setPages(newPages);
                                      }}
                                      className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white"
                                    />
                                  </div>
                                )}
                                {section.content.btnSaleText !== undefined && (
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Sale Tab Button</label>
                                    <input
                                      type="text"
                                      value={section.content.btnSaleText || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find(p => p.id === page.id)!;
                                        p.sections[idx].content.btnSaleText = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white"
                                    />
                                  </div>
                                )}
                                {section.content.btnRentText !== undefined && (
                                  <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Rent Tab Button</label>
                                    <input
                                      type="text"
                                      value={section.content.btnRentText || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find(p => p.id === page.id)!;
                                        p.sections[idx].content.btnRentText = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. MAP SECTION */}
                        {section.type === 'map' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Map Badge</label>
                                <input
                                  type="text"
                                  value={section.content.badge || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.badge = e.target.value;
                                    setPages(newPages);
                                  }}
                                  placeholder="e.g. Live Fleet Map"
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Map Title</label>
                                <input
                                  type="text"
                                  value={section.content.title || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.title = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Map Description</label>
                              <textarea
                                value={section.content.description || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.description = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                rows={2}
                              />
                            </div>

                            {/* Center Coordinates & Zoom Control */}
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                  Default Map Focus & Coordinates
                                </label>
                                <span className="text-[11px] text-slate-500 font-medium">Bujumbura, Burundi (Default)</span>
                              </div>

                              {/* Quick Presets */}
                              <div>
                                <span className="text-[11px] font-semibold text-slate-600 mb-1.5 block">Quick Geographic Presets:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    { label: '🇧🇮 Bujumbura Downtown', lat: -3.3822, lng: 29.3644, zoom: 13 },
                                    { label: '⛰️ Kiriri Luxury Hills', lat: -3.3885, lng: 29.3852, zoom: 14 },
                                    { label: '🌊 Kinindo Lakefront', lat: -3.4150, lng: 29.3520, zoom: 14 },
                                    { label: '🏛️ Gitega Capital', lat: -3.4272, lng: 29.9246, zoom: 13 },
                                    { label: '🌍 Global Overview', lat: -3.3822, lng: 29.3644, zoom: 11 },
                                  ].map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => {
                                        const newPages = [...pages];
                                        const p = newPages.find(p => p.id === page.id)!;
                                        p.sections[idx].content.centerLat = preset.lat;
                                        p.sections[idx].content.centerLng = preset.lng;
                                        p.sections[idx].content.zoom = preset.zoom;
                                        setPages(newPages);
                                      }}
                                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-xs"
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Center Latitude (Lat)</label>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="-3.3822"
                                    value={section.content.centerLat !== undefined ? section.content.centerLat : -3.3822}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find(p => p.id === page.id)!;
                                      p.sections[idx].content.centerLat = parseFloat(e.target.value) || 0;
                                      setPages(newPages);
                                    }}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-md bg-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Center Longitude (Lng)</label>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="29.3644"
                                    value={section.content.centerLng !== undefined ? section.content.centerLng : 29.3644}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find(p => p.id === page.id)!;
                                      p.sections[idx].content.centerLng = parseFloat(e.target.value) || 0;
                                      setPages(newPages);
                                    }}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-md bg-white font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Initial Zoom Level</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    placeholder="13"
                                    value={section.content.zoom !== undefined ? section.content.zoom : 13}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find(p => p.id === page.id)!;
                                      p.sections[idx].content.zoom = parseInt(e.target.value, 10) || 13;
                                      setPages(newPages);
                                    }}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-md bg-white font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. FEATURES SECTION */}
                        {section.type === 'features' && (
                          <div className="space-y-3">
                            {section.content.eyebrow !== undefined && (
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Eyebrow / Badge</label>
                                <input
                                  type="text"
                                  value={section.content.eyebrow || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.eyebrow = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Section Title</label>
                              <input
                                type="text"
                                value={section.content.title || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.title = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>
                            {section.content.description !== undefined && (
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
                                <textarea
                                  value={section.content.description || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.description = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                  rows={2}
                                />
                              </div>
                            )}

                            {/* Structured Features 1, 2, 3 */}
                            {(section.content.feature1Title !== undefined || section.content.feature2Title !== undefined) && (
                              <div className="space-y-3 pt-2">
                                <label className="block text-xs font-bold text-zinc-800">Feature Highlights</label>
                                {[1, 2, 3].map((num) => {
                                  const titleKey = `feature${num}Title`;
                                  const descKey = `feature${num}Desc`;
                                  if (section.content[titleKey] === undefined && section.content[descKey] === undefined && num === 3) return null;
                                  return (
                                    <div key={num} className="bg-white p-3 rounded-lg border border-zinc-200 space-y-2">
                                      <input
                                        type="text"
                                        placeholder={`Feature ${num} Title`}
                                        value={section.content[titleKey] || ''}
                                        onChange={(e) => {
                                          const newPages = [...pages];
                                          const p = newPages.find(p => p.id === page.id)!;
                                          p.sections[idx].content[titleKey] = e.target.value;
                                          setPages(newPages);
                                        }}
                                        className="w-full font-semibold text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                      />
                                      <textarea
                                        placeholder={`Feature ${num} Description`}
                                        value={section.content[descKey] || ''}
                                        onChange={(e) => {
                                          const newPages = [...pages];
                                          const p = newPages.find(p => p.id === page.id)!;
                                          p.sections[idx].content[descKey] = e.target.value;
                                          setPages(newPages);
                                        }}
                                        className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                        rows={2}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Simple Features list if string items array */}
                            {Array.isArray(section.content.items) && typeof section.content.items[0] === 'string' && (
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-2">Features (Comma separated)</label>
                                <textarea
                                  value={section.content.items?.join(', ') || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.items = e.target.value.split(',').map(s => s.trim());
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. PROCESS SECTION (3 Steps & Bulk Banner) */}
                        {section.type === 'process' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Process Badge</label>
                                <input
                                  type="text"
                                  value={section.content.badge || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.badge = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Process Title</label>
                                <input
                                  type="text"
                                  value={section.content.title || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.title = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Process Subtitle</label>
                              <textarea
                                value={section.content.subtitle || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.subtitle = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                rows={2}
                              />
                            </div>

                            {/* 3 Steps */}
                            <div className="space-y-3 pt-1">
                              <label className="block text-xs font-bold text-zinc-800">3-Step Workflow Steps</label>
                              {[1, 2, 3].map((num) => (
                                <div key={num} className="bg-white p-3 rounded-lg border border-zinc-200 space-y-2">
                                  <input
                                    type="text"
                                    placeholder={`Step ${num} Title`}
                                    value={section.content[`step${num}Title`] || ''}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find(p => p.id === page.id)!;
                                      p.sections[idx].content[`step${num}Title`] = e.target.value;
                                      setPages(newPages);
                                    }}
                                    className="w-full font-semibold text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                  />
                                  <textarea
                                    placeholder={`Step ${num} Description`}
                                    value={section.content[`step${num}Desc`] || ''}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find(p => p.id === page.id)!;
                                      p.sections[idx].content[`step${num}Desc`] = e.target.value;
                                      setPages(newPages);
                                    }}
                                    className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Promo Banner */}
                            <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/60 space-y-2.5">
                              <label className="block text-xs font-bold text-blue-900">Volume / Promo Banner</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Promo Badge (e.g. Save up to 35%)"
                                  value={section.content.promoBadge || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.promoBadge = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="text-xs p-1.5 border border-blue-200 rounded bg-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Promo Button Text"
                                  value={section.content.promoButtonText || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.promoButtonText = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="text-xs p-1.5 border border-blue-200 rounded bg-white"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Promo Title"
                                value={section.content.promoTitle || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.promoTitle = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full font-semibold text-xs p-1.5 border border-blue-200 rounded bg-white"
                              />
                              <textarea
                                placeholder="Promo Description"
                                value={section.content.promoDescription || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.promoDescription = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-1.5 border border-blue-200 rounded bg-white"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}

                        {/* 5. CTA SECTION */}
                        {section.type === 'cta' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Call to Action Title</label>
                              <input
                                type="text"
                                value={section.content.title || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.title = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">CTA Description</label>
                              <textarea
                                value={section.content.description || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.description = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Primary Button</label>
                                <input
                                  type="text"
                                  value={section.content.primaryButtonText || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.primaryButtonText = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Secondary Button</label>
                                <input
                                  type="text"
                                  value={section.content.secondaryButtonText || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.secondaryButtonText = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Phone / WhatsApp</label>
                                <input
                                  type="text"
                                  value={section.content.phoneNumber || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.phoneNumber = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 6. POLICIES SECTION */}
                        {section.type === 'policies' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Document Title</label>
                                <input
                                  type="text"
                                  value={section.content.title || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.title = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Subtitle</label>
                                <input
                                  type="text"
                                  value={section.content.subtitle || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.subtitle = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Effective Date</label>
                                <input
                                  type="text"
                                  value={section.content.effectiveDate || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.effectiveDate = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Compliance Email</label>
                                <input
                                  type="email"
                                  value={section.content.contactEmail || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.contactEmail = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Compliance Phone</label>
                                <input
                                  type="text"
                                  value={section.content.contactPhone || ''}
                                  onChange={(e) => {
                                    const newPages = [...pages];
                                    const p = newPages.find(p => p.id === page.id)!;
                                    p.sections[idx].content.contactPhone = e.target.value;
                                    setPages(newPages);
                                  }}
                                  className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Legacy Mission Statement</label>
                              <textarea
                                value={section.content.legacyMission || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.legacyMission = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-serif leading-relaxed"
                                rows={4}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1">Terms of Service</label>
                              <textarea
                                value={section.content.termsOfService || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.termsOfService = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                rows={4}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1">Privacy & Security Policy</label>
                              <textarea
                                value={section.content.privacyPolicy || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.privacyPolicy = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                rows={4}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1">Refund & Guarantee Policy</label>
                              <textarea
                                value={section.content.refundPolicy || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.refundPolicy = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                rows={4}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 mb-1">Licensing & Regulatory Compliance</label>
                              <textarea
                                value={section.content.licensePolicy || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.licensePolicy = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-xs p-2 border border-zinc-200 rounded-md bg-white font-mono"
                                rows={3}
                              />
                            </div>
                          </div>
                        )}

                        {/* 7. TEXT SECTION */}
                        {section.type === 'text' && (
                          <div className="space-y-3">
                             <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Title</label>
                              <input
                                type="text"
                                value={section.content.title || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.title = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Body text</label>
                              <textarea
                                value={section.content.body || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.body = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                rows={4}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* 8. GALLERY SECTION */}
                        {section.type === 'gallery' && (
                           <div className="space-y-3">
                             <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-medium text-zinc-600">Gallery Images (Comma separated URLs)</label>
                                <div className="relative overflow-hidden cursor-pointer flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, page.id, idx, 'images')}
                                    disabled={isUploadingImgBB}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <textarea
                                value={section.content.images?.join(',\n') || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find(p => p.id === page.id)!;
                                  p.sections[idx].content.images = e.target.value.split(',').map(s => s.trim());
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                                rows={4}
                              />
                            </div>
                           </div>
                        )}

                        {/* 9. SERVICES SECTION (Cards with Categories, Tags, etc.) */}

                        {section.type === 'services' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Section Title</label>
                              <input
                                type="text"
                                value={section.content.title || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find((p) => p.id === page.id)!;
                                  p.sections[idx].content.title = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Section Subtitle</label>
                              <input
                                type="text"
                                value={section.content.subtitle || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find((p) => p.id === page.id)!;
                                  p.sections[idx].content.subtitle = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>

                            {/* Service Items List */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-zinc-800">Protocol Service Cards ({section.content.items?.length || 0})</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPages = [...pages];
                                    const p = newPages.find((p) => p.id === page.id)!;
                                    const items = p.sections[idx].content.items || [];
                                    items.push({
                                      id: `sec-${Date.now()}`,
                                      title: 'New Service',
                                      description: 'Service description...',
                                      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
                                      badge: 'VIP',
                                    });
                                    p.sections[idx].content.items = items;
                                    setPages(newPages);
                                  }}
                                  className="text-xs font-semibold text-[#0B57FF] hover:underline cursor-pointer"
                                >
                                  + Add Service Item
                                </button>
                              </div>

                              {(section.content.items || []).map((item: any, itemIdx: number) => (
                                <div key={item.id || itemIdx} className="bg-white p-3 rounded-lg border border-zinc-200 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      placeholder="Title"
                                      value={item.title || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items[itemIdx].title = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="flex-1 font-semibold text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Badge (e.g. VIP)"
                                      value={item.badge || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items[itemIdx].badge = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="w-28 text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50 font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items = p.sections[idx].content.items.filter((_: any, i: number) => i !== itemIdx);
                                        setPages(newPages);
                                      }}
                                      className="p-1 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {item.subtitle !== undefined && (
                                    <input
                                      type="text"
                                      placeholder="Subtitle / Tech stack summary"
                                      value={item.subtitle || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items[itemIdx].subtitle = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                    />
                                  )}

                                  <textarea
                                    placeholder="Description"
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find((p) => p.id === page.id)!;
                                      p.sections[idx].content.items[itemIdx].description = e.target.value;
                                      setPages(newPages);
                                    }}
                                    className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                    rows={2}
                                  />

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Image URL"
                                      value={item.image || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items[itemIdx].image = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="flex-1 text-xs p-1.5 border border-zinc-200 rounded font-mono"
                                    />
                                    <label className="relative overflow-hidden cursor-pointer inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded border border-blue-200 shrink-0">
                                      <Upload className="w-3 h-3" />
                                      <span>Upload ImgBB</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleItemFileUpload(e, page.id, idx, itemIdx, 'image')}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                      />
                                    </label>
                                  </div>

                                  {item.image && (
                                    <div className="relative rounded-lg border border-zinc-200 overflow-hidden bg-zinc-100 w-24 h-16 flex items-center justify-center">
                                      <img
                                        src={item.image}
                                        alt={item.title || 'Item preview'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.type === 'videos' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Section Title</label>
                              <input
                                type="text"
                                value={section.content.title || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find((p) => p.id === page.id)!;
                                  p.sections[idx].content.title = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Section Subtitle</label>
                              <input
                                type="text"
                                value={section.content.subtitle || ''}
                                onChange={(e) => {
                                  const newPages = [...pages];
                                  const p = newPages.find((p) => p.id === page.id)!;
                                  p.sections[idx].content.subtitle = e.target.value;
                                  setPages(newPages);
                                }}
                                className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                              />
                            </div>

                            {/* Portrait Video List */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-zinc-800">Portrait Video Cards ({section.content.items?.length || 0})</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPages = [...pages];
                                    const p = newPages.find((p) => p.id === page.id)!;
                                    const items = p.sections[idx].content.items || [];
                                    items.push({
                                      id: `vid-${Date.now()}`,
                                      title: 'New Portrait Video Showcase',
                                      description: 'Showcase description...',
                                      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-a-modern-office-42861-large.mp4',
                                      posterUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
                                    });
                                    p.sections[idx].content.items = items;
                                    setPages(newPages);
                                  }}
                                  className="text-xs font-semibold text-[#0B57FF] hover:underline cursor-pointer"
                                >
                                  + Add Video Item
                                </button>
                              </div>

                              {(section.content.items || []).map((item: any, itemIdx: number) => (
                                <div key={item.id || itemIdx} className="bg-white p-3 rounded-lg border border-zinc-200 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      placeholder="Title"
                                      value={item.title || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items[itemIdx].title = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="flex-1 font-semibold text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items = p.sections[idx].content.items.filter((_: any, i: number) => i !== itemIdx);
                                        setPages(newPages);
                                      }}
                                      className="p-1 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <textarea
                                    placeholder="Description"
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const newPages = [...pages];
                                      const p = newPages.find((p) => p.id === page.id)!;
                                      p.sections[idx].content.items[itemIdx].description = e.target.value;
                                      setPages(newPages);
                                    }}
                                    className="w-full text-xs p-1.5 border border-zinc-200 rounded bg-zinc-50"
                                    rows={2}
                                  />

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Video MP4 URL"
                                      value={item.videoUrl || ''}
                                      onChange={(e) => {
                                        const newPages = [...pages];
                                        const p = newPages.find((p) => p.id === page.id)!;
                                        p.sections[idx].content.items[itemIdx].videoUrl = e.target.value;
                                        setPages(newPages);
                                      }}
                                      className="text-xs p-1.5 border border-zinc-200 rounded font-mono"
                                    />
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        placeholder="Poster Cover URL"
                                        value={item.posterUrl || ''}
                                        onChange={(e) => {
                                          const newPages = [...pages];
                                          const p = newPages.find((p) => p.id === page.id)!;
                                          p.sections[idx].content.items[itemIdx].posterUrl = e.target.value;
                                          setPages(newPages);
                                        }}
                                        className="flex-1 text-xs p-1.5 border border-zinc-200 rounded font-mono"
                                      />
                                      <label className="relative overflow-hidden cursor-pointer inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 shrink-0">
                                        <Upload className="w-3 h-3" />
                                        <span>ImgBB</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleItemFileUpload(e, page.id, idx, itemIdx, 'posterUrl')}
                                          className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => handleUpdatePage(page.id, page)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-[#0B57FF] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          EVENT SERVICE MODAL (ADD / EDIT)
         ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900 text-lg">
                {editingService ? 'Edit Event Service' : 'Add New Event Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.title || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. VIP Fleet (3 Mercedes SUVs)"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B57FF]/30 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Luxury Mercedes SUVs with professional chauffeurs."
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B57FF]/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Unit Price ($ USD) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={serviceFormData.unitPrice ?? 100}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B57FF]/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Default Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={serviceFormData.defaultQuantity ?? 1}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, defaultQuantity: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B57FF]/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Subtext / Unit label (Optional)</label>
                <input
                  type="text"
                  value={serviceFormData.subtext || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, subtext: e.target.value }))}
                  placeholder="e.g. $200 each or per 100 cards"
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B57FF]/30 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-zinc-700">Image URL</label>
                  <div className="relative overflow-hidden cursor-pointer flex items-center gap-1 text-[11px] font-semibold bg-[#E0EBFF] text-[#0B57FF] px-2.5 py-1 rounded-md hover:bg-blue-100">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleServiceImageUpload}
                      disabled={isUploadingImgBB}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={serviceFormData.image || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0B57FF]/30 outline-none"
                />
              </div>

              {/* Tag 1 and Tag 2 */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tag 1 Label</label>
                  <input
                    type="text"
                    value={serviceFormData.tags?.[0]?.label || ''}
                    onChange={(e) => {
                      const tags = [...(serviceFormData.tags || [])];
                      tags[0] = { iconType: tags[0]?.iconType || 'zap', label: e.target.value };
                      setServiceFormData((prev) => ({ ...prev, tags }));
                    }}
                    placeholder="e.g. VIP Class"
                    className="w-full p-2 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tag 2 Label</label>
                  <input
                    type="text"
                    value={serviceFormData.tags?.[1]?.label || ''}
                    onChange={(e) => {
                      const tags = [...(serviceFormData.tags || [])];
                      tags[1] = { iconType: tags[1]?.iconType || 'shield', label: e.target.value };
                      setServiceFormData((prev) => ({ ...prev, tags }));
                    }}
                    placeholder="e.g. Certified Protocol"
                    className="w-full p-2 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Status Toggle & Default Selected */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceFormData.enabled !== false}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 text-[#0B57FF] rounded accent-[#0B57FF]"
                  />
                  <span className="font-semibold text-zinc-700">Active (Visible on website)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(serviceFormData.checkedByDefault)}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, checkedByDefault: e.target.checked }))}
                    className="w-4 h-4 text-[#0B57FF] rounded accent-[#0B57FF]"
                  />
                  <span className="font-semibold text-zinc-700">Checked by default</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white rounded-xl font-semibold shadow-sm shadow-[#0B57FF]/20 cursor-pointer"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
