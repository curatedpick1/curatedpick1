import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import auth from './studio-auth.cjs';

// Loopback-only app. The private editor credential is never served as a file.
const root = new URL('../', import.meta.url);
let config = {};
for (const name of ['.env.example', '.env', '.env.studio']) {
  try { config = { ...config, ...parseEnv(await readFile(new URL(name, root), 'utf8')) }; } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const publicConfig = {
  supabaseUrl: config.SUPABASE_URL || '',
  publishableKey: config.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_') ? config.SUPABASE_PUBLISHABLE_KEY : '',
  siteUrl: config.SITE_URL?.includes('YOUR-') ? '' : config.SITE_URL || '',
};
const routes = new Map([
  ['/', ['studio/index.html','text/html; charset=utf-8']],
  ['/app.js', ['studio/app.js','text/javascript; charset=utf-8']],
  ['/drafts.js', ['studio/drafts.js','text/javascript; charset=utf-8']],
  ['/media.js', ['studio/media.js','text/javascript; charset=utf-8']],
  ['/style.css', ['studio/style.css','text/css; charset=utf-8']],
  ['/logo.svg', ['public/favicon.svg','image/svg+xml']],
  ['/font.woff2', ['node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2','font/woff2']],
]);
const getSession = auth.createStudioSession(publicConfig, new URL('../.private/studio-access.json', import.meta.url));
const server = createServer(async (req,res) => {
  const origin = 'http://127.0.0.1:4333';
  const headers = { 'X-Curated-Studio':'1', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer',
    'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' https: blob:; media-src blob:; connect-src 'self' https://*.supabase.co ${publicConfig.siteUrl ? new URL(publicConfig.siteUrl).origin : ''}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` };
  if (req.headers.host !== '127.0.0.1:4333' || (req.headers.origin && req.headers.origin !== origin) || req.headers['sec-fetch-site'] === 'cross-site') {res.writeHead(403,headers).end('Use http://127.0.0.1:4333');return;}
  const path = new URL(req.url,origin).pathname;
  if (path === '/session') {
    if (req.method !== 'POST' || req.headers.origin !== origin) {res.writeHead(403,headers).end();return;}
    try {res.writeHead(200,{...headers,'Content-Type':'application/json'}).end(JSON.stringify(await getSession()));}
    catch(error) {res.writeHead(503,{...headers,'Content-Type':'application/json'}).end(JSON.stringify({error:error.message}));}
    return;
  }
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,headers).end();return;}
  if (path === '/config.json') {res.writeHead(200,{...headers,'Content-Type':'application/json'}).end(req.method==='HEAD' ? '' : JSON.stringify(publicConfig));return;}
  const route = routes.get(path);
  if (!route) {res.writeHead(404,headers).end('Not found');return;}
  try {const body = await readFile(new URL(route[0], root));res.writeHead(200,{...headers,'Content-Type':route[1]}).end(req.method==='HEAD' ? '' : body);}
  catch {res.writeHead(500,headers).end('Missing app files. Run npm ci in the project folder.');}
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Studio is already running at http://127.0.0.1:4333' : error.message); process.exitCode=1; });
server.listen(4333,'127.0.0.1',()=>console.log(`Curated Studio: http://127.0.0.1:4333\nKeep this terminal open. Ctrl+C stops the local app.\nProject: ${fileURLToPath(root)}`));
