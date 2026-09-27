const {test}=require('node:test');
const assert=require('node:assert/strict');
const JSZip=require('jszip');
const {importDocument,textBlocks}=require(process.env.CURATED_PACKAGED_IMPORT || './document-import.cjs');
test('Word import extracts readable article text without executable markup',async()=>{
  const zip=new JSZip();
  zip.file('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Reading corner guide</w:t></w:r></w:p><w:p><w:r><w:t>Choose a comfortable lamp.</w:t></w:r></w:p></w:body></w:document>');
  const blocks=await importDocument(await zip.generateAsync({type:'nodebuffer'}),'docx');
  assert.deepEqual(blocks.map(b=>b.text),['Reading corner guide','Choose a comfortable lamp.']);
});
test('PDF import extracts text for an indexable article',async()=>{
  const stream='BT /F1 18 Tf 50 700 Td (A helpful product guide.) Tj ET';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});
  const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blocks=await importDocument(Buffer.from(pdf),'pdf');assert.match(blocks[0].text,/helpful product guide/);
});
test('import rejects unsupported formats, oversized files, and empty documents',async()=>{
  await assert.rejects(importDocument(Buffer.from('x'),'exe'));
  await assert.rejects(importDocument(Buffer.alloc(10*1024*1024+1),'pdf'));
  assert.throws(()=>textBlocks(''),/No readable text/);
  assert.throws(()=>textBlocks(Array(41).fill('paragraph').join('\n\n')),/too long/);
});
