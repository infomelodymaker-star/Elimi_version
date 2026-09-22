'use client';

import React, { useState, useEffect } from 'react';
import { resolveImgbbViewerUrl } from '@/lib/image-upload';
import { ExternalLink, Copy, Check, AlertCircle, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

interface CmsImagePreviewProps {
  src?: string;
  url?: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  heightClass?: string;
  aspectRatio?: 'video' | 'square' | 'auto' | 'banner';
  onRemove?: () => void;
  onApplyDirectUrl?: (resolvedUrl: string) => void;
  label?: string;
}

export function CmsImagePreview({
  src,
  url,
  fallbackSrc,
  alt = 'Image Preview',
  className = '',
  heightClass = 'h-36',
  aspectRatio = 'auto',
  onRemove,
  onApplyDirectUrl,
  label,
}: CmsImagePreviewProps) {
  const effectiveSrc = src || url || '';
  const [prevEffectiveSrc, setPrevEffectiveSrc] = useState<string>(effectiveSrc);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => effectiveSrc.trim().replace(/^["']|["']$/g, ''));
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(effectiveSrc.trim()));
  const [hasError, setHasError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Sync state if prop changes
  if (effectiveSrc !== prevEffectiveSrc) {
    setPrevEffectiveSrc(effectiveSrc);
    const cleaned = effectiveSrc.trim().replace(/^["']|["']$/g, '');
    setResolvedSrc(cleaned);
    setHasError(false);
    setIsLoading(Boolean(cleaned));
  }

  useEffect(() => {
    let isMounted = true;
    if (!effectiveSrc) return;

    const trimmed = effectiveSrc.trim().replace(/^["']|["']$/g, '');

    // If it's an ImgBB viewer link (ibb.co/xyz without i.ibb.co), resolve it asynchronously
    if (/https?:\/\/(www\.)?ibb\.co(\.com)?\/[a-zA-Z0-9_-]+/i.test(trimmed) && !trimmed.includes('i.ibb.co')) {
      resolveImgbbViewerUrl(trimmed).then((direct) => {
        if (!isMounted) return;
        if (direct && direct !== trimmed) {
          setResolvedSrc(direct);
          if (onApplyDirectUrl) onApplyDirectUrl(direct);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [effectiveSrc, retryCount, onApplyDirectUrl]);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resolvedSrc) return;
    navigator.clipboard.writeText(resolvedSrc).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setHasError(false);
    setRetryCount((c) => c + 1);
  };

  if (!src && !resolvedSrc) {
    return null;
  }

  const isImgbb = resolvedSrc.includes('ibb.co');
  const isLocal = resolvedSrc.startsWith('/uploads/') || resolvedSrc.startsWith('/api/uploads/');

  return (
    <div
      className={`relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 ${heightClass} ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-slate-100 flex flex-col items-center justify-center gap-2 animate-pulse text-slate-400">
          <ImageIcon className="w-6 h-6 opacity-40 animate-bounce" />
          <span className="text-[11px] font-medium tracking-wide">Loading image preview...</span>
        </div>
      )}

      {/* Error / Fallback State */}
      {hasError ? (
        <div className="absolute inset-0 z-10 bg-rose-50/90 p-4 flex flex-col items-center justify-center text-center gap-2">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <div className="max-w-[240px]">
            <p className="text-xs font-semibold text-rose-800">Preview could not be loaded</p>
            <p className="text-[10px] text-rose-600 mt-0.5 truncate">
              {isImgbb ? 'ImgBB hotlink blocked or URL incomplete' : 'Invalid or inaccessible image URL'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-xs hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
            <a
              href={resolvedSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-white border border-blue-200 px-2.5 py-1 rounded-md shadow-xs hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Open Link
            </a>
          </div>
        </div>
      ) : (
        /* The Image */
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            // If direct external link fails and not already using proxy, try image proxy
            if (
              resolvedSrc.startsWith('http') &&
              !resolvedSrc.includes('/api/proxy-image')
            ) {
              const proxied = `/api/proxy-image?url=${encodeURIComponent(resolvedSrc)}`;
              setResolvedSrc(proxied);
              return;
            }

            setIsLoading(false);
            if (fallbackSrc && fallbackSrc !== resolvedSrc) {
              setResolvedSrc(fallbackSrc);
            } else {
              setHasError(true);
            }
          }}
        />
      )}

      {/* Top badges: Source & Label */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
        {label && (
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
            {label}
          </span>
        )}
        {isImgbb && (
          <span className="bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
            ImgBB
          </span>
        )}
        {isLocal && (
          <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
            Server File
          </span>
        )}
      </div>

      {/* Action Controls on Hover */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-xs p-1 rounded-lg">
        <button
          type="button"
          onClick={handleCopyUrl}
          title={copied ? 'Copied!' : 'Copy direct image link'}
          className="p-1 rounded text-white/90 hover:text-white hover:bg-white/20 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <a
          href={resolvedSrc}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          className="p-1 rounded text-white/90 hover:text-white hover:bg-white/20 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove image"
            className="p-1 rounded text-white/90 hover:text-rose-300 hover:bg-rose-500/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom overlay with URL preview */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-[11px] text-white/80">
        <span className="truncate max-w-[85%] font-mono text-[10px]">{resolvedSrc}</span>
      </div>
    </div>
  );
}
