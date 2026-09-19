'use client';

/**
 * Client-side image compression and resilient upload helper.
 * Prevents Nginx 413 (Payload Too Large), catches non-JSON HTML responses,
 * and gracefully falls back to optimized data URLs if ImgBB is unreachable or unconfigured.
 */

export interface UploadResult {
  success: boolean;
  url: string;
  source: 'imgbb' | 'local' | 'fallback';
  warning?: string;
}

/**
 * Compresses an image file in the browser using an offscreen canvas.
 * Reduces multi-megabyte camera/phone photos down to ~100-300KB without perceptible quality degradation.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve) => {
    // If not an image, resolve with raw file as fallback
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
 * Safely uploads an image file:
 * 1. Pre-compresses image client-side to prevent request body limits and timeouts.
 * 2. Sends optimized blob to /api/upload-image.
 * 3. Safely extracts response text to prevent "Unexpected token '<'" JSON parsing errors.
 * 4. If ImgBB succeeds, returns hosted CDN URL.
 * 5. If ImgBB fails (missing key, Cloudflare block, offline), falls back to compressed data URL.
 */
export async function uploadImageSafely(file: File, namePrefix = 'upload'): Promise<UploadResult> {
  let compressed: { blob: Blob; dataUrl: string };
  try {
    compressed = await compressImageFile(file, 1600, 0.85);
  } catch {
    compressed = { blob: file, dataUrl: '' };
  }

  try {
    const formData = new FormData();
    formData.append('image', compressed.blob, file.name || `${namePrefix}.jpg`);
    formData.append('name', `${namePrefix}-${Date.now()}`);

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const responseText = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(responseText);
    } catch {
      // Response was non-JSON HTML (e.g. <!doctype html> 502/504 error)
      console.warn('Upload endpoint returned non-JSON response');
    }

    if (res.ok && json?.success && json?.url) {
      return {
        success: true,
        url: json.url,
        source: json.source === 'imgbb' ? 'imgbb' : 'local',
        warning: json.warning,
      };
    }

    // If ImgBB failed, but we have compressed data URL, use it as fallback
    if (compressed.dataUrl) {
      const errMsg = json?.error || `Upload API returned status ${res.status}`;
      return {
        success: true,
        url: compressed.dataUrl,
        source: 'fallback',
        warning: errMsg,
      };
    }

    return {
      success: false,
      url: '',
      source: 'fallback',
      warning: json?.error || 'Failed to process image',
    };
  } catch (err: any) {
    console.warn('Network error during image upload:', err.message);
    if (compressed.dataUrl) {
      return {
        success: true,
        url: compressed.dataUrl,
        source: 'fallback',
        warning: err.message,
      };
    }
    return {
      success: false,
      url: '',
      source: 'fallback',
      warning: err.message || 'Image upload failed',
    };
  }
}
