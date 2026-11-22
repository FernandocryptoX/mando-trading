/* Zona de Estudio: apuntes por día, glosario, mi sistema, dudas, mi porqué y repaso con tarjetas.
   Usa los datos de curso.js y el estado S de la app (S.cfg.notes, checks, profile, stamps, srs, rolled). */

function ensureStudy(){
  const c=S.cfg;
  c.notes=c.notes||{};c.checks=c.checks||{};c.profile=c.profile||{};c.stamps=c.stamps||{};c.srs=c.srs||{};c.rolled=c.rolled||{};
}
const pv=k=>{ensureStudy();return S.cfg.profile[k]!==undefined?S.cfg.profile[k]:(PROFILE_DEFAULTS[k]||'');};
const stampTxt=k=>{ensureStudy();const s=S.cfg.stamps[k];return s?' <span class="stamp">· actualizado '+new Date(s).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})+'</span>':'';};
const pad2=n=>String(n).padStart(2,'0');
const plainText=h=>String(h||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const norm=s=>plainText(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

/* ---------- aviso de contrato NQ ---------- */
const QMONTHS=[[3,'H'],[6,'M'],[9,'U'],[12,'Z']];
const d0=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const fmtD=d=>d.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
function thirdFriday(y,m){const d=new Date(y,m-1,1);return new Date(y,m-1,1+(5-d.getDay()+7)%7+14);}
function contractList(y0){const out=[];for(let y=y0;y<=y0+2;y++)for(const q of QMONTHS){const exp=thirdFriday(y,q[0]);out.push({code:'NQ'+q[1]+y,exp,roll:addDays(exp,-8)});}return out;}
function contractInfo(now){
  ensureStudy();const t=d0(now||new Date()),list=contractList(t.getFullYear()-1),i=list.findIndex(c=>c.roll>=t);
  const cur=list[i],prev=list[i-1],next=list[i+1],dToRoll=Math.round((cur.roll-t)/864e5);
  const justRolled=!!prev&&t<=prev.exp&&!S.cfg.rolled[cur.code],soon=!justRolled&&dToRoll<=14;
  return{cur,prev,next,dToRoll,justRolled,soon};
}
function contractBoxHTML(){
  const c=contractInfo(),k=c.justRolled?'warn':(c.soon?'soon':'');
  const msg=c.justRolled?'⚠️ <b>Toca cambiar</b> de '+c.prev.code+' a <b>'+c.cur.code+'</b>.':c.soon?'⏳ Cambio a '+c.next.code+' en <b>'+c.dToRoll+' días</b> ('+fmtD(c.cur.roll)+').':'Próximo cambio a '+c.next.code+': '+fmtD(c.cur.roll)+' (en '+c.dToRoll+' días).';
  return '<div class="ctr '+k+'"><b class="code">'+c.cur.code+'</b>'+msg+'<br><span class="muted">Vence: '+fmtD(c.cur.exp)+'</span><br><span class="muted">Micro: M'+c.cur.code+' · MES'+c.cur.code.slice(2)+'</span>'+(c.justRolled?'<br><button class="btn sm" data-study="rolled" data-code="'+c.cur.code+'" style="margin-top:8px">Ya lo cambié en TradingView</button>':'')+'</div>';
}
/* elemento "pendiente" para la pantalla Hoy */
function contractTodo(){
  const c=contractInfo();
  if(c.justRolled)return '<button class="todo u" data-study="rolled" data-code="'+c.cur.code+'"><b>Cambia de '+c.prev.code+' a '+c.cur.code+' en TradingView</b><span>Hecho</span></button>';
  if(c.soon)return '<a class="todo" href="#dia-2" style="text-decoration:none;color:inherit"><b>Cambio de contrato a '+c.next.code+' en '+c.dToRoll+' días</b><span>'+fmtD(c.cur.roll)+'</span></a>';
  return '';
}

/* ---------- repaso con tarjetas (cajas de Leitner) ---------- */
const BOX_DAYS=[0,1,3,7,14,30];
function srsQueue(){
  ensureStudy();const today=todayES(),out=[];
  GLOSSARY.forEach(g=>{const s=S.cfg.srs[g.t];if(!s||s.due<=today)out.push(g);});
  return out;
}
function srsStats(){
  ensureStudy();const today=todayES();let nuevos=0,vencidos=0,dominados=0;
  GLOSSARY.forEach(g=>{const s=S.cfg.srs[g.t];if(!s)nuevos++;else if(s.due<=today)vencidos++;if(s&&s.box>=4)dominados++;});
  return{nuevos,vencidos,dominados,total:GLOSSARY.length,pend:nuevos+vencidos};
}
function srsTodo(){return '';}   // el repaso con tarjetas se quitó
function studyCard(){
  const n=DAYS.filter(d=>d.status==='done').length;
  return '<section class="card"><h3>Estudio</h3><p style="margin:0 0 10px">'+n+' de '+TOTAL_DAYS+' días del curso apuntados.</p><div class="acts"><a class="btn pri" href="#estudio" style="text-decoration:none;display:inline-grid;place-items:center">Apuntes</a><a class="btn" href="#glosario" style="text-decoration:none;display:inline-grid;place-items:center">Glosario</a></div></section>';
}
/* ---------- vistas ---------- */
function setStudyView(inner){
  $('#view').innerHTML='<div class="wrap study'+(S.cfg.repaso?' repaso':'')+'"><header class="top" style="padding-bottom:14px"><div><div class="kick">Zona de estudio</div></div>'+syncChip()+'</header><article class="sheet" id="sheet">'+inner+'</article></div>';
  bindFields();
}
function renderEstudio(){
  ensureStudy();const st=srsStats();
  const cards=[];
  for(let i=1;i<=TOTAL_DAYS;i++){
    const d=DAYS.find(x=>x.id===i);
    cards.push(d&&d.status==='done'?'<a class="dcard" href="#dia-'+i+'"><span class="dn">Día '+i+'</span><b>'+esc(d.title)+'</b><span class="muted">'+d.mins+' min · '+d.tags.map(t=>TAGS[t].txt.split(' ')[0]).join(' ')+'</span></a>':'<div class="dcard off"><span class="dn">Día '+i+'</span><b>Pendiente de transcribir</b></div>');
  }
  const open=DUDAS.filter(d=>!S.cfg.checks['dud-'+d.id]).length;
  setStudyView('<div class="kicker"><span class="tag t-tec">Estudio</span><span>Bootcamp · Xavi Ruyra</span></div><h1><span class="u">Estudio'+UL_SVG+'</span></h1>'+
   '<p class="sub">Todo el curso en un sitio: apuntes por día, glosario, tu sistema y tus dudas.</p><p class="muted" style="margin-top:-6px">Curso en construcción: <b>'+DAYS.filter(d=>d.status==="done").length+' de '+TOTAL_DAYS+'</b> días apuntados. Los nuevos aparecen aquí al añadirlos.</p>'+
   '<input id="qEst" class="glq" type="search" placeholder="Buscar en todos los apuntes…" autocomplete="off" aria-label="Buscar en los apuntes"><div id="qRes"></div>'+
   '<div id="estBody"><div class="tiles" style="margin-bottom:18px">'+
   '<a class="tile" href="#glosario"><b>Glosario</b><small>'+GLOSSARY.length+' conceptos</small></a>'+
   '<a class="tile" href="#sistema"><b>Mi sistema</b><small>receta de entrada</small></a>'+
   '<a class="tile" href="#dudas"><b>Dudas pendientes</b><small>'+open+' abiertas</small></a>'+
   '<a class="tile" href="#portada"><b>Mi porqué</b><small>portada</small></a>'+
   '<button class="tile" data-study="repasomodo" style="text-align:left;font:inherit;color:inherit"><b>Modo repaso</b><small>'+(S.cfg.repaso?'activado: solo lo esencial':'apagado')+'</small></button></div>'+
   '<div class="dgrid">'+cards.join('')+'</div></div>');
  const q=$('#qEst');
  q.addEventListener('input',()=>{
    const n=norm(q.value);if(n.length<2){$('#qRes').innerHTML='';$('#estBody').hidden=false;return;}
    $('#estBody').hidden=true;
    const res=[];
    GLOSSARY.forEach(g=>{if(norm(g.t+' '+g.d).includes(n))res.push('<div class="term"><div class="th"><h3>'+g.t+'</h3><span>'+g.days.map(d=>'<a class="dlink" href="#dia-'+d+'">Día '+d+'</a>').join('')+'</span></div><p>'+g.d+'</p></div>');});
    DAYS.forEach(d=>{if(d.status!=='done')return;const txt=plainText(d.title+' '+d.intro+' '+d.blocks.map(b=>b.text||b.html||(b.items||[]).map(x=>typeof x==='string'?x:(x.h||'')+' '+(x.p||'')).join(' ')).join(' '));
      const i=norm(txt).indexOf(n);if(i>=0){const sn=txt.slice(Math.max(0,i-50),i+110);res.push('<div class="term more"><div class="th"><h3>Día '+d.id+' · '+esc(d.title)+'</h3><a class="dlink" href="#dia-'+d.id+'">Abrir</a></div><p class="muted">…'+esc(sn)+'…</p></div>');}});
    $('#qRes').innerHTML=res.length?res.join(''):'<p class="muted">Nada coincide.</p>';
  });
}
function renderBlock(b){
  switch(b.t){
    case 'idea': return '<div class="idea"><span class="lab">La idea en una frase</span><p>'+b.text+'</p></div>';
    case 'h2': return '<h2>'+b.text+(b.tape?' <span class="tape">'+b.tape+'</span>':'')+'</h2>';
    case 'h3': return '<h3 class="hand" style="margin:18px 0 6px">'+b.text+'</h3>';
    case 'p': return '<p class="'+(b.cls||'')+'">'+b.html+'</p>';
    case 'list': return '<ul class="dash">'+b.items.map(i=>'<li>'+i+'</li>').join('')+'</ul>';
    case 'quote': return '<div class="quote">'+b.text+'<small>'+(b.src||'')+'</small></div>';
    case 'html': return '<div class="'+(b.cls||'')+'">'+b.html+'</div>';
    case 'cards': return '<div class="cards">'+b.items.map(c=>'<div class="card c-'+c.c+(c.detail?' detail':'')+'"><span class="ico">'+(c.ico||'')+'</span><h3>'+c.h+'</h3><p>'+c.p+'</p></div>').join('')+'</div>';
    case 'checks': return '<div class="checks">'+b.items.map((t,i)=>{const k=b.id+'-'+i;return '<label class="chk"><input type="checkbox" data-chk="'+k+'" '+(S.cfg.checks[k]?'checked':'')+'><span>'+t+'</span></label>';}).join('')+'</div>';
    case 'mine': return '<div class="mine"><span class="lab">'+(b.lab||'Esto es tuyo')+'</span><h3>'+b.h+'</h3>'+(b.hint?'<p class="muted" style="font-size:14px">'+b.hint+'</p>':'')+'<textarea class="hw" data-note="'+b.id+'" rows="2" placeholder="'+esc(b.ph||'')+'">'+esc(S.cfg.notes[b.id]||b.pre||'')+'</textarea></div>';
    case 'prof': return '<div class="mine"><span class="lab">'+(b.lab||'Esto es tuyo')+'</span><h3>'+b.h+stampTxt(b.key)+'</h3>'+(b.hint?'<p class="muted" style="font-size:14px">'+b.hint+'</p>':'')+'<textarea class="hw" data-prof="'+b.key+'" rows="3" placeholder="'+esc(b.ph||'')+'">'+esc(pv(b.key))+'</textarea></div>';
    case 'omit': return '<div class="omit detail">'+b.html+'</div>';
  }
  return '';
}
function renderDia(id){
  ensureStudy();const d=DAYS.find(x=>x.id===id);
  if(!d||d.status!=='done'){setStudyView('<h1>Día '+id+'</h1><p class="sub">'+(d&&d.note?esc(d.note)+'.':'Aún sin apuntar.')+'</p><div class="foot"><a href="#estudio">← Estudio</a><span></span></div>');return;}
  const tags=d.tags.map(t=>'<span class="tag '+TAGS[t].cls+'">'+TAGS[t].txt+'</span>').join('');
  const prev=id>1?'<a href="#dia-'+(id-1)+'">← Día '+(id-1)+'</a>':'<a href="#estudio">← Estudio</a>';
  const nx=DAYS.find(x=>x.id===id+1),next=nx&&nx.status==='done'?'<a href="#dia-'+(id+1)+'">Día '+(id+1)+' →</a>':'<span></span>';
  setStudyView('<div class="kicker"><b>Día '+d.id+'</b> '+tags+'<span>· '+d.mins+' min</span></div><h1><span class="u">'+esc(d.title)+UL_SVG+'</span></h1><p class="sub">'+d.intro+'</p>'+d.blocks.map(renderBlock).join('')+'<div class="foot">'+prev+next+'</div>');
  const dots=$('#dots');if(dots){let h='';const hl=new Set([6,53,87]);for(let i=0;i<100;i++)h+='<i class="'+(hl.has(i)?'hl':'')+'"></i>';dots.innerHTML=h;}
  const cb=$('#ctrbox');if(cb)cb.innerHTML=contractBoxHTML();
}
function renderGlosario(){
  const items=GLOSSARY.slice().sort((a,b)=>a.t.localeCompare(b.t,'es'));
  setStudyView('<div class="kicker"><span class="tag t-tec">Glosario</span><span>Se completa con cada día</span></div><h1><span class="u">Glosario'+UL_SVG+'</span></h1><p class="sub">Los conceptos del curso con sus palabras. <b>'+GLOSSARY.length+'</b> en total; cada uno enlaza al día donde se explica. Los marcados con 🔄 se irán ampliando.</p><input id="glq" class="glq" type="search" placeholder="Buscar un concepto…" autocomplete="off" aria-label="Buscar en el glosario"><div id="gllist"></div><div class="foot"><a href="#estudio">← Estudio</a><a href="#repaso">Repasar →</a></div>');
  const draw=q=>{const n=norm(q);const list=items.filter(t=>!n||norm(t.t+' '+t.d).includes(n));
    $('#gllist').innerHTML=list.length?list.map(t=>'<div class="term'+(t.more?' more':'')+'"><div class="th"><h3>'+t.t+'</h3><span>'+t.days.map(d=>'<a class="dlink" href="#dia-'+d+'">Día '+d+'</a>').join('')+'</span></div><p>'+t.d+'</p>'+(t.more?'<div class="mo">🔄 Se irá ampliando con el curso</div>':'')+'</div>').join(''):'<p class="muted">Ningún concepto coincide.</p>';};
  draw('');$('#glq').addEventListener('input',e=>draw(e.target.value));
}
function renderSistema(){
  ensureStudy();const cnt=k=>SISTEMA.filter(s=>s.st===k).length;
  setStudyView('<div class="kicker"><span class="tag t-tec">Sistema</span><span>Se completa con el curso</span></div><h1><span class="u">Mi sistema'+UL_SVG+'</span></h1><p class="sub">La receta de entrada tal como se ha ido explicando, en orden. <b>Solo incluye lo que se ha enseñado</b>; lo que falta está marcado. Hoy: ✅ '+cnt('ok')+' explicados · 🟡 '+cnt('part')+' a medias · ⏳ '+cnt('no')+' sin explicar.</p>'+
   '<div class="cards">'+SISTEMA.map(s=>{const t=SIS_ST[s.st];return '<div class="card '+t.c+'"><span class="ico">'+t.i+'</span><h3>'+s.n+'. '+s.h+'</h3><p>'+s.p+'</p><p class="muted" style="font-size:13px;margin-top:6px">'+t.n+(s.days.length?' · '+s.days.map(d=>'<a class="dlink" href="#dia-'+d+'">Día '+d+'</a>').join(' '):'')+'</p></div>';}).join('')+'</div>'+
   '<h2>Lo que falta por explicar <span class="tape">pendiente</span></h2><ul class="dash"><li>Las <b>sesiones</b> (Asia, Londres, Nueva York con sus horas) y las <b>«condiciones»</b> del sesgo.</li><li><b>Estrategia y sistemas de entrada</b> juntando todos los conceptos.</li><li><b>Riesgo, escalar con prop firms</b>, cómo llevar el diario y cada cuánto revisarlo.</li><li>Qué es un FVG «patrocinado».</li></ul>'+
   renderBlock({t:'mine',id:'sis-mia',h:'Mi versión, con mis palabras',lab:'Esto es tuyo',ph:'Cómo me quedaría la receta en 5 líneas, escrita para mí…',hint:'Cuando acabe la estrategia, reescribe aquí la receta como la vas a usar tú.'})+
   '<div class="foot"><a href="#glosario">← Glosario</a><a href="#estudio">Estudio →</a></div>');
}
function renderDudas(){
  ensureStudy();const open=DUDAS.filter(d=>!S.cfg.checks['dud-'+d.id]);
  setStudyView('<div class="kicker"><span class="tag t-tec">Dudas</span><span>Se actualiza con cada vídeo</span></div><h1><span class="u">Dudas pendientes'+UL_SVG+'</span></h1><p class="sub">Lo que se deja abierto, lo que no se pudo confirmar con la transcripción y lo que se prometió explicar. Marca <b>resuelta</b> cuando quede aclarada. Abiertas: <b>'+open.length+'</b> de '+DUDAS.length+'.</p>'+
   '<div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))">'+DUDAS.map(d=>{const t=DU_ST[d.st],done=!!S.cfg.checks['dud-'+d.id];
    return '<div class="card '+t.c+'" style="'+(done?'opacity:.55':'')+'"><span class="ico">'+t.i+'</span><h3>'+d.h+'</h3><p>'+d.q+'</p><p class="muted" style="font-size:13px;margin-top:6px"><b>'+t.n+'.</b> '+d.how+'</p><p style="font-size:13px;margin-top:6px">'+d.days.map(n=>'<a class="dlink" href="#dia-'+n+'">Día '+n+'</a>').join(' ')+d.links.map(l=>' <a class="dlink" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v='+l[1]+'&t='+l[2]+'s">▶ '+l[0]+(l[2]?' ('+Math.floor(l[2]/60)+':'+pad2(l[2]%60)+')':'')+'</a>').join('')+'</p><label class="chk" style="margin-top:8px"><input type="checkbox" data-chk="dud-'+d.id+'" '+(done?'checked':'')+'><span>Resuelta</span></label><textarea class="hw" data-note="dud-'+d.id+'" rows="1" placeholder="Qué he comprobado…">'+esc(S.cfg.notes['dud-'+d.id]||'')+'</textarea></div>';}).join('')+'</div>'+
   '<div class="foot"><a href="#sistema">← Mi sistema</a><a href="#estudio">Estudio →</a></div>');
}
function field(key,label,rows){return '<div class="field"><label>'+label+stampTxt(key)+'</label><textarea class="hw" data-prof="'+key+'" rows="'+(rows||1)+'">'+esc(pv(key))+'</textarea></div>';}
function renderPortada(){
  ensureStudy();
  setStudyView('<div class="kicker"><span class="tag t-rut">Personal</span><span>Esta hoja es solo tuya</span></div><h1><span class="u">Mi porqué'+UL_SVG+'</span></h1><p class="sub">Para releerla cuando el mercado, el cansancio o una mala racha te hagan dudar.</p>'+
   '<div class="idea"><span class="lab">Mi meta</span><p>Hacerme <span class="mk">trader profesional</span> y vivir de ello, sin depender de mi trabajo.</p></div>'+
   '<h2>Por qué empecé <span class="tape">motor</span></h2><div class="mine"><span class="lab">Esto es tuyo</span>'+field('why','Mi motivo',2)+field('pro','Qué significa "ser profesional" para mí',2)+field('goalsLong','Objetivos a largo plazo',4)+field('goalsShort','Objetivos a corto plazo (acciones)',4)+'</div>'+
   '<h2>Dónde estoy hoy <span class="tape">punto de partida</span></h2><div class="mine"><span class="lab">Esto es tuyo</span>'+field('start','Mi historia con el trading',3)+field('now','Cómo opero ahora',3)+field('fix','Lo que quiero arreglar',2)+'</div>'+
   '<h2>Mis 3 palancas de cambio <span class="tape">plan</span></h2><div class="cards"><div class="card c-c"><h3>Registrar todo, fácil</h3><p>Journal de cada operación con emociones. Mi punto débil es la constancia: tiene que ser <b>rápido y sencillo</b> o lo dejo.</p></div><div class="card c-b"><h3>Backtestear</h3><p>Validar la metodología con datos antes de confiar en ella.</p></div><div class="card c-m"><h3>Menos tiempo en mercado</h3><p>Probar un enfoque más scalping para exponerme menos.</p></div></div>'+
   '<div class="foot"><a href="#estudio">← Estudio</a><a href="#dia-1">Día 1 →</a></div>');
}
function renderStudio(h){
  ensureStudy();
  const m=/^dia-(\d+)$/.exec(h);
  if(m)renderDia(+m[1]);else({estudio:renderEstudio,portada:renderPortada,glosario:renderGlosario,sistema:renderSistema,dudas:renderDudas,repaso:renderEstudio})[h]();
}

/* ---------- campos de texto, casillas y acciones del estudio ---------- */
function autosize(el){el.style.height='auto';el.style.height=(el.scrollHeight+2)+'px';}
function bindFields(){
  ensureStudy();
  document.querySelectorAll('.study textarea.hw').forEach(t=>{
    autosize(t);
    t.addEventListener('input',()=>{
      if(t.dataset.prof){S.cfg.profile[t.dataset.prof]=t.value;S.cfg.stamps[t.dataset.prof]=Date.now();}
      if(t.dataset.note)S.cfg.notes[t.dataset.note]=t.value;
      autosize(t);saveCfg();
    });
  });
  document.querySelectorAll('.study input[data-chk]').forEach(c=>c.addEventListener('change',()=>{S.cfg.checks[c.dataset.chk]=c.checked;saveCfg();}));
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-study]');if(!a)return;
  ensureStudy();const k=a.dataset.study;
  if(k==='rolled'){S.cfg.rolled[a.dataset.code]=true;saveCfg();render();toast('Anotado');}
  else if(k==='repasomodo'){S.cfg.repaso=!S.cfg.repaso;saveCfg();render();}
});
