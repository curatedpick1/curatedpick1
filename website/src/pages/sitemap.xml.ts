import { getCatalog } from '../lib/catalog';
export async function GET({ site }: { site: URL | undefined }) {
  const catalog = await getCatalog();
  const paths = catalog.demo ? [] : ['/', '/about/', '/disclosure/', '/privacy/', '/contact/', ...catalog.products.map(p => `/products/${p.slug}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${new URL(path, site).href.replaceAll('&', '&amp;')}</loc></url>`).join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
