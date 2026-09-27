const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

function textBlocks(text) {
  const blocks=[];
  for(const paragraph of text.replace(/\r/g,'').split(/\n\s*\n/)) {
    let remaining=paragraph.replace(/\n/g,' ').replace(/\s+/g,' ').trim();
    while(remaining){
      let end=Math.min(2200,remaining.length);
      if(end<remaining.length){const space=remaining.lastIndexOf(' ',end);if(space>1000)end=space;}
      blocks.push({type:'paragraph',text:remaining.slice(0,end).trim()});
      remaining=remaining.slice(end).trim();
      if(blocks.length>40)throw new Error('This article is too long. Import a shorter document with up to 40 paragraphs.');
    }
  }
  if(!blocks.length)throw new Error('No readable text found. For a scanned PDF, export it with selectable text first.');
  return blocks;
}
async function extract(bytes,type){
  let text='';
  if(type==='doc'){
    const WordExtractor=require('word-extractor');
    text=(await new WordExtractor().extract(Buffer.from(bytes))).getBody();
  }else if(type==='docx'){
    const mammoth=require('mammoth');
    text=(await mammoth.extractRawText({buffer:Buffer.from(bytes)})).value;
  }else if(type==='pdf'){
    const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
    const path=require('node:path');
    const standardFontDataUrl=path.join(path.dirname(require.resolve('pdfjs-dist/package.json')),'standard_fonts').replaceAll('\\','/')+'/';
    const task=getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:false,stopAtErrors:true,standardFontDataUrl});
    const pdf=await task.promise;
    try{
      if(pdf.numPages>60)throw new Error('Use a PDF with 60 pages or fewer.');
      for(let n=1;n<=pdf.numPages;n++){
        const page=await pdf.getPage(n);
        const content=await page.getTextContent();
        text+=content.items.map(item=>'str' in item?item.str+(item.hasEOL?'\n':' '):'').join('')+'\n\n';
        page.cleanup();
        if(text.length>88000)throw new Error('This PDF is too long for one article.');
      }
    }finally{await task.destroy();}
  }else throw new Error('Choose a PDF or Word document.');
  return textBlocks(text);
}
function importDocument(bytes,type){
  if(!['pdf','doc','docx'].includes(type))return Promise.reject(new Error('Choose a PDF or Word document.'));
  if(!bytes.length||bytes.length>10*1024*1024)return Promise.reject(new Error('Use a document smaller than 10 MB.'));
  return new Promise((resolve,reject)=>{
    const worker=new Worker(__filename,{workerData:{bytes,type},resourceLimits:{maxOldGenerationSizeMb:256}});
    const timer=setTimeout(()=>{worker.terminate();reject(new Error('Import took too long. Try a smaller document.'));},30000);
    worker.once('message',result=>{clearTimeout(timer);worker.terminate();result.error?reject(new Error(result.error)):resolve(result.blocks);});
    worker.once('error',()=>{clearTimeout(timer);reject(new Error('The document could not be read. Try exporting it again.'));});
    worker.once('exit',code=>{clearTimeout(timer);if(code!==0)reject(new Error('Document import stopped. Try a smaller file.'));});
  });
}
if(!isMainThread){extract(workerData.bytes,workerData.type).then(blocks=>parentPort.postMessage({blocks})).catch(error=>parentPort.postMessage({error:error.name==='PasswordException'?'Unlock this PDF before importing it.':error.message}));}
module.exports={importDocument,textBlocks};
