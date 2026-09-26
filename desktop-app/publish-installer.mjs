import {mkdir,copyFile,readFile} from 'node:fs/promises';
const pkg=JSON.parse(await readFile(new URL('./package.json',import.meta.url),'utf8'));
const filename=`Curated-Studio-Setup-${pkg.version}.exe`;
await mkdir(new URL('./distribution/',import.meta.url),{recursive:true});
for(const suffix of ['', '.blockmap'])await copyFile(new URL(`./release/${filename}${suffix}`,import.meta.url),new URL(`./distribution/${filename}${suffix}`,import.meta.url));
console.log(`Installer copied to distribution/${filename}`);
