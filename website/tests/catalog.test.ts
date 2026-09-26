import test from 'node:test';
import assert from 'node:assert/strict';
import { httpsUrl, validateProduct, relatedProducts, productUrl, type Product } from '../shared/catalog.ts';
export const fixture: Product = {
  id: '00000000-0000-4000-8000-000000000001', slug: 'warm-desk-lamp', title: 'A warm desk lamp', description: 'A small light for your reading corner.',
  category: 'Home & living', tags: ['lighting'], poster_url: 'https://images.example.com/lamp.jpg', poster_alt: 'Small reading lamp',
  stores: [{ name: 'Amazon', url: 'https://www.amazon.com/dp/B000000001?tag=test-20' }, { name: 'AliExpress', url: 'https://www.aliexpress.com/item/10000000001.html' }],
  featured: true, revision: 1, created_at: '2026-09-08T10:00:00Z',
};
test('merchant URLs preserve affiliate attribution while rejecting unsafe schemes and credentials', () => {
  assert.equal(httpsUrl(fixture.stores[0].url), fixture.stores[0].url);
  for (const url of ['javascript:alert(1)', 'http://store.com', '//store.com', 'https://user:pass@store.com', 'https://store.com/a b']) assert.throws(() => httpsUrl(url));
});
test('live products require actionable store links, accessible image metadata, and bounded content', () => {
  assert.equal(validateProduct(fixture).id, fixture.id);
  for (const overrides of [{ stores: [] }, { description: 'x'.repeat(441) }, { poster_alt: '' }, { revision: 0 }, { slug: '../../admin' }, { tags: [null] }]) assert.throws(() => validateProduct({ ...fixture, ...overrides }));
});
test('optional product blogs accept safe structured text and product photos only', () => {
  const blog = { blog_title: 'A guide to a better reading corner', blog_content: [{ type: 'heading', text: 'Start with your space' }, { type: 'paragraph', text: 'Measure your desk before choosing a lamp.' }, { type: 'underline', text: 'Check the dimensions first.' }, { type: 'image', url: 'https://images.example.com/detail.jpg', alt: 'Lamp on a reading desk' }] };
  assert.equal(validateProduct({ ...fixture, ...blog }).blog_content?.length, 4);
  for (const invalid of [
    { blog_content: [{ type: 'image', url: 'javascript:alert(1)', alt: 'unsafe' }] },
    { blog_content: [{ type: 'html', text: '<script>alert(1)</script>' }] },
    { blog_title: '', blog_content: [{ type: 'paragraph', text: 'A useful article.' }] },
  ]) assert.throws(() => validateProduct({ ...fixture, ...invalid }));
});
test('related picks rank matching categories and tags; exclude the current product; stable ties', () => {
  const other = { ...fixture, id: '2', slug: 'other', category: 'Tech', tags: [], created_at: '2026-09-09' };
  const matched = { ...fixture, id: '3', slug: 'matched' };
  assert.deepEqual(relatedProducts(fixture, [fixture, other, matched]).map(p => p.id), ['3', '2']);
  assert.equal(productUrl('https://curated.example.com', fixture.slug), 'https://curated.example.com/products/warm-desk-lamp/');
});
