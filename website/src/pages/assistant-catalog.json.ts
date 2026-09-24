import { getCatalog } from '../lib/catalog';
export const prerender = false;
export async function GET() {
  const { products } = await getCatalog();
  return new Response(JSON.stringify(products.map(({title, slug, category, description, tags, stores}) => ({title, slug, category, description, tags, stores: stores.map(({name})=>({name}))}))), {headers:{'Content-Type':'application/json', 'Cache-Control':'no-store, max-age=0'}});
}
