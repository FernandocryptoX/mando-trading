/* Importar operaciones desde los CSV que descarga Tradovate (órdenes y datos de cuenta).
   Todo se lee en el navegador: los archivos no se suben a ningún sitio.
   Crea las operaciones del Diario con lo que el archivo sabe (hora, lado, contratos, precios, resultado)
   y deja pendiente lo que solo sabes tú (emociones, reglas, setup). */

var TVQ=[];   // cola de operaciones importadas para completar una tras otra
const TV_PV={MNQ:2,MES:5,NQ:20,ES:50,M2K:5,RTY:50,MYM:0.5,YM:5};   // dólares por punto
const tvRoot=s=>{const u=String(s||'').trim().toUpperCase(),m=/^(.+?)[FGHJKMNQUVXZ]\d{1,2}$/.exec(u);return m?m[1]:u;};
const tvNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
const tvR2=n=>Math.round(n*100)/100;

function tvCsv(t){
  const rows=[];let row=[],f='',q=false;t=String(t).replace(/^﻿/,'');
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else if(c==='"')q=true;
    else if(c===','||c===';'){row.push(f);f='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x!==''))rows.push(row);row=[];}
    else f+=c;}
  row.push(f);if(row.some(x=>x!==''))rows.push(row);return rows;
}
function tvIndex(head,names){for(const n of names){const i=head.indexOf(n);if(i>=0)return i;}return -1;}
function tvTime(s){
  const m=/(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(s||''));
  if(!m)return null;
  return zonedToUtc(m[1],m[2]+':'+m[3],TZ_ES)+(+m[4]||0)*1000;   // el archivo viene en la hora del equipo (Madrid)
}
const tvNum=v=>{const s=String(v==null?'':v).trim();if(!s)return null;const x=parseFloat(s);return isFinite(x)?x:null;};
const tvKind=s=>{const n=tvNorm(s);if(/take/.test(n))return 'tp';if(/stop/.test(n))return 'stop';if(/merc|market/.test(n))return 'mercado';if(/limit/.test(n))return 'limite';return n||'otra';};

/* lee un archivo: devuelve {kind:'orders',fills,cancels} | {kind:'account',info} | {kind:'empty'} | {kind:'unknown'} */
function tvReadFile(text){
  const rows=tvCsv(text);
  if(!rows.length)return{kind:'empty'};
  const head=rows[0].map(tvNorm);
  if(head.includes('net liq')){
    const r=rows[1]||[];const g=n=>{const i=head.indexOf(n);return i<0?null:tvNum(r[i]);};
    return{kind:'account',info:{totalPL:g('total p/l'),openPL:g('open p/l'),netLiq:g('net liq')}};
  }
  const ix={sym:tvIndex(head,['simbolo','symbol','contract']),side:tvIndex(head,['lado','b/s','side','buy/sell']),type:tvIndex(head,['tipo','type','order type']),
    qty:tvIndex(head,['cantidad ejecutada','filled qty','filled quantity']),avg:tvIndex(head,['precio medio de ejecucion','avg fill price','average price','avg price']),
    st:tvIndex(head,['estado','status']),time:tvIndex(head,['fecha ult. actualizacion','last update','timestamp','fecha ult. actualización']),id:tvIndex(head,['id de orden','order id']),
    stop:tvIndex(head,['precio stop','stop price']),lim:tvIndex(head,['precio limite','limit price'])};
  if(ix.sym<0||ix.side<0||ix.st<0||ix.time<0)return{kind:'unknown'};
  const fills=[],cancels=[];
  rows.slice(1).forEach(r=>{
    const st=tvNorm(r[ix.st]),ts=tvTime(r[ix.time]);if(ts===null)return;
    const sign=/compr|buy/.test(tvNorm(r[ix.side]))?1:-1,sym=String(r[ix.sym]||'').trim(),kind=tvKind(r[ix.type]);
    if(/ejecut|filled/.test(st)){
      const qty=tvNum(r[ix.qty]),px=tvNum(r[ix.avg]);
      if(qty>0&&px!==null)fills.push({sym,sign,qty,px,ts,kind,id:String(r[ix.id]||'')});
    }else if(/cancel/.test(st)&&(kind==='tp'||kind==='stop')){
      cancels.push({sym,sign,qty:tvNum(r[ix.qty]),ts,kind,price:kind==='tp'?tvNum(r[ix.lim]):tvNum(r[ix.stop])});
    }
  });
  return{kind:'orders',fills,cancels};
}

/* empareja entradas y salidas de plana a plana y calcula cada operación */
function tvBuild(fills,cancels){
  const out=[],bySym={};
  fills.slice().sort((a,b)=>a.ts-b.ts||a.id.localeCompare(b.id)).forEach(f=>{(bySym[f.sym]=bySym[f.sym]||[]).push(f);});
  Object.keys(bySym).forEach(sym=>{
    let net=0,cur=null;
    const finish=open=>{
      const t=cur;cur=null;
      const w=(a)=>a.reduce((x,y)=>x+y.qty,0),avg=a=>a.reduce((x,y)=>x+y.px*y.qty,0)/w(a);
      const entry=avg(t.entries),last=t.exits.length?t.exits[t.exits.length-1]:null;
      const pv=TV_PV[tvRoot(sym)],qtyIn=w(t.entries),qtyOut=w(t.exits);
      let res=null,exit=null,pts=null,how=null,tp=null,sl=null,left=null,endTs=null;
      if(last&&!open){
        exit=avg(t.exits);pts=(exit-entry)*t.side;how=last.kind;endTs=last.ts;
        if(pv)res=tvR2(pts*qtyOut*pv);
        // órdenes de take profit / stop que se cancelaron al cerrar (último valor guardado)
        cancels.filter(c=>c.sym===sym&&Math.abs(c.ts-last.ts)<=3000).forEach(c=>{if(c.kind==='tp'&&c.price!==null)tp=c.price;if(c.kind==='stop'&&c.price!==null)sl=c.price;});
        if(tp!==null&&pv&&(how==='mercado'||how==='limite')){const pot=tvR2((tp-entry)*t.side*qtyOut*pv);if(res!==null&&pot>res)left=tvR2(pot-res);}
      }
      out.push({sym,side:t.side>0?'long':'short',qty:qtyIn,entry:tvR2(entry),exit:exit===null?null:tvR2(exit),pts:pts===null?null:tvR2(pts),res,how,tp,sl,left,ts:t.entries[0].ts,endTs,secs:endTs?Math.round((endTs-t.entries[0].ts)/1000):null,oid:t.oid,pv:pv||null,open:!!open});
    };
    bySym[sym].forEach(f=>{
      let rem=f.qty;
      while(rem>1e-9){
        if(net===0&&!cur)cur={side:f.sign,entries:[],exits:[],oid:f.id};
        if(cur.side===f.sign){cur.entries.push({qty:rem,px:f.px,ts:f.ts});net+=f.sign*rem;rem=0;}
        else{const c=Math.min(rem,Math.abs(net));cur.exits.push({qty:c,px:f.px,ts:f.ts,kind:f.kind});net+=f.sign*c;rem-=c;if(Math.abs(net)<1e-9){net=0;finish(false);}}
      }
    });
    if(cur)finish(true);
  });
  return out.sort((a,b)=>a.ts-b.ts);
}

/* varios archivos a la vez: devuelve {trades, info, notas} */
function tvAnalyze(files){
  let fills=[],cancels=[],info=null;const notas=[];
  files.forEach(f=>{
    const r=tvReadFile(f.text);
    if(r.kind==='orders'){fills=fills.concat(r.fills);cancels=cancels.concat(r.cancels);}
    else if(r.kind==='account')info=r.info;
    else if(r.kind==='unknown')notas.push('«'+f.name+'» no parece un archivo de Tradovate que conozca.');
  });
  return{trades:tvBuild(fills,cancels),info,notas};
}
const tvId=t=>'tv-'+(t.oid||t.ts);
function tvToTrade(t,acc){
  const ts=t.ts,date=dateOf(ts);
  const ac=acc&&typeof accData==='function'?accData().list.find(x=>x.id===acc):null,kind=ac?(ac.st==='funded'?'fund':'eval'):'';
  let risk=null,rr=null;
  if(t.sl!=null&&t.pv&&t.qty&&t.entry!=null){const d=Math.abs(t.entry-t.sl);if(d>0){risk=Math.round(d*t.pv*t.qty);if(t.tp!=null)rr=Math.round(Math.abs(t.tp-t.entry)/d*100)/100;}}
  return{v:1,kind,risk,rr,id:tvId(t),ts,endTs:t.endTs||null,date,time:hm(ts),side:t.side,instr:tvRoot(t.sym),setup:[],res:t.res,r:null,pre:'',dur:'',post:'',rules:'',errs:[],note:'',acc:acc||'',
    imp:true,qty:t.qty,entry:t.entry,exit:t.exit,pts:t.pts,how:t.how,tp:t.tp,sl:t.sl,left:t.left,secs:t.secs};
}
const tvFmtPx=n=>n===null||n===undefined?'—':n.toLocaleString('es-ES',{maximumFractionDigits:2});
const tvDur=s=>s==null?'':(s<90?s+' s':Math.round(s/60)+' min');
const tvHow={stop:'por stop',tp:'por take profit',mercado:'a mercado',limite:'con orden límite'};
function tvSummary(t){
  return (t.side==='short'?'Venta':'Compra')+' · '+t.qty+' '+esc(t.instr)+' · '+tvFmtPx(t.entry)+' → '+tvFmtPx(t.exit)+(t.secs!=null?' · '+tvDur(t.secs):'')+(t.how?' · cierre '+tvHow[t.how]:'')+(t.left>0?' · el objetivo estaba en '+tvFmtPx(t.tp)+' (dejaste '+plain(t.left)+')':'');
}

/* ---------- pantalla de importación ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-tv]');if(b&&b.dataset.tv==='import')document.getElementById('tvFile').click();});
document.addEventListener('change',e=>{
  if(!e.target||e.target.id!=='tvFile')return;
  const fs=[].slice.call(e.target.files);e.target.value='';if(!fs.length)return;
  Promise.all(fs.map(f=>new Promise(res=>{const r=new FileReader();r.onload=()=>res({name:f.name,text:String(r.result)});r.onerror=()=>res({name:f.name,text:''});r.readAsText(f);}))).then(tvPreview);
});
function tvPreview(files){
  const R=tvAnalyze(files);
  if(!R.trades.length){toast(R.notas[0]||'No encuentro operaciones en esos archivos. Descarga el de «órdenes» de Tradovate.');return;}
  const fresh=R.trades.filter(t=>!S.trades[tvId(t)]),dupNoAcc=R.trades.filter(t=>S.trades[tvId(t)]&&!S.trades[tvId(t)].acc),sum=R.trades.reduce((x,t)=>x+(t.res||0),0);
  const act=accActiveList(),def=(act[0]||{}).id||'__new';
  const sizeGuess=R.info&&R.info.netLiq!=null&&R.info.totalPL!=null?Math.round((R.info.netLiq-R.info.totalPL)/1000)*1000:'';
  const rows=R.trades.map(t=>{const dup=!!S.trades[tvId(t)];
    return '<div class="srow" style="'+(dup?'opacity:.5':'')+'"><span class="sn">'+hm(t.ts)+' · '+(t.side==='short'?'Venta':'Compra')+' '+t.qty+' '+esc(tvRoot(t.sym))+' · '+tvFmtPx(t.entry)+' → '+tvFmtPx(t.exit)+'</span><span class="sm">'+(dup?'ya importada':tvDur(t.secs))+'</span><b class="'+cls(t.res)+'">'+(t.res==null?'abierta':money(t.res))+'</b></div>';}).join('');
  let cuadre='';
  if(R.info&&R.info.totalPL!=null){const d=tvR2(R.info.totalPL-sum);cuadre='<p class="small muted" style="margin:10px 0 0">Suma de estas operaciones: <b>'+money(sum)+'</b> · Total P/L de la cuenta según Tradovate: <b>'+money(R.info.totalPL)+'</b>'+(R.info.netLiq!=null?' · Saldo: '+plain(R.info.netLiq):'')+'.<br>'+(Math.abs(d)<0.5?'Cuadra exacto.':'Diferencia de <b>'+money(d)+'</b>: operaciones del día que no están en el archivo, o comisiones.')+'</p>';}
  const noUnk=R.trades.some(t=>t.res===null&&!t.open)?'<p class="small" style="color:var(--coral)">Hay un instrumento del que no conozco el valor del punto: su resultado queda vacío.</p>':'';
  dialog('<h2 style="font-size:28px">Importar de Tradovate</h2><p class="small muted">'+R.trades.length+(R.trades.length>1?' operaciones encontradas':' operación encontrada')+' (horas de Madrid).</p>'+rows+cuadre+noUnk+
    '<label class="field" style="margin-top:12px">Cuenta<select id="tvAcc" style="min-height:44px;background:var(--page2);border:1px solid var(--line);border-radius:10px;padding:8px 12px"><option value="">Sin cuenta</option>'+accData().list.map(a=>'<option value="'+esc(a.id)+'"'+(a.id===def?' selected':'')+'>'+esc(a.plan)+' · '+((ACC_ST[a.st]||{}).n||'')+'</option>').join('')+'<option value="__new"'+(def==='__new'?' selected':'')+'>+ Añadir una cuenta nueva…</option></select></label>'+
    '<div id="tvNew" class="fgrid" style="margin-top:10px'+(def==='__new'?'':';display:none')+'"><label class="field">Prop firm<input id="tvF" placeholder="Lucid"></label><label class="field">Plan<input id="tvP" placeholder="LucidFlex 50K"></label><label class="field">Tamaño ($)<input id="tvS" inputmode="decimal" value="'+sizeGuess+'"></label></div>'+
    (R.notas.length?'<p class="small muted">'+R.notas.map(esc).join('<br>')+'</p>':''),
    [{label:'Cancelar'},{label:fresh.length?'Importar '+fresh.length:(dupNoAcc.length?'Asignar cuenta a '+dupNoAcc.length:'Nada nuevo'),primary:true,run:()=>{
      if(!fresh.length&&!dupNoAcc.length)return;
      let acc=document.getElementById('tvAcc').value;const ids=[];
      if(acc==='__new'){
        const g=id=>document.getElementById(id).value;
        const na=accCreate(accData().list,{firm:g('tvF'),plan:g('tvP'),size:g('tvS'),date:dateOf(Date.now())});acc=na.id;
      }
      if(acc)dupNoAcc.forEach(t=>{const old=S.trades[tvId(t)];if(old){old.acc=acc;putTrade(old);}});
      if(!fresh.length){
        if(R.info&&acc){const a=accData().list.find(x=>x.id===acc);if(a)a.tv={ts:Date.now(),totalPL:R.info.totalPL,netLiq:R.info.netLiq};}
        saveCfg();render();toast('Cuenta asignada a '+dupNoAcc.length+' operaciones');return;
      }
      fresh.forEach(t=>{const tr=tvToTrade(t,acc);putTrade(tr);ids.push(tr.id);});
      if(R.info&&acc){const a=accData().list.find(x=>x.id===acc);if(a){a.tv={ts:Date.now(),totalPL:R.info.totalPL,netLiq:R.info.netLiq};}}
      saveCfg();
      TVQ.length=0;ids.forEach(i=>TVQ.push(i));
      if(location.hash!=='#diario')location.hash='#diario';else render();
      toast(fresh.length+' operación'+(fresh.length>1?'es':'')+' importada'+(fresh.length>1?'s':'')+': completa tus emociones');
      setTimeout(()=>{const id=TVQ.shift();if(id&&S.trades[id])openSheet(S.trades[id]);},350);
    }}]);
}

/* sección de Conclusiones: qué pasa cuando entras justo después de una pérdida */
function reentrada(cl){
  const asc=cl.slice().sort((a,b)=>a.ts-b.ts),gap={};
  asc.forEach((t,i)=>{const p=asc[i-1];if(p&&p.res<0)gap[t.id]=(t.ts-(p.endTs||p.ts))/60000;});
  const sub=asc.filter(t=>gap[t.id]!=null);
  if(!sub.length)return '';
  return statSection('Entrada tras una pérdida',group(sub,t=>gap[t.id]<5?'Antes de 5 minutos':'Esperando 5 min o más'),'Mide el tiempo entre el cierre de una pérdida y la siguiente entrada.');
}

/* al elegir «Añadir una cuenta nueva» se muestran sus campos */
document.addEventListener('change',e=>{
  if(e.target&&e.target.id==='tvAcc'){const n=document.getElementById('tvNew');if(n)n.style.display=e.target.value==='__new'?'':'none';}
});
