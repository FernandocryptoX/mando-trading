/* Sincronización en la nube: inicio de sesión (Firebase Auth) + base de datos (Firestore).
   Cada usuario solo puede leer y escribir su carpeta users/<su id>/ (lo garantizan las reglas de Firestore).
   Carpetas que usa esta app (distintas de las de la libreta antigua, que usa users/<id>/libreta):
     users/<id>/mando_trades/<id de operación>   una operación por documento
     users/<id>/mando_cfg/<clave>                una clave de los ajustes por documento (notas, cuentas, noticias…)
   Reglas de convivencia entre dispositivos: gana siempre lo editado más tarde (por operación y por clave).
   Las operaciones borradas dejan una marca ("lápida") para que no reaparezcan desde otro dispositivo. */

const CLOUD_SKIP=['newsAuto','lastBackup'];      // se calculan en cada dispositivo
var CLOUD={fs:null,au:null,uid:null,email:null,base:'',ready:false,unsubs:[],timers:{},first:{t:false,c:false}};

/* ---------- cuentas: fusión por cuenta (nunca se pierde una cuenta porque otro dispositivo tenga una lista vieja) ----------
   Cada cuenta lleva una marca u (cuándo se editó). Al recibir la lista de la nube se unen las dos: gana la cuenta editada
   más tarde, las cuentas que solo están en un lado se conservan, y solo un borrado explícito (marca en acc.del) quita una. */
var ACC_SIG=null;
function accSigAll(){const o={};((S.cfg.acc||{}).list||[]).forEach(a=>{const c=Object.assign({},a);delete c.u;o[a.id]=JSON.stringify(c);});return o;}
function accStamp(){
  const cur=accSigAll();
  if(ACC_SIG===null){ACC_SIG=cur;return;}
  ((S.cfg.acc||{}).list||[]).forEach(a=>{if(ACC_SIG[a.id]!==cur[a.id])a.u=Date.now();});
  ACC_SIG=cur;
}
function accMerge(loc,rem){
  loc=loc||{list:[]};rem=rem||{list:[]};
  const del={};[loc.del,rem.del].forEach(d=>Object.keys(d||{}).forEach(k=>{del[k]=Math.max(del[k]||0,d[k]);}));
  const L={},R={};(loc.list||[]).forEach(a=>{L[a.id]=a;});(rem.list||[]).forEach(a=>{R[a.id]=a;});
  const out=[];let toLocal=false,toRemote=false;
  Object.keys(Object.assign({},L,R)).sort().forEach(id=>{
    const l=L[id],r=R[id];let w;
    if(l&&r){const lu=l.u||0,ru=r.u||0;if(ru>lu){w=r;toLocal=true;}else{w=l;if(lu>ru)toRemote=true;}}
    else if(l){w=l;toRemote=true;}
    else{w=r;toLocal=true;}
    if(del[id]&&del[id]>=(w.u||0)){if(l)toLocal=true;if(r)toRemote=true;return;}
    out.push(w);
  });
  const dl=JSON.stringify(loc.del||{}),dr=JSON.stringify(rem.del||{}),dm=JSON.stringify(del);
  if(dm!==dl)toLocal=true;if(dm!==dr)toRemote=true;
  return{acc:Object.assign({},loc,{list:out,del}),toLocal,toRemote};
}
/* copias de las cuentas en este dispositivo (las 10 últimas distintas) */
function accBackupNow(why){
  try{
    const acc=S.cfg.acc;if(!acc||!(acc.list||[]).length)return;
    const j=JSON.stringify(acc),arr=JSON.parse(localStorage.getItem('mando-acc-backups')||'[]');
    if(arr.length&&arr[0].j===j)return;
    if(arr.length&&!why&&Date.now()-arr[0].ts<60000)return;
    arr.unshift({ts:Date.now(),why:why||'',n:acc.list.length,j});
    localStorage.setItem('mando-acc-backups',JSON.stringify(arr.slice(0,10)));
  }catch(e){}
}

function cloudMeta(){S.sync=S.sync||{};S.sync.cu=S.sync.cu||{};S.sync.tomb=S.sync.tomb||{};return S.sync;}
function cloudErr(e){CLOUD.lastErr=(e&&(e.code||e.message))||'error';setSync('err');}
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
  CLOUD.fs.collection(CLOUD.base+'/mando_cfg').doc(k).set({j,u}).then(()=>{m.lastj[k]=j;saveLocal();}).catch(cloudErr);
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
function cloudPushTrade(t){if(!CLOUD.ready)return;CLOUD.fs.collection(CLOUD.base+'/mando_trades').doc(t.id).set(JSON.parse(JSON.stringify(Object.assign({},t,{u:t.u||1})))).catch(cloudErr);}
function cloudPushDel(id,u){if(!CLOUD.ready)return;CLOUD.fs.collection(CLOUD.base+'/mando_trades').doc(id).set({id,del:true,u}).catch(cloudErr);}
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
    if(k==='acc'){
      let rem=null;try{rem=JSON.parse(d.j);}catch(e){}
      if(rem){
        const mg=accMerge(S.cfg.acc,rem);
        if(mg.toLocal){cloudBackupOnce();accBackupNow('antes de unir con la nube');S.cfg.acc=mg.acc;changed=true;accStamp();ACC_SIG=accSigAll();}
        m.lastj[k]=d.j;
        if(mg.toRemote){m.cu[k]=Date.now();cloudFlushCfg();}
        else{m.cu[k]=d.u||0;m.lastj[k]=JSON.stringify(S.cfg.acc);}
        return;
      }
    }
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
  CLOUD.unsubs.push(fs.collection(CLOUD.base+'/mando_trades').onSnapshot({includeMetadataChanges:true},snap=>{cloudApplyTrades(snap);cloudDone();},cloudErr));
  CLOUD.unsubs.push(fs.collection(CLOUD.base+'/mando_cfg').onSnapshot({includeMetadataChanges:true},snap=>{cloudApplyCfg(snap);cloudDone();},cloudErr));
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
  if(location.hostname==='127.0.0.1'){
    dialog('<h2 style="font-size:28px">Abre otra dirección</h2><p class="small">Desde <b>127.0.0.1</b> Firebase no deja iniciar sesión. Abre <b>http://localhost:8123</b>. Ojo: los datos de esta pestaña no se ven allí. Para llevarlos usa «Copiar todos mis datos» aquí y «Pegar datos» allí.</p>',[{label:'Cerrar'}]);
    return;
  }
  if(CLOUD.uid){
    dialog('<h2 style="font-size:28px">Sincronización activa</h2><p class="small">Sesión iniciada como <b>'+esc(CLOUD.email||'')+'</b>.</p><p id="cdiag" class="small muted">Comprobando la nube…</p>',
      [{label:'Cerrar'},{label:'Subir todo desde aquí',run:()=>{cloudReplaceAll([]);toast('Subiendo todo a la nube…');}},{label:'Cerrar sesión',run:()=>{CLOUD.au.signOut();toast('Sesión cerrada en este dispositivo');}}]);
    CLOUD.fs.collection(CLOUD.base+'/mando_trades').get().then(sn=>{
      const rem=sn.docs.filter(d=>!(d.data()||{}).del).length,loc=Object.keys(S.trades).length,e=document.getElementById('cdiag');
      if(e)e.innerHTML='Operaciones: <b>'+loc+'</b> en este dispositivo · <b>'+rem+'</b> en la nube.'+(loc!==rem?'<br>Si faltan datos en la nube y los tienes aquí, pulsa «Subir todo desde aquí».':'<br>Todo igualado.')+(CLOUD.lastErr?'<br><span style="color:var(--coral)">Último error: '+esc(CLOUD.lastErr)+'</span>':'');
    }).catch(er=>{const e=document.getElementById('cdiag');if(e)e.innerHTML='<span style="color:var(--coral)">No pude leer la nube: '+esc((er&&(er.code||er.message))||'error')+'</span>';});
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
