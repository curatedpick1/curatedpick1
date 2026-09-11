import { getCatalog } from '../lib/catalog';
export async function GET() {
  const catalog = await getCatalog();
  return Response.json({ revision: catalog.revision, demo: Boolean(catalog.demo), products: Object.fromEntries(catalog.products.map(p => [p.id, { slug: p.slug, revision: p.revision }])) });
}
