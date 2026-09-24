import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'PINTEREST_APP_ID', 'PINTEREST_APP_SECRET', 'PINTEREST_REDIRECT_URI'];
for (const key of required) if (!process.env[key] || process.env[key].includes('YOUR-')) throw new Error(`Set ${key} in your private .env.publisher file`);
if (new URL(process.env.SUPABASE_URL).protocol !== 'https:') throw new Error('SUPABASE_URL must use HTTPS');
const mode = process.env.PINTEREST_API_ENV === 'production' ? 'production' : 'sandbox';
const base = mode === 'sandbox' ? 'https://api-sandbox.pinterest.com/v5' : 'https://api.pinterest.com/v5';
const redirect = new URL(process.env.PINTEREST_REDIRECT_URI);
if (redirect.protocol !== 'https:') throw new Error('The registered redirect must use HTTPS');
const state = randomBytes(32).toString('hex');
const auth = new URL('https://www.pinterest.com/oauth/');
auth.search = new URLSearchParams({ client_id: process.env.PINTEREST_APP_ID, redirect_uri: redirect.href, response_type: 'code', scope: 'boards:read,pins:read,pins:write', state }).toString();
console.log(`Open this URL in your browser and approve your own app (${mode} mode):\n\n${auth.href}\n\nOn the callback page, click “Copy connection response”.`);
const rl = createInterface({ input: stdin, output: stdout });
try {
  const responseUrl = new URL((await rl.question('Paste the copied connection response here: ')).trim());
  if (responseUrl.origin !== redirect.origin || responseUrl.pathname !== redirect.pathname) throw new Error('Callback origin/path does not match the registered redirect');
  const received = responseUrl.searchParams.get('state') || '';
  if (!(/^[a-f0-9]{64}$/.test(received)) || !timingSafeEqual(Buffer.from(received), Buffer.from(state))) throw new Error('Connection state mismatch. Restart the connection command.');
  if (!responseUrl.searchParams.get('code')) throw new Error('Authorization was declined or did not return a code');
  const response = await fetch(`${base}/oauth/token`, {
    method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: responseUrl.searchParams.get('code'), redirect_uri: redirect.href, continuous_refresh: 'true' }), signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Pinterest authorization returned HTTP ${response.status}. Check your app, redirect, and access environment.`);
  const tokens = await response.json();
  if (!tokens.access_token || !tokens.refresh_token || !Number.isFinite(tokens.expires_in)) throw new Error('Pinterest did not return complete refreshable credentials');
  const saved = await fetch(`${new URL(process.env.SUPABASE_URL).origin}/rest/v1/pinterest_tokens?on_conflict=id`, {
    method: 'POST', headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ id: 1, api_env: mode, access_token: tokens.access_token, refresh_token: tokens.refresh_token, expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(), refreshed_at: new Date().toISOString() }), signal: AbortSignal.timeout(15_000),
  });
  if (!saved.ok) throw new Error(`Token storage failed (HTTP ${saved.status}). Apply the migrations and check the service-role key.`);
  console.log('Connected. Tokens were stored privately in Supabase and were not printed.');
  let bookmark;
  console.log('Your available boards (copy the numeric ID into the product row):');
  do {
    const params = new URLSearchParams({ page_size: '100', ...(bookmark ? { bookmark } : {}) });
    const boards = await fetch(`${base}/boards?${params}`, { headers: { Authorization: `Bearer ${tokens.access_token}` }, signal: AbortSignal.timeout(15_000) });
    if (!boards.ok) { console.log(`Board lookup returned HTTP ${boards.status}. Connection is saved; inspect boards in Pinterest or retry later.`); break; }
    const data = await boards.json();
    for (const board of data.items || []) console.log(`${board.id}  ${board.name}`);
    bookmark = data.bookmark;
  } while (bookmark);
} finally { rl.close(); }
