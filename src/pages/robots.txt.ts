import { getCatalog } from '../lib/catalog';
export async function GET({ site }: { site: URL | undefined }) {
  const catalog = await getCatalog();
  return new Response(catalog.demo ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /pinterest-connect/\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
