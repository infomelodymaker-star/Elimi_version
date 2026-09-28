'use client';

import React, { useState, useEffect } from 'react';
import { getGlobalSettings, updateGlobalSettings, GlobalSettings, DEFAULT_SETTINGS, sanitizeWhatsAppNumber } from '@/lib/firestore-settings';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsManagementView() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'settings', 'global');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as GlobalSettings);
        } else {
          const cached = await getGlobalSettings();
          setSettings(cached);
        }
      } catch (err) {
        console.warn('Could not read Firestore directly, falling back to cached settings:', err);
        const cached = await getGlobalSettings();
        setSettings(cached);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGlobalSettings(settings);
      showToast('Settings successfully saved to Firestore database!');
    } catch (err) {
      console.error(err);
      showToast('Error saving settings to Firestore', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeCleanWhatsApp = sanitizeWhatsAppNumber(settings.whatsappNumber);

  if (loading) return <div className="p-8 text-center text-zinc-500 font-medium">Loading Platform Settings...</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-900">Platform Settings &amp; Concierge</h1>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B57FF] border border-blue-200/60 font-semibold">
              Firestore Synced
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Configure the dynamic WhatsApp concierge number, exchange rates, and business communication channels used across Cars, Houses, Shop, and Rentals.
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          {/* Section: WhatsApp & Customer Reservations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Dynamic WhatsApp Concierge &amp; Reservations
              </h3>
              <span className="text-xs text-zinc-400 font-medium">Used for Cars &amp; Houses CTAs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Official WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25769992984 or +257 69 99 29 84"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                  All vehicle &amp; property reservation buttons (<strong>&ldquo;Reserve This Vehicle&rdquo;</strong>, <strong>&ldquo;Purchase Request&rdquo;</strong>, <strong>&ldquo;Inquire / Schedule Tour&rdquo;</strong>) will dynamically redirect users to this WhatsApp number with a structured greeting message.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Live WhatsApp Integration Preview:</span>
                  <span className="text-emerald-700 font-mono text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    +{activeCleanWhatsApp}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Target Click-to-Chat URL:
                </p>
                <code className="block p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-blue-700 break-all select-all">
                  https://wa.me/{activeCleanWhatsApp}?text=Hello...
                </code>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${activeCleanWhatsApp}?text=${encodeURIComponent('Hello ELIMI Team! Testing live Firestore WhatsApp settings.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B57FF] hover:underline"
                  >
                    <span>Test WhatsApp Link ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Additional Contact Details */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2.5">
              General Contact &amp; Voice Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="contact@elimi.bi"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Telephone Voice Line</label>
                <input
                  type="text"
                  placeholder="+257 69 99 29 84"
                  value={settings.phoneNumber || settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value, contactPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Currency & Rates */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2.5">Financial &amp; Currency Rates</h3>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">USD to BIF Conversion Rate</label>
              <div className="relative max-w-sm">
                <input
                  type="number"
                  required
                  value={settings.usdToBifRate}
                  onChange={(e) => setSettings({ ...settings, usdToBifRate: Number(e.target.value) })}
                  className="w-full h-10 pl-3 pr-12 rounded-lg border border-zinc-200 text-sm font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">BIF / USD</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">This rate dynamically converts vehicle and real estate prices into Burundian Francs (BIF) across the catalog.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-400">All changes persist in real-time to Firestore database.</span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0B57FF] text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <span>Save Settings to Firestore</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

