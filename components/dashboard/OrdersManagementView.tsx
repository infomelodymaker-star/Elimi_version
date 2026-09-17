'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  BoutiqueOrder,
  updateOrderStatus,
  generateWhatsAppOrderConfirmationText,
} from '@/lib/firestore-orders';
import { useRealtimeOrders } from '@/lib/use-realtime-orders';

export default function OrdersManagementView() {
  const { orders, loading, error } = useRealtimeOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'finished'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'home_delivery' | 'pickup'>('all');
  const [selectedOrder, setSelectedOrder] = useState<BoutiqueOrder | null>(null);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPIs
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const finished = orders.filter((o) => o.status === 'finished').length;
    const totalValueUSD = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const totalValueBIF = orders.reduce((sum, o) => sum + (o.totalBIF || 0), 0);

    return {
      total,
      pending,
      finished,
      totalValueUSD,
      totalValueBIF,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      // Delivery filter
      if (deliveryFilter !== 'all' && order.deliveryMethod !== deliveryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchNumber = (order.orderNumber || '').toLowerCase().includes(q);
        const matchItems = order.items.some((item) =>
          item.name.toLowerCase().includes(q) || (item.selectedSize || '').toLowerCase().includes(q)
        );
        const matchBureau = (order.pickupBureau || '').toLowerCase().includes(q);
        if (!matchId && !matchNumber && !matchItems && !matchBureau) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, deliveryFilter, searchQuery]);

  // Copy order confirmation text to clipboard
  const handleCopyConfirmation = (order: BoutiqueOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = generateWhatsAppOrderConfirmationText(order);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied Order #${order.id} confirmation details to clipboard!`);
    } else {
      showToast('Clipboard access unavailable');
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (order: BoutiqueOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = order.status === 'finished' ? 'pending' : 'finished';
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, newStatus);
      showToast(`Order ${order.id} marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast('Failed to update status in database');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#0F172A] text-white text-xs font-medium px-5 py-3 rounded-full shadow-[0px_8px_32px_0px_rgba(15,23,42,0.18)] border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#0F172A] tracking-[-0.03em]">
              Customer Orders Ledger
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-pulse" />
              Live Firestore Sync
            </span>
          </div>
          <p className="text-[13px] text-[#64748B] mt-1.5 max-w-2xl border-l-2 border-[#0B57FF] pl-3">
            Real-time customer checkout orders from WhatsApp & online store. Copy confirmation messages and mark orders as pending or finished.
          </p>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="p-6 rounded-2xl bg-white border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-medium">
            <span>Total Orders</span>
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-semibold text-[#0F172A] tracking-tight">
            {stats.total}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">All customer orders registered</div>
        </div>

        {/* Pending Orders */}
        <div className="p-6 rounded-2xl bg-white border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Pending Confirmation</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-semibold text-amber-600 tracking-tight">
            {stats.pending}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Awaiting preparation / delivery</div>
        </div>

        {/* Finished Orders */}
        <div className="p-6 rounded-2xl bg-white border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Finished / Completed</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-semibold text-emerald-600 tracking-tight">
            {stats.finished}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Fulfilled and delivered</div>
        </div>

        {/* Total Order Volume */}
        <div className="p-6 rounded-2xl bg-white border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-medium">
            <span>Total Value</span>
            <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-semibold text-[#0F172A] tracking-tight">
            ${stats.totalValueUSD.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-[#64748B] mt-1">
            ({stats.totalValueBIF.toLocaleString()} BIF)
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[#64748B] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. ELM-ORD-...), Product Name, or Bureau..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F8F9FA] border border-[#0F172A]/8 text-xs text-[#0F172A] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#0B57FF] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0F172A] text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F9FA] rounded-full border border-[#0F172A]/8 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>Pending ({stats.pending})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('finished')}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'finished'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>Finished ({stats.finished})</span>
            </button>
          </div>

          {/* Delivery Method Selector */}
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value as any)}
            className="h-10 px-4 rounded-full border border-[#0F172A]/8 bg-[#F8F9FA] text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#0B57FF] cursor-pointer"
          >
            <option value="all">All Delivery Modes</option>
            <option value="home_delivery">Home Delivery Only</option>
            <option value="pickup">Pickup at Bureau Only</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#64748B] text-xs">
            <span className="material-symbols-outlined animate-spin text-[32px] text-[#0B57FF] mb-2">
              progress_activity
            </span>
            <p className="font-medium text-[13px]">Loading orders from Firestore...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-rose-600 text-xs">
            <p className="font-semibold mb-1 text-[13px]">Error connecting to orders:</p>
            <p className="font-mono text-[11px] text-[#64748B]">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-[#64748B] text-xs space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto text-[#64748B]">
              <span className="material-symbols-outlined text-[26px]">inbox</span>
            </div>
            <p className="font-display font-semibold text-[#0F172A] text-base">No orders found</p>
            <p className="text-[#64748B] max-w-sm mx-auto text-[13px]">
              {searchQuery || statusFilter !== 'all' || deliveryFilter !== 'all'
                ? 'Try adjusting your filters or search keywords.'
                : 'When customers checkout online or via WhatsApp, their orders will appear here automatically in real time.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#0F172A]/8">
            {filteredOrders.map((order) => {
              const isFinished = order.status === 'finished';
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className={`p-5 sm:p-6 transition hover:bg-[#F8F9FA] ${
                    isFinished ? 'bg-[#F8F9FA]/40' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* LEFT: Order Header & Items list */}
                    <div className="space-y-4 flex-1 min-w-0">
                      {/* Order Title Row */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#0F172A] bg-[#F8F9FA] px-3 py-1 rounded-full border border-[#0F172A]/8">
                          {order.id}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider ${
                            isFinished
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isFinished ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'
                            }`}
                          />
                          <span>{order.status}</span>
                        </span>

                        {/* Delivery Method Badge */}
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#0F172A] border border-[#0F172A]/8">
                          <span className="material-symbols-outlined text-[14px]">
                            {order.deliveryMethod === 'home_delivery' ? 'local_shipping' : 'storefront'}
                          </span>
                          <span>
                            {order.deliveryMethod === 'home_delivery'
                              ? 'Home Delivery'
                              : 'Bureau Pick Up'}
                          </span>
                        </span>

                        {/* Time */}
                        <span className="text-[11px] text-[#64748B] flex items-center gap-1 ml-auto lg:ml-0 font-mono">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>
                          <span>
                            {new Date(order.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      </div>

                      {/* Products List inside Order */}
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-semibold text-[#0F172A]">
                          Items in this Order ({order.items.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8F9FA] border border-[#0F172A]/8"
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-[#0F172A]/8">
                                <Image
                                  src={item.image || '/assets/shop/african-suit.jpg'}
                                  alt={item.name}
                                  fill
                                  unoptimized
                                  referrerPolicy="no-referrer"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-[#0F172A] truncate">
                                  {item.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B]">
                                  <span className="font-semibold text-[#0F172A]">
                                    Qty: {item.quantity}
                                  </span>
                                  {item.selectedSize && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] font-mono text-[10px] font-semibold border border-[#0B57FF]/20">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                  <span className="font-mono">
                                    ${(item.priceUSD * item.quantity).toFixed(2)} USD
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#64748B] font-mono">
                                  Delivery fee: ${item.shippingCostUSD.toFixed(2)} USD
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Financials & Action Buttons */}
                    <div className="lg:w-72 shrink-0 p-5 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 space-y-4">
                      {/* Price Breakdown */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-[#64748B]">
                          <span>Subtotal:</span>
                          <span className="font-mono font-medium text-[#0F172A]">
                            ${order.subtotalUSD.toFixed(2)} USD
                          </span>
                        </div>
                        <div className="flex justify-between text-[#64748B]">
                          <span>Delivery Fee:</span>
                          <span className="font-mono font-medium text-[#0F172A]">
                            ${order.deliveryCostUSD.toFixed(2)} USD
                          </span>
                        </div>
                        {order.discountUSD > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Discount:</span>
                            <span className="font-mono">
                              -${order.discountUSD.toFixed(2)} USD
                            </span>
                          </div>
                        )}
                        <div className="pt-2.5 border-t border-[#0F172A]/8 flex justify-between items-baseline">
                          <span className="font-bold text-[#0F172A]">Total:</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#0B57FF]">
                              ${order.totalUSD.toFixed(2)} USD
                            </div>
                            <div className="text-[11px] font-semibold text-[#64748B] font-mono">
                              ({order.totalBIF.toLocaleString()} BIF)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action CTAs */}
                      <div className="space-y-2 pt-2 border-t border-[#0F172A]/8">
                        {/* 1. Copy Order Confirmation CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyConfirmation(order, e)}
                          className="w-full h-9 px-4 rounded-full bg-[#0F172A] hover:bg-[#0F172A]/90 text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#64748B]">
                            content_copy
                          </span>
                          <span>Copy WhatsApp Details</span>
                        </button>

                        {/* 2. Mark Finished / Pending Status Toggle */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(e) => handleToggleStatus(order, e)}
                          className={`w-full h-9 px-4 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                            isFinished
                              ? 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isFinished ? 'undo' : 'check_circle'}
                          </span>
                          <span>
                            {isUpdating
                              ? 'Updating...'
                              : isFinished
                              ? 'Mark as Pending'
                              : 'Mark as Finished'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
