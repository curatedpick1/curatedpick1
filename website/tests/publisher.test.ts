import test from 'node:test';
import assert from 'node:assert/strict';
import { runPublisher, pinPayload, failureState, ApiError, type Config } from '../supabase/functions/_shared/publisher.ts';
import type { Product } from '../shared/catalog.ts';
const product: Product & Record<string, any> = {
  id: '00000000-0000-4000-8000-000000000001', slug: 'lamp', title: 'Reading lamp', description: 'Light for a quiet corner.',
  category: 'Home', tags: ['lighting'], poster_url: 'https://cdn.example.com/lamp.jpg', poster_alt: 'Reading lamp',
  stores: [{ name: 'Amazon', url: 'https://amazon.com/dp/B000000001?tag=test-20' }], featured: false, revision: 1, created_at: '2026-09-08',
  published: true, publish_to_pinterest: true, pinterest_board_id: '123', pin_media_type: 'image', pin_image_url: null, video_path: null,
};
const config: Config = { supabaseUrl: 'https://project.supabase.co', serviceKey: 'private-test-key', siteUrl: 'https://shop.example.com', enabled: true, apiEnv: 'sandbox', standardAccess: false, appId: 'id', appSecret: 'secret' };
function setup(options: { live?: boolean; pinResult?: number | 'timeout'; video?: boolean; processing?: boolean; htmlValid?: boolean; locked?: boolean; noBoard?: boolean; noPublicBoards?: boolean } = {}) {
  let job: Record<string, any> = { product_id: product.id, state: 'pending', pin_id: null, media_id: null, media_path: null, media_started_at: null, attempts: 0 };
  const current = { ...product, ...(options.video ? { pin_media_type: 'video', video_path: 'lamp.mp4' } : {}),...(options.noBoard?{pinterest_board_id:null}:{}) };
  if (options.processing) job = { ...job, state: 'media_processing', media_id: 'media-123', media_path: 'lamp.mp4', media_started_at: new Date().toISOString() };
  const calls: { url: string; init: RequestInit; body: any }[] = [];
  const fetcher = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input); const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
    calls.push({ url, init, body });
    const ok = (data: unknown) => Response.json(data);
    if (url.endsWith('/rpc/acquire_publisher_lock')) return ok(options.locked ? null : 'lock-123');
    if (url.endsWith('/rpc/release_publisher_lock')) return ok(null);
    if (url.includes('/catalog_state')) return ok(init.method === 'PATCH' ? [] : [{ revision: 1, requested_revision: -1, requested_at: null, deployed_revision: 1, build_day: null, builds_today: 0 }]);
    if (url.includes('/catalog-version.json')) return ok({ revision: options.live === false ? 0 : 1, demo: false, products: options.live === false ? {} : { [product.id]: { slug: 'lamp', revision: 1 } } });
    if (url === config.deployHook) return ok({});
    if (url.includes('/pinterest_jobs')) {
      if (init.method === 'PATCH') {
        if (!url.includes('state=eq.creating') || job.state === 'creating') job = { ...job, ...body };
        return ok([]);
      }
      return ok(['pending','media_processing'].includes(job.state) ? [job] : []);
    }
    if (url.includes('/rest/v1/products')) return ok([current]);
    if (url.includes('/pinterest_tokens')) return ok([{ api_env: 'sandbox', access_token: 'private-token', refresh_token: 'private-refresh', expires_at: new Date(Date.now() + 86400_000).toISOString(), refreshed_at: new Date().toISOString() }]);
    if (url.includes('/products/lamp/')) return new Response(options.htmlValid === false ? '<h1>Wrong page</h1>' : `<section data-product-id="${product.id}" data-product-revision="1"></section>`);
    if (url.endsWith('/media') && init.method === 'POST') return ok({ media_id: 'media-123', upload_url: 'https://pinterest-media-upload.s3-accelerate.amazonaws.com/', upload_parameters: { key: 'private-upload-key' } });
    if (url.includes('/storage/v1/object/authenticated')) return new Response(new Uint8Array([1,2,3]), { headers: { 'Content-Type': 'video/mp4' } });
    if (url.includes('pinterest-media-upload')) return new Response(null, { status: 204 });
    if (url.endsWith('/media/media-123')) return ok({ status: 'succeeded' });
    if(url.includes('/boards?'))return ok({items:options.noPublicBoards?[{id:'777',privacy:'SECRET'}]:[{id:'777',privacy:'SECRET'},{id:'456',privacy:'PUBLIC'}]});
    if (url.endsWith('/pins')) {
      if (options.pinResult === 'timeout') throw new Error('Request timed out');
      if (typeof options.pinResult === 'number') return new Response('', { status: options.pinResult });
      return ok({ id: '999' });
    }
    throw new Error('Unexpected test request');
  }) as typeof fetch;
  return { fetcher, calls, get job() { return job; } };
}
test('waits for the live catalog revision and never requests a site deployment', async () => {
  const mock = setup({ live: false });
  const result = await runPublisher(config, mock.fetcher);
  assert.equal(result.deployment, 'waiting');
  assert.ok(!mock.calls.some(c => c.url.includes('deploy')));
  assert.ok(!mock.calls.some(c => c.url.endsWith('/pins')));
});
test('posts image once with website destination and affiliate disclosure, then records ID', async () => {
  const mock = setup();
  assert.equal((await runPublisher(config, mock.fetcher)).status, 'published');
  const sent = mock.calls.find(c => c.url.endsWith('/pins'))!;
  assert.equal(sent.body.link, 'https://shop.example.com/products/lamp/');
  assert.match(sent.body.description, /Affiliate links/);
  assert.equal(sent.body.media_source.source_type, 'image_url');
  assert.equal(mock.job.pin_id, '999');
  await runPublisher(config, mock.fetcher);
  assert.equal(mock.calls.filter(c => c.url.endsWith('/pins')).length, 1);
});
test('ambiguous Pin timeout or 5xx is held for review instead of retrying', async () => {
  for (const pinResult of ['timeout', 503] as const) {
    const mock = setup({ pinResult }); await runPublisher(config, mock.fetcher);
    assert.equal(mock.job.state, 'needs_review');
    await runPublisher(config, mock.fetcher);
    assert.equal(mock.calls.filter(c => c.url.endsWith('/pins')).length, 1);
  }
});
test('429 is retriable but rejected content is stopped', async () => {
  assert.equal(failureState(new ApiError(429, 'Pin'), true, 1), 'pending');
  assert.equal(failureState(new ApiError(400, 'Pin'), true, 1), 'failed');
  const mock = setup({ pinResult: 429 }); await runPublisher(config, mock.fetcher);
  assert.equal(mock.job.state, 'pending'); assert.equal(mock.job.attempts, 1);
});
test('video uploads privately, polls processing on next tick, and keeps the cover separate', async () => {
  const upload = setup({ video: true });
  assert.equal((await runPublisher(config, upload.fetcher)).status, 'video_uploaded');
  assert.equal(upload.job.state, 'media_processing');
  assert.ok(!upload.calls.some(c => c.url.endsWith('/pins')));
  assert.ok(upload.calls.find(c => c.url.includes('pinterest-media-upload'))!.body instanceof FormData);
  const finished = setup({ video: true, processing: true });
  assert.equal((await runPublisher(config, finished.fetcher)).status, 'published');
  assert.deepEqual(finished.calls.find(c => c.url.endsWith('/pins'))!.body.media_source, { source_type: 'video_id', media_id: 'media-123', cover_image_url: product.poster_url });
});
test('no Pin is sent for a fallback HTML page, disabled publisher, missing approval, or held lease', async () => {
  for (const [settings, options] of [[config, { htmlValid: false }], [{ ...config, enabled: false }, {}], [{ ...config, apiEnv: 'production' as const }, {}], [config, { locked: true }]] as const) {
    const mock = setup(options); await runPublisher(settings, mock.fetcher);
    assert.ok(!mock.calls.some(c => c.url.endsWith('/pins')));
  }
});
test('a blank product board chooses a public account board, or stays queued if none exists',async()=>{
  const found=setup({noBoard:true});
  assert.equal((await runPublisher(config,found.fetcher)).status,'published');
  assert.equal(found.calls.find(c=>c.url.endsWith('/pins'))!.body.board_id,'456');
  const absent=setup({noBoard:true,noPublicBoards:true});
  assert.equal((await runPublisher(config,absent.fetcher)).status,'waiting_for_board');
  assert.equal(absent.job.state,'pending');
  assert.ok(!absent.calls.some(c=>c.url.endsWith('/pins')));
  const configured=setup({noBoard:true});
  await runPublisher({...config,defaultBoardId:'888'},configured.fetcher);
  assert.equal(configured.calls.find(c=>c.url.endsWith('/pins'))!.body.board_id,'888');
  assert.ok(!configured.calls.some(c=>c.url.includes('/boards?')));
});
test('photo Pins use up to five prepared images; mixed uploads use the video and shared poster',()=>{
  const images=Array.from({length:7},(_,i)=>({url:`https://images.example.com/${i}.jpg`,pin_url:`https://images.example.com/${i}-pin.jpg`}));
  const photos=pinPayload({...product,images} as any,config.siteUrl);
  assert.equal(photos.media_source.source_type,'multiple_image_urls');
  assert.equal(photos.media_source.items!.length,5);
  assert.equal(photos.media_source.items![0].url,images[0].pin_url);
  const video=pinPayload({...product,images,pin_media_type:'video',pin_image_url:images[0].pin_url} as any,config.siteUrl,'123');
  assert.equal(video.media_source.source_type,'video_id');
  assert.equal(video.media_source.cover_image_url,images[0].pin_url);
});
