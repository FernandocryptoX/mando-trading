/* Gráficos sencillos en SVG (sin librerías): curva de resultado, barras y donut. Usan las variables de color de la app. */
const sh=n=>(n<0?'−':'+')+Math.abs(Math.round(n)).toLocaleString('es-ES',{useGrouping:true});

function chartLine(vals,o){
  o=o||{};
  if(!vals||vals.length<2)return '<p class="muted small" style="margin:0">Aún no hay suficientes operaciones para dibujar la curva.</p>';
  const W=300,H=o.h||90,pad=6,mn=Math.min(0,...vals),mx=Math.max(0,...vals),rg=(mx-mn)||1;
  const X=i=>pad+i*(W-2*pad)/(vals.length-1),Y=v=>H-pad-(v-mn)/rg*(H-2*pad);
  const pts=vals.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)),end=vals[vals.length-1],col=end>=0?'var(--good)':'var(--bad)',y0=Y(0).toFixed(1);
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="'+H+'" preserveAspectRatio="none" role="img" aria-label="Curva de resultado: '+esc(sh(end))+' dólares">'+
    '<line x1="0" x2="'+W+'" y1="'+y0+'" y2="'+y0+'" stroke="rgba(255,255,255,.2)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>'+
    '<polygon points="'+X(0).toFixed(1)+','+y0+' '+pts.join(' ')+' '+X(vals.length-1).toFixed(1)+','+y0+'" fill="'+col+'" opacity=".14"/>'+
    '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>'+
    '<div class="row small" style="margin-top:4px"><span class="muted">'+(vals.length-1)+' operaciones</span><b class="'+(end>=0?'pos':'neg')+'">'+money(end)+'</b></div>';
}

function chartDonut(parts,center){
  const tot=parts.reduce((x,p)=>x+p.v,0);
  if(!tot)return '';
  const R=36,C=2*Math.PI*R;let off=0;
  const segs=parts.filter(p=>p.v>0).map(p=>{const len=C*p.v/tot,s='<circle cx="50" cy="50" r="'+R+'" fill="none" stroke="'+p.c+'" stroke-width="12" stroke-dasharray="'+len.toFixed(1)+' '+(C-len).toFixed(1)+'" stroke-dashoffset="'+(-off).toFixed(1)+'" transform="rotate(-90 50 50)"><title>'+esc(p.l)+': '+p.v+'</title></circle>';off+=len;return s;}).join('');
  return '<svg viewBox="0 0 100 100" width="104" height="104" role="img" aria-label="Reparto de operaciones" style="flex:0 0 auto"><circle cx="50" cy="50" r="'+R+'" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"/>'+segs+'<text x="50" y="50" text-anchor="middle" dominant-baseline="central" fill="var(--ink)" font-size="20" font-weight="500">'+esc(center==null?tot:center)+'</text></svg>';
}

function donutRow(w,l,b,tot){
  const pct=n=>tot?Math.round(100*n/tot):0;
  return '<div class="row" style="flex-wrap:nowrap;gap:16px;justify-content:flex-start">'+
    chartDonut([{v:w,c:'var(--good)',l:'Ganadas'},{v:l,c:'var(--bad)',l:'Perdidas'},{v:b,c:'#8a8f98',l:'Break even'}],tot)+
    '<div class="small" style="line-height:1.9"><div><span style="color:var(--good)">●</span> Ganadas · <b>'+w+'</b> ('+pct(w)+' %)</div><div><span style="color:var(--bad)">●</span> Perdidas · <b>'+l+'</b> ('+pct(l)+' %)</div>'+(b?'<div><span style="color:#8a8f98">●</span> Break even · <b>'+b+'</b></div>':'')+'</div></div>';
}

/* rows: [{k, net, c, win, full}] — barras hacia arriba (ganancia) o hacia abajo (pérdida); atenuadas si hay menos de 5 operaciones */
function chartBars(rows){
  if(!rows.length||rows.every(r=>!r.c))return '<p class="muted small" style="margin:0">Aún no hay datos suficientes.</p>';
  const W=300,H=140,top=16,bot=52,ph=H-top-bot,n=rows.length,bw=Math.min(34,W/n-8);
  const mx=Math.max(0,...rows.map(r=>r.net)),mn=Math.min(0,...rows.map(r=>r.net)),rg=(mx-mn)||1,Y=v=>top+(mx-v)/rg*ph,y0=Y(0);
  const bars=rows.map((r,i)=>{
    const cx=(i+.5)*W/n,y=Y(r.net),h=Math.max(1,Math.abs(y-y0)),col=r.net>=0?'var(--good)':'var(--bad)';
    return '<g'+(r.c<5?' opacity=".55"':'')+'><title>'+esc(r.full||r.k)+': '+r.c+' op · '+(r.win==null?'—':Math.round(r.win)+' %')+' · '+sh(r.net)+'</title>'+
      '<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+(r.net>=0?y:y0).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+col+'" fill-opacity=".85"/>'+
      (r.c?'<text x="'+cx.toFixed(1)+'" y="'+(r.net>=0?y-4:y0+h+11).toFixed(1)+'" text-anchor="middle" fill="var(--muted)" font-size="9">'+sh(r.net)+'</text>':'')+
      '<text x="'+cx.toFixed(1)+'" y="'+(H-18)+'" text-anchor="middle" fill="var(--ink)" font-size="10">'+esc(r.k)+'</text>'+
      '<text x="'+cx.toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle" fill="var(--muted)" font-size="9">'+r.c+' op</text></g>';}).join('');
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Resultado por grupo"><line x1="0" x2="'+W+'" y1="'+y0.toFixed(1)+'" y2="'+y0.toFixed(1)+'" stroke="rgba(255,255,255,.2)"/>'+bars+'</svg>';
}

/* Hoy: curva y reparto del mes en curso (solo operaciones reales) */
function chartsHoy(){
  const t=todayES(),M=closed(allReal().filter(x=>x.date.slice(0,7)===t.slice(0,7))).sort((a,b)=>a.ts-b.ts);
  if(!M.length)return '';
  let c=0;const vals=[0].concat(M.map(x=>(c+=x.res)));
  const w=M.filter(x=>x.res>0).length,l=M.filter(x=>x.res<0).length;
  return '<section class="card"><h3>Resultado del mes</h3>'+chartLine(vals)+'<div style="margin-top:14px">'+donutRow(w,l,M.length-w-l,M.length)+'</div></section>';
}

/* Conclusiones: curva, reparto, barras por día de la semana y por franja horaria */
function chartsStats(cl){
  if(!cl.length)return '';
  const s=cl.slice().sort((a,b)=>a.ts-b.ts);let c=0;const vals=[0].concat(s.map(x=>(c+=x.res)));
  const w=cl.filter(x=>x.res>0).length,l=cl.filter(x=>x.res<0).length;
  const dow=[1,2,3,4,5].map(i=>{const r=agg(cl.filter(t=>dowOf(t.date)===i));return{k:DOW[i].slice(0,3),net:r.net,c:r.c,win:r.win,full:DOW[i]};});
  const bands=group(cl,t=>hourBand(t)).sort((x,y)=>x.k<y.k?-1:1).map(r=>({k:r.k,net:r.net,c:r.c,win:r.win,full:r.k+' (Nueva York)'}));
  return '<section class="card"><h3>Curva de resultado</h3>'+chartLine(vals)+'</section>'+
    '<section class="card"><h3>Ganadas y perdidas</h3>'+donutRow(w,l,cl.length-w-l,cl.length)+'</section>'+
    '<section class="card"><h3>Por día de la semana</h3>'+chartBars(dow)+'<p class="small muted" style="margin:8px 0 0">Resultado de cada día y número de operaciones. Las barras apagadas tienen menos de 5: es ruido.</p></section>'+
    '<section class="card"><h3>Por franja horaria (Nueva York)</h3>'+chartBars(bands)+'<p class="small muted" style="margin:8px 0 0">Franjas de 30 minutos. Con pocas operaciones no saques conclusiones.</p></section>';
}

/* ===== Fase visual 2: gráficas por apartado ===== */
/* barras horizontales: rows [{k, v, t, c}] (v = magnitud, t = texto a la derecha, c = color) */
function hbars(rows){
  if(!rows.length)return '';
  const mx=Math.max(1,...rows.map(r=>Math.abs(r.v)));
  return '<div>'+rows.map(r=>'<div class="hb"><span class="hk" title="'+esc(r.k)+'">'+esc(r.k)+'</span><div class="ht"><i style="width:'+Math.max(2,100*Math.abs(r.v)/mx).toFixed(0)+'%;background:'+(r.c||'var(--yellow)')+'"></i></div><b>'+esc(r.t)+'</b></div>').join('')+'</div>';
}

/* columnas con valor encima y etiqueta debajo: bins [{k, n, c}] */
function chartHist(bins){
  if(!bins.length||bins.every(b=>!b.n))return '<p class="muted small" style="margin:0">Aún no hay datos suficientes.</p>';
  const W=300,H=110,top=14,bot=18,ph=H-top-bot,n=bins.length,bw=Math.min(30,W/n-8),mx=Math.max(1,...bins.map(b=>b.n));
  const o=bins.map((b,i)=>{const cx=(i+.5)*W/n,h=Math.max(b.n?2:0,b.n/mx*ph),y=top+ph-h;
    return '<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+(b.c||'var(--yellow)')+'" fill-opacity=".85"/>'+
      (b.n?'<text x="'+cx.toFixed(1)+'" y="'+(y-4).toFixed(1)+'" text-anchor="middle" fill="var(--muted)" font-size="10">'+b.n+'</text>':'')+
      '<text x="'+cx.toFixed(1)+'" y="'+(H-4)+'" text-anchor="middle" fill="var(--ink)" font-size="10">'+esc(b.k)+'</text>';}).join('');
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Distribución"><line x1="0" x2="'+W+'" y1="'+(top+ph)+'" y2="'+(top+ph)+'" stroke="rgba(255,255,255,.2)"/>'+o+'</svg>';
}

/* calendario del mes: verde gana, rojo pierde, gris sin operar */
function chartCal(key,list){
  const y=+key.slice(0,4),m=+key.slice(5,7),dim=new Date(Date.UTC(y,m,0)).getUTCDate(),off=(dowOf(key+'-01')+6)%7,by={};
  closed(list).forEach(t=>{if(t.date.slice(0,7)===key)by[+t.date.slice(8,10)]=(by[+t.date.slice(8,10)]||0)+t.res;});
  const mx=Math.max(1,...Object.values(by).map(Math.abs));
  let c='';for(let i=0;i<off;i++)c+='<div class="cl e"></div>';
  for(let d=1;d<=dim;d++){const v=by[d],has=v!==undefined,a=has?(.22+.6*Math.min(1,Math.abs(v)/mx)).toFixed(2):0;
    c+='<div class="cl'+(has?'':' e')+'"'+(has?' style="background:'+(v>=0?'rgba(79,209,161,':'rgba(255,90,95,')+a+')" title="'+d+': '+esc(money(v))+'"':'')+'><span>'+d+'</span>'+(has?'<b>'+esc(sh(v))+'</b>':'')+'</div>';}
  return '<div class="calh"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="calg">'+c+'</div>';
}

/* Diario · Real: resumen del mes y calendario */
function chartsReal(R){
  const key=todayES().slice(0,7),M=R.filter(t=>t.date.slice(0,7)===key);
  if(!closed(M).length)return '';
  const a=agg(M);
  return '<section class="card"><h3>'+esc(mLabel(key))+'</h3><div class="stats">'+stat('Resultado',money(a.net),cls(a.net))+stat('Aciertos',a.win==null?'—':Math.round(a.win)+' %')+stat('Factor beneficio',a.pf==null?'—':a.pf.toFixed(2).replace('.',','))+'</div><div style="margin-top:14px">'+chartCal(key,M)+'</div><p class="small muted" style="margin:8px 0 0">Verde: día ganador. Rojo: día perdedor. Gris: sin operar.</p></section>';
}

/* Backtesting: curva, distribución de R y aciertos por key level */
function chartsBt(B){
  const cl=closed(B).sort((a,b)=>a.ts-b.ts);
  if(cl.length<2)return '';
  let c=0;const vals=[0].concat(cl.map(x=>(c+=x.res)));
  const rs=cl.filter(t=>typeof t.r==='number'),lab=['≤−3','−2','−1','0','+1','+2','≥+3'];
  const bins=lab.map((k,i)=>({k,n:0,c:i<3?'var(--bad)':i===3?'#8a8f98':'var(--good)'}));
  rs.forEach(t=>{bins[Math.max(0,Math.min(6,Math.round(t.r)+3))].n++;});
  const kl=group(cl.filter(t=>t.kl),t=>t.kl).sort((x,y)=>y.c-x.c).map(r=>({k:r.k+(r.c<5?' (pocas)':''),v:r.win||0,t:Math.round(r.win||0)+' % · '+r.c,c:(r.win||0)>=50?'var(--good)':'var(--yellow)'}));
  return '<section class="card"><h3>Curva del backtesting</h3>'+chartLine(vals)+'</section>'+
    (rs.length>=3?'<section class="card"><h3>Distribución de R</h3>'+chartHist(bins)+'<p class="small muted" style="margin:8px 0 0">Cuántas operaciones acabaron en cada R. Lo sano: más barras verdes que rojas y pocas pérdidas peores que −1.</p></section>':'')+
    (kl.length?'<section class="card"><h3>Aciertos por key level</h3>'+hbars(kl)+'<p class="small muted" style="margin:8px 0 0">Porcentaje de operaciones ganadas y número de operaciones. Con menos de 5 es ruido.</p></section>':'');
}

/* Banca: gastado frente a cobrado por prop firm y embudo de cuentas */
function chartsBanca(L){
  if(!L.length)return '';
  const firms={};L.forEach(a=>{(firms[a.firm]=firms[a.firm]||[]).push(a);});
  const rows=[];Object.keys(firms).forEach(f=>{const s=accStats(firms[f]);rows.push({k:f+' · gastado',v:s.spent,t:plain(s.spent),c:'var(--bad)'},{k:f+' · cobrado',v:s.got,t:plain(s.got),c:'var(--good)'});});
  const s=accStats(L),paid=L.filter(a=>accSum(a.payouts)>0).length;
  return '<section class="card"><h3>Gastado y cobrado por prop firm</h3>'+hbars(rows)+'</section>'+
    '<section class="card"><h3>Embudo de cuentas</h3>'+hbars([{k:'Compradas',v:s.n,t:String(s.n)},{k:'Pasaron a funded',v:s.passed,t:String(s.passed),c:'var(--mint)'},{k:'Cobraron',v:paid,t:String(paid),c:'var(--good)'}])+'<p class="small muted" style="margin:8px 0 0">Cuántas cuentas llegan a cada paso. Si te quedas en la primera barra, el negocio no sale.</p></section>';
}

/* Conclusiones: proceso×resultado, lo que más te cuesta y resultado según confluencias */
function chartsProceso(cl){
  const pc=cl.filter(chkDone);let h='';
  if(pc.length>=3){
    const cell=(good,win)=>{const g=pc.filter(t=>chkGood(t)===good&&(win?t.res>0:t.res<=0));return{c:g.length,n:g.reduce((x,t)=>x+t.res,0)};};
    const q=(l,x,bg,col)=>'<div class="mx" style="background:'+bg+'"><small>'+l+'</small><b style="color:'+col+'">'+x.c+(x.c?' · '+esc(sh(x.n)):'')+'</b></div>';
    h+='<section class="card"><h3>Proceso del checklist y resultado</h3><div class="mxg">'+q('Buen proceso · ganas',cell(true,true),'rgba(79,209,161,.12)','var(--good)')+q('Buen proceso · pierdes',cell(true,false),'rgba(255,165,38,.1)','var(--ink)')+q('Proceso flojo · ganas',cell(false,true),'rgba(255,165,38,.1)','var(--ink)')+q('Proceso flojo · pierdes',cell(false,false),'rgba(255,90,95,.12)','var(--bad)')+'</div><p class="small muted" style="margin:8px 0 0">Perder con buen proceso es normal. Ganar con proceso flojo es suerte.</p></section>';
    const fl=group(pc,t=>chkFails(t)).filter(x=>x.net<0).sort((x,y)=>x.net-y.net).slice(0,5).map(r=>({k:r.k,v:-r.net,t:money(r.net)+' · '+r.c,c:'var(--bad)'}));
    if(fl.length)h+='<section class="card"><h3>Lo que más te cuesta</h3>'+hbars(fl)+'</section>';
  }
  const sk=cl.filter(t=>t.kl);
  if(sk.length>=3){
    const rows=group(sk,t=>{const n=(t.conf||[]).length;return n<=2?'0-2':n<=4?'3-4':'5+';}).sort((x,y)=>x.k<y.k?-1:1).map(r=>({k:r.k,net:r.net,c:r.c,win:r.win,full:r.k+' confluencias'}));
    h+='<section class="card"><h3>Resultado según confluencias</h3>'+chartBars(rows)+'<p class="small muted" style="margin:8px 0 0">Resultado según cuántas confluencias llevabas.</p></section>';
  }
  return h;
}

/* Revisión semanal: resultado por día y evolución de tu foco */
function chartsSemana(mon,W){
  const rows=[1,2,3,4,5].map(i=>{const d=addD(mon,i-1),r=agg(W.filter(t=>t.date===d));return{k:DOW[i].slice(0,3),net:r.net,c:r.c,win:r.win,full:DOW[i]};});
  let h='<section class="card"><h3>Resultado por día</h3>'+chartBars(rows)+'</section>';
  const cur=focusOf(mon);
  if(cur){const bins=[];for(let i=7;i>=0;i--){const m=addD(mon,-7*i),n=focusCount(allReal().filter(t=>inWeek(t,m)),cur);bins.push({k:m.slice(8,10)+'/'+m.slice(5,7),n,c:'var(--yellow)'});}
    h+='<section class="card"><h3>Mi foco, semana a semana</h3>'+chartHist(bins)+'<p class="small muted" style="margin:8px 0 0">Veces que apareció «'+esc(cur)+'» en las últimas 8 semanas. Tiene que ir bajando.</p></section>';}
  return h;
}

/* Revisión mensual: calendario y errores */
function chartsMes(key,M){
  const errs=group(closed(M),t=>failLabels(t)).sort((x,y)=>x.net-y.net||y.c-x.c).slice(0,5).filter(e=>e.net<0).map(e=>({k:e.k,v:-e.net,t:money(e.net)+' · '+e.c,c:'var(--bad)'}));
  return '<section class="card"><h3>Calendario del mes</h3>'+chartCal(key,M)+'</section>'+(errs.length?'<section class="card"><h3>Dinero que te costó cada error</h3>'+hbars(errs)+'</section>':'');
}
