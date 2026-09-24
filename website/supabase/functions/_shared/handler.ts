import { runPublisher } from './publisher.ts';
async function sameSecret(provided: string, expected: string) {
  if (expected.length < 32 || provided.length > 256) return false;
  const encode = new TextEncoder();
  const [a, b] = await Promise.all([provided, expected].map(value => crypto.subtle.digest('SHA-256', encode.encode(value))));
  const left = new Uint8Array(a), right = new Uint8Array(b);
  let different = 0;
  for (let i = 0; i < left.length; i++) different |= left[i] ^ right[i];
  return different === 0;
}

export function createHandler(env: (name: string) => string, fetcher: typeof fetch = fetch) {
  return async (request: Request) => {
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, Allow: 'POST' } });
    if (!await sameSecret(request.headers.get('x-publisher-secret') || '', env('PUBLISHER_SECRET'))) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    try {
      const result = await runPublisher({
        supabaseUrl: env('SUPABASE_URL'), serviceKey: env('SUPABASE_SERVICE_ROLE_KEY'), siteUrl: env('SITE_URL'),
        enabled: env('PINTEREST_PUBLISHING_ENABLED') === 'true',
        apiEnv: env('PINTEREST_API_ENV') === 'production' ? 'production' : 'sandbox',
        standardAccess: env('PINTEREST_STANDARD_ACCESS') === 'true', appId: env('PINTEREST_APP_ID'), appSecret: env('PINTEREST_APP_SECRET'),
        defaultBoardId: env('PINTEREST_DEFAULT_BOARD_ID'),
      }, fetcher);
      return new Response(JSON.stringify(result), { status: result.status === 'error' ? 502 : 200, headers });
    } catch { return new Response(JSON.stringify({ error: 'Publisher configuration or database is unavailable. Check function secrets and migrations.' }), { status: 500, headers }); }
  };
}
