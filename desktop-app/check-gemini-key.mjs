import {readFile} from 'node:fs/promises';
let key=process.env.CURATED_GEMINI_API_KEY?.trim()||'';
if(!key){try{key=(await readFile(new URL('./private/gemini-api-key.txt',import.meta.url),'utf8')).trim();}catch(error){if(error.code!=='ENOENT')throw error;}}
if(!key)throw new Error('Add your Gemini API key to desktop-app/private/gemini-api-key.txt, then run npm run dist again. This private key file is excluded from Git.');
console.log('Gemini key found. It will be embedded in this installer; share the installer only with trusted people.');
