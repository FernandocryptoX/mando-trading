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
  const a={id:uid(),firm:(d.firm||'').trim()||'Prop firm',plan:(d.plan||'').trim()||'Cuenta',plat:(d.plat||'').trim(),size:num(d.size),date:d.date||dateOf(Date.now()),order:(d.order||'').trim(),price:price===null?paid:price,disc,paid,coupon:(d.coupon||'').trim(),pay:(d.pay||'').trim(),note:(d.note||'').trim(),st:'eval',hist:[],payouts:[],fees:[]};
  a.hist.push({ts:accTs(a.date),st:'eval',note:'Compra'});list.push(a);return a;
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
     '<p class="small muted" style="margin:4px 0 10px">'+[a.firm,a.size?plain(a.size)+' de cuenta':'',a.plat,'comprada el '+new Date(accTs(a.date)).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}),a.order?'pedido '+a.order:''].filter(Boolean).map(esc).join(' · ')+'</p>'+
     '<div class="stats"><div class="stat"><small>Pagado</small><b>'+plain(a.paid)+'</b></div><div class="stat"><small>Cobrado</small><b>'+plain(pays)+'</b></div><div class="stat"><small>Neto</small><b class="'+cls(net)+'">'+money(net)+'</b></div></div>'+
     (a.disc?'<p class="small muted" style="margin:8px 0 0">Precio '+plain(a.price)+' − descuento '+plain(a.disc)+(a.coupon?' ('+esc(a.coupon)+')':'')+'</p>':'')+
     (a.tv?'<p class="small muted" style="margin:8px 0 0">Saldo según Tradovate: <b>'+plain(a.tv.netLiq)+'</b> · P/L total '+money(a.tv.totalPL)+' ('+new Date(a.tv.ts).toLocaleDateString('es-ES',{day:'numeric',month:'short'})+')</p>':'')+
     '<div class="acts" style="margin-top:12px">'+(a.st==='eval'?bt('funded','La pasé a funded')+bt('lost','La perdí'):'')+(a.st==='funded'?bt('lost','La perdí')+bt('closed','Cerrar'):'')+((a.st==='lost'||a.st==='closed')?bt('eval','Reabrir'):'')+bt('pay','Anotar cobro')+bt('fee','Anotar gasto')+bt('edit','Editar')+bt('del','Borrar')+'</div>'+
     '<details style="margin-top:10px"><summary class="small muted">Historial ('+(a.hist.length+a.payouts.length+a.fees.length)+')</summary><ul class="lst small">'+hist+movs+'</ul></details>'+(a.note?'<p class="small muted" style="margin:8px 0 0">'+esc(a.note)+'</p>':'')+'</section>';
  };
  $('#view').innerHTML='<div class="wrap">'+header('Prop firms','Banca')+'<div class="stack">'+
   '<section class="card hl"><h3>Resumen</h3><div class="stats">'+stat('Gastado',plain(S0.spent))+stat('Cobrado',plain(S0.got))+stat('Neto',money(S0.net),cls(S0.net))+'</div>'+
   '<div class="stats" style="margin-top:10px">'+stat('Cuentas',S0.n)+stat('Activas',S0.eval+S0.funded)+stat('Pasaron a funded',S0.passed+' de '+S0.n)+'</div></section>'+
   '<section class="card"><h3>Cobrado este mes</h3><div class="row"><b style="font-size:22px">'+plain(cobradoMes)+'</b><span class="muted">de '+plain(goal)+'</span></div><div class="bar"><i style="width:'+pct.toFixed(1)+'%"></i></div><p class="small muted" style="margin:0">La meta mensual se cambia en «Más».</p></section>'+
   chartsBanca(L)+(firmRows?'<section class="card"><h3>Retorno por prop firm</h3>'+firmRows+'<p class="small muted" style="margin:10px 0 0">Neto = cobros − lo pagado − otros gastos. Una cuenta perdida o cerrada sigue contando.</p></section>':'')+
   '<div class="acts"><button class="btn pri" data-bk="new">Nueva cuenta</button></div>'+
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
   '<label class="field">Método de pago<input id="aMe" value="'+v(a.pay)+'"></label><label class="field">Nota<input id="aN" value="'+v(a.note)+'"></label></div>',
   [{label:'Cancelar'},{label:'Guardar',primary:true,run:()=>{
     const g=id=>document.getElementById(id).value,d={firm:g('aF'),plan:g('aP'),plat:g('aPl'),size:g('aS'),date:g('aD'),order:g('aO'),price:g('aPr'),disc:g('aDi'),paid:g('aPa'),coupon:g('aC'),pay:g('aMe'),note:g('aN')};
     const acc=accData();
     if(a.id){const t=acc.list.find(x=>x.id===a.id);if(t){const n=accCreate([],d);['firm','plan','plat','size','date','order','price','disc','paid','coupon','pay','note'].forEach(k=>{t[k]=n[k];});}}
     else accCreate(acc.list,d);
     saveCfg();renderBanca();toast('Cuenta guardada');
   }}]);
}
function accAct(s){
  const p=s.split('|'),k=p[0],acc=accData(),t=p[1]&&acc.list.find(x=>x.id===p[1]);
  if(k==='new'){accForm();return;}
  if(!t)return;
  const today=dateOf(Date.now());
  if(k==='edit'){accForm(t);return;}
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
  return '<section class="card"><div class="row"><h3 style="margin:0">Banca</h3><a class="small" href="#banca" style="color:var(--yellow)">Abrir</a></div><div class="stats" style="margin-top:10px">'+stat('Cuentas activas',s.eval+s.funded)+stat('Gastado',plain(s.spent))+stat('Neto',L.length?money(s.net):'—',cls(s.net))+'</div></section>';
}
