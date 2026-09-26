import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envKeys = [
    process.env.IMGBB_API_KEY,
    process.env.NEXT_PUBLIC_IMGBB_API_KEY,
    process.env.IMGBB_KEY,
    process.env.IMGBB_SECRET,
    process.env.IMG_BB_API_KEY,
    process.env.IMG_BB_KEY,
    process.env.IMGBB,
    process.env.imgbb_api_key,
    process.env.imgbb,
    process.env.imgbb_key,
    process.env.NEXT_PUBLIC_IMGBB,
    process.env.IMAGE_BB_API_KEY,
    process.env.IMAGEBB_API_KEY,
    process.env.IMGBB_TOKEN,
    process.env.IMGBB_API,
  ];

  const foundKey = envKeys.find((k) => typeof k === 'string' && k.trim().length > 0) || '';
  const sanitizedKey = foundKey.trim().replace(/^["']|["']$/g, '');

  // Returns configuration status only. Never expose raw API secret keys to client callers.
  return NextResponse.json({
    configured: Boolean(sanitizedKey),
  });
}
