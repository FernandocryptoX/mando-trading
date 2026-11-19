/* Semana de noticias y estado del día (FOMC, NFP, CPI, festivos de EE. UU.).
   Usa los ayudantes de index.html (parts, zonedToUtc, hm, dowOf, addD, mondayOf, todayES). Datos en S.cfg.news. */

const NEWS_MARGIN=5;                                   // minutos antes de la noticia sin abrir entradas (el curso dice 3–5)
const SES={start:'09:30',end:'11:00'};                 // sesión, hora de Nueva York
const KINDS={fomc:{n:'FOMC',t:'14:00'},nfp:{n:'NFP',t:'08:30'},cpi:{n:'CPI',t:'08:30'},otra:{n:'Otra',t:'10:00'}};
const LV={closed:{i:'⚫',n:'Mercado cerrado',r:5,c:'closed'},no:{i:'🔴',n:'No operar',r:4,c:'no'},care:{i:'🟡',n:'Con cuidado',r:3,c:'care'},ok:{i:'🟢',n:'Día normal',r:1,c:'ok'},unk:{i:'⚪',n:'Sin datos',r:0,c:'unk'},off:{i:'⚪',n:'Fin de semana',r:0,c:'unk'}};

function newsState(){const c=S.cfg;c.news=c.news||{};c.news.days=c.news.days||{};c.news.reviewed=c.news.reviewed||{};return c.news;}

/* calendario automático: datos/noticias.json lo mantiene al día GitHub Actions (solo USD, impacto medio y alto).
   Lo que apuntes a mano en un día tiene prioridad sobre el automático. */
function autoNews(){const c=S.cfg;c.newsAuto=c.newsAuto||{};c.newsAuto.days=c.newsAuto.days||{};c.newsAuto.weeks=c.newsAuto.weeks||[];return c.newsAuto;}
function loadAutoNews(){
  fetch('datos/noticias.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
    if(!j||!j.days)return;
    const a=autoNews();a.updated=j.updated;a.weeks=j.weeks||[];a.days=j.days;saveLocal();softRender();
  }).catch(()=>{});
}
function effEvents(ds){const m=newsState().days[ds];return m!==undefined?{list:m,auto:false}:{list:autoNews().days[ds]||[],auto:true};}
function ensureManual(ds){const N=newsState();if(N.days[ds]===undefined)N.days[ds]=(autoNews().days[ds]||[]).map(e=>({k:e.k,t:e.t,title:e.title}));return N.days[ds];}
const evName=e=>e.title?esc(e.title):(KINDS[e.k]?KINDS[e.k].n:'Noticia');
const dayLabel=ds=>{const a=ds.split('-').map(Number);const t=new Intl.DateTimeFormat('es-ES',{timeZone:'UTC',weekday:'short',day:'numeric',month:'short'}).format(Date.UTC(a[0],a[1]-1,a[2]));return t.charAt(0).toUpperCase()+t.slice(1);};

/* festivos de EE. UU. calculados por reglas (confirmar siempre en ForexFactory) */
function nthWd(y,m,n,wd){const f=new Date(Date.UTC(y,m-1,1)).getUTCDay();return 1+((wd-f+7)%7)+7*(n-1);}
function lastWd(y,m,wd){const l=new Date(Date.UTC(y,m,0));return l.getUTCDate()-((l.getUTCDay()-wd+7)%7);}
function easterMD(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);return[Math.floor((h+l-7*m+114)/31),((h+l-7*m+114)%31)+1];}
function obsD(y,m,d,nyseNewYear){const ds=ymd(y,m,d),w=dowOf(ds);if(w===6)return nyseNewYear?null:addD(ds,-1);if(w===0)return addD(ds,1);return ds;}
function usHolidays(y){
  const L=[],add=(name,d,closed)=>{if(d)L.push({d,name,closed});};
  [['Año Nuevo',1,1],['Juneteenth',6,19],['Día de la Independencia',7,4],['Navidad',12,25]].forEach(x=>{
    const ny=obsD(y,x[1],x[2],x[1]===1&&x[2]===1),fed=obsD(y,x[1],x[2],false);
    add(x[0],ny,true);if(fed!==ny)add(x[0]+' (festivo bancario)',fed,false);
  });
  add('Día de los Veteranos (festivo bancario)',obsD(y,11,11,false),false);
  add('Martin Luther King',ymd(y,1,nthWd(y,1,3,1)),true);
  add('Día de los Presidentes',ymd(y,2,nthWd(y,2,3,1)),true);
  const e=easterMD(y);add('Viernes Santo',addD(ymd(y,e[0],e[1]),-2),true);
  add('Memorial Day',ymd(y,5,lastWd(y,5,1)),true);
  add('Día del Trabajo (EE. UU.)',ymd(y,9,nthWd(y,9,1,1)),true);
  add('Columbus Day (festivo bancario)',ymd(y,10,nthWd(y,10,2,1)),false);
  add('Acción de Gracias',ymd(y,11,nthWd(y,11,4,4)),true);
  return L;
}
function holidayOn(ds){const y=+ds.slice(0,4),hits=usHolidays(y).concat(usHolidays(y+1)).filter(h=>h.d===ds);return hits.find(h=>h.closed)||hits[0]||null;}

/* estado de cada día */
function evWindow(ds,e){
  const t=zonedToUtc(ds,e.t,TZ_NY),s=zonedToUtc(ds,SES.start,TZ_NY),f=zonedToUtc(ds,SES.end,TZ_NY),a=t-NEWS_MARGIN*60000;
  return{es:hm(t),from:hm(a),inside:t>=s&&t<=f,where:t<s?'sale antes de abrir la sesión':(t>f?'sale después de tu sesión':'sale dentro de la sesión')};
}
function dayInfo(ds){
  const N=newsState(),mon=mondayOf(ds),reviewed=!!N.reviewed[mon]||autoNews().weeks.includes(mon),w=dowOf(ds);
  const ev=effEvents(ds).list.filter(e=>e&&e.t).slice().sort((a,b)=>a.t.localeCompare(b.t));
  const hol=holidayOn(ds),reasons=[];
  if(w===0||w===6)return{lv:'off',ev,hol,reviewed,reasons};
  let lv='ok';const up=x=>{if(LV[x].r>LV[lv].r)lv=x;};
  if(hol){
    if(hol.closed){up('closed');reasons.push('Festivo en EE. UU.: '+hol.name+'. La bolsa está cerrada, no te presentes. (Los futuros pueden abrir con horario reducido: confírmalo.)');}
    else{up('care');reasons.push(hol.name+': mira ForexFactory (carpeta gris). Puede haber poco volumen.');}
  }
  if(ev.some(e=>e.k==='fomc')){up('no');reasons.push('FOMC: hoy no se opera. Ni abrir el gráfico.');}
  if(ev.some(e=>e.k==='nfp')){up('care');reasons.push('NFP: con cuidado. Si no ves nada que te guste, no operes: suele ir lento.');}
  if(ev.some(e=>e.k==='cpi')){up('care');reasons.push('CPI: alto impacto, pero se puede operar. Con cuidado.');}
  if(!ev.length&&!hol){if(!reviewed)lv='unk';else if(w===1){up('care');reasons.push('No News Monday: sin noticias el precio suele ir lento. Con cuidado.');}}
  return{lv,ev,hol,reviewed,reasons};
}
function weekPending(){
  const N=newsState(),t=todayES(),w=dowOf(t),wk=(w===6||w===0);
  const target=wk?mondayOf(addD(t,w===6?2:1)):mondayOf(t);
  return (N.reviewed[target]||autoNews().weeks.includes(target))?null:{monday:target,urgent:!wk,label:wk?'la próxima semana':'esta semana'};
}
function newsTodo(){
  const p=weekPending();if(!p)return '';
  return '<a class="todo'+(p.urgent?' u':'')+'" href="#noticias" style="text-decoration:none;color:inherit"><b>Cargar las noticias de '+p.label+'</b><span>30 s</span></a>';
}
function evLine(ds,e){
  const w=evWindow(ds,e);
  return '<b>'+evName(e)+'</b> a las <b>'+w.es+'</b> (España) · '+e.t+' NY'+(w.inside?'<br>⛔ No abras entradas de <b>'+w.from+'</b> a <b>'+w.es+'</b> y espera a ver qué hace la noticia.':' <span class="muted">· '+w.where+'.</span>');
}
/* tarjeta del día para la pantalla Hoy */
function newsCard(){
  const ds=todayES(),inf=dayInfo(ds),L=LV[inf.lv];
  return '<section class="card lvl '+L.c+'"><div class="row"><h3 style="margin:0">Estado del día</h3><a class="small" href="#noticias" style="color:var(--yellow)">Ver semana</a></div><p style="font-size:22px;margin:8px 0 6px;font-weight:600">'+L.i+' '+L.n+'</p>'+
   (inf.reasons.length?'<ul class="lst">'+inf.reasons.map(r=>'<li>'+r+'</li>').join('')+'</ul>':'')+
   (inf.ev.length?'<div class="lbl" style="margin-top:10px">Noticias de hoy</div><ul class="lst">'+inf.ev.map(e=>'<li>'+evLine(ds,e)+'</li>').join('')+'</ul>':'<p class="small muted" style="margin:0">'+(inf.lv==='unk'?'Aún no has cargado las noticias de esta semana.':'Sin noticias cargadas para hoy.')+'</p>')+'</section>';
}

/* página de la semana */
let newsOff=0;
function weekDayHTML(ds){
  const inf=dayInfo(ds),L=LV[inf.lv],E=effEvents(ds),evs=E.list,A=autoNews(),hasAuto=A.weeks.includes(mondayOf(ds));
  const rows=evs.map((e,i)=>{
    const w=e.t?evWindow(ds,e):null;
    return '<li><div class="row" style="flex-wrap:nowrap"><b style="min-width:0">'+evName(e)+'</b><input type="time" value="'+esc(e.t||'')+'" data-nev="'+ds+'|'+i+'" aria-label="Hora en Nueva York" style="max-width:130px"><span class="muted small">NY</span>'+(w?'<span class="small">= <b>'+w.es+'</b> España</span>':'')+'<button class="btn sm" data-n="del|'+ds+'|'+i+'" aria-label="Quitar noticia">✕</button></div>'+
      (w&&w.inside?'<div class="small" style="color:var(--coral)">⛔ No abras entradas de '+w.from+' a '+w.es+' (España).</div>':(w?'<div class="small muted">'+w.where+' · si operaras a esa hora, no entres de '+w.from+' a '+w.es+'</div>':''))+'</li>';
  }).join('');
  const adds=Object.keys(KINDS).map(k=>'<button class="btn sm" data-n="add|'+ds+'|'+k+'">+ '+KINDS[k].n+'</button>').join('');
  return '<section class="card lvl '+L.c+'"><div class="row"><b>'+dayLabel(ds)+'</b><span class="tag">'+L.i+' '+L.n+'</span></div>'+(inf.reasons.length?'<p class="small muted" style="margin:8px 0 0">'+inf.reasons.join('<br>')+'</p>':'')+(rows?'<ul class="lst">'+rows+'</ul>':(hasAuto&&E.auto?'<p class="small muted" style="margin:8px 0 0">Sin noticias de impacto en el calendario automático.</p>':''))+'<div class="acts" style="margin-top:10px">'+adds+(hasAuto&&!E.auto?'<button class="btn sm" data-n="reset|'+ds+'">Volver al automático</button>':'')+'</div>'+(hasAuto&&E.auto&&rows?'<p class="small muted" style="margin:8px 0 0">Datos automáticos. Si cambias algo, este día pasa a ser manual.</p>':'')+'</section>';
}
function renderNoticias(){
  const N=newsState(),today=todayES(),w=dowOf(today),wk=(w===6||w===0);
  const base=wk?mondayOf(addD(today,w===6?2:1)):mondayOf(today),mon=addD(base,7*newsOff),days=[0,1,2,3,4].map(i=>addD(mon,i));
  const rev=N.reviewed[mon];
  const A=autoNews(),hasAuto=A.weeks.includes(mon);
  const upd=A.updated?new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:TZ_ES}).format(new Date(A.updated)):null;
  $('#view').innerHTML='<div class="wrap">'+header('Todas las horas en España','Semana de noticias')+'<div class="stack">'+
   '<div class="card'+(hasAuto?' lvl ok':'')+'"><h3>Calendario automático</h3>'+(hasAuto?'<p class="small" style="margin:0">Esta semana viene <b>cargada sola</b> (solo USD de impacto medio y alto, de ForexFactory). Actualizado el '+upd+'. No tienes que hacer nada; si algo no cuadra, tócalo y corrígelo.</p>':'<p class="small muted" style="margin:0">'+(upd?'El calendario automático (actualizado el '+upd+') aún no tiene esta semana. ':'Todavía no hay calendario automático en esta copia de la app. ')+'Puedes cargarla a mano: abre <a href="https://www.forexfactory.com" target="_blank" rel="noopener" style="color:var(--yellow)">forexfactory.com</a> en hora de Nueva York, toca FOMC, NFP, CPI u Otra en cada día y pulsa «Semana revisada».</p>')+
   '<div class="acts" style="margin-top:12px"><button class="btn" data-n="ics">Añadir la semana al calendario del móvil</button></div><p class="small muted" style="margin:8px 0 0">Descarga un archivo que tu calendario abre. Crea la sesión de cada día y las noticias, con aviso antes (15 min la sesión, 10 min cada noticia).</p></div>'+
   '<div class="row"><button class="btn sm" data-n="off|-1">← Anterior</button><b>Semana del '+dayLabel(mon)+'</b><button class="btn sm" data-n="off|1">Siguiente →</button></div>'+(newsOff?'<button class="btn sm" data-n="off|0">Volver a la semana actual</button>':'')+
   (rev?'<p style="margin:0">✅ Semana revisada el <b>'+new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:TZ_ES}).format(rev)+'</b>. <button class="btn sm" data-n="rev|0">Reabrir</button></p>':'<div class="acts"><button class="btn pri" data-n="rev|1">Marcar semana revisada</button></div>')+
   days.map(weekDayHTML).join('')+
   '<p class="small muted">Los festivos de EE. UU. se calculan por reglas: confírmalos siempre en ForexFactory. La ventana de «no entrar» es de '+NEWS_MARGIN+' minutos antes de la noticia. 🟢 normal · 🟡 con cuidado · 🔴 no operar · ⚫ mercado cerrado · ⚪ sin datos.</p></div></div>';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-n]');if(!b)return;
  const p=b.dataset.n.split('|'),N=newsState(),mon=(()=>{const t=todayES(),w=dowOf(t),wk=(w===6||w===0);return addD(wk?mondayOf(addD(t,w===6?2:1)):mondayOf(t),7*newsOff);})();
  if(p[0]==='add'){ensureManual(p[1]).push({k:p[2],t:KINDS[p[2]].t});}
  else if(p[0]==='del'){ensureManual(p[1]).splice(+p[2],1);}
  else if(p[0]==='reset'){delete N.days[p[1]];}
  else if(p[0]==='ics'){downloadICS(mon);return;}
  else if(p[0]==='rev'){if(p[1]==='1')N.reviewed[mon]=Date.now();else delete N.reviewed[mon];}
  else if(p[0]==='off'){newsOff=p[1]==='0'?0:newsOff+(+p[1]);renderNoticias();return;}
  saveCfg();const y=scrollY;renderNoticias();scrollTo(0,y);
});
document.addEventListener('change',e=>{
  const i=e.target.closest('[data-nev]');if(!i)return;
  const p=i.dataset.nev.split('|'),ev=ensureManual(p[0])[+p[1]];
  if(ev){ev.t=i.value;saveCfg();const y=scrollY;renderNoticias();scrollTo(0,y);}
});

/* ---------- archivo de calendario (.ics) para el móvil ---------- */
const icsEsc=s=>String(s).replace(/\\/g,'\\\\').replace(/([,;])/g,'\\$1').replace(/\r?\n/g,'\\n');
const icsT=ms=>new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function weekICS(mon){
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Centro de Mando Trading//ES','CALSCALE:GREGORIAN','X-WR-CALNAME:Trading · sesión y noticias'];
  const stamp=icsT(Date.now());
  const ev=(uid,title,from,to,desc,alarmMin)=>{
    L.push('BEGIN:VEVENT','UID:'+uid+'@centro-de-mando','DTSTAMP:'+stamp,'DTSTART:'+icsT(from),'DTEND:'+icsT(to),'SUMMARY:'+icsEsc(title),'DESCRIPTION:'+icsEsc(desc||''));
    L.push('BEGIN:VALARM','TRIGGER:-PT'+alarmMin+'M','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(title),'END:VALARM','END:VEVENT');
  };
  for(let i=0;i<5;i++){
    const ds=addD(mon,i),inf=dayInfo(ds),lv=LV[inf.lv],s=zonedToUtc(ds,SES.start,TZ_NY),f=zonedToUtc(ds,SES.end,TZ_NY);
    const stop=inf.lv==='closed'||inf.lv==='no';
    ev(ds+'-sesion',(stop?'Hoy no se opera · ':'Sesión NY · ')+lv.n,s,f,inf.reasons.map(plainText).join('\n'),stop?30:15);
    inf.ev.forEach((e,k)=>{
      const t=zonedToUtc(ds,e.t,TZ_NY),w=evWindow(ds,e);
      ev(ds+'-noticia-'+k,plainText(evName(e))+' ('+w.es+')',t,t+15*60000,'No abras entradas de '+w.from+' a '+w.es+' (hora de España) y espera a ver qué hace.',10);
    });
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n')+'\r\n';
}
function downloadICS(mon){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([weekICS(mon)],{type:'text/calendar'}));
  a.download='trading-semana-'+mon+'.ics';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);toast('Calendario descargado: ábrelo para añadirlo');
}
