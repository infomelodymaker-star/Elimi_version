'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  Heart,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Calendar,
  Check,
  Maximize2,
  Share2,
} from 'lucide-react';
import { RentalItem } from '@/lib/firestore-rentals';

interface RentalDetailModalProps {
  item: RentalItem | null;
  onClose: () => void;
  onOpenZoom: (photos: string[], initialIndex: number) => void;
  onRentSuccess?: (item: RentalItem, days: number, size: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (itemId: string) => void;
  allRentalItems?: RentalItem[];
  onSelectItem?: (item: RentalItem) => void;
}

export default function RentalDetailModal({
  item,
  onClose,
  onOpenZoom,
  onRentSuccess,
  isFavorite = false,
  onToggleFavorite,
  allRentalItems = [],
  onSelectItem,
}: RentalDetailModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('Standard');
  const [rentalDays, setRentalDays] = useState<number>(3);
  const [booked, setBooked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'conditions' | 'avis'>('details');

  if (!item) return null;

  const photos = item.gallery && item.gallery.length > 0 ? item.gallery : [item.imageUrl];

  const fit = item.fitScore || { small: 7, accurate: 85, large: 8 };

  const handleBook = () => {
    setBooked(true);
    if (onRentSuccess) {
      onRentSuccess(item, rentalDays, selectedSize);
    }
    setTimeout(() => {
      setBooked(false);
      onClose();
    }, 1800);
  };

  const relatedItems = allRentalItems
    .filter((i) => i.id !== item.id && (i.categoryId === item.categoryId || i.brand === item.brand))
    .slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white/95 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#0D52FF]">{item.categoryName}</span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Ajouter aux favoris"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Left Column: Photo Gallery Preview */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3">
              {/* Vertical Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto shrink-0 pb-1 sm:pb-0">
                  {photos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-16 h-20 sm:w-18 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activePhotoIndex === idx
                          ? 'border-[#0D52FF] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`${item.name} thumb ${idx + 1}`}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Photo Preview */}
              <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200/80">
                <Image
                  src={photos[activePhotoIndex] || item.imageUrl}
                  alt={item.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />

                {/* Badge if present */}
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#0D52FF] font-bold text-xs px-3 py-1 rounded-full shadow-md border border-blue-100">
                    {item.badge}
                  </span>
                )}

                {/* Zoom Fullscreen Action */}
                <button
                  type="button"
                  onClick={() => onOpenZoom(photos, activePhotoIndex)}
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Agrandir</span>
                </button>
              </div>
            </div>

            {/* Right Column: Item Information & Rental CTA */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Brand & Reviews */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {item.brand || 'ELIMI EXCLUSIVE'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-slate-800">{item.rating || 4.9}</span>
                    <span className="text-slate-400 font-normal">
                      ({item.reviewsCount || 72} avis)
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {item.name}
                </h1>

                {/* Pricing Banner */}
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100/80 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-[#0D52FF]">
                      Prix de location
                    </div>
                    <div className="text-2xl font-black text-[#0D52FF] leading-tight">
                      {item.pricePerDay},00 $ <span className="text-sm font-semibold text-slate-500">/ jour</span>
                    </div>
                  </div>
                  {item.originalPrice && (
                    <div className="text-right">
                      <div className="text-[11px] uppercase text-slate-400 font-medium">Valeur boutique</div>
                      <div className="text-sm font-semibold text-slate-500 line-through">
                        {item.originalPrice},00 $
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Chooser */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Taille disponible :
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('conditions')}
                        className="text-xs font-medium text-[#0D52FF] hover:underline"
                      >
                        Guide des tailles
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                            selectedSize === sz
                              ? 'bg-[#0D52FF] text-white shadow-md shadow-blue-500/20 ring-2 ring-[#0D52FF] ring-offset-1'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fit Guide Bar */}
                <div className="pt-1 pb-2 border-y border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold">Comment ça taille ?</span>
                    <span className="text-slate-400">Basé sur {item.reviewsCount || 85} retours</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${fit.small}%` }}
                      className="bg-amber-400 h-full"
                      title={`Petit: ${fit.small}%`}
                    />
                    <div
                      style={{ width: `${fit.accurate}%` }}
                      className="bg-[#0D52FF] h-full"
                      title={`Conforme: ${fit.accurate}%`}
                    />
                    <div
                      style={{ width: `${fit.large}%` }}
                      className="bg-indigo-300 h-full"
                      title={`Grand: ${fit.large}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold uppercase text-slate-400">
                    <span>Petit ({fit.small}%)</span>
                    <span className="text-[#0D52FF] font-bold">Conforme ({fit.accurate}%)</span>
                    <span>Grand ({fit.large}%)</span>
                  </div>
                </div>

                {/* Rental Duration Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0D52FF]" />
                    <span>Durée de location souhaitée :</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 7, 14].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRentalDays(days)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                          rentalDays === days
                            ? 'bg-blue-50 text-[#0D52FF] border-2 border-[#0D52FF]'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <div>{days} {days > 1 ? 'jours' : 'jour'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {days * item.pricePerDay}$
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={booked}
                    onClick={handleBook}
                    className={`w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                      booked
                        ? 'bg-emerald-600 shadow-emerald-500/25'
                        : 'bg-[#0D52FF] hover:bg-blue-700 shadow-blue-600/30 hover:scale-[1.01]'
                    }`}
                  >
                    {booked ? (
                      <>
                        <Check className="w-5 h-5 animate-bounce" />
                        <span>Ajouté avec succès !</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Réserver pour {rentalDays * item.pricePerDay},00 $</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pressing & garantie inclus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#0D52FF]" />
                      <span>Livraison & retour VIP express</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Community Photos Mini Row */}
              {item.clientPhotos && item.clientPhotos.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    Photos des clients en situation :
                  </div>
                  <div className="flex gap-2">
                    {item.clientPhotos.map((cp, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0"
                      >
                        <Image
                          src={cp}
                          alt="Client wear"
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                          sizes="60px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details & Specifications Accordion / Tabs */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex gap-4 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                  activeTab === 'details'
                    ? 'border-[#0D52FF] text-[#0D52FF]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Détails & Style
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conditions')}
                className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                  activeTab === 'conditions'
                    ? 'border-[#0D52FF] text-[#0D52FF]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Conditions & Entretien
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('avis')}
                className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                  activeTab === 'avis'
                    ? 'border-[#0D52FF] text-[#0D52FF]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Avis & Notes ({item.reviewsCount || 72})
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>{item.description}</p>
                {item.details && <p className="font-medium text-slate-700">{item.details}</p>}
              </div>
            )}

            {activeTab === 'conditions' && (
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  • <strong>Nettoyage :</strong> Aucun lavage à votre charge. Notre service pressing
                  écologique certifié traite chaque pièce avant et après chaque location.
                </p>
                <p>
                  • <strong>Assurance intégrée :</strong> Une couverture complète protège l’article
                  contre les accidents mineurs (taches courantes, faux-plis, boutons).
                </p>
                <p>
                  • <strong>Retours facilités :</strong> Utilisez simplement l’emballage zippé
                  réutilisable avec l’étiquette de retour prépayée incluse.
                </p>
              </div>
            )}

            {activeTab === 'avis' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">Emma V. (170cm, taille S)</span>
                    <span className="text-slate-400">Il y a 3 jours</span>
                  </div>
                  <div className="flex text-amber-400 text-xs mb-1">★★★★★</div>
                  <p className="text-xs text-slate-600">
                    « Pièce tout simplement sensationnelle pour mon événement professionnel. Reçu
                    repassé impeccablement et le tissu a un tombé d’une qualité rare. »
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">Claire D. (taille M)</span>
                    <span className="text-slate-400">Il y a 1 semaine</span>
                  </div>
                  <div className="flex text-amber-400 text-xs mb-1">★★★★★</div>
                  <p className="text-xs text-slate-600">
                    « Taille parfaitement conforme au tableau. J’ai reçu tellement de compliments,
                    je relouerai sans hésiter ! »
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Related / You May Also Like Section */}
          {relatedItems.length > 0 && (
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Vous aimerez aussi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedItems.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectItem && onSelectItem(rel)}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200/80 bg-white hover:border-[#0D52FF] transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-[3/4] bg-slate-100">
                      <Image
                        src={rel.imageUrl}
                        alt={rel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        sizes="200px"
                      />
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-bold text-slate-800 truncate">{rel.name}</div>
                      <div className="text-xs font-semibold text-[#0D52FF]">{rel.pricePerDay} $/j</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
