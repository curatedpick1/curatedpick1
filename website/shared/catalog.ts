export interface StoreLink { name: string; url: string; note?: string }
export interface ProductImage { url: string; pin_url?: string; alt?: string }
export type ProductBlogBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'underline'; text: string }
  | { type: 'image'; url: string; alt: string; align?: 'left' | 'center' | 'right' }
  | { type: 'rich_text'; tag: 'p' | 'h2' | 'h3'; align: 'left' | 'center' | 'right'; runs: { text: string; bold?: boolean; italic?: boolean; underline?: boolean; size?: 'small' | 'normal' | 'large' | 'xlarge'; font?: 'Arial' | 'Impact' | 'Georgia' | 'Verdana' | 'Trebuchet MS' | 'Times New Roman' | 'Courier New' }[] };
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  poster_url: string;
  poster_alt: string;
  images?: ProductImage[];
  blog_title?: string;
  blog_content?: ProductBlogBlock[];
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
  if(p.images !== undefined){
    if(!Array.isArray(p.images) || p.images.length>10)throw new Error('Use up to 10 product photos');
    for(const image of p.images){httpsUrl(image.url);if(image.pin_url)httpsUrl(image.pin_url);if(image.alt!==undefined && (typeof image.alt!=='string' || image.alt.length>500))throw new Error('Invalid image description');}
  }
  if (p.blog_title !== undefined && (typeof p.blog_title !== 'string' || p.blog_title.length > 160)) throw new Error(`Invalid blog title: ${p.slug}`);
  if (p.blog_content !== undefined) {
    if (!Array.isArray(p.blog_content) || p.blog_content.length > 40) throw new Error(`Invalid blog content: ${p.slug}`);
    for (const block of p.blog_content) {
      if (!block || typeof block !== 'object') throw new Error(`Invalid blog block: ${p.slug}`);
      if (block.type === 'image') {
        httpsUrl(block.url);
        if (typeof block.alt !== 'string' || block.alt.length > 500) throw new Error(`Invalid blog image: ${p.slug}`);
      } else if (block.type === 'rich_text') {
        if (!['p','h2','h3'].includes(block.tag) || !['left','center','right'].includes(block.align) || !Array.isArray(block.runs) || block.runs.length > 300) throw new Error(`Invalid rich blog text: ${p.slug}`);
        let length = 0;
        for (const run of block.runs) {
          if (!run || typeof run.text !== 'string' || !run.text.trim() || (run.bold !== undefined && typeof run.bold !== 'boolean') || (run.italic !== undefined && typeof run.italic !== 'boolean') || (run.underline !== undefined && typeof run.underline !== 'boolean') || (run.size !== undefined && !['small','normal','large','xlarge'].includes(run.size)) || (run.font !== undefined && !['Arial','Impact','Georgia','Verdana','Trebuchet MS','Times New Roman','Courier New'].includes(run.font))) throw new Error(`Invalid rich blog run: ${p.slug}`);
          length += run.text.length;
        }
        if (!length || length > 2400) throw new Error(`Invalid rich blog text length: ${p.slug}`);
      } else if (['heading', 'paragraph', 'underline'].includes(block.type)) {
        if (typeof block.text !== 'string' || !block.text.trim() || block.text.length > (block.type === 'heading' ? 160 : 2400)) throw new Error(`Invalid blog text: ${p.slug}`);
      } else throw new Error(`Invalid blog block type: ${p.slug}`);
    }
    if (p.blog_content.length && !p.blog_title?.trim()) throw new Error(`Add a blog title: ${p.slug}`);
  }
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
