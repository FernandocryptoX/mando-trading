/* Imágenes del diario: subir o pegar una captura, reducirla y guardarla en tu base de datos privada.
   - Se reduce (≈1.100 px de ancho, JPEG) para que pese ~100 KB.
   - Se guarda en este dispositivo (IndexedDB) y, con sesión iniciada, en users/<id>/mando_img/<id de imagen>.
   - En la operación solo se guarda la referencia «img:<id>». Las imágenes se piden a la nube cuando hacen falta. */

const IMG_DB='mando-img';
function imgIdb(){
  return new Promise((res,rej)=>{
    if(!window.indexedDB){rej(new Error('sin IndexedDB'));return;}
    const r=indexedDB.open(IMG_DB,1);
    r.onupgradeneeded=()=>r.result.createObjectStore('img',{keyPath:'id'});
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}
async function imgIdbGet(id){try{const db=await imgIdb();return await new Promise((res,rej)=>{const q=db.transaction('img').objectStore('img').get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error);});}catch(e){return null;}}
async function imgIdbPut(rec){try{const db=await imgIdb();return await new Promise((res,rej)=>{const q=db.transaction('img','readwrite').objectStore('img').put(rec);q.onsuccess=()=>res(true);q.onerror=()=>rej(q.error);});}catch(e){return false;}}
async function imgIdbDel(id){try{const db=await imgIdb();return await new Promise(res=>{const q=db.transaction('img','readwrite').objectStore('img').delete(id);q.onsuccess=()=>res(true);q.onerror=()=>res(false);});}catch(e){return false;}}
async function imgIdbAll(){try{const db=await imgIdb();return await new Promise(res=>{const q=db.transaction('img').objectStore('img').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([]);});}catch(e){return [];}}

const imgCloudRef=id=>(typeof CLOUD!=='undefined'&&CLOUD.ready&&CLOUD.fs)?CLOUD.fs.doc(CLOUD.base+'/mando_img/'+id):null;

function imgCompress(file){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file),im=new Image();
    im.onload=()=>{
      URL.revokeObjectURL(url);
      let w=im.naturalWidth,h=im.naturalHeight;const mx=1100;
      if(w>mx){h=Math.round(h*mx/w);w=mx;}
      const c=document.createElement('canvas');c.width=w;c.height=h;
      const cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,w,h);cx.drawImage(im,0,0,w,h);
      let q=0.72,d=c.toDataURL('image/jpeg',q);
      while(d.length>700000&&q>0.4){q-=0.1;d=c.toDataURL('image/jpeg',q);}      // un documento de la nube admite 1 MB
      res(d);
    };
    im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('imagen ilegible'));};
    im.src=url;
  });
}

async function imgAddFile(file){
  const d=await imgCompress(file),id='i'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  await imgIdbPut({id,d,u:Date.now(),sent:false});
  imgFlush();
  return id;
}
async function imgGetUrl(id){
  const l=await imgIdbGet(id);if(l&&l.d)return l.d;
  const ref=imgCloudRef(id);
  if(ref){try{const s=await ref.get();if(s.exists){const d=(s.data()||{}).d;if(d){await imgIdbPut({id,d,u:Date.now(),sent:true});return d;}}}catch(e){}}
  return null;
}
let imgFlushing=false;
async function imgFlush(){
  if(imgFlushing)return;
  const first=imgCloudRef('x');if(!first)return;
  imgFlushing=true;
  try{
    for(const r of await imgIdbAll()){
      if(r.sent||!r.d)continue;
      const ref=imgCloudRef(r.id);if(!ref)break;
      try{await ref.set({d:r.d,u:r.u});r.sent=true;await imgIdbPut(r);}catch(e){break;}
    }
  }finally{imgFlushing=false;}
}
async function imgDelete(id){
  await imgIdbDel(id);
  const ref=imgCloudRef(id);if(ref){try{await ref.delete();}catch(e){}}
}
const imgRefs=a=>Object.values(a||{}).filter(v=>/^img:/.test(String(v))).map(v=>String(v).slice(4));
/* al guardar: borra las imágenes que ya no cuelgan de la operación */
function imgCleanup(old,t){
  const keep=new Set(imgRefs(t.img));
  imgRefs((old||{}).img).forEach(id=>{if(!keep.has(id))imgDelete(id);});
  ((typeof F!=='undefined'&&F&&F.newImgs)||[]).forEach(id=>{if(!keep.has(id))imgDelete(id);});
}
/* al cerrar sin guardar: borra lo que se subió en esta sesión */
function imgDiscard(){((typeof F!=='undefined'&&F&&F.newImgs)||[]).forEach(id=>imgDelete(id));if(typeof F!=='undefined'&&F)F.newImgs=[];}
function imgDropTrade(t){if(t)imgRefs(t.img).forEach(id=>imgDelete(id));}

/* subir o pegar una imagen en un hueco del formulario */
async function imgUploadToSlot(file,slot){
  if(!file||!/^image\//.test(file.type||'')){toast('Eso no parece una imagen');return;}
  try{
    toast('Preparando la imagen…');
    const id=await imgAddFile(file);
    if(typeof F!=='undefined'&&F){(F.newImgs=F.newImgs||[]).push(id);F.img[slot]='img:'+id;renderSheet();const lab=((IMG_SLOTS.find(s=>s[0]===slot))||[])[1]||'';toast('Imagen añadida'+(lab?' a «'+lab.split(' · ')[0]+'»':''));setTimeout(()=>{const sl=document.querySelector('.imgslot[data-slot="'+slot+'"]');if(sl)sl.scrollIntoView({block:'center'});},120);}
  }catch(e){toast('No se pudo leer esa imagen');}
}
async function imgPasteSlot(slot){
  try{
    if(navigator.clipboard&&navigator.clipboard.read){
      const items=await navigator.clipboard.read();
      for(const it of items){const ty=it.types.find(x=>/^image\//.test(x));if(ty){const b=await it.getType(ty);await imgUploadToSlot(new File([b],'captura',{type:ty}),slot);return;}}
    }
  }catch(e){}
  try{const x=await navigator.clipboard.readText();if(typeof F!=='undefined'&&F){F.img[slot]=String(x||'').trim();renderSheet();}}
  catch(e){toast('Pega con Ctrl+V sobre el campo');}
}
function imgPickFile(slot){window.IMG_TARGET=slot;let i=document.getElementById('fImgFile');if(!i){i=document.createElement('input');i.type='file';i.accept='image/*';i.id='fImgFile';i.hidden=true;i.addEventListener('change',()=>{const f=i.files&&i.files[0];i.value='';if(f)imgUploadToSlot(f,window.IMG_TARGET);});document.body.appendChild(i);}i.click();}

/* pone la imagen guardada en cada <img data-imgid> que aparezca en pantalla */
function imgHydrate(){
  document.querySelectorAll('img[data-imgid]:not([data-h])').forEach(i=>{
    i.dataset.h='1';
    imgGetUrl(i.dataset.imgid).then(d=>{
      if(d){i.src=d;return;}
      const s=document.createElement('span');s.className='small muted';s.textContent='Imagen no disponible en este dispositivo todavía.';i.replaceWith(s);
    });
  });
}
new MutationObserver(imgHydrate).observe(document.documentElement,{childList:true,subtree:true});
setInterval(imgFlush,15000);
window.addEventListener('online',imgFlush);
