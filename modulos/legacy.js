/* Traer a la app nueva los datos de la libreta antigua (los que guardaste en su carpeta de Firebase).
   La libreta antigua guarda seis documentos en users/<tu id>/libreta/: perfil, notas, operativa, registro, cuentas y diario.
   Esta función los LEE (no los modifica ni los borra) y los añade a la app nueva sin pisar nada de lo que ya tienes. */

const LEGACY_DOCS=['perfil','notas','operativa','registro','cuentas','diario'];

function legacyRead(){
  if(!CLOUD.uid||!CLOUD.fs)return Promise.reject(new Error('Primero inicia sesión'));
  return Promise.all(LEGACY_DOCS.map(n=>CLOUD.fs.doc('users/'+CLOUD.uid+'/libreta/'+n).get().then(s=>s.exists?s.data():null))).then(arr=>{
    const d={};LEGACY_DOCS.forEach((n,i)=>{d[n]=arr[i];});return d;
  });
}

/* convierte los documentos antiguos en un plan de qué se añadiría; no cambia nada todavía */
function legacyPlan(docs){
  const p={trades:[],dupTrades:0,accounts:[],dupAccounts:0,notes:{},checks:{},profile:{},stamps:{},btLog:[],btOld:null,vacio:true};
  const D=docs||{};
  Object.keys(D).forEach(k=>{if(D[k])p.vacio=false;});
  // operaciones del diario
  const have=Object.values(S.trades);
  const list=(D.diario&&D.diario.dia&&D.diario.dia.list)||[];
  list.forEach(e=>{
    if(!e||!e.id)return;
    const dup=S.trades[e.id]||have.some(t=>t.date===e.date&&t.side===e.side&&t.instr===(e.instr||'')&&t.res===(e.res==null?null:e.res)&&e.res!=null);
    if(dup){p.dupTrades++;return;}
    p.trades.push({id:e.id,ts:Date.parse((e.date||'1970-01-01')+'T12:00:00Z'),date:e.date,time:'',side:e.side==='short'?'short':'long',instr:e.instr||'',setup:Array.isArray(e.setup)?e.setup:[],res:e.res==null?null:+e.res,r:null,pre:'',dur:'',post:'',rules:'',errs:[],note:e.note||'',acc:e.acc||''});
  });
  // cuentas
  const mine=(S.cfg.acc&&S.cfg.acc.list)||[];
  const oldAcc=(D.cuentas&&D.cuentas.acc&&D.cuentas.acc.list)||[];
  oldAcc.forEach(a=>{
    if(!a||!a.id)return;
    const dup=mine.some(x=>x.id===a.id||(a.order&&x.order&&x.order===a.order&&x.firm===a.firm));
    if(dup){p.dupAccounts++;return;}
    p.accounts.push(Object.assign({hist:[],payouts:[],fees:[]},a));
  });
  // notas del curso, casillas y perfil: solo lo que no tengas ya
  const N=S.cfg.notes||{},C=S.cfg.checks||{},P=S.cfg.profile||{},T=S.cfg.stamps||{};
  const oldN=(D.notas&&D.notas.notes)||{},oldC=(D.notas&&D.notas.checks)||{};
  Object.keys(oldN).forEach(k=>{if(oldN[k]&&!N[k])p.notes[k]=oldN[k];});
  Object.keys(oldC).forEach(k=>{if(oldC[k]&&C[k]===undefined)p.checks[k]=oldC[k];});
  const oldP=(D.perfil&&D.perfil.profile)||{},oldS=(D.perfil&&D.perfil.stamps)||{};
  Object.keys(oldP).forEach(k=>{if(oldP[k]&&P[k]===undefined&&!(typeof PROFILE_DEFAULTS!=='undefined'&&PROFILE_DEFAULTS[k]===oldP[k])){p.profile[k]=oldP[k];if(oldS[k])p.stamps[k]=oldS[k];}});
  // backtesting: las horas se suman; las sesiones se guardan tal cual para el módulo que vendrá
  const bt=D.registro&&D.registro.bt;
  if(bt){
    const known={};(S.cfg.btLog||[]).forEach(l=>{known[l.ts]=1;});
    (bt.log||[]).forEach(l=>{if(l&&l.ts&&!known[l.ts])p.btLog.push({ts:l.ts,m:+l.m||0});});
    if(bt.sessions&&bt.sessions.length){
      const nuevo={sessions:bt.sessions,goal:bt.goal||null};
      if(JSON.stringify(S.cfg.btOld||null)!==JSON.stringify(nuevo))p.btOld=nuevo;     // solo si es distinto de lo ya guardado
    }
  }
  return p;
}

function legacyCounts(p){
  return {ops:p.trades.length,cuentas:p.accounts.length,notas:Object.keys(p.notes).length,checks:Object.keys(p.checks).length,perfil:Object.keys(p.profile).length,
    btHoras:p.btLog.reduce((x,l)=>x+l.m,0),btSesiones:p.btOld?p.btOld.sessions.length:0};
}
const lgOps=n=>n+(n===1?' operación':' operaciones'),lgAcc=n=>n+(n===1?' cuenta':' cuentas');
function legacyNothing(p){const c=legacyCounts(p);return !(c.ops||c.cuentas||c.notas||c.checks||c.perfil||c.btHoras||c.btSesiones);}

function legacyApply(p){
  p.trades.forEach(t=>putTrade(t));
  const acc=accData();p.accounts.forEach(a=>acc.list.push(a));
  S.cfg.notes=Object.assign({},S.cfg.notes||{},p.notes);
  S.cfg.checks=Object.assign({},S.cfg.checks||{},p.checks);
  S.cfg.profile=Object.assign({},S.cfg.profile||{},p.profile);
  S.cfg.stamps=Object.assign({},S.cfg.stamps||{},p.stamps);
  if(p.btLog.length)S.cfg.btLog=(S.cfg.btLog||[]).concat(p.btLog);
  if(p.btOld)S.cfg.btOld=p.btOld;
  saveCfg();
}

function legacyDialog(){
  if(!CLOUD.uid){toast('Primero inicia sesión con tu correo');return;}
  dialog('<h2 style="font-size:28px">Traer mi libreta antigua</h2><p id="lgmsg" class="small muted">Leyendo tu libreta antigua en la nube…</p>',[{label:'Cerrar'}]);
  legacyRead().then(docs=>{
    const p=legacyPlan(docs),c=legacyCounts(p),e=document.getElementById('lgmsg');
    if(!e)return;
    if(p.vacio){e.innerHTML='No encuentro datos de la libreta antigua en <b>esta cuenta</b>. Si la usabas con otro correo, cierra sesión y entra con ese.';return;}
    if(legacyNothing(p)){e.innerHTML='Todo lo de tu libreta antigua ya está aquí'+(p.dupTrades||p.dupAccounts?' ('+lgOps(p.dupTrades)+' y '+lgAcc(p.dupAccounts)+' repetidas, no las duplico)':'')+'. No hay nada nuevo que traer.';return;}
    const li=[];
    if(c.ops)li.push('<b>'+c.ops+'</b> operaci'+(c.ops>1?'ones':'ón')+' del diario');
    if(c.cuentas)li.push('<b>'+c.cuentas+'</b> cuenta'+(c.cuentas>1?'s':'')+' de Banca');
    if(c.notas)li.push('<b>'+c.notas+'</b> nota'+(c.notas>1?'s':'')+' del curso');
    if(c.checks)li.push('<b>'+c.checks+'</b> casilla'+(c.checks>1?'s':'')+' marcada'+(c.checks>1?'s':''));
    if(c.perfil)li.push('<b>'+c.perfil+'</b> texto'+(c.perfil>1?'s':'')+' de «Mi porqué»');
    if(c.btHoras)li.push('<b>'+Math.round(c.btHoras/6)/10+' h</b> de backtesting registradas');
    if(c.btSesiones)li.push('<b>'+c.btSesiones+'</b> sesión'+(c.btSesiones>1?'es':'')+' de backtesting (se guardan para cuando exista ese módulo)');
    e.innerHTML='Esto es lo que traería a la app nueva:<ul class="lst">'+li.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+((p.dupTrades||p.dupAccounts)?'<p class="small muted">Omito '+lgOps(p.dupTrades)+' y '+lgAcc(p.dupAccounts)+' que ya tienes.</p>':'')+'<p class="small muted">No borra ni cambia nada de la libreta antigua, y no pisa nada de lo que ya tienes aquí.</p><div class="acts"><button class="btn pri" id="lgGo">Traer ahora</button></div>';
    const g=document.getElementById('lgGo');
    if(g)g.onclick=()=>{legacyApply(p);const w=document.getElementById('dlgWrap');if(w)w.remove();render();toast('Datos de la libreta antigua traídos');};
  }).catch(er=>{const e=document.getElementById('lgmsg');if(e)e.innerHTML='<span style="color:var(--coral)">No pude leer la libreta antigua: '+esc((er&&(er.code||er.message))||'error')+'</span>';});
}
document.addEventListener('click',e=>{if(e.target.closest('[data-legacy]'))legacyDialog();});
