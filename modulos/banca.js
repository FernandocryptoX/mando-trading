/* Banca: cuentas de prop firm, cobros, gastos y retorno por prop firm. Datos en S.cfg.acc.list. */

const ACC_ST={eval:{i:'🟡',n:'En evaluación'},funded:{i:'🟢',n:'Funded'},lost:{i:'🔴',n:'Perdida'},closed:{i:'⚪',n:'Cerrada'}};
function accData(){const c=S.cfg;c.acc=c.acc||{};c.acc.list=(c.acc.list||[]).map(x=>Object.assign({hist:[],payouts:[],fees:[]},x));return c.acc;}
const accSum=a=>(a||[]).reduce((x,y)=>x+(+y.amt||0),0);
const accTs=v=>{const t=Date.parse(String(v||'')+'T12:00:00');return isFinite(t)?t:Date.now();};
function accStats(list){
  const spent=list.reduce((x,a)=>x+(+a.paid||0)+accSum(a.fees),0),got=list.reduce((x,a)=>x+accSum(a.payouts),0);
  return{n:list.length,spent,got,net:got-spent,eval:list.filter(a=>a.st==='eval').length,funded:list.filter(a=>a.st==='funded').length,lost:list.filter(a=>a.st==='lost').length,passed:list.filter(a=>a.hist.some(h=>h.st==='funded')).length};
}
function accCreate(list,d){
  const price=num(d.price),disc=num(d.disc)||0;let paid=num(d.paid);if(paid===null)paid=price!==null?Math.max(0,price-disc):0;
  const a={id:uid(),firm:(d.firm||'').trim()||'Prop firm',plan:(d.plan||'').trim()||'Cuenta',plat:(d.plat||'').trim(),size:num(d.size),date:d.date||dateOf(Date.now()),order:(d.order||'').trim(),price:price===null?paid:price,disc,paid,coupon:(d.coupon||'').trim(),pay:(d.pay||'').trim(),note:(d.note||'').trim(),mkt:d.mkt==='cfd'?'cfd':'fut',dd:num(d.dd),trail:d.trail!=='fijo',lockAt:num(d.lockAt),lossN:num(d.lossN)||4,target:num(d.target),dayLim:num(d.dayLim),dayPct:num(d.dayPct),minDays:num(d.minDays),norms:(d.norms||'').trim(),live:d.trail==='vivo',maxRisk:num(d.maxRisk),cons:num(d.cons),profDay:num(d.profDay),firstPay:num(d.firstPay),payEvery:num(d.payEvery),split:num(d.split),st:(d.st==='funded'?'funded':'eval'),hist:[],payouts:[],fees:[]};
  a.hist.push({ts:accTs(a.date),st:a.st,note:'Compra'});list.push(a);return a;
}
/* ---------- instrumentos por tipo de cuenta ---------- */
const INSTR_MKT={fut:['MNQ'],cfd:['XAUUSD','EURUSD','GBPUSD']};
const instrFor=id=>{const a=id?accData().list.find(x=>x.id===id):null;return INSTR_MKT[a&&a.mkt==='cfd'?'cfd':'fut'];};

/* ---------- estado de una cuenta: balance, mínimo permitido, objetivo, días y límite diario ---------- */
function accState(a){
  const start=+a.size||0;if(!start)return null;
  const T=Object.values(S.trades).filter(t=>t.acc===a.id&&t.res!=null),byD={};
  T.forEach(t=>{byD[t.date]=(byD[t.date]||0)+t.res;});
  const days=Object.keys(byD).sort(),pay=a.st==='funded'?accSum(a.payouts):0;
  const today=dateOf(Date.now());let b=start,peak=start;days.forEach(d=>{b+=byD[d];if((a.live||d<today)&&b>peak)peak=b;});   // el mínimo solo sube al CIERRE del día: lo de hoy no cuenta aún
  const bal=b-pay,dd=+a.dd||0;
  let min=null;if(dd){min=a.trail===false?start-dd:peak-dd;if(a.lockAt!=null&&a.lockAt!==''&&isFinite(+a.lockAt))min=Math.min(min,+a.lockAt);}
  const tn0=byD[today]||0,sod=bal-tn0,dlim=+a.dayPct>0?Math.round(sod*(+a.dayPct))/100:(+a.dayLim||0);
  const tn=byD[today]||0,tg=+a.target>0?start+(+a.target):null,N=+a.lossN>0?+a.lossN:4,margin=min==null?null:bal-min,dl=dlim>0?dlim+Math.min(0,tn):null;
  let sug=null;if(margin!=null){sug=margin>0?margin/N:0;if(dl!=null)sug=Math.min(sug,dl);sug=Math.max(0,Math.floor(sug));}
  const mr=+a.maxRisk>0?+a.maxRisk:null;if(mr!=null)sug=sug==null?mr:Math.min(sug,mr);
  const pos=Object.values(byD).filter(v=>v>0),best=pos.length?Math.max(...pos):0,total=b-start;
  const cons=+a.cons>0?{pct:total>0?100*best/total:null,lim:+a.cons,best,total,need:Math.max(0,best/(+a.cons/100)-total)}:null;
  const pdT=+a.profDay>0?+a.profDay:0.0001,profDays=Object.values(byD).filter(v=>v>=pdT).length;
  let nextPay=null;if(+a.firstPay>0||+a.payEvery>0){const last=(a.payouts||[]).reduce((m,p)=>Math.max(m,p.ts),0);nextPay=last?last+(+a.payEvery||10)*86400000:accTs(a.date)+(+a.firstPay||15)*86400000;}
  return{N,sug,cons,profDays,maxRisk:mr,nextPay,start,bal,peak,min,dd,margin:min==null?null:bal-min,target:tg,toTarget:tg==null?null:tg-bal,days:days.length,minDays:+a.minDays||0,dayLim:dlim,dayFloor:dlim>0?sod-dlim:null,sod,todayNet:tn,dayLeft:dl};
}
function accStateHTML(a){
  if(!(a.st==='eval'||a.st==='funded'))return '';
  const s=accState(a);
  if(!s)return '<p class="small muted" style="margin:10px 0 0">Pon el tamaño de la cuenta en «Editar» para ver su balance y cuánto te queda.</p>';
  const warn=s.margin!=null&&s.dd&&s.margin<0.25*s.dd?'neg':'';
  let h='<div class="stats" style="margin-top:10px">'+stat('Balance',plain(s.bal))+(s.min!=null?stat('Mínimo permitido',plain(s.min))+stat('Te queda',plain(s.margin),warn):'')+'</div>';
  if(s.target!=null||s.minDays)h+='<div class="stats" style="margin-top:10px">'+(s.target!=null?stat('Objetivo',plain(s.target))+stat(s.toTarget<=0?'Objetivo':'Te falta',s.toTarget<=0?'Cumplido ✓':plain(s.toTarget),s.toTarget<=0?'pos':''):'')+(+a.profDay>0?stat('Días rentables',s.profDays+(s.minDays?' de '+s.minDays:'')):stat('Días operados',s.days+(s.minDays?' de '+s.minDays:'')))+'</div>';
  if(s.sug!=null)h+='<div class="insight '+(s.sug>0?'':'bad')+'" style="margin-top:10px">'+(s.sug>0?'Riesgo máximo sugerido en la siguiente operación: <b>'+plain(s.sug)+'</b>. '+(s.maxRisk?'Tope de la cuenta: '+plain(s.maxRisk)+' por operación. ':'')+'Así aguantarías '+s.N+' pérdidas seguidas antes de llegar al mínimo.':'<b>No operes:</b> estás en el mínimo permitido o en el límite del día.')+'</div>';
  if(s.dayLim)h+='<div class="stats" style="margin-top:10px">'+stat('Pérdida diaria máx.',plain(s.dayLim))+stat('Hoy',s.todayNet?money(s.todayNet):'—',cls(s.todayNet))+stat('Hoy te quedan',plain(s.dayLeft),s.dayLeft<0.25*s.dayLim?'neg':'')+'</div>'+(s.dayFloor!=null?'<p class="small muted" style="margin:6px 0 0">Hoy se rompe la cuenta si baja de <b>'+plain(s.dayFloor)+'</b>'+(a.dayPct?' ('+a.dayPct+' % del balance con el que empezó el día)':'')+'.</p>':'');
  if(s.min!=null&&s.target!=null&&s.target>s.min){const sp=v=>Math.max(0,Math.min(100,100*(v-s.min)/(s.target-s.min))).toFixed(1);
    h+='<div class="rng"><u style="left:'+sp(s.start)+'%"></u><i style="left:'+sp(s.bal)+'%"></i></div><div class="row small muted"><span>mínimo '+plain(s.min)+'</span><span>objetivo '+plain(s.target)+'</span></div>';}
  if(s.cons)h+='<div class="stats" style="margin-top:10px">'+stat('Mejor día',plain(s.cons.best))+stat('Consistencia',s.cons.pct==null?'—':s.cons.pct.toFixed(1).replace('.',',')+' %',s.cons.pct!=null&&s.cons.pct>s.cons.lim?'neg':'')+stat('Máximo permitido',s.cons.lim+' %')+'</div>'+(s.cons.pct!=null&&s.cons.pct>s.cons.lim?'<p class="small" style="margin:6px 0 0">Para cumplirla te faltan <b>'+plain(s.cons.need)+'</b> de beneficio más, sin otro día mejor.</p>':'');
  if(s.nextPay){const dd=Math.ceil((s.nextPay-Date.now())/86400000);h+='<p class="small" style="margin:10px 0 0"><b>Cobro:</b> '+(dd<=0?'ya puedes pedirlo si cumples el resto':'podrás pedirlo el '+new Date(s.nextPay).toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' (en '+dd+' días)')+(a.split?' · tu parte '+a.split+' %':'')+'</p>';}
  if(a.norms)h+='<p class="small" style="margin:10px 0 0"><b>Normas:</b> '+esc(a.norms)+'</p>';
  return h;
}

/* ---------- días sin detalle y cuadrar con el balance real ---------- */
function sdSave(a,date,res,note,id,cr){
  putTrade({id:id||uid(),ts:accTs(date),date,time:'',side:'',instr:'',kind:a.st==='funded'?'fund':'eval',acc:a.id,res,r:null,risk:null,rr:null,v:0,sd:1,setup:[],errs:[],note:note||'Día sin detalle',cr:cr||Date.now()});
}
const selStyle='min-height:44px;background:var(--page2);border:1px solid var(--line);border-radius:5px;padding:8px 12px';
function sdDialog(a,tr){
  const today=dateOf(Date.now());
  dialog('<h2 style="font-size:22px">'+(tr?'Editar día sin detalle':'Día sin detalle')+'</h2><p class="small muted">Para un día del que solo sabes cuánto ganaste o perdiste en total. Cuenta en el balance y en el calendario, pero no en las estadísticas de errores ni de horas.</p><div class="fgrid"><label class="field">Fecha<input id="sdD" type="date" value="'+(tr?tr.date:today)+'"></label><label class="field">Resultado<select id="sdS" style="'+selStyle+'"><option value="1"'+(tr&&tr.res<0?'':' selected')+'>Ganancia</option><option value="-1"'+(tr&&tr.res<0?' selected':'')+'>Pérdida</option></select></label><label class="field">Importe ($)<input id="sdA" inputmode="decimal" value="'+(tr?Math.abs(tr.res):'')+'" placeholder="300"></label></div>',
    [{label:'Cancelar'}].concat(tr?[{label:'Borrar',run:()=>{delTrade(tr.id);render();toast('Día borrado');}}]:[]).concat([{label:'Guardar',primary:true,run:()=>{
      const g=id=>document.getElementById(id).value,amt=num(g('sdA'));
      if(!(amt>0)||!g('sdD')){toast('Pon la fecha y un importe mayor que 0');return false;}
      sdSave(a,g('sdD'),(+g('sdS'))*amt,'Día sin detalle',tr&&tr.id,tr&&tr.cr);render();toast('Día guardado');}}]));
}
/* ---------- cargar días anteriores (una línea por día: fecha e importe) ---------- */
function parseDays(txt){
  const out=[],yr=dateOf(Date.now()).slice(0,4);
  String(txt||'').split(/\n/).forEach(line=>{
    line=line.trim();if(!line)return;
    let d=null,rest=line,m=line.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if(m){d=m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);rest=line.replace(m[0],' ');}
    else if((m=line.match(/(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/))){const y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):yr;d=y+'-'+pad(+m[2])+'-'+pad(+m[1]);rest=line.replace(m[0],' ');}
    if(!d)return;
    const t=rest.replace(/[$€\s]/g,'').replace(/−/g,'-').match(/[-+]?\d+(?:[.,]\d+)*/);if(!t)return;
    let s=t[0];if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');
    const v=parseFloat(s);if(isFinite(v)&&v!==0)out.push([d,Math.round(v*100)/100]);
  });
  return out;
}
function histDialog(a){
  dialog('<h2 style="font-size:22px">Cargar días anteriores</h2><p class="small muted">Para los días de esta cuenta que no anotaste. Una línea por día: la fecha y lo que ganaste o perdiste ese día. Por ejemplo <b>17/11 125,70</b> o <b>20/11 −34,5</b>. Entran como «día sin detalle» y ya cuentan para el balance, la consistencia y los días rentables.</p><textarea id="hsT" style="width:100%;min-height:140px;background:var(--page2);color:var(--ink);border:1px solid var(--line);border-radius:5px;padding:10px;font:13px var(--mono)" placeholder="17/11 125,70&#10;20/11 120,20"></textarea><p class="small muted" style="margin:8px 0 0">Si un día ya lo cargaste, se sustituye. Al terminar usa «Cuadrar balance» con el balance real para ajustar lo que quede.</p>',
    [{label:'Cancelar'},{label:'Cargar',primary:true,run:()=>{
      const L=parseDays(document.getElementById('hsT').value);
      if(!L.length){toast('No he entendido ninguna línea: fecha e importe');return false;}
      L.forEach(x=>{const id='sd-'+a.id+'-'+x[0];sdSave(a,x[0],x[1],'Historial anterior',id,S.trades[id]&&S.trades[id].cr);});
      render();const s=accState(a);toast(L.length+(L.length===1?' día cargado':' días cargados')+(s?' · balance '+plain(s.bal):''));}}]);
}
function syncDialog(a){
  const s=accState(a);if(!s){toast('Pon primero el tamaño de la cuenta en «Editar»');return;}
  dialog('<h2 style="font-size:22px">Cuadrar con tu balance real</h2><p class="small muted">Ahora la app calcula <b>'+plain(s.bal)+'</b>. Escribe el balance que ves en la plataforma y creo un día sin detalle con la diferencia.</p><div class="fgrid"><label class="field">Balance real ($)<input id="syB" inputmode="decimal"></label><label class="field">Fecha del ajuste<input id="syD" type="date" value="'+dateOf(Date.now())+'"></label></div>',
    [{label:'Cancelar'},{label:'Guardar',primary:true,run:()=>{
      const real=num(document.getElementById('syB').value),d=document.getElementById('syD').value;
      if(real==null||!d){toast('Pon el balance y la fecha');return false;}
      const diff=Math.round((real-s.bal)*100)/100;
      if(Math.abs(diff)<0.005){toast('Ya cuadra, no hace falta ajustar');return;}
      sdSave(a,d,diff,'Ajuste de balance');render();toast('Ajuste de '+money(diff)+' guardado');}}]);
}

/* ---------- carga única de los días 18–20 de LucidFlex 50K ---------- */
const LUCID_DAYS=[];
const lucidAcc=()=>{const L=accData().list,f=x=>/lucid/i.test(x.firm+' '+x.plan);return L.find(x=>f(x)&&/50/.test(x.plan))||L.find(f);};
const lucidPending=()=>{const a=lucidAcc();return a&&!LUCID_DAYS.every(d=>S.trades['sd-lucid-'+d[0]])?a:null;};
function lucidDays(){
  const a=lucidAcc();if(!a){toast('No encuentro la cuenta LucidFlex 50K en Banca');return;}
  const rows=LUCID_DAYS.map(d=>{const ex=Object.values(S.trades).filter(t=>t.acc===a.id&&t.date===d[0]&&t.res!=null&&t.id!=='sd-lucid-'+d[0]).reduce((x,t)=>x+t.res,0);return{d:d[0],tot:d[1],ex,add:Math.round((d[1]-ex)*100)/100};});
  dialog('<h2 style="font-size:22px">Cargar tus días de LucidFlex 50K</h2><p class="small muted">Resultado real de cada día, lo que ya tienes anotado y lo que se añade como «día sin detalle». Así el balance sale igual que en la plataforma.</p>'+rows.map(r=>'<div class="srow"><span class="sn">'+esc(niceDate(r.d))+'</span><span class="sm">real '+money(r.tot)+' · ya anotado '+money(r.ex)+'</span><b class="'+cls(r.add)+'">'+(Math.abs(r.add)<0.005?'—':money(r.add))+'</b></div>').join('')+'<p class="small muted" style="margin:10px 0 0">También dejo puestas las reglas de la cuenta: pérdida máxima 2.000 $ que sigue al máximo del cierre, objetivo 3.000 $ y pérdida diaria 1.200 $ (si no tenías otras). Se pueden cambiar en «Editar».</p>',
    [{label:'Cancelar'},{label:'Cargar',primary:true,run:()=>{
      rows.forEach(r=>{const id='sd-lucid-'+r.d;if(Math.abs(r.add)>=0.005)sdSave(a,r.d,r.add,'Día sin detalle',id,S.trades[id]&&S.trades[id].cr);else if(S.trades[id])delTrade(id);});
      if(!+a.size)a.size=50000;if(a.dd==null)a.dd=2000;if(a.trail==null)a.trail=true;if(a.target==null)a.target=3000;if(a.dayLim==null)a.dayLim=1200;if(!a.mkt)a.mkt='fut';
      if(a.st!=='eval'&&a.st!=='funded'){/* se queda como esté */}
      saveCfg();renderBanca();toast('Días cargados');}}]);
}

function accCurve(a){
  const T=Object.values(S.trades).filter(t=>t.acc===a.id&&t.res!=null).sort((x,y)=>x.ts-y.ts);
  if(T.length<2)return '';
  let c=0;const g=agg(T);
  return '<div style="margin-top:12px"><div class="small muted" style="margin-bottom:4px">Evolución de esta cuenta · '+g.c+' operaciones'+(g.win==null?'':' · '+Math.round(g.win)+' % ganadas')+'</div>'+chartLine([0].concat(T.map(t=>(c+=t.res))))+'</div>';
}
/* plantillas con las reglas oficiales (Wall Street Funded: faq.wsfunded.com; Lucid: ver nota). Los $ son el % de la regla sobre el tamaño. */
const ACC_TPL={
  ip25:{firm:'Wall Street Funded',plan:'Instant Funded Pro 25K',size:25000,mkt:'cfd',st:'funded',dd:1250,trail:'vivo',target:'',dayLim:'',dayPct:3,minDays:4,profDay:125,cons:15,maxRisk:250,firstPay:15,payEvery:10,split:80,lossN:4,norms:'Pérdida diaria 3 % del balance con el que empieza el día (a las 17:00 de Nueva York). Pérdida máxima 5 % con trailing. Mejor día máx. 15 % del beneficio total. 4 días rentables de al menos 0,5 %. Máx. 1 % de riesgo por operación (a la segunda vez, cuenta cerrada). Sin operar 4 min antes y después de noticias rojas.'},
  r50:{firm:'Wall Street Funded',plan:'Rapid One Phase 50K',size:50000,mkt:'cfd',st:'eval',dd:3000,trail:'fijo',target:5000,dayLim:'',dayPct:4,minDays:4,profDay:'',cons:'',maxRisk:1000,firstPay:30,payEvery:10,split:80,lossN:4,norms:'Objetivo 10 %, sin límite de tiempo. Pérdida diaria 4 % del balance con el que empieza el día. Pérdida máxima 6 % estática sobre el balance inicial. Stop loss puesto antes de 2 minutos. Inactividad máxima 30 días.'},
  l50:{firm:'Lucid',plan:'LucidFlex 50K',size:50000,mkt:'fut',st:'eval',dd:2000,trail:'sigue',target:3000,dayLim:'',minDays:'',profDay:'',cons:'',maxRisk:'',firstPay:'',payEvery:'',split:'',lossN:4,norms:'Pérdida máxima 2.000 $ con trailing al cierre del día. Sin pérdida diaria.'}
};
document.addEventListener('change',e=>{
  if(!e.target||e.target.id!=='aTpl'||!ACC_TPL[e.target.value])return;
  const t=ACC_TPL[e.target.value],m={aF:'firm',aP:'plan',aS:'size',aMk:'mkt',aSt:'st',aDd:'dd',aTr:'trail',aTg:'target',aDl:'dayLim',aDp:'dayPct',aMd:'minDays',aPd:'profDay',aCo:'cons',aMr:'maxRisk',aFp:'firstPay',aPe:'payEvery',aSp:'split',aLn:'lossN',aNo:'norms'};
  Object.keys(m).forEach(id=>{const el=document.getElementById(id);if(el)el.value=t[m[id]]===undefined?'':t[m[id]];});
});
function accActiveList(){return accData().list.filter(a=>a.st==='eval'||a.st==='funded').sort((x,y)=>accTs(y.date)-accTs(x.date));}

/* ventana de diálogo sencilla; una acción que devuelve false deja el diálogo abierto */
function dialog(html,actions){
  const old=document.getElementById('dlgWrap');if(old)old.remove();
  const w=document.createElement('div');w.id='dlgWrap';w.style.cssText='position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.65)';
  w.innerHTML='<div class="card" role="dialog" aria-modal="true" style="max-width:460px;width:100%;max-height:90%;overflow:auto">'+html+'<div class="acts" style="justify-content:flex-end;margin-top:14px"></div></div>';
  actions.forEach(a=>{const b=document.createElement('button');b.className='btn'+(a.primary?' pri':'');b.textContent=a.label;b.onclick=()=>{if(a.run&&a.run()===false)return;w.remove();};w.querySelector('.acts').appendChild(b);});
  document.body.appendChild(w);
}

function renderBanca(){
  const acc=accData(),L=acc.list.slice().sort((x,y)=>accTs(y.date)-accTs(x.date)),S0=accStats(L);
  const monthKey=todayES().slice(0,7);
  const cobradoMes=L.reduce((x,a)=>x+a.payouts.filter(p=>dateOf(p.ts).slice(0,7)===monthKey).reduce((y,p)=>y+p.amt,0),0);
  const firms={};L.forEach(a=>{(firms[a.firm]=firms[a.firm]||[]).push(a);});
  const firmRows=Object.keys(firms).map(f=>{const s=accStats(firms[f]);return '<div class="srow"><span class="sbar" style="width:100%;background:'+(s.net>=0?'var(--good)':'var(--bad)')+'"></span><span class="sn">'+esc(f)+'</span><span class="sm">'+s.n+' cuenta'+(s.n>1?'s':'')+' · '+s.passed+' funded</span><b class="'+cls(s.net)+'">'+money(s.net)+'</b></div>';}).join('');
  const goal=S.cfg.goal,pct=Math.max(0,Math.min(100,100*cobradoMes/goal));
  const card=a=>{
    const t=ACC_ST[a.st]||ACC_ST.eval,pays=accSum(a.payouts),fees=accSum(a.fees),net=pays-(+a.paid||0)-fees;
    const hist=a.hist.slice().reverse().map(h=>'<li><span class="muted">'+new Date(h.ts).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})+'</span> · '+((ACC_ST[h.st]||{}).i||'')+' '+esc((ACC_ST[h.st]||{}).n||h.st)+(h.note?' <span class="muted">· '+esc(h.note)+'</span>':'')+'</li>').join('');
    const movs=a.payouts.map(x=>({ts:x.ts,t:'💸 Cobro',amt:x.amt,note:x.note})).concat(a.fees.map(x=>({ts:x.ts,t:'🧾 Gasto',amt:-x.amt,note:x.note}))).sort((x,y)=>y.ts-x.ts).map(m=>'<li><span class="muted">'+new Date(m.ts).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})+'</span> · '+m.t+' <b class="'+(m.amt>=0?'pos':'neg')+'">'+money(m.amt)+'</b>'+(m.note?' <span class="muted">· '+esc(m.note)+'</span>':'')+'</li>').join('');
    const bt=(k,l)=>'<button class="btn sm" data-bk="'+k+'|'+a.id+'">'+l+'</button>';
    return '<section class="card" style="'+(a.st==='lost'||a.st==='closed'?'opacity:.8':'')+'"><div class="row"><b>'+esc(a.plan)+'</b><span class="tag">'+t.i+' '+t.n+'</span></div>'+
     '<p class="small muted" style="margin:4px 0 10px">'+[a.firm,a.mkt==='cfd'?'CFDs':'Futuros',a.size?plain(a.size)+' de cuenta':'',a.plat,'comprada el '+new Date(accTs(a.date)).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}),a.order?'pedido '+a.order:''].filter(Boolean).map(esc).join(' · ')+'</p>'+
     accStateHTML(a)+'<div class="stats" style="margin-top:10px"><div class="stat"><small>Pagado</small><b>'+plain(a.paid)+'</b></div><div class="stat"><small>Cobrado</small><b>'+plain(pays)+'</b></div><div class="stat"><small>Neto</small><b class="'+cls(net)+'">'+money(net)+'</b></div></div>'+
     (a.disc?'<p class="small muted" style="margin:8px 0 0">Precio '+plain(a.price)+' − descuento '+plain(a.disc)+(a.coupon?' ('+esc(a.coupon)+')':'')+'</p>':'')+
     (a.tv?'<p class="small muted" style="margin:8px 0 0">Saldo según Tradovate: <b>'+plain(a.tv.netLiq)+'</b> · P/L total '+money(a.tv.totalPL)+' ('+new Date(a.tv.ts).toLocaleDateString('es-ES',{day:'numeric',month:'short'})+')</p>':'')+
     accCurve(a)+'<div class="acts" style="margin-top:12px">'+(a.st==='eval'?bt('funded','La pasé a funded')+bt('lost','La perdí'):'')+(a.st==='funded'?bt('lost','La perdí')+bt('closed','Cerrar'):'')+((a.st==='lost'||a.st==='closed')?bt('eval','Reabrir'):'')+((a.st==='eval'||a.st==='funded')?bt('day','Día sin detalle')+bt('hist','Cargar días anteriores')+bt('sync','Cuadrar balance'):'')+'<button class="btn sm" data-act="dacc" data-v="'+a.id+'">Ver su diario</button>'+bt('pay','Anotar cobro')+bt('fee','Anotar gasto')+bt('edit','Editar')+bt('del','Borrar')+'</div>'+
     '<details style="margin-top:10px"><summary class="small muted">Historial ('+(a.hist.length+a.payouts.length+a.fees.length)+')</summary><ul class="lst small">'+hist+movs+'</ul></details>'+(a.note?'<p class="small muted" style="margin:8px 0 0">'+esc(a.note)+'</p>':'')+'</section>';
  };
  $('#view').innerHTML='<div class="wrap">'+header('Prop firms','Banca')+'<div class="stack">'+
   '<section class="card hl"><h3>Resumen</h3><div class="stats">'+stat('Gastado',plain(S0.spent))+stat('Cobrado',plain(S0.got))+stat('Neto',money(S0.net),cls(S0.net))+'</div>'+
   '<div class="stats" style="margin-top:10px">'+stat('Cuentas',S0.n)+stat('Activas',S0.eval+S0.funded)+stat('Pasaron a funded',S0.passed+' de '+S0.n)+'</div></section>'+
   '<section class="card"><h3>Cobrado este mes</h3><div class="row"><b style="font-size:22px">'+plain(cobradoMes)+'</b><span class="muted">de '+plain(goal)+'</span></div><div class="bar"><i style="width:'+pct.toFixed(1)+'%"></i></div><p class="small muted" style="margin:0">La meta mensual se cambia en «Más».</p></section>'+
   chartsBanca(L)+(firmRows?'<section class="card"><h3>Retorno por prop firm</h3>'+firmRows+'<p class="small muted" style="margin:10px 0 0">Neto = cobros − lo pagado − otros gastos. Una cuenta perdida o cerrada sigue contando.</p></section>':'')+
   '<div class="acts"><button class="btn pri" data-bk="new">Nueva cuenta</button></div>'+(lucidPending()?'<section class="card hl"><h3>Falta registrar</h3><p class="small" style="margin:0 0 10px">Tus días 18, 19 y 20 de noviembre en LucidFlex 50K no están en el Diario. Los cargo con su resultado real y dejo las reglas de la cuenta.</p><button class="btn pri" data-bk="lucid|x">Cargar esos días</button></section>':'')+
   (L.length?L.map(card).join(''):'<section class="card empty"><h2>Todavía no hay cuentas</h2><p class="muted">Anota cada cuenta de prop firm que compres para saber si el negocio sale a cuenta.</p></section>')+
   '</div></div>';
}
function accForm(a){
  a=a||{};const v=x=>x===null||x===undefined?'':esc(x);
  dialog('<h2 style="font-size:28px">'+(a.id?'Editar cuenta':'Nueva cuenta')+'</h2>'+(a.id?'':'<label class="field" style="margin-bottom:12px">Plantilla con las reglas oficiales<select id="aTpl" style="'+selStyle+'"><option value="">Ninguna: lo relleno yo</option>'+Object.keys(ACC_TPL).map(k=>'<option value="'+k+'">'+esc(ACC_TPL[k].plan)+'</option>').join('')+'</select></label>')+'<div class="fgrid">'+
   '<label class="field">Prop firm<input id="aF" value="'+v(a.firm)+'" placeholder="Lucid"></label><label class="field">Plan<input id="aP" value="'+v(a.plan)+'" placeholder="LucidFlex 50K"></label>'+
   '<label class="field">Plataforma<input id="aPl" value="'+v(a.plat)+'"></label><label class="field">Tamaño de cuenta ($)<input id="aS" inputmode="decimal" value="'+v(a.size)+'"></label>'+
   '<label class="field">Fecha de compra<input id="aD" type="date" value="'+v(a.date||dateOf(Date.now()))+'"></label><label class="field">Nº de pedido<input id="aO" value="'+v(a.order)+'"></label>'+
   '<label class="field">Precio ($)<input id="aPr" inputmode="decimal" value="'+v(a.price)+'"></label><label class="field">Descuento ($)<input id="aDi" inputmode="decimal" value="'+v(a.disc)+'"></label>'+
   '<label class="field">Pagado ($)<input id="aPa" inputmode="decimal" value="'+v(a.paid)+'" placeholder="precio − descuento"></label><label class="field">Cupón<input id="aC" value="'+v(a.coupon)+'"></label>'+
   '<label class="field">Método de pago<input id="aMe" value="'+v(a.pay)+'"></label><label class="field">Nota<input id="aN" value="'+v(a.note)+'"></label></div>'+'<h3 style="margin:16px 0 8px">Reglas de la cuenta</h3><div class="fgrid"><label class="field">Mercado<select id="aMk" style="'+selStyle+'"><option value="fut"'+(a.mkt==='cfd'?'':' selected')+'>Futuros (MNQ)</option><option value="cfd"'+(a.mkt==='cfd'?' selected':'')+'>CFDs (oro y divisas)</option></select></label>'+'<label class="field">Pérdida máxima ($)<input id="aDd" inputmode="decimal" value="'+v(a.dd)+'" placeholder="2000"></label>'+'<label class="field">El mínimo…<select id="aTr" style="'+selStyle+'"><option value="sigue"'+(a.trail===false||a.live?'':' selected')+'>sigue al máximo del cierre</option><option value="vivo"'+(a.live&&a.trail!==false?' selected':'')+'>sigue al máximo en tiempo real</option><option value="fijo"'+(a.trail===false?' selected':'')+'>es fijo</option></select></label>'+'<label class="field">Deja de subir en ($, opcional)<input id="aLk" inputmode="decimal" value="'+v(a.lockAt)+'"></label>'+'<label class="field">Objetivo de beneficio ($)<input id="aTg" inputmode="decimal" value="'+v(a.target)+'" placeholder="3000"></label>'+'<label class="field">Pérdida diaria máx. ($)<input id="aDl" inputmode="decimal" value="'+v(a.dayLim)+'" placeholder="1200"></label>'+
        '<label class="field">o en % del balance del día<input id="aDp" inputmode="decimal" value="'+v(a.dayPct)+'" placeholder="3"></label>'+'<label class="field">Días mínimos<input id="aMd" inputmode="decimal" value="'+v(a.minDays)+'"></label><label class="field">Pérdidas seguidas que quieres aguantar<input id="aLn" inputmode="decimal" value="'+v(a.lossN||4)+'"></label><label class="field">Riesgo máx. por operación ($)<input id="aMr" inputmode="decimal" value="'+v(a.maxRisk)+'"></label><label class="field">Consistencia: mejor día máx. (% del beneficio)<input id="aCo" inputmode="decimal" value="'+v(a.cons)+'"></label><label class="field">Día rentable desde ($)<input id="aPd" inputmode="decimal" value="'+v(a.profDay)+'"></label><label class="field">Primer cobro a los (días)<input id="aFp" inputmode="decimal" value="'+v(a.firstPay)+'"></label><label class="field">Cobros siguientes cada (días)<input id="aPe" inputmode="decimal" value="'+v(a.payEvery)+'"></label><label class="field">Tu parte del reparto (%)<input id="aSp" inputmode="decimal" value="'+v(a.split)+'"></label>'+(a.id?'':'<label class="field">Estado al empezar<select id="aSt" style="'+selStyle+'"><option value="eval">En evaluación</option><option value="funded">Funded (ya fondeada)</option></select></label>')+'</div>'+'<label class="field" style="margin-top:10px">Normas de la cuenta (texto libre)<textarea id="aNo" style="min-height:70px;background:var(--page2);border:1px solid var(--line);border-radius:5px;padding:8px 12px">'+esc(a.norms||'')+'</textarea></label>',
   [{label:'Cancelar'},{label:'Guardar',primary:true,run:()=>{
     const g=id=>document.getElementById(id).value,d={firm:g('aF'),plan:g('aP'),plat:g('aPl'),size:g('aS'),date:g('aD'),order:g('aO'),price:g('aPr'),disc:g('aDi'),paid:g('aPa'),coupon:g('aC'),pay:g('aMe'),note:g('aN'),mkt:g('aMk'),dd:g('aDd'),trail:g('aTr'),lockAt:g('aLk'),lossN:g('aLn'),maxRisk:g('aMr'),cons:g('aCo'),profDay:g('aPd'),firstPay:g('aFp'),payEvery:g('aPe'),split:g('aSp'),st:(document.getElementById('aSt')||{}).value,target:g('aTg'),dayLim:g('aDl'),dayPct:g('aDp'),minDays:g('aMd'),norms:g('aNo')};
     const acc=accData();
     if(a.id){const t=acc.list.find(x=>x.id===a.id);if(t){const n=accCreate([],d);['firm','plan','plat','size','date','order','price','disc','paid','coupon','pay','note','mkt','dd','trail','lockAt','lossN','live','maxRisk','cons','profDay','firstPay','payEvery','split','target','dayLim','dayPct','minDays','norms'].forEach(k=>{t[k]=n[k];});}}
     else accCreate(acc.list,d);
     saveCfg();renderBanca();toast('Cuenta guardada');
   }}]);
}
function accAct(s){
  const p=s.split('|'),k=p[0],acc=accData(),t=p[1]&&acc.list.find(x=>x.id===p[1]);
  if(k==='new'){accForm();return;}
  if(k==='lucid'){lucidDays();return;}
  if(k==='sdedit'){const tr=S.trades[p[1]],ac=tr&&acc.list.find(x=>x.id===tr.acc);if(ac)sdDialog(ac,tr);return;}
  if(!t)return;
  const today=dateOf(Date.now());
  if(k==='edit'){accForm(t);return;}
  if(k==='day'){sdDialog(t);return;}
  if(k==='hist'){histDialog(t);return;}
  if(k==='sync'){syncDialog(t);return;}
  if(k==='del'){dialog('<h2 style="font-size:28px">Borrar «'+esc(t.plan)+'»</h2><p>Se borra la cuenta con su historial, cobros y gastos. No se puede deshacer.</p>',[{label:'Cancelar'},{label:'Borrar',primary:true,run:()=>{acc.list=acc.list.filter(x=>x.id!==t.id);saveCfg();renderBanca();}}]);return;}
  if(ACC_ST[k]){
    dialog('<h2 style="font-size:28px">'+ACC_ST[k].i+' '+ACC_ST[k].n+'</h2><div class="fgrid"><label class="field">Fecha<input id="aD" type="date" value="'+today+'"></label><label class="field">Nota (opcional)<input id="aN" placeholder="'+(k==='lost'?'Qué pasó':'')+'"></label></div>',
     [{label:'Cancelar'},{label:'Guardar',primary:true,run:()=>{t.st=k;t.hist.push({ts:accTs(document.getElementById('aD').value),st:k,note:document.getElementById('aN').value.trim()});saveCfg();renderBanca();}}]);return;}
  if(k==='pay'||k==='fee'){
    dialog('<h2 style="font-size:28px">'+(k==='pay'?'💸 Anotar cobro':'🧾 Anotar gasto')+'</h2><div class="fgrid"><label class="field">Importe ($)<input id="aM" inputmode="decimal" placeholder="500"></label><label class="field">Fecha<input id="aD" type="date" value="'+today+'"></label><label class="field">Nota (opcional)<input id="aN" placeholder="'+(k==='pay'?'Primer payout':'Reset, activación…')+'"></label></div>',
     [{label:'Cancelar'},{label:'Guardar',primary:true,run:()=>{const v=num(document.getElementById('aM').value);if(!(v>0)){toast('Pon un importe mayor que 0');return false;}t[k==='pay'?'payouts':'fees'].push({ts:accTs(document.getElementById('aD').value),amt:v,note:document.getElementById('aN').value.trim()});saveCfg();renderBanca();}}]);
  }
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-bk]');if(b)accAct(b.dataset.bk);});

/* tarjeta resumen para Hoy */
function bancaCard(){
  const L=accData().list,s=accStats(L);
  return '<section class="card"><div class="row"><h3 style="margin:0">Banca</h3><a class="small" href="#banca" style="color:var(--yellow)">Abrir</a></div><div class="stats" style="margin-top:10px">'+stat('Cuentas activas',s.eval+s.funded)+stat('Gastado',plain(s.spent))+stat('Neto',L.length?money(s.net):'—',cls(s.net))+'</div>'+accActiveList().map(a=>({a,s:accState(a)})).filter(x=>x.s&&(x.s.min!=null||x.s.dayLim)).map(x=>'<div class="row small" style="margin-top:8px"><span>'+esc(x.a.plan)+'</span><span>'+plain(x.s.bal)+(x.s.margin!=null?' · te quedan <b class="'+(x.s.dd&&x.s.margin<0.25*x.s.dd?'neg':'')+'">'+plain(x.s.margin)+'</b>':'')+(x.s.sug!=null?' · riesgo máx. <b>'+plain(x.s.sug)+'</b>':'')+'</span></div>').join('')+'</section>';
}
