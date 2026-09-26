import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

function getStoreFilePath(): string {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'cms-pages-store.json');
}

function readStoredPages(): Record<string, any> {
  try {
    const filePath = getStoreFilePath();
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read cms-pages-store.json:', err);
    return {};
  }
}

function writeStoredPages(data: Record<string, any>): void {
  try {
    const filePath = getStoreFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write cms-pages-store.json:', err);
  }
}

// Public read
export async function GET() {
  try {
    const pagesMap = readStoredPages();
    return NextResponse.json({
      success: true,
      pages: Object.values(pagesMap),
      count: Object.keys(pagesMap).length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// Authenticated write
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: `Unauthorized: Authentication required (${authResult.error || 'Invalid credentials'})`,
        },
        { status: 401 }
      );
    }

    const pageData = await req.json();
    if (!pageData || !pageData.id) {
      return NextResponse.json({ success: false, error: 'Invalid page data, missing id' }, { status: 400 });
    }

    const pagesMap = readStoredPages();
    const updatedPage = {
      ...pageData,
      lastUpdated: pageData.lastUpdated || new Date().toISOString(),
    };

    pagesMap[pageData.id] = updatedPage;
    writeStoredPages(pagesMap);

    return NextResponse.json({
      success: true,
      page: updatedPage,
      message: `CMS page "${pageData.id}" saved to server persistence store`,
    });
  } catch (err: any) {
    console.error('Error saving CMS page to server store:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
