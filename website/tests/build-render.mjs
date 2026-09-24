import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const folder = 'test-results/worker-build';
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', folder], {
  encoding: 'utf8',
  env: { ...process.env, DEMO_MODE: 'false', SUPABASE_URL: 'https://catalog.test', SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key' },
});
assert.equal(result.status, 0, result.stdout + result.stderr);
assert.ok(existsSync(`${folder}/server/entry.mjs`), 'Cloudflare Worker entrypoint was not built');
assert.ok(existsSync(`${folder}/client/favicon.svg`), 'Static public assets were not copied');
const serverChunks = readdirSync(`${folder}/server/chunks`);
assert.ok(serverChunks.some(name => name.startsWith('catalog-version_')), 'Dynamic catalog endpoint is missing');
assert.ok(serverChunks.some(name => name.startsWith('_slug__')), 'Dynamic product route is missing');
assert.ok(!existsSync(`${folder}/client/products/reading-lamp/index.html`), 'Product pages must be rendered from Supabase at request time');
console.log('PASS: Cloudflare Worker build includes request-time catalog and product routes plus static assets. Output is isolated under ignored test-results/.');
