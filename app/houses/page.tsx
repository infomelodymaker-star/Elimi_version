'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRealtimeHouses, House } from '@/lib/firestore-houses';
import { MapPin, Bed, Bath, Maximize2, Building2, ShieldCheck, Sparkles, ArrowRight, Phone, Navigation, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCurrency, useSettings } from "@/components/SettingsProvider";
import ElimiHeader from '@/components/ElimiHeader';
import GoogleLocationMap from '@/components/GoogleLocationMap';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useCmsPage } from '@/lib/firestore-cms';

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const BURUNDI_CENTER = { lat: -3.3822, lng: 29.3644 };

const MAP_REGIONS = [
  { id: 'bujumbura', label: 'Bujumbura (Burundi)', center: { lat: -3.3822, lng: 29.3644 }, zoom: 13 },
  { id: 'kiriri', label: 'Kiriri & Rohero', center: { lat: -3.3790, lng: 29.3730 }, zoom: 14 },
  { id: 'kinindo', label: 'Kinindo Plage', center: { lat: -3.4050, lng: 29.3480 }, zoom: 14 },
  { id: 'gitega', label: 'Gitega Capital', center: { lat: -3.4275, lng: 29.9248 }, zoom: 13 },
  { id: 'usa', label: 'USA (Legacy)', center: { lat: 34.0522, lng: -118.2437 }, zoom: 10 },
  { id: 'global', label: 'Global View', center: { lat: 5.0, lng: 20.0 }, zoom: 3 },
];

function HousesContent() {
  const { houses, loading } = useRealtimeHouses();
  const { data: cmsHousesPage } = useCmsPage('houses');

  const heroContent = cmsHousesPage?.sections?.find(s => s.id === 'hero' || s.type === 'hero')?.content;
  const mapContent = cmsHousesPage?.sections?.find(s => s.id === 'map' || s.id === 'map-section' || s.type === 'map' || s.type === 'map-section')?.content;

  const [activeRegion, setActiveRegion] = useState<string>('bujumbura');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(() => {
    if (mapContent?.centerLat && mapContent?.centerLng) {
      return { lat: Number(mapContent.centerLat), lng: Number(mapContent.centerLng) };
    }
    return BURUNDI_CENTER;
  });
  const [mapZoom, setMapZoom] = useState<number>(() => {
    return mapContent?.zoom ? Number(mapContent.zoom) : 13;
  });

  useEffect(() => {
    if (mapContent?.centerLat && mapContent?.centerLng) {
      queueMicrotask(() => {
        setMapCenter({ lat: Number(mapContent.centerLat), lng: Number(mapContent.centerLng) });
        if (mapContent?.zoom) setMapZoom(Number(mapContent.zoom));
      });
    }
  }, [mapContent]);

  const handleRegionChange = (region: typeof MAP_REGIONS[0]) => {
    setActiveRegion(region.id);
    setMapCenter(region.center);
    setMapZoom(region.zoom);
  };

  const heroImage = heroContent?.image || heroContent?.backgroundImage || heroContent?.showcaseImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600';
  const heroBadge = heroContent?.badge || 'Villas & Penthouses';
  const heroHeadline = heroContent?.headline || 'Let\'s find your perfect fit.';
  const heroSubheadline = heroContent?.subheadline || 'Browse prestige villas, modern apartments, and executive residences for purchase or long-term lease.';

  const mapBadge = mapContent?.badge || 'Live Property Map';
  const mapTitle = mapContent?.title || 'Map your next estate.';
  const mapDescription = mapContent?.description || 'Pinpoint prime residences, commercial complexes, and private compounds across prime urban and coastal sectors.';

  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<'all' | 'rent' | 'sale'>(() => {
    const typeParam = searchParams.get('type') || searchParams.get('filter');
    if (typeParam === 'sale' || typeParam === 'buy') return 'sale';
    if (typeParam === 'rent') return 'rent';
    return 'all';
  });

  useEffect(() => {
    const typeParam = searchParams.get('type') || searchParams.get('filter');
    if (typeParam === 'sale' || typeParam === 'buy') {
      setTimeout(() => setFilter('sale'), 0);
    } else if (typeParam === 'rent') {
      setTimeout(() => setFilter('rent'), 0);
    }
  }, [searchParams]);

  // Filter the houses based on the selected tab
  const filteredHouses = useMemo(() => {
    if (filter === 'rent') {
      return houses.filter(h => h.rent);
    }
    if (filter === 'sale') {
      return houses.filter(h => h.sales);
    }
    return houses;
  }, [houses, filter]);

  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const { formatUSD } = useCurrency();
  const { whatsappNumber } = useSettings();

  const activeHouse = useMemo(() => {
    if (selectedHouseId) {
      const found = filteredHouses.find(h => h.id === selectedHouseId) || houses.find(h => h.id === selectedHouseId);
      if (found) return found;
    }
    return filteredHouses[0] || houses[0] || null;
  }, [selectedHouseId, filteredHouses, houses]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#0F172A] flex flex-col antialiased">
      {/* Home Page Navigation Header */}
      <ElimiHeader />

      {/* Hero Section */}
      <section className="relative bg-[#F8F9FA] flex flex-col lg:flex-row min-h-[460px] lg:min-h-[520px]">
        <div 
          className="w-full lg:w-2/3 min-h-[280px] sm:min-h-[380px] lg:min-h-[520px] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-transparent"></div>
          <div className="lg:hidden absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs font-bold tracking-wider uppercase bg-[#0B57FF] text-white px-3 py-1 rounded-full shadow-xs">
              {heroBadge}
            </span>
          </div>
        </div>
        <div className="hidden lg:block w-1/3 bg-[#F8F9FA]"></div>
        
        {/* Floating / Responsive Card */}
        <div className="w-full lg:absolute right-0 top-1/2 lg:-translate-y-1/2 lg:w-[450px] xl:w-[480px] lg:mr-8 xl:mr-16 p-4 sm:p-6 lg:p-0">
          <div className="relative">
            <div className="bg-white p-6 sm:p-8 rounded-2xl relative z-10 border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.06)]">
              <span className="hidden lg:inline-block text-[11px] font-bold tracking-wider uppercase text-[#0B57FF] mb-2 bg-[#E0EBFF] px-3 py-1 rounded-full border border-[#0B57FF]/20">
                {heroBadge}
              </span>
              <h1 className="text-3xl sm:text-4xl font-medium mb-3 sm:mb-4 text-[#0F172A] tracking-[-0.03em] leading-tight">
                {heroHeadline}
              </h1>
              <p className="text-sm text-[#64748B] mb-6 leading-relaxed border-l-2 border-[#0B57FF] pl-4">
                {heroSubheadline}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <button 
                  onClick={() => setFilter('sale')}
                  className={`w-full py-3 px-5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${filter === 'sale' ? 'bg-[#0B57FF] text-white shadow-[0px_4px_24px_0px_rgba(11,87,255,0.25)]' : 'bg-white border border-[#1D4ED8] text-[#0F172A] hover:bg-slate-50'}`}
                >
                  <span>Browse Homes for Sale</span>
                  {filter === 'sale' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
                </button>
                <button 
                  onClick={() => setFilter('rent')}
                  className={`w-full py-3 px-5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 ${filter === 'rent' ? 'bg-[#0B57FF] text-white shadow-[0px_4px_24px_0px_rgba(11,87,255,0.25)]' : 'bg-white border border-[#1D4ED8] text-[#0F172A] hover:bg-slate-50'}`}
                >
                  <span>Browse Homes for Rent</span>
                  {filter === 'rent' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#0F172A]/8 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="w-full lg:w-1/3">
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] mb-2 inline-block bg-[#E0EBFF] px-3 py-1 rounded-full border border-[#0B57FF]/20">
              {mapBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] mb-4 text-[#0F172A]">{mapTitle}</h2>
            <p className="text-sm sm:text-base text-[#64748B] mb-6 leading-relaxed border-l-2 border-[#0B57FF] pl-4">
              {mapDescription}
            </p>
            <div className="flex gap-2">
              <div className="flex-grow flex items-center bg-white border border-[#0F172A]/8 rounded-xl px-4 py-3 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)]">
                <MapPin className="w-4 h-4 text-[#0B57FF] mr-2 shrink-0" />
                <span className="text-xs sm:text-sm text-[#0F172A] font-semibold">Showing {filteredHouses.length} available properties</span>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3 bg-slate-100 rounded-2xl overflow-hidden border border-[#0F172A]/8 shadow-sm h-[380px] sm:h-[440px] lg:h-[480px] relative flex flex-col">
            {/* Region Switcher Bar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-[#0F172A]/10 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] pl-2 pr-1 shrink-0">Region:</span>
              {MAP_REGIONS.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleRegionChange(region)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    activeRegion === region.id
                      ? 'bg-[#0B57FF] text-white shadow-xs'
                      : 'bg-transparent text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>

            <div className="w-full h-full">
              <APIProvider apiKey={googleMapsApiKey}>
                <Map
                  key={`${mapCenter.lat}-${mapCenter.lng}-${mapZoom}`}
                  mapId="DEMO_MAP_ID"
                  defaultCenter={mapCenter}
                  defaultZoom={mapZoom}
                  gestureHandling={'greedy'}
                  disableDefaultUI={false}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  {filteredHouses.map((house) => (
                    <AdvancedMarker key={house.id} position={house.location} title={house.title}>
                      <Pin background={'#0B57FF'} borderColor={'#1D4ED8'} glyphColor={'#ffffff'} />
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] mb-1 inline-block bg-[#E0EBFF] px-3 py-1 rounded-full border border-[#0B57FF]/20">
              Available Properties
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] leading-tight text-[#0F172A]">
              {filteredHouses.length} {filteredHouses.length === 1 ? 'community' : 'communities'} ready for you.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-initial rounded-full py-2.5 px-5 text-xs sm:text-sm font-semibold transition-all ${filter === 'all' ? 'bg-[#0B57FF] text-white shadow-xs' : 'bg-white border border-[#0F172A]/10 text-[#0F172A] hover:bg-slate-50'}`}
            >
              All Properties
            </button>
            <button 
              onClick={() => setFilter('sale')}
              className={`flex-1 sm:flex-initial rounded-full py-2.5 px-5 text-xs sm:text-sm font-semibold transition-all ${filter === 'sale' ? 'bg-[#0B57FF] text-white shadow-xs' : 'bg-white border border-[#0F172A]/10 text-[#0F172A] hover:bg-slate-50'}`}
            >
              For Sale
            </button>
            <button 
              onClick={() => setFilter('rent')}
              className={`flex-1 sm:flex-initial rounded-full py-2.5 px-5 text-xs sm:text-sm font-semibold transition-all ${filter === 'rent' ? 'bg-[#0B57FF] text-white shadow-xs' : 'bg-white border border-[#0F172A]/10 text-[#0F172A] hover:bg-slate-50'}`}
            >
              For Rent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex space-x-2">
              <div className="h-3 w-3 bg-[#0B57FF] rounded-full"></div>
              <div className="h-3 w-3 bg-[#0B57FF] rounded-full animation-delay-200"></div>
              <div className="h-3 w-3 bg-[#0B57FF] rounded-full animation-delay-400"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <article key={house.id} className="border border-[#0F172A]/8 rounded-2xl overflow-hidden flex flex-col bg-white shadow-[0px_4px_24px_0px_rgba(15,23,42,0.04)] hover:shadow-[0px_4px_24px_0px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-100">
                  <img alt={house.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src={house.imageUrl} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {house.sales && (
                      <span className="bg-[#0B57FF] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                        Sale
                      </span>
                    )}
                    {house.rent && (
                      <span className="bg-[#0F172A] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                        Rent
                      </span>
                    )}
                  </div>
                  {house.sqft && (
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {house.sqft.toLocaleString()} sqft
                    </span>
                  )}
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] line-clamp-1">{house.title}</h3>
                  </div>
                  
                  <div className="mb-3 space-y-0.5">
                    {house.sales && house.price > 0 && (
                      <p className="font-bold text-[#0F172A] text-base sm:text-lg">
                        ${formatUSD(house.price)} <span className="text-xs font-normal text-[#64748B]">Sale</span>
                      </p>
                    )}
                    {house.rent && house.rentPrice && (
                      <p className="font-bold text-[#0B57FF] text-base sm:text-lg">
                        ${formatUSD(house.rentPrice)}/mo <span className="text-xs font-normal text-[#64748B]">Rent</span>
                      </p>
                    )}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[#64748B] flex items-center mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#0B57FF] mr-1 shrink-0" />
                    <span className="truncate">{house.address}</span>
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-5 text-xs text-[#64748B] bg-[#F8F9FA] p-3 rounded-xl border border-[#0F172A]/8">
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-[#0B57FF]" />
                      <span className="truncate">{house.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-[#0B57FF]" />
                      <span className="truncate">{house.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#0B57FF]" />
                      <span className="truncate">{house.sqft ? `${house.sqft} sqft` : 'Spacious'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex flex-col sm:flex-row gap-2 pt-2">
                    <Link 
                      href={`/houses/${house.id}`}
                      className="flex-1 bg-[#0B57FF] text-white text-center py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#0948D9] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ELIMI Real Estate, I am interested in property: ${house.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white border border-[#1D4ED8] text-[#0F172A] text-center py-2.5 px-4 rounded-full text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Real Address & Google Maps Interactive Explorer Section */}
        {activeHouse && (
          <div className="mt-14 pt-10 border-t border-[#0F172A]/8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] mb-1.5 inline-flex items-center gap-1 bg-[#E0EBFF] px-3 py-1 rounded-full border border-[#0B57FF]/20">
                  <MapPin className="w-3 h-3" />
                  <span>Interactive Real Address Map</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#0F172A]">
                  Explore Verified Property Locations
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 border-l-2 border-[#0B57FF] pl-4">
                  Select any property below to view its pinpoint coordinates and neighborhood surroundings on Google Maps.
                </p>
              </div>

              {/* Property Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {filteredHouses.slice(0, 5).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHouseId(h.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      activeHouse.id === h.id
                        ? 'bg-[#0B57FF] text-white shadow-xs'
                        : 'bg-white text-[#0F172A] hover:bg-slate-50 border border-[#0F172A]/8'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{h.title.split(' in ')[0] || h.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <GoogleLocationMap
              address={activeHouse.address}
              location={activeHouse.location}
              title={activeHouse.title}
              category="house"
              priceDisplay={activeHouse.sales && activeHouse.price > 0 ? `$${formatUSD(activeHouse.price)} Sale` : (activeHouse.rent && activeHouse.rentPrice ? `$${formatUSD(activeHouse.rentPrice)}/mo Rent` : undefined)}
            />
          </div>
        )}
      </section>

      {/* Real Estate Highlight / Trust Section */}
      <section className="bg-white py-16 md:py-[113px] border-t border-b border-[#0F172A]/8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider uppercase text-[#0B57FF] mb-2 inline-block bg-[#E0EBFF] px-3 py-1 rounded-full border border-[#0B57FF]/20">
              Why Choose ELIMI
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#0F172A]">Premium Living &amp; Estate Standards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-8 md:p-10 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)]">
              <div className="w-12 h-12 rounded-full bg-[#0B57FF] text-white flex items-center justify-center mb-5 shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#0F172A]">Prime Architectural Locations</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Handpicked luxury communities, panoramic views, secure residential compounds, and high-appreciation zones.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-8 md:p-10 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)]">
              <div className="w-12 h-12 rounded-full bg-[#0B57FF] text-white flex items-center justify-center mb-5 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#0F172A]">Verified Legal Title &amp; Escrow</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Complete documentation audit, notary guidance, and full security guarantees for purchases and leases.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-8 md:p-10 rounded-2xl bg-[#F8F9FA] border border-[#0F172A]/8 shadow-[0px_4px_24px_0px_rgba(15,23,42,0.02)]">
              <div className="w-12 h-12 rounded-full bg-[#0B57FF] text-white flex items-center justify-center mb-5 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#0F172A]">Concierge Lease &amp; Property Care</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                From fully furnished short-stay residences to dedicated property managers and private security staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white py-16 md:py-20 text-center border-t border-[#0F172A]/8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] mb-3 text-[#0F172A]">Ready when you are.</h2>
          <p className="text-[#64748B] text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Schedule a private consultation or tour with an ELIMI Real Estate advisor to find your residence or investment property.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <a
              href="tel:+25769992984"
              className="bg-[#0B57FF] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#0948D9] transition-colors shadow-xs"
            >
              Schedule a Consultation
            </a>
            <a
              href="tel:+25769992984"
              className="border border-[#1D4ED8] bg-transparent text-[#0F172A] px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#0B57FF]" />
              <span>Call Real Estate Concierge</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HousesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-[#64748B]">Loading properties...</div>}>
      <HousesContent />
    </Suspense>
  );
}

