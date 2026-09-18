'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, Layers, ShieldCheck, Globe, Map as MapIcon } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface GoogleLocationMapProps {
  address: string;
  location?: { lat: number; lng: number };
  title?: string;
  category?: 'house' | 'car';
  className?: string;
  priceDisplay?: string;
  mapsLink?: string;
}

const BURUNDI_LOCATIONS = [
  { label: '📍 Exact Location', lat: 0, lng: 0, zoom: 16, isOriginal: true },
  { label: '🇧🇮 Rohero Diplomatic', lat: -3.3855, lng: 29.3640, zoom: 15 },
  { label: '⛰️ Kiriri Heights', lat: -3.3760, lng: 29.3825, zoom: 15 },
  { label: '🌊 Kinindo Plage', lat: -3.4050, lng: 29.3480, zoom: 15 },
  { label: '🏙️ Bujumbura Center', lat: -3.3822, lng: 29.3644, zoom: 14 },
  { label: '✈️ Melchior Airport', lat: -3.3240, lng: 29.3185, zoom: 14 },
  { label: '🏛️ Gitega Capital', lat: -3.4272, lng: 29.9246, zoom: 14 },
];

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function GoogleLocationMap({
  address,
  location,
  title,
  category = 'house',
  className = '',
  priceDisplay,
  mapsLink
}: GoogleLocationMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  
  // Default to Burundi (Bujumbura)
  const defaultBurundiCenter = { lat: -3.3822, lng: 29.3644 };
  const targetLocation = location || defaultBurundiCenter;

  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>(targetLocation);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>('📍 Exact Location');

  const [prevLocation, setPrevLocation] = useState(location);
  if (location !== prevLocation) {
    setPrevLocation(location);
    if (location) {
      setCurrentCenter(location);
      setCurrentZoom(15);
      setActiveLocationLabel('📍 Exact Location');
    }
  }

  const googleMapsDirectionsUrl = mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${currentCenter.lat},${currentCenter.lng}`)}`;

  const handleSelectBurundiPreset = (preset: typeof BURUNDI_LOCATIONS[0]) => {
    if (preset.isOriginal && location) {
      setCurrentCenter(location);
      setCurrentZoom(preset.zoom);
      setActiveLocationLabel(preset.label);
    } else {
      setCurrentCenter({ lat: preset.lat, lng: preset.lng });
      setCurrentZoom(preset.zoom);
      setActiveLocationLabel(preset.label);
    }
  };

  return (
    <div className={`w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 mb-14 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-[#0B57FF]/10 text-[#0B57FF] text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md">
              <MapPin className="w-3 h-3" />
              <span>Burundi Coordinates &amp; Location</span>
            </span>
            {category === 'house' ? (
              <span className="text-xs text-gray-500 font-medium">Verified Property in Burundi</span>
            ) : (
              <span className="text-xs text-gray-500 font-medium">Burundi Fleet Hub &amp; Showroom</span>
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
            {address}
          </h2>
          {location && (
            <p className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
              <span>GPS: {Math.abs(location.lat).toFixed(4)}° S, {location.lng.toFixed(4)}° E (Burundi)</span>
              <span>•</span>
              <span className="text-emerald-600 font-sans font-medium flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Pinpoint verified
              </span>
            </p>
          )}
        </div>

        {/* Action Button: Get Directions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0B57FF] hover:bg-[#0948D4] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-2 hover:scale-102 active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Burundi Location Preset Switcher Bar */}
      <div className="mb-4 bg-[#F8F9FA] p-3 rounded-2xl border border-zinc-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#0B57FF]" />
            <span>Change Burundi Map View / Explore Regions:</span>
          </span>
          <span className="text-[11px] text-[#64748B] font-mono">Burundi Standard Time (GMT+2)</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {BURUNDI_LOCATIONS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectBurundiPreset(preset)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeLocationLabel === preset.label
                  ? 'bg-[#0B57FF] text-white shadow-xs'
                  : 'bg-white text-[#0F172A] hover:bg-slate-100 border border-zinc-200/80'
              }`}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Controls Bar (Layers & Zoom) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#F8F9FA] p-2.5 sm:p-3 rounded-2xl border border-zinc-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 pl-1">
            <Layers className="w-3.5 h-3.5 text-[#0B57FF]" />
            <span>Layer:</span>
          </span>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-[#0B57FF] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Street View / Roadmap
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-[#0B57FF] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Satellite View
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="text-gray-500 font-medium">Zoom:</span>
          <button
            type="button"
            onClick={() => setCurrentZoom((prev) => Math.min(prev + 1, 19))}
            className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-bold flex items-center justify-center text-gray-800 shadow-xs cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setCurrentZoom((prev) => Math.max(prev - 1, 10))}
            className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-bold flex items-center justify-center text-gray-800 shadow-xs cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* Google Maps Interactive Container */}
      <div className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-inner border border-zinc-200 bg-gray-100">
        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            mapId="DEMO_MAP_ID"
            center={currentCenter}
            zoom={currentZoom}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapTypeId={mapType}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {location && (
              <AdvancedMarker position={location} title={title || address}>
                <Pin background={'#0B57FF'} borderColor={'#0033b3'} glyphColor={'#fff'} />
              </AdvancedMarker>
            )}
          </Map>
        </APIProvider>

        {/* Floating Location Card Overlay on Top of Map */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-gray-200/90 shadow-lg pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-[#0B57FF] text-white rounded-lg shrink-0 mt-0.5 shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {title || address}
              </p>
              <p className="text-[11px] text-gray-600 truncate mt-0.5">
                {address}
              </p>
              {priceDisplay && (
                <p className="text-xs font-bold text-[#0B57FF] mt-1">
                  {priceDisplay}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Notes */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-2">
        <p>
          Need chauffeur pickup or customized private escort to this location in Burundi? Our concierge desk is available 24/7.
        </p>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0B57FF] font-semibold hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Calculate Route &amp; Directions</span>
          <ArrowRightIcon className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

