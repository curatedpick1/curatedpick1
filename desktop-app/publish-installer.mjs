import {mkdir,copyFile,readFile} from 'node:fs/promises';
const pkg=JSON.parse(await readFile(new URL('./package.json',import.meta.url),'utf8'));
const filename=`Curated-Studio-Setup-${pkg.version}.exe`;
const output=new URL('./private/',import.meta.url);
await mkdir(output,{recursive:true});
for(const suffix of ['', '.blockmap'])await copyFile(new URL(`./release/${filename}${suffix}`,import.meta.url),new URL(`./private/${filename}${suffix}`,import.meta.url));
console.log(`Private installer ready at private/${filename}; it is excluded from Git.`);
