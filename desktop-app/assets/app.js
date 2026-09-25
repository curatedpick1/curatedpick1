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
function showPublishResult(product){if(!product)return;const url=`${connection.siteUrl}/products/${product.slug}/`;const project=new URL(connection.supabaseUrl).hostname.split('.')[0];$('result-product-link').href=url;$('result-supabase-link').href=`https://supabase.com/dashboard/project/${project}/editor?schema=public&table=products&row=${encodeURIComponent(product.id)}`;$('publish-result').hidden=false;$('result-done').focus();}
function closePublishResult(){$('publish-result').hidden=true;}
function safeUrl(value) {const url=new URL(value);if(url.protocol!=='https:' || url.username || url.password || /\s/.test(value))throw new Error('Use a full HTTPS URL.');return url;}
function readConnection(settings) {
  const url=safeUrl(settings.supabaseUrl || '');
  if(!/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.port || url.pathname !== '/')throw new Error('Enter your Supabase project URL: https://your-project.supabase.co');
  const key=settings.publishableKey || '';if(!key.startsWith('sb_publishable_'))throw new Error('The local Studio is missing its public Supabase configuration.');
  const site=safeUrl(settings.siteUrl || '');
  if(site.pathname!=='/' || site.search || site.hash)throw new Error('Website URL should be only the origin, for example https://your-worker.workers.dev');
  return {supabaseUrl:url.origin,publishableKey:key,siteUrl:site.origin};
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
  const nameWrap=document.createElement('label');nameWrap.textContent='Store';const name=document.createElement('select');name.dataset.store='name';for(const value of ['Amazon','Walmart','AliExpress','Alibaba','Temu','eBay','Etsy','Target','Best Buy','Shein','Other']){const option=document.createElement('option');option.value=value;option.textContent=value;name.append(option);}name.value=store.name||'Amazon';nameWrap.append(name);row.append(nameWrap);
  const urlWrap=document.createElement('label');urlWrap.textContent='Affiliate URL';const url=document.createElement('input');url.type='url';url.dataset.store='url';url.maxLength=2048;url.value=store.url||'';url.placeholder='https://...';urlWrap.append(url);row.append(urlWrap);
  const noteWrap=document.createElement('label');noteWrap.textContent='Optional note';noteWrap.className='store-note';const note=document.createElement('input');note.dataset.store='note';note.maxLength=120;note.value=store.note||'';note.placeholder='Variant, shipping, or a useful detail';noteWrap.append(note);noteWrap.hidden=true;row.append(noteWrap);
  const actions=document.createElement('div');actions.className='store-actions';if(!$('stores').children.length){const add=document.createElement('button');add.type='button';add.className='store-add';add.textContent='+ Add store';add.addEventListener('click',addStore);actions.append(add);}const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove store');remove.addEventListener('click',()=>{row.remove();dirty=true;});actions.append(remove);row.append(actions);$('stores').append(row);
}
function addStore(){if($('stores').children.length>=8){tell('You can add up to eight stores.',true);return;}storeRow();dirty=true;$('stores').lastElementChild?.querySelector('[data-store="name"]')?.focus();}
function fill(product, draft) {
  hasForm=true;selected=product;createId=draft?.id || crypto.randomUUID();localVersion=draft?.version || 0;draftProject=draft?.project || (product?connection.supabaseUrl:null);form.reset();$('stores').replaceChildren();
  const source=draft?.values || product || {title:'',description:'',category:'Home & living',tags:[],stores:[],pin_media_type:'image',publish_to_pinterest:true,pinterest_board_id:lastBoard};
  mediaItems=restoreMedia(source,draft?.media);
  for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type','pinterest_board_id','pin_image_url','video_path'])field(name).value=source[name] || '';
  tagValues=[...(source.tags || [])];field('tags').value='';renderTags();
  for(const name of ['featured','publish_to_pinterest'])field(name).checked=!!source[name];
  (source.stores.length?source.stores:[{}]).forEach(storeRow);
  $('editor-label').textContent=draft?'LOCAL DRAFT':product?'EDIT PRODUCT':'NEW PRODUCT';$('editor-title').textContent=source.title || 'New product';
  $('save-draft').textContent=product?.published?'Unpublish to Supabase draft':'Save to Supabase draft';$('publish').textContent=product?.published?'Save published changes ↗':'Publish product ↗';
  $('save-hint').textContent=product?.published?'Existing Pins are not reposted.':'Drafts stay on this PC. Publishing needs internet.';
  $('saved-links').hidden=!product;
  if(product){const url=`${draft?.siteUrl || connection.siteUrl}/products/${product.slug}/`;$('product-url').value=url;$('view-product').href=url;}
  syncMedia();dirty=false;renderList();renderJob();renderMedia();renderLocalList();
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
  mediaItems=next;dirty=true;syncMedia();renderMedia();tell('Media ready. The first photo is used as the poster for your website and Pinterest.');
}
$('media-files').addEventListener('change',()=>{const files=[...$('media-files').files];$('media-files').value='';void locked(async()=>{await stageMedia(files);$('add-media-more').focus();});});
$('add-media-more').addEventListener('click',()=>$('media-files').click());
function payload(published,validate=true) {
  syncMedia();
  const values={};for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type'])values[name]=field(name).value.trim();
  for(const name of ['pinterest_board_id','pin_image_url','video_path'])values[name]=field(name).value.trim() || null;
  values.poster_alt=values.poster_alt || values.title;
  values.images=mediaItems.filter(item=>item.kind==='image' && item.url).map(item=>({url:item.url,pin_url:item.pinUrl || item.url,alt:item.alt || values.poster_alt}));
  if(field('tags').value.trim())addTag(field('tags').value);field('tags').value='';values.tags=[...tagValues];values.featured=field('featured').checked;values.publish_to_pinterest=field('publish_to_pinterest').checked;values.published=published;
  values.stores=[...$('stores').children].map(row=>Object.fromEntries([...row.querySelectorAll('[data-store]')].map(input=>[input.dataset.store,input.value.trim()]))).filter(s=>s.url || s.note);
  if(!validate)return values;
  if(!values.title)throw new Error('Give your product a title.');
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
  try{await request('/rest/v1/products?select=id,images&limit=0');}
  catch(error){if(error.code==='42703' || error.code==='PGRST204')throw new Error('Your draft is saved on this PC. This project needs its one-time gallery update before online publishing.');throw error;}
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
$('save-draft').addEventListener('click',()=>void locked(()=>save(false)));
$('copy-url').addEventListener('click',()=>void locked(async()=>{try{await navigator.clipboard.writeText($('product-url').value);tell('Product URL copied.');}catch{$('product-url').focus();$('product-url').select();tell('Select and copy the product URL above.');}}));
$('close-result').addEventListener('click',closePublishResult);$('result-done').addEventListener('click',closePublishResult);$('publish-result').addEventListener('click',event=>{if(event.target.id==='publish-result')closePublishResult();});
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
  const draft={id:createId,project:draftProject,siteUrl:connection?.siteUrl || '',product:selected || null,values:payload(!!selected?.published,false),media:mediaItems};
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
  const defaults=await (await fetch('/config.json')).json();connection=readConnection(defaults);
  lastBoard=localStorage.getItem('curated-studio-board') || '';
}catch(error){connection=null;tell(error.message,true);}
showWorkspace();fill();try{await refreshLocal();}catch(error){tell(`Local storage is unavailable: ${error.message}`,true);}
if(connection)void connect().catch(error=>tell(`Working offline. ${error.message}`,true));
