'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { EMIL_SPRINGS, EMIL_EASINGS } from '@/lib/motion-constants';
import { CartItem } from './types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const estimatedShipping = subtotal > 100 || items.length === 0 ? 0 : 12.00;
  const grandTotal = Math.max(0, subtotal - discountAmount + estimatedShipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PRINT30' || promoCode.trim().toUpperCase() === 'BULK30') {
      setAppliedDiscount(0.30); // 30% off
    } else if (promoCode.trim().length > 0) {
      setAppliedDiscount(0.15); // 15% off default promo
    }
  };

  const handleCompleteOrder = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      setTimeout(() => {
        onClearCart();
        setOrderComplete(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : 0.2, ease: EMIL_EASINGS.easeOut }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={shouldReduceMotion ? { duration: 0.05 } : EMIL_SPRINGS.drawer}
            className="w-full max-w-md bg-white text-slate-900 h-full shadow-2xl flex flex-col justify-between relative border-l border-slate-200 z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900">Your Print Cart ({items.reduce((a, b) => a + b.quantity, 0)})</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 active:scale-[0.92] text-slate-600 transition-all cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {orderComplete ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Order Confirmed!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your proofing artwork file has been routed to our prepress line. Order receipt emailed to elimiofficiel@gmail.com.
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 space-y-4 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Your print cart is empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Select a product from the shop or configure an instant quote to add items.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-slate-200"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">{item.finish}</p>
                    {item.customText && (
                      <p className="text-[10px] text-indigo-600 truncate font-medium">
                        {item.customText}
                      </p>
                    )}
                    <p className="text-xs font-black text-slate-900 mt-1">
                      ${(item.unitPrice * item.quantity).toFixed(2)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        (${(item.unitPrice).toFixed(2)}/pc)
                      </span>
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5 text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && !orderComplete && (
            <div className="p-6 bg-slate-900 text-white border-t border-slate-800 space-y-4">
              
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. PRINT30)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl"
                >
                  Apply
                </button>
              </form>

              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/50">
                  <span>Promo Code Discount Applied ({appliedDiscount * 100}% Off):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Price Rows */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping:</span>
                  <span>{estimatedShipping === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `$${estimatedShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCompleteOrder}
                disabled={isCheckingOut}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {isCheckingOut ? (
                  <span>Processing Prepress Proof...</span>
                ) : (
                  <>
                    <span>Proceed to Instant Order Proofing</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>100% Color Guarantee • CMYK Proof Verification</span>
              </div>

            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
