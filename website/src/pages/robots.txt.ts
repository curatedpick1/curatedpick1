import { getCatalog } from '../lib/catalog';
export const prerender = false;
export async function GET({ url }: { url: URL }) {
  const catalog = await getCatalog();
  return new Response(catalog.demo ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /pinterest-connect/\nSitemap: ${new URL('/sitemap.xml', url.origin).href}\n`, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store, max-age=0' } });
}
