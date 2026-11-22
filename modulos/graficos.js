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
