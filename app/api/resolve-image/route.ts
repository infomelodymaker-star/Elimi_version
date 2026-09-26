import { NextRequest, NextResponse } from 'next/server';
import { isSafePublicUrl } from '@/lib/ssrf-protect';

export const dynamic = 'force-dynamic';

const ALLOWED_RESOLVE_HOSTS = ['ibb.co', 'ibb.co.com', 'www.ibb.co', 'i.ibb.co'];

/**
 * Resolves an image URL:
 * If the input is an ImgBB viewer URL (e.g. https://ibb.co/xyz or https://ibb.co.com/xyz),
 * this endpoint fetches the page and extracts the direct raw image URL (https://i.ibb.co/...).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const trimmed = targetUrl.trim();

    // Already a direct image file or data URI
    if (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('/uploads/') ||
      trimmed.startsWith('/api/uploads/') ||
      trimmed.includes('i.ibb.co')
    ) {
      return NextResponse.json({ success: true, directUrl: trimmed });
    }

    // SSRF Validation
    const validation = isSafePublicUrl(trimmed);
    if (!validation.safe || !validation.url) {
      return NextResponse.json({ error: validation.reason || 'Invalid or disallowed URL' }, { status: 403 });
    }

    const host = validation.url.hostname.toLowerCase();
    const isAllowedHost = ALLOWED_RESOLVE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

    if (!isAllowedHost) {
      return NextResponse.json(
        { error: 'Resolve endpoint is restricted to ImgBB viewer pages' },
        { status: 403 }
      );
    }

    const redirectMode = searchParams.get('redirect') === 'true' || req.headers.get('accept')?.includes('image/');

    let finalDirectUrl = trimmed;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(trimmed, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();

        // 1. Look for og:image meta tag
        const ogMatch =
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (ogMatch && ogMatch[1]) {
          finalDirectUrl = ogMatch[1];
        } else {
          // 2. Look for twitter:image meta tag
          const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
          if (twitterMatch && twitterMatch[1]) {
            finalDirectUrl = twitterMatch[1];
          } else {
            // 3. Look for direct i.ibb.co link in HTML
            const directMatch = html.match(/https?:\/\/i\.ibb\.co(\.com)?\/[a-zA-Z0-9_\/.-]+/i);
            if (directMatch && directMatch[0]) {
              finalDirectUrl = directMatch[0];
            }
          }
        }
      }
    } catch (fetchErr: any) {
      console.warn('Could not scrape ImgBB viewer page:', fetchErr?.message);
    }

    if (redirectMode && finalDirectUrl.startsWith('http')) {
      return NextResponse.redirect(finalDirectUrl, { status: 302 });
    }

    return NextResponse.json({ success: true, directUrl: finalDirectUrl });
  } catch (error: any) {
    console.error('Error in resolve-image endpoint:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
