import { mkdir, writeFile } from 'node:fs/promises';
const stores = {amazon:'https://www.amazon.com/favicon.ico',walmart:'https://www.walmart.com/favicon.ico',daraz:'https://www.daraz.pk/favicon.ico',aliexpress:'https://www.aliexpress.com/favicon.ico',alibaba:'https://www.alibaba.com/favicon.ico',temu:'https://www.temu.com/favicon.ico',ebay:'https://www.ebay.com/favicon.ico',etsy:'https://www.etsy.com/favicon.ico',target:'https://www.target.com/favicon.ico',bestbuy:'https://www.bestbuy.com/favicon.ico',shein:'https://www.shein.com/favicon.ico'};
stores.daraz='https://laz-img-cdn.alicdn.com/imgextra/i1/O1CN01V8uEDV1jdZ9U2wL90_!!6000000004571-73-tps-64-64.ico';
stores.temu='https://aimg.kwcdn.com/upload_aimg/web/c9653751-0a91-46f1-806a-b639dd32931b.png.slim.png';
const directory = new URL('../public/stores/', import.meta.url);
await mkdir(directory,{recursive:true});
await Promise.all(Object.entries(stores).map(async ([name,url])=>{
  try {
    const r = await fetch(url,{signal:AbortSignal.timeout(20000)});
    const bytes=Buffer.from(await r.arrayBuffer());
    if(!r.ok || (!r.headers.get('content-type')?.match(/image|octet-stream/) && !url.endsWith('.svg')) || bytes.length<50) throw new Error(`HTTP ${r.status}`);
    await writeFile(new URL(`${name}.${url.endsWith('.svg')?'svg':url.endsWith('.png')?'png':'ico'}`,directory),bytes);
    console.log(`${name}: saved retailer icon`);
  } catch(error){console.log(`${name}: ${error.message}`);}
}));
