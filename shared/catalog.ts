export interface StoreLink { name: string; url: string; note?: string }
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  poster_url: string;
  poster_alt: string;
  stores: StoreLink[];
  featured: boolean;
  revision: number;
  created_at: string;
}
export interface Catalog { revision: number; products: Product[]; demo?: boolean }

export function httpsUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('Expected an HTTPS URL');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || /\s/.test(value)) throw new Error('Use an HTTPS URL without a username or password');
  return url.href;
}

export function validateProduct(value: unknown, demo = false): Product {
  const p = value as Product;
  if (!p || typeof p.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || p.slug.length > 90) throw new Error('Invalid product ID or slug');
  if (typeof p.title !== 'string' || !p.title.trim() || p.title.length > 100) throw new Error(`Invalid title: ${p.slug}`);
  if (typeof p.description !== 'string' || !p.description.trim() || p.description.length > 440) throw new Error(`Description must be 1–440 characters: ${p.slug}`);
  if (typeof p.category !== 'string' || !p.category.trim() || p.category.length > 40) throw new Error(`Invalid category: ${p.slug}`);
  if (!Array.isArray(p.tags) || p.tags.length > 12 || p.tags.some(t => typeof t !== 'string' || t.length > 40)) throw new Error(`Invalid tags: ${p.slug}`);
  if (!demo || !p.poster_url.startsWith('/demo/')) httpsUrl(p.poster_url);
  if (typeof p.poster_alt !== 'string' || !p.poster_alt.trim()) throw new Error(`Add image alt text: ${p.slug}`);
  if (!Array.isArray(p.stores) || p.stores.length > 8 || (!demo && !p.stores.length)) throw new Error(`Add 1–8 store links: ${p.slug}`);
  for (const store of p.stores) {
    if (!store || typeof store.name !== 'string' || !store.name.trim() || store.name.length > 40 || (store.note && (typeof store.note !== 'string' || store.note.length > 120))) throw new Error(`Invalid store: ${p.slug}`);
    httpsUrl(store.url);
  }
  if (!Number.isInteger(p.revision) || p.revision < 1 || Number.isNaN(Date.parse(p.created_at))) throw new Error(`Invalid version/date: ${p.slug}`);
  return p;
}

export function relatedProducts(product: Product, products: Product[], limit = 4): Product[] {
  const tags = new Set(product.tags.map(t => t.toLowerCase()));
  const score = (p: Product) => (p.category === product.category ? 10 : 0) + p.tags.filter(t => tags.has(t.toLowerCase())).length * 3;
  return products.filter(p => p.id !== product.id).sort((a, b) => score(b) - score(a) || Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id)).slice(0, limit);
}

export function productUrl(origin: string, slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid product slug');
  return new URL(`/products/${slug}/`, origin).href;
}

export function merchantHost(url: string) { return new URL(httpsUrl(url)).hostname.replace(/^www\./, ''); }
