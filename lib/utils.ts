import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const WHATSAPP_NUMBER = '25769992984';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures an image URL can be rendered directly by browser <img> or Next <Image>.
 * If the URL is an ImgBB web viewer page (ibb.co/xyz), routes through /api/resolve-image with redirect.
 */
export function formatSafeImageUrl(url: string | undefined | null, fallback = '/images/placeholder.jpg'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (
    /https?:\/\/(www\.)?ibb\.co(\.com)?\/[a-zA-Z0-9_-]+/i.test(trimmed) &&
    !trimmed.includes('i.ibb.co')
  ) {
    return `/api/resolve-image?url=${encodeURIComponent(trimmed)}&redirect=true`;
  }

  return trimmed;
}
