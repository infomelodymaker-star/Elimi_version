import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let fileBuffer: Buffer | null = null;
    let originalName = 'upload.jpg';
    let mimeType = 'image/jpeg';
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

      originalName = (file as any).name || 'upload.jpg';
      mimeType = file.type || 'image/jpeg';
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

      // Check if it's base64 data URL or raw base64
      if (typeof image === 'string' && image.startsWith('data:')) {
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
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

    // Determine safe extension
    let ext = '.jpg';
    if (mimeType.includes('png') || originalName.endsWith('.png')) ext = '.png';
    else if (mimeType.includes('webp') || originalName.endsWith('.webp')) ext = '.webp';
    else if (mimeType.includes('gif') || originalName.endsWith('.gif')) ext = '.gif';
    else if (mimeType.includes('svg') || originalName.endsWith('.svg')) ext = '.svg';

    // Safe sanitized prefix
    const safePrefix = (customName || path.parse(originalName).name || 'img')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 30);

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
      process.env.IMGBB ||
      process.env.imgbb_api_key ||
      process.env.imgbb ||
      process.env.NEXT_PUBLIC_IMGBB;

    const apiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

    if (apiKey) {
      try {
        const imgbbFormData = new FormData();
        const base64Data = fileBuffer.toString('base64');
        imgbbFormData.append('image', base64Data);
        if (customName) {
          imgbbFormData.append('name', customName);
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
          // Prioritize direct image link (i.ibb.co) over HTML viewer link (ibb.co)
          let hostedUrl =
            result.data?.image?.url ||
            (result.data?.display_url?.includes('i.ibb.co') ? result.data?.display_url : '') ||
            (result.data?.url?.includes('i.ibb.co') ? result.data?.url : '') ||
            result.data?.display_url ||
            result.data?.url ||
            localPublicUrl;

          // If the link is an HTML viewer page (e.g. ibb.co/xyz without i.ibb.co), prefer localPublicUrl
          // so the user and public site get a working direct image immediately!
          if (
            hostedUrl.includes('ibb.co/') &&
            !hostedUrl.includes('i.ibb.co')
          ) {
            hostedUrl = localPublicUrl;
          }

          return NextResponse.json({
            success: true,
            url: hostedUrl,
            localUrl: localPublicUrl,
            thumb: result.data?.thumb?.url || hostedUrl,
            source: 'imgbb',
            data: result.data,
          });
        } else {
          const errorMsg = result?.error?.message || `ImgBB returned HTTP ${imgbbResponse.status}`;
          console.warn(`ImgBB upload fallback: ${errorMsg}. Using local URL: ${localPublicUrl}`);
          return NextResponse.json({
            success: true,
            url: localPublicUrl,
            localUrl: localPublicUrl,
            source: 'local',
            warning: `ImgBB notice: ${errorMsg}. Image saved to server storage.`,
          });
        }
      } catch (imgbbErr: any) {
        console.warn('ImgBB upload error, falling back to local file:', imgbbErr?.message);
        return NextResponse.json({
          success: true,
          url: localPublicUrl,
          localUrl: localPublicUrl,
          source: 'local',
          warning: 'ImgBB network error. Image saved to server storage.',
        });
      }
    }

    // No ImgBB key configured - return permanent local URL
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
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error while processing image upload',
      },
      { status: 500 }
    );
  }
}
