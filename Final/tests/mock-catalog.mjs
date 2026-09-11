// Loaded ONLY by test:build via NODE_OPTIONS. Never imported by application code.
const original = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (String(input) !== 'https://catalog.test/rest/v1/rpc/get_catalog') return original(input, init);
  if (init.headers.apikey !== 'test-publishable-key') throw new Error('Build did not use the public read credential');
  if (process.env.CATALOG_FIXTURE === 'failure') return new Response('', { status: 503 });
  return Response.json({ revision: 4, products: process.env.CATALOG_FIXTURE === 'empty' ? [] : [{
    id: '00000000-0000-4000-8000-000000000001', slug: 'reading-lamp', title: 'Lamp <script>alert(1)</script>',
    description: 'A fixture used to verify production rendering.', category: 'Home', tags: ['lighting'],
    poster_url: 'https://images.example.com/lamp.jpg', poster_alt: 'A reading lamp', featured: true,
    stores: [{ name: 'Amazon', url: 'https://amazon.com/dp/B000000001?tag=test-20' }, { name: 'AliExpress', url: 'https://aliexpress.com/item/10000000001.html', note: 'Check the exact variant' }], revision: 2, created_at: '2026-09-08T10:00:00Z',
  }] });
};
