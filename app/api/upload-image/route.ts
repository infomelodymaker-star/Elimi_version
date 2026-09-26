import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { verifyServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB for high-res dashboard catalog media

/**
 * Validates binary buffer headers against known safe raster image magic bytes.
 * Strictly forbids SVG (to prevent Stored XSS) and non-image payloads.
 */
function detectSafeImageMime(buffer: Buffer): { valid: boolean; ext: string; mime: string } {
  if (buffer.length < 12) {
    return { valid: false, ext: '', mime: '' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: '.png', mime: 'image/png' };
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: true, ext: '.gif', mime: 'image/gif' };
  }

  // WEBP: 'RIFF' .... 'WEBP'
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, ext: '.webp', mime: 'image/webp' };
  }

  return { valid: false, ext: '', mime: '' };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check if authenticated admin is uploading from Dashboard
    const authCheck = await verifyServerAuth(req);
    const isAuthenticated = authCheck.authenticated;

    // Generous quota for admins (600 uploads / 5 mins) or standard IP rate limit (100 uploads / 5 mins)
    const clientIp = getClientIp(req);
    const limitCount = isAuthenticated ? 600 : 100;
    const rateLimitKey = isAuthenticated
      ? `admin-upload-${authCheck.user?.uid || 'auth'}`
      : `anon-upload-${clientIp}`;

    const rateLimit = checkRateLimit(rateLimitKey, limitCount, 5 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite temporaire de téléversement atteinte. Veuillez patienter un instant.',
        },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString() },
        }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let fileBuffer: Buffer | null = null;
    let customName = '';

    if (contentType.includes('multipart/form-data')) {
      const incomingFormData = await req.formData();
      const file = incomingFormData.get('image') || incomingFormData.get('file');

      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { success: false, error: 'No image file found in multipart upload' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      customName = (incomingFormData.get('name') as string) || '';
    } else {
      const json = await req.json();
      const { image, name } = json;

      if (!image) {
        return NextResponse.json(
          { success: false, error: 'No image data provided in JSON payload' },
          { status: 400 }
        );
      }

      customName = name || '';

      if (typeof image === 'string' && image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          fileBuffer = Buffer.from(matches[2], 'base64');
        } else {
          const clean = image.split('base64,')[1] || image;
          fileBuffer = Buffer.from(clean, 'base64');
        }
      } else if (typeof image === 'string') {
        fileBuffer = Buffer.from(image, 'base64');
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty or unparseable image content' },
        { status: 400 }
      );
    }

    // 2. Enforce size limit (25MB)
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit (25MB)' },
        { status: 413 }
      );
    }

    // 3. Inspect magic bytes signature (Reject SVGs, HTML, executable payloads)
    const imageInfo = detectSafeImageMime(fileBuffer);
    if (!imageInfo.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format de fichier non sécurisé. Seuls JPG, PNG, WebP et GIF sont autorisés.',
        },
        { status: 415 }
      );
    }

    const ext = imageInfo.ext;

    // 4. Safe sanitized file prefix (prevents path traversal)
    const safePrefix =
      customName
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'media';

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const savedFileName = `${safePrefix}-${Date.now()}-${randomSuffix}${ext}`;

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save locally
    const localFilePath = path.join(uploadsDir, savedFileName);
    fs.writeFileSync(localFilePath, fileBuffer);
    const localPublicUrl = `/uploads/${savedFileName}`;

    // Attempt ImgBB upload if key is configured
    const rawKey =
      process.env.IMGBB_API_KEY ||
      process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
      process.env.IMGBB_KEY ||
      process.env.IMGBB_SECRET ||
      process.env.IMG_BB_API_KEY ||
      process.env.IMG_BB_KEY ||
      process.env.IMGBB;

    const apiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

    if (apiKey) {
      try {
        const imgbbFormData = new FormData();
        const base64Data = fileBuffer.toString('base64');
        imgbbFormData.append('image', base64Data);
        if (customName) {
          imgbbFormData.append('name', safePrefix);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const imgbbUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;
        const imgbbResponse = await fetch(imgbbUrl, {
          method: 'POST',
          body: imgbbFormData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await imgbbResponse.text();
        let result: any = null;
        try {
          result = JSON.parse(responseText);
        } catch {
          // Non-JSON response
        }

        if (imgbbResponse.ok && result?.success) {
          let hostedUrl =
            result.data?.image?.url ||
            (result.data?.display_url?.includes('i.ibb.co') ? result.data?.display_url : '') ||
            (result.data?.url?.includes('i.ibb.co') ? result.data?.url : '') ||
            result.data?.display_url ||
            result.data?.url ||
            localPublicUrl;

          if (hostedUrl.includes('ibb.co/') && !hostedUrl.includes('i.ibb.co')) {
            hostedUrl = localPublicUrl;
          }

          return NextResponse.json({
            success: true,
            url: hostedUrl,
            localUrl: localPublicUrl,
            thumb: result.data?.thumb?.url || hostedUrl,
            source: 'imgbb',
          });
        } else {
          return NextResponse.json({
            success: true,
            url: localPublicUrl,
            localUrl: localPublicUrl,
            source: 'local',
            warning: 'Image saved to server storage.',
          });
        }
      } catch (imgbbErr: any) {
        return NextResponse.json({
          success: true,
          url: localPublicUrl,
          localUrl: localPublicUrl,
          source: 'local',
          warning: 'Image saved to server storage.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      url: localPublicUrl,
      localUrl: localPublicUrl,
      source: 'local',
    });
  } catch (error) {
    console.error('Error in /api/upload-image route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du traitement du téléversement',
      },
      { status: 500 }
    );
  }
}
