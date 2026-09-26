import { NextRequest, NextResponse } from 'next/server';
import { isSafePublicUrl } from '@/lib/ssrf-protect';

export const dynamic = 'force-dynamic';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Image proxy route:
 * Securely proxies public images with SSRF protection, size limits, and Content-Type validation.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const trimmed = targetUrl.trim();

    // Prevent recursive proxying
    if (trimmed.includes('/api/proxy-image') || trimmed.includes('/api/resolve-image')) {
      return NextResponse.json({ error: 'Invalid recursive URL' }, { status: 400 });
    }

    // SSRF Validation
    const validation = isSafePublicUrl(trimmed);
    if (!validation.safe) {
      return NextResponse.json({ error: validation.reason || 'Invalid or forbidden URL' }, { status: 403 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(trimmed, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: '',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned status ${res.status}` },
        { status: res.status }
      );
    }

    const rawContentType = res.headers.get('content-type') || 'image/jpeg';
    const cleanContentType = rawContentType.split(';')[0].trim().toLowerCase();

    // Ensure it's an image
    if (!ALLOWED_CONTENT_TYPES.includes(cleanContentType) && !cleanContentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Target URL is not a recognized image resource' }, { status: 415 });
    }

    const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image exceeds maximum allowed size (10MB)' }, { status: 413 });
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image exceeds maximum allowed size (10MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': cleanContentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching proxied image' },
      { status: 500 }
    );
  }
}
