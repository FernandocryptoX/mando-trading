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
  const a={id:uid(),firm:(d.firm||'').trim()||'Prop firm',plan:(d.plan||'').trim()||'Cuenta',plat:(d.plat||'').trim(),size:num(d.size),date:d.date||dateOf(Date.now()),order:(d.order||'').trim(),price:price===null?paid:price,disc,paid,coupon:(d.coupon||'').trim(),pay:(d.pay||'').trim(),note:(d.note||'').trim(),mkt:d.mkt==='cfd'?'cfd':'fut',dd:num(d.dd),trail:d.trail!=='fijo',lockAt:num(d.lockAt),target:num(d.target),dayLim:num(d.dayLim),minDays:num(d.minDays),norms:(d.norms||'').trim(),st:'eval',hist:[],payouts:[],fees:[]};
  a.hist.push({ts:accTs(a.date),st:'eval',note:'Compra'});list.push(a);return a;
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
  let b=start,peak=start;days.forEach(d=>{b+=byD[d];if(b>peak)peak=b;});
  const bal=b-pay,dd=+a.dd||0;
  let min=null;if(dd){min=a.trail===false?start-dd:peak-dd;if(a.lockAt!=null&&a.lockAt!==''&&isFinite(+a.lockAt))min=Math.min(min,+a.lockAt);}
  const tn=byD[dateOf(Date.now())]||0,tg=+a.target>0?start+(+a.target):null;
  return{start,bal,peak,min,dd,margin:min==null?null:bal-min,target:tg,toTarget:tg==null?null:tg-bal,days:days.length,minDays:+a.minDays||0,dayLim:+a.dayLim||0,todayNet:tn,dayLeft:+a.dayLim>0?(+a.dayLim)+Math.min(0,tn):null};
}
function accStateHTML(a){
  if(!(a.st==='eval'||a.st==='funded'))return '';
  const s=accState(a);
  if(!s)return '<p class="small muted" style="margin:10px 0 0">Pon el tamaño de la cuenta en «Editar» para ver su balance y cuánto te queda.</p>';
  const warn=s.margin!=null&&s.dd&&s.margin<0.25*s.dd?'neg':'';
  let h='<div class="stats" style="margin-top:10px">'+stat('Balance',plain(s.bal))+(s.min!=null?stat('Mínimo permitido',plain(s.min))+stat('Te queda',plain(s.margin),warn):'')+'</div>';
  if(s.target!=null||s.minDays)h+='<div class="stats" style="margin-top:10px">'+(s.target!=null?stat('Objetivo',plain(s.target))+stat(s.toTarget<=0?'Objetivo':'Te falta',s.toTarget<=0?'Cumplido ✓':plain(s.toTarget),s.toTarget<=0?'pos':''):'')+stat('Días operados',s.days+(s.minDays?' de '+s.minDays:''))+'</div>';
  if(s.dayLim)h+='<div class="stats" style="margin-top:10px">'+stat('Pérdida diaria máx.',plain(s.dayLim))+stat('Hoy',s.todayNet?money(s.todayNet):'—',cls(s.todayNet))+stat('Hoy te quedan',plain(s.dayLeft),s.dayLeft<0.25*s.dayLim?'neg':'')+'</div>';
  if(s.min!=null&&s.target!=null&&s.target>s.min){const sp=v=>Math.max(0,Math.min(100,100*(v-s.min)/(s.target-s.min))).toFixed(1);
    h+='<div class="rng"><u style="left:'+sp(s.start)+'%"></u><i style="left:'+sp(s.bal)+'%"></i></div><div class="row small muted"><span>mínimo '+plain(s.min)+'</span><span>objetivo '+plain(s.target)+'</span></div>';}
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
     '<div class="acts" style="margin-top:12px">'+(a.st==='eval'?bt('funded','La pasé a funded')+bt('lost','La perdí'):'')+(a.st==='funded'?bt('lost','La perdí')+bt('closed','Cerrar'):'')+((a.st==='lost'||a.st==='closed')?bt('eval','Reabrir'):'')+((a.st==='eval'||a.st==='funded')?bt('day','Día sin detalle')+bt('sync','Cuadrar balance'):'')+bt('pay','Anotar cobro')+bt('fee','Anotar gasto')+bt('edit','Editar')+bt('del','Borrar')+'</div>'+
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
  dialog('<h2 style="font-size:28px">'+(a.id?'Editar cuenta':'Nueva cuenta')+'</h2><div class="fgrid">'+
   '<label class="field">Prop firm<input id="aF" value="'+v(a.firm)+'" placeholder="Lucid"></label><label class="field">Plan<input id="aP" value="'+v(a.plan)+'" placeholder="LucidFlex 50K"></label>'+
   '<label class="field">Plataforma<input id="aPl" value="'+v(a.plat)+'"></label><label class="field">Tamaño de cuenta ($)<input id="aS" inputmode="decimal" value="'+v(a.size)+'"></label>'+
   '<label class="field">Fecha de compra<input id="aD" type="date" value="'+v(a.date||dateOf(Date.now()))+'"></label><label class="field">Nº de pedido<input id="aO" value="'+v(a.order)+'"></label>'+
   '<label class="field">Precio ($)<input id="aPr" inputmode="decimal" value="'+v(a.price)+'"></label><label class="field">Descuento ($)<input id="aDi" inputmode="decimal" value="'+v(a.disc)+'"></label>'+
   '<label class="field">Pagado ($)<input id="aPa" inputmode="decimal" value="'+v(a.paid)+'" placeholder="precio − descuento"></label><label class="field">Cupón<input id="aC" value="'+v(a.coupon)+'"></label>'+
   '<label class="field">Método de pago<input id="aMe" value="'+v(a.pay)+'"></label><label class="field">Nota<input id="aN" value="'+v(a.note)+'"></label></div>'+'<h3 style="margin:16px 0 8px">Reglas de la cuenta</h3><div class="fgrid"><label class="field">Mercado<select id="aMk" style="'+selStyle+'"><option value="fut"'+(a.mkt==='cfd'?'':' selected')+'>Futuros (MNQ)</option><option value="cfd"'+(a.mkt==='cfd'?' selected':'')+'>CFDs (oro y divisas)</option></select></label>'+'<label class="field">Pérdida máxima ($)<input id="aDd" inputmode="decimal" value="'+v(a.dd)+'" placeholder="2000"></label>'+'<label class="field">El mínimo…<select id="aTr" style="'+selStyle+'"><option value="sigue"'+(a.trail===false?'':' selected')+'>sigue al máximo del cierre</option><option value="fijo"'+(a.trail===false?' selected':'')+'>es fijo</option></select></label>'+'<label class="field">Deja de subir en ($, opcional)<input id="aLk" inputmode="decimal" value="'+v(a.lockAt)+'"></label>'+'<label class="field">Objetivo de beneficio ($)<input id="aTg" inputmode="decimal" value="'+v(a.target)+'" placeholder="3000"></label>'+'<label class="field">Pérdida diaria máx. ($)<input id="aDl" inputmode="decimal" value="'+v(a.dayLim)+'" placeholder="1200"></label>'+'<label class="field">Días mínimos<input id="aMd" inputmode="decimal" value="'+v(a.minDays)+'"></label></div>'+'<label class="field" style="margin-top:10px">Normas de la cuenta (texto libre)<textarea id="aNo" style="min-height:70px;background:var(--page2);border:1px solid var(--line);border-radius:5px;padding:8px 12px">'+esc(a.norms||'')+'</textarea></label>',
   [{label:'Cancelar'},{label:'Guardar',primary:true,run:()=>{
     const g=id=>document.getElementById(id).value,d={firm:g('aF'),plan:g('aP'),plat:g('aPl'),size:g('aS'),date:g('aD'),order:g('aO'),price:g('aPr'),disc:g('aDi'),paid:g('aPa'),coupon:g('aC'),pay:g('aMe'),note:g('aN'),mkt:g('aMk'),dd:g('aDd'),trail:g('aTr'),lockAt:g('aLk'),target:g('aTg'),dayLim:g('aDl'),minDays:g('aMd'),norms:g('aNo')};
     const acc=accData();
     if(a.id){const t=acc.list.find(x=>x.id===a.id);if(t){const n=accCreate([],d);['firm','plan','plat','size','date','order','price','disc','paid','coupon','pay','note','mkt','dd','trail','lockAt','target','dayLim','minDays','norms'].forEach(k=>{t[k]=n[k];});}}
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
  return '<section class="card"><div class="row"><h3 style="margin:0">Banca</h3><a class="small" href="#banca" style="color:var(--yellow)">Abrir</a></div><div class="stats" style="margin-top:10px">'+stat('Cuentas activas',s.eval+s.funded)+stat('Gastado',plain(s.spent))+stat('Neto',L.length?money(s.net):'—',cls(s.net))+'</div>'+accActiveList().map(a=>({a,s:accState(a)})).filter(x=>x.s&&(x.s.min!=null||x.s.dayLim)).map(x=>'<div class="row small" style="margin-top:8px"><span>'+esc(x.a.plan)+'</span><span>'+plain(x.s.bal)+(x.s.margin!=null?' · te quedan <b class="'+(x.s.dd&&x.s.margin<0.25*x.s.dd?'neg':'')+'">'+plain(x.s.margin)+'</b>':'')+'</span></div>').join('')+'</section>';
}
