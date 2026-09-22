import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { BOUTIQUE_PRODUCTS } from '@/lib/products';

export const dynamic = 'force-dynamic';

const DEFAULT_SHOP_CATEGORIES = [
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: 'Boutique clothing and apparel',
    order: 1,
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    description: 'Gadgets and tech accessories',
    order: 2,
  },
  {
    id: 'cat-cultural',
    name: 'Cultural',
    slug: 'cultural',
    imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional and heritage items',
    order: 3,
  },
  {
    id: 'cat-nails',
    name: 'Nails & Beauty',
    slug: 'nails-beauty',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
    description: 'Nail extensions and beauty tools',
    order: 4,
  }
];

function getDataDir(): string {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

function getFilePath(collectionName: string): string {
  const safeName = collectionName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return path.join(getDataDir(), `${safeName}.json`);
}

function getInitialData(collectionName: string): any[] {
  switch (collectionName) {
    case 'products':
      return BOUTIQUE_PRODUCTS;
    case 'shop_categories':
      return DEFAULT_SHOP_CATEGORIES;
    default:
      return [];
  }
}

function readCollection(collectionName: string): any[] {
  const filePath = getFilePath(collectionName);
  try {
    if (!fs.existsSync(filePath)) {
      const initial = getInitialData(collectionName);
      if (initial.length > 0) {
        writeCollection(collectionName, initial);
      }
      return initial;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Could not read ${collectionName}.json:`, err);
    return getInitialData(collectionName);
  }
}

function writeCollection(collectionName: string, items: any[]): void {
  const filePath = getFilePath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Could not write ${collectionName}.json:`, err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionName = searchParams.get('collection') || searchParams.get('type') || 'products';
    const items = readCollection(collectionName);

    return NextResponse.json({
      success: true,
      collection: collectionName,
      items,
      count: items.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection: collectionName, action = 'save', item, items: bulkItems, id } = body;

    if (!collectionName) {
      return NextResponse.json({ success: false, error: 'Missing collection parameter' }, { status: 400 });
    }

    let currentItems = readCollection(collectionName);

    if (action === 'save_all' && Array.isArray(bulkItems)) {
      currentItems = bulkItems;
      writeCollection(collectionName, currentItems);
      return NextResponse.json({ success: true, count: currentItems.length, items: currentItems });
    }

    if (action === 'delete') {
      const targetId = id || item?.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'Missing id for delete' }, { status: 400 });
      }
      currentItems = currentItems.filter((i: any) => String(i.id) !== String(targetId));
      writeCollection(collectionName, currentItems);
      return NextResponse.json({ success: true, deletedId: targetId, count: currentItems.length });
    }

    // Default: save single item (add or update)
    if (!item || !item.id) {
      return NextResponse.json({ success: false, error: 'Missing item or item.id' }, { status: 400 });
    }

    const existingIdx = currentItems.findIndex((i: any) => String(i.id) === String(item.id));
    if (existingIdx >= 0) {
      currentItems[existingIdx] = {
        ...currentItems[existingIdx],
        ...item,
        updatedAt: new Date().toISOString(),
      };
    } else {
      currentItems.unshift({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    writeCollection(collectionName, currentItems);

    return NextResponse.json({
      success: true,
      item: existingIdx >= 0 ? currentItems[existingIdx] : currentItems[0],
      count: currentItems.length,
    });
  } catch (err: any) {
    console.error('Error in catalog POST:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
