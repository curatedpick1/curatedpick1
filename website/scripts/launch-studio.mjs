import {spawn, spawnSync} from 'node:child_process';
import {access, mkdir, open} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const url='http://127.0.0.1:4333';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function running() {
  try {
    const response=await fetch(`${url}/config.json`,{signal:AbortSignal.timeout(1000)});
    if(response.headers.get('x-curated-studio')==='1')return true;
    throw new Error('Port 4333 is occupied by another app or an older Studio. Close that server, then launch again.');
  }catch(error){if(error.message.startsWith('Port 4333'))throw error;return false;}
}
async function openBrowser() {
  const [command,args]=process.platform==='win32'
    ? ['rundll32.exe',['url.dll,FileProtocolHandler',url]]
    : process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
  await new Promise((resolve,reject)=>{
    const child=spawn(command,args,{windowsHide:true,stdio:'ignore'});
    child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Browser could not open.')));
  });
}
try {
  if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Install Node.js 24, then open Start Studio again.');
  if(!await running()) {
    try{await access(new URL('../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',import.meta.url));}
    catch {
      console.log('First launch: installing dependencies. This needs internet once.');
      const install=spawnSync(process.platform==='win32'?'cmd.exe':'npm',process.platform==='win32'?['/d','/s','/c','npm ci']:['ci'],{cwd:root,stdio:'inherit',windowsHide:true});
      if(install.error || install.status!==0)throw new Error('Dependency installation failed. Check your internet connection and try again.');
    }
    await mkdir(new URL('../.private/',import.meta.url),{recursive:true});
    const log=await open(new URL('../.private/studio.log',import.meta.url),'a');
    try {
      const child=spawn(process.execPath,[fileURLToPath(new URL('studio.mjs',import.meta.url))],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log.fd,log.fd]});
      await new Promise((resolve,reject)=>{child.once('spawn',resolve);child.once('error',reject);});child.unref();
    }finally{await log.close();}
    let ready=false;
    for(let attempt=0;attempt<40;attempt++){if(await running()){ready=true;break;}await pause(250);}
    if(!ready)throw new Error('Studio did not start. Check .private/studio.log in the project folder.');
  }
  console.log(`Studio is ready: ${url}`);
  if(!process.argv.includes('--no-browser'))try{await openBrowser();}catch{console.log(`Open ${url} in your browser.`);}
}catch(error){console.error(error.message);process.exitCode=1;}
