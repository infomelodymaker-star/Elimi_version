'use client';

import { auth } from './firebase';

/**
 * Client-side image compression and secure server upload helper.
 * Uploads securely through the server-side proxy `/api/upload-image`, which manages
 * ImgBB integration and local disk fallback without exposing API keys to the browser.
 */

export interface UploadResult {
  success: boolean;
  url: string;
  localUrl?: string;
  thumbUrl?: string;
  source: 'imgbb' | 'local' | 'fallback';
  message?: string;
  warning?: string;
}

/**
 * Resolves an ImgBB or external viewer URL to a direct raw image link.
 * If the link is an HTML viewer like https://ibb.co/xyz, it resolves to https://i.ibb.co/...
 */
export async function resolveImgbbViewerUrl(url: string): Promise<string> {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().replace(/^["']|["']$/g, '');

  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('/api/uploads/') ||
    trimmed.includes('i.ibb.co')
  ) {
    return trimmed;
  }

  // If it's an ImgBB viewer page (ibb.co/xyz or ibb.co.com/xyz)
  if (/https?:\/\/(www\.)?ibb\.co(\.com)?\/[a-zA-Z0-9_-]+/i.test(trimmed)) {
    try {
      const res = await fetch(`/api/resolve-image?url=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.directUrl) {
          return data.directUrl;
        }
      }
    } catch {
      // Return original if resolution fails
    }
  }

  return trimmed;
}

/**
 * Cleans, sanitizes, and normalizes an image URL string.
 */
export function cleanAndFormatImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/^["']|["']$/g, '');
}

/**
 * Checks if ImgBB upload is configured on the server.
 */
export async function checkImgbbConfigured(): Promise<boolean> {
  try {
    const res = await fetch('/api/imgbb-key');
    if (res.ok) {
      const data = await res.json();
      return Boolean(data?.configured);
    }
  } catch {
    // Default false
  }
  return false;
}

/**
 * Compresses an image file in the browser using an offscreen canvas.
 * Reduces multi-megabyte camera/phone photos down to ~150-350KB without perceptible quality degradation.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: (reader.result as string) || '' });
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ blob: file, dataUrl: (reader.result as string) || '' });
        reader.onerror = () => resolve({ blob: file, dataUrl: '' });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            resolve({ blob: file, dataUrl });
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: (reader.result as string) || '' });
      reader.onerror = () => resolve({ blob: file, dataUrl: '' });
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image file safely through the server-side `/api/upload-image` endpoint:
 * 1. Pre-compresses image client-side for rapid transport.
 * 2. Sends multipart FormData to server `/api/upload-image`.
 * 3. Server uploads to ImgBB (using server-side secret key) and falls back to durable disk storage.
 * 4. Returns permanent live URL.
 */
export async function uploadImageSafely(
  file: File,
  namePrefix = 'upload'
): Promise<UploadResult> {
  let compressed: { blob: Blob; dataUrl: string };
  try {
    compressed = await compressImageFile(file, 1600, 0.85);
  } catch {
    compressed = { blob: file, dataUrl: '' };
  }

  const safeTitle = (namePrefix || 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .slice(0, 40);

  try {
    const formData = new FormData();
    formData.append('image', compressed.blob, file.name || `${safeTitle}.jpg`);
    formData.append('name', `${safeTitle}-${Date.now()}`);

    const headers: Record<string, string> = {};
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch {
      // Non-blocking
    }

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseText = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(responseText);
    } catch {
      console.warn('Upload endpoint returned non-JSON response');
    }

    if (res.ok && json?.success && json?.url) {
      return {
        success: true,
        url: json.url,
        localUrl: json.localUrl || json.url,
        thumbUrl: json.thumb || json.url,
        source: json.source === 'imgbb' ? 'imgbb' : 'local',
        message:
          json.source === 'imgbb'
            ? 'Uploaded to ImgBB successfully!'
            : 'Image saved to server storage successfully!',
        warning: json.warning,
      };
    }

    // Fallback to compressed data URL if server returned error but client has compressed data
    if (compressed.dataUrl) {
      return {
        success: true,
        url: compressed.dataUrl,
        source: 'fallback',
        message: 'Image loaded locally.',
        warning: json?.error || `Upload API returned status ${res.status}`,
      };
    }

    return {
      success: false,
      url: '',
      source: 'fallback',
      message: json?.error || 'Failed to process image upload.',
      warning: json?.error || 'Failed to process image',
    };
  } catch (err: any) {
    console.warn('Server upload error:', err?.message);
    if (compressed.dataUrl) {
      return {
        success: true,
        url: compressed.dataUrl,
        source: 'fallback',
        message: 'Image loaded locally.',
        warning: err.message,
      };
    }
    return {
      success: false,
      url: '',
      source: 'fallback',
      message: err.message || 'Image upload failed.',
      warning: err.message || 'Image upload failed',
    };
  }
}
