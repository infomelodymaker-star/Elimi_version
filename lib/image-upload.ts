'use client';

/**
 * Client-side image compression and direct ImgBB + server fallback upload helper.
 * Uploads directly from the user's browser to ImgBB using the configured API key,
 * ensuring images appear immediately in the user's ImgBB account and return live i.ibb.co URLs.
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

let cachedImgbbKey: string | null = null;
let keyFetchPromise: Promise<string> | null = null;

/**
 * Retrieves the ImgBB API key from the server environment or client storage.
 */
export async function getImgbbApiKey(): Promise<string> {
  if (cachedImgbbKey !== null) {
    return cachedImgbbKey;
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('imgbb_api_key');
    if (local && local.trim()) {
      cachedImgbbKey = local.trim();
      return cachedImgbbKey;
    }
  }

  if (!keyFetchPromise) {
    keyFetchPromise = fetch('/api/imgbb-key')
      .then((res) => (res.ok ? res.json() : { key: '' }))
      .then((data) => {
        const k = (data?.key || '').trim();
        cachedImgbbKey = k;
        return k;
      })
      .catch((err) => {
        console.warn('Could not fetch ImgBB key config:', err);
        return '';
      })
      .finally(() => {
        keyFetchPromise = null;
      });
  }

  return keyFetchPromise;
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
 * Uploads an image file safely:
 * 1. Pre-compresses image client-side.
 * 2. Attempts direct client-side upload to ImgBB via user's browser (ensures images appear in their ImgBB account).
 * 3. If direct ImgBB is unavailable or unconfigured, falls back to `/api/upload-image` on server.
 * 4. Returns live permanent URL and source.
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

  // 1. Try direct client-side upload to ImgBB
  const apiKey = await getImgbbApiKey();
  if (apiKey) {
    try {
      const imgbbForm = new FormData();
      // Send blob as file in FormData to ImgBB
      imgbbForm.append('image', compressed.blob, `${safeTitle}.jpg`);
      imgbbForm.append('name', safeTitle);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const imgbbRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          body: imgbbForm,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const imgbbText = await imgbbRes.text();
      let imgbbJson: any = null;
      try {
        imgbbJson = JSON.parse(imgbbText);
      } catch {
        // Non-JSON response
      }

      if (imgbbRes.ok && imgbbJson?.success) {
        // Asynchronously back up to local server in background
        let localBackupUrl = '';
        try {
          const backupForm = new FormData();
          backupForm.append('image', compressed.blob, `${safeTitle}.jpg`);
          backupForm.append('name', safeTitle);
          const backupRes = await fetch('/api/upload-image', { method: 'POST', body: backupForm });
          if (backupRes.ok) {
            const bJson = await backupRes.json();
            if (bJson?.localUrl) localBackupUrl = bJson.localUrl;
          }
        } catch {
          // Ignore background backup errors
        }

        let liveUrl =
          imgbbJson.data?.image?.url ||
          (imgbbJson.data?.display_url?.includes('i.ibb.co') ? imgbbJson.data?.display_url : '') ||
          (imgbbJson.data?.url?.includes('i.ibb.co') ? imgbbJson.data?.url : '') ||
          imgbbJson.data?.display_url ||
          imgbbJson.data?.url ||
          localBackupUrl;

        // If the URL is an HTML viewer page (e.g. ibb.co/xyz without i.ibb.co), fall back to local URL
        if (liveUrl.includes('ibb.co/') && !liveUrl.includes('i.ibb.co') && localBackupUrl) {
          liveUrl = localBackupUrl;
        }

        const thumb = imgbbJson.data?.thumb?.url || liveUrl;

        return {
          success: true,
          url: liveUrl,
          thumbUrl: thumb,
          localUrl: localBackupUrl || undefined,
          source: 'imgbb',
          message: 'Uploaded to ImgBB successfully!',
        };
      } else {
        const errorMsg = imgbbJson?.error?.message || `ImgBB returned status ${imgbbRes.status}`;
        console.warn('Direct ImgBB upload notice:', errorMsg, 'Attempting server fallback...');
      }
    } catch (directErr: any) {
      console.warn('Direct ImgBB fetch error:', directErr?.message, 'Attempting server fallback...');
    }
  }

  // 2. Server upload fallback (/api/upload-image)
  try {
    const formData = new FormData();
    formData.append('image', compressed.blob, file.name || `${safeTitle}.jpg`);
    formData.append('name', `${safeTitle}-${Date.now()}`);

    const res = await fetch('/api/upload-image', {
      method: 'POST',
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

    // 3. Fallback to compressed data URL if needed
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
