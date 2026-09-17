'use client';

import React, { useState, useEffect } from 'react';
import { getGlobalSettings, updateGlobalSettings, GlobalSettings, DEFAULT_SETTINGS } from '@/lib/firestore-settings';

export default function SettingsManagementView() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getGlobalSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGlobalSettings(settings);
      showToast('Settings saved successfully!');
    } catch (err) {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading Settings...</div>;

  return (
    <div className="space-y-6">
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

      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Platform Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage global configurations like exchange rates and contact info.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Financial Settings</h3>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">USD to BIF Exchange Rate</label>
              <div className="relative max-w-sm">
                <input
                  type="number"
                  required
                  value={settings.usdToBifRate}
                  onChange={(e) => setSettings({ ...settings, usdToBifRate: Number(e.target.value) })}
                  className="w-full h-10 pl-3 pr-12 rounded-lg border border-zinc-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">BIF</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">This rate will be used globally to calculate BIF prices from USD.</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Contact & Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">WhatsApp Number (e.g., 25779123456)</label>
                <input
                  type="text"
                  value={settings.whatsappNumber || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
