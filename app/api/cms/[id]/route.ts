import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getStoreFilePath(): string {
  return path.join(process.cwd(), 'data', 'cms-pages-store.json');
}

function readStoredPages(): Record<string, any> {
  try {
    const filePath = getStoreFilePath();
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
    }

    const pagesMap = readStoredPages();
    const page = pagesMap[id];

    if (!page) {
      return NextResponse.json({ success: false, error: `CMS page "${id}" not found in server store` }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
