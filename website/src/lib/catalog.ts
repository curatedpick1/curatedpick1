import { validateProduct, type Catalog } from '../../shared/catalog';
import { demoCatalog } from '../data/demo';
let snapshot: Promise<Catalog> | undefined;

export function getCatalog(): Promise<Catalog> {
  return snapshot ??= loadCatalog();
}
async function loadCatalog(): Promise<Catalog> {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY;
  const demo = import.meta.env.DEMO_MODE === 'true' || (import.meta.env.DEV && !url);
  if (demo) return demoCatalog;
  if (!url || !key || url.includes('YOUR-')) throw new Error('Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env / hosting settings. For a labelled local preview use npm run build:demo.');
  const origin = new URL(url);
  if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('SUPABASE_URL must be HTTPS');
  const site = import.meta.env.SITE_URL;
  if (!site || !site.startsWith('https://') || /YOUR-|\.example(?:\/|$)|example\.com/.test(site)) throw new Error('Set SITE_URL to your real public HTTPS website origin before building for production.');
  const response = await fetch(`${origin.origin}/rest/v1/rpc/get_catalog`, {
    method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Catalog download failed (${response.status}). Keeping the previous deployment is safer than publishing incomplete data.`);
  const data = await response.json() as Catalog;
  if (!Number.isInteger(data.revision) || !Array.isArray(data.products)) throw new Error('Invalid catalog response. Apply the Supabase migration first.');
  const products = data.products.map(p => validateProduct(p));
  if (new Set(products.map(p => p.slug)).size !== products.length) throw new Error('Duplicate product slugs');
  return { revision: data.revision, products, demo: false };
}
