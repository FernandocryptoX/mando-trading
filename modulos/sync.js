/* Sincronización en la nube: inicio de sesión (Firebase Auth) + base de datos (Firestore).
   Cada usuario solo puede leer y escribir su carpeta users/<su id>/ (lo garantizan las reglas de Firestore).
   Carpetas que usa esta app (distintas de las de la libreta antigua, que usa users/<id>/libreta):
     users/<id>/mando_trades/<id de operación>   una operación por documento
     users/<id>/mando_cfg/<clave>                una clave de los ajustes por documento (notas, cuentas, noticias…)
   Reglas de convivencia entre dispositivos: gana siempre lo editado más tarde (por operación y por clave).
   Las operaciones borradas dejan una marca ("lápida") para que no reaparezcan desde otro dispositivo. */

const CLOUD_SKIP=['newsAuto','lastBackup'];      // se calculan en cada dispositivo
var CLOUD={fs:null,au:null,uid:null,email:null,base:'',ready:false,unsubs:[],timers:{},first:{t:false,c:false}};

function cloudMeta(){S.sync=S.sync||{};S.sync.cu=S.sync.cu||{};S.sync.tomb=S.sync.tomb||{};return S.sync;}
const cloudEmpty=j=>j===undefined||j==='{}'||j==='[]'||j==='null'||j==='""'||j==='0'||j==='false';

/* línea base: lo que ya había al arrancar no cuenta como «editado» */
function cloudBaseline(){
  const m=cloudMeta();if(m.lastj)return;
  m.lastj={};Object.keys(S.cfg).forEach(k=>{if(!CLOUD_SKIP.includes(k))m.lastj[k]=JSON.stringify(S.cfg[k]);});
  saveLocal();
}
/* se llama desde saveCfg(): detecta qué claves cambiaron y las marca como editadas ahora */
function cloudCfg(){
  const m=cloudMeta();if(!m.lastj)return;
  let changed=false;
  Object.keys(S.cfg).forEach(k=>{
    if(CLOUD_SKIP.includes(k))return;
    const j=JSON.stringify(S.cfg[k]);
    if(m.lastj[k]===undefined&&cloudEmpty(j)){m.lastj[k]=j;return;}      // clave nueva y vacía: no es una edición
    if(j!==m.lastj[k]){m.cu[k]=Date.now();changed=true;}
  });
  if(changed){saveLocal();cloudFlushCfg();}
}
function cloudPushKey(k){
  const m=cloudMeta(),j=JSON.stringify(S.cfg[k]),u=m.cu[k]||1;
  CLOUD.fs.collection(CLOUD.base+'/mando_cfg').doc(k).set({j,u}).then(()=>{m.lastj[k]=j;saveLocal();}).catch(()=>setSync('err'));
}
function cloudFlushCfg(){
  if(!CLOUD.ready)return;
  clearTimeout(CLOUD.timers.cfg);
  CLOUD.timers.cfg=setTimeout(()=>{
    const m=cloudMeta();
    Object.keys(S.cfg).forEach(k=>{if(CLOUD_SKIP.includes(k))return;if(m.cu[k]&&JSON.stringify(S.cfg[k])!==m.lastj[k])cloudPushKey(k);});
  },600);
}

/* operaciones */
function cloudPushTrade(t){if(!CLOUD.ready)return;CLOUD.fs.collection(CLOUD.base+'/mando_trades').doc(t.id).set(JSON.parse(JSON.stringify(Object.assign({},t,{u:t.u||1})))).catch(()=>setSync('err'));}
function cloudPushDel(id,u){if(!CLOUD.ready)return;CLOUD.fs.collection(CLOUD.base+'/mando_trades').doc(id).set({id,del:true,u}).catch(()=>setSync('err'));}
function cloudTrade(t){const m=cloudMeta();t.u=Date.now();delete m.tomb[t.id];cloudPushTrade(t);}      // desde putTrade()
function cloudDelete(id){const m=cloudMeta(),u=Date.now();m.tomb[id]=u;cloudPushDel(id,u);}               // desde delTrade()
/* tras restaurar una copia o cargar los datos iniciales: lo nuevo gana a lo que hubiera en la nube */
function cloudReplaceAll(prevIds){
  const m=cloudMeta(),now=Date.now();
  (prevIds||[]).forEach(id=>{if(!S.trades[id])cloudDelete(id);});
  Object.values(S.trades).forEach(t=>{t.u=now;delete m.tomb[t.id];cloudPushTrade(t);});
  Object.keys(S.cfg).forEach(k=>{if(!CLOUD_SKIP.includes(k))m.cu[k]=now;});
  saveLocal();cloudFlushCfg();
}

/* copia de seguridad automática, una sola vez, antes de que la nube cambie algo local */
function cloudBackupOnce(){
  const m=cloudMeta();if(m.bk)return;m.bk=1;
  try{localStorage.setItem('centro-de-mando-antes-de-sincronizar',JSON.stringify({exportedAt:new Date().toISOString(),trades:S.trades,cfg:S.cfg}));}catch(e){}
}

function cloudApplyTrades(snap){
  const m=cloudMeta();let changed=false;const seen={};
  snap.forEach(doc=>{
    const id=doc.id,d=doc.data()||{},loc=S.trades[id],lu=loc?(loc.u||0):0,ru=d.u||0;seen[id]=1;
    if(d.del){
      if(loc&&lu>ru)cloudPushTrade(loc);                       // la editaste después de que se borrara en otro sitio
      else{if(loc){cloudBackupOnce();delete S.trades[id];changed=true;}m.tomb[id]=ru;}
    }else if(m.tomb[id]&&m.tomb[id]>ru){cloudPushDel(id,m.tomb[id]);}   // la borraste aquí después
    else if(!loc||ru>lu){if(loc)cloudBackupOnce();S.trades[id]=Object.assign({},d);delete m.tomb[id];changed=true;}
    else if(lu>ru){cloudPushTrade(loc);}
  });
  if(!snap.metadata.fromCache&&!CLOUD.first.t){
    CLOUD.first.t=true;
    Object.keys(S.trades).forEach(id=>{if(!seen[id])cloudPushTrade(S.trades[id]);});   // creadas sin conexión o antes de iniciar sesión
  }
  if(changed){saveLocal();softRender();}
}
function cloudApplyCfg(snap){
  const m=cloudMeta();let changed=false;const seen={};
  if(!m.lastj)cloudBaseline();
  snap.forEach(doc=>{
    const k=doc.id,d=doc.data()||{};
    if(CLOUD_SKIP.includes(k)||typeof d.j!=='string')return;
    seen[k]=1;
    const lu=m.cu[k]||0,ru=d.u||0,lj=JSON.stringify(S.cfg[k]);
    if(ru>lu){
      if(lj!==d.j){cloudBackupOnce();S.cfg[k]=JSON.parse(d.j);changed=true;}
      m.cu[k]=ru;m.lastj[k]=d.j;
    }else if(lu>ru){cloudFlushCfg();}
    else if(m.lastj[k]===undefined)m.lastj[k]=d.j;
  });
  if(!snap.metadata.fromCache&&!CLOUD.first.c){
    CLOUD.first.c=true;
    Object.keys(S.cfg).forEach(k=>{if(CLOUD_SKIP.includes(k)||seen[k])return;if(cloudEmpty(JSON.stringify(S.cfg[k])))return;if(!m.cu[k])m.cu[k]=1;cloudPushKey(k);});
  }
  if(changed){saveLocal();softRender();}
}
function cloudDone(){if(CLOUD.first.t&&CLOUD.first.c)setSync('ok');}

function cloudStop(){CLOUD.unsubs.forEach(u=>{try{u();}catch(e){}});CLOUD.unsubs=[];clearTimeout(CLOUD.timers.cfg);CLOUD.ready=false;CLOUD.uid=null;CLOUD.email=null;}
function cloudAttach(fs,uid,email){
  cloudStop();
  CLOUD.fs=fs;CLOUD.uid=uid;CLOUD.email=email;CLOUD.base='users/'+uid;CLOUD.ready=true;CLOUD.first={t:false,c:false};
  cloudBaseline();setSync('wait');
  CLOUD.unsubs.push(fs.collection(CLOUD.base+'/mando_trades').onSnapshot({includeMetadataChanges:true},snap=>{cloudApplyTrades(snap);cloudDone();},()=>setSync('err')));
  CLOUD.unsubs.push(fs.collection(CLOUD.base+'/mando_cfg').onSnapshot({includeMetadataChanges:true},snap=>{cloudApplyCfg(snap);cloudDone();},()=>setSync('err')));
}
function cloudInit(){
  const cfg=window.LIBRETA_FIREBASE;
  if(!window.firebase||!cfg||!cfg.apiKey){return;}      // sin conexión al cargar o sin configurar: la app sigue funcionando en este dispositivo
  try{
    if(!firebase.apps.length)firebase.initializeApp(cfg);
    CLOUD.au=firebase.auth();const fs=firebase.firestore();
    try{fs.enablePersistence({synchronizeTabs:true}).catch(()=>{});}catch(e){}
    CLOUD.fs=fs;
    CLOUD.au.onAuthStateChanged(u=>{if(!u){cloudStop();setSync('local');return;}cloudAttach(fs,u.uid,u.email);});
  }catch(e){setSync('err');}
}

/* ---------- pantalla de cuenta ---------- */
const FB_ERR={'auth/invalid-credential':'Correo o contraseña incorrectos.','auth/wrong-password':'Contraseña incorrecta.','auth/user-not-found':'No hay cuenta con ese correo.','auth/invalid-email':'Ese correo no es válido.','auth/weak-password':'La contraseña es muy corta (mínimo 6).','auth/email-already-in-use':'Ese correo ya tiene cuenta: pulsa Entrar.','auth/too-many-requests':'Demasiados intentos. Espera un momento.','auth/network-request-failed':'Sin conexión.','auth/operation-not-allowed':'Crear cuentas está desactivado.','auth/unauthorized-domain':'Esta dirección no está autorizada en Firebase (añádela en Authentication → Configuración → Dominios autorizados).'};
function cloudMsg(t){const e=document.getElementById('cmsg');if(e)e.textContent=t||'';}
function cloudAuth(mode){
  const m=document.getElementById('cmail').value.trim(),p=document.getElementById('cpass').value;
  if(!m||!p){cloudMsg('Escribe correo y contraseña.');return;}
  cloudMsg('…');
  (mode==='new'?CLOUD.au.createUserWithEmailAndPassword(m,p):CLOUD.au.signInWithEmailAndPassword(m,p))
    .then(()=>{const w=document.getElementById('dlgWrap');if(w)w.remove();toast('Sesión iniciada: sincronizando');})
    .catch(e=>cloudMsg(FB_ERR[e.code]||('No se pudo entrar ('+(e.code||'error')+')')));
}
function cloudDialog(){
  if(!CLOUD.au){dialog('<h2 style="font-size:28px">Sincronización</h2><p class="small muted">No se pudo cargar (¿sin conexión?). La app sigue funcionando y guardando en este dispositivo. Cuando haya conexión, recarga la página.</p>',[{label:'Cerrar'}]);return;}
  if(CLOUD.uid){
    dialog('<h2 style="font-size:28px">Sincronización activa</h2><p class="small">Sesión iniciada como <b>'+esc(CLOUD.email||'')+'</b>. Tus operaciones, cuentas, notas y repaso se igualan solos en todos tus dispositivos.</p>',
      [{label:'Cerrar'},{label:'Cerrar sesión',run:()=>{CLOUD.au.signOut();toast('Sesión cerrada en este dispositivo');}}]);
    return;
  }
  dialog('<h2 style="font-size:28px">Iniciar sesión</h2><p class="small muted">Usa el mismo correo y contraseña en todos tus dispositivos. Tus datos se guardan en tu carpeta privada.</p>'+
    '<div class="fgrid" style="grid-template-columns:1fr"><label class="field">Correo<input id="cmail" type="email" autocomplete="username" inputmode="email"></label><label class="field">Contraseña<input id="cpass" type="password" autocomplete="current-password"></label></div>'+
    '<p id="cmsg" class="small" style="color:var(--coral);min-height:1.3em;margin:8px 0 0"></p><button class="btn sm" id="creset" type="button">Olvidé mi contraseña</button>',
    [{label:'Cancelar'},{label:'Crear cuenta',run:()=>{cloudAuth('new');return false;}},{label:'Entrar',primary:true,run:()=>{cloudAuth('in');return false;}}]);
  const r=document.getElementById('creset');
  if(r)r.onclick=()=>{const m=document.getElementById('cmail').value.trim();if(!m){cloudMsg('Escribe tu correo arriba y pulsa de nuevo.');return;}CLOUD.au.sendPasswordResetEmail(m).then(()=>cloudMsg('Te he enviado un correo para cambiar la contraseña.')).catch(e=>cloudMsg(FB_ERR[e.code]||'No se pudo enviar el correo.'));};
}
document.addEventListener('click',e=>{if(e.target.closest('#syncChip')||e.target.closest('[data-cloud]'))cloudDialog();});
