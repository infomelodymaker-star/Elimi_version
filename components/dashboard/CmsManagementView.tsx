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
} from '@/lib/firestore-cms';
import { getStoredItems, saveStoredItems, runFirestoreTaskSafe } from '@/lib/firestore-sync';

export default function CmsManagementView() {
  const [pages, setPages] = useState<CmsPage[]>(() =>
    getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES)
  );
  const [loading, setLoading] = useState(false);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUploadingImgBB, setIsUploadingImgBB] = useState(false);

  useEffect(() => {
    // 1. Custom sync listener
    const handleSync = () => {
      const updated = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
      setPages(updated);
    };

    window.addEventListener(CMS_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Optional live subscription
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onSnapshot(
        collection(db, 'cms_pages'),
        (snapshot) => {
          if (!snapshot.empty) {
            const data: CmsPage[] = [];
            snapshot.forEach((docSnap) => {
              data.push({ id: docSnap.id, ...docSnap.data() } as CmsPage);
            });

            // Merge with INITIAL_CMS_PAGES for any missing pages
            const merged = [...data];
            for (const initPage of INITIAL_CMS_PAGES) {
              if (!merged.some((p) => p.id === initPage.id)) {
                merged.push(initPage);
              }
            }

            saveStoredItems(CMS_STORAGE_KEY, merged);
            setPages(merged);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('CMS onSnapshot note (using resilient cache):', err?.message || err);
          setLoading(false);
        }
      );
    } catch {
      // Retain existing cached pages and loading state
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
    const cleanedPage: CmsPage = {
      ...updatedPage,
      lastUpdated: new Date().toISOString(),
    };

    // 1. Immediately update local storage and broadcast
    const current = getStoredItems<CmsPage>(CMS_STORAGE_KEY, INITIAL_CMS_PAGES);
    const updatedList = current.map((p) => (p.id === pageId ? cleanedPage : p));
    if (!updatedList.some((p) => p.id === pageId)) {
      updatedList.push(cleanedPage);
    }
    saveStoredItems(CMS_STORAGE_KEY, updatedList, CMS_SYNC_EVENT);
    setPages(updatedList);
    showToast('Page updated successfully!');
    setIsSaving(false);

    // 2. Non-blocking background sync to Firestore
    runFirestoreTaskSafe(async () => {
      await setDoc(doc(db, 'cms_pages', pageId), cleanedPage);
    }, 1200, `Update CMS page ${pageId}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, pageId: string, sectionIdx: number, field: 'backgroundImage' | 'images') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImgBB(true);
    showToast('Uploading image to ImgBB...', 'success');
    
    try {
      const url = await uploadImageSafely(file);
      if (url) {
        const newPages = [...pages];
        const p = newPages.find(p => p.id === pageId)!;
        if (field === 'backgroundImage') {
          p.sections[sectionIdx].content.backgroundImage = url;
        } else if (field === 'images') {
          const currentImages = p.sections[sectionIdx].content.images || [];
          p.sections[sectionIdx].content.images = [...currentImages, url];
        }
        setPages(newPages);
        showToast('Image uploaded successfully!');
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch (error) {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImgBB(false);
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

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
        <h1 className="text-xl font-bold text-zinc-900">Content Management System</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage text and images for all pages across the website.</p>
      </div>

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
              {/* Page Header (Click to expand) */}
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
                      
                      {/* Render different editors based on section type */}
                      {section.type === 'hero' && (
                        <div className="space-y-3">
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
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Subheadline</label>
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
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-xs font-medium text-zinc-600">Background Image URL</label>
                              <div className="relative overflow-hidden cursor-pointer flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, page.id, idx, 'backgroundImage')}
                                  disabled={isUploadingImgBB}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              value={section.content.backgroundImage || ''}
                              onChange={(e) => {
                                const newPages = [...pages];
                                const p = newPages.find(p => p.id === page.id)!;
                                p.sections[idx].content.backgroundImage = e.target.value;
                                setPages(newPages);
                              }}
                              className="w-full text-sm p-2 border border-zinc-200 rounded-md bg-white"
                            />
                          </div>
                        </div>
                      )}
                      
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

                      {section.type === 'features' && (
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
                        </div>
                      )}
                      
                      {section.type === 'gallery' && (
                         <div className="space-y-3">
                           <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-xs font-medium text-zinc-600">Gallery Images (Comma separated URLs)</label>
                              <div className="relative overflow-hidden cursor-pointer flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
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
                    </div>
                  ))}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleUpdatePage(page.id, page)}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
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
    </div>
  );
}
