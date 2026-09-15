import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const assets = new URL('./assets/', import.meta.url);
await mkdir(assets, {recursive: true});
// Explicit allowlist: no .env files, password, sessions or publisher credentials.
for (const name of ['index.html', 'app.js', 'drafts.js', 'style.css']) {
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
if (supabase.protocol !== 'https:' || !supabase.hostname.endsWith('.supabase.co') || site.protocol !== 'https:' || !config.SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
  throw new Error('Set valid public project settings in .env.example before packaging.');
}
await writeFile(new URL('config.json', assets), JSON.stringify({
  supabaseUrl: supabase.origin,
  publishableKey: config.SUPABASE_PUBLISHABLE_KEY,
  siteUrl: site.origin,
  editorEmail: 'curatedpick.store@gmail.com',
}));
console.log('Studio files and public project settings prepared.');
