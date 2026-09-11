import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const mock = new URL('./mock-catalog.mjs', import.meta.url).href;
const env = { ...process.env, NODE_OPTIONS: `--import=${mock}`, DEMO_MODE: 'false', SUPABASE_URL: 'https://catalog.test', SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key', SITE_URL: 'https://shop.test' };
for (const mode of ['live', 'empty', 'failure']) {
  const folder = `test-results/${mode}`;
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', folder], { encoding: 'utf8', env: { ...env, CATALOG_FIXTURE: mode } });
  if (mode === 'failure') { assert.notEqual(result.status, 0); assert.match(result.stdout + result.stderr, /Catalog download failed/); continue; }
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const manifest = JSON.parse(readFileSync(`${folder}/catalog-version.json`, 'utf8'));
  assert.equal(manifest.demo, false); assert.equal(manifest.revision, 4);
  const home = readFileSync(`${folder}/index.html`, 'utf8');
  assert.ok(!home.includes('Preview collection'));
  if (mode === 'live') {
    const html = readFileSync(`${folder}/products/reading-lamp/index.html`, 'utf8');
    assert.ok(html.includes('<h1>Lamp &lt;script&gt;alert(1)&lt;/script&gt;</h1>'));
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(html.includes('rel="sponsored nofollow noopener noreferrer"'));
    assert.ok(html.includes('https://amazon.com/dp/B000000001?tag=test-20'));
    assert.ok(html.includes('View on Amazon') && html.includes('View on AliExpress'));
    assert.ok(html.includes('data-product-revision="2"'));
    assert.ok(html.includes('https://shop.test/products/reading-lamp/'));
    assert.ok(!html.includes('private-test-key'));
  } else { assert.ok(home.includes('The first finds are on their way.')); assert.deepEqual(manifest.products, {}); }
}
console.log('PASS: live static store buttons, escaped content, canonical links/version marker, empty catalog, and failed API stops deployment. Fixtures are isolated under ignored test-results/.');
