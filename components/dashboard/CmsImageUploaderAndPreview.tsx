'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  X,
  ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { uploadImageSafely, resolveImgbbViewerUrl } from '@/lib/image-upload';

interface CmsImageUploaderAndPreviewProps {
  label?: string;
  sublabel?: string;
  value: string;
  onChange: (newUrl: string) => void;
  onUploadSuccess?: (newUrl: string) => void;
  namePrefix?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'tall' | 'auto';
  placeholder?: string;
  disabled?: boolean;
}

export default function CmsImageUploaderAndPreview({
  label = 'Image URL',
  sublabel,
  value,
  onChange,
  onUploadSuccess,
  namePrefix = 'cms-image',
  aspectRatio = 'video',
  placeholder = 'https://i.ibb.co/... or /uploads/...',
  disabled = false,
}: CmsImageUploaderAndPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState(value);
  const [displaySrc, setDisplaySrc] = useState<string>(() => (value || '').trim());

  // Reset error state when the URL value changes
  if (value !== prevValue) {
    setPrevValue(value);
    const cleaned = (value || '').trim();
    setDisplaySrc(cleaned);
    setHasError(false);
    setIsLoadingImage(Boolean(cleaned));
  }

  // Automatically resolve ImgBB viewer pages (e.g. ibb.co/xyz) to raw direct images (i.ibb.co/...)
  useEffect(() => {
    let isMounted = true;
    const trimmed = (value || '').trim();
    if (!trimmed) return;

    if (/https?:\/\/(www\.)?ibb\.co(\.com)?\/[a-zA-Z0-9_-]+/i.test(trimmed) && !trimmed.includes('i.ibb.co')) {
      resolveImgbbViewerUrl(trimmed).then((direct) => {
        if (!isMounted) return;
        if (direct && direct !== trimmed) {
          setDisplaySrc(direct);
          onChange(direct);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [value, onChange]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Compressing & uploading to ImgBB...');

    try {
      const result = await uploadImageSafely(file, namePrefix);
      if (result.success && result.url) {
        onChange(result.url);
        if (onUploadSuccess) {
          onUploadSuccess(result.url);
        }
        setUploadStatus(
          result.source === 'imgbb'
            ? 'Uploaded to ImgBB!'
            : 'Saved to server storage!'
        );
        setTimeout(() => setUploadStatus(null), 3500);
      } else {
        setUploadStatus(result.warning || result.message || 'Upload failed');
        setTimeout(() => setUploadStatus(null), 4000);
      }
    } catch (err: any) {
      setUploadStatus(err?.message || 'Upload failed');
      setTimeout(() => setUploadStatus(null), 4000);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[160px]';
      case 'wide':
        return 'aspect-[21/9] max-w-md';
      case 'tall':
        return 'aspect-[3/4] max-w-[180px]';
      case 'auto':
        return 'h-36 max-w-sm';
      case 'video':
      default:
        return 'aspect-[16/9] max-w-xs';
    }
  };

  const isImgBB = value?.includes('ibb.co') || value?.includes('i.ibb.co');
  const isServerUpload = value?.startsWith('/uploads/') || value?.startsWith('/api/uploads/');

  return (
    <div className="space-y-2 bg-slate-50/60 p-3 rounded-xl border border-slate-200/80">
      <div className="flex items-center justify-between gap-2">
        <div>
          {label && (
            <label className="block text-xs font-semibold text-slate-800">
              {label}
            </label>
          )}
          {sublabel && (
            <p className="text-[11px] text-slate-500">{sublabel}</p>
          )}
        </div>

        {/* Source Badge */}
        {value && (
          <div className="flex items-center gap-1.5">
            {isImgBB && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-2.5 h-2.5" />
                ImgBB Hosted
              </span>
            )}
            {isServerUpload && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Local Server
              </span>
            )}
          </div>
        )}
      </div>

      {/* Input row + Upload Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isUploading}
            className="w-full text-xs p-2 pl-3 pr-8 border border-slate-300 rounded-lg bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
            placeholder={placeholder}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
              title="Clear URL"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Upload Trigger Button */}
        <label
          className={`relative overflow-hidden cursor-pointer inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition shrink-0 shadow-xs border ${
            isUploading || disabled
              ? 'bg-blue-50 text-blue-400 border-blue-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 active:scale-[0.98]'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled || isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {/* Upload Feedback Status */}
      {uploadStatus && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200/60">
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Live Image Preview Frame */}
      {value ? (
        <div className="pt-1.5">
          <div
            className={`relative rounded-lg border border-slate-200 overflow-hidden bg-slate-900/5 ${getAspectClass()} flex items-center justify-center group shadow-xs`}
          >
            {/* Loading Skeleton */}
            {isLoadingImage && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {hasError ? (
              <div className="p-3 text-center flex flex-col items-center justify-center gap-1.5 bg-rose-50/70 w-full h-full text-rose-700">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <p className="text-[11px] font-semibold">Image failed to preview</p>
                <div className="flex items-center gap-2">
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] underline text-rose-600 hover:text-rose-800 flex items-center gap-0.5"
                  >
                    <span>Check link</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setHasError(false);
                      setIsLoadingImage(true);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-medium transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <img
                key={displaySrc || value}
                src={displaySrc || value}
                alt="CMS Live Preview"
                referrerPolicy="no-referrer"
                onLoad={() => {
                  setIsLoadingImage(false);
                  setHasError(false);
                }}
                onError={() => {
                  const current = displaySrc || value;
                  if (current && current.startsWith('http') && !current.includes('/api/proxy-image')) {
                    setDisplaySrc(`/api/proxy-image?url=${encodeURIComponent(current)}`);
                    return;
                  }
                  setIsLoadingImage(false);
                  setHasError(true);
                }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isLoadingImage ? 'opacity-0' : 'opacity-100'
                }`}
              />
            )}

            {/* Hover Actions Toolbar */}
            {!hasError && (
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-md z-20">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-white hover:bg-white/20 transition"
                  title="Copy Image URL"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-white hover:bg-white/20 transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-slate-300 bg-white text-slate-400 text-xs">
          <ImageIcon className="w-4 h-4 text-slate-300 shrink-0" />
          <span>No image selected. Upload or paste a URL above.</span>
        </div>
      )}
    </div>
  );
}
