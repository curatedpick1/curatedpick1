// One upload produces the website photo and Pinterest's portrait image.
const imageTypes = new Set(['image/jpeg','image/png','image/webp']);
const videoTypes = {'video/mp4':'mp4','video/quicktime':'mov','video/x-m4v':'m4v'};
export function mediaKind(file) {
  if(imageTypes.has(file.type) && file.size<=20*1024*1024)return 'image';
  if(videoTypes[file.type] && file.size<=20*1024*1024)return 'video';
  throw new Error('Choose JPG, PNG, WebP, MP4 or MOV files up to 20 MB each.');
}
function jpeg(source,width,height,name) {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);
  const sw=source.videoWidth || source.naturalWidth || source.width;
  const sh=source.videoHeight || source.naturalHeight || source.height;
  const scale=Math.min(width/sw,height/sh);const w=sw*scale,h=sh*scale;
  ctx.drawImage(source,(width-w)/2,(height-h)/2,w,h);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(new File([blob],name,{type:'image/jpeg'})):reject(new Error('Could not prepare this image.')),'image/jpeg',0.9));
}
async function imageVersions(source,name,generated=false) {
  const stem=name.replace(/\.[^.]+$/,'');
  return {id:crypto.randomUUID(),kind:'image',generated,
    file:await jpeg(source,1200,1500,`${stem}-web.jpg`),
    pinFile:await jpeg(source,1000,1500,`${stem}-pin.jpg`)};
}
export async function prepareMedia(file) {
  if(mediaKind(file)==='video')return {id:crypto.randomUUID(),kind:'video',file,extension:videoTypes[file.type]};
  const url=URL.createObjectURL(file);const img=new Image();
  try{img.src=url;await img.decode();return await imageVersions(img,file.name);}
  catch{throw new Error(`Could not read ${file.name}. Choose another image.`);}
  finally{URL.revokeObjectURL(url);}
}
export async function posterFromVideo(file) {
  const url=URL.createObjectURL(file);const video=document.createElement('video');
  video.muted=true;video.preload='auto';video.playsInline=true;
  try {
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>finish(new Error('Could not read this video. Add a photo or use an MP4 video.')),15000);
      function finish(error){clearTimeout(timeout);video.onloadeddata=null;video.onseeked=null;video.onerror=null;error?reject(error):resolve();}
      video.onerror=()=>finish(new Error('This video cannot be previewed. Add a photo or use an MP4 video.'));
      video.onloadeddata=()=>{video.onloadeddata=null;const time=Number.isFinite(video.duration)?Math.min(1,video.duration/2):0;if(time>0){video.onseeked=()=>finish();video.currentTime=time;}else finish();};
      video.src=url;
    });
    return await imageVersions(video,file.name,true);
  }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}
// Upgrade local drafts from older installers without dropping their files.
export function restoreMedia(source, saved) {
  if(Array.isArray(saved))return structuredClone(saved);
  const items=(source.images?.length?source.images:source.poster_url?[{url:source.poster_url,pin_url:source.pin_image_url || source.poster_url}]:[])
    .map(image=>({id:crypto.randomUUID(),kind:'image',url:image.url,pinUrl:image.pin_url || image.url,alt:image.alt}));
  if(saved?.poster_url){const old=saved.poster_url;const image={id:crypto.randomUUID(),kind:'image',file:old.file,pinFile:saved.pin_image_url?.file || old.file,url:old.uploadedUrl,pinUrl:saved.pin_image_url?.uploadedUrl || old.uploadedUrl};items.splice(0,1,image);}
  else if(saved?.pin_image_url && items[0]){items[0].pinFile=saved.pin_image_url.file;items[0].pinUrl=saved.pin_image_url.uploadedUrl;}
  if(saved?.video_path || source.video_path){const old=saved?.video_path;items.push({id:crypto.randomUUID(),kind:'video',file:old?.file,extension:old?.extension,path:old?.uploadedUrl || source.video_path});}
  return items;
}
