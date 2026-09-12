const $ = id => document.getElementById(id);
const form = $('product-form');
const field = name => form.elements.namedItem(name);
let connection, session, products = [], status, selected, createId, dirty = false, busy = false, offset = 0;
const pageSize = 100;
function tell(text, error = false, login = false) {const node = $(login ? 'login-status' : 'notice');node.textContent=text;node.classList.toggle('error',error);}
function safeUrl(value) {const url=new URL(value);if(url.protocol!=='https:' || url.username || url.password || /\s/.test(value))throw new Error('Use a full HTTPS URL.');return url;}
function readConnection() {
  const url=safeUrl($('supabase-url').value.trim());
  if(!/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.port || url.pathname !== '/')throw new Error('Enter your Supabase project URL: https://your-project.supabase.co');
  const key=$('public-key').value.trim();if(!key.startsWith('sb_publishable_'))throw new Error('Use the sb_publishable_ key. Secret/service-role keys do not belong in this app.');
  const site=safeUrl($('site-url').value.trim());
  if(site.pathname!=='/' || site.search || site.hash)throw new Error('Website URL should be only the origin, for example https://curatedpick1.pages.dev');
  return {supabaseUrl:url.origin,publishableKey:key,siteUrl:site.origin};
}
async function request(path, options={}, auth=true) {
  if(auth) {
    if(!session)throw new Error('Sign in again to continue.');
    if(Date.now()>session.deadline-60000) {
      const refreshed=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})},false);
      session={...refreshed,deadline:Date.now()+refreshed.expires_in*1000};
    }
  }
  const response=await fetch(connection.supabaseUrl+path,{...options,signal:AbortSignal.timeout(90000),headers:{apikey:connection.publishableKey,...(auth?{Authorization:`Bearer ${session.access_token}`} : {}),'Content-Type':'application/json',...options.headers}});
  const data=response.status===204 ? null : await response.json().catch(()=>null);
  if(!response.ok) {const error=new Error(data?.msg || data?.message || data?.error_description || data?.error || `Supabase request failed (${response.status}).`);error.code=data?.code;throw error;}
  return data;
}
async function locked(action, login=false) {
  if(busy)return;busy=true;
  const buttons=[...document.querySelectorAll('button,input,textarea,select')];buttons.forEach(b=>b.disabled=true);
  try {await action();} catch(error) {tell(error.message || 'Something went wrong. Try again.',true,login);}
  finally {busy=false;buttons.forEach(b=>b.disabled=false);}
}
function allowDiscard() {return !dirty || confirm('Discard your unsaved edits? Uploaded files remain in Storage.');}
function updatePreview() {
  const img=$('poster-preview');const value=field('poster_url').value.trim();
  try {img.src=safeUrl(value).href;img.hidden=false;$('poster-placeholder').hidden=true;} catch {img.removeAttribute('src');img.hidden=true;$('poster-placeholder').hidden=false;}
}
$('poster-preview').addEventListener('error',()=>{$('poster-preview').hidden=true;$('poster-placeholder').hidden=false;$('poster-placeholder').textContent='Image could not load. Check its public URL.';});
function storeRow(store={}) {
  const row=document.createElement('div');row.className='store-row';
  for(const [key,label,type,max] of [['name','Store name','text',40],['url','Affiliate URL','url',2048],['note','Optional note','text',120]]) {
    const wrap=document.createElement('label');wrap.textContent=label;if(key==='note')wrap.className='store-note';
    const input=document.createElement('input');input.type=type;input.maxLength=max;input.dataset.store=key;input.value=store[key] || '';input.placeholder=key==='name'?'Amazon':key==='url'?'https://…':'Variant, shipping, or a useful detail';wrap.append(input);row.append(wrap);
  }
  const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove store');remove.addEventListener('click',()=>{row.remove();dirty=true;});row.append(remove);$('stores').append(row);
}
function fill(product) {
  selected=product;createId=crypto.randomUUID();form.reset();$('stores').replaceChildren();
  const source=product || {title:'',description:'',category:'Home & living',tags:[],stores:[],pin_media_type:'image'};
  for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type','pinterest_board_id','pin_image_url','video_path'])field(name).value=source[name] || '';
  field('tags').value=(source.tags || []).join(', ');
  for(const name of ['featured','publish_to_pinterest'])field(name).checked=!!source[name];
  (source.stores.length?source.stores:[{}]).forEach(storeRow);
  $('editor-label').textContent=product?'EDIT PRODUCT':'NEW PRODUCT';$('editor-title').textContent=product?.title || 'What did you find?';
  $('save-draft').textContent=product?.published?'Unpublish to draft':'Save draft';$('publish').textContent=product?.published?'Save published changes ↗':'Publish product ↗';
  $('save-hint').textContent=product?.published?'Changes will queue a website update. Existing Pins are not reposted.':'Start with a draft. Publish when everything looks right.';
  $('saved-links').hidden=!product;
  if(product){const url=`${connection.siteUrl}/products/${product.slug}/`;$('product-url').value=url;$('view-product').href=url;}
  $('video-fields').hidden=source.pin_media_type!=='video';updatePreview();dirty=false;renderList();renderJob();
}
function renderJob() {
  const job=status?.jobs?.find(j=>j.product_id===selected?.id);
  $('job-state').textContent=job ? `Pin: ${job.state}${job.api_env ? ` (${job.api_env})` : ''}` : selected?.published?'Website published':'Draft';
  $('pinterest-help').textContent=job?.last_error ? `Publisher: ${job.last_error}` : !status?.pinterest_connected?'Pinterest is not connected yet. Save products now; complete publisher and Pinterest setup to send queued Pins.':'Pinterest credentials are saved. Actual posting still depends on the scheduled publisher, API access, and live website.';
}
function renderList() {
  const q=$('library-search').value.toLowerCase();$('product-list').replaceChildren();$('product-count').textContent=String(products.length);
  const shown=products.filter(p=>`${p.title} ${p.category}`.toLowerCase().includes(q));
  if(!shown.length){const p=document.createElement('p');p.className='note';p.textContent=products.length?'No matching products.':'No products yet. Start your first find.';$('product-list').append(p);}
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
$('login-form').addEventListener('submit',event=>{event.preventDefault();void locked(async()=>{
  connection=readConnection();tell('Signing in…',false,true);
  const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})},false);
  session={...data,deadline:Date.now()+data.expires_in*1000};$('password').value='';
  try {await refresh();} catch(error) {session=null;throw new Error(`Signed in, but editor access is unavailable. Run migration 003 and add this user to catalog_editors. ${error.message}`);}
  try{localStorage.setItem('curated-studio-connection',JSON.stringify(connection));}catch{}
  $('login-view').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;$('signed-in').textContent=session.user.email;fill();tell('Connected. Products and uploads will be saved to your real Supabase project.');
},true);});
$('logout').addEventListener('click',()=>{if(!allowDiscard())return;void locked(async()=>{try{await request('/auth/v1/logout',{method:'POST'});}catch{}session=null;products=[];selected=null;dirty=false;$('workspace').hidden=true;$('login-view').hidden=false;$('logout').hidden=true;tell('Signed out.',false,true);});});
$('new-product').addEventListener('click',()=>{if(allowDiscard()){fill();tell('');field('title').focus();}});
$('library-search').addEventListener('input',renderList);
$('refresh').addEventListener('click',()=>void locked(async()=>{await refresh();tell('Status refreshed. Your unsaved form edits are preserved.');}));
$('load-more').addEventListener('click',()=>void locked(()=>refresh(false)));
$('add-store').addEventListener('click',()=>{if($('stores').children.length>=8){tell('You can add up to eight stores.',true);return;}storeRow();dirty=true;});
form.addEventListener('input',()=>{dirty=true;});
field('poster_url').addEventListener('input',updatePreview);
field('pin_media_type').addEventListener('change',()=>{$('video-fields').hidden=field('pin_media_type').value!=='video';});
async function upload(input,target,video=false) {
  const file=input.files[0];if(!file)return;
  const types=video?{'video/mp4':'mp4','video/quicktime':'mov','video/x-m4v':'m4v'}:{'image/jpeg':'jpg','image/png':'png',...(target==='poster_url'?{'image/webp':'webp'}:{})};
  const extension=types[file.type];if(!extension || file.size>(video?20:5)*1024*1024)throw new Error(video?'Choose MP4/MOV/M4V under 20 MB.':'Choose an allowed image under 5 MB.');
  const bucket=video?'product-videos':'product-images';const path=`${session.user.id}/${crypto.randomUUID()}.${extension}`;
  tell(`Uploading ${video?'video':'image'}…`);
  await request(`/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{'Content-Type':file.type,'x-upsert':'false'},body:file});
  field(target).value=video?path:`${connection.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;input.value='';dirty=true;updatePreview();tell('Uploaded. Save the product to attach this media.');
}
for(const [id,target,video] of [['poster-file','poster_url',false],['cover-file','pin_image_url',false],['video-file','video_path',true]])$(id).addEventListener('change',()=>void locked(()=>upload($(id),target,video)));
function payload(published) {
  const values={};for(const name of ['title','description','category','poster_url','poster_alt','pin_media_type'])values[name]=field(name).value.trim();
  for(const name of ['pinterest_board_id','pin_image_url','video_path'])values[name]=field(name).value.trim() || null;
  values.tags=field('tags').value.split(',').map(x=>x.trim()).filter(Boolean);values.featured=field('featured').checked;values.publish_to_pinterest=field('publish_to_pinterest').checked;values.published=published;
  values.stores=[...$('stores').children].map(row=>Object.fromEntries([...row.querySelectorAll('input')].map(input=>[input.dataset.store,input.value.trim()]))).filter(s=>s.name || s.url || s.note);
  if(!values.title)throw new Error('Give your product a title.');
  if(values.tags.length>12 || values.tags.some(t=>t.length>40))throw new Error('Use up to 12 tags, with at most 40 characters each.');
  if(values.publish_to_pinterest && !/^\d+$/.test(values.pinterest_board_id || ''))throw new Error('Add a numeric Pinterest board ID, or turn off “Queue a Pin” for now.');
  for(const s of values.stores){if(!s.name)throw new Error('Add a name for every store.');safeUrl(s.url);}
  if(values.pin_image_url)safeUrl(values.pin_image_url);
  if(published){if(!values.description || !values.poster_alt || !values.stores.length)throw new Error('Publishing needs a description, image description, and at least one store link.');safeUrl(values.poster_url);if(values.publish_to_pinterest && values.pin_media_type==='video' && !values.video_path)throw new Error('Upload your video before publishing a video Pin.');}
  return values;
}
async function save(published) {
  if(!published && selected?.published && !confirm('Unpublish this product? Its public page will be removed on the next deployment. Existing Pins will remain.'))return;
  const values=payload(published);const editing=selected;
  const route=editing?`/rest/v1/products?id=eq.${editing.id}&revision=eq.${editing.revision}`:'/rest/v1/products';
  let saved;
  try {saved=await request(route,{method:editing?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(editing?values:{...values,id:createId})});}
  catch(error) {
    if(!editing && error.code==='23505') {
      const existing=await request(`/rest/v1/products?id=eq.${createId}&select=*`);
      if(existing?.length){fill(existing[0]);await refresh();tell('Your earlier save reached Supabase. Reopened that product without creating a duplicate. Review its saved details before editing.');return;}
    }
    throw error;
  }
  if(!saved?.length)throw new Error('Another editor changed this product. Refresh and reopen it before saving. Your current edits are still in the form.');
  dirty=false;fill(saved[0]);
  tell(published?`Saved to Supabase. ${values.publish_to_pinterest?'Pin queued; it will post only after the publisher verifies the live page.':'The website will update when its next deployment finishes.'}`:'Draft saved to Supabase.');
  try{await refresh();}catch{tell('Product saved, but status could not refresh. Use Refresh status to check it.');}
}
form.addEventListener('submit',event=>{event.preventDefault();void locked(()=>save(true));});
$('save-draft').addEventListener('click',()=>void locked(()=>save(false)));
$('copy-url').addEventListener('click',()=>void locked(async()=>{try{await navigator.clipboard.writeText($('product-url').value);tell('Product URL copied.');}catch{$('product-url').focus();$('product-url').select();tell('Select and copy the product URL above.');}}));
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
try {
  const defaults=await (await fetch('/config.json')).json();let cached={};try{cached=JSON.parse(localStorage.getItem('curated-studio-connection') || '{}');}catch{}
  const settings={...defaults,...cached};$('supabase-url').value=settings.supabaseUrl || '';$('public-key').value=settings.publishableKey || '';$('site-url').value=settings.siteUrl || 'https://curatedpick1.pages.dev';
  $('connection').open=!settings.publishableKey || !settings.supabaseUrl || settings.supabaseUrl.includes('YOUR-');
}catch{$('connection').open=true;tell('Fill in the public connection settings to get started.',false,true);}
