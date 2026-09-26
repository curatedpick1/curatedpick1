import {listDrafts, putDraft, deleteDraft} from './drafts.js';
import {mediaKind, prepareMedia, posterFromVideo, restoreMedia} from './media.js';
const $ = id => document.getElementById(id);
const form = $('product-form');
const field = name => form.elements.namedItem(name);
let connection, session, products = [], status, selected, createId, dirty = false, busy = false, offset = 0;
const pageSize = 100;
let localDrafts=[], localVersion=0, draftProject=null, mediaItems=[], previewUrls=[], hasForm=false, lastBoard='', tagValues=[];
function tell(text, error = false) {const node = $('notice');node.textContent=text;node.classList.toggle('error',error);}
function renderTags(){const list=$('tag-list');if(!list)return;list.replaceChildren();tagValues.forEach((tag,index)=>{const chip=document.createElement('span');chip.className='tag-chip';chip.textContent=tag;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`Remove tag ${tag}`);remove.addEventListener('click',()=>{tagValues.splice(index,1);renderTags();dirty=true;});chip.append(remove);list.append(chip);});}
function addTag(value){const tag=value.trim().replace(/^,+|,+$/g,'');if(!tag)return;if(tagValues.length>=12)throw new Error('Use up to 12 tags.');if(tag.length>40)throw new Error('Tags can be at most 40 characters.');if(!tagValues.some(item=>item.toLowerCase()===tag.toLowerCase()))tagValues.push(tag);renderTags();}
let generatedDetails={description:'',category:'',tags:[]}, autoFillTimer, autoFillBusy=false;
const blogFonts=new Set(['Arial','Impact','Georgia','Verdana','Trebuchet MS','Times New Roman','Courier New']);
function collectBlogBlocks(local=false){
  const editor=$('blog-editor');if(!editor)return[];const blocks=[];
  const alignment=node=>['left','center','right'].includes(node?.style?.textAlign)?node.style.textAlign:'left';
  function walk(node,style,runs){
    if(node.nodeType===Node.TEXT_NODE){const text=node.nodeValue||'';if(text)runs.push({text,...(style.bold?{bold:true}:{}),...(style.italic?{italic:true}:{}),...(style.underline?{underline:true}:{}),...(style.font?{font:style.font}:{}),...(style.size?{size:style.size}:{})});return;}
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    const el=node,tag=el.tagName.toLowerCase(),next={...style};if(tag==='b'||tag==='strong')next.bold=true;if(tag==='i'||tag==='em')next.italic=true;if(tag==='u')next.underline=true;
    const declaredFont=el.style?.fontFamily||el.getAttribute?.('face')||'';if(declaredFont){const font=[...blogFonts].find(f=>declaredFont.toLowerCase().includes(f.toLowerCase()));if(font)next.font=font;}
    const px=parseInt(el.style?.fontSize||'');if(['small','normal','large','xlarge'].includes(el.dataset?.size))next.size=el.dataset.size;else if(px)next.size=px<=12?'small':px<=16?'normal':px<=22?'large':'xlarge';
    for(const child of el.childNodes)walk(child,next,runs);
  }
  function emitText(node,tag){const runs=[];walk(node,{},runs);const text=runs.map(r=>r.text).join('').trim();if(!text)return;blocks.push({type:'rich_text',tag:['h2','h3'].includes(tag)?tag:'p',align:alignment(node),runs});}
  for(const node of editor.childNodes){
    if(node.nodeType===Node.TEXT_NODE){emitText(node,'p');continue;}
    if(node.nodeType!==Node.ELEMENT_NODE)continue;
    const tag=node.tagName.toLowerCase(),img=node.matches('img[data-media-index]')?node:node.querySelector('img[data-media-index]');
    if(img){const index=Number(img.dataset.mediaIndex),item=mediaItems[index];if(item){blocks.push(local?{type:'image',media_index:index,alt:img.alt||''}:{type:'image',url:item.url,alt:img.alt||item.alt||field('title').value.trim(),align:alignment(node)});}continue;}
    emitText(node,tag);
  }
  return blocks;
}
function blogTextElement(tag,align){const el=document.createElement(['h2','h3'].includes(tag)?tag:'p');el.style.textAlign=['left','center','right'].includes(align)?align:'left';return el;}
function renderBlogBlocks(blocks=[]){const editor=$('blog-editor');if(!editor)return;editor.replaceChildren();
  for(const block of blocks){
    if(block.type==='image'){const index=Number(block.media_index??block.mediaIndex);const item=mediaItems[index]||mediaItems.find(value=>value.url===block.url);if(!item)continue;const wrap=document.createElement('p');wrap.style.textAlign=block.align||'center';const img=document.createElement('img');img.dataset.mediaIndex=String(mediaItems.indexOf(item));img.alt=block.alt||'';img.src=item.file?URL.createObjectURL(item.file):item.url;img.style.maxWidth='100%';wrap.append(img);editor.append(wrap);continue;}
    const tag=block.type==='heading'?'h2':block.type==='rich_text'?block.tag:'p';const el=blogTextElement(tag,block.align);
    if(block.type==='rich_text'&&Array.isArray(block.runs)){for(const run of block.runs){const span=document.createElement('span');span.textContent=run.text||'';if(run.bold)span.style.fontWeight='700';if(run.italic)span.style.fontStyle='italic';if(run.underline)span.style.textDecoration='underline';if(blogFonts.has(run.font))span.style.fontFamily=run.font;if(['small','normal','large','xlarge'].includes(run.size))span.dataset.size=run.size;el.append(span);}}
    else{const span=document.createElement('span');span.textContent=block.text||'';if(block.type==='underline')span.style.textDecoration='underline';el.append(span);}
    editor.append(el);
  }
  refreshBlogImageOptions();
}
function refreshBlogImageOptions(){const select=$('blog-image-source');if(!select)return;const prior=select.value;select.replaceChildren(new Option('Insert product image',''));let n=0;mediaItems.forEach((item,index)=>{if(item.kind!=='image')return;const option=new Option(`Photo ${++n}${item.file?.name?` ? ${item.file.name}`:''}`,String(index));select.append(option);});if([...select.options].some(o=>o.value===prior))select.value=prior;}
function addBlogImage(){const index=$('blog-image-source').value,item=mediaItems[Number(index)];if(!item){tell('Add or select a product photo first.',true);return;}const wrap=document.createElement('p');wrap.style.textAlign='center';const img=document.createElement('img');img.dataset.mediaIndex=index;img.src=item.file?URL.createObjectURL(item.file):item.url;img.alt=item.alt||'';img.style.maxWidth='100%';wrap.append(img);const editor=$('blog-editor');editor.focus();const selection=getSelection();if(selection?.rangeCount){const range=selection.getRangeAt(0);range.collapse(false);range.insertNode(wrap);range.setStartAfter(wrap);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}else editor.append(wrap);dirty=true;}
function applyBlogCommand(command,value=null){$('blog-editor').focus();document.execCommand(command,false,value);dirty=true;}
function setBlogSize(delta){const editor=$('blog-editor');editor.focus();const selection=getSelection();if(!selection?.rangeCount||selection.isCollapsed){tell('Select some blog text first to change its size.');return;}const range=selection.getRangeAt(0);const span=document.createElement('span');const steps=['small','normal','large','xlarge'];const node=range.startContainer.parentElement;const current=steps.indexOf(node?.dataset.size||'normal');span.dataset.size=steps[Math.max(0,Math.min(3,current+delta))];try{range.surroundContents(span);}catch{const text=range.extractContents();span.append(text);range.insertNode(span);}dirty=true;}
function addBlogBlock(){const editor=$('blog-editor');editor.focus();document.execCommand('formatBlock',false,'p');dirty=true;}
let resultReturnFocus=null;
function showPublishResult(product){if(!product)return;const url=`${connection.siteUrl}/products/${product.slug}/`;const project=new URL(connection.supabaseUrl).hostname.split('.')[0];$('result-product-link').href=url;$('result-supabase-link').href=`https://supabase.com/dashboard/project/${project}/editor?schema=public&table=products&row=${encodeURIComponent(product.id)}`;$('result-pin-link').hidden=true;$('result-pin-link').removeAttribute('href');$('result-supabase-status').textContent='Yes — saved';$('result-website-status').textContent='Checking live page…';$('result-pinterest-status').textContent=product.publish_to_pinterest?'Queued — checking…':'No — not selected';$('result-title').textContent='Product saved';$('result-copy').textContent='Supabase saved it. Website and Pinterest status will update here.';resultReturnFocus=$('publish');$('publish-result').hidden=false;$('result-done').focus();void checkPublishStatuses(product);}
function closePublishResult(){$('publish-result').hidden=true;resultReturnFocus?.focus?.();}
function setResultStatus(id,text){$(id).textContent=text;}
async function checkPublishStatuses(product){
  let websiteDone=false,pinDone=!product.publish_to_pinterest;
  if(pinDone)setResultStatus('result-pinterest-status','No — posting not selected');
  const end=Date.now()+10*60*1000;
  while(Date.now()<end&&!$('publish-result').hidden&&(!websiteDone||!pinDone)){
    if(!websiteDone)try{
      const response=await fetch(`${connection.siteUrl}/catalog-version.json?verify=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(10000)});
      const live=response.ok?await response.json():null;const page=live?.products?.[product.id];websiteDone=Boolean(live&&!live.demo&&page?.slug===product.slug&&page?.revision===product.revision);
      setResultStatus('result-website-status',websiteDone?'Yes — live':'Pending — waiting for live page');
    }catch{setResultStatus('result-website-status','Pending — website check unavailable');}
    if(!pinDone)try{
      const current=await request('/rest/v1/rpc/get_editor_status',{method:'POST',body:'{}'});const job=current?.jobs?.find(item=>item.product_id===product.id);
      if(job?.state==='published'&&job.pin_id){const pin=`https://www.pinterest.com/pin/${encodeURIComponent(job.pin_id)}/`;$('result-pin-link').href=pin;$('result-pin-link').hidden=false;setResultStatus('result-pinterest-status','Yes — posted');pinDone=true;}
      else if(job&&['failed','needs_review','cancelled'].includes(job.state)){setResultStatus('result-pinterest-status',`No — ${job.state.replace('_',' ')}`);pinDone=true;}
      else setResultStatus('result-pinterest-status',job?`Pending — ${job.state.replace('_',' ')}`:'Pending — waiting for publisher');
    }catch{setResultStatus('result-pinterest-status','Pending — status check unavailable');}
    if(!websiteDone||!pinDone)await new Promise(resolve=>setTimeout(resolve,12000));
  }
  if(!$('publish-result').hidden){if(!websiteDone)setResultStatus('result-website-status','Still pending — close and check again later');if(!pinDone)setResultStatus('result-pinterest-status','Still pending — publisher will retry automatically');}
}
function safeUrl(value) {const url=new URL(value);if(url.protocol!=='https:' || url.username || url.password || /\s/.test(value))throw new Error('Use a full HTTPS URL.');return url;}
function detectStore(value){try{const host=new URL(value).hostname.toLowerCase().replace(/^www\./,'');if(host==='amzn.to'||host.startsWith('amazon.')||host.includes('.amazon.'))return 'Amazon';if(host==='walmart.com'||host.endsWith('.walmart.com'))return 'Walmart';if(host==='aliexpress.com'||host.endsWith('.aliexpress.com'))return 'AliExpress';if(host==='alibaba.com'||host.endsWith('.alibaba.com'))return 'Alibaba';if(['daraz.pk','daraz.com.bd','daraz.lk','daraz.com.np','daraz.com.mm'].some(domain=>host===domain||host.endsWith('.'+domain)))return 'Daraz';if(host==='temu.com'||host.endsWith('.temu.com'))return 'Temu';if(host==='ebay.com'||host.endsWith('.ebay.com'))return 'eBay';if(host==='etsy.com'||host.endsWith('.etsy.com'))return 'Etsy';if(host==='target.com'||host.endsWith('.target.com'))return 'Target';if(host==='bestbuy.com'||host.endsWith('.bestbuy.com'))return 'Best Buy';if(host==='shein.com'||host.endsWith('.shein.com'))return 'Shein';}catch{}return 'Other';}
async function generateDetails(){
  const title=field('title').value.trim(),poster=mediaItems.find(item=>item.kind==='image');if(title.length<3||!poster||autoFillBusy)return;autoFillBusy=true;
  const status=$('autofill-status');status.textContent='Generating description, category and tags from the title and photo...';
  try{
    if(!session)await connect();let blob;
    if(poster.file)blob=poster.file;else{const imageUrl=new URL(poster.url);if(imageUrl.origin!==connection.supabaseUrl||!imageUrl.pathname.includes('/product-images/'))throw new Error('Re-add the product photo to generate suggestions.');const response=await fetch(imageUrl,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('Could not load the saved photo. Re-add it and try again.');blob=await response.blob();}
    if(blob.size>5*1024*1024)throw new Error('The photo must be under 5 MB for AI suggestions.');const mimeType=['image/jpeg','image/png','image/webp'].includes(blob.type)?blob.type:'image/jpeg';const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));const imageBase64=btoa(binary);
    let result;
    if(connection.suggestionMode==='direct'){
      if(!connection.geminiApiKey)throw new Error('This installer has no Gemini key. Add it to the private build file and rebuild.');
      const categories=[...field('category').options].map(option=>option.value).filter(Boolean);
      const prompt=`Write a natural, human-sounding product description using only facts visible in the photo or stated in the title. Do not invent brands, materials, dimensions, features, prices, guarantees, or performance claims. Avoid sales clich?s and overly polished marketing language. Return one JSON object only: {"description":"...","category":"...","tags":["..."]}. Description: normal length, about 30-45 words in 2 short sentences, plain conversational language, maximum 440 characters. Do not use emojis, em dashes, or en dashes. Choose exactly one category from this list: ${categories.join(' | ')}. Tags: 4-8 relevant short search phrases, each max 40 characters, no hashtags. Product title: ${title}`;
      const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',{method:'POST',headers:{'x-goog-api-key':connection.geminiApiKey,'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt},{inline_data:{mime_type:mimeType,data:imageBase64}}]}],generationConfig:{responseMimeType:'application/json',temperature:0.3}}),signal:AbortSignal.timeout(90000)});
      const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(response.status===429?'Gemini free-tier limit reached. Wait a little and try again.':data?.error?.message||`Gemini request failed (${response.status}).`);
      const text=data?.candidates?.[0]?.content?.parts?.map(part=>part.text||'').join('');try{result=JSON.parse(text||'{}');}catch{throw new Error('Gemini returned an unreadable suggestion. Try again.');}
      result.description=typeof result.description==='string'?result.description.replace(/[\u2014\u2013]/g,',').replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\uFE0F\u200D]/gu,'').replace(/\s+([,.!?])/g,'$1').replace(/,{2,}/g,',').replace(/\s{2,}/g,' ').trim().slice(0,440):'';
      if(!result.description)throw new Error('Gemini returned an empty description. Try again.');if(!categories.includes(result.category))result.category=categories[0];
      result.tags=Array.isArray(result.tags)?[...new Set(result.tags.filter(tag=>typeof tag==='string').map(tag=>tag.trim().slice(0,40)).filter(Boolean))].slice(0,12):[];
    }else{
      const response=await fetch(`${connection.supabaseUrl}/functions/v1/studio-generate`,{method:'POST',headers:{apikey:connection.publishableKey,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({title,mimeType,imageBase64}),signal:AbortSignal.timeout(90000)});result=await response.json().catch(()=>null);if(!response.ok)throw new Error(result?.error||`Suggestion failed (${response.status}).`);
    }
    if(field('title').value.trim()!==title||mediaItems.find(item=>item.kind==='image')!==poster)return;
    const desc=field('description'),category=field('category');if(!desc.value.trim()||desc.value===generatedDetails.description){desc.value=result.description;generatedDetails.description=result.description;}
    if(!category.value||category.value===generatedDetails.category){category.value=result.category;generatedDetails.category=result.category;}
    const current=tagValues.slice().sort().join('|'),previous=generatedDetails.tags.slice().sort().join('|');if(!tagValues.length||current===previous){tagValues=[];for(const tag of result.tags||[]){if(tagValues.length>=12)break;try{addTag(tag);}catch{}}generatedDetails.tags=[...tagValues];}
    $('editor-title').textContent=title;status.textContent='Suggestions filled from your title and photo. Edit any field as needed.';dirty=true;
  }catch(error){status.textContent=`Automatic suggestions unavailable: ${error.message}`;}
  finally{autoFillBusy=false;if(field('title').value.trim()!==title)scheduleAutoFill();}
}
function scheduleAutoFill(){clearTimeout(autoFillTimer);if(field('title').value.trim().length<3||!mediaItems.some(item=>item.kind==='image'))return;autoFillTimer=setTimeout(()=>void generateDetails(),900);}
function readConnection(settings) {
  const url=safeUrl(settings.supabaseUrl || '');
  if(!/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.port || url.pathname !== '/')throw new Error('Enter your Supabase project URL: https://your-project.supabase.co');
  const key=settings.publishableKey || '';if(!key.startsWith('sb_publishable_'))throw new Error('The local Studio is missing its public Supabase configuration.');
  const site=safeUrl(settings.siteUrl || '');
  if(site.pathname!=='/' || site.search || site.hash)throw new Error('Website URL should be only the origin, for example https://your-worker.workers.dev');
  return {supabaseUrl:url.origin,publishableKey:key,siteUrl:site.origin,suggestionMode:settings.suggestionMode||'supabase',geminiApiKey:settings.geminiApiKey||''};
}
async function request(path, options={}, auth=true) {
  if(auth) {
    if(!session || Date.now()>session.deadline-60000) await obtainSession();
  }
  const response=await fetch(connection.supabaseUrl+path,{...options,signal:AbortSignal.timeout(90000),headers:{apikey:connection.publishableKey,...(auth?{Authorization:`Bearer ${session.access_token}`} : {}),'Content-Type':'application/json',...options.headers}});
  const data=response.status===204 ? null : await response.json().catch(()=>null);
  if(!response.ok) {if(response.status===401){session=null;showWorkspace();}const error=new Error(data?.msg || data?.message || data?.error_description || data?.error || `Supabase request failed (${response.status}).`);error.code=data?.code;throw error;}
  return data;
}
let sessionPromise;
async function obtainSession() {
  if(sessionPromise)return sessionPromise;
  sessionPromise=(async()=>{
    try {
      const response=await fetch('/session',{method:'POST',signal:AbortSignal.timeout(25000)});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error || 'Publishing is unavailable. Try Reconnect.');
      session={...data,deadline:Date.now()+data.expires_in*1000};
    }catch(error){session=null;throw new Error(error.message || 'Offline. Your drafts are safe; reconnect to publish.');}
    finally{showWorkspace();}
  })();
  try{return await sessionPromise;}finally{sessionPromise=null;}
}
async function connect() {
  if(!connection)throw new Error('This copy is missing its project configuration. Install the latest Studio installer.');
  await obtainSession();
  try{await refresh();}catch(error){session=null;showWorkspace();throw error;}
  showWorkspace();
}
async function locked(action, login=false) {
  if(busy)return;busy=true;
  const buttons=[...document.querySelectorAll('button,input,textarea,select')];buttons.forEach(b=>b.disabled=true);
  try {await action();} catch(error) {tell(error.message || 'Something went wrong. Try again.',true,login);}
  finally {busy=false;buttons.forEach(b=>b.disabled=false);}
}
function allowDiscard() {return !busy && (!dirty || confirm('Discard edits since your last save? Use Save on this PC to keep them.'));}
function syncMedia() {
  const poster=mediaItems.find(item=>item.kind==='image');const video=mediaItems.find(item=>item.kind==='video');
  field('poster_url').value=poster?.url || '';
  field('pin_image_url').value=poster?.pinUrl || poster?.url || '';
  field('video_path').value=video?.path || '';
  field('pin_media_type').value=video?'video':'image';
}
function legacyStoreRow(store={}) {
  const row=document.createElement('div');row.className='store-row';
  for(const [key,label,type,max] of [['name','Store','select',40],['url','Affiliate URL','url',2048],['note','Optional note','text',120]]) {
    const wrap=document.createElement('label');wrap.textContent=label;if(key==='note')wrap.className='store-note';
    const input=document.createElement('input');input.type=type;input.maxLength=max;input.dataset.store=key;input.value=store[key] || '';input.placeholder=key==='name'?'Amazon':key==='url'?'https://…':'Variant, shipping, or a useful detail';wrap.append(input);if(key==='note')wrap.hidden=true;row.append(wrap);
  }
  const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove store');remove.addEventListener('click',()=>{row.remove();dirty=true;});row.append(remove);$('stores').append(row);
}
function storeRow(store={}) {
  const row=document.createElement('div');row.className='store-row';
  const nameWrap=document.createElement('label');nameWrap.textContent='Store';const name=document.createElement('select');name.dataset.store='name';for(const value of ['Amazon','Walmart','Daraz','AliExpress','Alibaba','Temu','eBay','Etsy','Target','Best Buy','Shein','Other']){const option=document.createElement('option');option.value=value;option.textContent=value;name.append(option);}name.value=store.url?detectStore(store.url):(store.name||'Amazon');if(![...name.options].some(option=>option.value===name.value))name.value='Other';nameWrap.append(name);row.append(nameWrap);
  const urlWrap=document.createElement('label');urlWrap.textContent='Affiliate URL';const url=document.createElement('input');url.type='url';url.dataset.store='url';url.maxLength=2048;url.value=store.url||'';url.placeholder='https://...';url.addEventListener('input',()=>{if(url.value.trim()){name.value=detectStore(url.value);dirty=true;}});urlWrap.append(url);row.append(urlWrap);
  const noteWrap=document.createElement('label');noteWrap.textContent='Optional note';noteWrap.className='store-note';const note=document.createElement('input');note.dataset.store='note';note.maxLength=120;note.value=store.note||'';note.placeholder='Variant, shipping, or a useful detail';noteWrap.append(note);noteWrap.hidden=true;row.append(noteWrap);
  const actions=document.createElement('div');actions.className='store-actions';if(!$('stores').children.length){const add=document.createElement('button');add.type='button';add.className='store-add';add.textContent='+ Add store';add.addEventListener('click',addStore);actions.append(add);}const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove store');remove.addEventListener('click',()=>{row.remove();dirty=true;});actions.append(remove);row.append(actions);$('stores').append(row);
}
function addStore(){if($('stores').children.length>=8){tell('You can add up to eight stores.',true);return;}storeRow();dirty=true;$('stores').lastElementChild?.querySelector('[data-store="name"]')?.focus();}
function fill(product, draft) {
  hasForm=true;selected=product;createId=draft?.id || crypto.randomUUID();localVersion=draft?.version || 0;draftProject=draft?.project || (product?connection.supabaseUrl:null);form.reset();$('stores').replaceChildren();
  const source=draft?.values || product || {title:'',description:'',category:'',tags:[],stores:[],pin_media_type:'image',publish_to_pinterest:true,pinterest_board_id:lastBoard};
  mediaItems=restoreMedia(source,draft?.media);
  for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type','pinterest_board_id','pin_image_url','video_path'])field(name).value=source[name] || '';
  field('blog_title').value=draft?.blogEditor?.title ?? source.blog_title ?? '';
  generatedDetails={description:'',category:'',tags:[]};renderBlogBlocks(draft?.blogEditor?.blocks || source.blog_content || []);
  tagValues=[...(source.tags || [])];field('tags').value='';renderTags();
  for(const name of ['featured','publish_to_pinterest'])field(name).checked=!!source[name];
  (source.stores.length?source.stores:[{}]).forEach(storeRow);
  $('editor-label').textContent=draft?'LOCAL DRAFT':product?'EDIT PRODUCT':'NEW PRODUCT';$('editor-title').textContent=source.title || 'New product';
  $('save-draft').textContent=product?.published?'Unpublish to Supabase draft':'Save to Supabase draft';$('publish').textContent=product?.published?'Save published changes ↗':'Publish product ↗';
  $('save-hint').textContent=product?.published?'Existing Pins are not reposted.':'Drafts stay on this PC. Publishing needs internet.';
  $('saved-links').hidden=!product;
  if(product){const url=`${draft?.siteUrl || connection.siteUrl}/products/${product.slug}/`;$('product-url').value=url;$('view-product').href=url;}
  syncMedia();dirty=false;renderList();renderJob();renderMedia();refreshBlogImageOptions();renderLocalList();
}
function renderJob() {
  const job=status?.jobs?.find(j=>j.product_id===selected?.id);
  $('job-state').textContent=job ? `Pin: ${job.state}${job.api_env ? ` (${job.api_env})` : ''}` : selected?.published?'Website published':'Draft';
  $('pinterest-help').textContent=job?.last_error ? `Publisher: ${job.last_error}` : !status?.pinterest_connected?'Pinterest is not connected yet. Save products now; complete publisher and Pinterest setup to send queued Pins.':'Pinterest credentials are saved. Actual posting still depends on the scheduled publisher, API access, and live website.';
}
function renderList() {
  const q=$('library-search').value.toLowerCase();const visible=products.filter(p=>p.published);$('product-list').replaceChildren();$('product-count').textContent=String(visible.length);
  const shown=visible.filter(p=>`${p.title} ${p.category}`.toLowerCase().includes(q));
  if(!shown.length){const p=document.createElement('p');p.className='note';p.textContent=!session?'Connect to see shared products.':visible.length?'No matching products.':'No published products yet.';$('product-list').append(p);}
  for(const p of shown){const b=document.createElement('button');b.type='button';b.className=`product-item${selected?.id===p.id?' active':''}`;const title=document.createElement('strong');title.textContent=p.title || 'Untitled draft';const info=document.createElement('span');const job=status?.jobs?.find(j=>j.product_id===p.id);info.textContent=`${p.published?'Published':'Draft'} · ${p.category}${job ? ` · Pin ${job.state}`:''}`;b.append(title,info);b.addEventListener('click',()=>{if(allowDiscard()){fill(p);tell('');}});$('product-list').append(b);}
}
async function refresh(reset=true) {
  status=await request('/rest/v1/rpc/get_editor_status',{method:'POST',body:'{}'});
  const page=await request(`/rest/v1/products?select=*&order=created_at.desc,id.desc&limit=${pageSize}&offset=${reset?0:offset}`);
  products=reset?page:[...products,...page];offset=products.length;$('load-more').hidden=page.length<pageSize;
  const c=status.catalog;$('site-state').textContent=c?.last_error?'Publisher needs attention':c?.deployed_revision>=c?.revision?'Website live from Supabase':'Waiting for live site check';
  $('pin-state').textContent=status.pinterest_connected?'Credentials saved':'Not connected yet';
  renderList();renderJob();
}
$('new-product').addEventListener('click',()=>{if(allowDiscard()){fill();tell('');field('title').focus();}});
$('library-search').addEventListener('input',renderList);
$('refresh').addEventListener('click',()=>void locked(async()=>{await refresh();tell('Status refreshed. Your unsaved form edits are preserved.');}));
$('load-more').addEventListener('click',()=>void locked(()=>refresh(false)));
if($('add-store'))$('add-store').addEventListener('click',addStore);
field('tags').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===','){event.preventDefault();try{addTag(field('tags').value);field('tags').value='';dirty=true;}catch(error){tell(error.message,true);}}});
field('tags').addEventListener('blur',()=>{if(field('tags').value.trim()){try{addTag(field('tags').value);field('tags').value='';}catch(error){tell(error.message,true);}}});
form.addEventListener('input',()=>{dirty=true;});
form.addEventListener('change',()=>{dirty=true;});
document.querySelectorAll('[data-blog-command]').forEach(button=>button.addEventListener('click',()=>applyBlogCommand(button.dataset.blogCommand)));$('blog-font').addEventListener('change',event=>applyBlogCommand('fontName',event.target.value));$('blog-block-style').addEventListener('change',event=>applyBlogCommand('formatBlock',event.target.value));$('blog-size-down').addEventListener('click',()=>setBlogSize(-1));$('blog-size-up').addEventListener('click',()=>setBlogSize(1));$('blog-insert-image').addEventListener('click',addBlogImage);$('blog-editor').addEventListener('input',()=>{dirty=true;});
field('pinterest_board_id').addEventListener('change',()=>{const board=field('pinterest_board_id').value.trim();if(!board || /^\d+$/.test(board)){lastBoard=board;try{localStorage.setItem('curated-studio-board',board);}catch{}}});
async function stageMedia(files) {
  if(!files.length)return;
  const kinds=files.map(mediaKind);
  const existing=kinds.includes('image')?mediaItems.filter(item=>!item.generated):mediaItems;
  if(existing.filter(i=>i.kind==='image').length+kinds.filter(k=>k==='image').length>10)throw new Error('Use up to 10 photos per product.');
  if(existing.filter(i=>i.kind==='video').length+kinds.filter(k=>k==='video').length>1)throw new Error('Use one video per product. Remove the current video to replace it.');
  tell('Preparing your photos and video…');
  const prepared=[];for(const file of files)prepared.push(await prepareMedia(file));
  const next=[...existing,...prepared];
  if(!next.some(i=>i.kind==='image')){
    try{next.unshift(await posterFromVideo(next.find(i=>i.kind==='video').file));}
    catch(error){mediaItems=next;dirty=true;syncMedia();renderMedia();throw error;}
  }
  mediaItems=next;dirty=true;syncMedia();renderMedia();refreshBlogImageOptions();tell('Media ready. The first photo is used as the poster for your website and Pinterest.');
}
$('media-files').addEventListener('change',()=>{const files=[...$('media-files').files];$('media-files').value='';void locked(async()=>{await stageMedia(files);refreshBlogImageOptions();scheduleAutoFill();field('title').focus();});});

function payload(published,validate=true) {
  syncMedia();
  const values={};for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type'])values[name]=field(name).value.trim();
  for(const name of ['pinterest_board_id','pin_image_url','video_path'])values[name]=field(name).value.trim() || null;
  values.poster_alt=values.poster_alt || values.title;
  values.images=mediaItems.filter(item=>item.kind==='image' && item.url).map(item=>({url:item.url,pin_url:item.pinUrl || item.url,alt:item.alt || values.poster_alt}));
  values.blog_title=field('blog_title').value.trim();values.blog_content=collectBlogBlocks();
  if(field('tags').value.trim())addTag(field('tags').value);field('tags').value='';values.tags=[...tagValues];values.featured=field('featured').checked;values.publish_to_pinterest=field('publish_to_pinterest').checked;values.published=published;
  values.stores=[...$('stores').children].map(row=>Object.fromEntries([...row.querySelectorAll('[data-store]')].map(input=>[input.dataset.store,input.value.trim()]))).filter(s=>s.url || s.note);
  if(!validate)return values;
  if(!values.title)throw new Error('Give your product a title.');
  if(!values.tags.length)throw new Error('Add at least one tag. Press Enter after typing each tag.');
  if(!values.category)throw new Error('Choose a product category.');
  if(values.blog_content.length&&!values.blog_title)throw new Error('Add a title for your blog, or remove its content.');
  if(values.tags.length>12 || values.tags.some(t=>t.length>40))throw new Error('Use up to 12 tags, with at most 40 characters each.');
  if(values.pinterest_board_id && !/^\d+$/.test(values.pinterest_board_id))throw new Error('Use a numeric board ID, or leave it blank to choose automatically.');
  for(const s of values.stores){s.name=s.name || 'Other';if(!s.url)throw new Error('Add an affiliate URL for every store.');safeUrl(s.url);}
  if(values.pin_image_url)safeUrl(values.pin_image_url);
  if(published){if(!values.description || !values.stores.length)throw new Error('Add a description and at least one store link.');if(!mediaItems.some(item=>item.kind==='image'))throw new Error('Add a photo or a video that can generate a poster.');}
  return values;
}
async function save(published) {
  if(!session)await connect();
  if(draftProject && draftProject!==connection.supabaseUrl)throw new Error('This draft belongs to a different Supabase project. Sign in to that project before saving it online.');
  if(!published && selected?.published && !confirm('Unpublish this product? Its public page will be removed immediately. Existing Pins will remain.'))return;
  // Check before uploading so an older backend cannot leave orphan media uploads.
  try{await request('/rest/v1/products?select=id,images,blog_content&limit=0');}
  catch(error){if(error.code==='42703' || error.code==='PGRST204')throw new Error('Your draft is saved on this PC. This project needs its one-time product media and blog update before online publishing.');throw error;}
  payload(published);draftProject=connection.supabaseUrl;
  for(const media of mediaItems) {
    for(const [fileKey,urlKey] of media.kind==='video'?[['file','path']]:[['file','url'],['pinFile','pinUrl']]) {
      if(media[urlKey] || !media[fileKey])continue;
      const video=media.kind==='video';const file=media[fileKey];
      const bucket=video?'product-videos':'product-images';const path=`${session.user.id}/${crypto.randomUUID()}.${video?media.extension:'jpg'}`;
      tell(`Uploading ${file.name}… Your draft is saved on this PC.`);
      await request(`/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{'Content-Type':file.type,'x-upsert':'false'},body:file});
      media[urlKey]=video?path:`${connection.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
      syncMedia();renderMedia();
    }
  }
  const values=payload(published);const editing=selected;
  const route=editing?`/rest/v1/products?id=eq.${editing.id}&revision=eq.${editing.revision}`:'/rest/v1/products';
  let saved;
  try {saved=await request(route,{method:editing?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(editing?values:{...values,id:createId})});}
  catch(error) {
    if(!editing && error.code==='23505') {
      const existing=await request(`/rest/v1/products?id=eq.${createId}&select=*`);
      if(existing?.length){fill(existing[0]);await refresh();tell('Your earlier save reached Supabase. Reopened that product without creating a duplicate. Your local draft is kept in case it contains newer edits.');return;}
    }
    throw error;
  }
  if(!saved?.length)throw new Error('Another editor changed this product. Refresh and reopen it before saving. Your current edits are still in the form.');
  try{await deleteDraft(createId,localVersion);await refreshLocal();}catch{fill(saved[0]);}
  dirty=false;fill(saved[0]);
  tell(published?`Saved to Supabase. ${values.publish_to_pinterest?'Pin queued; the publisher checks the live page and posts it without a site deployment.':'The website is updated from Supabase.'}`:'Draft saved to Supabase.');
  if(published)showPublishResult(saved[0]);
  try{await refresh();}catch{tell('Product saved, but status could not refresh. Use Refresh status to check it.');}
}
form.addEventListener('submit',event=>{event.preventDefault();void locked(()=>save(true));});
field('title').addEventListener('input',scheduleAutoFill);
$('save-draft').addEventListener('click',()=>void locked(()=>save(false)));
$('copy-url').addEventListener('click',()=>void locked(async()=>{try{await navigator.clipboard.writeText($('product-url').value);tell('Product URL copied.');}catch{$('product-url').focus();$('product-url').select();tell('Select and copy the product URL above.');}}));
$('close-result').addEventListener('click',closePublishResult);$('result-done').addEventListener('click',closePublishResult);$('publish-result').addEventListener('click',event=>{if(event.target.id==='publish-result')closePublishResult();});
$('publish-result').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closePublishResult();return;}if(event.key!=='Tab')return;const items=[...$('publish-result').querySelectorAll('button:not([disabled]),a[href]:not([hidden])')];if(!items.length)return;const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
function showWorkspace() {
  $('workspace').hidden=false;$('connect-online').hidden=!!session;
  $('signed-in').textContent=session?'Connected. Ready to publish.':'Draft offline. Connect to publish.';
  $('connection-state').textContent=session?'Connected to Supabase':'Local drafts only';
  $('refresh').hidden=!session;
  if(!session){$('site-state').textContent='Connect to check';$('pin-state').textContent='Connect to check';$('load-more').hidden=true;}
}
function renderMedia() {
  previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];$('media-list').replaceChildren();
  const poster=mediaItems.find(item=>item.kind==='image');
  for(const item of mediaItems) {
    const card=document.createElement('div');card.className='media-card';card.dataset.mediaId=item.id;
    if(item.kind==='image' || item.file){
      const preview=document.createElement(item.kind==='image'?'img':'video');
      if(item.file){const url=URL.createObjectURL(item.file);previewUrls.push(url);preview.src=url;}else preview.src=item.url;
      if(item.kind==='image')preview.alt=item===poster?'Product poster':'Product photo';else{preview.controls=true;preview.preload='metadata';}
      card.append(preview);
    }
    const label=document.createElement('small');label.textContent=item.kind==='video'?'Video Pin':item===poster?'Poster': 'Photo';card.append(label);
    if(item.kind==='image' && item!==poster){const choose=document.createElement('button');choose.type='button';choose.textContent='Use as poster';choose.addEventListener('click',()=>{if(busy)return;mediaItems=[item,...mediaItems.filter(m=>m!==item)];dirty=true;syncMedia();renderMedia();});card.append(choose);}
    const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${item.file?.name || label.textContent}`);
    remove.addEventListener('click',()=>void locked(async()=>{const next=mediaItems.filter(m=>m!==item);if(!next.some(m=>m.kind==='image') && next.some(m=>m.kind==='video')){const video=next.find(m=>m.kind==='video');if(!video.file)throw new Error('Add another photo before removing this poster.');next.unshift(await posterFromVideo(video.file));}mediaItems=next;dirty=true;syncMedia();renderMedia();}));card.append(remove);
    $('media-list').append(card);
  }
  const imageCount=mediaItems.filter(i=>i.kind==='image').length;
  $('media-summary').textContent=mediaItems.length?`${imageCount} photos${mediaItems.some(i=>i.kind==='video')?' + video. Pinterest uses the video; photos appear on your website.':imageCount>5?'. All photos appear on your website; Pinterest uses the first 5.':'. Photos appear on your website and Pinterest.'}`:'';
}
function renderLocalList() {
  $('local-list').replaceChildren();$('local-count').textContent=String(localDrafts.length);$('delete-local').hidden=!localVersion;
  if(!localDrafts.length){const p=document.createElement('p');p.className='note';p.textContent='Your saved local drafts will appear here.';$('local-list').append(p);}
  for(const draft of localDrafts){const b=document.createElement('button');b.type='button';b.className=`product-item${draft.id===createId?' active':''}`;const title=document.createElement('strong');title.textContent=draft.values.title || 'Untitled draft';const info=document.createElement('span');info.textContent=`${new Date(draft.updatedAt).toLocaleString()} · ${Object.keys(draft.media).length} local files`;b.append(title,info);b.addEventListener('click',()=>{if(allowDiscard()){fill(draft.product,draft);tell('Local draft opened. Nothing has been sent.');}});$('local-list').append(b);}
}
async function refreshLocal(){localDrafts=await listDrafts();renderLocalList();}
async function saveLocal(announce=true) {
  const draft={id:createId,project:draftProject,siteUrl:connection?.siteUrl || '',product:selected || null,values:payload(!!selected?.published,false),media:mediaItems,blogEditor:{title:field('blog_title').value,blocks:collectBlogBlocks(true)}};
  let saved;
  try{saved=await putDraft(draft,localVersion);}catch(error){throw new Error(`Could not save on this PC. ${error.name==='QuotaExceededError'?'Browser storage is full. Free space or remove old drafts.':error.message} Your current form is still open.`);}
  localVersion=saved.version;dirty=false;await refreshLocal();
  if(announce)tell('Saved on this PC, including selected files. Nothing was sent to Supabase or Pinterest.');
}
$('connect-online').addEventListener('click',()=>void locked(async()=>{await connect();tell('Connected. Your current draft is ready.');}));
$('save-local').addEventListener('click',()=>void locked(()=>saveLocal()));
$('delete-local').addEventListener('click',()=>{if(!confirm('Delete this local draft and its saved files? Any product already in Supabase will remain.'))return;void locked(async()=>{await deleteDraft(createId,localVersion);await refreshLocal();fill();tell('Local draft deleted.');});});
window.addEventListener('focus',()=>{if(!busy)void refreshLocal().catch(()=>{});});
try {
  const defaults=await (await fetch('/config.json')).json();
  if(defaults.suggestionMode==='direct'){try{defaults.geminiApiKey=(await (await fetch('/gemini-config.json')).json()).apiKey||'';}catch{defaults.geminiApiKey='';}}
  connection=readConnection(defaults);
  lastBoard=localStorage.getItem('curated-studio-board') || '';
}catch(error){connection=null;tell(error.message,true);}
showWorkspace();fill();try{await refreshLocal();}catch(error){tell(`Local storage is unavailable: ${error.message}`,true);}
if(connection)void connect().catch(error=>tell(`Working offline. ${error.message}`,true));
