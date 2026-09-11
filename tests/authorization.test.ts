import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../supabase/functions/_shared/handler.ts';
test('public visitors and self-created account JWTs cannot invoke the publisher or reach its database', async () => {
  let networkCalls = 0;
  const handler = createHandler(name => name === 'PUBLISHER_SECRET' ? 'x'.repeat(64) : '', (async () => { networkCalls++; throw new Error('Network must not be reached'); }) as typeof fetch);
  for (const headers of [{}, { Authorization: 'Bearer ordinary-user-jwt' }, { 'x-publisher-secret': 'wrong-secret' }, { 'x-publisher-secret': 'x'.repeat(1000) }]) {
    const response = await handler(new Request('https://project.supabase.co/functions/v1/publisher', { method: 'POST', headers: headers as Record<string, string> }));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  assert.equal((await handler(new Request('https://project.supabase.co/functions/v1/publisher'))).status, 405);
  assert.equal(networkCalls, 0);
  const unconfigured = createHandler(() => '');
  assert.equal((await unconfigured(new Request('https://project.supabase.co/functions/v1/publisher', { method: 'POST' }))).status, 401);
});
