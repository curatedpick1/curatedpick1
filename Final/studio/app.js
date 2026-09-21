import {listDrafts, putDraft, deleteDraft} from './drafts.js';
const $ = id => document.getElementById(id);
const form = $('product-form');
const field = name => form.elements.namedItem(name);
let connection, session, products = [], status, selected, createId, dirty = false, busy = false, offset = 0;
const pageSize = 100;
let localDrafts=[], localVersion=0, draftProject=null, pendingMedia={}, previewUrl, hasForm=false, lastBoard='';
function tell(text, error = false) {const node = $('notice');node.textContent=text;node.classList.toggle('error',error);}
function safeUrl(value) {const url=new URL(value);if(url.protocol!=='https:' || url.username || url.password || /\s/.test(value))throw new Error('Use a full HTTPS URL.');return url;}
function readConnection(settings) {
  const url=safeUrl(settings.supabaseUrl || '');
  if(!/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.port || url.pathname !== '/')throw new Error('Enter your Supabase project URL: https://your-project.supabase.co');
  const key=settings.publishableKey || '';if(!key.startsWith('sb_publishable_'))throw new Error('The local Studio is missing its public Supabase configuration.');
  const site=safeUrl(settings.siteUrl || '');
  if(site.pathname!=='/' || site.search || site.hash)throw new Error('Website URL should be only the origin, for example https://curatedpick1.pages.dev');
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
function updatePreview() {
  const img=$('poster-preview');const value=field('poster_url').value.trim();
  if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
  if(pendingMedia.poster_url){previewUrl=URL.createObjectURL(pendingMedia.poster_url.file);img.src=previewUrl;img.hidden=false;$('poster-placeholder').hidden=true;return;}
  try {img.src=safeUrl(value).href;img.hidden=false;$('poster-placeholder').hidden=true;} catch {img.removeAttribute('src');img.hidden=true;$('poster-placeholder').hidden=false;}
}
$('poster-preview').addEventListener('error',()=>{$('poster-preview').hidden=true;$('poster-placeholder').hidden=false;$('poster-placeholder').textContent='Image could not load. Check its public URL.';});
function storeRow(store={}) {
  const row=document.createElement('div');row.className='store-row';
  for(const [key,label,type,max] of [['name','Store name','text',40],['url','Affiliate URL','url',2048],['note','Optional note','text',120]]) {
    const wrap=document.createElement('label');wrap.textContent=label;if(key==='note')wrap.className='store-note';
    const input=document.createElement('input');input.type=type;input.maxLength=max;input.dataset.store=key;input.value=store[key] || '';input.placeholder=key==='name'?'Amazon':key==='url'?'https://…':'Variant, shipping, or a useful detail';wrap.append(input);if(key==='note')wrap.hidden=true;row.append(wrap);
  }
  const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove store');remove.addEventListener('click',()=>{row.remove();dirty=true;});row.append(remove);$('stores').append(row);
}
function fill(product, draft) {
  hasForm=true;selected=product;createId=draft?.id || crypto.randomUUID();localVersion=draft?.version || 0;draftProject=draft?.project || (product?connection.supabaseUrl:null);pendingMedia=structuredClone(draft?.media || {});form.reset();$('stores').replaceChildren();
  const source=draft?.values || product || {title:'',description:'',category:'Home & living',tags:[],stores:[],pin_media_type:'image',publish_to_pinterest:true,pinterest_board_id:lastBoard};
  for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type','pinterest_board_id','pin_image_url','video_path'])field(name).value=source[name] || '';
  field('tags').value=(source.tags || []).join(', ');
  for(const name of ['featured','publish_to_pinterest'])field(name).checked=!!source[name];
  (source.stores.length?source.stores:[{}]).forEach(storeRow);
  $('editor-label').textContent=draft?'LOCAL DRAFT':product?'EDIT PRODUCT':'NEW PRODUCT';$('editor-title').textContent=source.title || 'New product';
  $('save-draft').textContent=product?.published?'Unpublish to Supabase draft':'Save to Supabase draft';$('publish').textContent=product?.published?'Save published changes ↗':'Publish product ↗';
  $('save-hint').textContent=product?.published?'Existing Pins are not reposted.':'Drafts stay on this PC. Publishing needs internet.';
  $('saved-links').hidden=!product;
  if(product){const url=`${draft?.siteUrl || connection.siteUrl}/products/${product.slug}/`;$('product-url').value=url;$('view-product').href=url;}
  $('video-fields').hidden=source.pin_media_type!=='video';updatePreview();dirty=false;renderList();renderJob();renderMedia();renderLocalList();
}
function renderJob() {
  const job=status?.jobs?.find(j=>j.product_id===selected?.id);
  $('job-state').textContent=job ? `Pin: ${job.state}${job.api_env ? ` (${job.api_env})` : ''}` : selected?.published?'Website published':'Draft';
  $('pinterest-help').textContent=job?.last_error ? `Publisher: ${job.last_error}` : !status?.pinterest_connected?'Pinterest is not connected yet. Save products now; complete publisher and Pinterest setup to send queued Pins.':'Pinterest credentials are saved. Actual posting still depends on the scheduled publisher, API access, and live website.';
}
function renderList() {
  const q=$('library-search').value.toLowerCase();$('product-list').replaceChildren();$('product-count').textContent=String(products.length);
  const shown=products.filter(p=>`${p.title} ${p.category}`.toLowerCase().includes(q));
  if(!shown.length){const p=document.createElement('p');p.className='note';p.textContent=!session?'Connect to see shared products.':products.length?'No matching products.':'No products yet. Start your first find.';$('product-list').append(p);}
  for(const p of shown){const b=document.createElement('button');b.type='button';b.className=`product-item${selected?.id===p.id?' active':''}`;const title=document.createElement('strong');title.textContent=p.title || 'Untitled draft';const info=document.createElement('span');const job=status?.jobs?.find(j=>j.product_id===p.id);info.textContent=`${p.published?'Published':'Draft'} · ${p.category}${job ? ` · Pin ${job.state}`:''}`;b.append(title,info);b.addEventListener('click',()=>{if(allowDiscard()){fill(p);tell('');}});$('product-list').append(b);}
}
async function refresh(reset=true) {
  status=await request('/rest/v1/rpc/get_editor_status',{method:'POST',body:'{}'});
  const page=await request(`/rest/v1/products?select=*&order=created_at.desc,id.desc&limit=${pageSize}&offset=${reset?0:offset}`);
  products=reset?page:[...products,...page];offset=products.length;$('load-more').hidden=page.length<pageSize;
  const c=status.catalog;$('site-state').textContent=c?.last_error?'Publisher needs attention':c?.deployed_revision>=c?.revision?'Latest revision verified':'Waiting for publisher / deploy';
  $('pin-state').textContent=status.pinterest_connected?'Credentials saved':'Not connected yet';
  renderList();renderJob();
}
$('new-product').addEventListener('click',()=>{if(allowDiscard()){fill();tell('');field('title').focus();}});
$('library-search').addEventListener('input',renderList);
$('refresh').addEventListener('click',()=>void locked(async()=>{await refresh();tell('Status refreshed. Your unsaved form edits are preserved.');}));
$('load-more').addEventListener('click',()=>void locked(()=>refresh(false)));
$('add-store').addEventListener('click',()=>{if($('stores').children.length>=8){tell('You can add up to eight stores.',true);return;}storeRow();dirty=true;});
form.addEventListener('input',()=>{dirty=true;});
for(const target of ['poster_url','pin_image_url','video_path'])field(target).addEventListener('input',()=>{delete pendingMedia[target];renderMedia();updatePreview();});
field('pin_media_type').addEventListener('change',()=>{$('video-fields').hidden=field('pin_media_type').value!=='video';});
field('pinterest_board_id').addEventListener('change',()=>{const board=field('pinterest_board_id').value.trim();if(/^\d+$/.test(board)){lastBoard=board;try{localStorage.setItem('curated-studio-board',board);}catch{}}});
function stageMedia(input,target,video=false) {
  const file=input.files[0];if(!file)return;
  const types=video?{'video/mp4':'mp4','video/quicktime':'mov','video/x-m4v':'m4v'}:{'image/jpeg':'jpg','image/png':'png',...(target==='poster_url'?{'image/webp':'webp'}:{})};
  const extension=types[file.type];if(!extension || file.size>(video?20:5)*1024*1024)throw new Error(video?'Choose MP4/MOV/M4V under 20 MB.':'Choose an allowed image under 5 MB.');
  pendingMedia[target]={file,extension,video};input.value='';dirty=true;updatePreview();renderMedia();tell('File selected. Click Save on this PC to keep a local copy, or publish to upload it.');
}
for(const [id,target,video] of [['poster-file','poster_url',false],['cover-file','pin_image_url',false],['video-file','video_path',true]])$(id).addEventListener('change',()=>void locked(()=>stageMedia($(id),target,video)));
function payload(published,validate=true) {
  const values={};for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type'])values[name]=field(name).value.trim();
  for(const name of ['pinterest_board_id','pin_image_url','video_path'])values[name]=field(name).value.trim() || null;
  values.tags=field('tags').value.split(',').map(x=>x.trim()).filter(Boolean);values.featured=field('featured').checked;values.publish_to_pinterest=field('publish_to_pinterest').checked;values.published=published;
  values.stores=[...$('stores').children].map(row=>Object.fromEntries([...row.querySelectorAll('input')].map(input=>[input.dataset.store,input.value.trim()]))).filter(s=>s.name || s.url || s.note);
  if(!validate)return values;
  if(!values.title)throw new Error('Give your product a title.');
  if(values.tags.length>12 || values.tags.some(t=>t.length>40))throw new Error('Use up to 12 tags, with at most 40 characters each.');
  if(values.publish_to_pinterest && !/^\d+$/.test(values.pinterest_board_id || ''))throw new Error('Add your Pinterest board ID, or turn off “Post to Pinterest” for now.');
  for(const s of values.stores){if(!s.name)throw new Error('Add a name for every store.');safeUrl(s.url);}
  if(values.pin_image_url && !pendingMedia.pin_image_url)safeUrl(values.pin_image_url);
  if(published){if(!values.description || !values.poster_alt || !values.stores.length)throw new Error('Publishing needs a description, image description, and at least one store link.');if(!pendingMedia.poster_url)safeUrl(values.poster_url);if(values.publish_to_pinterest && values.pin_media_type==='video' && !values.video_path && !pendingMedia.video_path)throw new Error('Select your video before publishing a video Pin.');}
  return values;
}
async function save(published) {
  await saveLocal(false);
  if(!session)await connect();
  if(draftProject && draftProject!==connection.supabaseUrl)throw new Error('This draft belongs to a different Supabase project. Sign in to that project before saving it online.');
  if(!published && selected?.published && !confirm('Unpublish this product? Its public page will be removed on the next deployment. Existing Pins will remain.'))return;
  payload(published);draftProject=connection.supabaseUrl;await saveLocal(false);
  for(const [target,media] of Object.entries(pendingMedia)) {
    if(media.uploadedUrl)continue;
    const bucket=media.video?'product-videos':'product-images';const path=`${session.user.id}/${crypto.randomUUID()}.${media.extension}`;
    tell(`Uploading ${media.file.name}… Your draft is saved on this PC.`);
    await request(`/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{'Content-Type':media.file.type,'x-upsert':'false'},body:media.file});
    field(target).value=media.video?path:`${connection.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
    media.uploadedUrl=field(target).value;await saveLocal(false);renderMedia();updatePreview();
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
  try{await deleteDraft(createId,localVersion);await refreshLocal();}catch{fill(saved[0]);tell('Saved to Supabase. A local draft also remains; review it before deleting.',true);return;}
  dirty=false;fill(saved[0]);
  tell(published?`Saved to Supabase. ${values.publish_to_pinterest?'Pin queued; it will post only after the publisher verifies the live page.':'The website will update when its next deployment finishes.'}`:'Draft saved to Supabase.');
  try{await refresh();}catch{tell('Product saved, but status could not refresh. Use Refresh status to check it.');}
}
form.addEventListener('submit',event=>{event.preventDefault();void locked(()=>save(true));});
$('save-draft').addEventListener('click',()=>void locked(()=>save(false)));
$('copy-url').addEventListener('click',()=>void locked(async()=>{try{await navigator.clipboard.writeText($('product-url').value);tell('Product URL copied.');}catch{$('product-url').focus();$('product-url').select();tell('Select and copy the product URL above.');}}));
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
function showWorkspace() {
  $('workspace').hidden=false;$('connect-online').hidden=!!session;
  $('signed-in').textContent=session?'Connected. Ready to publish.':'Draft offline. Connect to publish.';
  $('connection-state').textContent=session?'Connected to Supabase':'Local drafts only';
  $('refresh').hidden=!session;
  if(!session){$('site-state').textContent='Connect to check';$('pin-state').textContent='Connect to check';$('load-more').hidden=true;}
}
function renderMedia() {
  for(const [id,target] of [['poster-file','poster_url'],['cover-file','pin_image_url'],['video-file','video_path']]) {
    const media=pendingMedia[target];$(`${id}-state`).textContent=media?`${media.file.name} · ${(media.file.size/1024/1024).toFixed(1)} MB · ${media.uploadedUrl?'Uploaded; local copy kept':'Selected for next upload'}`:'';
    document.querySelector(`[data-clear-media="${target}"]`).hidden=!media;
  }
}
function renderLocalList() {
  $('local-list').replaceChildren();$('local-count').textContent=String(localDrafts.length);$('delete-local').hidden=!localVersion;
  if(!localDrafts.length){const p=document.createElement('p');p.className='note';p.textContent='Your saved local drafts will appear here.';$('local-list').append(p);}
  for(const draft of localDrafts){const b=document.createElement('button');b.type='button';b.className=`product-item${draft.id===createId?' active':''}`;const title=document.createElement('strong');title.textContent=draft.values.title || 'Untitled draft';const info=document.createElement('span');info.textContent=`${new Date(draft.updatedAt).toLocaleString()} · ${Object.keys(draft.media).length} local files`;b.append(title,info);b.addEventListener('click',()=>{if(allowDiscard()){fill(draft.product,draft);tell('Local draft opened. Nothing has been sent.');}});$('local-list').append(b);}
}
async function refreshLocal(){localDrafts=await listDrafts();renderLocalList();}
async function saveLocal(announce=true) {
  const draft={id:createId,project:draftProject,siteUrl:connection?.siteUrl || '',product:selected || null,values:payload(!!selected?.published,false),media:pendingMedia};
  let saved;
  try{saved=await putDraft(draft,localVersion);}catch(error){throw new Error(`Could not save on this PC. ${error.name==='QuotaExceededError'?'Browser storage is full. Free space or remove old drafts.':error.message} Your current form is still open.`);}
  localVersion=saved.version;dirty=false;await refreshLocal();
  if(announce)tell('Saved on this PC, including selected files. Nothing was sent to Supabase or Pinterest.');
}
$('connect-online').addEventListener('click',()=>void locked(async()=>{await connect();tell('Connected. Your current draft is ready.');}));
$('save-local').addEventListener('click',()=>void locked(()=>saveLocal()));
$('delete-local').addEventListener('click',()=>{if(!confirm('Delete this local draft and its saved files? Any product already in Supabase will remain.'))return;void locked(async()=>{await deleteDraft(createId,localVersion);await refreshLocal();fill();tell('Local draft deleted.');});});
for(const button of document.querySelectorAll('[data-clear-media]'))button.addEventListener('click',()=>{delete pendingMedia[button.dataset.clearMedia];dirty=true;renderMedia();updatePreview();});
window.addEventListener('focus',()=>{if(!busy)void refreshLocal().catch(()=>{});});
try {
  const defaults=await (await fetch('/config.json')).json();connection=readConnection(defaults);
  lastBoard=localStorage.getItem('curated-studio-board') || '';
}catch(error){connection=null;tell(error.message,true);}
showWorkspace();fill();try{await refreshLocal();}catch(error){tell(`Local storage is unavailable: ${error.message}`,true);}
if(connection)void connect().catch(error=>tell(`Working offline. ${error.message}`,true));
