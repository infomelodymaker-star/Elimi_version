'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Car,
  AvailableCarUnit,
  useRealtimeCars,
  addCarToFirestore,
  updateCarInFirestore,
  deleteCarFromFirestore,
  seedInitialCarsIfEmpty,
} from '@/lib/firestore-cars';
import { uploadImageSafely } from '@/lib/image-upload';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

const PRESET_CAR_AMENITIES = [
  'VIP Leather Executive Seating',
  'Chauffeur Protocol Partition',
  'Armored Level B6 Protection',
  'Panoramic Sunroof',
  'Burmester 4D Surround Sound',
  'Climate-Controlled Massaging Seats',
  'All-Wheel Drive (AWD)',
  'Adaptive Air Suspension',
  'Night Vision Assist',
  'Executive Rear Entertainment Screens',
  'Wireless Charging & Wi-Fi Hotspot',
  'Apple CarPlay & Android Auto',
];

const TRANSMISSIONS = [
  'Automatic',
  'Manual',
  '8-Speed Automatic',
  '9-Speed G-Tronic',
  'Dual-Clutch (PDK/DSG)',
  'Single-Speed Electric',
];

const FUEL_TYPES = [
  'Petrol / Gasoline',
  'Diesel',
  '100% Electric (EV)',
  'Plug-in Hybrid (PHEV)',
  'Mild Hybrid',
  'Twin-Turbo V8 Hybrid',
];

export default function CarsManagementView() {
  const { cars, loading, isLive } = useRealtimeCars();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [listingFilter, setListingFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('All');
  const [transmissionFilter, setTransmissionFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = (message: string, type: ToastInfo['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form State for Create & Edit
  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    description: string;
    price: number;
    rentPrice: number;
    sales: boolean;
    rent: boolean;
    address: string;
    lat: number;
    lng: number;
    mapsLink: string;
    seats: number;
    transmission: string;
    fuelType: string;
    year: number;
    mileage: string;
    modelTrim: string;
    imageUrl: string;
    photos: string[];
    newPhotoUrl: string;
    amenities: string[];
    newAmenityInput: string;
    availableUnits: AvailableCarUnit[];
  }>({
    id: '',
    title: '',
    description: '',
    price: 95000,
    rentPrice: 350,
    sales: true,
    rent: true,
    address: 'Beverly Hills Motors, CA',
    lat: 34.0736,
    lng: -118.4004,
    mapsLink: '',
    seats: 5,
    transmission: '8-Speed Automatic',
    fuelType: 'Petrol / Gasoline',
    year: 2024,
    mileage: 'New (0 km)',
    modelTrim: 'Luxury Executive Package',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
    photos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    ],
    newPhotoUrl: '',
    amenities: [
      'VIP Leather Executive Seating',
      'Panoramic Sunroof',
      'Burmester 4D Surround Sound',
      'All-Wheel Drive (AWD)',
    ],
    newAmenityInput: '',
    availableUnits: [
      {
        unitId: 'FLEET-01',
        availableDate: 'Available Now',
        price: 95000,
        isRent: false,
      },
    ],
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const total = cars.length;
    const forSale = cars.filter((c) => c.sales).length;
    const forRent = cars.filter((c) => c.rent).length;
    const totalUnits = cars.reduce((acc, c) => acc + (c.availableUnits?.length || 1), 0);
    const avgPrice =
      forSale > 0
        ? Math.round(cars.filter((c) => c.sales).reduce((acc, c) => acc + (c.price || 0), 0) / forSale)
        : 0;

    return {
      total,
      forSale,
      forRent,
      totalUnits,
      avgPrice,
    };
  }, [cars]);

  // Filtered Cars
  const filteredCars = useMemo(() => {
    return cars.filter((c) => {
      // Listing type filter
      if (listingFilter === 'sale' && !c.sales) return false;
      if (listingFilter === 'rent' && !c.rent) return false;

      // Fuel filter
      if (fuelFilter !== 'All' && c.fuelType !== fuelFilter) return false;

      // Transmission filter
      if (transmissionFilter !== 'All' && c.transmission !== transmissionFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchAddress = (c.address || '').toLowerCase().includes(q);
        const matchTrim = (c.modelTrim || '').toLowerCase().includes(q);
        const matchTransmission = (c.transmission || '').toLowerCase().includes(q);
        const matchFuel = (c.fuelType || '').toLowerCase().includes(q);
        const matchYear = String(c.year || '').includes(q);
        if (
          !matchTitle &&
          !matchAddress &&
          !matchTrim &&
          !matchTransmission &&
          !matchFuel &&
          !matchYear
        ) {
          return false;
        }
      }

      return true;
    });
  }, [cars, listingFilter, fuelFilter, transmissionFilter, searchQuery]);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingCarId(null);
    const generatedId = `car-${Date.now()}`;
    setFormData({
      id: generatedId,
      title: '',
      description: 'Meticulously inspected executive luxury vehicle equipped with premier comfort and safety suites.',
      price: 110000,
      rentPrice: 400,
      sales: true,
      rent: true,
      address: 'ELIMI VIP Mobility Hub, Bujumbura',
      lat: -3.3822,
      lng: 29.3644,
      mapsLink: '',
      seats: 5,
      transmission: '8-Speed Automatic',
      fuelType: 'Petrol / Gasoline',
      year: 2024,
      mileage: 'New (0 km)',
      modelTrim: 'Executive VIP Edition',
      imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
      photos: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      ],
      newPhotoUrl: '',
      amenities: [
        'VIP Leather Executive Seating',
        'Panoramic Sunroof',
        'Burmester 4D Surround Sound',
        'All-Wheel Drive (AWD)',
      ],
      newAmenityInput: '',
      availableUnits: [
        {
          unitId: `CAR-${Math.floor(100 + Math.random() * 900)}`,
          availableDate: 'Available Now',
          price: 110000,
          isRent: false,
        },
      ],
    });
    setIsModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (car: Car) => {
    setEditingCarId(car.id);
    setFormData({
      id: car.id,
      title: car.title,
      description: car.description || '',
      price: car.price || 0,
      rentPrice: car.rentPrice || 0,
      sales: Boolean(car.sales),
      rent: Boolean(car.rent),
      address: car.address || '',
      lat: car.location?.lat ?? 34.0522,
      lng: car.location?.lng ?? -118.2437,
      mapsLink: car.mapsLink || '',
      seats: car.seats || 5,
      transmission: car.transmission || 'Automatic',
      fuelType: car.fuelType || 'Petrol / Gasoline',
      year: car.year || 2024,
      mileage: car.mileage || 'New',
      modelTrim: car.modelTrim || '',
      imageUrl: car.imageUrl || '',
      photos: car.photos && car.photos.length > 0 ? [...car.photos] : car.imageUrl ? [car.imageUrl] : [],
      newPhotoUrl: '',
      amenities: car.amenities ? [...car.amenities] : [],
      newAmenityInput: '',
      availableUnits:
        car.availableUnits && car.availableUnits.length > 0
          ? car.availableUnits.map((u) => ({ ...u }))
          : [
              {
                unitId: `${car.id.toUpperCase()}-01`,
                availableDate: 'Available Now',
                price: car.price || 0,
                isRent: Boolean(car.rent),
              },
            ],
    });
    setIsModalOpen(true);
  };

  // Quick Toggle Sales status
  const handleQuickToggleSales = async (car: Car) => {
    try {
      const nextVal = !car.sales;
      await updateCarInFirestore(car.id, { sales: nextVal });
      showToast(`${car.title} marked as ${nextVal ? 'Available for Sale' : 'Not for Sale'}`, 'info');
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // Quick Toggle Rent status
  const handleQuickToggleRent = async (car: Car) => {
    try {
      const nextVal = !car.rent;
      await updateCarInFirestore(car.id, { rent: nextVal });
      showToast(`${car.title} marked as ${nextVal ? 'Available for Rent' : 'Not for Rent'}`, 'info');
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  // Delete Car
  const handleDeleteCar = async (carId: string, carTitle: string) => {
    try {
      await deleteCarFromFirestore(carId);
      showToast(`Vehicle "${carTitle}" deleted from Firestore`);
      setDeleteConfirmId(null);
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Upload Cover Image with safe fallback
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const result = await uploadImageSafely(file, 'car-cover');
      if (result.success && result.url) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: result.url,
        }));
        if (result.source === 'imgbb') {
          showToast('Cover image uploaded to ImgBB successfully!');
        } else {
          showToast('Cover image processed and attached to vehicle!', 'info');
        }
      } else {
        showToast(result.warning || 'Failed to process cover image', 'error');
      }
    } catch (err: any) {
      console.error('Car Cover Upload Error:', err);
      showToast(err?.message || 'Failed to attach cover image', 'error');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  // Upload Gallery Images with safe fallback
  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    let successCount = 0;
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadImageSafely(file, `car-gallery-${i}`);
        if (result.success && result.url) {
          newUrls.push(result.url);
          successCount++;
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...newUrls],
        }));
        showToast(`${successCount} photo(s) added to gallery!`);
      } else {
        showToast('No photos were added', 'error');
      }
    } catch (err: any) {
      console.error('Car Gallery Upload Error:', err);
      showToast(err?.message || 'Failed to upload photos', 'error');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Add Photo URL manually
  const handleAddPhotoUrl = () => {
    if (!formData.newPhotoUrl.trim()) return;
    const url = formData.newPhotoUrl.trim();
    if (!formData.photos.includes(url)) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, url],
        newPhotoUrl: '',
      }));
    }
  };

  // Remove Photo from gallery
  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Add Amenity Tag
  const handleAddAmenity = () => {
    if (!formData.newAmenityInput.trim()) return;
    const trimmed = formData.newAmenityInput.trim();
    if (!formData.amenities.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
        newAmenityInput: '',
      }));
    }
  };

  // Toggle Preset Amenity
  const handleTogglePresetAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((a) => a !== amenity),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity],
      }));
    }
  };

  // Remove Amenity Tag
  const handleRemoveAmenity = (amenityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenityToRemove),
    }));
  };

  // Add Unit
  const handleAddUnit = () => {
    const newUnit: AvailableCarUnit = {
      unitId: `UNIT-${Math.floor(100 + Math.random() * 900)}`,
      availableDate: 'Available Now',
      price: formData.sales ? formData.price : formData.rentPrice,
      isRent: !formData.sales && formData.rent,
    };
    setFormData((prev) => ({
      ...prev,
      availableUnits: [...prev.availableUnits, newUnit],
    }));
  };

  // Update Unit field
  const handleUpdateUnit = (index: number, field: keyof AvailableCarUnit, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.availableUnits];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, availableUnits: updated };
    });
  };

  // Remove Unit
  const handleRemoveUnit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableUnits: prev.availableUnits.filter((_, idx) => idx !== index),
    }));
  };

  // Submit Form (Create or Update)
  const handleSubmitCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vehicle title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalPhotos =
        formData.photos && formData.photos.length > 0
          ? formData.photos
          : [formData.imageUrl];

      const carPayload: Car = {
        id: formData.id || `car-${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        rentPrice: formData.rent ? Number(formData.rentPrice) || 0 : undefined,
        sales: Boolean(formData.sales),
        rent: Boolean(formData.rent),
        address: formData.address.trim() || 'Bujumbura Mobility Hub',
        location: {
          lat: Number(formData.lat) || 34.0522,
          lng: Number(formData.lng) || -118.2437,
        },
        mapsLink: formData.mapsLink.trim() || undefined,
        seats: Number(formData.seats) || 5,
        transmission: formData.transmission.trim() || 'Automatic',
        fuelType: formData.fuelType.trim() || 'Petrol / Gasoline',
        year: Number(formData.year) || 2024,
        mileage: formData.mileage.trim() || undefined,
        modelTrim: formData.modelTrim.trim() || 'Executive Edition',
        imageUrl: formData.imageUrl.trim(),
        photos: finalPhotos,
        amenities: formData.amenities,
        availableUnits: formData.availableUnits,
      };

      if (editingCarId) {
        await updateCarInFirestore(editingCarId, carPayload);
        showToast(`Updated "${carPayload.title}" in Firestore!`);
      } else {
        await addCarToFirestore(carPayload);
        showToast(`Created vehicle "${carPayload.title}" in Firestore!`);
      }

      setIsModalOpen(false);
      setEditingCarId(null);
    } catch (err: any) {
      console.error('Error saving car to Firestore:', err);
      showToast(`Firestore save error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reseed default sample cars
  const handleReseed = async () => {
    if (
      !window.confirm(
        'Sync sample VIP vehicle fleet into Firestore? Existing records will be merged safely.'
      )
    ) {
      return;
    }
    setIsReseeding(true);
    try {
      await seedInitialCarsIfEmpty();
      showToast('Synced VIP fleet cars into Firestore!');
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full text-xs font-medium shadow-[0px_8px_32px_0px_rgba(15,23,42,0.16)] border animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toast.type === 'info'
              ? 'bg-[#E0EBFF] text-[#0B57FF] border-[#0B57FF]/20'
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
        {/* Total Vehicles */}
        <div className="rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-[#0B57FF]/30 transition-colors">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[13px] font-medium text-[#0F172A]">Total Fleet Vehicles</span>
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-semibold text-[#0F172A] tracking-tight leading-none">
              {stats.total}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B57FF] animate-pulse" />
              Live DB
            </span>
          </div>
          <div className="mt-2 text-[#64748B] text-[12px] flex items-center justify-between border-l-2 border-[#0B57FF] pl-2">
            <span>{stats.forSale} for sale &bull; {stats.forRent} for rent</span>
            <span className="font-mono text-[#64748B]/80">{stats.totalUnits} total units</span>
          </div>
        </div>

        {/* Vehicles for Sale */}
        <div className="rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[13px] font-medium text-[#0F172A]">Certified For Sale</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-semibold text-[#0F172A] tracking-tight leading-none">
              {stats.forSale}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Avg ${stats.avgPrice.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[#64748B] text-[12px] border-l-2 border-emerald-500 pl-2">
            <span>Full VIP escort &amp; diplomatic registry</span>
          </div>
        </div>

        {/* Vehicles for Rent */}
        <div className="rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-[#0B57FF]/30 transition-colors">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[13px] font-medium text-[#0F172A]">Rental &amp; Chauffeur Fleet</span>
            <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">key</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-semibold text-[#0F172A] tracking-tight leading-none">
              {stats.forRent}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20">
              Per Day / Mission
            </span>
          </div>
          <div className="mt-2 text-[#64748B] text-[12px] border-l-2 border-[#0B57FF] pl-2">
            <span>Daily protocol, motorcades &amp; delegations</span>
          </div>
        </div>

        {/* Total Physical Units in Fleet */}
        <div className="rounded-2xl border border-[#0F172A]/8 bg-white p-6 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[13px] font-medium text-[#0F172A]">Available Units Capacity</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-semibold text-[#0F172A] tracking-tight leading-none">
              {stats.totalUnits}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Across Hubs
            </span>
          </div>
          <div className="mt-2 text-[#64748B] text-[12px] border-l-2 border-amber-500 pl-2">
            <span>Instant dispatch and airport reception</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Filter Toolbar & Action Buttons */}
      <section className="rounded-2xl border border-[#0F172A]/8 bg-white p-5 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Purpose Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setListingFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                listingFilter === 'all'
                  ? 'bg-[#0B57FF] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] border border-[#0F172A]/8'
              }`}
            >
              All Vehicles ({cars.length})
            </button>
            <button
              type="button"
              onClick={() => setListingFilter('sale')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                listingFilter === 'sale'
                  ? 'bg-[#0B57FF] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] border border-[#0F172A]/8'
              }`}
            >
              <span>For Sale</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                  listingFilter === 'sale' ? 'bg-white/20 text-white' : 'bg-[#E0EBFF] text-[#0B57FF]'
                }`}
              >
                {stats.forSale}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setListingFilter('rent')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                listingFilter === 'rent'
                  ? 'bg-[#0B57FF] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] border border-[#0F172A]/8'
              }`}
            >
              <span>For Rent</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                  listingFilter === 'rent' ? 'bg-white/20 text-white' : 'bg-[#E0EBFF] text-[#0B57FF]'
                }`}
              >
                {stats.forRent}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReseed}
              disabled={isReseeding}
              className="h-9 px-4 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#0F172A] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Sync / Seed sample VIP fleet into Firestore"
            >
              <span className={`material-symbols-outlined text-[16px] ${isReseeding ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span className="hidden sm:inline">Sync Fleet Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-9 px-5 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-[#0B57FF]/20 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Car</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Secondary Dropdowns */}
        <div className="pt-3 border-t border-[#0F172A]/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[16px] text-[#64748B]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, trim, address, transmission..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-[#0F172A]/8 bg-[#F8F9FA] text-xs text-[#0F172A] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#0B57FF] focus:bg-white transition-colors"
              type="text"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0F172A]"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <span className="text-xs text-[#64748B] font-medium hidden sm:inline">Transmission:</span>
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="h-10 px-4 rounded-full border border-[#0F172A]/8 bg-[#F8F9FA] text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#0B57FF] cursor-pointer"
            >
              <option value="All">All Transmissions</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <span className="text-xs text-[#64748B] font-medium hidden sm:inline">Fuel:</span>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="h-10 px-4 rounded-full border border-[#0F172A]/8 bg-[#F8F9FA] text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#0B57FF] cursor-pointer"
            >
              <option value="All">All Fuel Types</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 3: Cars Data Table */}
      <section className="rounded-2xl border border-[#0F172A]/8 bg-white overflow-hidden shadow-[0px_4px_24px_0px_rgba(15,23,42,0.03)]">
        <div className="p-5 border-b border-[#0F172A]/8 flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center space-x-2.5">
            <span className="text-[14px] font-semibold text-[#0F172A]">
              Fleet &amp; Mobility Vehicles ({filteredCars.length})
            </span>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#E0EBFF] text-[#0B57FF] border border-[#0B57FF]/20 font-semibold">
              Real-time Firestore
            </span>
          </div>
          <Link
            href="/cars"
            target="_blank"
            className="text-xs text-[#0B57FF] hover:text-[#0B57FF]/80 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>View Public Fleet Page</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-[#64748B]">
            <div className="w-8 h-8 border-2 border-[#0B57FF] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#64748B]">Syncing live fleet vehicles...</span>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="p-16 text-center text-[#64748B] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto text-[#64748B] border border-[#0F172A]/8">
              <span className="material-symbols-outlined text-[24px]">directions_car</span>
            </div>
            <div className="text-sm font-semibold text-[#0F172A]">No vehicles matched your search</div>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Try adjusting your search criteria, filter pills, or create a new vehicle in the fleet.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Vehicle Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0F172A]/8 bg-[#F8F9FA] text-[#64748B] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="p-4 w-16 text-center">Image</th>
                  <th className="p-4 min-w-[220px]">Vehicle Title &amp; Trim</th>
                  <th className="p-4 min-w-[140px]">Availability &amp; Status</th>
                  <th className="p-4 min-w-[150px]">Specifications</th>
                  <th className="p-4 min-w-[130px]">Pricing (USD)</th>
                  <th className="p-4 min-w-[160px]">Mobility Hub / Location</th>
                  <th className="p-4 min-w-[140px]">Features &amp; Units</th>
                  <th className="p-4 w-32 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F172A]/8 text-[#0F172A] text-[13px]">
                {filteredCars.map((car) => {
                  return (
                    <tr
                      key={car.id}
                      className="hover:bg-[#F8F9FA] transition-colors group"
                    >
                      {/* Image Thumbnail */}
                      <td className="p-4 text-center">
                        <div className="relative w-14 h-10 rounded-xl overflow-hidden border border-[#0F172A]/8 bg-[#F8F9FA] mx-auto shrink-0 shadow-2xs">
                          <Image
                            src={car.imageUrl || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400'}
                            alt={car.title}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Trim */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#0F172A] group-hover:text-[#0B57FF] transition-colors">
                              {car.title}
                            </span>
                            {car.year && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F8F9FA] text-[#0F172A] border border-[#0F172A]/8 font-semibold shrink-0">
                                {car.year}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B]">
                            <span className="text-[#0B57FF] font-medium">
                              {car.modelTrim || 'Prestige Edition'}
                            </span>
                            {car.mileage && (
                              <span>&bull; {car.mileage}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status / Purpose Toggles */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickToggleSales(car)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                car.sales
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-[#F8F9FA] text-[#64748B] border-[#0F172A]/8 hover:text-[#0F172A]'
                              }`}
                              title="Toggle For Sale status"
                            >
                              Sale {car.sales ? '✓' : '—'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickToggleRent(car)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                car.rent
                                  ? 'bg-[#E0EBFF] text-[#0B57FF] border-[#0B57FF]/20 hover:bg-[#0B57FF]/20'
                                  : 'bg-[#F8F9FA] text-[#64748B] border-[#0F172A]/8 hover:text-[#0F172A]'
                              }`}
                              title="Toggle For Rent status"
                            >
                              Rent {car.rent ? '✓' : '—'}
                            </button>
                          </div>
                          <span className="font-mono text-[10px] text-[#64748B]">
                            {car.availableUnits?.length || 1} unit(s) registered
                          </span>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="p-4">
                        <div className="flex flex-col text-xs text-[#64748B] space-y-0.5">
                          <span className="font-medium text-[#0F172A]">
                            {car.seats} Seats &bull; {car.transmission}
                          </span>
                          <span className="text-[#64748B] text-[11px]">
                            {car.fuelType}
                          </span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          {car.sales ? (
                            <span className="font-semibold text-[#0F172A] font-mono text-[13px]">
                              ${car.price ? car.price.toLocaleString() : '0'}
                            </span>
                          ) : (
                            <span className="text-[#64748B] font-mono text-xs">Not for sale</span>
                          )}
                          {car.rent && (
                            <span className="font-mono text-[11px] text-[#0B57FF] font-semibold">
                              ${car.rentPrice || '—'} / day
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location / Address */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#0F172A] max-w-[180px]">
                          <span className="material-symbols-outlined text-[16px] text-[#0B57FF] shrink-0">
                            location_on
                          </span>
                          <span className="truncate" title={car.address}>
                            {car.address || 'Mobility Hub'}
                          </span>
                        </div>
                      </td>

                      {/* Amenities & Units */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {car.amenities && car.amenities.length > 0 ? (
                            car.amenities.slice(0, 2).map((a, i) => (
                              <span
                                key={i}
                                className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F8F9FA] text-[#0F172A] border border-[#0F172A]/8 truncate max-w-[130px]"
                                title={a}
                              >
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#64748B] text-xs italic">Standard</span>
                          )}
                          {car.amenities && car.amenities.length > 2 && (
                            <span className="font-mono text-[10px] text-[#64748B]">
                              +{car.amenities.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/cars/${car.id}`}
                            target="_blank"
                            className="w-8 h-8 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] flex items-center justify-center transition-colors shadow-2xs"
                            title="Preview on live car page"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(car)}
                            className="w-8 h-8 rounded-full border border-[#0B57FF]/20 bg-[#E0EBFF] hover:bg-[#0B57FF]/20 text-[#0B57FF] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                            title="Edit vehicle details"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(car.id)}
                            className="w-8 h-8 rounded-full border border-[#0F172A]/8 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#64748B] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                            title="Delete vehicle from Firestore"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#0F172A]/8 shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="text-base font-semibold text-[#0F172A]">Delete Vehicle from Fleet?</h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Are you sure you want to permanently remove this vehicle from the Firestore database? This will also remove it from the public Fleet &amp; Cars directory.
            </p>
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#0F172A]/8">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = cars.find((c) => c.id === deleteConfirmId);
                  handleDeleteCar(deleteConfirmId, target?.title || deleteConfirmId);
                }}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-sm shadow-rose-600/20"
              >
                Yes, Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Car Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#0F172A]/8 shadow-[0px_8px_32px_0px_rgba(15,23,42,0.12)] max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#0F172A]/8 flex items-center justify-between bg-[#F8F9FA] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#E0EBFF] text-[#0B57FF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    directions_car
                  </span>
                </span>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  {editingCarId ? `Edit Vehicle: ${formData.title || editingCarId}` : 'Register New Vehicle in Fleet'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA] border border-[#0F172A]/8 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitCar} className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
              {/* SECTION: Basic Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                    General Vehicle Info
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-400">ID: {formData.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">
                      Vehicle Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Mercedes-Maybach S 680 4MATIC"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">
                      Model Trim / Package
                    </label>
                    <input
                      type="text"
                      value={formData.modelTrim}
                      onChange={(e) => setFormData({ ...formData, modelTrim: e.target.value })}
                      placeholder="e.g. V12 BiTurbo Executive"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">
                      Model Year
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      placeholder="2024"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">
                      Mileage
                    </label>
                    <input
                      type="text"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      placeholder="e.g. Brand New or 8,500 km"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Availability & Pricing */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">payments</span>
                  Availability &amp; Pricing
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-200">
                  {/* For Sale block */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sales}
                        onChange={(e) => setFormData({ ...formData, sales: e.target.checked })}
                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-zinc-800">Available for Sale</span>
                    </label>
                    {formData.sales && (
                      <div>
                        <label className="block text-zinc-600 text-[11px] mb-0.5">Sale Price (USD)</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          placeholder="e.g. 185000"
                          className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* For Rent block */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.rent}
                        onChange={(e) => setFormData({ ...formData, rent: e.target.checked })}
                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-zinc-800">Available for Rent</span>
                    </label>
                    {formData.rent && (
                      <div>
                        <label className="block text-zinc-600 text-[11px] mb-0.5">Daily Rental Price (USD/day)</label>
                        <input
                          type="number"
                          value={formData.rentPrice}
                          onChange={(e) => setFormData({ ...formData, rentPrice: Number(e.target.value) })}
                          placeholder="e.g. 450"
                          className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: Specifications */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
                  Technical Specifications
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Seats Count</label>
                    <input
                      type="number"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                      min={1}
                      max={20}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Transmission</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 bg-white focus:outline-none focus:border-blue-500"
                    >
                      {TRANSMISSIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Fuel / Powertrain</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 bg-white focus:outline-none focus:border-blue-500"
                    >
                      {FUEL_TYPES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Location & Hub */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">location_on</span>
                  Mobility Hub / Physical Station
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-zinc-700 font-medium mb-1">Address / Hub Name</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. ELIMI VIP Mobility Hub, Bujumbura"
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-medium mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-zinc-700 font-medium mb-1">Google Maps Link (Optional)</label>
                    <input
                      type="url"
                      value={formData.mapsLink}
                      onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Images & ImgBB Upload */}
              <div className="space-y-4 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">photo_library</span>
                    Imagery &amp; ImgBB Cloud Uploader
                  </h4>
                  <span className="text-[11px] text-zinc-400">Powered by ImgBB API</span>
                </div>

                {/* Main Cover Image */}
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-3">
                  <label className="block text-zinc-800 font-medium">Cover Photo (Main Display)</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Cover Preview"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <span className="material-symbols-outlined text-[20px]">image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="/uploads/... or paste image URL..."
                        className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-blue-500 text-xs font-mono"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-medium cursor-pointer transition-colors shadow-2xs">
                        <span className={`material-symbols-outlined text-[16px] ${isUploadingCover ? 'animate-spin' : ''}`}>
                          {isUploadingCover ? 'progress_activity' : 'cloud_upload'}
                        </span>
                        <span>{isUploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingCover}
                          onChange={handleUploadCoverImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gallery Photos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-800 font-medium">Gallery Photos ({formData.photos.length})</label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-medium cursor-pointer transition-colors shadow-2xs">
                      <span className={`material-symbols-outlined text-[16px] ${isUploadingGallery ? 'animate-spin' : ''}`}>
                        {isUploadingGallery ? 'progress_activity' : 'add_photo_alternate'}
                      </span>
                      <span>{isUploadingGallery ? 'Uploading...' : 'Upload Photos'}</span>
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

                  {/* Manual add photo url */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.newPhotoUrl}
                      onChange={(e) => setFormData({ ...formData, newPhotoUrl: e.target.value })}
                      placeholder="Add photo by URL..."
                      className="flex-1 h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Current Photos Thumbnails */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                    {formData.photos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 h-16 shadow-2xs"
                      >
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                          title="Remove photo"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: Amenities & Features */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">star</span>
                  Vehicle Features &amp; Amenities
                </h4>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CAR_AMENITIES.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleTogglePresetAmenity(amenity)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amenity input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={formData.newAmenityInput}
                    onChange={(e) => setFormData({ ...formData, newAmenityInput: e.target.value })}
                    placeholder="Add custom amenity or feature tag..."
                    className="flex-1 h-8 px-2.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium cursor-pointer"
                  >
                    Add Feature
                  </button>
                </div>

                {/* Active tags preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium"
                    >
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(a)}
                        className="hover:text-rose-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION: Available Fleet Units */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">list_alt</span>
                    Physical Units in Fleet
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Unit</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.availableUnits.map((u, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-zinc-200 bg-zinc-50"
                    >
                      <input
                        type="text"
                        value={u.unitId}
                        onChange={(e) => handleUpdateUnit(i, 'unitId', e.target.value)}
                        placeholder="Unit Plate / ID"
                        className="h-7 px-2 rounded border border-zinc-200 bg-white text-xs w-28 text-zinc-900"
                      />
                      <input
                        type="text"
                        value={u.availableDate}
                        onChange={(e) => handleUpdateUnit(i, 'availableDate', e.target.value)}
                        placeholder="e.g. Available Now"
                        className="h-7 px-2 rounded border border-zinc-200 bg-white text-xs flex-1 text-zinc-900"
                      />
                      <input
                        type="number"
                        value={u.price}
                        onChange={(e) => handleUpdateUnit(i, 'price', Number(e.target.value))}
                        placeholder="Price"
                        className="h-7 px-2 rounded border border-zinc-200 bg-white text-xs w-24 text-zinc-900"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-zinc-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={u.isRent}
                          onChange={(e) => handleUpdateUnit(i, 'isRent', e.target.checked)}
                          className="rounded border-zinc-300 text-blue-600"
                        />
                        <span>Rent Unit</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(i)}
                        className="w-6 h-6 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove unit"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Description */}
              <div className="space-y-2 pt-3 border-t border-zinc-100">
                <label className="block text-zinc-800 font-medium">Full Vehicle Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description for high-profile clients and guests..."
                  className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#0F172A]/8 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#0F172A]/8 bg-white hover:bg-[#F8F9FA] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#0B57FF] hover:bg-[#0B57FF]/90 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-[#0B57FF]/20 active:scale-95 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSubmitting ? 'animate-spin' : ''}`}>
                    {isSubmitting ? 'progress_activity' : 'save'}
                  </span>
                  <span>{editingCarId ? 'Update Vehicle' : 'Save Vehicle to Fleet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
