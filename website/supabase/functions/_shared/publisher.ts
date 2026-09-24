import { httpsUrl, productUrl, validateProduct, type Product } from '../../../shared/catalog.ts';

export interface Config {
  supabaseUrl: string; serviceKey: string; siteUrl: string; deployHook: string;
  enabled: boolean; apiEnv: 'sandbox' | 'production'; standardAccess: boolean;
  appId: string; appSecret: string; defaultBoardId?: string;
}
type PrivateProduct = Product & { published: boolean; publish_to_pinterest: boolean; pinterest_board_id: string | null; pin_media_type: 'image' | 'video'; pin_image_url: string | null; video_path: string | null };
type Job = { product_id: string; state: string; pin_id: string | null; media_id: string | null; media_path: string | null; media_started_at: string | null; attempts: number };
type Manifest = { revision: number; demo: boolean; products: Record<string, { slug: string; revision: number }> };
type Tokens = { api_env: string; access_token: string; refresh_token: string; expires_at: string; refreshed_at: string };
type State = { revision: number; requested_revision: number; requested_at: string | null; deployed_revision: number; build_day: string | null; builds_today: number };
const disclosure = 'Affiliate links. We may earn a commission.';
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export function pinPayload(product: PrivateProduct, siteUrl: string, mediaId?: string) {
  validateProduct(product);
  if (!/^\d+$/.test(product.pinterest_board_id || '')) throw new Error('A Pinterest board must be resolved before posting');
  if (product.pin_media_type === 'video' && !mediaId) throw new Error('Video upload must complete before creating its Pin');
  const image = httpsUrl(product.pin_image_url || product.poster_url);
  const images=(product.images || []).slice(0,5);
  return {
    board_id: product.pinterest_board_id, title: product.title,
    description: `${product.description}\n\n${disclosure}`,
    alt_text: product.poster_alt.slice(0, 500), link: productUrl(siteUrl, product.slug),
    media_source: product.pin_media_type === 'video'
      ? { source_type: 'video_id', media_id: mediaId, cover_image_url: image }
      : images.length>1?{source_type:'multiple_image_urls',index:0,items:images.map(photo=>({url:httpsUrl(photo.pin_url || photo.url),title:product.title,link:productUrl(siteUrl,product.slug)}))}
      : { source_type: 'image_url', url: image },
  };
}

export function liveProduct(manifest: Manifest | null, product: Product) {
  const live = manifest?.products?.[product.id];
  return Boolean(manifest && !manifest.demo && live?.revision === product.revision && live?.slug === product.slug);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, operation: string) { super(`${operation} returned HTTP ${status}`); this.status = status; }
}
export function failureState(error: unknown, creating: boolean, attempts: number) {
  if (creating && (!(error instanceof ApiError) || error.status >= 500)) return 'needs_review';
  if (error instanceof ApiError && [400, 401, 403, 404, 422].includes(error.status)) return 'failed';
  return attempts >= 8 ? 'failed' : 'pending';
}

export async function runPublisher(config: Config, fetcher: typeof fetch = fetch) {
  const supabase = new URL(httpsUrl(config.supabaseUrl)).origin;
  const site = new URL(httpsUrl(config.siteUrl)).origin;
  const dbHeaders = { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json' };
  const api = config.apiEnv === 'sandbox' ? 'https://api-sandbox.pinterest.com/v5' : 'https://api.pinterest.com/v5';
  const started = Date.now();
  const timeLeft = () => Math.max(1, Math.min(45_000, 95_000 - (Date.now() - started)));
  const request = async (url: string, init: RequestInit = {}, timeout = timeLeft()) => fetcher(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(timeout) });
  async function db<T>(resource: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await request(`${supabase}/rest/v1/${resource}`, {
      method, headers: { ...dbHeaders, Prefer: 'return=representation,resolution=merge-duplicates' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }, 12_000);
    if (!response.ok) throw new ApiError(response.status, 'Database operation');
    if (response.status === 204) return null as T;
    const text = await response.text();
    return text ? JSON.parse(text) as T : null as T;
  }
  const lock = await db<string | null>('rpc/acquire_publisher_lock', 'POST', {});
  if (!lock) return { status: 'busy' };
  let currentJob: Job | null = null;
  let creating = false;
  let createdPinId: string | undefined;
  try {
    // A previous run may have died after sending POST /pins. Never blindly send it again.
    await db('pinterest_jobs?state=eq.creating', 'PATCH', { state: 'needs_review', last_error: 'Previous Pin creation did not finish recording. Check Pinterest before retrying.', updated_at: new Date().toISOString() });
    const [state] = await db<State[]>('catalog_state?id=eq.1&select=*');
    let manifest: Manifest | null = null;
    try {
      const response = await request(`${site}/catalog-version.json?check=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } }, 8000);
      if (response.ok) {
        const value = await response.json();
        if (!value.demo && Number.isInteger(value.revision) && value.products && typeof value.products === 'object') manifest = value;
      }
    } catch { /* Deployment may not be live yet. Keep waiting. */ }
    if (manifest && manifest.revision > state.revision) throw new Error('Website belongs to a newer/different catalog. Check SITE_URL and SUPABASE_URL.');
    if (manifest && state.deployed_revision !== manifest.revision) await db('catalog_state?id=eq.1', 'PATCH', { deployed_revision: manifest.revision });
    let deployment = 'current';
    if (!manifest || manifest.revision < state.revision) {
      deployment = 'waiting';
      const age = state.requested_at ? Date.now() - Date.parse(state.requested_at) : Infinity;
      const changed = state.requested_revision < state.revision;
      const due = age >= 15 * 60_000 && (changed || age >= 30 * 60_000);
      if (due && config.deployHook) {
        const day = new Date().toISOString().slice(0, 10);
        const count = state.build_day === day ? state.builds_today : 0;
        if (count >= 12) {
          await db('catalog_state?id=eq.1', 'PATCH', { last_error: 'Daily safety limit of 12 automatic builds reached. Publishing resumes tomorrow (UTC).' });
        } else {
          httpsUrl(config.deployHook);
          // Record BEFORE the request: even an ambiguous network failure cannot cause a build storm.
          await db('catalog_state?id=eq.1', 'PATCH', { requested_revision: state.revision, requested_at: new Date().toISOString(), build_day: day, builds_today: count + 1, last_error: null });
          const response = await request(config.deployHook, { method: 'POST' }, 10_000);
          if (!response.ok) throw new ApiError(response.status, 'Site deploy hook');
          deployment = 'requested';
        }
      }
    } else {
      await db('catalog_state?id=eq.1', 'PATCH', { last_error: null });
    }
    if (!config.enabled) return { status: 'website_only', deployment };
    if (config.apiEnv === 'production' && !config.standardAccess) throw new Error('Production Pin posting is disabled until PINTEREST_STANDARD_ACCESS=true after approval.');
    const jobs = await db<Job[]>(`pinterest_jobs?state=in.(pending,media_processing)&next_attempt_at=lte.${encodeURIComponent(new Date().toISOString())}&order=next_attempt_at.asc&limit=10`);
    let product: PrivateProduct | undefined;
    // Skip a product still waiting for deployment, so it cannot starve other ready jobs.
    for (const job of jobs) {
      const [candidate] = await db<PrivateProduct[]>(`products?id=eq.${encodeURIComponent(job.product_id)}&select=*`);
      if (!candidate?.published || !candidate.publish_to_pinterest || job.pin_id) continue;
      if (liveProduct(manifest, candidate)) { currentJob = job; product = candidate; break; }
    }
    if (!currentJob || !product) return { status: 'waiting_or_idle', deployment };
    validateProduct(product);
    if (Date.now() - started > 30_000) return { status: 'next_tick', deployment };
    const [stored] = await db<Tokens[]>('pinterest_tokens?id=eq.1&select=*');
    if (!stored || stored.api_env !== config.apiEnv) throw new Error('Connect Pinterest for the configured environment with npm run pinterest:connect.');
    let token = stored.access_token;
    if (Date.parse(stored.expires_at) < Date.now() + 300_000 || Date.parse(stored.refreshed_at) < Date.now() - 7 * 86400_000) {
      const response = await request(`${api}/oauth/token`, {
        method: 'POST', headers: { Authorization: `Basic ${btoa(`${config.appId}:${config.appSecret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: stored.refresh_token, continuous_refresh: 'true' }),
      }, 10_000);
      if (!response.ok) throw new ApiError(response.status, 'Pinterest token refresh; reconnect if access was revoked');
      const fresh = await response.json();
      if (!fresh.access_token || !Number.isFinite(fresh.expires_in)) throw new Error('Pinterest token refresh returned an incomplete response');
      await db('pinterest_tokens?id=eq.1', 'PATCH', { access_token: fresh.access_token, refresh_token: fresh.refresh_token || stored.refresh_token, expires_at: new Date(Date.now() + fresh.expires_in * 1000).toISOString(), refreshed_at: new Date().toISOString() });
      token = fresh.access_token;
    }
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    let boardId=product.pinterest_board_id || config.defaultBoardId;
    if(!boardId){
      let bookmark: string | undefined;
      do {
        const query=new URLSearchParams({page_size:'100',...(bookmark?{bookmark}:{})});
        const response=await request(`${api}/boards?${query}`,{headers:auth},10000);
        if(!response.ok)throw new ApiError(response.status,'Pinterest board lookup');
        const boards=await response.json();
        boardId=boards.items?.find((board:{id:string;privacy:string})=>board.privacy==='PUBLIC' && /^\d+$/.test(board.id))?.id;
        bookmark=typeof boards.bookmark==='string'?boards.bookmark:undefined;
        if(Date.now()-started>30000)break;
      }while(!boardId && bookmark);
      if(!boardId){
        await db(`pinterest_jobs?product_id=eq.${product.id}`,'PATCH',{last_error:'No public Pinterest board is available yet. Create one or set the account default board; this Pin stays queued.'});
        return {status:'waiting_for_board',deployment};
      }
    }
    // Only this outgoing Pin needs a board; saving a product does not.
    product={...product,pinterest_board_id:boardId};
    let mediaId = currentJob.media_id;
    if (product.pin_media_type === 'video') {
      if (!product.video_path || !/^[A-Za-z0-9_/-]+\.(mp4|mov|m4v)$/.test(product.video_path) || product.video_path.includes('..')) throw new Error('Use a valid private product-videos storage path');
      if (!mediaId || currentJob.media_path !== product.video_path) {
        const registration = await request(`${api}/media`, { method: 'POST', headers: auth, body: JSON.stringify({ media_type: 'video' }) }, 10_000);
        if (!registration.ok) throw new ApiError(registration.status, 'Pinterest video registration');
        const media = await registration.json();
        if (typeof media.media_id !== 'string' || !media.upload_parameters || typeof media.upload_parameters !== 'object') throw new Error('Pinterest returned an incomplete media registration');
        const upload = new URL(httpsUrl(media.upload_url));
        if (!/^pinterest-media-upload[\w.-]*\.amazonaws\.com$/.test(upload.hostname)) throw new Error('Unexpected Pinterest upload host');
        const file = await request(`${supabase}/storage/v1/object/authenticated/product-videos/${product.video_path.split('/').map(encodeURIComponent).join('/')}`, { headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}` } }, 20_000);
        if (!file.ok) throw new ApiError(file.status, 'Private video download');
        if (Number(file.headers.get('content-length')) > MAX_VIDEO_BYTES || !file.body) throw new Error('Video must be at most 20 MB');
        const reader = file.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          size += value.byteLength;
          if (size > MAX_VIDEO_BYTES) { await reader.cancel(); throw new Error('Video must be at most 20 MB'); }
          chunks.push(value);
        }
        if (!size) throw new Error('Video file is empty');
        const form = new FormData();
        for (const [key, value] of Object.entries(media.upload_parameters)) form.append(key, String(value));
        form.append('file', new Blob(chunks as BlobPart[], { type: file.headers.get('content-type') || 'video/mp4' }), product.video_path.split('/').pop());
        const uploaded = await request(upload.href, { method: 'POST', body: form });
        if (!uploaded.ok) throw new ApiError(uploaded.status, 'Pinterest video upload');
        await db(`pinterest_jobs?product_id=eq.${product.id}`, 'PATCH', { state: 'media_processing', media_id: media.media_id, media_path: product.video_path, media_started_at: new Date().toISOString(), next_attempt_at: new Date(Date.now() + 60_000).toISOString(), last_error: null, updated_at: new Date().toISOString() });
        return { status: 'video_uploaded', product: product.slug };
      }
      if (currentJob.media_started_at && Date.parse(currentJob.media_started_at) < Date.now() - 30 * 60_000) throw new ApiError(422, 'Video processing exceeded 30 minutes; inspect the video before retrying');
      const response = await request(`${api}/media/${encodeURIComponent(mediaId)}`, { headers: auth }, 10_000);
      if (!response.ok) throw new ApiError(response.status, 'Pinterest video status');
      const media = await response.json();
      if (media.status === 'failed') throw new ApiError(422, 'Pinterest video processing');
      if (media.status !== 'succeeded') return { status: 'video_processing', product: product.slug };
    }
    // Re-read after video/network work: a draft/unpublish/edit must not post an obsolete version.
    const [latest] = await db<PrivateProduct[]>(`products?id=eq.${product.id}&select=*`);
    if (!latest?.published || !latest.publish_to_pinterest || latest.revision !== product.revision) return { status: 'product_changed', deployment };
    const page = await request(`${productUrl(site, product.slug)}?publish_check=${product.revision}`, {}, 8000);
    const html = page.ok ? await page.text() : '';
    if (!html.includes(`data-product-id="${product.id}"`) || !html.includes(`data-product-revision="${product.revision}"`)) return { status: 'waiting_for_product_page', deployment };
    const payload = pinPayload(product, site, mediaId || undefined);
    await db(`pinterest_jobs?product_id=eq.${product.id}`, 'PATCH', { state: 'creating', api_env: config.apiEnv, updated_at: new Date().toISOString(), last_error: null });
    creating = true;
    const response = await request(`${api}/pins`, { method: 'POST', headers: auth, body: JSON.stringify(payload) }, 15_000);
    if (!response.ok) throw new ApiError(response.status, 'Pinterest Pin creation');
    const pin = await response.json();
    if (typeof pin.id !== 'string' || !/^\d+$/.test(pin.id)) throw new Error('Pinterest Pin response did not include a valid ID');
    createdPinId = pin.id;
    await db(`pinterest_jobs?product_id=eq.${product.id}`, 'PATCH', { state: 'published', pin_id: pin.id, last_error: null, updated_at: new Date().toISOString() });
    return { status: 'published', product: product.slug, pin_id: pin.id, environment: config.apiEnv };
  } catch (error) {
    // Only controlled messages reach logs/database; never log response bodies, tokens or hook URLs.
    const message = error instanceof Error ? error.message.replace(/https?:\/\/\S+/g, '[URL]') : 'Publishing failed';
    if (currentJob) {
      const attempts = currentJob.attempts + 1;
      const state = failureState(error, creating, attempts);
      await db(`pinterest_jobs?product_id=eq.${currentJob.product_id}`, 'PATCH', {
        state, attempts, last_error: message.slice(0, 500),
        ...(createdPinId ? { pin_id: createdPinId } : {}),
        next_attempt_at: new Date(Date.now() + Math.min(3600, 60 * 2 ** attempts) * 1000).toISOString(), updated_at: new Date().toISOString(),
      }).catch(() => { /* A durable 'creating' state becomes needs_review on the next run. */ });
    }
    await db('catalog_state?id=eq.1', 'PATCH', { last_error: message.slice(0, 500) }).catch(() => {});
    return { status: 'error', message };
  } finally {
    await db('rpc/release_publisher_lock', 'POST', { token: lock }).catch(() => {});
  }
}
