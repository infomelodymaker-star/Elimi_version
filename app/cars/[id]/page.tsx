'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ElimiHeader from '@/components/ElimiHeader';
import GoogleLocationMap from '@/components/GoogleLocationMap';
import ImageLightboxModal from '@/components/ImageLightboxModal';
import { useRealtimeCar } from '@/lib/firestore-cars';
import { useSettings } from '@/components/SettingsProvider';
import {
  Users,
  Fuel,
  Gauge,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Phone,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Images
} from 'lucide-react';

export default function CarDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { car, loading } = useRealtimeCar(id);
  const { whatsappNumber, phoneNumber } = useSettings();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-[#0D52FF] rounded-full"></div>
          <div className="h-3 w-3 bg-[#0D52FF] rounded-full animation-delay-200"></div>
          <div className="h-3 w-3 bg-[#0D52FF] rounded-full animation-delay-400"></div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#f5efe6] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-4">Vehicle not found</h1>
        <p className="text-gray-600 mb-6 max-w-md">The vehicle you are looking for might have been reserved or moved.</p>
        <Link href="/cars" className="bg-[#0D52FF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#0b45d6] transition-colors shadow-sm">
          Back to Fleet &amp; Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] font-sans text-gray-900 pb-12 flex flex-col">
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 w-full flex-grow pt-4">
        {/* Breadcrumb */}
        <div className="py-3 text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1.5 mb-2">
          <Link href="/" className="hover:text-[#0D52FF] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/cars" className="hover:text-[#0D52FF] transition-colors">Fleet &amp; Cars</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{car.title}</span>
        </div>

        {/* Hero Image / Banner */}
        <div className="relative h-[320px] sm:h-[440px] md:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden mb-8 shadow-md bg-gray-900">
          <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 bg-[#0f172a]/95 backdrop-blur-md text-white p-5 sm:p-7 md:p-9 w-full md:w-auto md:max-w-2xl rounded-t-2xl md:rounded-tr-3xl md:rounded-tl-none border-t md:border-r border-white/10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {car.sales && <span className="bg-[#0D52FF] text-white text-[11px] px-2.5 py-0.5 rounded-md font-semibold uppercase tracking-wider">For Sale</span>}
              {car.rent && <span className="bg-[#2563eb] text-white text-[11px] px-2.5 py-0.5 rounded-md font-semibold uppercase tracking-wider">For Rent</span>}
              {car.year && <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-md font-semibold">{car.year} Model</span>}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 leading-tight font-bold">{car.title}</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0D52FF] shrink-0" />
              <span>{car.address}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="py-6 border-b border-gray-300/60 mb-10">
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-4xl">
            {car.description} Meticulously inspected and certified for premium protocol, VIP transport, executive delegation, or personal purchase with full documentation.
          </p>
        </div>

        {/* Vehicle Specifications & Options */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 font-bold">Vehicle Specifications &amp; Pricing</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D52FF] bg-blue-50 px-3 py-1 rounded-full hidden sm:inline-block">
              Certified Fleet
            </span>
          </div>
          <div className="bg-[#f8f5f0] border border-gray-300/70 rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
              <div className="w-full md:w-1/3 h-48 sm:h-56 bg-white p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden border border-gray-200/60">
                <img 
                  src={car.imageUrl} 
                  alt={car.title} 
                  className="max-h-full w-full object-cover rounded-lg" 
                />
              </div>
              <div className="flex-grow flex flex-col md:flex-row justify-between w-full gap-6">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-2">{car.modelTrim || car.title}</h3>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3.5 text-xs sm:text-sm text-gray-600 mb-4 font-medium">
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200/60">
                      <Users className="w-3.5 h-3.5 text-[#0D52FF]" /> {car.seats} Passenger Seats
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200/60">
                      <Gauge className="w-3.5 h-3.5 text-[#0D52FF]" /> {car.transmission}
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200/60">
                      <Fuel className="w-3.5 h-3.5 text-[#0D52FF]" /> {car.fuelType}
                    </span>
                    {car.mileage && (
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200/60">
                        {car.mileage}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-medium border border-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-[#0D52FF]" /> Full Multi-Point Inspection Passed
                  </div>
                </div>
                <div className="pt-4 md:pt-0 border-t md:border-t-0 border-gray-200 md:text-right flex flex-col justify-center shrink-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {car.rentPrice ? `$${car.rentPrice.toLocaleString()}/day` : `$${car.price.toLocaleString()}`}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-semibold">
                    {car.rent ? 'Daily Rental Rate' : 'Outright Sale Price'}
                  </div>
                  <a
                    href="tel:+25779000000"
                    className="bg-[#0D52FF] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#0b45d6] transition-colors shadow-sm text-center flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Reserve This Vehicle</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Available Units / Booking Options */}
            <div className="mt-8 border-t border-gray-300/60 pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                {(car.availableUnits?.length || 1)} Available Option{(car.availableUnits?.length || 1) !== 1 ? 's' : ''} / Configurations
              </h4>
              <div className="space-y-3">
                {(car.availableUnits || [
                  { unitId: 'VIP-01', availableDate: 'Available Today', price: car.rentPrice || car.price, isRent: car.rent }
                ]).map((unit, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200/60 gap-3">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base w-full sm:w-1/4">
                      {unit.unitId} <span className="text-xs text-gray-500 font-normal">{unit.isRent ? '(Rental Fleet)' : '(Certified Sale)'}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-1/4 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#0D52FF]" />
                      <span>{unit.availableDate}</span>
                    </div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base w-full sm:w-1/4">
                      ${unit.price.toLocaleString()}{unit.isRent ? '/day' : ''}
                    </div>
                    <div className="w-full sm:w-1/4 sm:text-right">
                      <a
                        href="tel:+25779000000"
                        className="bg-[#0D52FF] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#0b45d6] transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-1"
                      >
                        <span>{unit.isRent ? 'Book Rental' : 'Purchase Request'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features & Amenities */}
        <div className="mb-12 border-b border-gray-300/60 pb-12">
          <h2 className="font-serif text-2xl sm:text-3xl mb-6 text-gray-900 font-bold">Features &amp; Amenities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
            {(car.amenities || []).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3.5 border border-gray-200/80 rounded-xl bg-white shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0D52FF] shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-800 leading-tight">{amenity}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic">
            Chauffeur service, armed security escort, or customized route planning can be arranged upon request with our VIP Protocol Desk.
          </p>
        </div>

        {/* Photos */}
        {(() => {
          const allCarPhotos = [
            ...(car.photos && car.photos.length > 0 ? car.photos : [
              car.imageUrl,
              "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200"
            ])
          ];
          // Ensure main imageUrl is included in photos if not already
          if (car.imageUrl && !allCarPhotos.includes(car.imageUrl)) {
            allCarPhotos.unshift(car.imageUrl);
          }

          const extraCount = Math.max(0, allCarPhotos.length - 3);

          return (
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 font-bold">Vehicle Gallery</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Click on any photo or &quot;more&quot; to inspect in high-resolution full screen.
                  </p>
                </div>
                {allCarPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoIndex(0);
                      setLightboxOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D52FF] bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <Images className="w-4 h-4" />
                    <span>View All ({allCarPhotos.length})</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1st photo - large */}
                <div
                  onClick={() => {
                    setActivePhotoIndex(0);
                    setLightboxOpen(true);
                  }}
                  className="md:col-span-2 h-[260px] sm:h-[360px] md:h-[460px] rounded-2xl overflow-hidden shadow-sm bg-gray-100 group cursor-pointer relative"
                >
                  <img 
                    src={allCarPhotos[0] || car.imageUrl} 
                    alt={`${car.title} - Main view`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Full view
                    </span>
                  </div>
                </div>

                {/* 2nd and 3rd photos column */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-[180px] sm:h-[240px] md:h-[460px]">
                  {/* 2nd photo */}
                  <div
                    onClick={() => {
                      setActivePhotoIndex(1 < allCarPhotos.length ? 1 : 0);
                      setLightboxOpen(true);
                    }}
                    className="rounded-2xl overflow-hidden shadow-sm bg-gray-100 h-full group cursor-pointer relative"
                  >
                    <img 
                      src={allCarPhotos[1] || allCarPhotos[0]} 
                      alt={`${car.title} - Interior & Details`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" /> View
                      </span>
                    </div>
                  </div>

                  {/* 3rd photo with +more overlay */}
                  <div
                    onClick={() => {
                      // Click on more opens at the 3rd or next image
                      setActivePhotoIndex(2 < allCarPhotos.length ? 2 : 0);
                      setLightboxOpen(true);
                    }}
                    className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer h-full bg-gray-100"
                  >
                    <img 
                      src={allCarPhotos[2] || allCarPhotos[0]} 
                      alt={`${car.title} - Profile`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-4 transition-colors group-hover:bg-black/55">
                      <span className="text-white font-semibold text-sm sm:text-base bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                        +{extraCount > 0 ? extraCount : 1} more
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lightbox Modal */}
              <ImageLightboxModal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={allCarPhotos}
                currentIndex={activePhotoIndex}
                onIndexChange={setActivePhotoIndex}
                title={car.title}
                categoryBadge="Vehicle Gallery"
              />
            </div>
          );
        })()}

        {/* CTA */}
        <div className="bg-[#f8f5f0] rounded-3xl p-8 sm:p-12 md:p-14 text-center max-w-4xl mx-auto mb-14 shadow-sm border border-gray-200/80">
          <h2 className="font-serif text-2xl sm:text-3xl mb-3 text-gray-900 font-bold">
            Interested in the {car.title}?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Schedule a test drive, request a quote for long-term rental, or arrange an executive airport pickup with chauffeur.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ELIMI Motors, I would like to inquire/reserve vehicle: ${car.title}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0D52FF] text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-[#0b45d6] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Inquire / Reserve</span>
            </a>
            <a
              href={`tel:${phoneNumber}`}
              className="bg-white border border-gray-300 text-gray-800 px-7 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-[#0D52FF]" />
              <span>Call ({phoneNumber})</span>
            </a>
          </div>
        </div>

        {/* Real Address & Google Maps Location */}
        <GoogleLocationMap
          address={car.address}
          location={car.location}
          title={car.title}
          category="car"
          priceDisplay={car.rent && car.rentPrice ? `$${car.rentPrice.toLocaleString()}/day Rental` : (car.sales && car.price > 0 ? `$${car.price.toLocaleString()} Sale` : undefined)}
          mapsLink={car.mapsLink}
        />

        {/* Similar Vehicles */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 font-bold">Other Vehicles in Fleet</h2>
            <Link href="/cars" className="text-xs sm:text-sm font-medium text-[#0D52FF] hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cars.filter(c => c.id !== id).slice(0, 3).map((nearbyCar) => (
              <Link href={`/cars/${nearbyCar.id}`} key={nearbyCar.id}>
                <article className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full hover:-translate-y-0.5">
                  <div className="h-48 overflow-hidden bg-gray-100">
                     <img 
                       alt={nearbyCar.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       src={nearbyCar.imageUrl} 
                     />
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-serif text-lg font-bold mb-1 text-gray-900 line-clamp-1 group-hover:text-[#0D52FF] transition-colors">{nearbyCar.title}</h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                      {nearbyCar.address.split(',')[0]} · {nearbyCar.seats} Seats · {nearbyCar.transmission}
                    </p>
                    <div className="mt-auto font-bold text-sm text-[#0D52FF]">
                      {nearbyCar.rentPrice ? `$${nearbyCar.rentPrice.toLocaleString()}/day` : `$${nearbyCar.price.toLocaleString()}`}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Back Link */}
        <div className="border-t border-gray-300/60 pt-6 pb-8">
          <Link href="/cars" className="text-gray-600 hover:text-[#0D52FF] text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5">
            ← Back to all vehicles
          </Link>
        </div>
      </main>
    </div>
  );
}

