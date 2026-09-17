import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Check all potential secret naming variations and strip whitespace or wrapping quotes
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

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Clé API ImgBB manquante. Veuillez vous assurer que le secret "IMGBB_API_KEY" est configuré dans AI Studio > Secrets.',
        },
        { status: 400 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    const imgbbFormData = new FormData();

    if (contentType.includes('multipart/form-data')) {
      const incomingFormData = await req.formData();
      const file = incomingFormData.get('image') || incomingFormData.get('file');

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Aucun fichier image trouvé dans la requête' },
          { status: 400 }
        );
      }

      const fileName = (file as any).name || 'upload.jpg';
      imgbbFormData.append('image', file as Blob, fileName);
      const name = incomingFormData.get('name');
      if (name) {
        imgbbFormData.append('name', name as string);
      }
    } else {
      const json = await req.json();
      const { image, name } = json;

      if (!image) {
        return NextResponse.json(
          { success: false, error: 'No image base64 or URL provided in JSON payload' },
          { status: 400 }
        );
      }

      // If it has data:image/...;base64, prefix, remove it for ImgBB raw base64 string
      const cleanBase64 = typeof image === 'string' && image.includes('base64,')
        ? image.split('base64,')[1]
        : image;

      imgbbFormData.append('image', cleanBase64);
      if (name) {
        imgbbFormData.append('name', name);
      }
    }

    const imgbbUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;

    // Abort controller to prevent requests from hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let imgbbResponse: Response;
    try {
      imgbbResponse = await fetch(imgbbUrl, {
        method: 'POST',
        body: imgbbFormData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Safely retrieve response as text first to prevent JSON syntax crash if ImgBB returns HTML
    const responseText = await imgbbResponse.text();
    let result: any = null;

    try {
      result = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `ImgBB returned a non-JSON response (HTTP ${imgbbResponse.status}). ImgBB servers may be experiencing downtime or rate-limiting.`,
        },
        { status: 502 }
      );
    }

    if (!imgbbResponse.ok || !result?.success) {
      const errorMsg =
        result?.error?.message ||
        `ImgBB API error (Status: ${imgbbResponse.status})`;
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: imgbbResponse.status || 500 }
      );
    }

    const uploadedUrl =
      result.data?.display_url ||
      result.data?.url ||
      result.data?.image?.url;

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      thumb: result.data?.thumb?.url,
      deleteUrl: result.data?.delete_url,
      data: result.data,
    });
  } catch (error) {
    console.error('Error in /api/upload-image route:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error while uploading image to ImgBB',
      },
      { status: 500 }
    );
  }
}
