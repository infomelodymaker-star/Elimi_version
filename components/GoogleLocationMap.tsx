'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, Layers, ShieldCheck } from 'lucide-react';
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
  const [zoom, setZoom] = useState<number>(15);

  const fallbackCenter = { lat: 34.0522, lng: -118.2437 };
  const mapCenter = location || fallbackCenter;

  const googleMapsDirectionsUrl = mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${mapCenter.lat},${mapCenter.lng}`)}`;

  return (
    <div className={`w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 mb-14 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-[#0D52FF]/10 text-[#0D52FF] text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md">
              <MapPin className="w-3 h-3" />
              <span>Real Location &amp; Coordinates</span>
            </span>
            {category === 'house' ? (
              <span className="text-xs text-gray-500 font-medium">Verified Property Address</span>
            ) : (
              <span className="text-xs text-gray-500 font-medium">Fleet Hub &amp; Pickup Point</span>
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {address}
          </h2>
          {location && (
            <p className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
              <span>GPS: {location.lat.toFixed(4)}° N, {Math.abs(location.lng).toFixed(4)}° W</span>
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
            className="bg-[#0D52FF] hover:bg-[#0b45d6] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 hover:scale-102 active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Interactive Map Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#f8f5f0] p-2.5 sm:p-3 rounded-2xl border border-gray-200/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 pl-1">
            <Layers className="w-3.5 h-3.5 text-[#0D52FF]" />
            <span>Map View:</span>
          </span>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              mapType === 'roadmap'
                ? 'bg-[#0D52FF] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Street View / Roadmap
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              mapType === 'satellite'
                ? 'bg-[#0D52FF] text-white shadow-xs'
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
            onClick={() => setZoom((prev) => Math.min(prev + 1, 19))}
            className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-bold flex items-center justify-center text-gray-800 shadow-xs"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(prev - 1, 10))}
            className="w-7 h-7 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-bold flex items-center justify-center text-gray-800 shadow-xs"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      {/* Google Maps Interactive Container */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100">
        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={mapCenter}
            defaultZoom={zoom}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapTypeId={mapType}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {location && (
              <AdvancedMarker position={location} title={title || address}>
                <Pin background={'#0D52FF'} borderColor={'#0033b3'} glyphColor={'#fff'} />
              </AdvancedMarker>
            )}
          </Map>
        </APIProvider>

        {/* Floating Location Card Overlay on Top of Map */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-gray-200/90 shadow-lg pointer-events-auto">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-[#0D52FF] text-white rounded-lg shrink-0 mt-0.5 shadow-sm">
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
                <p className="text-xs font-bold text-[#0D52FF] mt-1">
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
          Need chauffeur pickup or customized private escort to this location? Our concierge desk is available 24/7.
        </p>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0D52FF] font-semibold hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Calculate Route &amp; ETA</span>
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
