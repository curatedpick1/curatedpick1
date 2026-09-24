import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import sharp from 'sharp';

const root = new URL('../website/', import.meta.url);
const assets = new URL('./assets/', import.meta.url);
const credential = JSON.parse(await readFile(new URL('.private/studio-access.json', root), 'utf8'));
const privateDirectory = new URL('./private/', import.meta.url);
await mkdir(privateDirectory, {recursive: true});
await mkdir(assets, {recursive: true});
// Public files and one scoped editor credential; no service or publisher secrets.
for (const name of ['index.html', 'app.js', 'drafts.js', 'media.js', 'style.css']) {
  await copyFile(new URL(`studio/${name}`, root), new URL(name, assets));
}
await copyFile(new URL('public/favicon.svg', root), new URL('logo.svg', assets));
// Render the existing site logo as a Windows icon (PNG-backed ICO).
const icon = await sharp(await readFile(new URL('public/favicon.svg', root))).resize(256, 256).png().toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(icon.length, 14);
icoHeader.writeUInt32LE(22, 18);
await writeFile(new URL('icon.ico', assets), Buffer.concat([icoHeader, icon]));
await copyFile(new URL('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', root), new URL('font.woff2', assets));
const config = parseEnv(await readFile(new URL('.env.example', root), 'utf8'));
const supabase = new URL(config.SUPABASE_URL);
const site = new URL(config.SITE_URL);
if (credential.supabaseUrl !== supabase.origin || !credential.email || !credential.password) throw new Error('Configure this app copy before building its installer.');
await writeFile(new URL('editor.json', privateDirectory), JSON.stringify(credential));
await copyFile(new URL('scripts/studio-auth.cjs', root), new URL('./studio-auth.cjs', import.meta.url));
if (supabase.protocol !== 'https:' || !supabase.hostname.endsWith('.supabase.co') || site.protocol !== 'https:' || !config.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
  throw new Error('Set valid public project settings in .env.example before packaging.');
}
await writeFile(new URL('config.json', assets), JSON.stringify({
  supabaseUrl: supabase.origin,
  publishableKey: config.SUPABASE_PUBLISHABLE_KEY,
  siteUrl: site.origin,
}));
console.log('Studio files and public project settings prepared.');
