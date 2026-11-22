/* Contenido del curso (apuntes, glosario, sistema, dudas). Datos extraídos de la libreta original. */
const TAGS = {
  psi:{cls:'t-psi',txt:'🧠 Psicología'}, tec:{cls:'t-tec',txt:'📊 Técnica'},
  rie:{cls:'t-rie',txt:'🛡️ Riesgo'},     rut:{cls:'t-rut',txt:'🔁 Rutina'}
};
/* TOTAL_DAYS se calcula tras DAYS: siempre cubre el último día apuntado (el curso ya tiene 20 vídeos) */

/* helpers de dibujo (SVG) */
const CANDLES=[[25,30,90,45,75,0],[55,50,100,60,92,0],[85,55,105,62,98,1],[115,35,90,40,82,1],[145,25,75,30,62,1],[175,35,85,45,78,0]];
function candleSvg(bull,bear,stroke,bg,label){
  return `<svg viewBox="0 0 200 130" role="img" aria-label="${label}"><rect width="200" height="130" rx="10" fill="${bg}"/>`+
   CANDLES.map(c=>`<line x1="${c[0]}" x2="${c[0]}" y1="${c[1]}" y2="${c[2]}" stroke="${stroke}" stroke-width="2"/><rect x="${c[0]-7}" y="${c[3]}" width="14" height="${c[4]-c[3]}" fill="${c[5]?bull:bear}" stroke="${stroke}" stroke-width="2"/>`).join('')+
   `<text x="100" y="123" text-anchor="middle" font-family="Caveat,cursive" font-size="17" fill="${stroke==='#000'?'#222':'#cfd3db'}">${label}</text></svg>`;
}
/* una vela suelta: x, mecha (y1..y2), cuerpo (b1..b2), alcista o no */
function cd(x,y1,y2,b1,b2,bull){return `<line x1="${x}" x2="${x}" y1="${y1}" y2="${y2}" stroke="#000" stroke-width="2"/><rect x="${x-9}" y="${b1}" width="18" height="${b2-b1}" fill="${bull?'#B2B5BE':'#434651'}" stroke="#000" stroke-width="2"/>`;}

const PROFILE_DEFAULTS = {};

const DAYS = [
 { id:1, title:'Obsesiónate', tags:['psi','rut'], mins:21, status:'done',
   intro:'Introducción y mentalidad. Casi sin técnica: el vídeo pone las reglas del juego del bootcamp y del propio trading.',
   blocks:[
    {t:'idea', text:'El trading no es rápido ni fácil: gana el que hace <span class="mk">todo el trabajo aburrido</span> (ver, apuntar, registrar, revisar errores) y <span class="mk">cree que puede</span>.'},

    {t:'h2', text:'Cómo está montado el bootcamp', tape:'mapa'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">Día 1 · mentalidad</span><span class="ar">→</span>
        <span class="s tec">Plataforma (TradingView), qué se opera, prop firms</span><span class="ar">→</span>
        <span class="s tec">Conceptos desde cero</span><span class="ar">⇄</span>
        <span class="s psi">Días de psicología</span><span class="ar">→</span>
        <span class="s tec">Estrategia + práctica</span><span class="ar">→</span>
        <span class="s fin">Mejor prop firm · escalar · riesgo por perfil · plan al primer mes de 10k</span>
      </div>
      <div class="cap">Alterna días de psicología y días de estrategia. Dura ~2 meses (la serie llega a 2027).</div>`},
    {t:'cards', items:[
      {c:'l', ico:'🧠', h:'Psicología > estrategia', p:'Dice que los días de psicología son <b>casi más importantes</b> que los de estrategia. Estrategia te la enseña cualquiera; psicología casi nadie, "porque no vende".'},
      {c:'b', ico:'🎯', h:'Su enfoque', p:'Explica las cosas <b>a su manera</b>, no como el único método válido. Usa pocas herramientas que le funcionan muy bien.'},
      {c:'m', ico:'📝', h:'Deberes', p:'Si manda deberes al final de un capítulo, <b>hacerlos en serio</b>. Y apuntar todo en un cuaderno.', detail:true}
    ]},

    {t:'h2', text:'El 1–5 %', tape:'mentalidad'},
    {t:'html', cls:'viz', html:`
      <div class="dots" id="dots"></div>
      <div class="cap">En cualquier campo (arquitectos, médicos, músicos…) solo destaca de verdad un 1–5 %. Con el trading pasa igual: <b>decide ser de ese grupo</b>.</div>`},
    {t:'p', cls:'detail', html:'Él mismo duda de que la estadística famosa de "solo el 1 % gana" sea real, pero la usa de argumento: si solo unos pocos destacan en todo, la pregunta no es si es difícil, sino <span class="mk">si estás dispuesto a ser de los pocos</span>.'},
    {t:'h3', text:'Contra quién compites'},
    {t:'list', items:[
      'Gente que <b>ve cada vídeo</b> (incluso dos veces) y no se salta los de psicología.',
      'Gente que <b>toma apuntes</b>.',
      'Gente que lleva un <b>journal detallado</b>.',
      'Gente que <b>revisa sus errores</b> de verdad.',
      'Gente que está pensando en ello todo el día.'
    ]},
    {t:'quote', text:'Si entras con la idea de saltarte vídeos porque "es un rollo", no podrás competir con quien lo hace todo y más.', src:'Idea central del vídeo (parafraseada)'},

    {t:'h2', text:'Expectativas realistas', tape:'realidad'},
    {t:'cards', items:[
      {c:'c', ico:'⏳', h:'No es rápido', p:'No es abrir un gráfico y empezar a ganar. Hay gente con 8 años sin ser rentable y gente con 20 que ha quebrado.'},
      {c:'c', ico:'📉', h:'No te harás millonario', p:'Trading cambia tu vida en <b>libertad, felicidad y sentir que haces algo</b>; no es un plan de hacerse rico de golpe.'},
      {c:'y', ico:'⚡', h:'"Rápido" = 1 año', p:'Para él, salir del bucle en un año ya es rápidísimo. Muy poca gente aguanta un año perdiendo dinero, backtesteando, metiendo horas y peleándose con su psicología.'}
    ]},
    {t:'p', cls:'detail', html:'También avisa de que <b>nunca eres 100 % robot</b>: aunque tengas experiencia, te siguen pasando cosas en la cabeza. Quien diga lo contrario miente. Se trata de gestionarlo, no de eliminarlo.'},

    {t:'h2', text:'El bucle (lo más importante del día)', tape:'clave'},
    {t:'html', cls:'viz loopwrap', html:`
      <svg viewBox="0 0 560 300" role="img" aria-label="El bucle: dejas de revisar el journal, todo sale mal, no te preguntas por qué">
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ff7a6b"/></marker>
          <marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5eead4"/></marker>
        </defs>
        <g font-family="Caveat,cursive" font-size="22" fill="#ece9e1" text-anchor="middle">
          <rect x="20" y="20" width="200" height="62" rx="12" fill="rgba(255,122,107,.12)" stroke="#ff7a6b" stroke-width="2"/>
          <text x="120" y="48">1 · Dejas de mirar</text><text x="120" y="72">el trade journal</text>
          <rect x="340" y="20" width="200" height="62" rx="12" fill="rgba(255,122,107,.12)" stroke="#ff7a6b" stroke-width="2"/>
          <text x="440" y="48">2 · Haces todo mal</text><text x="440" y="72">una y otra vez</text>
          <rect x="180" y="130" width="200" height="62" rx="12" fill="rgba(255,122,107,.12)" stroke="#ff7a6b" stroke-width="2"/>
          <text x="280" y="158">3 · No te paras a</text><text x="280" y="182">preguntar "¿por qué?"</text>
        </g>
        <path d="M222 51 C 270 40, 300 40, 336 51" fill="none" stroke="#ff7a6b" stroke-width="3" marker-end="url(#ah)"/>
        <path d="M440 84 C 440 120, 420 150, 384 160" fill="none" stroke="#ff7a6b" stroke-width="3" marker-end="url(#ah)"/>
        <path d="M178 160 C 140 150, 120 120, 120 86" fill="none" stroke="#ff7a6b" stroke-width="3" marker-end="url(#ah)"/>
        <g font-family="Caveat,cursive" fill="#5eead4" text-anchor="middle">
          <path d="M280 222 L280 250" stroke="#5eead4" stroke-width="3" marker-end="url(#ag)"/>
          <text x="280" y="282" font-size="25">SALIDA: journal de cada trade + revisión periódica de errores</text>
        </g>
      </svg>
      <div class="cap">Le pasó <b>un año entero</b> en ese bucle. El valor de un bootcamp es pasar el menor tiempo posible ahí dentro.</div>`},
    {t:'p', html:'<b>Habilidad clave:</b> aprender de tus errores. Parece fácil, pero con el tiempo <span class="mk c">dejas de prestarle atención al journal</span>, dejas de revisarlo y entras en el bucle sin darte cuenta.'},

    {t:'mine', id:'d1-bucle', h:'¿Te ha pasado esto?', ph:'Cuándo dejaste de registrar/revisar y qué pasó después…', lab:'Esto es tuyo', pre:''},

    {t:'h2', text:'Método de estudio y tiempo', tape:'rutina'},
    {t:'cards', items:[
      {c:'m', ico:'📓', h:'Cuaderno por día', p:'Apuntar cada capítulo (da igual que el cuaderno sea usado). Incluso en psicología: lo que más te marque, o concentrarte al 100 %.'},
      {c:'b', ico:'📅', h:'Organiza tu tiempo', p:'Los <b>primeros meses</b> hace falta mucho trabajo. Luego, cuando ya tienes la info y las horas de práctica, solo te conectas cuando abre el mercado.'},
      {c:'y', ico:'🔥', h:'Hay que creérselo', p:'Si no crees que puedes ganar dinero, estás acabado. Tener trabajo o hijos lo hace más difícil, <b>pero es posible</b>: metiendo horas.', detail:true}
    ]},

    {t:'mine', id:'d1-conexion', h:'Mi lectura personal', ph:'¿Qué te llevas del Día 1 para ti?', lab:'Esto es tuyo',
     pre:'', hint:'Conecta con tu situación: te falta justo lo que aquí se marca como clave (registro y revisión) y en 2026 ya demostraste que puedes llegar a fondearte y retirar.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> la parte sobre la mentoría de 3.000 €, el "será gratis / no vendo nada", sus cifras de ingresos y retiradas, la comparación con otros bootcamps y las peticiones de like/suscripción. No son conceptos aplicables a tu trading. <span class="muted">¿Echas algo en falta? Dímelo y lo añado.</span>'}
   ]},
 { id:2, title:'Configurar TradingView', tags:['tec','rut','psi'], mins:22, status:'done',
   intro:'Primer día práctico: qué se opera, dónde, cómo dejar el gráfico listo y cómo funcionan las cuentas fondeadas. Muy introductorio, pero con varios ajustes que conviene copiar tal cual.',
   blocks:[
    {t:'idea', text:'Se opera <span class="mk">solo NQ (Nasdaq)</span> mirando el <span class="mk">S&amp;P 500 como referencia</span>; el gráfico va <span class="mk">sin rojo ni verde</span> para no engancharte a la emoción, y una cuenta fondeada es <span class="mk">un examen barato</span>, no dinero regalado.'},

    {t:'h2', text:'Qué se opera y dónde', tape:'símbolos'},
    {t:'cards', items:[
      {c:'b', ico:'📈', h:'NQ · Nasdaq 100 futuros', p:'Es lo <b>único que se opera</b> en el curso. Busca <b>NQ</b> en TradingView y elige el contrato vigente (en el vídeo: <b>NQZ2026</b>, la Z es el de diciembre). Los contratos se renuevan cada trimestre: <b>la app te avisa</b> cuando toca cambiar (más abajo).'},
      {c:'m', ico:'🔎', h:'ES · S&amp;P 500 (solo mirar)', p:'Se tiene en pantalla <b>solo para observar</b> si hace o no hace cosas. Se busca como <b>ES</b> (ej. ESZ2026), no como "SP".'},
      {c:'y', ico:'🔗', h:'Por qué los dos', p:'Están <b>correlacionados</b>: se mueven de forma muy parecida. Lo que haga (o no haga) el S&amp;P da pistas de qué es más probable que haga el Nasdaq.'}
    ]},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 440 150" style="width:100%;max-width:560px;display:block;margin:0 auto" role="img" aria-label="NQ y ES se mueven parecido">
        <g font-family="Caveat,cursive" font-size="21" text-anchor="middle">
          <rect x="5" y="5" width="205" height="125" rx="10" fill="rgba(108,182,255,.08)" stroke="#6cb6ff" stroke-width="1.5"/>
          <text x="107" y="26" fill="#6cb6ff">NQ (lo operas)</text>
          <polyline points="20,105 45,85 70,95 100,55 125,70 155,38 190,50" fill="none" stroke="#6cb6ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
          <rect x="230" y="5" width="205" height="125" rx="10" fill="rgba(94,234,212,.08)" stroke="#5eead4" stroke-width="1.5"/>
          <text x="332" y="26" fill="#5eead4">ES (lo miras)</text>
          <polyline points="245,108 270,90 295,96 325,60 350,72 380,45 415,52" fill="none" stroke="#5eead4" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
          <text x="220" y="148" fill="#9aa0ab" font-size="18">bajan y suben casi a la vez</text>
        </g>
      </svg>
      <div class="cap">Si no puedes tener dos gráficos a la vez (plan básico), cambia de símbolo a mano.</div>`},
    {t:'html', cls:'mine', html:`<span class="lab">Mi decisión</span><h3>Opero exactamente lo que dice el curso</h3>
      <p style="margin:0">Voy a seguir el bootcamp al pie de la letra: <b>NQ (Nasdaq 100 futuros)</b> como único activo y <b>ES (S&amp;P 500)</b> solo como referencia. Mi operativa anterior en CFDs (oro, EUR, GBP) fue solo contexto y queda fuera.</p>`},

    {t:'h3', text:'📌 Aviso de cambio de contrato'},
    {t:'html', cls:'', html:`<div id="ctrbox"></div>
      <p class="muted" style="font-size:13.5px;margin-top:10px">Los futuros del Nasdaq vencen el <b>3.er viernes</b> de marzo, junio, septiembre y diciembre (letras H, M, U, Z). La fecha de cambio es <b>orientativa</b>: ≈ 8 días antes del vencimiento, cuando el volumen suele pasar al contrato siguiente. Confírmalo en TradingView viendo cuál tiene más volumen.</p>`},

    {t:'h2', text:'Gráfico sin rojo ni verde', tape:'psicología'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        ${candleSvg('#26a69a','#ef5350','#1a1d24','#2a2e39','Por defecto (verde / rojo)')}
        ${candleSvg('#B2B5BE','#434651','#000','#CAC8C8','El de Xavi (neutro)')}
      </div>
      <div class="cap">Rojo = urgencia y pérdida · verde = dopamina y dinero. Quiere <b>desengancharse de esos colores</b>; es una decisión de psicología, no solo estética.</div>`},
    {t:'list', items:[
      '<b>Quitar el volumen:</b> clic derecho → <i>Remove indicator</i>.',
      '<b>Clic derecho → Settings → Canvas:</b> fondo <b>sólido</b> gris claro (≈ #CAC8C8).',
      '<b>Symbol:</b> bordes y mechas en <b>negro</b>; cuerpo en color personalizado: una vela clara (≈ #B2B5BE) y otra oscura (≈ #434651).',
      '<b>Hora de Nueva York</b> en TradingView: lo da por hecho en el <a href="#dia-10" style="color:var(--yellow)">Día 10</a>, pero no lo vi en mi lectura de este vídeo. Compruébalo.'
    ]},
    {t:'p', cls:'detail', html:'<span class="muted">⚠️ Los códigos de color los saqué del audio y pueden no ser exactos. Compruébalos en el vídeo (≈ 3:40–4:10) antes de copiarlos.</span>'},

    {t:'h2', text:'Herramientas favoritas', tape:'configuración'},
    {t:'p', html:'Se añaden a favoritos (estrella) para tener el panel limpio. Son las que usará con la estrategia.'},
    {t:'cards', items:[
      {c:'b', ico:'📏', h:'Línea de tendencia', p:'Negra, texto negro, grosor 1, continua. Sirve para marcar <b>máximos, mínimos y puntos importantes</b>. Mantén <b>Shift</b> para que salga recta.'},
      {c:'y', ico:'▭', h:'Rectángulo', p:'Borde con opacidad 0. Relleno: 6.ª casilla del cubo, opacidad <b>24 %</b>. Texto blanco al 100 %. Está en Brush → Shapes.'},
      {c:'m', ico:'⇅', h:'Long / Short position', p:'Para marcar una compra o una venta. Mismo color en ambas; la zona de profit lleva ≈ 21–24 % de opacidad. Para vender solo cambias la dirección.'},
      {c:'l', ico:'〰️', h:'Path', p:'Negro, grosor 1. Está dentro de Brush → Shapes.'},
      {c:'c', ico:'🌈', h:'Fibonacci retracement', p:'Debajo de la línea de tendencia. Sale con un arcoíris horrible: hay que <b>copiar la configuración</b> del vídeo (≈ 8:00–8:18, pausa). Se usa para el <b>equilibrium</b> (<a href="#dia-19" style="color:var(--yellow)">Día 19</a>).'},
      {c:'b', ico:'🔤', h:'Texto', p:'Opcional: él lo usa para anotar, pero no es imprescindible.', detail:true}
    ]},

    {t:'h2', text:'Moverse por el gráfico', tape:'manejo'},
    {t:'cards', items:[
      {c:'b', ico:'🖱️', h:'Desplazar y zoom horizontal', p:'<b>Mantén clic izquierdo</b> y arrastra para moverte. <b>Rueda</b> hacia ti = alejar, hacia arriba = acercar (se descentra, lo recolocas).'},
      {c:'m', ico:'↕️', h:'Zoom vertical', p:'Arrastra con clic izquierdo sobre la <b>escala de precios</b> (derecha). <b>Doble clic</b> en esa columna = recentra el gráfico.'},
      {c:'y', ico:'🧲', h:'Imán (magnet)', p:'Débil o fuerte. Pega el cursor a máximos y mínimos: <b>marcas el nivel exacto</b> sin hacerlo a ojo. Pruébalo activado y desactivado.'}
    ]},

    {t:'h2', text:'Cuentas fondeadas: cómo funcionan', tape:'prop firms'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">💳 Pagas 50–100 €</span><span class="ar">→</span>
        <span class="s tec">📝 Examen: cuenta <b>simulada</b> (ej. 25.000 $)</span><span class="ar">→</span>
        <span class="s tec">🎯 Objetivo de beneficio sin romper reglas</span><span class="ar">→</span>
        <span class="s fin">✅ Nueva cuenta fondeada (también simulada)</span><span class="ar">→</span>
        <span class="s psi">💸 Retiros, con límites</span>
      </div>
      <div class="cap">Aprobar el examen no te paga nada: te dan una cuenta nueva. Es en <b>esa</b> donde puedes retirar (típicamente 1.000–2.000 €).</div>`},
    {t:'cards', items:[
      {c:'c', ico:'⚠️', h:'Por qué ganan ellas', p:'Su ejemplo: 9.000 personas pagan 100 € (≈ 900.000 €) y solo 10 retiran 1.000 € (10.000 €). <b>La mayoría suspende</b> y de ahí sale el pago a los pocos.'},
      {c:'m', ico:'💡', h:'Para qué sirve', p:'En vez de arriesgar tus ahorros, pagas 50–100 € por intentarlo. Sabiendo que <b>perderás varias veces</b>, hasta mejorar aprendiendo de los errores.'},
      {c:'y', ico:'📚', h:'Antes vs ahora', p:'Antes se aprendía con dinero propio (y años). Hoy hay recursos gratis, simuladores y cuentas fondeadas.', detail:true}
    ]},
    {t:'mine', id:'d2-banca', h:'Cuentas = coste de examen', lab:'Esto es tuyo', ph:'Cuánto llevo gastado en challenges este año y cuánto he retirado…',
     hint:'Aquí nace tu futura sección <b>Banca</b> (cuentas compradas, gasto, retorno). La montamos cuando el curso lo explique.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> las referencias a su plan premium, su enlace de afiliado, el recorrido por menús que ni él usa, la explicación de qué es el Nasdaq (admite que no sabe qué empresas lo componen) y los comentarios sobre las visualizaciones de los primeros vídeos. Lo que queda es lo que cambia cómo preparas y lees el gráfico.'}
   ]},
 { id:3, title:'Objetivos', tags:['psi'], mins:14, status:'done',
   intro:'Día de psicología: un ejercicio de papel (objetivos a largo y corto plazo) y una forma de tomarte el trading en serio. Aquí se escriben tus objetivos reales.',
   blocks:[
    {t:'idea', text:'Escribe metas <span class="mk">tan grandes que den vértigo</span> y, debajo, las <span class="mk">acciones diarias que dependen solo de ti</span>. Y trátalo como un trabajo, no como un casino.'},

    {t:'h2', text:'El ejercicio: objetivos por escrito', tape:'ejercicio'},
    {t:'p', html:'No es "manifestar" ni repetir "seré rico" mil veces: eso le parece una tontería. Es <b>dejar por escrito tu punto de partida y tu destino</b> para poder mirar atrás dentro de unos meses y ver el camino.'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 520 235" style="width:100%;max-width:560px;display:block;margin:0 auto" role="img" aria-label="Escalera: hoy, corto plazo, largo plazo">
        <g font-family="Caveat,cursive" text-anchor="middle" fill="#ece9e1">
          <rect x="15" y="160" width="150" height="65" rx="8" fill="rgba(255,255,255,.06)" stroke="#9aa0ab" stroke-width="2"/>
          <text x="90" y="190" font-size="26" fill="#9aa0ab">HOY</text><text x="90" y="213" font-size="19">mi punto de partida</text>
          <rect x="185" y="100" width="150" height="125" rx="8" fill="rgba(94,234,212,.1)" stroke="#5eead4" stroke-width="2"/>
          <text x="260" y="135" font-size="26" fill="#5eead4">CORTO PLAZO</text><text x="260" y="162" font-size="20">acciones diarias</text><text x="260" y="186" font-size="20">que dependen de ti</text>
          <rect x="355" y="35" width="150" height="190" rx="8" fill="rgba(255,216,77,.1)" stroke="#ffd84d" stroke-width="2"/>
          <text x="430" y="72" font-size="26" fill="#ffd84d">LARGO PLAZO</text><text x="430" y="102" font-size="20">metas "locas"</text><text x="430" y="126" font-size="20">con cifra y fecha</text><text x="430" y="150" font-size="20">(el destino)</text>
        </g>
        <path d="M100 148 C 150 110, 200 92, 255 88 S 380 40, 428 24" fill="none" stroke="#ff7a6b" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"/>
      </svg>
      <div class="cap">El largo plazo es lo que quieres; el corto plazo es <b>lo que haces cada día para llegar</b>.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🚀', h:'Largo plazo', p:'Escríbelos <b>exagerados</b>. Su ejemplo: cuando anotó una meta de 30.000 €/mes en un mes, ni él creía que fuera posible. Lo importante es que te hagan decir "¿qué estoy escribiendo?".'},
      {c:'m', ico:'🛠️', h:'Corto plazo', p:'Aquí no van resultados sino <b>acciones</b>: qué vas a hacer para cumplir los grandes. Es el ejercicio que más rinde.'}
    ]},

    {t:'h2', text:'Sus objetivos a corto plazo', tape:'proceso'},
    {t:'p', cls:'detail', html:'Son los que él se puso al empezar (de ahí salió todo). <b>Sirven de modelo</b>: los tuyos serán los tuyos.'},
    {t:'cards', items:[
      {c:'b', ico:'🧪', h:'Backtestear a diario', p:'<b>2 horas cada día</b> siguiendo la estrategia y haciéndolo bien.'},
      {c:'l', ico:'📓', h:'Journal de todos los trades', p:'Cómo me siento, qué pienso <b>antes y durante</b> el trade, qué RR tomé: las métricas del trade.'},
      {c:'m', ico:'🧊', h:'No ser emocional', p:'Seguir el plan. Sin reglas, mirando un gráfico "puedes hacer lo que quieras, y así acabaríamos todos pobres".'},
      {c:'b', ico:'📐', h:'Seguir reglas y sistema', p:'Se verá más adelante, pero el principio ya es este: <b>sistema, no impulso</b>.'},
      {c:'y', ico:'🍬', h:'No ser avaricioso', p:'Si la estrategia dice cerrar con +500 $, <b>cierras</b>. No lo estiras a 1.000 o 2.000.'},
      {c:'c', ico:'🔍', h:'Revisar mis pérdidas y aprender', p:'<b>La más importante</b>. Mirar qué hice mal para no repetirlo. "Aprender" es la palabra clave.'}
    ]},

    {t:'h2', text:'Cómo tomártelo', tape:'mentalidad'},
    {t:'cards', items:[
      {c:'c', ico:'💼', h:'Es un trabajo serio', p:'Estar en casa, en pantalones cortos, un martes <b>te hace sentir de vacaciones</b> y sin responsabilidades. No lo es.'},
      {c:'c', ico:'🎰', h:'Cuidado: parece un casino', p:'El precio sube o baja y estás <b>a un clic</b> de quemar las cuentas (o de ganar mucho en un segundo). Fuera la mentalidad de dinero rápido.'},
      {c:'l', ico:'🙈', h:'No te compares', p:'En internet no sabes si hay préstamos, herencias, otros ingresos o un montaje. Lo que ves <b>no es la norma</b>, aunque lo parezca.'},
      {c:'b', ico:'🧮', h:'No copies el riesgo de un reel', p:'La gestión de riesgo depende de <b>tu situación y tu capital</b>. Más adelante verá varias según el punto en que estés.'}
    ]},

    {t:'h3', text:'💡 El truco del jefe que te paga un sueldo fijo'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-c" style="transform:none"><h3>Sin sueldo (casino)</h3><p>Rompes reglas, te tiltas, abres sin estrategia porque "hay que ganar hoy". Nadie te mira.</p></div>
        <div class="card c-m" style="transform:none"><h3>Con sueldo fijo por seguir el sistema</h3><p>Sale la estrategia, entras. No sale, no entras. Ganas, sales. <b>Robótico y tranquilo</b>, porque no dependes del resultado de hoy.</p></div>
      </div>
      <div class="cap">Imagina que te pagan por <b>seguir las reglas</b>, no por ganar. Y recuerda: en casa nadie te vigila, es fácil romperlas.</div>`},
    {t:'p', cls:'detail', html:'Con la experiencia irás aprendiendo de tus errores; al principio <b>te va a pasar</b> (tiltearte, perder sin motivo tras un mal día) y es normal. Lo que cuenta es que lo revises. Y ojo con la prisa por los resultados (<a href="#dia-7" style="color:var(--yellow)">Día 7</a>).'},

    {t:'prof', key:'goalsLong', h:'Mis objetivos a largo plazo', lab:'Esto es tuyo',
     hint:'Con cifra y fecha, y sin miedo a que suenen locos. Se guardan en tu portada.', ph:'Ej.: vivir del trading sin depender de mi trabajo antes de…, ingresos mensuales objetivo…'},
    {t:'prof', key:'goalsShort', h:'Mis objetivos a corto plazo (acciones)', lab:'Esto es tuyo',
     hint:'Lo que harás tú, no lo que quieres que pase. Se parecen a tus 3 palancas de la portada: registrar, backtestear y menos tiempo en mercado.', ph:'Ej.: backtesting X horas, journal de cada operación, revisión semanal de pérdidas…'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> el recorrido por su cuaderno antiguo, sus metas personales de coches, viajes y dinero (son suyas), las referencias a otros creadores y a su audiencia, y la petición de like. Lo que queda es el método de objetivos y las ideas de psicología.'}
   ]},
 { id:4, title:'Velas y tendencias', tags:['tec'], mins:21, status:'done',
   intro:'Introducción muy básica. Solo anoto lo que aporta: cómo piensa en el tiempo, su definición de high/low y la estructura de tendencia.',
   blocks:[
    {t:'idea', text:'El precio es <span class="mk">fractal</span> (se comporta igual en cualquier temporalidad), pero <span class="mk">a mayor temporalidad, mayor importancia</span>. Y una tendencia es una escalera de máximos y mínimos.'},

    {t:'h2', text:'Ideas que conviene fijar', tape:'clave'},
    {t:'cards', items:[
      {c:'y', ico:'🔁', h:'El precio es fractal', p:'Velas y precio actúan igual en diario, 4 h, 1 h, 15 min… Lo que aprendas a leer en un marco <b>vale en todos</b>.'},
      {c:'c', ico:'⚖️', h:'Más temporalidad = más importancia', p:'Cuanto más alto el timeframe, <b>más peso tiene</b> y más nos apoyamos en él.'},
      {c:'b', ico:'⏱️', h:'Cada vela es varias pequeñas', p:'Una de 5 min = cinco de 1 min, y cierra a hora fija (12:25, 12:30…). La <b>cuenta atrás</b> sale en la escala derecha, y el reloj de abajo te da la hora al mover el ratón.'},
      {c:'m', ico:'🕯️', h:'La mecha marca los extremos', p:'Arriba el <b>máximo</b> y abajo el <b>mínimo</b> que tocó la vela, aunque cierre lejos. Sin mecha, el extremo es la propia apertura o cierre.'},
      {c:'l', ico:'⭐', h:'Temporalidades favoritas', p:'Pon en favoritos (estrella) las que uses. Sin TradingView Premium <b>no hay segundos ni 2 min</b>.', detail:true}
    ]},

    {t:'h2', text:'High y Low, a su manera', tape:'definición'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 175" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Definición de high, low y nada">
        <rect x="5" y="5" width="170" height="125" rx="10" fill="#CAC8C8"/>
        <rect x="185" y="5" width="170" height="125" rx="10" fill="#CAC8C8"/>
        <rect x="365" y="5" width="170" height="125" rx="10" fill="#CAC8C8"/>
        ${cd(60,35,100,55,90,1)}${cd(115,20,95,45,80,0)}
        <line x1="40" x2="140" y1="20" y2="20" stroke="#d94a3d" stroke-width="2" stroke-dasharray="5 4"/><circle cx="115" cy="20" r="5" fill="#d94a3d"/>
        ${cd(240,35,112,45,85,0)}${cd(295,50,100,60,95,1)}
        <line x1="220" x2="320" y1="112" y2="112" stroke="#d94a3d" stroke-width="2" stroke-dasharray="5 4"/><circle cx="240" cy="112" r="5" fill="#d94a3d"/>
        ${cd(420,30,85,40,70,0)}${cd(475,55,110,65,95,0)}
        <g font-family="Caveat,cursive" font-size="20" text-anchor="middle" fill="#ece9e1">
          <text x="90" y="153">alcista + bajista</text><text x="90" y="171" fill="#ffd84d">= HIGH</text>
          <text x="270" y="153">bajista + alcista</text><text x="270" y="171" fill="#5eead4">= LOW</text>
          <text x="450" y="153">mismo color</text><text x="450" y="171" fill="#9aa0ab">= nada</text>
        </g>
      </svg>
      <div class="cap">Se marca siempre la <b>mecha más extrema</b> de la pareja. Gris = alcista, oscura = bajista, como en su gráfico.</div>`},
    {t:'p', cls:'detail', html:'En un marco pequeño salen <b>muchos más highs y lows</b> que en uno grande. Los que importan son los <b>swing highs y swing lows</b>, los más prominentes del rango (<a href="#dia-6" style="color:var(--yellow)">ver Día 6</a>).'},

    {t:'h2', text:'Tendencia = estructura', tape:'tendencia'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 520 205" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Tendencia alcista y bajista">
        <g fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
          <polyline points="20,175 60,120 90,150 140,80 170,110 225,45" stroke="#5eead4"/>
          <polyline points="290,35 330,95 360,70 410,135 440,110 495,175" stroke="#ff7a6b"/>
        </g>
        <g font-family="Caveat,cursive" font-size="19" text-anchor="middle">
          <g fill="#5eead4">
            <circle cx="60" cy="120" r="4"/><circle cx="140" cy="80" r="4"/><circle cx="225" cy="45" r="4"/>
            <circle cx="90" cy="150" r="4"/><circle cx="170" cy="110" r="4"/>
            <text x="60" y="108">H</text><text x="140" y="68">HH</text><text x="225" y="33">HH</text>
            <text x="90" y="172">HL</text><text x="170" y="132">HL</text>
          </g>
          <g fill="#ff7a6b">
            <circle cx="330" cy="95" r="4"/><circle cx="410" cy="135" r="4"/><circle cx="495" cy="175" r="4"/>
            <circle cx="360" cy="70" r="4"/><circle cx="440" cy="110" r="4"/>
            <text x="360" y="58">LH</text><text x="440" y="98">LH</text>
            <text x="330" y="118">L</text><text x="410" y="158">LL</text><text x="495" y="198">LL</text>
          </g>
          <text x="130" y="203" fill="#5eead4" font-size="22">alcista: máximos y mínimos más altos</text>
          <text x="400" y="22" fill="#ff7a6b" font-size="22">bajista: más bajos</text>
        </g>
      </svg>
      <div class="cap">HH = higher high · HL = higher low · LH = lower high · LL = lower low.</div>`},
    {t:'cards', items:[
      {c:'m', ico:'🪜', h:'Se mueve en escalera', p:'Sube, <b>retrocede y respira</b>, vuelve a subir. En las caídas igual al revés. Nunca verás un sube-baja idéntico sin avanzar: eso sería <b>acumulación</b> (lo verá más adelante).'},
      {c:'b', ico:'🔭', h:'Lo que aún no cuenta', p:'Desde qué zona reacciona el precio y cuándo una tendencia pasa de alcista a bajista: <b>todo eso viene después</b>.'},
      {c:'l', ico:'✍️', h:'Su ejercicio', p:'Marcar <b>20 highs y 20 lows</b> y buscar ejemplos de tendencias en el gráfico para afianzarlo.', detail:true}
    ]},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> qué es una vela y sus partes, la diferencia entre alcista y bajista, la explicación de cómo leer apertura y cierre, y las anécdotas del inicio. Es lo básico que ya dominas; lo que queda es lo que aporta o ayuda a ordenar la estructura.'}
   ]},
 { id:5, title:'No sobreaprendas', tags:['psi','tec'], mins:14, status:'done',
   intro:'Vídeo corto de psicología: no cambiar de estrategia ni acumular conceptos. Empieza con dos aclaraciones prácticas sobre contratos y datos.',
   blocks:[
    {t:'idea', text:'No cambies de estrategia ni acumules conceptos: <span class="mk">el problema casi siempre eres tú, no la estrategia</span>. Elige un método, simplifícalo y trabaja tus reglas.'},

    {t:'h2', text:'Dos aclaraciones prácticas', tape:'antes de empezar'},
    {t:'cards', items:[
      {c:'b', ico:'🔬', h:'Empieza con micros', p:'Para principiantes: <b>MNQ</b> (Nasdaq micro) y <b>MES</b> (S&amp;P micro), contrato de diciembre (Z). Todo lo visto es <b>igual</b>; solo cambia el riesgo. Las diferencias, más adelante. El panel de contrato ya los muestra.'},
      {c:'y', ico:'⏳', h:'Datos con retraso', p:'Sin datos de CME ves el precio con <b>10 min de retraso</b> (marca naranja "D" junto al símbolo). Se pagan aparte (≈ 7 €/mes, no está seguro) y suelen venir <b>incluidos con una cuenta fondeada</b>.'}
    ]},

    {t:'h2', text:'La trampa de cambiar de estrategia', tape:'strategy hopping'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">😤 Pierdo rompiendo reglas</span><span class="ar">→</span>
        <span class="s">🧑‍🏫 Culpo a la estrategia</span><span class="ar">→</span>
        <span class="s">👀 Veo a otro ganando</span><span class="ar">→</span>
        <span class="s tec">🔄 Cambio de método o mentor</span><span class="ar">↺</span>
      </div>
      <div class="cap">A él le costó <b>9 meses</b>. Conoce a gente con 5 años operando y 7–8 mentores distintos.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'🪞', h:'Es tu culpa (para arreglarla)', p:'Cuando pierdes, casi siempre es por romper reglas, no por la estrategia. <b>Analiza por qué pierdes antes de comprar otra mentoría.</b>'},
      {c:'l', ico:'✂️', h:'Menos conceptos', p:'Con ICT llegó a 9–10 conceptos y empeoró; <b>mejoró al quedarse con 4</b>. No mezcles order flow, medias, ICT y soportes: se contradicen entre sí.'},
      {c:'m', ico:'🎯', h:'Una persona, un método', p:'Si empiezas con alguien con quien conectas, <b>quédate</b>. Dice que todas las estrategias funcionan y que el trading es, en el fondo, gestión del riesgo (<i>es su opinión</i>). Más en el <a href="#dia-12" style="color:var(--yellow)">Día 12</a>.'}
    ]},

    {t:'h2', text:'Elige un método que puedas sostener', tape:'perfil'},
    {t:'cards', items:[
      {c:'y', ico:'⚖️', h:'Su método: RR bajo', p:'Arriesga y gana más o menos lo mismo (ej. 500 $ por 500 $). <b>Poco tiempo dentro del trade</b> y <b>win rate alto (~70 %)</b>, frente al 50 % con RR alto que usaba antes.'},
      {c:'b', ico:'🧠', h:'Por qué le encaja', p:'Cerraba trades demasiado pronto, no soportaba ver un trade moverse una hora, y le costaba <b>aguantar un día en negativo</b>. Saber que lo normal es ganar le ayuda a la cabeza.'}
    ]},
    {t:'mine', id:'d5-metodo', h:'¿Qué método soporto yo?', lab:'Esto es tuyo', ph:'Qué me resulta insoportable (estar mucho en el trade, días en negativo…) y qué me da calma…',
     hint:'Tú ya identificaste que estar <b>demasiado tiempo en el mercado</b> es tu problema: encaja con elegir trades cortos. Lo concretará la estrategia del curso.', pre:''},

    {t:'h2', text:'Sobreanálisis y reglas', tape:'psicología'},
    {t:'cards', items:[
      {c:'c', ico:'🌀', h:'Demasiado backtesting', p:'Con tantas horas empezó a ver cosas que no debía y <b>no sabía si comprar o vender</b>: pros y contras en todo. Solución: <b>parar, alejarse del gráfico y volver a lo básico</b>, que funciona.'},
      {c:'m', ico:'📏', h:'Romper reglas es normal', p:'Él también las rompe. Lo inaceptable: <b>no revisar el journal, no llevarlo y romperlas a diario</b>. Si las sigues, ganas; si las rompes, pierdes.'},
      {c:'l', ico:'🏗️', h:'Sin reglas, nada sirve', p:'De poco valen 20.000 horas de backtesting o de journal si luego no las sigues.'},
      {c:'b', ico:'❓', h:'Tras un error, tres preguntas', p:'<b>¿Qué hice mal? ¿Por qué lo hice mal? ¿Cómo lo arreglo?</b> (Lo desarrolla en el <a href="#dia-9" style="color:var(--yellow)">Día 9</a>.)'}
    ]},
    {t:'quote', text:'No hace falta mejorar la estrategia: hay que mejorar uno mismo.', src:'Mensaje central del vídeo (parafraseado)'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> las fotos de sus operaciones antiguas, la comparación con la estrategia de otro creador, los nombres de otros mentores y las frases de promoción. Quedan las ideas de método y psicología.'}
   ]},
 { id:6, title:'Liquidez (parte 1)', tags:['tec'], mins:21, status:'done',
   intro:'Su forma de entender el mercado, sencilla y sin teoría de más. Lo explica a su manera: dice que no necesita saber qué hay detrás del mercado, solo lo que le funciona.',
   blocks:[
    {t:'idea', text:'La liquidez es <span class="mk">dinero</span>: en cada alto y cada bajo hay órdenes pendientes. El precio <span class="mk">va a buscar ese dinero</span> y, cuando lo recoge, hace el movimiento de verdad hacia el otro lado.'},

    {t:'h2', text:'Qué es la liquidez', tape:'concepto'},
    {t:'cards', items:[
      {c:'y', ico:'💰', h:'Liquidez = dinero', p:'En <b>cada alto y cada bajo</b> hay liquidez. Pero no toda vale lo mismo.'},
      {c:'b', ico:'🏔️', h:'Swing high / swing low', p:'Los altos y bajos <b>prominentes</b> del rango: los que despuntan, los extremos importantes. Esos son los que se marcan.'},
      {c:'m', ico:'🏷️', h:'BSL y SSL', p:'Los <b>altos</b> son la liquidez de compra (<b>buy-side</b>, BSL). Los <b>bajos</b> son la de venta (<b>sell-side</b>, SSL). Apúntalo: lo usará constantemente.'}
    ]},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 195" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="BSL en los altos y SSL en los bajos">
        <polyline points="20,150 70,90 110,120 170,40 215,95 260,70 310,160 360,120 410,135 470,60" fill="none" stroke="#9aa0ab" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <line x1="170" x2="530" y1="40" y2="40" stroke="#ffd84d" stroke-width="2" stroke-dasharray="6 5"/>
        <line x1="310" x2="530" y1="160" y2="160" stroke="#5eead4" stroke-width="2" stroke-dasharray="6 5"/>
        <g font-family="Caveat,cursive" font-size="24" text-anchor="end">
          <text x="528" y="32" fill="#ffd84d">💰 BSL (el alto)</text>
          <text x="528" y="185" fill="#5eead4">💰 SSL (el bajo)</text>
        </g>
        <circle cx="170" cy="40" r="5" fill="#ffd84d"/><circle cx="310" cy="160" r="5" fill="#5eead4"/>
        <g font-size="18"><text x="62" y="82">💰</text><text x="252" y="62">💰</text><text x="210" y="125">💰</text></g>
      </svg>
      <div class="cap">Cada alto o bajo nuevo en una temporalidad alta <b>añade liquidez</b> (más "billetes") al gráfico.</div>`},

    {t:'h2', text:'Por qué el precio va a por ella', tape:'cómo lo entiende él'},
    {t:'p', cls:'detail', html:'<span class="muted">Aviso suyo: supone que las instituciones (bancos, grandes empresas) mueven el mercado. Puede que no sea así, pero así se lo explicaron y así le funciona.</span>'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 210" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="El precio recoge los stops sobre un alto y luego baja">
        <line x1="140" x2="305" y1="50" y2="50" stroke="#ffd84d" stroke-width="2" stroke-dasharray="6 5"/>
        <polyline points="15,170 70,115 140,60 190,115 240,76 262,36 305,115 400,178" fill="none" stroke="#ece9e1" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <g font-family="Caveat,cursive" font-size="21" fill="#ece9e1">
          <text x="150" y="26" fill="#ffd84d">stops de los que vendieron (= 💰)</text>
          <text x="104" y="150">① sube a una zona,</text><text x="104" y="170">baja y entran ventas</text>
          <text x="282" y="64" fill="#ff7a6b">② recoge los stops</text>
          <text x="330" y="150" fill="#5eead4">③ ahora sí baja</text>
        </g>
        <g fill="#ffd84d"><circle cx="190" cy="115" r="5"/><circle cx="262" cy="36" r="5" fill="#ff7a6b"/><circle cx="352" cy="146" r="5" fill="#5eead4"/></g>
      </svg>
      <div class="cap">Con un bajo pasa exactamente lo mismo, al revés.</div>`},
    {t:'list', items:[
      'Mucha gente ve una zona importante y entra en <b>corto</b>, con el stop justo <b>encima del alto</b>.',
      'Un stop de venta es una orden de compra pendiente: <b>es dinero</b>, liquidez.',
      'Para meter su dinero, las instituciones necesitan que haya muchas órdenes: <b>van a por esos stops</b> y los usan para vender ellas.',
      'Los que entraron en corto pierden, y el mercado hace <b>el movimiento bueno</b>, dejando otro nivel de liquidez más allá.'
    ]},

    {t:'h2', text:'Cuánta liquidez hay = hacia dónde mira el precio', tape:'lectura'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-y" style="transform:none"><h3>Arriba · BSL</h3><p style="font-size:30px;line-height:1.2">💰💰💰💰</p></div>
        <div class="card c-m" style="transform:none"><h3>Abajo · SSL</h3><p style="font-size:30px;line-height:1.2">💰</p></div>
      </div>
      <div class="cap">1 contra 4: <b>tiene sentido que el precio vaya a por los 4</b>, no a por 1.</div>`},
    {t:'cards', items:[
      {c:'b', ico:'🔁', h:'El precio quita y deja', p:'Cada vez que recoge un bajo, <b>crea otro</b>; y sigue así hasta recogerlo todo (el primero, el segundo… el quinto).'},
      {c:'c', ico:'❓', h:'Lo que aún no sabe contarte', p:'Cuándo lo recoge todo de golpe y cuándo lo va quitando <b>poco a poco</b>. Lo explicará más adelante.'},
      {c:'l', ico:'⚠️', h:'No siempre lo hace', p:'Puede pasar o no. El mercado <b>no se mueve así eternamente</b>: habrá caídas, acumulaciones y de todo.'}
    ]},

    {t:'h2', text:'La temporalidad alta manda', tape:'peso'},
    {t:'html', cls:'viz', html:`
      <div class="tfrow"><b>1 hora</b><div class="tf"><i></i></div></div>
      <div class="tfrow"><b>30 min</b><div class="tf">${'<i></i>'.repeat(2)}</div></div>
      <div class="tfrow"><b>5 min</b><div class="tf">${'<i></i>'.repeat(12)}</div></div>
      <div class="tfrow"><b>1 min</b><div class="tf dense">${'<i></i>'.repeat(60)}</div></div>
      <div class="cap">Un alto de 1 hora equivale a <b>60 velas de 1 minuto</b>. Por eso pesa más que un alto de 1 minuto.</div>`},
    {t:'p', html:'Las temporalidades <b>altas (15 min, 1 h, 4 h)</b> mandan sobre las bajas: <span class="mk">la liquidez de temporalidad alta es más importante</span>. Más importante, aunque <i>no siempre</i>. (Conecta con el <a href="#dia-4" style="color:var(--yellow)">Día 4</a>: mayor temporalidad, mayor importancia.)'},

    {t:'h2', text:'Cómo marcarla', tape:'práctica'},
    {t:'cards', items:[
      {c:'y', ico:'🎯', h:'Solo lo más prominente', p:'Marca el <b>alto y el bajo más relevantes del rango</b>, no todos los que veas.'},
      {c:'b', ico:'🔍', h:'Baja de temporalidad si hace falta', p:'No hace falta que la pareja de velas sea alcista + bajista en tu marco. Si en 15 min no ves el bajo claro, <b>en 5 min sí aparece</b>. Marcas la <b>mecha del punto más extremo</b>.'},
      {c:'m', ico:'🧹', h:'Si ya la quitó, no la marques', p:'Una liquidez que el precio ya atravesó <b>deja de contar</b>; se marca la nueva que queda.'}
    ]},

    {t:'h2', text:'Cómo se mueve el mercado', tape:'resumen'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">SSL recogida</span><span class="ar">→</span>
        <span class="s">FVG / imbalances (<a href="#dia-8" style="color:var(--yellow)">Día 8</a>)</span><span class="ar">→</span>
        <span class="s fin">BSL</span><span class="ar">→</span>
        <span class="s psi">¿va a la nueva SSL o sigue subiendo?</span>
      </div>
      <div class="cap">El mercado se mueve <b>buscando liquidez a través de imbalances</b> (los FVG, esos "cuadraditos": <a href="#dia-8" style="color:var(--yellow)">Día 8</a>). Al llegar, decide qué hacer.</div>`},

    {t:'h3', text:'📌 Su plan en 3 pasos'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s fin">① Marca tu BSL y tu SSL</span><span class="ar">→</span>
        <span class="s tec">② Espera a que quiten una de ellas</span><span class="ar">→</span>
        <span class="s psi">③ Si todo está alineado, busca el trade hacia la otra</span>
      </div>
      <div class="cap">"Todo alineado" = más cosas que irá explicando. <b>No se entra solo por ver liquidez.</b> El objetivo: estar en la hora y el momento adecuados y saber de qué zonas puede reaccionar.</div>`},
    {t:'p', cls:'detail', html:'Su ejercicio: ir al gráfico, marcar rangos, BSL y SSL, y ver cómo el precio acaba yendo por el objetivo (también cuando "la gente entra en compras" y no hay trade). La idea que debe quedarte: <b>la liquidez de alta temporalidad manda</b>.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> sus avisos sobre otras formas de ver el mercado (ICT, "el mercado es un algoritmo"), sus pausas y repeticiones, la explicación de cada ejemplo trazo a trazo y la petición de feedback. Dice que aprendió el concepto de otro creador y lo cita: en el audio suena "eTV Trading". Los tipos de liquidez están en el <a href="#dia-11" style="color:var(--yellow)">Día 11</a> y los imbalances (FVG) en el <a href="#dia-8" style="color:var(--yellow)">Día 8</a>.'}
   ]},
 { id:7, title:'La prisa', tags:['psi'], mins:11, status:'done',
   intro:'Vídeo de psicología, grabado el 1 de noviembre de 2026. Si aún no sientes la prisa, te parecerá raro; la vas a sentir, y entonces vuelve a él.',
   blocks:[
    {t:'idea', text:'Querer ganar está bien; <span class="mk">actuar con prisa</span> te devuelve al bucle. El tiempo no te hace buen trader: <span class="mk">cambiar cómo operas</span> sí.'},

    {t:'h2', text:'Qué es la prisa', tape:'concepto'},
    {t:'cards', items:[
      {c:'y', ico:'⚡', h:'Ganas ≠ prisa', p:'Tener urgencia y ganas de ganar dinero está <b>perfecto</b>. Lo que no está bien es <b>hacer las cosas por prisa</b>: aprender a toda velocidad, querer retirar ya, querer pasar la evaluación ya.'},
      {c:'b', ico:'⏳', h:'Dos meses: mucho y nada', p:'En dos meses puedes cambiar tu vida si sigues tu sistema (lo difícil es <b>seguirlo</b>, ser casi un robot). Pero las semanas vuelan, y si rompes tus reglas <b>vuelan el triple de rápido</b>.'}
    ]},

    {t:'h2', text:'El bucle falso', tape:'trampa'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">😤 Rompo reglas, gambleo</span><span class="ar">→</span>
        <span class="s">🤞 "Mañana lo hago bien"</span><span class="ar">→</span>
        <span class="s tec">🍀 Un día de suerte</span><span class="ar">→</span>
        <span class="s fin">😎 "Voy mejorando"</span><span class="ar">↺</span>
      </div>
      <div class="cap">Él miró atrás <b>4 meses</b> y estaba igual que el día que compró su primera cuenta. Todo ese tiempo era <b>autoengaño</b>.</div>`},
    {t:'quote', text:'El tiempo no te hace buen trader. Lo que te hace buen trader es cambiar tú y empezar a hacer las cosas bien.', src:'Idea central del vídeo (parafraseada)'},
    {t:'cards', items:[
      {c:'m', ico:'🪞', h:'Mira dónde estabas hace 6 meses', p:'La frase que le hizo clic. Compárate con hace 4–6 meses: <b>¿operas distinto o igual?</b>'}
    ]},

    {t:'h2', text:'Cambia el objetivo', tape:'enfoque'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-c" style="transform:none"><h3>Con prisa</h3><p>"Quiero pasar una evaluación / retirar <b>antes de que acabe el año</b>." Presión y prisa <b>innecesarias</b>: no hay necesidad.</p></div>
        <div class="card c-m" style="transform:none"><h3>De proceso</h3><p>"Quiero que <b>2027 sea diferente a 2026</b>": sin gastar sin parar en evaluaciones, sin perder dinero que no puedo perder, sin vivir rayado con el gráfico.</p></div>
      </div>
      <div class="cap">Si cambias el enfoque, <b>irónicamente</b> es cuando llegas antes al retiro.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🧘', h:'Busca esta sensación', p:'La de 3 días haciéndolo todo bien: trabajas de verdad, <b>miras si está tu sistema</b>, entras, y si pierdes cierras el ordenador y sigues con tu día. Repítela dos meses.'},
      {c:'l', ico:'😠', h:'Perder y enfadarse es normal', p:'No existe "no tener emociones". Lo importante es qué haces: <b>no pasa nada, no se ha muerto nadie</b>.'}
    ]},

    {t:'h2', text:'Pregúntate para qué tienes prisa', tape:'el porqué'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">Quiero pasar la evaluación</span><span class="ar">→</span>
        <span class="s">¿Para qué? Para estar fondeado</span><span class="ar">→</span>
        <span class="s psi">¿Cómo la trato? Gambleando, sin sistema</span><span class="ar">→</span>
        <span class="s fin">Si la paso, la fondeada la pierdo</span>
      </div>
      <div class="cap">Quería <b>llegar a una cuenta fondeada sin poder mantenerla</b>. Estuvo 6 meses con esa frase en la cabeza.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'💥', h:'Por qué muchos retiran una vez y lo queman todo', p:'Porque no están preparados: saben que fue <b>suerte</b>, sin habilidad ni buena psicología detrás.'},
      {c:'b', ico:'🏗️', h:'Su caso', p:'Tardó 11 meses en pasar la primera evaluación y los usó para curtirse. Su primer retiro <b>de verdad</b> llegó haciéndolo todo bien: buen riesgo y buena mentalidad.'}
    ]},

    {t:'h2', text:'Qué hacer estos dos meses', tape:'práctica'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Busca setups que te gusten</span><span class="ar">→</span>
        <span class="s">¿Me gusta de verdad?</span><span class="ar">→</span>
        <span class="s">¿Me enfadaría si pierde?</span><span class="ar">→</span>
        <span class="s fin">Si lo tengo claro, entro</span>
      </div>
      <div class="cap">Hazlo <b>60 días</b>. Construye la habilidad, no persigas el retiro.</div>`},
    {t:'cards', items:[
      {c:'m', ico:'🌿', h:'No pasa nada si no operas', p:'No pasa nada por pasar una semana o tres días sin operar.'},
      {c:'y', ico:'⚖️', h:'Pon todo en perspectiva', p:'Un trade que no te gustaba y se va al take profit: no pasa nada. Si hubiera ido al stop dirías <b>"menos mal que no entré"</b>. Es fácil quejarse solo cuando sale bien.'}
    ]},
    {t:'mine', id:'d7-prisa', h:'¿Qué prisa tengo yo?', lab:'Esto es tuyo', ph:'En qué voy con prisa (retirar, pasar un challenge, recuperar lo perdido…) y qué quiero que sea distinto estos 2 meses…',
     hint:'Tu meta a 1 año es de resultado; este vídeo dice que lo que importa es el proceso de ahora. Y tienes challenges abiertos: ¿cómo quieres tratarlos?', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> las bromas del inicio (Halloween), sus cifras de retiros y su situación personal, los detalles de las cuentas con activación de hace años y el anuncio del siguiente vídeo. Quedan las ideas de psicología. <b>Siguiente: Día 8, los FVG (fair value gaps), que él llama también imbalances.</b>'}
   ]},
 { id:8, title:'FVG: fair value gaps', tags:['tec'], mins:21, status:'done',
   intro:'Uno de los conceptos clave del curso: son los "imbalances" del Día 6 y, según dice, también su sistema de entrada (lo desarrollará más adelante). Aquí solo se explica qué son y cómo se leen.',
   blocks:[
    {t:'idea', text:'Un FVG es un <span class="mk">hueco entre tres velas</span> que actúa como <span class="mk">imán</span>: el precio vuelve a tocarlo y <span class="mk">continúa en su dirección</span>. Si una vela cierra al otro lado, <span class="mk">se invierte</span>.'},

    {t:'h2', text:'Qué es un FVG', tape:'definición'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 200" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="FVG alcista y bajista">
        <rect x="4" y="4" width="262" height="172" rx="10" fill="#CAC8C8"/><rect x="274" y="4" width="262" height="172" rx="10" fill="#CAC8C8"/>
        <rect x="26" y="100" width="232" height="25" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        ${cd(40,125,168,135,162,0)}${cd(80,30,140,40,130,1)}${cd(120,18,100,28,90,1)}
        <rect x="296" y="70" width="232" height="25" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        ${cd(310,28,70,38,64,0)}${cd(350,45,160,55,150,0)}${cd(390,95,168,105,160,0)}
        <g font-family="Caveat,cursive" font-size="17" fill="#222" text-anchor="end">
          <text x="254" y="95">mín. de la vela 3</text><text x="254" y="142">máx. de la vela 1</text>
          <text x="524" y="64">mín. de la vela 1</text><text x="524" y="112">máx. de la vela 3</text>
        </g>
        <g font-family="Caveat,cursive" font-size="23" fill="#7a4b00" text-anchor="middle"><text x="190" y="50">FVG alcista</text><text x="460" y="150">FVG bajista</text></g>
        <g font-family="Caveat,cursive" font-size="20" fill="#ece9e1" text-anchor="middle"><text x="40" y="195">1</text><text x="80" y="195">2</text><text x="120" y="195">3</text><text x="310" y="195">1</text><text x="350" y="195">2</text><text x="390" y="195">3</text></g>
      </svg>
      <div class="cap">Tres velas seguidas. El cuadradito es el <b>hueco entre la mecha de la 1.ª y la mecha de la 3.ª</b>.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'3️⃣', h:'Tres velas, sin importar el color', p:'Gris-gris-negra, negra-gris… <b>el color da igual</b>. Lo que importa es la secuencia de tres.'},
      {c:'b', ico:'📏', h:'El tamaño no importa', p:'Pequeño o grande, <b>mientras haya hueco, es un FVG</b>.'},
      {c:'m', ico:'↕️', h:'Alcista y bajista', p:'En una subida el FVG es <b>alcista</b>; en una caída, <b>bajista</b>. Se dibuja igual: el cuadradito en el espacio en blanco.'}
    ]},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 175" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Con hueco hay FVG, sin hueco no">
        <rect x="4" y="4" width="262" height="140" rx="10" fill="#CAC8C8"/><rect x="274" y="4" width="262" height="140" rx="10" fill="#CAC8C8"/>
        <rect x="26" y="78" width="232" height="22" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        ${cd(40,100,135,108,130,0)}${cd(80,28,125,38,115,1)}${cd(120,22,78,30,70,1)}
        ${cd(310,100,135,108,130,0)}${cd(350,28,125,38,115,1)}${cd(390,50,112,56,104,1)}
        <line x1="296" x2="524" y1="100" y2="100" stroke="#a02020" stroke-width="1.5" stroke-dasharray="5 4"/><line x1="296" x2="524" y1="112" y2="112" stroke="#a02020" stroke-width="1.5" stroke-dasharray="5 4"/>
        <g font-family="Caveat,cursive" font-size="21" text-anchor="middle"><text x="140" y="165" fill="#5eead4">✔ hay hueco = FVG</text><text x="405" y="165" fill="#ff7a6b">✘ se solapan = no hay FVG</text></g>
      </svg>
      <div class="cap">Si las mechas se pisan no hay agujero, y <b>muchas veces no se abre ninguno</b>. Hay que comprobarlo, no suponerlo.</div>`},

    {t:'h2', text:'Por qué importa: el imán', tape:'idea clave'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 205" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="El precio sube de FVG en FVG hasta la liquidez">
        <line x1="8" x2="150" y1="178" y2="178" stroke="#5eead4" stroke-width="2" stroke-dasharray="6 5"/>
        <line x1="262" x2="532" y1="28" y2="28" stroke="#ffd84d" stroke-width="2" stroke-dasharray="6 5"/>
        <rect x="88" y="116" width="70" height="14" fill="#ffd84d" fill-opacity=".5" stroke="#ffd84d"/><rect x="178" y="74" width="76" height="14" fill="#ffd84d" fill-opacity=".5" stroke="#ffd84d"/>
        <polyline points="30,178 92,108 112,130 190,66 206,86 262,28" fill="none" stroke="#ece9e1" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <g font-family="Caveat,cursive" font-size="21">
          <text x="10" y="199" fill="#5eead4">💰 SSL (ya quitada)</text>
          <text x="530" y="20" fill="#ffd84d" text-anchor="end">💰 BSL (el objetivo)</text>
          <text x="124" y="110" fill="#ffd84d">FVG</text><text x="218" y="66" fill="#ffd84d">FVG</text>
          <g fill="#ece9e1"><text x="290" y="112">se crea el FVG,</text><text x="290" y="136">actúa de imán,</text><text x="290" y="160">el precio vuelve a tocarlo</text><text x="290" y="184">y sigue hasta la liquidez</text></g>
        </g>
      </svg>
      <div class="cap">Es la pieza que faltaba del Día 6: el precio va de una liquidez a otra <b>pasando de FVG en FVG</b>.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🧲', h:'Hacen que el precio continúe', p:'La mayoría de las veces el precio <b>va a buscar los FVG</b> y, al tocarlos, sigue en su misma dirección. "Tocar" es <b>entrar en el cuadradito</b>, no hace falta llegar al otro lado.'},
      {c:'l', ico:'🔁', h:'Se crean todo el rato', p:'En una tendencia se abren FVG constantemente: sube, toca el FVG, sigue; abre otro, lo toca, sigue. Con la caída pasa igual. <b>Solo buscas continuación de la tendencia.</b>'},
      {c:'c', ico:'⚠️', h:'No siempre se cumple', p:'Si no, acertaríamos el 100 %. Mira ejemplos donde el precio <b>ni siquiera entra</b>. Funciona mejor cuando está alineado con una buena dirección (las zonas y confirmaciones, más adelante).'}
    ]},

    {t:'h2', text:'Respetado o no respetado', tape:'lo importante'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 238"style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="FVG alcista respetado y no respetado">
        <rect x="4" y="4" width="262" height="172" rx="10" fill="#CAC8C8"/><rect x="274" y="4" width="262" height="172" rx="10" fill="#CAC8C8"/>
        <rect x="24" y="100" width="236" height="25" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        ${cd(38,125,168,135,162,0)}${cd(66,35,145,45,135,1)}${cd(94,20,100,28,90,1)}${cd(160,70,142,78,116,0)}${cd(196,40,125,50,112,1)}${cd(232,20,70,28,62,1)}
        <rect x="294" y="100" width="236" height="25" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        ${cd(308,125,168,135,162,0)}${cd(336,35,145,45,135,1)}${cd(364,20,100,28,90,1)}${cd(430,70,158,78,150,0)}${cd(466,110,170,125,165,0)}
        <g font-family="Caveat,cursive" text-anchor="middle">
          <text x="135" y="196" font-size="24" fill="#5eead4">✔ RESPETADO</text><text x="135" y="214" font-size="18" fill="#ece9e1">la mecha lo cruza,</text><text x="135" y="229" font-size="18" fill="#ece9e1">el cierre queda dentro</text>
          <text x="405" y="196" font-size="24" fill="#ff7a6b">✘ NO respetado</text><text x="405" y="214" font-size="18" fill="#ece9e1">una vela cierra por debajo</text><text x="405" y="229" font-size="18" fill="#ece9e1">→ esperas bajada</text>
        </g>
      </svg>
      <div class="cap">FVG alcista. La mecha da igual (mucha o poca): <b>lo que cuenta es dónde cierra el cuerpo</b>.</div>`},
    {t:'list', items:[
      '<b>Respetado:</b> el precio baja a tocar el FVG y el cuerpo de la vela (o velas) que lo toca <b>no cierra por debajo</b>. Esperas que siga la subida.',
      '<b>No respetado:</b> una vela <b>cierra por debajo</b> del cuadradito. Ahora esperas bajada, no subida.',
      '<b>Bajista:</b> exactamente al revés (no debe cerrar por encima).',
      'Así es fácil saber si el precio quiere subir o bajar: <b>solo miras si el FVG se respeta o no</b>.'
    ]},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-m" style="transform:none"><h3>Misma temporalidad</h3><p>Si el FVG es de <b>5 min</b>, lo juzgas con el cierre de <b>5 min</b>. Una vela de 5 min son cinco de 1 min.</p></div>
        <div class="card c-c" style="transform:none"><h3>No te líes con el marco pequeño</h3><p>Que en <b>1 min</b> cierre por debajo no lo invalida. Si en 5 min sigue aguantando, <b>sigue respetado</b>.</p></div>
      </div>
      <div class="cap">Regla: marca el FVG en un marco y <b>espera al cierre de ese mismo marco</b>.</div>`},

    {t:'h2', text:'Adelanto: IFVG', tape:'se verá más adelante'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">FVG alcista: esperas subida</span><span class="ar">→</span>
        <span class="s psi">una vela cierra por debajo</span><span class="ar">→</span>
        <span class="s fin">IFVG (inverse FVG): esperas que el precio se dé la vuelta y busque tendencia bajista</span>
      </div>
      <div class="cap">Un FVG que se ha <b>invertido</b>. Lo llama "la joya de la corona"; la clase completa está en el <a href="#dia-13" style="color:var(--yellow)">Día 13</a> (el <b>change in state of delivery</b>, más adelante).</div>`},
    {t:'p', cls:'detail', html:'Su ejercicio: marcar FVG alcistas y bajistas al azar en el gráfico y ver qué hace el precio cuando se respetan y cuando no. Si ya vas más avanzado, marca también BSL y SSL del rango y alinea los FVG con la liquidez del <a href="#dia-6" style="color:var(--yellow)">Día 6</a>. Dice que los FVG son también su sistema de entrada: lo verá más adelante.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los ejemplos concretos sobre gráficos reales, que repasa uno a uno (los dibujos de esta hoja son esquemas míos, no copias de los suyos), las bromas y las pausas. Falta por llegar: cuándo un FVG tiene más probabilidad de respetarse (zonas y confirmaciones), el IFVG y el CISD, y la liquidez parte 2.'}
   ]},
 { id:9, title:'Miedo a perder', tags:['psi'], mins:8, status:'done',
   intro:'Vídeo corto de psicología. Su método para cualquier problema psicológico, aplicado al miedo a perder: identificar la causa y solucionarla.',
   blocks:[
    {t:'idea', text:'Cuando tengas miedo, no te quedes en "la psicología es difícil": <span class="mk">pregúntate por qué te pasa y qué haces para que no vuelva a pasar</span>. El miedo a perder casi siempre se arregla con <span class="mk">menos riesgo y más confianza en tu sistema</span>.'},

    {t:'h2', text:'El método: no basta con apuntarlo', tape:'clave'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">1 · ¿Qué me pasa?</span><span class="ar">→</span>
        <span class="s">2 · ¿Por qué me pasa?</span><span class="ar">→</span>
        <span class="s tec">3 · ¿Qué hago para que no vuelva a pasar?</span><span class="ar">→</span>
        <span class="s fin">Revisarlo</span>
      </div>
      <div class="cap">Un problema (o dos) cada semana. Llega un momento en que se nota <b>una mejora muy grande</b>.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'📓', h:'Apuntar sin revisar = no apuntar', p:'Según él, la mayoría ni lo apunta; algunos sí; y <b>menos del 1 %</b> se pregunta por qué lo hizo y cómo lo soluciona. Si lo apuntas, <b>revísalo</b> (opinión suya: si no vas a revisarlo, es como no haberlo escrito).'},
      {c:'y', ico:'🛠️', h:'Es analizar y resolver', p:'Decir "no sé cómo parar" no sirve. <b>Analiza el problema y resuélvelo.</b> Es difícil, pero los pasos son esos.'}
    ]},

    {t:'h2', text:'Por qué te da miedo perder', tape:'causas'},
    {t:'p', html:'Con miedo ya <b>no estás pensando en trading</b>, estás pensando en perder dinero: el enfoque es nefasto. Y acabas actuando por emociones, fuera del sistema.'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">😨 Miedo a entrar</span><span class="ar">→</span>
        <span class="s">entro tarde</span><span class="ar">→</span>
        <span class="s">me pongo nervioso</span><span class="ar">→</span>
        <span class="s">cierro antes</span><span class="ar">→</span>
        <span class="s fin">llega al take profit y pierdo</span>
      </div>
      <div class="cap">El bucle del miedo: ya estás <b>fuera de la estrategia</b>.</div>`},

    {t:'h2', text:'Dos casos, dos soluciones', tape:'ejemplos'},
    {t:'html', cls:'viz', html:`
      <div class="card c-b" style="transform:none;margin-bottom:12px"><h3>Caso 1 · Perder la cuenta</h3>
        <div class="road" style="justify-content:flex-start">
          <span class="s">No entro por miedo al stop</span><span class="ar">→</span>
          <span class="s">¿Por qué? Una pérdida me deja la cuenta casi perdida (y cuesta dinero)</span><span class="ar">→</span>
          <span class="s fin">Bajo el riesgo</span>
        </div></div>
      <div class="card c-l" style="transform:none"><h3>Caso 2 · No confío en el sistema</h3>
        <div class="road" style="justify-content:flex-start">
          <span class="s">Se va el trade sin mí</span><span class="ar">→</span>
          <span class="s">¿Por qué no entré? No confío en mi estrategia</span><span class="ar">→</span>
          <span class="s">¿Por qué? Vengo de perder trades que tomé gambleando</span><span class="ar">→</span>
          <span class="s fin">Práctica, journal revisado y backtesting</span>
        </div></div>
      <div class="cap">En el caso 2 las pérdidas fueron <b>culpa tuya, no de la estrategia</b>. Con confianza y un buen riesgo, ya confías en tu stop y en tu take profit.</div>`},
    {t:'cards', items:[
      {c:'m', ico:'🔽', h:'Riesgo más bajo', p:'Si estás más cómodo y lejos de perder la cuenta, <b>no dudas al entrar</b> y no hay miedo a perder. (El sobre-riesgo tras perder, en el <a href="#dia-14" style="color:var(--yellow)">Día 14</a>.)'},
      {c:'b', ico:'🧪', h:'Confianza = práctica', p:'Practicar más, tomar apuntes del diario, revisar tus entradas y hacer <b>backtesting</b> (la práctica de la estrategia; en el <a href="#dia-12" style="color:var(--yellow)">Día 12</a> cuenta cómo le dio seguridad).'}
    ]},

    {t:'h2', text:'Lo que pasa si no entras', tape:'trampa'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">Veo una entrada que me gusta y no entro</span><span class="ar">→</span>
        <span class="s">Se va y "todo el mundo" la cogió</span><span class="ar">→</span>
        <span class="s psi">Siento que me lo merecía</span><span class="ar">→</span>
        <span class="s">Cojo otra 20 min después y pierdo</span>
      </div>
      <div class="cap">Pasas de <b>un día positivo a uno negativo</b> con la psicología mal, por no seguir tus reglas.</div>`},

    {t:'h2', text:'Antes de la cuenta fondeada', tape:'confianza'},
    {t:'cards', items:[
      {c:'y', ico:'🏋️', h:'Practica antes de comprar', p:'Antes de comprar una cuenta o de operar tu dinero: <b>practicar, practicar, practicar</b>. Mucha gente compra una cuenta pensando "no sé si pasaré la primera".'},
      {c:'l', ico:'💪', h:'Ve con la mentalidad de pasarla', p:'"Esta cuenta la paso y le saco retiro": porque sabes hacer trading, tienes buen riesgo y has practicado. Si se pierde (algunas se pierden), <b>pillas otra con confianza</b>.'}
    ]},
    {t:'mine', id:'d9-miedo', h:'¿Qué me da miedo a mí?', lab:'Esto es tuyo', ph:'Cuando no entro a un trade que se presenta: qué miedo hay detrás y por qué creo que me pasa…',
     hint:'Aplica los 3 pasos: qué me pasa, por qué y qué hago. Tus 3 horas semanales de backtesting son justo la herramienta que propone para ganar confianza.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> el comentario sobre su nuevo ángulo de cámara, sus ejemplos de precios de cuentas de hace años y el anuncio de los próximos vídeos. <b>Dice que la confianza en la estrategia tendrá un vídeo aparte</b> (afirma que el 99 % de la gente no confía en la suya). Siguiente: un vídeo corto de noticias, luego psicología y la liquidez parte 2.'}
   ]},
 { id:10, title:'Noticias', tags:['rut','tec'], mins:9, status:'done',
   intro:'Vídeo corto y práctico: cuándo se opera, qué días hay que tener cuidado o no operar, y la regla de no operar justo antes de una noticia. Es de lo poco que se mira antes de abrir el gráfico.',
   blocks:[
    {t:'idea', text:'Se opera la <span class="mk">sesión de Nueva York</span> y, antes de abrir el gráfico, <span class="mk">se mira el calendario</span>: hay días que no se opera, días con cuidado y una regla fija: <span class="mk">nunca operar justo antes de una noticia</span>.'},

    {t:'h2', text:'Cuándo se opera', tape:'sesión'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 140" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Sesión de Nueva York en hora de Nueva York y de España">
        <line x1="30" x2="510" y1="63" y2="63" stroke="#9aa0ab" stroke-width="2"/>
        <rect x="210" y="50" width="180" height="26" rx="6" fill="#ffd84d" fill-opacity=".9"/>
        <circle cx="90" cy="63" r="7" fill="#ff7a6b"/>
        <g font-family="Caveat,cursive" text-anchor="middle">
          <text x="300" y="69" font-size="20" fill="#1a1d24">SESIÓN NY</text>
          <g font-size="22" fill="#ece9e1"><text x="90" y="36">8:30</text><text x="210" y="36">9:30</text><text x="390" y="36">11:00</text></g>
          <g font-size="20" fill="#9aa0ab"><text x="90" y="104">14:30</text><text x="210" y="104">15:30</text><text x="390" y="104">17:00</text></g>
          <text x="90" y="126" font-size="18" fill="#ff7a6b">📰 noticias</text>
          <text x="22" y="16" font-size="16" fill="#9aa0ab" text-anchor="start">arriba: hora de Nueva York · abajo: hora de España</text>
        </g>
      </svg>
      <div class="cap">Se opera de <b>9:30 a 11:00 (Nueva York)</b> = <b>15:30 a 17:00 en España</b>. Las noticias de las 8:30 salen antes de abrir el mercado.</div>`},
    {t:'p', cls:'detail', html:'<span class="muted">Dato mío, no del vídeo: durante unas semanas al año (finales de marzo y finales de octubre/principios de noviembre) el desfase España–Nueva York es de 5 horas en vez de 6, y la sesión cae una hora antes en España. Conviene comprobarlo en esas fechas.</span>'},
    {t:'cards', items:[
      {c:'m', ico:'😌', h:'No hay que vivir pendiente', p:'No hay que estar mirando noticias, YouTube o Twitter todo el rato. Él ni sabe qué son la mayoría. <b>No le hace falta y no quiere complicarse.</b>'},
      {c:'b', ico:'🔜', h:'Más adelante', p:'Algunas noticias previas a la apertura se pueden usar a favor: su alto y su bajo son un tipo de liquidez, los <b>data highs/lows</b> (<a href="#dia-11" style="color:var(--yellow)">Día 11</a>). El <b>PO3</b> llegará más adelante.'}
    ]},

    {t:'h2', text:'Qué días tener en cuenta', tape:'calendario'},
    {t:'cards', items:[
      {c:'c', ico:'🛑', h:'FOMC → no opera', p:'Los días de FOMC <b>descansa</b>: ni abre el gráfico.'},
      {c:'y', ico:'⚠️', h:'NFP → con cuidado', p:'Si no ve nada que le guste, no opera. El precio suele ir lento y prefiere no operar así.'},
      {c:'b', ico:'📊', h:'CPI → alto impacto, pero opera', p:'Es de alto impacto, pero <b>a él le gusta</b> y puede operarlo. Con cuidado.'},
      {c:'m', ico:'🕊️', h:'"No News Monday" → con cuidado', p:'Lunes sin ninguna noticia (casilla blanca): el precio probablemente se mueva lento.'},
      {c:'l', ico:'🏛️', h:'Bank Holiday → ni te presentes', p:'Carpeta gris = festivo en EE. UU.: <b>el mercado no abre</b> (o no tiene sentido). "Está cerrado el cole."'},
      {c:'b', ico:'📰', h:'El resto de noticias', p:'Paro, PPI, ventas minoristas, confianza del consumidor…: importantes, <b>pero menos</b>. Hay formas de operarlas.', detail:true}
    ]},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">"Ir con cuidado" =</span><span class="ar">→</span>
        <span class="s fin">si no veo nada que me guste, no opero</span>
      </div>
      <div class="cap muted">Siglas (dato mío): FOMC = reunión de la Reserva Federal · CPI = inflación · NFP = empleo en EE. UU.</div>`},

    {t:'h2', text:'La regla: nunca antes de una noticia', tape:'regla fija'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Noticia a las 10:00</span><span class="ar">→</span>
        <span class="s">9:55 aparece una entrada de mi estrategia</span><span class="ar">→</span>
        <span class="s psi">NO entro</span><span class="ar">→</span>
        <span class="s fin">espero a ver qué hace la noticia</span>
      </div>
      <div class="cap">Lo mismo con una noticia a las 9:45 y una entrada a las 9:42. <b>No sabes qué hará la noticia: es aleatorio.</b> Aunque el sentimiento del mercado dé pistas, él no se la juega.</div>`},
    {t:'p', html:'<span class="muted">⚠️ Dice a veces "3 minutos" y a veces "5 minutos" antes (sus ejemplos van de 9:42 para las 9:45 a 9:55 para las 10:00). Por prudencia, apúntalo como <b>entre 3 y 5 minutos</b>.</span>'},

    {t:'h2', text:'Dónde mirarlo: ForexFactory', tape:'herramienta'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">① forexfactory.com</span><span class="ar">→</span>
        <span class="s tec">② Reloj: <b>Eastern Time (New York, USA y Canadá)</b></span><span class="ar">→</span>
        <span class="s">③ Embudo: quita las carpetas amarillas y todas las monedas menos el <b>USD</b></span><span class="ar">→</span>
        <span class="s fin">④ Aplica el filtro</span>
      </div>
      <div class="cap">Solo el dólar afecta al Nasdaq y al S&amp;P 500. La hora va siempre en <b>horario de Nueva York</b>, igual que en TradingView.</div>`},
    {t:'cards', items:[
      {c:'b', ico:'🕣', h:'Cómo se lee', p:'La hora sale en cada noticia (<b>8:30</b> = antes de que abra el mercado). Casilla <b>blanca</b> = día sin noticias. Carpeta <b>gris</b> = Bank Holiday.'},
      {c:'y', ico:'🔁', h:'Se repiten cada mes', p:'Con práctica verás que las noticias son <b>siempre las mismas</b>, se repiten cada mes, y sabrás cómo esperarte.'}
    ]},
    {t:'p', html:'Su consejo: <b>revisar estas noticias cada día antes de operar</b>, por si hay una de alto impacto, un festivo o una noticia a las 10 que te impide operar justo antes.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los ejemplos de las noticias de esa semana (jobs openings, PMI…), su comentario sobre operar "de forma chill", y la promoción de su comunidad gratuita. Dice que más adelante hará un vídeo con las sesiones y sus horas.'}
   ]},
 { id:11, title:'Tipos de liquidez', tags:['tec'], mins:18, status:'done',
   intro:'Liquidez parte 2: los tipos de liquidez que él usa a diario. Son 6, y dice que normalmente usa 5 (el primero es prescindible). Solo hay que aprender qué es cada uno y dónde se marca.',
   blocks:[
    {t:'idea', text:'Hay <span class="mk">6 tipos de liquidez</span> que el precio va a buscar: sirven de <span class="mk">objetivo</span> y de <span class="mk">punto de reacción</span>. Y una regla: <span class="mk">no pongas tu stop donde hay liquidez acumulada</span>.'},

    {t:'h2', text:'Los 6 de un vistazo', tape:'resumen'},
    {t:'cards', items:[
      {c:'b', ico:'📅', h:'PDH · PDL', p:'Máximo y mínimo del <b>día anterior</b>. Se marcan en el diario. Es el que dice que se puede saltar.'},
      {c:'y', ico:'⚖️', h:'EH · EL', p:'<b>Equal highs / equal lows</b>: dos mechas exactamente a la misma altura.'},
      {c:'m', ico:'≈', h:'REH · REL', p:'<b>Relative</b> equal highs / lows: casi iguales.'},
      {c:'l', ico:'📰', h:'Data highs · lows', p:'Máximo y mínimo de la <b>vela de la noticia</b>.'},
      {c:'c', ico:'🕳️', h:'NDOG · NWOG', p:'<b>New day / new week opening gap</b>: el hueco que deja el mercado al abrir el día o la semana.'},
      {c:'y', ico:'🪜', h:'LRL', p:'<b>Low resistance liquidity</b>: muchos altos o bajos alineados que nunca se quitan.'}
    ]},
    {t:'p', cls:'detail', html:'<span class="muted">Dice que los que mejor le funcionan son <b>NDOG/NWOG</b> y <b>LRL</b>, junto con los <b>equal highs</b>. Y que el que más usa, "la joya de la corona", es el <b>LRL</b>. Como siempre: <b>a mayor temporalidad, más importancia</b>.</span>'},

    {t:'h2', text:'Referencias: el día anterior y la noticia', tape:'1 y 4'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 198" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="PDH y PDL, data high y data low">
        <rect x="4" y="4" width="262" height="166" rx="10" fill="#CAC8C8"/><rect x="274" y="4" width="262" height="166" rx="10" fill="#CAC8C8"/>
        <line x1="40" x2="258" y1="30" y2="30" stroke="#a02020" stroke-width="2" stroke-dasharray="6 5"/><line x1="40" x2="258" y1="140" y2="140" stroke="#1b6b5a" stroke-width="2" stroke-dasharray="6 5"/>
        ${cd(40,30,140,50,125,1)}
        <polyline points="82,100 126,76 168,52 196,30 222,78 250,138" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <line x1="310" x2="528" y1="40" y2="40" stroke="#a02020" stroke-width="2" stroke-dasharray="6 5"/><line x1="310" x2="528" y1="125" y2="125" stroke="#1b6b5a" stroke-width="2" stroke-dasharray="6 5"/>
        ${cd(310,40,125,55,110,0)}
        <line x1="372" x2="372" y1="18" y2="162" stroke="#555" stroke-width="1.5" stroke-dasharray="3 4"/>
        <polyline points="372,88 402,64 434,40 458,72 494,124" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <g font-family="Caveat,cursive" font-size="19" fill="#222" text-anchor="end"><text x="258" y="24">PDH</text><text x="258" y="158">PDL</text><text x="528" y="34">data high</text><text x="528" y="152">data low</text></g>
        <g font-family="Caveat,cursive" font-size="16" fill="#444" text-anchor="middle"><text x="310" y="160">8:30</text><text x="372" y="14">9:30</text></g>
        <g font-family="Caveat,cursive" font-size="19" fill="#ece9e1" text-anchor="middle"><text x="135" y="192">PDH / PDL (el día anterior)</text><text x="405" y="192">Data high / low (noticia)</text></g>
      </svg>
      <div class="cap">El precio suele <b>visitar un extremo y reaccionar hacia el otro</b>, en cualquier sentido.</div>`},
    {t:'cards', items:[
      {c:'b', ico:'📅', h:'PDH / PDL', p:'Se marcan en el <b>gráfico diario</b> (cada vela = 24 h): la mecha más alta y más baja de la última vela diaria. El precio tiende a visitarlos y dar <b>reacción</b>, como una BSL o una SSL. Ejemplo suyo: el PDH alineado con un <b>FVG bajista</b>, y reacción hacia el PDL.'},
      {c:'l', ico:'📰', h:'Data highs / lows', p:'El alto y el bajo de la <b>vela de la noticia</b> (casi siempre la de las 8:30). Hacia las 9:30 el precio suele ir a por uno y reaccionar hacia el otro. <b>Se marca la mecha</b>; si no hay, el cuerpo. Sirve de objetivo y de reacción, y a veces ni llega al otro lado, pero la reacción ya es una gran oportunidad.'},
      {c:'y', ico:'🕙', h:'Noticia a las 10:00', p:'Como no se opera antes, <b>esperas a que salga</b>: la noticia crea un alto y un bajo, y esperas a que quite uno para ir a por el otro. (Ver <a href="#dia-10" style="color:var(--yellow)">Día 10</a>.)'}
    ]},

    {t:'h2', text:'Equal highs y equal lows', tape:'regla sagrada'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 198" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Equal highs, relative equal highs y un caso que no cuenta">
        <rect x="4" y="4" width="170" height="146" rx="10" fill="#CAC8C8"/><rect x="184" y="4" width="170" height="146" rx="10" fill="#CAC8C8"/><rect x="364" y="4" width="172" height="146" rx="10" fill="#CAC8C8"/>
        ${cd(50,40,125,58,112,1)}${cd(125,40,128,62,114,1)}
        <line x1="26" x2="152" y1="40" y2="40" stroke="#a02020" stroke-width="2" stroke-dasharray="6 5"/>
        ${cd(230,40,125,58,112,1)}${cd(305,47,128,66,116,1)}
        <line x1="206" x2="332" y1="40" y2="40" stroke="#a02020" stroke-width="1.5" stroke-dasharray="6 5"/><line x1="206" x2="332" y1="47" y2="47" stroke="#a02020" stroke-width="1.5" stroke-dasharray="6 5"/>
        ${cd(410,52,125,70,114,1)}${cd(485,26,128,44,116,1)}
        <line x1="386" x2="512" y1="52" y2="52" stroke="#777" stroke-width="1.5" stroke-dasharray="6 5"/>
        <g font-size="18"><text x="82" y="30">💰</text><text x="262" y="30">💰</text></g>
        <g font-family="Caveat,cursive" font-size="19" fill="#ece9e1" text-anchor="middle">
          <text x="89" y="170" fill="#ffd84d">EH · EL</text><text x="89" y="190">exactamente iguales</text>
          <text x="269" y="170" fill="#ffd84d">REH · REL</text><text x="269" y="190">casi iguales</text>
          <text x="450" y="170" fill="#ff7a6b">✘ no cuenta</text><text x="450" y="190">el 2.º ya superó al 1.º</text>
        </g>
      </svg>
      <div class="cap">Lo que interesa es que <b>el dinero aún no se haya cogido</b>: dos altos pendientes = doble liquidez.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'⛔', h:'Regla sagrada', p:'<b>Nunca operar en contra de equal highs o equal lows.</b> Un corto con unos EH encima tiene el stop <b>desprotegido</b>: es "un caramelito" para que el mercado se lleve ese dinero y luego se gire.'},
      {c:'b', ico:'🗂️', h:'Marcos', p:'Se miran <b>de 5 minutos a diario</b>. Hay equal highs de 5 min, y de 1 hora aún mejores: cuanta más temporalidad, más fuerza.'},
      {c:'m', ico:'🧠', h:'REL: el precio "marea"', p:'Con unos relative equal lows debajo, hay mucha gente en largos "superprotegida". Antes de subir, el precio <b>da stop a todo el mundo</b>; entonces entran los ganadores y sube hasta la siguiente BSL.'},
      {c:'y', ico:'🎯', h:'Úsalos de objetivo', p:'La mayoría de las veces interesa <b>esperar a que se quiten</b> o buscar un trade <b>hacia</b> ellos. Y suelen alinearse con un FVG (ej.: EH + gap bajista de 1 h).'},
      {c:'l', ico:'🛠️', h:'Indicador de TradingView', p:'Usa un indicador de equal highs/lows que dibuja una línea roja. <b>El nombre del autor no se entiende en el audio</b> ("JZS Tour"), así que confirma el nombre y su configuración en el vídeo (≈ 5:00–6:00).', detail:true}
    ]},

    {t:'h2', text:'NDOG y NWOG', tape:'huecos de apertura'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 172" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Hueco de apertura semanal que el precio vuelve a tocar">
        <rect x="4" y="4" width="532" height="142" rx="10" fill="#CAC8C8"/>
        <rect x="30" y="70" width="490" height="30" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        ${cd(50,92,142,100,135,1)}${cd(92,36,80,44,72,1)}
        <polyline points="100,42 150,22 210,30 262,58 300,88 340,62 410,28 480,14" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <g font-family="Caveat,cursive" text-anchor="middle"><text x="400" y="92" font-size="22" fill="#7a4b00">NWOG / NDOG</text><text x="300" y="126" font-size="18" fill="#222">el precio vuelve a tocar el hueco y sigue</text><text x="50" y="164" font-size="17" fill="#ece9e1">vie</text><text x="92" y="164" font-size="17" fill="#ece9e1">lun</text></g>
      </svg>
      <div class="cap">Hueco blanco entre el cierre y la apertura. De viernes a lunes = <b>semanal (NWOG)</b>; entre otros días = <b>diario (NDOG)</b>. Misma importancia.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'🧲', h:'Actúa como un FVG', p:'Es un imán que ayuda al precio a <b>continuar su tendencia</b>. Dos opciones según el mercado: buscar una compra hacia el hueco, o <b>esperar a que lo toque</b> y que luego siga.'},
      {c:'y', ico:'⛔', h:'Nunca en contra', p:'<b>Nunca operes en contra de un NDOG o NWOG.</b> Aunque la subida parezca continuar, el precio puede ir "directito" a por el hueco.'}
    ]},

    {t:'h2', text:'LRL: low resistance liquidity', tape:'la que más usa'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 184" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Muchos bajos alineados que el precio se lleva de golpe">
        <rect x="4" y="4" width="532" height="152" rx="10" fill="#CAC8C8"/>
        <rect x="286" y="30" width="62" height="14" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        <polyline points="20,134 45,120 58,128 90,108 102,116 135,96 147,104 180,84 192,92 225,72 237,80 270,60 296,42 326,72 380,128 420,138" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <line x1="40" x2="300" y1="133" y2="63" stroke="#a02020" stroke-width="2" stroke-dasharray="6 5"/>
        <g fill="#a02020"><circle cx="58" cy="128" r="4"/><circle cx="102" cy="116" r="4"/><circle cx="147" cy="104" r="4"/><circle cx="192" cy="92" r="4"/><circle cx="237" cy="80" r="4"/></g>
        <g font-size="15"><text x="50" y="146">💰</text><text x="94" y="134">💰</text><text x="139" y="122">💰</text><text x="184" y="110">💰</text><text x="229" y="98">💰</text></g>
        <g font-family="Caveat,cursive" text-anchor="middle"><text x="120" y="74" font-size="23" fill="#a02020">LRL</text><text x="317" y="26" font-size="17" fill="#7a4b00">FVG</text><text x="440" y="70" font-size="19" fill="#222">cae con fuerza</text><text x="440" y="92" font-size="19" fill="#222">y se lo lleva todo</text></g>
        <text x="270" y="177" text-anchor="middle" font-family="Caveat,cursive" font-size="18" fill="#ece9e1">subida lentísima: un bajo tras otro sin que se quite ninguno</text>
      </svg>
      <div class="cap">Se marca con una línea que une los bajos (él le pone "LRL"). Si hay mucha liquidez junta, <b>el precio la barre con muchísima fuerza</b>.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🪜', h:'Qué es', p:'Muchos altos o bajos alineados que <b>no se acaban de quitar nunca</b>. Ej.: una subida muy poco a poco ("chinchano") que deja un bajo, otro bajo, otro bajo… cada uno es un billete.'},
      {c:'b', ico:'⏱️', h:'En qué marco', p:'Normalmente en <b>1 a 5 minutos</b>. En 1 hora tendría mucha más importancia, pero casi no se da: implicaría un día entero de subida lentísima.'},
      {c:'m', ico:'💥', h:'Cuando se activa', p:'Cuando el precio toca un <b>FVG</b> o una BSL (por ejemplo un PDH) y <b>cae con muchísima fuerza</b>, llevándose todo. Tenerlo a tu favor es un gran motivo para el trade.'},
      {c:'c', ico:'⛔', h:'Evítalo en tu stop', p:'Nunca busques largos teniendo <b>todo eso en tu stop loss</b>: el trade no va a dar resultado.'}
    ]},

    {t:'h2', text:'Lo que se repite en todos', tape:'resumen'},
    {t:'list', items:[
      '<b>Mayor temporalidad, más importancia.</b>',
      '<b>Sirven de objetivo y de reacción.</b> Puedes buscar un trade hacia ellos o esperar a que el precio los quite.',
      '<b>Nunca operar en contra</b> de equal highs/lows ni de NDOG/NWOG, y evita el LRL en tu stop: <b>tu stop no debe quedar sobre liquidez</b>.',
      'Se alinean con los <b>FVG</b> (<a href="#dia-8" style="color:var(--yellow)">Día 8</a>) y con la liquidez del <a href="#dia-6" style="color:var(--yellow)">Día 6</a>.',
      'Aún <b>no explica cuándo</b> el precio se lleva toda la liquidez y cuándo solo una parte: lo verá con la práctica y en los vídeos de estrategia.'
    ]},
    {t:'p', cls:'detail', html:'Lo que viene después: <b>inverse FVG</b> (<a href="#dia-13" style="color:var(--yellow)">Día 13</a>) y <b>CISD</b>, cómo identificar <b>la dirección del día</b>, otras confirmaciones de entrada, más psicología, su estrategia entera y las cuentas de fondeo. El siguiente vídeo es de psicología.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los ejemplos paso a paso sobre gráficos (los dibujos de esta hoja son esquemas míos, no copias de los suyos), sus pausas, la llamada y las bromas. No concreta unos deberes al final: solo dice que son "más tochos" y que hay que practicar marcando cada tipo. <b>Dudas del audio:</b> cuál de los seis es el "prescindible" (entiendo que el PDH/PDL) y el nombre del indicador.'}
   ]},
 { id:12, title:'Gambling', tags:['psi'], mins:9, status:'done',
   intro:'Vídeo de psicología. Responde a quien dice que "el trading es gambling" o que su método no funciona, y explica cómo lo vive él: qué es gamblear, cómo distinguirlo del trading y qué hacer con el ruido de fuera.',
   blocks:[
    {t:'idea', text:'Es gambling cuando <span class="mk">dejas de seguir tu plan</span>; con un plan probado es gambling <span class="mk">con la estadística a tu favor</span>. No cambies lo que has practicado por opiniones ajenas: <span class="mk">compruébalo tú en backtesting</span>.'},

    {t:'h2', text:'¿El trading es gambling?', tape:'su opinión'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-c" style="transform:none"><h3>🎰 Gambling</h3><p>Entras <b>al azar</b>, operas sesiones en las que no toca, no sigues tu plan. Ya no es algo estadístico, ni probado, ni practicado: es como apostar al rojo o al negro.</p></div>
        <div class="card c-m" style="transform:none"><h3>📈 Trading</h3><p>Sigues una <b>estrategia probada</b>. Sigues sin saber si cada trade será take profit o stop, pero <b>tienes la probabilidad a favor</b>.</p></div>
      </div>
      <div class="cap">En cuanto <b>dejas de seguir tu plan</b>, ya no estás tradeando: estás gambleando. La mayoría gamblea; él también lo ha hecho muchas veces.</div>`},
    {t:'html', cls:'viz', html:`
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${[1,1,0,1,1,1,0,1,0,1].map(w=>`<span style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:18px;background:${w?'rgba(94,234,212,.22)':'rgba(255,122,107,.22)'};border:2px solid ${w?'#5eead4':'#ff7a6b'}">${w?'✔':'✘'}</span>`).join('')}</div>
      <div class="cap">Su ejemplo: con un <b>~73 % de acierto</b> (dato suyo), aplicando el sistema 10 veces ganas <b>7 de media</b>. Cada trade es azar; <b>el conjunto, no</b>.</div>`},
    {t:'p', cls:'detail', html:'Aunque un trade parezca perfecto y lo tenga todo para ganar, puedes perder: <b>sigue siendo azar</b>. Entrar es apostar a que sube o a que baja, pero con una estrategia detrás.'},

    {t:'h2', text:'El ruido de fuera', tape:'no te rayes'},
    {t:'cards', items:[
      {c:'c', ico:'➕', h:'No añadas conceptos ajenos', p:'Si te dicen "tienes un rejection doble en tu stop": ¿está ahí? Sí. ¿Forma parte de <b>mi</b> estrategia? No. Pues no lo añado.'},
      {c:'b', ico:'📰', h:'No cambies por polémicas', p:'Cuando "exponen" a un creador, la pregunta no es quién tiene razón, sino si <b>lo que aprendiste te funciona en tu backtesting</b>.'},
      {c:'m', ico:'🔬', h:'Compruébalo tú', p:'Coge lo que has aprendido, <b>backtestéalo y ponlo a prueba</b>. Si no te funciona, no lo hagas; si te funciona, hazlo. Con eso, la opinión de la gente da igual.'},
      {c:'l', ico:'🧠', h:'"Todo funciona" (opinión suya)', p:'Order flow, ICT, soportes y resistencias, ratios negativos, promediar… Siempre habrá quien perdió con uno y lo critica. <b>No dejes que la frustración de otro te joda la cabeza.</b>'}
    ]},
    {t:'quote', text:'No te digo que te fíes de mí: lo verás tú mismo en la práctica.', src:'Idea que repite al final (parafraseada)'},
    {t:'p', cls:'detail', html:'Conecta con el <a href="#dia-5" style="color:var(--yellow)">Día 5</a> (no cambiar de estrategia ni acumular conceptos) y con el <a href="#dia-9" style="color:var(--yellow)">Día 9</a> (la confianza viene de la práctica). Él "sabía" que le iba a funcionar porque <b>el backtesting daba lo que quería todo el rato</b>.'},

    {t:'h2', text:'La fase de gambling', tape:'obligatoria (según él)'},
    {t:'cards', items:[
      {c:'y', ico:'⏱️', h:'Pasa por ella lo menos posible', p:'Es su consejo: <b>intenta estar el menor tiempo posible</b> en la fase de gambling.'},
      {c:'c', ico:'🧱', h:'Aun así, la ve necesaria', p:'Cree (<i>otros no están de acuerdo</i>) que es una fase <b>obligatoria</b> y la que más le hizo mejorar: crees que haces trading y rompes reglas, pero <b>no sabes si algo no funciona hasta que lo pruebas</b>. Ej.: subir el riesgo para pasar una cuenta en un trade, perderla y aprender.'},
      {c:'m', ico:'📚', h:'Cada error enseña', p:'Siempre que <b>aprendas de él</b> (el método del <a href="#dia-9" style="color:var(--yellow)">Día 9</a>). No incita a gamblear: dice que, inevitablemente, al principio se rompen reglas, y es normal.'}
    ]},

    {t:'h2', text:'El camino en tres pasos', tape:'pasos'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">① Backtesting: sigue el sistema <b>a rajatabla</b></span><span class="ar">→</span>
        <span class="s">② Aprender con dinero falso</span><span class="ar">→</span>
        <span class="s fin">③ Evaluación: te equivocarás y quemarás alguna cuenta → apuntas, aprendes y sigues</span>
      </div>
      <div class="cap">Parecen tres pasos rápidos, pero <b>en un solo paso puedes estar un año</b>. Con calma, disfrutando y sin hacer caso del ruido. Hay que ir con confianza y decisión.</div>`},
    {t:'mine', id:'d12-plan', h:'¿Sigo mi plan o gamblo?', lab:'Esto es tuyo', ph:'Cuándo me sale entrar sin plan, y qué me dice que estoy gambleando en ese momento…',
     hint:'Lo que separa un caso de otro es <b>si cada entrada sigue tu plan</b>. Cuando tengas la estrategia del curso definida, esa pregunta (¿seguía mi plan?) será lo primero que conviene anotar.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> sus respuestas con insultos a sus críticos, el comentario sobre el caso de otro creador y sus cifras de retiros. Sus afirmaciones (el 73 %, "todo funciona") son <b>suyas</b>: la forma de comprobarlas es tu propio backtesting, que es justo lo que propone.'}
   ]},
 { id:13, title:'IFVG: el sistema de entrada', tags:['tec'], mins:20, status:'done',
   intro:'El concepto central del curso: según dice, <b>nunca pulsa comprar o vender sin un IFVG</b>. Es una clase de confirmación: retoma lo que ya sabes de los FVG y añade las reglas para que un FVG se considere invertido.',
   blocks:[
    {t:'idea', text:'<span class="mk">Nunca se pulsa comprar o vender sin un IFVG.</span> Un FVG que se <span class="mk">cierra al otro lado</span> (en su misma temporalidad) se invierte y confirma que el precio <span class="mk">quiere cambiar de tendencia</span>.'},

    {t:'h2', text:'Qué es un IFVG', tape:'sistema de entrada'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 186" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="FVG alcistas respetados y luego un IFVG que cambia la tendencia">
        <rect x="4" y="4" width="532" height="170" rx="10" fill="#CAC8C8"/>
        <rect x="52" y="118" width="70" height="11" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        <rect x="132" y="88" width="70" height="11" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        <rect x="222" y="66" width="85" height="12" fill="#6b7280" fill-opacity=".55" stroke="#4b5563" stroke-width="1.5"/>
        <rect x="335" y="112" width="60" height="11" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        <polyline points="20,150 58,112 86,124 128,78 160,94 206,48 238,68 262,92 300,128 352,114 378,126 420,150 470,140 520,162" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <g font-family="Caveat,cursive" fill="#222">
          <text x="64" y="160" font-size="18" fill="#1b6b5a">FVG alcista: toca y sube</text>
          <text x="312" y="74" font-size="23" fill="#374151">IFVG</text>
          <text x="206" y="28" font-size="18">cierra por debajo</text>
          <text x="526" y="104" font-size="17" fill="#7a4b00" text-anchor="end">respeta el FVG bajista</text>
          <text x="526" y="60" font-size="20" text-anchor="end">tendencia bajista</text>
        </g>
      </svg>
      <div class="cap">Mientras los FVG alcistas se respetan, sube. Cuando uno <b>deja de aguantar y se cierra por debajo</b>, se vuelve <b>gris (IFVG)</b>: hay más presión vendedora y empieza una tendencia bajista, ahora con FVG bajistas que se respetan.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🚪', h:'Es su sistema de entrada', p:'<b>Nunca, nunca, nunca</b> hace clic en comprar o vender sin un inverse fair value gap. Es su confirmación y es obligatoria.'},
      {c:'b', ico:'🔄', h:'Qué confirma', p:'Que el precio <b>quiere cambiar de tendencia</b>. El precio va de una liquidez a otra a través de FVG; pero no sube (ni baja) para siempre, y un IFVG avisa del giro.'},
      {c:'m', ico:'🧭', h:'Dónde aparece', p:'Normalmente en <b>zonas o niveles concretos</b> del mercado: están en el <a href="#dia-15" style="color:var(--yellow)">Día 15</a> ("key levels").'}
    ]},

    {t:'h2', text:'Cuándo se invierte de verdad', tape:'reglas'},
    {t:'cards', items:[
      {c:'c', ico:'🕯️', h:'Tiene que CERRAR', p:'La palabra clave es <b>cierra</b>. Si la vela baja, deja mecha y <b>cierra dentro</b> del FVG, no se ha invertido: <b>se respeta</b>. Si cierra por debajo del cuadradito, sí.'},
      {c:'y', ico:'⏱️', h:'En su misma temporalidad', p:'FVG de 5 min → hace falta la <b>vela de 5 min</b>. No vale una de 1 min ni de 2. (Es la regla del <a href="#dia-8" style="color:var(--yellow)">Día 8</a>.)'},
      {c:'m', ico:'⚡', h:'Rápido: máximo 3–4 velas', p:'Para invertirse tiene que haber una <b>vela fuerte</b>. Si tarda más de 3 o 4 velas en cerrar al otro lado, <b>ya no te gusta</b>.'}
    ]},
    {t:'html', cls:'viz', html:`
      <div class="tfrow"><b>✔ Sí</b><div class="tf">${'<i style="background:rgba(94,234,212,.45)"></i>'.repeat(3)}<i style="background:rgba(255,216,77,.7)"></i></div></div>
      <div class="tfrow"><b>✘ No</b><div class="tf">${'<i style="background:rgba(255,122,107,.4)"></i>'.repeat(9)}</div></div>
      <div class="cap">Velas que tarda en invertirse el FVG: <b>3–4 como mucho</b> (la amarilla es la que cierra al otro lado). Si tarda mucho, no es buen IFVG.</div>`},

    {t:'h2', text:'Solo de 30 segundos a 5 minutos', tape:'regla fija'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s fin">30 s → 5 min: <b>entradas (IFVG)</b></span><span class="ar">·</span>
        <span class="s psi">15 min: <b>no se toma</b> como entrada</span><span class="ar">·</span>
        <span class="s tec">1 h y 4 h: <b>contexto</b> (con FVGs)</span>
      </div>
      <div class="cap">"Nunca" se toma un IFVG de 15 minutos. Cada temporalidad se usa para algo distinto.</div>`},
    {t:'cards', items:[
      {c:'b', ico:'⏳', h:'Por qué', p:'Sus entradas son siempre entre <b>30 segundos y 5 minutos</b> porque sus trades duran muy poco: normalmente <b>de 1 a 10 minutos</b>; nunca más de media hora, y 20 minutos ya es raro.'}
    ]},
    {t:'p', cls:'detail', html:'<span class="muted">Encaja con lo que dijiste de querer estar <b>menos tiempo en el mercado</b>. Y recuerda que las entradas se juzgan con sus propios marcos (<a href="#dia-4" style="color:var(--yellow)">Día 4</a>: mayor temporalidad, más importancia; aquí, la importancia está en el contexto, no en la entrada).</span>'},

    {t:'h2', text:'Cómo se ve un cambio de tendencia', tape:'ejemplo'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">Barre <b>equal lows</b> (SSL)</span><span class="ar">→</span>
        <span class="s">Cae tocando FVG bajistas de 5 min, <b>uno tras otro</b></span><span class="ar">→</span>
        <span class="s tec">Cierra <b>por encima</b> de uno: IFVG</span><span class="ar">→</span>
        <span class="s">Empiezan FVG alcistas y se respetan</span><span class="ar">→</span>
        <span class="s">Sube barriendo la BSL</span>
      </div>
      <div class="road" style="margin-top:12px">
        <span class="s">Llega a <b>equal highs</b> con un FVG bajista alineado</span><span class="ar">→</span>
        <span class="s psi">Espera: barre los EH</span><span class="ar">→</span>
        <span class="s tec">El FVG se <b>invierte a la baja</b></span><span class="ar">→</span>
        <span class="s fin">Entrada: cae hacia mucha liquidez</span>
      </div>
      <div class="cap">Es el ejemplo que más enseña: liquidez del <a href="#dia-11" style="color:var(--yellow)">Día 11</a> + FVG del <a href="#dia-8" style="color:var(--yellow)">Día 8</a> + IFVG como confirmación.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🧮', h:'Por qué tiene sentido esa entrada', p:'Arriba, en tu stop, solo hay <b>una</b> liquidez. Abajo hay <b>seis</b>. El precio va de una BSL a muchas SSL. Y <b>no quieres equal highs en tu stop</b> antes de que se barran.'},
      {c:'c', ico:'🔕', h:'No siempre hay reacción', p:'A veces toma liquidez y <b>no pasa nada</b>, no hay IFVG o no se respeta. <b>Calma</b>: en el <a href="#dia-15" style="color:var(--yellow)">Día 15</a> (key levels) verás qué zonas reaccionan.'}
    ]},

    {t:'h2', text:'Lo que viene', tape:'hoja de ruta'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Key levels</span><span class="ar">→</span>
        <span class="s">Dirección del día</span><span class="ar">→</span>
        <span class="s fin">Estrategia completa</span><span class="ar">→</span>
        <span class="s">Backtesting</span><span class="ar">→</span>
        <span class="s psi">Prop firms · riesgo · cuentas · primer retiro · escalar</span>
      </div>`},
    {t:'p', cls:'detail', html:'Su ejercicio: buscar <b>20 ejemplos de IFVG</b>, alinearlos con la liquidez que ya conoces y ver <b>qué pasa tras invertirse</b>: cómo se deja de respetar una tendencia y se empieza a respetar otra. También iba a explicar los <b>SMT</b> y decidió <b>no hacerlo</b> aquí (dice que los usa una vez cada ~100 trades y confundirían); en el audio salen como "SIDs". El <b>Día 17</b> del bootcamp se titula "SMTs and True Manipulation", así que los veremos allí.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> sus bromas y comentarios sobre la cámara, la comparación con su vídeo antiguo y los ejemplos paso a paso sobre gráficos (los dibujos de esta hoja son esquemas míos). <b>Duda del audio:</b> la transcripción es en inglés (traducción automática), por eso "SIDs" y algunos matices; las reglas (cierre, misma temporalidad, 3–4 velas, 30 s–5 min) salen claras y repetidas.'}
   ]},
 { id:14, title:'Revenge trading', tags:['psi','rie'], mins:10, status:'done',
   intro:'Vídeo de psicología que él considera más importante que cualquier vídeo de estrategia. Trata de arriesgar más de la cuenta para recuperar lo perdido. Las cifras (300 $, 600 $…) son ejemplos suyos.',
   blocks:[
    {t:'idea', text:'Perder habiendo hecho todo bien no es el problema; el problema es <span class="mk">arriesgar más para recuperar</span>. No hay truco externo que lo evite: <span class="mk">solo tú</span>.'},

    {t:'h2', text:'Qué es el revenge trading', tape:'concepto'},
    {t:'cards', items:[
      {c:'c', ico:'⚔️', h:'Vengarte del mercado', p:'Pierdes, te enfadas, intentas recuperarlo, te enfadas más y pierdes. Es <b>sobre-riesgo</b> (overlotting) y <b>sobreoperar</b> (overtrading).'},
      {c:'m', ico:'✅', h:'Lo ideal tras perder', p:'Si lo has hecho todo bien y el trade falla: <b>te vas, lo anotas en el journal y aprendes</b>.'},
      {c:'y', ico:'🤬', h:'Lo que hacemos', p:'"No merezco esta pérdida." Miramos Instagram, vemos que <b>otros ganaron</b> y nos sentimos estafados por el mercado. Y arriesgamos más.'}
    ]},

    {t:'h2', text:'Dos escenarios', tape:'ejemplo'},
    {t:'html', cls:'viz', html:`
      <div class="card c-c" style="transform:none;margin-bottom:12px"><h3>Escenario 1 · Pierdes</h3>
        <div class="road" style="justify-content:flex-start">
          <span class="s">Arriesgas 300 y pierdes</span><span class="ar">→</span>
          <span class="s psi">Arriesgas 600 y pierdes: <b>−900</b></span><span class="ar">→</span>
          <span class="s">Arriesgas 1.000 para empatar</span><span class="ar">→</span>
          <span class="s fin">Cuenta quemada → compras otra → repites</span>
        </div>
        <p style="margin:8px 0 0;font-size:14px">Perdiste en un día lo que el plan permitía en <b>tres días malos</b>. Aunque no recompres cuentas, <b>enfadarte y volver a entrar te va a pasar</b>.</p></div>
      <div class="card c-y" style="transform:none"><h3>Escenario 2 · Ganas (y es peor)</h3>
        <div class="road" style="justify-content:flex-start">
          <span class="s">Pierdes 300</span><span class="ar">→</span>
          <span class="s">Arriesgas 600 y ganas 700</span><span class="ar">→</span>
          <span class="s fin">Día en <b>+400</b></span>
        </div>
        <p style="margin:8px 0 4px;font-size:14px"><b>Persona A:</b> se va con +400 y <b>se convence de que valió la pena arriesgar más</b>. Al día siguiente pierde 300, y como no sabe aceptar una pérdida… "un trade más". Mal hábito, cuenta perdida.</p>
        <p style="margin:0;font-size:14px"><b>Persona B:</b> no se va: <b>"juego con el beneficio"</b>. Arriesga 400 de lo ganado; si pierde, vuelve a cero, quiere recuperar los +400 y quema la cuenta.</p></div>
      <div class="cap">Su opinión sobre "jugar con el profit": <b>una mentira histórica</b>. Lo dice porque él ha pasado por todo esto.</div>`},
    {t:'p', cls:'detail', html:'Es <b>gambling</b> (<a href="#dia-12" style="color:var(--yellow)">Día 12</a>): no sigues tu estrategia, actúas por emociones y haces cosas que sabes que no debes. Es normal que pase; <b>lo importante es aprender de ello</b>.'},

    {t:'h2', text:'No hay truco', tape:'lo difícil'},
    {t:'cards', items:[
      {c:'c', ico:'🚫', h:'Nada externo funcionó', p:'Probó de todo: atarse las manos, notas en la pared ("no sobreoperes"), borrar TradingView o <b>cerrar la pestaña justo tras entrar</b>. Nada. <b>El que tiene que dejar de coger el ratón eres tú.</b>'},
      {c:'b', ico:'🔁', h:'No te quedes en el bucle de ver el vídeo', p:'Este vídeo ayuda para mañana, el lunes, quizá el martes. Si el martes rompes tus reglas, <b>volver a verlo no sirve</b>: recuérdalo cada día y deja de hacerlo.'},
      {c:'m', ico:'🌊', h:'Las emociones no se van', p:'Siempre estarán. La diferencia es <b>cómo las controlas</b>. Él también siente el impulso (cerca de un payout, con cuentas que no le importan perder) y <b>se aguanta</b>.'}
    ]},

    {t:'h2', text:'El plan de riesgo te mantiene tranquilo', tape:'riesgo'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-m" style="transform:none"><h3>Plan: 300 $ al día (ejemplo)</h3><p>La cuenta <b>dura varios días</b> y no te pones supernervioso al entrar. Estás tranquilo psicológicamente.</p></div>
        <div class="card c-c" style="transform:none"><h3>Arriesgar 2.000 $</h3><p>Pierdes la cuenta <b>al instante</b>, no estás preparado ni sabes qué hacer, y caes en malos hábitos todo el rato.</p></div>
      </div>
      <div class="cap">No dice que arriesgues 300: es solo un ejemplo. Conecta con el <a href="#dia-9" style="color:var(--yellow)">Día 9</a>: menos riesgo, menos miedo.</div>`},

    {t:'h2', text:'La pregunta de las 50 veces', tape:'lo que le hizo parar'},
    {t:'html', cls:'viz', html:`
      <div class="card c-y" style="transform:none"><h3>"Las últimas 50 veces que rompiste tus reglas, ¿cuántas salió bien?"</h3>
        <p>Y cuando salió bien, <b>al día siguiente volvías al mal hábito</b> y acababa mal. Si cuando va bien acaba mal y cuando va mal acaba mal, <b>¿para qué hacerlo?</b></p></div>
      <div class="cap">Lo que le hizo decir "se acabó": estar <b>muy cansado de romper reglas</b>. Es de sentido común, pero no es tan fácil como decirlo.</div>`},
    {t:'quote', text:'Haz errores, porque es inevitable. Pero cuando falles, aprende, y llegará el día en que estés harto de romper tus reglas.', src:'Su consejo (parafraseado)'},
    {t:'mine', id:'d14-ultima', h:'Mi última vez', lab:'Esto es tuyo', ph:'La última vez que arriesgué más para recuperar: qué emoción había antes, qué hice y cuánto me costó…',
     hint:'Responde con datos, no con culpa. Y la pregunta de las 50 veces: ¿cuántas veces salió bien cuando rompiste tus reglas?', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los comentarios sobre sus comentarios y agradecimientos, y las bromas. Él dice que este vídeo es <b>"10.000 veces más importante"</b> que cualquier vídeo de estrategia; lo dejo tal cual como su opinión.'}
   ]},
 { id:15, title:'Key levels', tags:['tec'], mins:21, status:'done',
   intro:'Dónde reacciona el precio. Une todo lo anterior: un key level es un FVG de marco alto con liquidez dentro, y se entra solo cuando el precio lo toca y aparece un IFVG. Los números de los ejemplos (443 puntos…) son suyos.',
   blocks:[
    {t:'idea', text:'Un key level es una <span class="mk">zona de conflicto</span> donde el precio decide si gira o sigue. Es <span class="mk">un FVG de marco alto con liquidez dentro o pegada</span>, y solo se entra cuando <span class="mk">lo toca y aparece un IFVG</span>.'},

    {t:'h2', text:'Qué es un key level', tape:'definición'},
    {t:'cards', items:[
      {c:'y', ico:'⚔️', h:'Zona de conflicto', p:'Sitio donde el precio <b>tiene que decidir</b> si da la vuelta o no. <b>No sabes qué hará</b>: es donde buscas tu trade de cambio de tendencia. Vale subiendo y bajando.'},
      {c:'m', ico:'🧩', h:'Sin complicarse', p:'Solo usa <b>dos cosas</b> que ya conoces: <b>FVGs</b> (<a href="#dia-8" style="color:var(--yellow)">Día 8</a>) y <b>liquidez</b> (<a href="#dia-11" style="color:var(--yellow)">Día 11</a>). Luego irán afinando conceptos como el equilibrium (<a href="#dia-19" style="color:var(--yellow)">Día 19</a>) y los SMT (<a href="#dia-17" style="color:var(--yellow)">Día 17</a>).'}
    ]},

    {t:'h2', text:'Qué FVG valen como key level', tape:'marcos'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s fin">4 h ✔ el mejor</span><span class="ar">≥</span>
        <span class="s fin">1 h ✔</span><span class="ar">&gt;</span>
        <span class="s tec">15 min ✔ solo si lo "patrocina" uno de 1 h / 4 h</span><span class="ar">·</span>
        <span class="s psi">5 min ✘ <b>nunca</b></span>
      </div>
      <div class="cap">Un FVG de 1 h o 4 h <b>es mejor que uno de 15 min</b>. Los de 15 min los usa más como <b>condición</b> que como key level (lo verá más adelante).</div>`},

    {t:'h2', text:'El FVG necesita liquidez', tape:'lo clave'},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 176" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="FVG de 1 hora con un low dentro: el precio lo toma y continúa">
        <rect x="4" y="4" width="532" height="150" rx="10" fill="#CAC8C8"/>
        <rect x="150" y="80" width="270" height="20" fill="#ffd84d" fill-opacity=".6" stroke="#b8860b" stroke-width="1.5"/>
        <polyline points="20,140 70,108 100,120 160,58 200,84 262,92 300,66 360,36 440,22 510,12" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="262" cy="92" r="5" fill="#1b6b5a"/>
        <g font-family="Caveat,cursive" fill="#222">
          <text x="285" y="74" font-size="20" fill="#7a4b00" text-anchor="start">FVG 1 h / 4 h</text>
          <text x="262" y="124" font-size="19" fill="#1b6b5a" text-anchor="middle">💰 low dentro del FVG</text>
          <text x="456" y="60" font-size="20" text-anchor="middle">continúa ↑</text>
        </g>
        <text x="270" y="170" text-anchor="middle" font-family="Caveat,cursive" font-size="18" fill="#ece9e1">el FVG atrae y el low es dinero: se llevan los dos y sigue</text>
      </svg>`},
    {t:'cards', items:[
      {c:'y', ico:'💰', h:'Low o high dentro del FVG', p:'Quiere ver <b>un low (o high) dentro</b> del FVG de 1 h/4 h, o incluso pegado (a veces ni lo toca). El FVG es un imán y la liquidez es dinero: el precio va a por el low, toca el gap y <b>continúa</b>.'},
      {c:'b', ico:'🎯', h:'Alineados = muy importantes', p:'Los <b>lows o highs alineados con un FVG</b> son puntos muy importantes. Él lo pide "súper claro".'},
      {c:'m', ico:'🔎', h:'En 1 h no esperes a que lo revisite', p:'Si toca el FVG de 1 h, <b>baja a 15, 30 o 5 min</b> y mira si ya tomó algún low: dentro de un gap de 1 h caben 2–4 gaps de 15 min. No vas a esperar horas a que toque, salga y vuelva a tocar: casi nunca ocurre.'}
    ]},

    {t:'h2', text:'Otros key levels (ya los conoces)', tape:'ya visto'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">NDOG / NWOG</span><span class="ar">·</span>
        <span class="s">Altos y bajos de 4 h</span><span class="ar">·</span>
        <span class="s">LRL (objetivo clarísimo)</span>
      </div>
      <div class="cap">Lo nuevo de hoy: <b>alinear todos los puntos de liquidez con los key levels</b>. Eso te dice <b>si el nivel va a aguantar</b>.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'🧮', h:'Cuenta los puntos', p:'Su ejemplo: tocas un key level, con equal highs como objetivo y LRL creado. Tienes <b>10 puntos de liquidez a favor y 1 en contra</b>: tiene mucho sentido que llegue al take profit.'}
    ]},

    {t:'h2', text:'¿Hace falta que tome el low?', tape:'matiz importante'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-m" style="transform:none"><h3>Buena reacción → no hace falta</h3><p>Si el precio toca el gap de 1 h y <b>reacciona bien</b>, no necesitas que vuelva a por el low. En un marco menor seguramente ya tomó liquidez (ej.: un low de 15 min dentro de un FVG de 15 min).</p></div>
        <div class="card c-c" style="transform:none"><h3>Sin reacción → sí interesa</h3><p>Si toca y <b>se queda una hora sin moverse</b> y abre otra vela con el low pegado, no quieres ese low en tu stop al comprar. Prefiere que lo tome, <b>recupere el gap</b> y suba (manipulación: lo explicará más adelante).</p></div>
      </div>`},

    {t:'h2', text:'No entres antes de tiempo', tape:'paciencia'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">✘ Ves un IFVG antes de tocar el key level y con liquidez en contra</span><span class="ar">→</span>
        <span class="s">Te barren el stop</span>
      </div>
      <div class="road" style="margin-top:12px">
        <span class="s tec">1 · Toca el key level</span><span class="ar">→</span>
        <span class="s tec">2 · Aparece el IFVG (30 s–5 min)</span><span class="ar">→</span>
        <span class="s fin">✔ Entras, con la liquidez a tu favor</span>
      </div>
      <div class="cap">Ejemplo suyo: había <b>un IFVG</b> pero con tres highs en contra (uno dentro de un gap). <b>"No hace falta entrar en ningún sitio: el precio no se va sin ti."</b></div>`},

    {t:'h2', text:'Sus ejemplos, resumidos', tape:'casos'},
    {t:'list', items:[
      '<b>1 h FVG + low de 15 min dentro de un FVG de 15 min:</b> reacción y un IFVG de 15 min al alza. <b>+443 puntos</b>.',
      '<b>1 h/30 min high dentro de gaps de 1 h y 30 min:</b> cae hasta el siguiente key level, un <b>low dentro de un FVG de 1 h</b> de hace 13 horas. No se compra antes porque hay <b>relative equal lows sin tomar</b>. Luego, +380 a +420 puntos.',
      '<b>High de 1 h dentro de un FVG de 1 h</b> + NDOG como objetivo: más probable que gire. Con el IFVG <b>solo después</b> de tocar el nivel, cae de golpe hacia el hueco.',
      '<b>Low dentro de un FVG de 5 y 15 min</b> justo antes de la apertura de la sesión: lo toma, da un IFVG, entras con la BSL de objetivo y llega al take profit.',
      '<b>En una tendencia bajista:</b> high + FVG como zona, 4–5 LRL alineadas y un <b>IFVG de 5 min</b> → caída enorme.'
    ]},
    {t:'quote', text:'Un key level, un FVG de marco alto, la liquidez que ya conoces… y el IFVG: todo junto es la entrada.', src:'Síntesis del vídeo (parafraseada)'},
    {t:'p', cls:'detail', html:'Aún <b>no explica</b>: qué es un FVG "patrocinado" (sponsored), las <b>condiciones</b>, la <b>manipulación</b> (<a href="#dia-17" style="color:var(--yellow)">Día 17</a>), el equilibrium y los SMT (<a href="#dia-17" style="color:var(--yellow)">Día 17</a>). Dice que "con la práctica, tras muchas horas de backtesting, irás viendo cuándo necesitas que tome el low y cuándo no". Su ejercicio: buscar <b>todos los ejemplos que puedas</b> ("high, key level, rechazo") y, si ya te ves seguro, juntarlo todo con IFVG de 30 s a 5 min.'},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> las bromas, el aviso de silenciar el móvil y la narración de cada vela de los ejemplos (los dibujos de esta hoja son esquemas míos, no copias de los suyos). Hay frases suyas como "sabemos al 100 % que habrá reacción": las tomo como énfasis, no como garantía. La transcripción es la traducción automática al inglés, y algún matiz puede perderse (por ejemplo "monkey level" es "key level").'}
   ]},
 { id:16, title:'Check-in', tags:['psi'], mins:7, status:'done',
   intro:'Vídeo corto de reflexión, sin concepto nuevo. Lo valioso: las rachas psicológicas, qué hacer cuando vienen mal, y para qué sirve tanto backtesting. Lo de «10 cuentas fondeadas al 1 %» es su situación, no una pauta para ti.',
   blocks:[
    {t:'idea', text:'La meta no es no sentir nada ni no fallar nunca, sino <span class="mk">estar bien y respetar las reglas la mayor parte del tiempo</span>. Y el backtesting sirve para que <span class="mk">tú sepas si un trade es bueno</span>, sin depender de nadie.'},

    {t:'h2', text:'Rachas psicológicas', tape:'son normales'},
    {t:'cards', items:[
      {c:'y', ico:'🌊', h:'Hay épocas buenas y malas', p:'Aunque seas consistente, hay meses mejores y peores. Y también <b>rachas psicológicas</b>: temporadas en las que rompes más reglas y actúas a lo tonto, y otras en las que estás <b>"como una roca"</b> y todo sale limpio.'},
      {c:'m', ico:'🪨', h:'El objetivo', p:'Estar como una roca <b>la mayor parte del tiempo</b>. No siempre: no podemos estar siempre sin emociones y sin romper alguna regla.'},
      {c:'c', ico:'⏸️', h:'Si vienes de mala racha', p:'Lo que él recomienda: <b>parar un tiempo</b> (una semana, o tres días). Ya sabes tus errores y qué pulir.'}
    ]},

    {t:'h2', text:'Cuando todo está claro', tape:'su ejemplo'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">Días sin verlo claro<br><small>condiciones dudosas</small></span><span class="ar">→</span>
        <span class="s tec">Un día lo ves clarísimo<br><small>sin FOMO ni dudas</small></span><span class="ar">→</span>
        <span class="s fin">Entra, take profit en 3 min, fuera</span>
      </div>
      <div class="cap">En 7 días operó <b>un solo día</b>. Gane o pierda, da igual: <b>"si es take profit, fuera; si es stop loss, fuera"</b>. Y estaba contento con la pérdida porque seguía su estrategia.</div>`},
    {t:'list', items:[
      'Con cuentas fondeadas <b>no puedes pasar un mes sin operar</b>, así que algún día hay que hacer excepciones (días menos claros).',
      'Pero <b>esperar un setup muy claro</b> y ejecutarlo sin emociones es lo que da la calma.',
      'Trading, a partir de cierto punto, <b>puede volverse algo fácil</b> (entre comillas: llegar ahí es difícil).'
    ]},

    {t:'h2', text:'Para qué tanto backtesting', tape:'el sentido'},
    {t:'cards', items:[
      {c:'y', ico:'⚙️', h:'Hacerlo mecánico', p:'Practicar tantas entradas y tantas horas sirve para que <b>tú mismo sepas si un trade es bueno</b>, sin ver nada en YouTube ni el contenido de nadie.'},
      {c:'b', ico:'🧭', h:'Independencia', p:'Asumes <b>la responsabilidad de saber si lo hiciste bien o mal</b>, que casi siempre ya sabemos pero no aceptamos. Haces tu propio diario, sin pedir ayuda ni mirar resúmenes de otros.'},
      {c:'m', ico:'🎯', h:'Qué buscas al acabar el bootcamp', p:'No ser maestro: <b>(1)</b> entender los conceptos para seguir a quien habla en serio, <b>(2)</b> saber el paso a paso de qué hacer (grabará un vídeo al final) y <b>(3)</b> las horas: "nadie nace con experiencia, backtesting, discrecionalidad ni confianza".'}
    ]},
    {t:'quote', text:'Nadie nace con horas de backtesting, ni con discrecionalidad, ni con confianza, ni sabiendo cómo hacerlo.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Lo que viene', tape:'orden del curso'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">FOMO</span><span class="ar">→</span>
        <span class="s tec">Equilibrium</span><span class="ar">·</span>
        <span class="s tec">SMTs</span><span class="ar">→</span>
        <span class="s fin">Backtesting, demo, cuentas, qué prop firm…</span>
      </div>
      <div class="cap">Quedan <b>solo dos conceptos técnicos</b> (equilibrium y SMTs) y pocos vídeos de psicología. Después: <b>cómo hacer backtesting, cómo usar una demo y el paso a paso</b>. Ahí es donde encajará la zona de <b>Registro</b> de esta libreta.</div>`},

    {t:'mine', id:'d16-racha', h:'¿En qué racha estoy yo?', lab:'Esto es tuyo', ph:'Cómo ha sido mi última semana: ¿roca o rompiendo reglas? ¿Qué me dice eso sobre si toca parar unos días…',
     hint:'Escribe cómo ibas tú esta semana en psicología; sin juicio, solo para verlo.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> las bromas, el viaje en coche, el repaso de los comentarios, y sus datos personales de rendimiento (cuentas, riesgo): son su situación. Le piden en los comentarios <b>equilibrium, cómo pasar cuentas y qué prop firm es mejor</b>: dice que lo explicará todo, <b>paso a paso</b>, tras los conceptos. Nada de eso está contado aún. Transcripción: traducción automática al inglés.'}
   ]},
 { id:17, title:'SMTs y True Manipulation', tags:['tec'], mins:22, status:'done',
   intro:'Último gran concepto técnico antes de backtesting. Un SMT es una divergencia entre Nasdaq y S&P 500; lo importante del día es que solo vale si hay «true manipulation». Los dibujos son esquemas míos; los ejemplos son del 10 nov 2026.',
   blocks:[
    {t:'idea', text:'Un SMT es que <span class="mk">un índice toma un low/high y el otro no</span>. Solo es válido con <span class="mk">true manipulation</span>: que <span class="mk">los dos índices estén en un sitio donde tiene sentido que distribuyan</span> y sin liquidez de baja resistencia en contra.'},

    {t:'h2', text:'Qué es un SMT', tape:'divergencia'},
    {t:'cards', items:[
      {c:'y', ico:'🔀', h:'Divergencia entre índices', p:'Nasdaq y S&P 500 están <b>correlacionados</b> y se mueven parecido. Hay SMT cuando <b>uno toma un low (o high) y el otro no</b>. Se busca en <b>key levels</b> (<a href="#dia-15" style="color:var(--yellow)">Día 15</a>). Por eso trabaja con los dos gráficos abiertos en TradingView, uno al lado del otro.'},
      {c:'m', ico:'🕐', h:'A la misma hora', p:'Los highs/lows que compares tienen que ser <b>de la misma vela/hora</b> (ej.: el high de las 8:30 en ambos). Pasa el ratón y comprueba la hora; si marcas highs distintos, no tiene sentido.'}
    ]},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 560 190" style="width:100%;max-width:600px;display:block;margin:0 auto" role="img" aria-label="SMT alcista: el Nasdaq no llega al low y el S&P 500 sí lo toma">
        <rect x="4" y="4" width="552" height="150" rx="10" fill="#CAC8C8"/>
        <line x1="280" y1="12" x2="280" y2="146" stroke="#888" stroke-dasharray="4 4"/>
        <line x1="20" y1="104" x2="262" y2="104" stroke="#1b6b5a" stroke-dasharray="5 4" stroke-width="1.5"/>
        <line x1="298" y1="104" x2="540" y2="104" stroke="#1b6b5a" stroke-dasharray="5 4" stroke-width="1.5"/>
        <polyline points="24,60 70,104 110,70 160,92 200,98 240,60 258,40" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <polyline points="304,60 350,104 390,70 440,92 480,118 510,70 534,40" fill="none" stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="70" cy="104" r="5" fill="#1b6b5a"/><circle cx="350" cy="104" r="5" fill="#1b6b5a"/>
        <circle cx="480" cy="118" r="6" fill="#b3261e"/>
        <g font-family="Caveat,cursive" fill="#222">
          <text x="150" y="22" font-size="21" text-anchor="middle">NASDAQ</text>
          <text x="420" y="22" font-size="21" text-anchor="middle">S&amp;P 500</text>
          <text x="200" y="124" font-size="18" fill="#7a4b00" text-anchor="middle">no llega al low</text>
          <text x="480" y="140" font-size="18" fill="#b3261e" text-anchor="middle">toma el low</text>
        </g>
        <text x="280" y="176" text-anchor="middle" font-family="Caveat,cursive" font-size="18" fill="#ece9e1">SMT alcista: el S&amp;P limpia el low, el Nasdaq no, y sube (es como si ambos lo hubieran tomado)</text>
      </svg>`},
    {t:'cards', items:[
      {c:'b', ico:'☝️', h:'Basta con que un índice toque la zona', p:'Si el S&amp;P toca el key level y reacciona, asume que el Nasdaq lo ha tocado también («como si»), por la correlación. Excepción importante: la true manipulation (abajo).'},
      {c:'c', ico:'↔️', h:'Da igual cuál', p:'Da lo mismo si es el S&amp;P o el Nasdaq el que toma el low/high; y vale alcista y bajista (en el bajista, es un high que uno toma y el otro no).'},
      {c:'y', ico:'🚫', h:'¿Obligatorio? No', p:'Que <b>no haya SMT</b> no significa que no entres: solo que el trade será <b>peor</b> (ej.: los dos tocan la zona y suben a la vez, también vale).'}
    ]},

    {t:'h2', text:'True manipulation', tape:'lo clave del día'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">1 · Hay un SMT en un key level</span><span class="ar">→</span>
        <span class="s tec">2 · ¿Los DOS índices están en sitio de distribuir?</span><span class="ar">→</span>
        <span class="s fin">Sí → SMT válido</span>
      </div>
      <div class="cap">«Tatúatelo»: <b>los dos índices tienen que estar en un sitio de distribución</b>. Con uno solo no basta.</div>`},
    {t:'cards', items:[
      {c:'m', ico:'✅', h:'Tiene sentido distribuir si…', p:'El índice está <b>tocando un FVG</b> de marco alto (al menos de <b>5 min o más</b>: 5, 15, 30 min…) o un key level, y <b>no tiene liquidez de baja resistencia en contra</b> (un low/high pegado que sería el stop de tu operación).'},
      {c:'c', ico:'❌', h:'No tiene sentido si…', p:'Le queda liquidez en contra (varios lows/highs sin tomar), no ha tocado ningún FVG, o el FVG de 5 min que tenía ya se invirtió (cerró en contra).'}
    ]},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-m" style="transform:none"><h3>SMT válido ✔</h3><p>S&amp;P toma el low y está en un FVG de 30/15 min. El Nasdaq no lo toma, pero <b>está dentro de un FVG de 15/30 min</b> y sin liquidez en contra. «¿Tiene sentido que suba el Nasdaq? Sí. ¿El S&amp;P? Sí.» → sube.</p></div>
        <div class="card c-c" style="transform:none"><h3>SMT sin true manipulation ✘</h3><p>El Nasdaq limpia el low y reacciona, pero el S&amp;P tiene <b>4 puntos de liquidez en contra</b> y no ha tocado el FVG. Entras por el «SMT»… y el precio se queda acumulando y te saca. <b>Tu stop tenía un FVG sin tocar.</b></p></div>
      </div>`},
    {t:'quote', text:'Si marcas SMTs al azar, el precio no los va a respetar todos. Para saber cuáles aguantan, mira si los dos índices están donde tienen que distribuir.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Sus ejemplos, resumidos', tape:'casos'},
    {t:'list', items:[
      '<b>Bajista (10 nov, 8:30):</b> el Nasdaq limpia el high de las 8:30 y toca un FVG de 15 min; el S&amp;P queda muy lejos. SMT, y cae. Aun así <b>no es trade suyo</b>: el IFVG era de 15 min y solo opera de 1 a 5 min.',
      '<b>Alcista, dos lows (2:30 y 18:00):</b> el Nasdaq limpia ambos y cae en un FVG de 15 min (buen key level); el S&amp;P no limpia ninguno. SMT con los dos, y todo el movimiento sube.',
      '<b>Alcista, low de 1:30:</b> el S&amp;P lo limpia y el Nasdaq no. El Nasdaq sube «viendo» subir al S&amp;P.',
      '<b>Apertura NY 9:30:</b> low de las 7:30 dentro de un gap de 30 min en ambos. El S&amp;P lo toma y el Nasdaq no. El S&amp;P está en un gap de 30 y 15 min, el Nasdaq dentro de uno de 15 y otro de 30 → <b>SMT válido</b>.',
      '<b>Ejemplo inventado:</b> si el Nasdaq ya <b>invirtió</b> su FVG de 5 min y no tiene otro, aunque el S&amp;P esté en un FVG de 15 min, <b>no hay true manipulation</b> y el trade es malo.'
    ]},
    {t:'p', cls:'detail', html:'Su ejercicio: buscar <b>SMTs con true manipulation</b> y <b>SMTs sin ella</b>, y marcar siempre los highs/lows <b>de la misma hora</b>. Dice que para <b>él la true manipulation es obligatoria</b> en su estrategia: la aprendió hace pocos meses, tardó 1–1,5 años en darse cuenta de que no la usaba. Al final cuenta que <b>no explicará</b> cuándo no hace falta ni la cancelación con «doble SMT» ni los breakaway gaps, porque <b>no los usa</b> y no quiere complicarlo.'},

    {t:'mine', id:'d17-smt', h:'¿Dónde me iba a equivocar yo?', lab:'Esto es tuyo', ph:'Qué parte me lleva a entrar por un SMT «a medias»: no mirar el otro índice, ignorar la liquidez en contra, marcar horas distintas…',
     hint:'Antes de entrar por un SMT, pregúntate: ¿están los dos índices en un sitio de distribuir? Si no puedes decir sí a los dos, no es SMT válido.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> el audio fallado y las bromas, las dudas de los comentarios, y la narración vela a vela. Hay una <b>contradicción aparente</b>: en el <a href="#dia-13" style="color:var(--yellow)">Día 13</a> parecía decir que usa los SMT poco (y en el audio salían como «SIDs»), y aquí dice que la true manipulation es obligatoria. Lo más probable es la traducción automática; <b>si lo ves en otro sitio, contrástalo con el original en español</b>. El dibujo del SMT es un esquema mío, no suyo. Los precios o puntos exactos no los dice.'}
   ]},
 { id:18, title:'FOMO', tags:['psi'], mins:10, status:'done',
   intro:'Psicología. Es el miedo a quedarte fuera de un movimiento que ves claro. Los porcentajes (70-75 % de calendario verde) son su experiencia, no una estadística.',
   blocks:[
    {t:'idea', text:'FOMO es entrar a un trade <span class="mk">porque el precio se va sin ti</span>, no porque tu estrategia lo pida. Se evita <span class="mk">no entrando si tu estrategia no aparece</span>. Y la pregunta antes de entrar: <span class="mk">«si pierdo este trade, ¿me voy a enfadar?»</span>.'},

    {t:'h2', text:'Qué es y cómo se ve', tape:'el mecanismo'},
    {t:'cards', items:[
      {c:'y', ico:'😖', h:'Miedo a quedarte fuera', p:'Fear Of Missing Out. Sabes casi seguro que el precio va a subir, <b>no es tu estrategia</b>, y lo ves irse sin ti «atado como un prisionero».'},
      {c:'c', ico:'💥', h:'Lo que hace la mayoría', p:'Con una confirmación cualquiera («ni siquiera es una estrategia») compra. Cae, le sacan, <b>pierde la cuenta</b>. Después aparece su setup de verdad y ya no tiene cuenta para operarlo.'}
    ]},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">Ves que el precio se va</span><span class="ar">→</span>
        <span class="s psi">Entras sin tu estrategia</span><span class="ar">→</span>
        <span class="s psi">Te saca / pierdes la cuenta</span><span class="ar">→</span>
        <span class="s tec">Llega tu setup… y no tienes cuenta</span>
      </div>
      <div class="cap">«¿Cómo se evita el FOMO? <b>No teniendo FOMO.</b> No hay truco mágico»: igual que el revenge trading se evita <b>dejando de reentrar</b> cuando no toca (<a href="#dia-14" style="color:var(--yellow)">Día 14</a>).</div>`},

    {t:'h2', text:'Herramientas contra el FOMO', tape:'qué sirve de verdad'},
    {t:'cards', items:[
      {c:'m', ico:'🔁', h:'Backtesting', p:'Puedes viajar a cualquier día y practicar: <b>un mes en 5 horas</b>. Así llegas a las cuentas fondeadas con muchas horas encima. Si te sales del plan en backtesting, <b>es apostar</b>: algo que no has probado.'},
      {c:'y', ico:'🧠', h:'Pregúntate: «¿cuándo he tenido FOMO en backtesting?»', p:'Nunca: cero veces. Esa es la respuesta; el FOMO solo aparece con dinero real.'},
      {c:'b', ico:'🏆', h:'Actúa como el 1 %', p:'Él es competitivo: pensaba que el 99 % de los no rentables entra por FOMO, y aunque salga bien, <b>rompen sus reglas</b>. Eligió comportarse como el 1 %, <b>aunque por dentro lo estuviera pasando mal</b>.'},
      {c:'c', ico:'👏', h:'Si se va sin ti', p:'Date una palmadita: <b>sabías dónde iba</b>, y la mayoría no. Nada más.'}
    ]},

    {t:'h2', text:'Trampa: backtesting verde', tape:'aviso'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-l" style="transform:none"><h3>En backtesting</h3><p>Muchos sentirán que son maestros: <b>70–75 % del calendario en verde</b> y «voy a hacerme rico». Le pasó a él, dice que es normal.</p></div>
        <div class="card c-c" style="transform:none"><h3>Con cuentas fondeadas</h3><p>Llegan las cuentas y <b>vas quemando una tras otra</b>. El FOMO te alcanzará, y se combate recordándote que no lo tienes y que <b>a largo plazo ves un calendario verde</b>.</p></div>
      </div>`},

    {t:'h2', text:'Salirte con la tuya también es malo', tape:'regla rota'},
    {t:'list', items:[
      'Si entras por FOMO y <b>sale bien</b>, es peor: <b>cada vez que rompes una regla y te sales con la tuya, te estás matando</b>. Mismo mecanismo que en el revenge trading.',
      'Al día siguiente vuelves a tener FOMO, entra, sale mal, y lo pierdes todo. Te quedan <b>malos hábitos que no merecen la pena</b>.',
      'Por eso: ser <b>lo más robot posible</b>.'
    ]},
    {t:'quote', text:'Ser robot no es no tener emociones: es saber controlarlas.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Emociones: sí, actuar: no', tape:'su práctica'},
    {t:'cards', items:[
      {c:'y', ico:'🎭', h:'Él las siente', p:'Dice que aún tiene bastantes emociones y que domina las suyas con esfuerzo. Pero <b>ya no actúa sobre ellas</b>: se desahoga, hace bromas, se enfada con el mercado, <b>apaga el ordenador</b>. Antes habría pulsado comprar.'},
      {c:'m', ico:'🙂', h:'Es normal', p:'Si pierdes un stop, te fastidia (más si es una cuenta a un día del payout). <b>Es un enfado, y ya está</b>: no te tumbas en la cama todo el día. Con un TP, algo más contento. Con el tiempo, estas emociones se atenúan.'}
    ]},

    {t:'h2', text:'Pregunta antes de entrar', tape:'el filtro'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">«Si pierdo este trade, ¿me voy a enfadar?»</span>
      </div>
      <div class="road" style="margin-top:12px">
        <span class="s psi">Sí → estás entrando por FOMO → <b>no entres</b></span><span class="ar">·</span>
        <span class="s fin">No (el setup es perfecto y sigue tu estrategia) → <b>entra</b></span>
      </div>
      <div class="cap">Es fácil preguntar «¿y si gano?»: siempre estarás contento. La pregunta que filtra es la de <b>perder</b>.</div>`},

    {t:'mine', id:'d18-fomo', h:'¿Cuándo me ha pasado a mí?', lab:'Esto es tuyo', ph:'Último trade que entré viendo que «se iba sin mí»: qué hice, cómo acabó, y qué me dije para entrar…',
     hint:'Pruébalo en tu próximo backtesting: antes de cada entrada, responde en voz alta a «si pierdo, ¿me enfado?». Es gratis y rápido.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> el desorden, las bromas y los ejemplos de gimnasio/fiesta, el «hoy hubo un ejemplo brutal» (no lo enseña) y las cifras personales. Su «300» de pérdida es un ejemplo suyo. Transcripción: traducción automática al inglés. En este vídeo <b>no da ninguna regla técnica nueva</b>; todo es psicología.'}
   ]},
 { id:19, title:'Equilibrium (premium y discount)', tags:['tec'], mins:16, status:'done',
   intro:'Cómo elegir qué FVG de una tendencia tiene más probabilidad de reaccionar. Usa la herramienta Fibonacci del Día 2. Los puntos (13 vs 62) son su ejemplo; los esquemas son míos.',
   blocks:[
    {t:'idea', text:'Dibuja el rango y mira la <span class="mk">mitad (50 %)</span>. Para <span class="mk">comprar, solo en la zona gris de descuento</span> (por debajo); para <span class="mk">vender, solo en la zona gris de premium</span> (por encima). Y mejor si <span class="mk">coincide con un FVG</span>.'},

    {t:'h2', text:'Qué es y para qué sirve', tape:'la herramienta'},
    {t:'cards', items:[
      {c:'y', ico:'📏', h:'Fibonacci retracement', p:'La herramienta del <a href="#dia-2" style="color:var(--yellow)">Día 2</a>, con <b>la configuración que copiaste</b> (sin tocar nada más). Marca el rango en dos zonas: <b>premium arriba</b> y <b>discount abajo</b>, con la línea del <b>50 %</b> en medio.'},
      {c:'m', ico:'❓', h:'Qué problema resuelve', p:'En una tendencia hay muchos FVGs. ¿Cuál es el que más probablemente <b>reaccione</b>? Quieres no entrar en el primero y que luego siga hasta el de más arriba y te saque. El equilibrium filtra cuál vale.'}
    ]},
    {t:'html', cls:'viz', html:`
      <svg viewBox="0 0 540 200" style="width:100%;max-width:580px;display:block;margin:0 auto" role="img" aria-label="Rango dividido en premium arriba y discount abajo con el 50 por ciento en medio">
        <rect x="4" y="4" width="532" height="170" rx="10" fill="#CAC8C8"/>
        <rect x="40" y="24" width="300" height="60" fill="#6b6b6b" fill-opacity=".5"/>
        <rect x="40" y="84" width="300" height="60" fill="#3a6ea5" fill-opacity=".45"/>
        <line x1="40" y1="84" x2="340" y2="84" stroke="#222" stroke-width="2" stroke-dasharray="6 4"/>
        <polyline points="50,140 90,60 130,110 170,40 210,86 260,28 320,70" fill="none" stroke="#222" stroke-width="2.5" stroke-linejoin="round" opacity=".55"/>
        <g font-family="Caveat,cursive" fill="#222">
          <text x="356" y="56" font-size="22" fill="#6b3a00">PREMIUM (caro)</text>
          <text x="356" y="76" font-size="18">vender aquí</text>
          <text x="356" y="90" font-size="18" fill="#222">— 50 % (equilibrium)</text>
          <text x="356" y="124" font-size="22" fill="#1b4a7a">DISCOUNT (barato)</text>
          <text x="356" y="144" font-size="18">comprar aquí</text>
          <text x="40" y="20" font-size="16" fill="#222">high del rango</text>
          <text x="40" y="164" font-size="16" fill="#222">low del rango</text>
        </g>
        <text x="270" y="192" text-anchor="middle" font-family="Caveat,cursive" font-size="18" fill="#ece9e1">«Quieres comprar las manzanas con descuento»</text>
      </svg>`},
    {t:'cards', items:[
      {c:'b', ico:'🛒', h:'Para comprar', p:'Quieres que el precio llegue a la zona gris de <b>descuento</b> (por debajo del 50 %), como las manzanas en oferta.'},
      {c:'c', ico:'🏷️', h:'Para vender', p:'Quieres que el precio llegue a la zona gris de <b>premium</b> (por encima del 50 %).'},
      {c:'y', ico:'🎨', h:'Los colores', p:'Solo cambia el color según desde dónde estires la herramienta. <b>Premium siempre arriba, descuento siempre abajo</b>; busca siempre la <b>zona gris</b>.'}
    ]},

    {t:'h2', text:'Cómo se usa', tape:'paso a paso'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">1 · Tendencia bajista y quieres vender</span><span class="ar">→</span>
        <span class="s tec">2 · Estira Fibonacci del swing high al swing low</span><span class="ar">→</span>
        <span class="s tec">3 · Descarta los FVG en descuento (zona azul)</span><span class="ar">→</span>
        <span class="s tec">4 · Espera a tocar el FVG en premium</span><span class="ar">→</span>
        <span class="s fin">5 · Busca un IFVG bajista = confirmación</span>
      </div>
      <div class="cap">«El IFVG es la confirmación: <b>ahí entras</b>.» Para comprar, lo mismo al revés: desde el low al high y busca FVG en descuento.</div>`},
    {t:'cards', items:[
      {c:'m', ico:'📐', h:'Qué rango', p:'El <b>swing high y swing low</b> del rango de 5 min que se ha creado. No toma el de un mini rango intermedio. A veces dibuja <b>dos</b> y se queda con que si toca <b>uno</b>, le vale.'},
      {c:'y', ico:'🧠', h:'Por qué funciona', p:'Si las instituciones venden, <b>cuanto más arriba vendan, más puntos se llevan al caer</b> (su ejemplo: 13 puntos vendiendo abajo frente a 62 desde arriba). Por eso les interesa llevar el precio a premium.'},
      {c:'l', ico:'🧩', h:'Todo junto', p:'Liquidez de baja resistencia acumulada + toque de FVG en premium + IFVG + liquidez objetivo: <b>«la perfección»</b>.'}
    ]},

    {t:'h2', text:'Sus ejemplos', tape:'qué vio'},
    {t:'list', items:[
      '<b>Alcista (New Day Opening Gap):</b> el primer FVG que toca no vale (no está en descuento) y el precio sube y saca a todos los que entraron ahí. Después toca <b>el equilibrium alineado con un FVG</b> y reacciona fuerte: ahí busca IFVG alcista de 1 a 5 min.',
      '<b>Bajista:</b> ha invertido los FVG alcistas, así que pasa a bajista. Abre varios gaps; le basta con <b>uno de los dos</b> en premium. Toca el gap alineado con el 50 % y cae «con continuación brutal».',
      '<b>Cuando no hay entrada:</b> el equilibrium alinea con un gap, pero el precio no lo toca y se va. «Qué pena»: <b>no pasa el 100 % de las veces</b>, y si entras ahí tienes el stop en el equilibrium y en un FVG: no es de alta probabilidad.',
      '<b>Ejercicio:</b> hazlo tú en cualquier temporalidad, con rangos al azar. Dice que lo encuentra <b>al instante, todo el rato</b>. El precio se va a buscar el FVG alineado con el equilibrium y reacciona ahí, no en el de más abajo.'
    ]},
    {t:'quote', text:'No te tengo que demostrar que funciona: míralo tú en el gráfico.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Cómo empieza su sesión', tape:'resumen suyo'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">1 · Marca key levels (1 h / 4 h previos)</span><span class="ar">→</span>
        <span class="s tec">2 · ¿Reversión desde la zona o continuación hacia ella?</span><span class="ar">→</span>
        <span class="s tec">3 · Continuación: FVGs en equilibrium</span><span class="ar">→</span>
        <span class="s fin">4 · Confirmación: IFVG</span><span class="ar">→</span>
        <span class="s fin">5 · Objetivo: BSL / SSL</span>
      </div>
      <div class="cap">Es <b>un paso a paso</b>, pero ahora aprendes los conceptos por separado. Más adelante los junta (el objetivo se decide según el sesgo diario, el high del día y la liquidez de baja resistencia).</div>`},
    {t:'p', cls:'detail', html:'<b>Lo que viene:</b> <b>sesgo diario y «draw on liquidity»</b> (cómo identifica su objetivo en la sesión de Nueva York) y un repaso de las <b>sesiones</b>; luego, un vídeo de <b>backtesting</b> juntándolo todo y después <b>estrategia y sistemas de entrada</b>. Su tarea de hoy: dibujar equilibrium en el gráfico y alinearlo con FVGs. <b>Ya salió el sesgo diario: <a href="#dia-21" style="color:var(--yellow)">Día 21</a>.</b>'},

    {t:'mine', id:'d19-eq', h:'¿Dónde compro/vendo yo hoy?', lab:'Esto es tuyo', ph:'Un trade reciente tuyo: ¿estaba en descuento o en premium? ¿Alineado con un FVG?…',
     hint:'Regla corta: sin zona gris, no se entra. Mírala antes de buscar el IFVG, no después.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos y las bromas, los comentarios sobre «sé lo que hago» y la narración de cada vela. Los valores exactos de la configuración de Fibonacci <b>no los detalla en la transcripción</b> (dice que copies los suyos de la pantalla): al ser sobre el gráfico, <b>revisa el vídeo cuando lo dibujes</b>. La cuenta de puntos (13 y 62) es su ejemplo. Transcripción: traducción automática al inglés; el «equilibrio» es la línea del 50 %.'}
   ]},
 { id:20, title:'Ego', tags:['psi','rie'], mins:12, status:'done',
   intro:'Psicología del otro extremo: qué pasa cuando vas muy bien. Sus cifras (23 TP seguidos, 28.000 € retirados, 50.000–60.000 € esperados) son su caso, no una referencia para ti.',
   blocks:[
    {t:'idea', text:'Tras una <span class="mk">racha ganadora</span> el ego se dispara y <span class="mk">un solo stop puede romperte todo el mes</span>. No cambies el riesgo ni dupliques cuentas: <span class="mk">mantén lo que haces</span> y recuerda que un stop va a llegar.'},

    {t:'h2', text:'Hay un nivel justo', tape:'el equilibrio mental'},
    {t:'cards', items:[
      {c:'y', ico:'⚖️', h:'Difícil de mantener', p:'En trading hay que encontrar el punto en que puedes <b>seguir operando mucho tiempo y ser rentable</b>. Es fácil quedarse por debajo (miedo, FOMO, revenge) o <b>por encima</b>: confianza inflada y ego.'},
      {c:'c', ico:'🔝', h:'Hoy: por encima', p:'Hablamos de cuando vienes de una buena racha: buena estrategia, experiencia <b>y también suerte</b>. Una racha así <b>no es normal</b>.'}
    ]},

    {t:'h2', text:'La estadística no perdona', tape:'muestra'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s fin">Backtesting: 5 años / ~1.000 trades → p. ej. 73 %</span><span class="ar">≠</span>
        <span class="s psi">1 mes al 100 % → muestra demasiado pequeña</span><span class="ar">→</span>
        <span class="s tec">A largo plazo vuelve hacia ~70 %</span>
      </div>
      <div class="cap">Un mes perfecto <b>no es tu win rate</b>. No es prepararte para una mala racha, sino <b>prepararte para ver más stops de los que estás acostumbrado</b>.</div>`},
    {t:'quote', text:'Estadísticamente, si vas en racha ganadora, tienes que perder alguno.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Lo que le pasó a él', tape:'la lección'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s fin">Mes y medio casi todo TP</span><span class="ar">→</span>
        <span class="s psi">«Voy a retirar 50.000–60.000»: ego por las nubes</span><span class="ar">→</span>
        <span class="s psi">Vuelve de viaje, enlaza todas las cuentas</span><span class="ar">→</span>
        <span class="s psi">Trade malo de 35 s: pierde todas</span>
      </div>
      <div class="cap">Sabía que era malo, pero <b>«como venía ganando»</b> pensó: entro, gano rápido y me llevo otros 20.000. <b>Perdió el impulso.</b></div>`},
    {t:'cards', items:[
      {c:'c', ico:'🔴', h:'El primer día rojo duele más', p:'Si estás acostumbrado a días verdes, <b>un rojo golpea el ego</b> (aunque sea -500). Mucha gente no lo soporta y <b>apuesta todo</b>: -500, -1000, y de golpe -2000/-3000: <b>cuentas quemadas en un instante</b>.'},
      {c:'y', ico:'💡', h:'Pero: mantener, no subir ni bajar', p:'Hay quien baja el riesgo tras una racha. A él no le gusta subirlo ni bajarlo: <b>mantenerlo</b>, y si llega una racha de stops, se recupera.'}
    ]},

    {t:'h2', text:'Qué hace él ahora', tape:'su práctica'},
    {t:'list', items:[
      'Los fines de semana se recuerda <b>«que puede venir un stop y tengo que saber afrontarlo»</b>.',
      'Su trabajo: <b>elegir trades muy buenos, trades que le gusten</b>, <b>no subir el riesgo</b> y <b>no replicar cuentas en exceso</b> (lo hizo una vez y aprendió).',
      'Podría replicar todo con riesgo alto y retirar mucho más ese mes, pero <b>lo hace despacio</b>: «a largo plazo, lo otro me mata».',
      '<b>Disfruta la racha</b> (los pagos llegan), solo que <b>no puede afectar a tu psicología</b>.'
    ]},

    {t:'h2', text:'El error humano no es el problema', tape:'la reacción'},
    {t:'html', cls:'viz', html:`
      <div class="cols" style="gap:16px">
        <div class="card c-m" style="transform:none"><h3>Fallo puntual ✔</h3><p>El lunes entras en un trade que no era bueno y pierdes. El martes entras en uno que sí te gusta y ganas. <b>El mes sigue siendo positivo y puedes retirar.</b> «El error humano existe.»</p></div>
        <div class="card c-c" style="transform:none"><h3>Cadena de reglas rotas ✘</h3><p>«Ya que rompí una, rompo todas.» Entras en un bucle y <b>pierdes el mes, el progreso y lo que te costó estar bien concentrado</b>… por una racha buena y un solo trade perdido.</p></div>
      </div>`},
    {t:'cards', items:[
      {c:'b', ico:'🪞', h:'Cuando la cagues: tres preguntas', p:'En vez de «¿por qué me pasa a mí? no es justo»: <b>(1)</b> ¿la he cagado? Sí. <b>(2)</b> ¿Sé que la he cagado? Sí. <b>(3)</b> ¿Sé que puedo volver adonde estaba? Sí, <b>si lo hago bien</b>, porque ya he llegado hasta aquí.'},
      {c:'y', ico:'🧠', h:'Recuérdalo', p:'La próxima vez que estés en esa situación, <b>no lo estropees y acuérdate de cómo te sientes ahora</b>. Dice que es <b>imposible</b> tener buena racha y no estropearla alguna vez.'}
    ]},
    {t:'quote', text:'Tendrás errores; lo que cuenta es cómo reaccionas.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Lo que viene', tape:'orden del curso'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Sesgo diario + draw on liquidity</span><span class="ar">→</span>
        <span class="s tec">Estrategia y entradas</span><span class="ar">→</span>
        <span class="s fin">Escalar con prop firms, riesgo, diario, backtesting</span>
      </div>
      <div class="cap">Dice que <b>bajará el ritmo de psicología</b> y entrará en estrategia. Cuando acabe, hablará de <b>escalar con cuentas de prop firm, qué riesgo asumir, cómo y dónde llevar un diario, por qué, cada cuánto y cómo revisarlo</b>, y cómo hacer backtesting. Ahí es donde encaja la zona <b>Registro</b> de esta libreta. Al acabar, hará un directo de dudas de unas 2 h que subirá como último episodio.</div>`},

    {t:'mine', id:'d20-ego', h:'¿Qué me pasa a mí cuando voy bien?', lab:'Esto es tuyo', ph:'Última racha buena que tuve: qué cambié (riesgo, trades extra, cuentas) y cómo acabó…',
     hint:'Una buena racha va a llegar. Escribe ahora qué NO vas a cambiar cuando llegue (riesgo, número de cuentas), antes de estar en caliente.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, las bromas, el repaso del calendario de Lucid en pantalla (no se leen los datos), el agradecimiento a los comentarios y mensajes de espectadores, y la mayoría de sus cifras de dinero (los 1.500 € de coste y los 28.000 € retirados son un mes suyo). Los 3.000 $ de payout posible y los -500 son ejemplos. Transcripción: traducción automática al inglés. Lo único práctico que no está explicado todavía es <b>el riesgo exacto</b>: lo promete para más adelante.'}
   ]},

 { id:21, title:'Sesgo diario y draw on liquidity', tags:['tec'], mins:32, status:'done',
   intro:'Qué análisis hace antes de que abra Nueva York. Es su primer vídeo sin preparar: graba y analiza gráficos en directo. Los esquemas son míos; los ejemplos son de su pantalla.',
   blocks:[
    {t:'idea', text:'Antes de que abra Nueva York mira <span class="mk">1 d → 4 h → 1 h</span>, decide si buscas <span class="mk">compras o ventas</span> y marca <span class="mk">el high o low que quieres que el precio barra</span>: ese es tu objetivo del día. Juntarlo todo es la <span class="mk">narrativa</span>.'},

    {t:'h2', text:'Tres palabras, una idea', tape:'definiciones'},
    {t:'cards', items:[
      {c:'y', ico:'📅', h:'Daily bias (sesgo diario)', p:'Unos <b>15 minutos antes de abrir</b> haces un análisis y decides si estás más inclinado a <b>compras o ventas</b>.'},
      {c:'m', ico:'🎯', h:'Draw on liquidity (DOL)', p:'«Mi objetivo», en literal. No es ganar X dólares ni pasar la cuenta: es <b>qué high o low quiero que el precio barra</b>. Es el objetivo del día. Ejemplo: comprar hasta un high que está dentro de un FVG.'},
      {c:'l', ico:'📖', h:'Narrativa', p:'Lo más importante y <b>de lo que menos se habla</b>: juntar tiempo + precio + condiciones (las condiciones las verá después) para construir <b>una historia</b> de lo que el precio va a hacer.'}
    ]},
    {t:'p', cls:'detail', html:'Dice que son lo mismo y a la vez cosas distintas: van de la mano. Y que es «para niños pequeños» de simple, y está infravalorado porque funciona.'},

    {t:'h2', text:'Su análisis de 4 preguntas', tape:'antes de abrir'},
    {t:'p', html:'Se conecta unos <b>10–15 minutos antes</b>: sobre las <b>15:20 en España = 9:20 en Nueva York</b>. La sesión abre a las 9:30 NY = 15:30 España.'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">1 · Timeframe alto: diario, 4 h, 1 h (sin marcar nada)</span><span class="ar">→</span>
        <span class="s tec">2 · ¿Qué hace el precio? ¿Sube o baja?</span><span class="ar">→</span>
        <span class="s tec">3 · ¿Qué estoy invalidando y qué estoy respetando?</span><span class="ar">→</span>
        <span class="s tec">4 · ¿Dónde están los key levels?</span><span class="ar">→</span>
        <span class="s fin">Busco compras (o ventas) hasta el objetivo</span>
      </div>
      <div class="cap">Su pregunta 2, tal cual: «¿Está subiendo o está bajando?». Así de simple.</div>`},
    {t:'cards', items:[
      {c:'b', ico:'🧱', h:'Invalidar y respetar', p:'En tendencia alcista <b>invalidas</b> los FVG bajistas (cierras por encima) y <b>respetas</b> los alcistas: si el precio toca uno y sube, te está diciendo lo que quiere hacer.'},
      {c:'c', ico:'📍', h:'Key levels y objetivo', p:'Todos los FVG de ese timeframe son key levels. Un <b>FVG sin tocar</b> (nunca visitado) más arriba es un buen objetivo. No sabes si lo cruzará o girará: por eso es el objetivo, y buscas compras <b>hasta ahí</b>.'},
      {c:'y', ico:'🛡️', h:'No operar contra el timeframe alto', p:'«No digo nunca, pero la gran mayoría de las veces.» Cuanto mayor el timeframe, más fuerza; el precio es fractal; y velas grandes en un timeframe bajo <b>engañan</b>. Quita mucho ruido.'}
    ]},

    {t:'h2', text:'Lo que vio en los gráficos', tape:'sus ejemplos'},
    {t:'list', items:[
      '<b>Día alcista claro:</b> 1 d, 4 h y 1 h alcistas → busca compras. Arriba hay liquidez (buy side), un FVG de 1 h y el equilibrium: eso es <b>construir una narrativa</b>. El precio toca el FVG alcista, deja un low dentro de un FVG, lo barre (la gente pone ahí el stop) y sube al high. Aclara que <b>no es para entrar</b>, es para ver cómo se mueve. El equilibrium ni se tocó y funcionó igual: <b>no siempre hace falta</b> (lo verá más adelante; repasa el <a href="#dia-19" style="color:var(--yellow)">Día 19</a>).',
      '<b>Dentro de un FVG de 4 h:</b> ya está listo para subir; puede tocar otro y barrer lows primero. No sabe qué hará, pero la narrativa le basta. Sube directo.',
      '<b>Dos zonas de reacción posibles:</b> ve dos escenarios y busca compras igualmente. Cuando el precio invalida un nivel y sube, «no te precipites» a vender solo porque había liquidez debajo: o esperas a que toque y compras desde ahí, o lo dejas. En un mercado de <b>pequeños retrocesos y rallies fuertes</b>, no cojas el pequeño retroceso: coge el rally.',
      '<b>Mejor saltarse el día que ir en contra:</b> «es mejor ver un día entero de caída, no pillas nada, y al día siguiente, con buena estructura, te unes al movimiento con calma.» Ese día hubo un retroceso al equilibrium (zona de descuento) y siguió subiendo.',
      '<b>Cuando se equivoca:</b> toca la zona, no hay reacción y cae fuerte con cierres fuertes. «Mi análisis fue malo.» <b>Ese día no opera.</b> Tiene sentido: en el diario el precio estaba lejos del equilibrium y para mantener una tendencia sana <b>rebalancea</b> volviendo a él.',
      '<b>Día de conflicto:</b> un FVG alcista a favor, pero un gran FVG bajista en contra y el diario en el equilibrium. «Aquí es donde entran las <b>condiciones</b>» y no las explica. Apuesta por ventas: sube a premium alineado con un FVG bajista, deja un high dentro de un FVG y cae.',
      '<b>Ya bajista:</b> solo espera a que toque un FVG de 1 h y cae. Muestra el cambio de tendencia en pocos días. Dice que <b>no eligió los días a propósito</b>.'
    ]},
    {t:'quote', text:'Si mi análisis falla, no pasa nada: ese día no opero.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Tu práctica', tape:'su tarea'},
    {t:'list', items:[
      'En TradingView busca días con <b>sesión a las 9:30</b> (hora de Nueva York) y haz el análisis un poco antes.',
      'Marca el rango (high y low), decide <b>compras o ventas</b> y busca los puntos de reacción y el objetivo.',
      'Su demo: diario bajista (invertía FVG y respetaba los nuevos) → inclinado a ventas. Un FVG de 1 h alineado, el precio lo toca, barre el high dentro del FVG y cae <b>unos 300 puntos</b> (≈ 6 % del Nasdaq en unas 9 h de velas de 1 h). <b>No vas a mantenerlo así</b> ni en la hora y media que operas: con pillar la reacción te basta.'
    ]},
    {t:'cards', items:[
      {c:'m', ico:'🧰', h:'Plantillas de línea en TradingView', p:'Dibuja una línea → ajustes → <b>texto</b> (su ejemplo: «mapache»), tamaño y negrita → <b>plantilla → guardar como</b>. Desde ahí, cada línea con esa plantilla muestra su texto (así marca BSL, SMT…).'}
    ]},
    {t:'p', cls:'detail', html:'<b>Lo que viene:</b> un vídeo de <b>sesiones</b> (Asia, Londres y Nueva York, con sus horas), las <b>condiciones</b>, <b>cómo y dónde entrar</b> exactamente, y qué plan de TradingView elegir y cómo configurarlo. Recomienda ver <b>su vídeo anterior del canal</b> sobre lo mismo (enlace en la descripción; no pude leer la descripción).'},

    {t:'mine', id:'d21-bias', h:'Mi análisis antes de las 15:30', lab:'Esto es tuyo', ph:'Hoy: sesgo (compras o ventas), objetivo (¿qué high o low quiero que barra?), qué invalido y qué respeto…',
     hint:'Las 4 preguntas a las 15:20 (9:20 NY). Si luego te equivocas, apunta qué viste mal: ese día no se opera.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, la promoción de su vídeo anterior y la narración vela a vela de los siete días. En la transcripción hay <b>palabras en blanco</b> (nombres de conceptos que no se tradujeron), así que algún matiz puede faltar. Los ejemplos no indican fechas ni instrumento (habla del Nasdaq). <b>Ojo a la hora:</b> dice 9:20 NY y 10–15 minutos antes, pero en la demo marca las 9:00 y en la tarea te pide las 9:00. Transcripción: traducción automática al inglés.'}
   ]},
 { id:22, title:'Confía en ti', tags:['psi','rie'], mins:14, status:'done',
   intro:'Casi el último vídeo de psicología «general». Mensaje central: se puede ganar dinero con trading y hay que creérselo, sin hacer caso del ruido de internet. En la segunda mitad entra en algo muy práctico: mover a break even demasiado pronto o cerrar antes del objetivo.',
   blocks:[
    {t:'idea', text:'Cree que <span class="mk">puedes ganar dinero</span> con una estrategia que has probado, <span class="mk">ignora las opiniones de internet</span> y, una vez dentro de una operación, <span class="mk">no toques nada</span> si no tienes una razón.'},

    {t:'h2', text:'Se puede ganar dinero', tape:'creérselo'},
    {t:'cards', items:[
      {c:'m', ico:'💪', h:'No hace falta ser un genio', p:'Dice que no tiene un talento especial para esto: <b>puso muchas horas</b>, aprendió lo que necesitaba y, sobre todo, <b>aprendió de sus errores y de su psicología</b>.'},
      {c:'b', ico:'🔬', h:'Compruébalo tú', p:'Ante los comentarios de «no tienes ni idea», «las cuentas de prop firm no son trading» o «vendes humo», lo mejor es <b>ignorarlos</b> y verlo por ti mismo con tu propio backtesting.'},
      {c:'y', ico:'🧪', h:'Confía en lo que has probado', p:'Sabe que su estrategia funciona porque <b>lo vio en backtesting</b> y porque, si la sigue un tiempo, da resultados. Dice que con capital propio funcionaría igual, pero todavía <b>no lo ha demostrado</b> (no tiene cuenta personal) y lo promete para más adelante.'}
    ]},
    {t:'p', cls:'detail', html:'No quiere sonar a gurú: nada de «manifestar» ni historias de superación inventadas. Cuenta que su vida era normal y que dejó la universidad <b>cuando vio que ganaba dinero</b> con cuentas fondeadas. <span class="muted">Hay quien dice que las cuentas fondeadas «no son trading»; él lo considera discutible.</span>'},

    {t:'h2', text:'Lo que hay detrás', tape:'el trabajo'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s psi">Meses de práctica, pérdidas y cuentas quemadas</span><span class="ar">→</span>
        <span class="s tec">Revisar el journal y backtestear muchas horas</span><span class="ar">→</span>
        <span class="s tec">Apuntar todo en un cuaderno</span><span class="ar">→</span>
        <span class="s fin">Ahora: 1 h de gráfico al día (2 como mucho)</span>
      </div>
      <div class="cap">Mira el gráfico <b>solo 1–2 h al día</b>, pero <b>llegó ahí tras mucho trabajo</b>. Esa fase de estudiar y practicar es donde mucha gente se queda atascada.</div>`},
    {t:'quote', text:'Si no cambias nada, nada cambia.', src:'Frase que repite el autor'},
    {t:'p', html:'¿Cinco años operando sin ganar? No es falta de talento: <span class="mk c">es repetir los mismos errores una y otra vez</span>. Cuando dejas de cometerlos, llegan los resultados. Por eso le da tanto peso a la psicología y a aprender de los errores.'},

    {t:'h2', text:'Pocas operaciones, bien elegidas', tape:'su enfoque'},
    {t:'cards', items:[
      {c:'m', ico:'🎯', h:'Frecuencia baja', p:'En su ejemplo del mes: <b>5 operaciones en 16 días</b> con un win rate de ~70 %. Esperar solo trades muy buenos y operar poco es lo que hace posible ese resultado.'},
      {c:'y', ico:'🧾', h:'Cuenta cuánto gastas', p:'Para saber si compensa, compara <b>lo gastado en cuentas con lo retirado</b>: si gastas 50 y sacas 40, has perdido 10. Es justo lo que mide la sección <b>Banca</b> de esta app.'},
      {c:'b', ico:'💸', h:'No se retira todo', p:'Con cuentas fondeadas <b>no puedes retirar todo el saldo de una vez</b>: hay límites por cuenta. Cómo escalar con varias cuentas lo verá más adelante.', detail:true}
    ]},

    {t:'h2', text:'Break even demasiado pronto', tape:'práctica'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s">Arriesgas 500 $ (ejemplo)</span><span class="ar">→</span>
        <span class="s tec">Vas ganando 105 $</span><span class="ar">→</span>
        <span class="s psi">Mueves el stop a break even</span><span class="ar">→</span>
        <span class="s fin">Pregúntate: ¿por qué?</span>
      </div>
      <div class="cap">Antes de tocar nada, <b>hay que saber el motivo</b>. Dice que él lo hacía mucho.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'😰', h:'Arriesgas más de la cuenta', p:'No quieres darte ni la opción de perder, así que mueves el stop a break even <b>demasiado pronto</b>.'},
      {c:'c', ico:'🫣', h:'Miedo a que gire', p:'Temes que el precio dé la vuelta y toque tu stop. Eso significa <b>no confiar en tu estrategia</b> (lo trató en el <a href="#dia-9" style="color:var(--yellow)">Día 9</a>).'},
      {c:'c', ico:'💵', h:'Por la cifra en dólares', p:'«Voy 600 de 1.000, muevo a break even.» <b>Mover por dólares o por emoción</b> no tiene razón de ser.'}
    ]},
    {t:'idea', text:'Mueves a break even <span class="mk">solo cuando el precio llega a un key level</span> (una zona de conflicto), <span class="mk">no por dólares ni por emociones</span>. Cuál y cuándo exactamente lo verá más adelante.'},
    {t:'p', html:'<b>Lo mismo al cerrar:</b> si tu objetivo está en un nivel y llevas casi todo el beneficio, <b>no cierras</b>. El precio tiene que llegar a ese nivel. A largo plazo, <span class="mk">psicológicamente compensa dejar que las operaciones trabajen</span>.'},

    {t:'h2', text:'Una vez dentro, no se toca', tape:'regla'},
    {t:'cards', items:[
      {c:'m', ico:'🧊', h:'La regla', p:'Una regla que tuvo (ya no hace falta pensarla): <b>cuando decides entrar, no tocas nada</b>. Lo único que haces con el ratón es salir cuando toque. Entrar ya fue la decisión y asumiste ese riesgo, <b>sea un buen trade o uno malo</b>.'}
    ]},
    {t:'list', items:[
      'Si llega a tu <b>stop</b> o a tu <b>objetivo</b>, <b>revisas el porqué</b>.',
      'Si era un buen trade, <b>no pasa nada</b>.',
      'Si era malo, <b>aprendes el porqué</b>.',
      'Si salió increíble, es increíble. Lo importante es <b>seguir el sistema</b>.'
    ]},
    {t:'p', cls:'detail', html:'<span class="muted">⚠️ La transcripción pierde las palabras «stop loss» y «take profit» en este tramo, así que la lista está reconstruida por el sentido. Compruébala en el vídeo (≈ 12:24–12:55).</span>'},

    {t:'mine', id:'d22-be', h:'¿Cuándo muevo yo el stop?', lab:'Esto es tuyo', ph:'La última vez que moví a break even o cerré antes del objetivo: ¿por qué lo hice (dólares, miedo, un nivel)? ¿Qué habría pasado si no lo toco?…',
     hint:'Pregúntate el porqué antes de tocar la operación. Apúntalo también en el Diario, con los errores «Moví el stop» o «Cerré antes de tiempo».', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los comentarios concretos de internet, las anécdotas personales, la pantalla con sus cuentas y las cifras de retiradas y gastos del mes (son su caso, no una referencia para ti), sus planes de vídeos y el adelanto de contenidos. Los números del ejemplo (500 $, 105 $, 1.000 $) son suyos. Transcripción: traducción automática al inglés; <b>pierde palabras clave</b> y no se entiende la cifra que da sobre cuántas operaciones llegan al objetivo, así que no la apunté.'}
   ]},

 { id:23, title:'Manipulation legs', tags:['tec'], mins:20, status:'done',
   intro:'Segunda parte de los IFVG: cómo localizar una manipulation leg y cuál es el FVG que debes esperar dentro de ella. Los esquemas son míos; los ejemplos son de su pantalla en directo (sin fecha ni instrumento).',
   blocks:[
    {t:'idea', text:'Una <span class="mk">manipulation leg (ML)</span> es el tramo <span class="mk">del swing high al swing low</span> del movimiento que barrió el último low (o al revés). Dentro de ella buscas el FVG del <span class="mk">timeframe más alto</span> y entras cuando se invierte (IFVG).'},

    {t:'h2', text:'Qué es manipular', tape:'la idea'},
    {t:'p', html:'Recuerda la liquidez (<a href="#dia-6" style="color:var(--yellow)">Día 6</a>): el precio toca un key level, muchos compran y ponen su stop debajo, y las instituciones <b>van a por esos stops</b> para entrar a mejor precio. Ese movimiento se llama <b>manipulación</b>.'},
    {t:'cards', items:[
      {c:'c', ico:'🪤', h:'Manipulación', p:'El movimiento que sale a cazar los stops de quienes entran <b>demasiado pronto</b>. Suele verse así: acumulación en un rango, el precio <b>sale del rango</b> (una mecha), y luego se mueve de verdad.'},
      {c:'y', ico:'📏', h:'Manipulation leg (ML)', p:'Del <b>swing high al swing low</b> del movimiento que tomó el último low (en ventas, al revés). Según el timeframe verás más o menos. <b>No busques el high más alto: el más reciente.</b>'},
      {c:'b', ico:'🔗', h:'Con qué se relaciona', p:'Está muy ligada a los <b>stop hunts</b> (no son lo mismo) y al <b>PO3</b> (alinearte con el tiempo). Dice que en su estrategia hace falta <b>casi siempre una manipulación</b>. Ambos los explicará después.'}
    ]},

    {t:'h2', text:'Cómo se usa con el IFVG', tape:'paso a paso'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">1 · Estás en un key level y se barre un low (si buscas compras)</span><span class="ar">→</span>
        <span class="s tec">2 · Marca la ML: swing high reciente → swing low</span><span class="ar">→</span>
        <span class="s tec">3 · Mira si hay FVG en 5, 3, 2, 1 min y 30 s dentro de ella</span><span class="ar">→</span>
        <span class="s tec">4 · Elige el de mayor timeframe</span><span class="ar">→</span>
        <span class="s fin">5 · Espera su IFVG (cierre al otro lado) y entras</span>
      </div>
      <div class="cap">Lógica: un FVG bajista mantiene el precio bajando; si el precio lo <b>invalida</b>, te dice que quiere subir. Y si el FVG de timeframe más alto en contra ya no existe, <b>no queda nada superior que pueda frenarte</b>.</div>`},
    {t:'cards', items:[
      {c:'m', ico:'👑', h:'El timeframe más alto manda', p:'Si hay un FVG de 3 min en la ML, <b>no esperes el de 2 min ni el de 1 min</b>: entrarás mejor. Y no se usa nada por encima de <b>5 minutos</b>.'},
      {c:'c', ico:'🔁', h:'Nueva barrida, nueva ML', p:'Cada vez que se toma otro low en un key level hay <b>una ML nueva</b>, y las anteriores pueden dejar de valer (en un ejemplo, en 3 min ya no había swing, solo mechas).'},
      {c:'y', ico:'⚙️', h:'Dos opciones', p:'Esperar el IFVG del timeframe alto de la ML anterior, o (si tienes experiencia o convicción) tomar el del <b>nuevo timeframe de la nueva ML</b>.'}
    ]},

    {t:'h2', text:'Sus tres ejemplos', tape:'en directo'},
    {t:'list', items:[
      '<b>Compras, rango y mecha:</b> acumulación, barre un low con una mecha. En 5 min la ML <b>no tiene FVG</b>; en 3 min sí (nuevo high, mismo low) → esperas ese IFVG. En 2 y 1 min también hay FVG, pero <b>entrarías en el de 3</b>. Esa parte de la transcripción es confusa: revísala en el vídeo.',
      '<b>Compras en key level:</b> el precio está en un FVG de 15 min y de 30 min. Mini acumulación, se barre el low. En 5 y 3 min no se ha formado el FVG aún; en 2 min sí: <b>cierra por encima y entras</b>, con su 1:1 → take profit. No había FVG de 3 min en contra: no hay motivo para que vuelva a cazar el stop.',
      '<b>Compras, low de 5 min dentro de un FVG de 15:</b> sale del rango y barra el stop. En 2 min hay low y high; en 3 min low y FVG; en 5 min low y FVG → <b>esperas el de 5 min</b> y sube. Dice que es «literalmente el dibujo del principio».'
    ]},
    {t:'p', cls:'detail', html:'No es siempre: debe estar <b>en un key level</b> y acompañado de <b>tiempo</b> (lo verá después). Cuantas más cosas juntes (equilibrium, SMT, ML, IFVG), más probabilidades.'},
    {t:'quote', text:'Espera siempre el IFVG del timeframe más alto de la manipulation leg, aunque a veces el precio se vaya sin ti.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Su aviso', tape:'frustración'},
    {t:'cards', items:[
      {c:'c', ico:'😤', h:'Te va a molestar', p:'Esperas el de 3 min, el de 1 min se invierte y el precio llega al TP <b>antes de darte entrada</b>. Aun así recomienda seguir esperando el del timeframe más alto.'},
      {c:'b', ico:'🧠', h:'Por qué él no siempre lo hace', p:'Con su nivel tiene una <b>convicción y discreción</b> que le hace priorizar el <b>draw on liquidity</b> y el PO3. Tú, de momento, céntrate en el timeframe alto y ya desarrollarás la tuya.'}
    ]},

    {t:'h2', text:'Tu tarea', tape:'su tarea'},
    {t:'list', items:[
      'Identifica <b>cinco manipulation legs</b> marcando el swing high y el swing low.',
      'En cada una, <b>espera e identifica el FVG del timeframe más alto</b> dentro de ella.',
      'Si además lo alineas con un <b>key level y liquidez</b>, «eres de los mejores».'
    ]},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Stop hunts</span><span class="ar">+</span>
        <span class="s tec">Condiciones</span><span class="ar">+</span>
        <span class="s tec">PO3 / AMD</span><span class="ar">+</span>
        <span class="s tec">Sistemas de entrada</span><span class="ar">+</span>
        <span class="s tec">Sponsorship</span><span class="ar">→</span>
        <span class="s fin">Estrategia completa y backtesting</span>
      </div>
      <div class="cap">Dice que quedan <b>cinco cosas</b> (más el «sponsorship») y que calcula <b>unos 15–20 días</b> de bootcamp. Luego juntará todo en un vídeo largo y hará <b>uno o dos de backtesting</b>; también explicará <b>cómo escalar y qué profit usar</b>.</div>`},

    {t:'mine', id:'d23-ml', h:'Mis 5 manipulation legs', lab:'Esto es tuyo', ph:'Fecha y hora, qué low barrió, timeframe de la ML y FVG que elegí…',
     hint:'Compara con tus operaciones del diario: ¿hubo barrida y ML? ¿Esperaste el IFVG del timeframe alto?', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, sus quejas por la duración del bootcamp, su cansancio y las dudas sobre si lo explica bien. En la transcripción hay horas del reloj del gráfico que no se pueden usar (y el primer ejemplo se entiende mal sin verlo). No dice el instrumento ni la fecha de los ejemplos. <b>«Sponsorship» lo menciona como pendiente</b> y no lo define. Transcripción: traducción automática al inglés.'}
   ]},

 { id:24, title:'Perder es normal', tags:['psi','rie'], mins:10, status:'done',
   intro:'Psicología, grabado el día que perdió su primer stop en directo delante de más de mil personas. La idea: perder forma parte de la estadística, y la reacción importa más que el stop.',
   blocks:[
    {t:'idea', text:'Una operación puede tener <span class="mk">todo a favor y aun así perder</span>: es parte de la estadística. No es un error, y <span class="mk">siempre encontrarás algo en contra</span> si lo buscas.'},

    {t:'h2', text:'Saberlo no es reaccionar bien', tape:'la idea'},
    {t:'p', html:'Casi todo el mundo sabe que en trading <b>no se gana siempre</b>. Otra cosa es <b>cómo reaccionas</b>: tras muchas ganadoras, la primera pérdida cuesta y no la «interiorizas». Las reacciones malas ya las vimos:'},
    {t:'list', items:[
      '<b>Revenge trading</b> (<a href="#dia-14" style="color:var(--yellow)">Día 14</a>), <b>FOMO</b> al día siguiente (<a href="#dia-18" style="color:var(--yellow)">Día 18</a>), <b>subir el riesgo</b>, <b>ir con prisa</b> (<a href="#dia-7" style="color:var(--yellow)">Día 7</a>) y <b>compararte con gente de internet</b>.',
      '<b>La reacción que él propone:</b> como le pasó hoy, enfadarse (a él perder le enfada) y <b>cerrar el ordenador</b>: sale de sus cuentas y no hace nada más ese día, sin juzgar si la operación pudo ser mejor o peor.'
    ]},

    {t:'h2', text:'Perder es parte de la estadística', tape:'muestra'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Estrategia con ~71 % de aciertos en miles de operaciones (cifra de ejemplo)</span><span class="ar">→</span>
        <span class="s fin">Todas cumplen los parámetros: son buenas operaciones</span><span class="ar">→</span>
        <span class="s psi">~30 % pierden y no hay nada mal en ellas</span>
      </div>
      <div class="cap">Dice que son <b>10.000 buenas operaciones</b> de las que ~30 % fallan. Su cifra es inventada para explicarlo, no una estadística tuya ni suya.</div>`},
    {t:'quote', text:'Siempre vas a tener algo en tu stop loss: si buscas por qué falló, siempre encuentras un motivo.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'No sobreanalices', tape:'la trampa'},
    {t:'cards', items:[
      {c:'c', ico:'📓', h:'La trampa de quien quiere mejorar', p:'Quien empieza y está obsesionado quiere <b>hacer más, mejorar siempre</b>. Si analizas todo (S&amp;P 500, Nasdaq, hora, condiciones) apuntas mejoras sin parar y acabas <b>haciendo ajustes que se contradicen</b> en tu estrategia.'},
      {c:'y', ico:'⚖️', h:'Pesa a favor y en contra', p:'¿Tenías <b>ocho cosas a favor y dos en contra</b>? Era una buena operación: olvídala y no te estreses. Siempre habrá algo en contra.'}
    ]},

    {t:'h2', text:'Pregúntate: ¿qué haría mi yo de backtesting?', tape:'la herramienta'},
    {t:'list', items:[
      '<b>Backtesting</b> (lo verá más adelante): practicar tu estrategia desde casa, en cualquier día y año, <b>sin dinero real</b>. Dice que se pueden hacer 600 operaciones así.',
      'Ahí <b>no sobreanalizas</b>: si cumple tus parámetros, disparas; si pierde, «siguiente día»; si gana, sigues. Tras unas semanas ves, por ejemplo, 5 pérdidas y 8 ganancias y un buen mes.',
      'Con dinero real (evaluación, funded o propio) haces cosas que <b>no harías en backtesting</b>: alargar el take profit, analizar de más, llenar el diario, mirarlo todo cuatro veces, quedarte pegado al mercado tras perder. Es normal, porque hay dinero de por medio.',
      '<b>La pregunta clave en ese momento:</b> «¿qué haría mi yo de backtesting?».'
    ]},

    {t:'h2', text:'Lo que sí es gambling', tape:'reglas'},
    {t:'cards', items:[
      {c:'c', ico:'🎰', h:'Aunque sigas el sistema…', p:'Dice que es <b>gambling</b>: desviarte de tu gestión de riesgo, operar <b>fuera de tu horario</b>, meter <b>más de una operación al día</b> o entrar en operaciones por tiempo. Hay que ser <b>muy estricto</b> con las reglas (ver <a href="#dia-12" style="color:var(--yellow)">Día 12</a>).'},
      {c:'y', ico:'📉', h:'Habrá meses malos', p:'Puedes perder en un mes, estar mal psicológicamente y hacer operaciones terribles: «es parte de emprender». Te pasará y quizá no entiendas por qué.'}
    ]},

    {t:'h2', text:'Presión en directo', tape:'su caso'},
    {t:'p', html:'Su primer directo operando acabó con su <b>primer stop delante de la gente</b>: dice que la presión se nota mucho, que se siente culpable porque la gente le copia aunque repita que no da señales, y que mañana lleva la presión de <b>no querer dos stops seguidos en directo</b>. Su plan: reflexionar esa tarde y mantener la calma.'},
    {t:'p', cls:'detail', html:'<b>Lo que viene (su orden):</b> <b>condiciones y sponsorship</b>, luego <b>stop hunts, PO3 y AMD</b>, después <b>estrategia</b> y <b>backtesting</b>, y ya el paso a paso de la demo, cómo usar el backtesting, <b>cómo escalar</b> y qué cuentas fondeadas son mejores.'},

    {t:'mine', id:'d24-perder', h:'¿Qué hago yo cuando pierdo?', lab:'Esto es tuyo', ph:'Mi última pérdida: ¿cerré, analicé de más, entré otra vez o lo dejé pasar?…',
     hint:'Antes de dar vueltas a una pérdida, haz su cuenta: ¿cuántas cosas tenía a favor y cuántas en contra? Y pregúntate qué haría tu yo de backtesting.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, la cifra de dinero que perdió en directo, su situación y las quejas sobre la gente que le copia. Los porcentajes (71 %, 30 %, 10.000 operaciones, 5 y 8) son <b>ejemplos inventados</b>. En un tramo (≈ 2:24–2:34) la transcripción pierde palabras. Lo de «operaciones por tiempo» no queda claro en la traducción. Transcripción: traducción automática al inglés.'}
   ]},

 { id:25, title:'Condiciones y sponsorship', tags:['tec'], mins:22, status:'done',
   intro:'Según él, el vídeo más importante del bootcamp: cómo alinear las temporalidades con «condiciones» y qué es un gap «esponsoreado». Leído del español original (subtítulos automáticos de YouTube), que a veces se come los números de las temporalidades. Los esquemas son míos; los ejemplos, de su pantalla.',
   blocks:[
    {t:'idea', text:'Una <span class="mk">condición</span> es un «si pasa esto, haré esto» que te pones cuando <span class="mk">no sabes qué va a hacer el precio</span>. No predices: <span class="mk">escuchas lo que el precio te dice</span>.'},

    {t:'h2', text:'Tres pasos', tape:'cómo se alinean'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">1 · Afirmaciones: 1 d, 4 h, 1 h (antes de abrir)</span><span class="ar">→</span>
        <span class="s tec">2 · Condiciones: FVG de 5 min (a veces 15)</span><span class="ar">→</span>
        <span class="s fin">3 · Ejecución: IFVG de la temporalidad más alta de la manipulation leg</span>
      </div>
      <div class="cap">Los pasos 2 y 3 se hacen ya con el mercado abierto. «Tranquilos, la estrategia se verá mucho mejor.»</div>`},
    {t:'cards', items:[
      {c:'b', ico:'🔭', h:'1 · Afirmaciones', p:'Lo del <a href="#dia-21" style="color:var(--yellow)">Día 21</a>: daily bias, draw on liquidity, narrativa y la tendencia. En gráficos de <b>diario, 4 h y 1 h</b> marcas altos y bajos, FVG alcistas y bajistas, y los posibles <b>key levels</b>.'},
      {c:'y', ico:'❓', h:'2 · Condiciones', p:'La temporalidad intermedia: los <b>FVG de 5 min</b> (y a veces de 15) se usan como condición. Ejemplo: «si toca el key level y cierra por debajo del gap (IFVG) → ventas; si lo respeta y sigue subiendo → compras».'},
      {c:'m', ico:'🎯', h:'3 · Ejecución', p:'Solo IFVG, y <b>el de la temporalidad más alta de la manipulation leg</b> (<a href="#dia-23" style="color:var(--yellow)">Día 23</a>), de 30 s a 5 min.'}
    ]},

    {t:'h2', text:'Para qué sirven', tape:'la idea'},
    {t:'list', items:[
      '<b>Saber si un key level aguantará.</b> El mercado sube y baja y no respeta siempre las zonas: es la respuesta a «cuándo aguanta un key level» que dejó para más adelante. Lo sabes <b>cuando el mercado abre</b>, no antes. Por eso muchas veces no tienes daily bias.',
      '<b>Psicología.</b> En vez de ir reactivo y nervioso detrás de una vela grande, <b>preparas el cerebro para dos escenarios</b>: «si pasa A, vendo; si pasa B, busco compras».',
      '<b>Si el precio respeta el gap de la condición</b>, te confirma la continuación; <b>si lo invalida con fuerza</b>, tienes key level tocado + IFVG + objetivos al otro lado: entras.'
    ]},

    {t:'h2', text:'Sus ejemplos (de ese día)', tape:'en directo'},
    {t:'list', items:[
      '<b>Ventas:</b> cae dentro de un FVG de 15 min, de uno de 1 h y de uno pequeño de 4 h, y se quita un internal low → key level. Condición: el FVG de arriba. Se toca, hay <b>low resistance liquidity</b>, acumulación, manipulación a una condición y el IFVG de la temporalidad más alta → <b>take profit</b>. «Has juntado todo lo que sabes con una sola condición.» Quien veía la mecha de 4 h y decía «va a subir» debía poner la condición y ser paciente: se cumplió y siguió bajando. Después: si cierra por encima del nuevo gap, el siguiente objetivo; si aguanta, sigue la bajada: «¿para qué ir en contra si todo está alineado?».',
      '<b>Objetivo muy caro (un alto alineado con otro alto):</b> no sabes si el FVG de 1 h aguantará. En vez de esperar condiciones de 1 h, <b>escalas a 15 min</b>: si el gap abierto se respeta y sube, el precio ya no quiere el low de 1 h; si se invalida, va a por él. Se invalidó, tocó el internal low, se creó la manipulation leg y subió.',
      '<b>Un hueco de apertura de semana (NWOG):</b> ¿lo rellena entero o vuelve a por los bajos? Condición: el FVG recién abierto. Si lo toca y sube, quiere rellenar el hueco.',
      '<b>Señales cruzadas:</b> toca un FVG bajista dejando mecha y a la vez uno alcista (y uno bajista de 4 h). Hace caso <b>al FVG más reciente que se ha tocado</b> y pone condiciones. No esperas 3 h a que se invierta uno de 1 h: bajas a <b>la manipulation leg y coges su IFVG de mayor temporalidad</b>. Alternativa: dejar que suba, esperar un gap nuevo y usarlo de condición. A veces no se toca y el precio sube sin ti: no pasa nada.'
    ]},
    {t:'quote', text:'No quiero predecir a dónde va el precio: quiero ver lo que me dice que quiere hacer.', src:'Idea del vídeo (parafraseada)'},

    {t:'h2', text:'Sponsorship (gap esponsoreado)', tape:'lo que prometió'},
    {t:'cards', items:[
      {c:'y', ico:'🤝', h:'Qué es', p:'El <b>primer gap que se crea después de tocar un key level</b>: está «respaldado» por el gap de 1 h o 4 h que se tocó. El segundo gap que se abre en esa subida no está esponsoreado y muchas veces <b>no es tan bueno</b>.'},
      {c:'m', ico:'⚖️', h:'Por qué importa', p:'El primer gap suele estar dentro del <b>equilibrium</b> y el segundo no, y siempre queremos estar en la zona gris (<a href="#dia-19" style="color:var(--yellow)">Día 19</a>). Te interesa un gap esponsoreado, o al menos que el segundo toque el equilibrium. Si se alinea con él, «estate tranquilo».'},
      {c:'b', ico:'🕐', h:'Por temporalidad', p:'Es el primer gap <b>de cada temporalidad</b>: el primero de 5 min y el primero de 15 min tras el key level están, cada uno, esponsoreados. Él mismo dice que no se le entiende del todo y que <b>no le da mucha importancia</b>.'}
    ]},
    {t:'p', cls:'detail', html:'Aclara que <b>él no lo usa del todo</b>: le sirve para tener más confianza en un trade o decidir si le gusta. Lo explica para que sepas de qué habla si lo nombra en un recap. Y que, con el <b>backtesting</b>, esto se ve mucho mejor.'},

    {t:'mine', id:'d25-cond', h:'Mis condiciones de hoy', lab:'Esto es tuyo', ph:'En el key level de hoy: si toca el gap y …, entonces …; si lo invalida con fuerza, entonces …',
     hint:'Escríbelo antes de abrir, en dos líneas: una condición para compras y otra para ventas. Luego compara qué hizo el precio.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, el aviso de que el vídeo es «el mejor del bootcamp», los comentarios de ánimo y la narración vela a vela. Los subtítulos automáticos se comen casi todas las temporalidades («de 5 o …», «de …»): donde pone «5 o 15» es lo que se entiende, pero conviene revisarlo en el vídeo. En la parte de las tres fases (≈ 3:00) dice que los FVG de 5 min «sirven siempre para condiciones» y no queda claro si lo afirma o lo niega: es coherente con el <a href="#dia-15" style="color:var(--yellow)">Día 15</a> (no como key level, sí como condición). No dice instrumento ni fecha en los ejemplos.'}
   ]},

 { id:26, title:'TP, SL y riesgo-beneficio', tags:['rie','tec'], mins:20, status:'done',
   intro:'Qué relación riesgo-beneficio usa, dónde pone el take profit y dónde el stop loss, con su trade del día. El cálculo de contratos y cuánto arriesgar exactamente lo deja para la gestión de riesgo. Leído del español original (subtítulos automáticos de YouTube); sus cifras de dinero son ejemplos.',
   blocks:[
    {t:'idea', text:'<span class="mk">Mínimo 1:1, nunca ratios negativos.</span> El take profit va en <span class="mk">zonas de conflicto</span> y el stop donde <span class="mk">tu idea queda invalidada</span>. Prefiere RR cortos: acierta más y aguanta menos tiempo.'},

    {t:'h2', text:'Qué es el riesgo-beneficio (RR)', tape:'la base'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s rie">Arriesgas 500 $ (stop)</span><span class="ar">→</span>
        <span class="s tec">RR 1:1 → ganas 500 $</span><span class="ar">→</span>
        <span class="s tec">RR 1:2 → ganas 1.000 $</span><span class="ar">→</span>
        <span class="s psi">RR 0,5 → ganas 250 $ (no se usa)</span>
      </div>
      <div class="cap">En la herramienta de posición de TradingView, la zona gris es el stop, la azul es el TP y el número del ratio te dice cuánto ganas por cada euro que arriesgas.</div>`},
    {t:'cards', items:[
      {c:'y', ico:'📐', h:'Sus tres RR', p:'Casi siempre entre <b>1:1 y 1:2</b>, y en medio <b>1:1,5</b>. El 1:1,5 lo adelanta para <b>evaluaciones y cuentas de fondeo</b> (el porqué lo dará con el riesgo). Hoy ya no tiene un RR fijo: depende de las condiciones del trade.'},
      {c:'m', ico:'🎯', h:'Cuándo más alto', p:'Objetivo muy claro: key level, un high relativo alineado con otro, mucha <b>low resistance liquidity</b> y el IFVG de la temporalidad más alta de la manipulation leg. Ahí llega a 1:2 (en su ejemplo, 1:2,2), y suele ser su máximo.'},
      {c:'c', ico:'⏱️', h:'Cuándo más bajo', p:'Si hay una <b>condición abierta</b> y no sabes qué hará el precio, no predices: <b>sales justo cuando se toque la condición</b>, con un RR menor.'}
    ]},

    {t:'h2', text:'Por qué RR cortos', tape:'su razón'},
    {t:'list', items:[
      'Un TP más lejano es <b>más difícil de alcanzar</b>: a más RR, <b>menos aciertos</b> y más pérdidas que soportar.',
      '<b>Su primer año:</b> RR 1:3 y 45–50 % de acierto. Tras perder tres días seguidos de 500, al cuarto día pensaba en cerrar antes y hacer tonterías. Se ponía nervioso en el trade (dopamina) y no toleraba bien los días rojos: entraba sin confianza.',
      '<b>Ahora:</b> RR 1:1, trades de minutos y un acierto de alrededor del <b>70 %</b>. Cuando pierde piensa: «con este porcentaje, mañana probablemente gano».',
      'No tiene nada en contra de los RR altos («funcionan de madre» y conoce traders buenísimos que los usan): es lo que le encajaba psicológicamente.'
    ]},

    {t:'h2', text:'Dónde va el take profit', tape:'TP'},
    {t:'cards', items:[
      {c:'y', ico:'📍', h:'En zonas de conflicto', p:'Donde el precio pueda girar: una <b>BSL/SSL clara</b>, un <b>key level</b> o, si no sabes hacia dónde irá, <b>una condición</b> (gap de 5 o 15 min). «Si el precio quiere seguir, tiene que tocar el imbalance.»'},
      {c:'c', ico:'🚫', h:'Nunca ratios negativos', p:'Mínimo <b>1:1</b>: no arriesgas 500 para ganar 400. Si el objetivo queda más cerca que 1:1 (ej. 1:0,6), coges el 1:1 y <b>dejas correr</b>.'}
    ]},

    {t:'h2', text:'Dónde va el stop loss', tape:'SL'},
    {t:'list', items:[
      'No tiene sentido ir sin stop: te puedes arruinar. El stop va <b>donde tu idea del trade queda invalidada</b>: «si toca mi stop, estoy equivocado».',
      '<b>Regla de partida:</b> en la <b>mecha de la manipulación</b>, el extremo del rango de tu entrada (el bajo en largos, el alto en cortos). Así no ves «manipular la manipulación».',
      '<b>Truco para avanzados:</b> con un objetivo muy caro, un draw on liquidity clarísimo y un IFVG con fuerza y desplazamiento, puedes acortar el stop. Si eres nuevo, pon el stop en la mecha. En su ejemplo no lo acortó porque la inversión dejó mucha mecha.'
    ]},

    {t:'h2', text:'Su trade de ese día', tape:'ejemplo'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s tec">Acumulación + manipulación (largos)</span><span class="ar">→</span>
        <span class="s tec">IFVG de la temporalidad más alta de la manipulation leg</span><span class="ar">→</span>
        <span class="s rie">Stop en la mecha de la manipulación</span><span class="ar">→</span>
        <span class="s fin">TP en el primer gap de 30 min</span>
      </div>
      <div class="cap">Quería estirar el trade hasta una BSL (RR 1:3), pero esas condiciones no sabe si se invalidan: bajó el primer TP al primer FVG (1:2) y, al ver uno de <b>mayor temporalidad</b> con más peso, al de 30 min (1:1). «Si el precio quiere bajar, tiene que tocar ese gap; si quiere subir, tiene que llegar.» Duró minutos, «cero sufrimiento».</div>`},

    {t:'h2', text:'El 1:1 y el break even', tape:'ejemplo inventado'},
    {t:'list', items:[
      'Entra en cortos con el IFVG; stop en la mecha de arriba; <b>TP al 1:1</b> aunque su objetivo (una SSL alineada con low resistance liquidity) esté a un RR de 0,6.',
      '<b>Al tocar el objetivo:</b> arrastra el stop a la entrada (<b>break even</b>). Si el precio vuelve, salida a cero; si sigue, se lleva la ganancia. «Por eso es tan importante ir siempre a por el 1:1.»',
      'Con varios objetivos (liquidez y gaps), busca <b>el 1:1 hasta la primera condición que ponga el trade en peligro</b>.',
      'El break even con detalle lo deja para un vídeo más largo.'
    ]},
    {t:'quote', text:'Intento operar de una forma en la que mi cabeza tenga sentido.', src:'Idea del vídeo (parafraseada)'},

    {t:'p', cls:'detail', html:'<b>Lo que viene:</b> <b>mañana, el diario de trading</b> (qué es, cómo hacerlo, por qué y cómo analizarlo), después la <b>estrategia</b> (PO3, AMD, sistemas de entrada), el <b>backtesting</b> y el paso a paso para las cuentas de fondeo. <b>La gestión de riesgo exacta y el cálculo de contratos</b> los explicará cuando llegue al riesgo, no hoy.'},

    {t:'mine', id:'d26-rr', h:'Mi RR, mi TP y mi stop', lab:'Esto es tuyo', ph:'Mi última operación: RR que usé, dónde puse el TP (¿zona de conflicto?) y dónde el stop (¿se invalidaba mi idea?)…',
     hint:'Revisa tu última operación con sus tres preguntas: ¿mínimo 1:1?, ¿el TP está en una zona donde el precio puede girar?, ¿el stop está donde mi idea queda invalidada?', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, las llamadas de sus amigos, los comentarios sobre sus cuentas y los 10.000 $ del día (son su caso, no tu referencia), y sus cifras (500, 1.000, 250, 45 %, 70 %) que son <b>ejemplos</b>. Los subtítulos automáticos pierden varias temporalidades (por ejemplo «gap de …») y las horas de duración de los trades; revisa esos puntos en el vídeo. En el RR 1:1,5 para evaluaciones no dice más; lo explicará con el riesgo. Si quieres saber cuánto arriesgar por operación, <b>todavía no lo ha dado</b>.'}
   ]},

 { id:27, title:'El diario de trading', tags:['rut','psi'], mins:34, status:'done',
   intro:'Qué es el diario (journal), qué apuntar, cómo lo hace él y, sobre todo, qué uso darle. Él lo lleva en Notion, pero dice que la plataforma da igual: lo importante es lo que apuntas y cómo lo analizas. Leído del español original (subtítulos automáticos de YouTube).',
   blocks:[
    {t:'idea', text:'El diario es el registro de <span class="mk">todas tus operaciones y de tus emociones</span>. Se hace <span class="mk">cada día, sin falta y sin pereza</span>, y solo vale la pena si luego lo <span class="mk">revisas y actúas</span>. Él estuvo un año haciéndolo «para nada» porque no lo analizaba.'},

    {t:'h2', text:'Qué es y las reglas', tape:'lo básico'},
    {t:'list', items:[
      '<b>Apunta todas tus operaciones</b>: backtesting, demo y cuentas de fondeo. No solo las de dinero real.',
      '<b>Empieza desde el principio</b>, con tus primeros trades de backtesting. «Está infravalorado.»',
      '<b>Cada día, sin falta.</b> Si tienes pereza, lo haces con pereza. Incluso el día que has hecho gambling o revenge: <b>se apunta</b> («he gambleado»), porque si no coges un mal hábito.',
      '<b>Cuándo:</b> mejor por la tarde o la noche, <b>con calma</b>, y no justo tras perder (sigues emocional). Vuelves a abrir el gráfico y repasas lo que tenías. Mejor el mismo día, aunque hay quien lo hace al día siguiente.'
    ]},

    {t:'h2', text:'Qué apuntar en cada operación', tape:'su lista'},
    {t:'list', items:[
      '<b>1.</b> Día de la semana y número.',
      '<b>2.</b> Resultado: <b>win, loss o break even.</b>',
      '<b>3.</b> <b>Riesgo</b> (mejor en dólares).',
      '<b>4.</b> <b>RR</b> utilizado: 1:1, 1:1,5 o 1:2.',
      '<b>5.</b> <b>Análisis del high time frame</b>, en una línea: tu DOL y la estructura de 1 h y 4 h (ej.: «DOL: gap diario; H1 y H4 alcistas respetando gaps alcistas»).',
      '<b>6.</b> <b>Análisis del low time frame</b>, en una línea: la condición, el IFVG de la temporalidad más alta de la manipulation leg y la liquidez que buscabas.',
      '<b>7.</b> <b>Hora del trade.</b> Importantísimo y casi nadie lo apunta.',
      '<b>8.</b> <b>Checklist</b> (abajo).',
      '<b>9.</b> <b>Imágenes</b> de cada temporalidad (abajo).',
      '<b>10.</b> Opcional: <b>qué has hecho por la mañana</b> (entrenar, comer bien, madrugar…).',
      '<b>Además:</b> un bloc de <b>emociones</b> en viñetas: he tenido FOMO, estaba nervioso antes de entrar… lo más fuerte que has sentido.'
    ]},
    {t:'p', cls:'detail', html:'Hasta aquí es <b>obligatorio</b> según él. El resto (rutina, preguntas extra) lo adaptas a ti.'},

    {t:'h2', text:'El checklist', tape:'tus preguntas'},
    {t:'p', html:'Son <b>casillas con preguntas</b> para decidir si el trade era bueno o malo. Puedes tenerlo al lado del gráfico o usarlo luego para analizar. Sus ejemplos:'},
    {t:'list', items:[
      '¿Entré antes de tiempo? (si sí, <b>forcé algo y tuve FOMO</b>)',
      '¿Arriesgué más de lo que dice mi plan?',
      '¿Tomaría este trade <b>1.200 veces más</b>, sin importar el resultado?',
      '¿Tenía un HTF claro y un DOL limpio?',
      '¿Estuve nervioso durante el trade?',
      '¿Cerré antes de tiempo?',
      '¿Lo tomaría en backtesting?',
      '¿Me siento bien con el trade y <b>no con el resultado</b>?'
    ]},
    {t:'p', cls:'detail', html:'Es <b>muy personalizable</b>: con el backtesting y la experiencia vas añadiendo y quitando preguntas.'},

    {t:'h2', text:'Las imágenes', tape:'lo más importante'},
    {t:'cards', items:[
      {c:'y', ico:'🖼️', h:'Qué fotos', p:'De <b>cada temporalidad</b>: <b>HTF</b> (1 h y 4 h), <b>intermedia</b> (5 y 15 min, las condiciones), <b>ejecución</b> (1–5 min, con tu long o short dibujado) y, si hace falta, el <b>S&amp;P 500</b> (por si hay SMT o true manipulation).'},
      {c:'c', ico:'🧠', h:'Por qué', p:'Un mes después ya no recuerdas cómo estaba la 1 h ni cuál era tu DOL. Si solo guardas el gráfico de 1 minuto, <b>no puedes valorar el trade</b> y dejas de revisarlos.'},
      {c:'m', ico:'📸', h:'Cómo', p:'En TradingView: <b>capturar imagen → descargar, copiar o copiar enlace</b>. Es un palo, pero «son parte del trabajo».'}
    ]},

    {t:'h2', text:'Cómo lo hace él', tape:'Notion'},
    {t:'list', items:[
      'Empezó en una <b>libreta de papel</b> (la de los apuntes), pero no podía poner fotos y le dolía la muñeca. Pasó a <b>Notion</b>, gratis.',
      'Nueva página → pide a la <b>IA de Notion</b> que cree la base de datos con la lista de arriba, la revisa y corrige: riesgo en dólares, RR en formato 1:1, checklist desplegable, imágenes separadas por temporalidad.',
      'Se queda como <b>favorito</b> para entrar rápido. «Es cutre, pero me funciona.» Y se ordena por fecha.',
      '<b>Lo importante no es la plataforma</b>, sino lo que hay dentro y cómo lo analizas.'
    ]},

    {t:'h2', text:'Cómo lo revisa', tape:'el uso'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s rut">Cada día: apuntar</span><span class="ar">→</span>
        <span class="s rut">Cada fin de semana: revisar errores y trades</span><span class="ar">→</span>
        <span class="s rut">Cada mes: revisar todo</span>
      </div>
      <div class="cap">Él revisa el fin de semana, cuando se aburre y el mercado está cerrado.</div>`},
    {t:'cards', items:[
      {c:'c', ico:'1️⃣', h:'Un error por semana', p:'Intentar arreglar <b>todos los errores a la vez</b> no funciona: él veía cuatro errores y juraba que el lunes sería «una roca». Elige <b>uno</b> y concéntrate esa semana. Si en el mes tuviste siete errores y mejoras cuatro o cinco, «está superbién».'},
      {c:'y', ico:'➖', h:'A veces es hacer menos', p:'Si pierdes siempre los <b>viernes</b>, no operas los viernes y sube tu win rate sin meter más trades. Lo mismo con una <b>franja horaria</b>, un <b>riesgo alto</b> o un día con el <b>HTF borroso</b>: «los días que no sepas hacia dónde va el precio, te vas».'},
      {c:'b', ico:'🔎', h:'Qué te dice tu data', p:'Ejemplo suyo: «¿cuántos días he ganado de 9:30 a 10? Diez. ¿Y de 10:30 a 11? Dos». Entonces solo operas de 9:30 a 10. <b>Lo dice la data</b>. Y si ves que con RR 1:2 siempre estás nervioso y cierras antes, quizá te toque 1:1.'}
    ]},

    {t:'h2', text:'Su historia', tape:'por qué importa'},
    {t:'html', cls:'viz', html:`
      <div class="road">
        <span class="s fin">Mes y medio estancado en break even (±500)</span><span class="ar">→</span>
        <span class="s tec">Revisa las imágenes del diario</span><span class="ar">→</span>
        <span class="s psi">6 pérdidas con la misma estructura: caída fuerte + primer IFVG alcista</span><span class="ar">→</span>
        <span class="s fin">Deja de entrar ahí, opera menos y acierta más</span>
      </div>
      <div class="cap">Eran 6 stops de 500 $, unos <b>3.000 $</b>. Al mes siguiente no entró y pasó su primera evaluación; luego sacó su primer retiro. Y lo vio <b>solo con las imágenes</b>.</div>`},
    {t:'quote', text:'No se trata de hacer más: muchas veces se trata de hacer menos.', src:'Idea del vídeo (parafraseada)'},

    {t:'p', cls:'detail', html:'<b>Lo que viene:</b> <b>mañana, las sesiones</b> (qué implica cada una y a qué hora opera él: de 9:30 a 11 en Nueva York); después, un vídeo <b>juntándolo todo en backtesting</b> y luego la estrategia.'},

    {t:'mine', id:'d27-diario', h:'Mi regla para el diario', lab:'Esto es tuyo', ph:'Cuándo lo apunto cada día, qué mínimo apunto los días malos y cuándo hago mi revisión semanal…',
     hint:'La constancia es lo difícil: decide ahora una hora fija y un mínimo para los días malos (aunque sea una línea). Y elige un día de la semana para revisar.', pre:''},

    {t:'omit', html:'<b>Lo que dejé fuera y por qué:</b> los saludos, las bromas, el viaje que anuncia, la descripción paso a paso de los menús de Notion y las anécdotas personales. Los números (80 de 100 pérdidas tras las 10:30, 10 y 2 días ganados) son <b>ejemplos inventados</b>; los 3.000 $ de su caso son suyos. Los subtítulos automáticos se comen alguna cifra (por ejemplo, «1 a 5» minutos de las ejecuciones). <b>Qué es exactamente un «yo de backtesting» o cómo se hace el backtesting</b> no lo explica aún.'}
   ]}
];

const TOTAL_DAYS = Math.max(27, ...DAYS.map(d=>d.id));

const GLOSSARY=[
 {t:'Acumulación', d:'El precio sube y baja sin ir a ningún sitio. Si el mercado se moviera siempre así, no avanzaría: es lo contrario de una tendencia.', days:[4], more:true},
 {t:'Backtesting', d:'Practicar tu estrategia yendo atrás en el tiempo, sobre el gráfico pasado. Sirve para ganar confianza en tu sistema. Cuidado: con demasiadas horas puedes empezar a sobreanalizar. Es lo que le dio la seguridad de que su método funcionaría.', days:[3,5,9,12]},
 {t:'Gambling', d:'Operar <b>sin seguir tu plan</b>: entradas al azar o sesiones en las que no toca. En cuanto dejas el plan, ya no es algo estadístico ni probado. Con un plan probado, el trading es gambling <b>con la estadística a tu favor</b>.', days:[12,14]},
 {t:'Ego tras una racha', d:'Tras una racha ganadora (que no es normal) el ego sube y un solo stop puede hacerte romper todas las reglas. <b>Mantén el riesgo</b> y no repliques cuentas en exceso. Estadísticamente tienes que ver más stops de los que estás acostumbrado.', days:[20], more:true},
 {t:'Muestra pequeña', d:'Un mes al 100 % de acierto no es tu win rate: la muestra es demasiado pequeña. A largo plazo la estadística vuelve hacia tu valor real (ej.: 73 % en 1.000 trades de backtesting).', days:[20,18]},
 {t:'Error humano vs. cadena de reglas rotas', d:'Un trade malo es un error humano: no pasa nada si sigues bien el resto del mes. El problema es la reacción: «ya rompí una, rompo todas» y perder el mes entero. Pregunta: ¿la cagué? ¿lo sé? ¿puedo volver? Sí, si lo hago bien.', days:[20,14]},
 {t:'Equilibrium (50 %)', d:'La línea del <b>50 %</b> del rango (herramienta Fibonacci). Divide el rango en <b>premium</b> (arriba) y <b>discount</b> (abajo). Sirve para elegir qué FVG de una tendencia tiene más probabilidad de reaccionar.', days:[19,2], more:true},
 {t:'Premium y discount', d:'<b>Premium</b> = zona cara (por encima del 50 %): ahí solo vendes. <b>Discount</b> = zona barata (por debajo): ahí solo compras. «Quieres comprar las manzanas con descuento.» Siempre premium arriba y discount abajo; busca la zona gris.', days:[19]},
 {t:'FVG alineado con el equilibrium', d:'Un FVG que coincide con el 50 % del rango (en premium si vendes, en discount si compras). Es el que se espera. Si el FVG está en la zona contraria, se descarta. El IFVG sobre él es la confirmación.', days:[19,15]},
 {t:'Qué rango dibujar', d:'El swing high y swing low del rango de 5 min que se ha creado, sin mini rangos intermedios. A veces dibuja dos y le basta con que toque uno. No siempre se toca (no pasa el 100 %).', days:[19]},
 {t:'SMT', d:'Divergencia entre Nasdaq y S&amp;P 500 (correlacionados): <b>uno toma un low/high y el otro no</b>, a la misma hora. Se busca en key levels. Da igual cuál de los dos. No es obligatorio (sin SMT el trade es peor, no imposible). Solo vale con true manipulation.', days:[17,13], more:true},
 {t:'True manipulation', d:'Lo que hace válido un SMT: <b>los dos índices están en un sitio donde tiene sentido distribuir</b> (tocando un FVG de 5 min o más, o un key level) y <b>sin liquidez de baja resistencia en contra</b>. Con uno solo no basta. Para él es obligatoria en su estrategia.', days:[17]},
 {t:'Sitio de distribución', d:'Cuando un índice está tocando un FVG de marco suficiente o un key level y no tiene liquidez en contra, «tiene sentido» que gire. Si su FVG de 5 min ya se invirtió o le queda liquidez en contra, no lo está.', days:[17]},
 {t:'Marcar la misma hora', d:'Para comparar SMT, los highs/lows de Nasdaq y S&amp;P deben ser de la misma vela (ej.: el high de las 8:30 en ambos). Si marcas highs de horas distintas, el SMT no vale.', days:[17]},
 {t:'Racha psicológica', d:'Temporadas en las que estás mejor o peor mentalmente, aunque seas consistente. Épocas de romper reglas y actuar a lo tonto, y épocas de estar "como una roca". El objetivo es estar bien la mayor parte del tiempo. Tras una mala racha: <b>parar unos días</b> (3 días o una semana).', days:[16,14]},
 {t:'Para qué sirve el backtesting', d:'Hacer tu análisis <b>mecánico</b> para que tú mismo sepas si un trade es bueno, sin depender de YouTube ni de nadie. Es independencia y responsabilidad: reconocer si lo hiciste bien o mal, y aprender de tus errores con tu propio diario. Practicas muchas repeticiones: <b>un mes en ~5 horas</b>. Se vuelve a ver FOMO: en backtesting «nunca» lo tienes, solo con dinero real.', days:[16,18], more:true},
 {t:'FOMO', d:'<b>Fear Of Missing Out</b>: entrar porque ves que el precio se va sin ti, sin que tu estrategia lo pida. Se evita <b>no entrando si tu estrategia no aparece</b>. Si entras por FOMO y sale bien, te estás matando: rompes una regla y te sales con la tuya.', days:[18,14,12], more:true},
 {t:'Pregunta antes de entrar', d:'«Si pierdo este trade, ¿me voy a enfadar?» Si la respuesta es sí, entras por FOMO y no deberías entrar. Con el setup perfecto y la estrategia seguida, la respuesta es no y entras.', days:[18]},
 {t:'Ser robot', d:'No es no tener emociones, es <b>saber controlarlas</b> y no actuar sobre ellas: te desahogas, bromeas, apagas el ordenador. Las emociones tienden a atenuarse con el tiempo.', days:[18,14]},
 {t:'Daily bias (sesgo diario)', d:'El análisis que haces <b>unos 15 minutos antes de abrir</b> Nueva York (≈ 15:20 España) para decidir si estás más inclinado a <b>compras o ventas</b>. Se mira diario → 4 h → 1 h sin marcar nada. Casi siempre se opera <b>a favor del timeframe alto</b>.', days:[21], more:true},
 {t:'Draw on liquidity (DOL)', d:'«Mi objetivo»: <b>el high o low que quieres que el precio barra</b> ese día. No es un objetivo de dinero. Ejemplo: comprar hasta un high que está dentro de un FVG sin tocar. Con el sesgo y la narrativa forma su análisis previo.', days:[21,15], more:true},
 {t:'Narrativa', d:'Juntar <b>tiempo + precio + condiciones</b> en una historia de lo que el precio va a hacer (ej.: liquidez arriba + FVG de 1 h + equilibrium). Para él es lo más importante y de lo que menos se habla. Las condiciones las explicará después.', days:[21], more:true},
 {t:'Las 4 preguntas del análisis previo', d:'1) Timeframe alto (1 d, 4 h, 1 h). 2) ¿Qué hace el precio, sube o baja? 3) ¿Qué invalido y qué respeto? 4) ¿Dónde están los key levels? Después buscas compras o ventas hasta el objetivo.', days:[21]},
 {t:'Invalidar y respetar', d:'En tendencia alcista <b>invalidas</b> los FVG bajistas (cierras por encima de ellos) y <b>respetas</b> los alcistas (el precio los toca y sube). Lo que respeta el precio te dice lo que quiere hacer.', days:[21,8]},
 {t:'FVG sin tocar (unfilled)', d:'Un FVG que <b>nunca ha sido visitado</b> por el precio. Arriba de una tendencia alcista es un buen objetivo para las compras.', days:[21]},
 {t:'No operar contra el timeframe alto', d:'«No digo nunca, pero la gran mayoría de las veces.» Cuanto mayor el timeframe, más fuerza; el precio es fractal; y las velas grandes de un timeframe bajo engañan. Si el análisis falla (cae fuerte con cierres fuertes), <b>ese día no se opera</b>.', days:[21]},
 {t:'Plantillas de línea (TradingView)', d:'Dibuja una línea, ponle texto en los ajustes y guarda con <b>plantilla → guardar como</b>. Cada línea nueva con esa plantilla muestra ya el texto (BSL, SMT…): marcar es mucho más rápido.', days:[21,2]},
 {t:'Manipulation leg (ML)', d:'El tramo <b>del swing high al swing low</b> (el más reciente, no el más alto) del movimiento que <b>barrió el último low</b> en un key level (en ventas, al revés). Dentro de ella buscas el FVG del <b>timeframe más alto</b> (hasta 5 min) y entras con su IFVG. Una nueva barrida crea una ML nueva.', days:[23], more:true},
 {t:'Manipulación (del precio)', d:'El movimiento que sale a <b>cazar los stops</b> de quienes entran demasiado pronto, para luego moverse de verdad. Suele verse como un rango (acumulación) que se rompe con una mecha. Muy ligada a los stop hunts y al PO3, que explicará después.', days:[23,6]},
 {t:'IFVG del timeframe más alto de la ML', d:'Dentro de una manipulation leg, <b>manda el FVG de mayor timeframe</b> (30 s a 5 min; nada por encima de 5). No esperes el de 1 o 2 min si hay uno de 3: entras a mejor precio. Si falla, el precio puede irse sin ti: aun así, espera.', days:[23,13]},
 {t:'PO3 · AMD (pendiente)', d:'Alinearte con <b>el tiempo</b>. Solo menciona la A (acumulación) y la M (manipulación) y dice que lo explicará después, junto con los stop hunts, las condiciones y todos sus sistemas de entrada.', days:[23], more:true},
 {t:'Un stop no es un error', d:'Con una estrategia de, por ejemplo, ~71 % de aciertos, ese ~30 % que pierde son <b>también buenas operaciones</b> que cumplen todos los parámetros: es parte de la estadística. «Siempre tendrás algo en tu stop loss»: si buscas un motivo, lo encuentras.', days:[24,20]},
 {t:'Sobreanalizar', d:'Dar vueltas a cada detalle (S&amp;P 500, hora, condiciones) tras cada operación y apuntar mejoras sin parar: acabas con <b>ajustes que se contradicen</b>. La salida: pesar lo que tenías a favor y en contra (8 a favor y 2 en contra = buena operación) y seguir.', days:[24,5]},
 {t:'Mi yo de backtesting', d:'Pregunta para cuando pierdes con dinero real: <b>«¿qué haría mi yo de backtesting?»</b>. Ahí no se sobreanaliza: si cumple los parámetros se dispara; si pierde, siguiente día. Con dinero real hacemos cosas distintas (alargar el TP, analizar de más, quedarnos pegados al mercado).', days:[24,9], more:true},
 {t:'Gambling aunque sigas el sistema', d:'Según el Día 24: desviarte de tu gestión de riesgo, operar fuera de tu horario, meter más de una operación al día o entrar en operaciones por tiempo. Hay que ser muy estricto con las reglas.', days:[24,12]},
 {t:'Condición (si… entonces…)', d:'Un «si pasa esto, haré esto» que te pones cuando <b>no sabes qué hará el precio</b>. Suele ser un FVG de 5 min (a veces 15): si lo respeta, continúa; si lo invalida con fuerza (IFVG), hay giro. Sirve para saber si un key level aguantará y para preparar la cabeza para dos escenarios.', days:[25,15], more:true},
 {t:'Afirmaciones · Condiciones · Ejecuciones', d:'Los tres pasos de su método: <b>1)</b> afirmaciones en 1 d, 4 h y 1 h (daily bias, key levels, tendencia); <b>2)</b> condiciones en 5 min (a veces 15); <b>3)</b> ejecución con el IFVG de la temporalidad más alta de la manipulation leg.', days:[25,21,23], more:true},
 {t:'Risk reward (RR)', d:'Relación entre lo que arriesgas (stop) y lo que ganas (TP). Con 500 $ de riesgo: 1:1 = +500, 1:2 = +1.000. Usa entre <b>1:1 y 1:2</b> (también 1:1,5, que adelanta para evaluaciones). <b>Nunca por debajo de 1:1.</b> Prefiere RR cortos: acierta más y aguanta menos tiempo.', days:[26], more:true},
 {t:'Take profit en zona de conflicto', d:'El TP va donde el precio puede girar: una BSL/SSL clara, un key level o, si no sabes hacia dónde irá, una condición (gap de 5 o 15 min). Si el objetivo está más cerca que 1:1, se coge el 1:1 y se deja correr.', days:[26]},
 {t:'Stop loss donde se invalida la idea', d:'No se opera sin stop. Va donde tu idea queda invalidada: «si lo toca, estoy equivocado». Regla de partida: en la <b>mecha de la manipulación</b> (el bajo en largos, el alto en cortos). Solo los avanzados lo acortan, con objetivo caro e IFVG con fuerza.', days:[26,23]},
 {t:'Break even al tocar el objetivo', d:'Con RR 1:1: cuando el precio toca el objetivo (zona de conflicto) se arrastra el stop a la entrada. Si vuelve, sales a cero; si sigue, te llevas la ganancia. El detalle lo deja para un vídeo más largo.', days:[26,22]},
 {t:'Diario de trading (journal)', d:'Registro de <b>todas tus operaciones</b> (backtesting, demo y cuentas) y de tus <b>emociones</b>. Se apunta <b>cada día, sin falta y sin pereza</b>, mejor por la tarde con calma. Solo sirve si lo <b>revisas</b> (cada semana y cada mes) y actúas. La plataforma da igual (él usa Notion).', days:[27], more:true},
 {t:'Checklist del trade', d:'Ocho preguntas de casillas para decidir si el trade era bueno o malo, <b>sea cual sea el resultado</b>: ¿entré antes de tiempo?, ¿arriesgué más de mi plan?, ¿lo tomaría 1.200 veces?, ¿HTF claro y DOL limpio?, ¿nervioso?, ¿cerré antes?, ¿lo tomaría en backtesting?, ¿me siento bien con el trade y no con el resultado? Personalizable.', days:[27], more:true},
 {t:'Imágenes del trade (por temporalidad)', d:'Capturas de <b>HTF</b> (1 h y 4 h), <b>intermedia</b> (5 y 15 min, condiciones), <b>ejecución</b> (1–5 min, con tu long o short dibujado) y el <b>S&amp;P 500</b> si hay SMT. Sin ellas, un mes después no puedes valorar el trade. Se hacen con «capturar imagen» de TradingView.', days:[27]},
 {t:'Un error por semana', d:'En la revisión semanal no intentes arreglar todos los errores a la vez: <b>elige uno</b> y trabájalo esa semana. A fin de mes, mejorar cuatro o cinco de siete es un éxito.', days:[27]},
 {t:'Hacer menos (filtrar por datos)', d:'Si tu diario dice que pierdes siempre los viernes, a ciertas horas, con riesgo alto o con el HTF borroso, <b>dejas de operar eso</b>: tu win rate sube sin meter más trades. «A veces no se trata de hacer más, sino de hacer menos.»', days:[27]},
 {t:'Revenge trading', d:'Arriesgar más de la cuenta (overlotting) o sobreoperar (overtrading) tras perder, para recuperar. Casi siempre acaba con más pérdida o con la cuenta quemada. <b>Nada externo lo evita: solo tú.</b>', days:[14]},
 {t:'Jugar con el beneficio', d:'"Voy a jugar con lo que he ganado hoy": arriesgas el profit del día. Para él, <b>una mentira histórica</b>: si lo pierdes, quieres recuperarlo y quemas la cuenta.', days:[14]},
 {t:'Plan de riesgo', d:'Un riesgo fijo por trade y por día (su ejemplo: 300 $). La cuenta dura varios días y te mantiene tranquilo. Subirlo tras perder es el revenge trading.', days:[14,9], more:true},
 {t:'La pregunta de las 50 veces', d:'"Las últimas 50 veces que rompiste tus reglas, ¿cuántas salió bien?" Si cuando va bien acaba mal y cuando va mal acaba mal, ¿para qué hacerlo?', days:[14]},
 {t:'Fase de gambling', d:'Según él, una etapa casi obligatoria en la que crees que haces trading pero rompes reglas. Se aprende mucho, pero conviene <b>pasar por ella lo menos posible</b>.', days:[12]},
 {t:'Estadística a favor (edge)', d:'Un plan probado (con backtesting) en el que, aunque cada trade sea azar, el conjunto sale ganador (su ejemplo: ~73 % de acierto, 7 de cada 10).', days:[12]},
 {t:'BSL · Buy-side liquidity', d:'La liquidez de los <b>altos</b>: el dinero (los stops de los que vendieron) que hay por encima de un alto. El precio tiende a ir a por ella.', days:[6]},
 {t:'Contrato (NQ, Z…)', d:'Los futuros vencen cada trimestre (letras H, M, U, Z; Z = diciembre). Se opera el contrato vigente; la app avisa cuando toca cambiar.', days:[2,5]},
 {t:'Correlación NQ–ES', d:'El Nasdaq y el S&amp;P 500 se mueven casi igual. El ES se mira solo para ver si hace o no hace cosas y sacar pistas sobre el NQ.', days:[2]},
 {t:'Cuenta fondeada (prop firm)', d:'Pagas 50–100 € por un examen en cuenta simulada. Si lo apruebas, te dan otra desde la que puedes retirar. La mayoría suspende, y de ahí sale el pago a los pocos. Muchos retiran una vez por suerte y luego lo queman todo porque no estaban preparados.', days:[2,7,22]},
 {t:'Datos CME retrasados', d:'Sin datos de CME en TradingView ves el precio con 10 min de retraso (marca naranja "D"). Suelen venir incluidos con una cuenta fondeada.', days:[5]},
 {t:'Fractal (el precio es)', d:'El precio y las velas se comportan igual en cualquier temporalidad: lo que aprendas a leer en una vale en todas.', days:[4]},
 {t:'High / Low', d:'<b>High</b>: vela alcista seguida de una bajista (se marca la mecha más alta). <b>Low</b>: bajista seguida de alcista. Dos del mismo color no son nada. Los que importan son los swing.', days:[4,6]},
 {t:'Imbalance', d:'Otro nombre de los <b>FVG</b> (ver FVG): los "cuadraditos" a través de los cuales el precio se mueve buscando liquidez.', days:[6,8]},
 {t:'FVG · Fair value gap', d:'Hueco entre <b>tres velas</b> (el color y el tamaño dan igual): del máximo de la 1.ª al mínimo de la 3.ª (alcista; al revés, bajista). <b>Actúa como imán</b>: el precio vuelve a tocarlo y continúa en su dirección. Si no hay hueco, no hay FVG. También será su sistema de entrada. Los NDOG/NWOG actúan igual.', days:[8,6,11], more:true},
 {t:'FVG respetado / no respetado', d:'<b>Respetado</b>: el cierre no atraviesa el cuadradito (la mecha sí puede); sigue la dirección. <b>No respetado</b>: una vela cierra al otro lado y esperas lo contrario. Se juzga <b>en la misma temporalidad</b> del FVG, no en una menor. Si se invierte, es un IFVG (Día 13).', days:[8,13]},
 {t:'IFVG · Inverse FVG', d:'Un FVG que se ha <b>invertido</b>: una vela <b>cierra al otro lado</b>, en la misma temporalidad y en <b>3–4 velas como máximo</b>. Es <b>su sistema de entrada</b>: nunca pulsa comprar o vender sin uno. Confirma que el precio quiere cambiar de tendencia. Solo de 30 s a 5 min (nunca de 15). Se busca <b>después de tocar un key level</b>, no antes.', days:[13,8,15], more:true},
 {t:'Key level', d:'<b>Zona de conflicto</b> donde el precio decide si gira o sigue (no sabes qué hará). Es un <b>FVG de 1 h o 4 h</b> (o de 15 min si lo patrocina uno mayor) con <b>liquidez dentro o pegada</b>; también NDOG/NWOG y altos/bajos de 4 h. Entras al tocarlo y aparecer un IFVG.', days:[15], more:true},
 {t:'Marcos de los key levels', d:'4 h y 1 h son los buenos (mejor que 15 min). <b>Un FVG de 5 min nunca</b> es key level. Los de 15 min, solo si los "patrocina" uno de 1 h/4 h, y se usan más como condición.', days:[15], more:true},
 {t:'Liquidez dentro del FVG', d:'Un low (o high) dentro o pegado al FVG de marco alto: el FVG atrae y la liquidez es dinero; el precio la toma, toca el gap y continúa. Lows/highs alineados con un FVG son puntos muy importantes.', days:[15]},
 {t:'Puntos de liquidez a favor y en contra', d:'Cuenta cuántos puntos de liquidez hay a tu favor y cuántos en tu contra (ej.: 10 a 1). Con muchos más a favor, tiene mucho sentido que llegue al take profit.', days:[15,11]},
 {t:'No entrar antes del key level', d:'Un IFVG que aparece antes de tocar el key level, y con liquidez en contra, es una entrada temprana. <b>"El precio no se va sin ti."</b> Primero toca el nivel, luego el IFVG, luego entras.', days:[15]},
 {t:'FVG patrocinado (sponsored)', d:'El <b>primer gap que se crea después de tocar un key level</b>: está respaldado por el gap de 1 h o 4 h tocado. El segundo gap de esa subida no está esponsoreado y suele ser peor. Suele estar dentro del equilibrium; se cuenta por temporalidad (el primero de 5 min, el primero de 15 min…). Él no lo usa del todo: le da confianza.', days:[25,15], more:true},
 {t:'Marco de entrada (30 s – 5 min)', d:'Los IFVG de entrada solo se toman de <b>30 segundos a 5 minutos</b>. 15 min no; 1 h y 4 h se usan para <b>contexto</b>. Sus trades duran de 1 a 10 min (nunca más de media hora).', days:[13]},
 {t:'Sistema de entrada', d:'El IFVG: la confirmación obligatoria antes de comprar o vender. La liquidez y los FVG dan el contexto; el IFVG dice cuándo entrar. Se entra tras tocar un key level (Día 15).', days:[13,15], more:true},
 {t:'Journal', d:'Registro de cada operación: cómo me siento, qué pienso antes y durante, el RR y las métricas. Sin él no hay aprendizaje, y <b>apuntar sin revisar es como no apuntar</b>.', days:[1,3,5,9], more:true},
 {t:'Miedo a perder', d:'Te saca del trading: piensas en perder dinero, no en el sistema. Casi siempre viene de <b>demasiado riesgo</b> o de <b>no confiar en tu estrategia</b>. Se arregla bajando el riesgo y ganando confianza con práctica, journal y backtesting.', days:[9,22], more:true},
 {t:'Resolver un problema psicológico', d:'Tres preguntas: ¿qué me pasa?, ¿por qué me pasa? y ¿qué hago para que no vuelva a pasar? Después, revisarlo. Un problema (o dos) cada semana.', days:[9,5]},
 {t:'Liquidez', d:'Dinero: las órdenes pendientes (sobre todo stops) que hay en cada alto y cada bajo. El precio va a buscarlo y, al recogerlo, hace el movimiento de verdad hacia el otro lado. Tiene 6 tipos que usa en el día a día (ver Tipos de liquidez).', days:[6,11], more:true},
 {t:'Tipos de liquidez (los 6)', d:'<b>PDH/PDL</b> (día anterior), <b>EH/EL</b> (iguales), <b>REH/REL</b> (casi iguales), <b>data highs/lows</b> (vela de la noticia), <b>NDOG/NWOG</b> (huecos de apertura) y <b>LRL</b>. Sirven de objetivo y de reacción. Dice que normalmente usa 5: el primero es prescindible.', days:[11], more:true},
 {t:'PDH · PDL', d:'Previous day high / low: el máximo y el mínimo del día anterior (mechas de la última vela diaria). El precio suele visitarlos y reaccionar.', days:[11]},
 {t:'EH · EL · REH · REL', d:'<b>Equal highs / lows</b>: mechas exactamente a la misma altura. <b>Relative</b>: casi iguales. Hay mucho dinero pendiente. <b>Nunca operar en contra.</b> No cuentan si ya se cogió la liquidez.', days:[11]},
 {t:'Data highs · data lows', d:'Alto y bajo de la vela de la noticia (casi siempre la de las 8:30 NY). El precio suele ir a por uno y reaccionar hacia el otro. Se marca la mecha (o el cuerpo si no hay).', days:[11,10]},
 {t:'NDOG · NWOG', d:'New day / new week opening gap: el hueco que deja el mercado al abrir el día o la semana (de viernes a lunes es semanal). Actúa como un FVG. <b>Nunca operar en contra.</b>', days:[11]},
 {t:'LRL · Low resistance liquidity', d:'Muchos altos o bajos alineados que no se quitan (típico de subidas lentísimas, en 1–5 min). Si el precio toca un FVG o una BSL, lo barre con mucha fuerza. No pongas tu stop sobre todo eso.', days:[11], more:true},
 {t:'Tu stop no sobre liquidez', d:'Regla que se repite: no operes en contra de EH/EL ni de NDOG/NWOG, y no dejes el stop encima de liquidez acumulada: es un "caramelito" para que el mercado se la lleve.', days:[11]},
 {t:'MNQ / MES · micros', d:'Versiones micro del Nasdaq y del S&amp;P 500 para empezar con menos riesgo. Todo lo aprendido es exactamente igual; solo cambia el riesgo.', days:[5]},
 {t:'NQ / ES', d:'<b>NQ</b> = Nasdaq 100 en futuros, lo único que se opera. <b>ES</b> = S&amp;P 500, solo de referencia.', days:[2]},
 {t:'Bucle de reglas rotas', d:'Meses haciendo lo mismo (rompiendo reglas, perdiendo) con falsas promesas ("mañana lo hago bien") y algún día de suerte que te hace creerte bueno. <b>El tiempo no te hace buen trader; cambiar cómo operas, sí.</b>', days:[1,7]},
 {t:'Sesión de Nueva York', d:'Es la que se opera: <b>9:30–11:00 hora de Nueva York</b> = 15:30–17:00 en España. Las noticias de las 8:30 salen antes de abrir.', days:[10]},
 {t:'Noticias: FOMC · NFP · CPI', d:'<b>FOMC</b>: no opera ese día. <b>NFP</b>: con cuidado, si no hay nada que le guste no opera. <b>CPI</b>: alto impacto, pero él puede operarlo. Las demás importan menos.', days:[10]},
 {t:'No News Monday', d:'Lunes sin ninguna noticia: el precio suele moverse lento. Se va con cuidado.', days:[10]},
 {t:'Bank Holiday', d:'Festivo en EE. UU. (carpeta gris en el calendario): el mercado no abre. Ni te presentes.', days:[10]},
 {t:'No operar antes de una noticia', d:'Nunca entras en los <b>3–5 minutos previos</b> a una noticia, aunque salga tu entrada. Esperas a ver qué hace: es aleatorio.', days:[10]},
 {t:'ForexFactory', d:'Web del calendario de noticias. Se configura en hora de Nueva York, sin carpetas amarillas y solo con el USD.', days:[10]},
 {t:'Filtro antes de entrar', d:'Antes de operar, pregúntate: ¿me gusta este setup? ¿Me enfadaría si pierde? Si no operas una semana, no pasa nada; y si un trade que no te gustaba va al TP, también.', days:[7]},
 {t:'Prisa', d:'Querer resultados ya (retirar, pasar la evaluación, ganar) y actuar por ello. Querer ganar está bien; <b>operar con prisa</b> te mete en el bucle. Mejor objetivo: que el próximo año sea distinto al anterior.', days:[7]},
 {t:'Plan de liquidez (3 pasos)', d:'1) Marca tu BSL y tu SSL. 2) Espera a que quiten una. 3) Si todo está alineado, busca el trade hacia la otra. Nunca solo por ver liquidez.', days:[6], more:true},
 {t:'RR bajo', d:'Arriesgar y ganar parecido (ej. 500 por 500). Trades cortos y win rate alto. Es el método que él usa porque le encaja psicológicamente.', days:[5], more:true},
 {t:'Sobreanálisis', d:'Demasiados conceptos o demasiadas horas de backtesting: ves pros y contras en todo y no sabes si comprar o vender. Solución: parar, alejarse del gráfico y volver a lo básico.', days:[5]},
 {t:'SSL · Sell-side liquidity', d:'La liquidez de los <b>bajos</b>: el dinero (los stops de los que compraron) que hay por debajo de un bajo.', days:[6]},
 {t:'Stop como liquidez', d:'El stop de una venta es una orden de compra pendiente: es dinero. Las instituciones van a por esos stops para usarlos y mover el precio hacia el otro lado.', days:[6]},
 {t:'Strategy hopping', d:'Cambiar de estrategia o de mentor cada vez que pierdes. A él le costó 9 meses; el problema casi siempre es romper reglas, no la estrategia. No lo hagas por opiniones o polémicas de internet: pruébalo tú en backtesting.', days:[5,12]},
 {t:'Swing high / swing low', d:'Los altos y bajos <b>prominentes</b> del rango: los extremos importantes que despuntan. Son los que se marcan como liquidez.', days:[6,4]},
 {t:'Temporalidad (timeframe)', d:'Cada vela cierra a hora fija y está hecha de otras más pequeñas (1 h = 60 de 1 min). <b>A mayor temporalidad, más importancia.</b>', days:[4,6]},
 {t:'Tendencia', d:'Alcista: máximos y mínimos más altos (HH, HL). Bajista: más bajos (LL, LH). Se mueve en escalera: sube, retrocede, vuelve a subir.', days:[4], more:true},
 {t:'Break even demasiado pronto', d:'Mover el stop a break even <b>sin razón</b>: por arriesgar de más, por miedo a que el precio gire o por la cifra en dólares. Solo se mueve cuando el precio llega a un <b>key level</b>, no por dólares ni emociones. Cuándo exactamente lo verá después.', days:[22,9], more:true},
 {t:'Cerrar antes del objetivo', d:'Cerrar una operación que va bien antes de que llegue al objetivo, «porque ya voy ganando». Si el objetivo está en un nivel, el precio tiene que llegar: <b>dejar que la operación trabaje</b> compensa psicológicamente a largo plazo.', days:[22]},
 {t:'Una vez dentro, no se toca', d:'Regla: cuando decides entrar, <b>no tocas nada</b> (solo el ratón para salir cuando toque). Si llega al stop o al objetivo, <b>revisas el porqué</b>: si era bueno, no pasa nada; si era malo, aprendes.', days:[22], more:true},
 {t:'Ruido de internet', d:'Comentarios de «no tienes ni idea», «las prop firms no son trading» o «vendes humo». Recomendación: <b>ignorarlos</b> y comprobarlo tú con tu propio backtesting.', days:[22]},
 {t:'Si no cambias nada, nada cambia', d:'Frase que repite. Cinco años operando sin ganar suele ser <b>repetir los mismos errores</b>, no falta de talento. Se rompe aprendiendo de los errores y trabajando la psicología.', days:[22,1]},
 {t:'Gastado vs retirado', d:'Para saber si compensa, compara lo gastado en cuentas con lo retirado: si gastas 50 y sacas 40, has perdido 10. Con cuentas fondeadas no puedes retirar todo el saldo de una vez.', days:[22,2]}
];
const UL_SVG='<svg viewBox="0 0 200 14" preserveAspectRatio="none"><path d="M2 9 C 40 2, 70 13, 110 6 S 170 4, 198 8" fill="none" stroke="#ffd84d" stroke-width="3.5" stroke-linecap="round"/></svg>';

const SISTEMA=[
 {n:1,h:'Marcar los key levels',st:'ok',p:'FVGs de <b>1 h y 4 h</b> con liquidez dentro o pegada (un low/high), NDOG/NWOG y altos/bajos de 4 h. Un FVG de 5 min <b>nunca</b>; el de 15 min solo si lo «patrocina» uno mayor.',days:[15,8,11]},
 {n:2,h:'Sesgo diario y condiciones',st:'ok',p:'15 min antes de abrir (≈ 15:20 España): diario → 4 h → 1 h, ¿qué hace el precio?, ¿qué invalido y qué respeto?, ¿dónde están los key levels? Buscas <b>a favor del timeframe alto</b>; si el análisis falla, ese día no operas. Si no sabes qué hará el precio en un key level, <b>pon una condición</b> (FVG de 5 min, a veces 15): si lo respeta, continúa; si lo invalida, giro. Entras con el IFVG de la ML.',days:[25,21,19]},
 {n:3,h:'Elegir el FVG con el equilibrium',st:'ok',p:'Dibuja el rango (swing high/low de 5 min). <b>Comprar solo en descuento, vender solo en premium</b>, y mejor con el FVG alineado con el 50 %.',days:[19]},
 {n:4,h:'Esperar a que toque la zona',st:'ok',p:'Primero toca el nivel, luego aparece el IFVG. Un IFVG <b>antes</b> de tocar, o con liquidez en contra, es entrada temprana: «el precio no se va sin ti».',days:[15]},
 {n:5,h:'Confirmar con el IFVG',st:'ok',p:'El IFVG es la confirmación y es donde entras. Solo de <b>30 s a 5 min</b>, nunca de 15. Con la <b>manipulation leg</b>: tras barrer un low en el key level, marca la ML y espera el IFVG del <b>FVG de mayor timeframe</b> dentro de ella.',days:[23,13]},
 {n:6,h:'Reforzar con SMT y true manipulation',st:'part',p:'Opcional: un SMT en el key level mejora el trade, pero solo vale si <b>los dos índices están en sitio de distribuir</b>. Para él la true manipulation es obligatoria.',days:[17]},
 {n:7,h:'Elegir el objetivo',st:'part',p:'Liquidez objetivo (BSL/SSL, LRL, equal highs/lows). Cuenta los puntos de liquidez <b>a favor y en contra</b>. Su «draw on liquidity» es el high o low que quieres que el precio barra ese día (p. ej. un FVG sin tocar arriba). El <b>take profit</b> va en zonas de conflicto (BSL/SSL clara, key level o una condición); si no sabes qué hará el precio, sales al tocar la condición.',days:[26,25,21,15,11]},
 {n:8,h:'Stop, TP y riesgo-beneficio',st:'part',p:'<b>Stop</b> donde tu idea queda invalidada (la mecha de la manipulación). <b>RR</b> mínimo 1:1, normalmente entre 1:1 y 1:2 (1:1,5 en evaluaciones). Al tocar el objetivo, break even. <b>Falta</b> cuánto arriesgar por operación, el cálculo de contratos y cómo escalar con prop firms: lo promete para la gestión de riesgo.',days:[26,22]},
 {n:9,h:'Filtro antes de entrar',st:'ok',p:'«Si pierdo este trade, ¿me voy a enfadar?» Si sí, no entres. Y la pregunta clave: ¿está siguiendo tu plan?',days:[18,12]},
 {n:10,h:'Si algo sale mal',st:'ok',p:'Un fallo puntual es error humano; el problema es la cadena de reglas rotas y el revenge trading. Tras mala racha, parar unos días. Y una vez dentro, <b>no tocas nada</b>: ni break even por miedo ni cerrar antes del TP. Tras un stop no analices cada detalle: pesa <b>lo que tenías a favor y en contra</b> y pregúntate qué haría tu yo de backtesting. Apunta todo en el diario y revísalo cada semana: <b>un solo error</b> por semana.',days:[27,24,22,14,16,20]}
];
const SIS_ST={ok:{i:'✅',n:'Explicado',c:'c-m'},part:{i:'🟡',n:'A medias',c:'c-y'},no:{i:'⏳',n:'Aún no lo ha explicado',c:'c-c'}};

const YT={d13:'ICOx4rdFSLg',d15:'J7Dh-aj9-e0',d17:'sTS-iWJvTf0',d19:'56ES-W1d0xw',d20:'ygJya0srm8g',d21:'MQyNBiw-QVo',d22:'RHPEmfRGkw8',d23:'JO1xDEW2Lhg',d24:'9QkzkdspTko',d25:'E3uwP18EYWI',d26:'fTbf2EX6Cng',d27:'5Nn4woC6xrI',dol:'zcT31zmE5Uc'};
const DUDAS=[
 {id:'smt',st:'ver',h:'¿Cuánto usa él los SMT?',q:'En el Día 13 parecía decir que los usa muy poco (en el audio salían como «SIDs»), y en el Día 17 dice que la true manipulation es obligatoria. Puede ser un fallo de la traducción automática.',how:'Escuchar el Día 13 en español cuando habla de los SMT y el Día 17 desde 9:48.',days:[13,17],links:[['Día 17 · «no todos los SMT son válidos»',YT.d17,588]]},
 {id:'fib',st:'ver',h:'Configuración exacta del Fibonacci',q:'Dice que copies su configuración de la pantalla, pero la transcripción no recoge los valores (niveles, colores, el 0.5).',how:'Pausar el Día 19 al principio y copiar los ajustes del Fibonacci.',days:[19,2],links:[['Día 19 · «copy these settings»',YT.d19,37]]},
 {id:'rango',st:'ver',h:'Qué rango dibujar en el equilibrium',q:'Usa el swing high/low del rango de 5 min, sin mini rangos, y a veces dibuja dos. Es visual: conviene verlo en sus ejemplos.',how:'Ver los ejemplos del Día 19 desde 7:10.',days:[19],links:[['Día 19 · el rango de 5 min',YT.d19,425]]},
 {id:'spons',st:'ver',h:'¿Es lo mismo el «patrocinado» del Día 15 y el sponsorship del 25?',q:'El Día 25 lo define como el primer gap que se crea tras tocar un key level, respaldado por el de 1 h/4 h. Parece lo mismo que el «patrocinado» del Día 15, pero él mismo dice que no se le entiende del todo y que no lo usa mucho.',how:'Ver el Día 25 desde 18:30 y comprobarlo con el ejemplo del Día 15.',days:[25,15],links:[['Día 25 · gap esponsoreado',YT.d25,1110],['Día 15',YT.d15,0]]},
 {id:'low',st:'esp',h:'Cuándo hace falta que tome el low',q:'Da una pauta (con buena reacción no hace falta; sin reacción sí interesa), pero dice que se aprende con muchas horas de backtesting.',how:'Cuando salga el vídeo de backtesting, comprobar si da una regla más concreta.',days:[15],links:[]},
 {id:'riesgo',st:'esp',h:'Stop, riesgo y tamaño de posición',q:'Es lo más importante para operar y no lo ha explicado. Lo promete tras la estrategia (qué riesgo asumir y escalar con prop firms).',how:'Esperar. Es el paso 8 de «Mi sistema».',days:[20],links:[['Día 20 · lo que viene',YT.d20,659]]},
 {id:'bias',st:'esp',h:'El vídeo de sesiones (Asia, Londres, Nueva York)',q:'Las «condiciones» ya están en el Día 25. Sigue pendiente el vídeo de sesiones con sus horas, que prometió en el Día 21 y lo anuncia para el siguiente (Día 28). De momento dice que opera de 9:30 a 11 (hora de Nueva York). Queda también la duda de la hora del análisis previo (9:20 o 9:00).',how:'Esperar. Completa los pasos 2 y 7 de «Mi sistema».',days:[25,21],links:[['Día 25 · las condiciones',YT.d25,87],['Día 21 · «aquí entran las condiciones»',YT.d21,975]]},
 {id:'hora21',st:'ver',h:'¿A qué hora haces el análisis previo?',q:'Dice 10–15 minutos antes (9:20 NY = 15:20 España), pero en su demo marca las 9:00 y en la tarea te pide mirar a las 9:00.',how:'Escuchar el Día 21 en esos dos puntos y decidir tu hora (o preguntarle).',days:[21],links:[['Día 21 · «unos 15 min antes»',YT.d21,293],['Día 21 · la tarea a las 9:00',YT.d21,1790]]},
 {id:'prev21',st:'ver',h:'Su vídeo anterior sobre daily bias y DOL',q:'Recomienda verlo («mismo concepto con otros ejemplos»). Ya encontré el enlace en la descripción del Día 21 («Video DOL extra»), que empieza en el minuto 9:24. No he podido leer ese vídeo.',how:'Verlo desde el enlace (abre el vídeo en el minuto indicado) y, si aporta algo, decirme y lo añado.',days:[21],links:[['Vídeo «DOL extra» de su descripción',YT.dol,564],['Día 21 · su recomendación',YT.d21,265]]},
 {id:'doble',st:'no',h:'Doble SMT, breakaway gaps y cuándo no hace falta true manipulation',q:'Dice que no los explicará porque no los usa ni los domina. Es decisión suya; si te interesan, habría que buscarlos en otro sitio.',how:'Nada que hacer ahora. Decidir más adelante si te importa.',days:[17],links:[['Día 17 · por qué no los explica',YT.d17,1247]]},
 {id:'es15',st:'ver',h:'Días 1–5 contrastados con el audio en español',q:'Esos días se apuntaron con un pase más ligero. Y todo lo demás viene de la traducción automática al inglés, así que algún matiz puede haberse perdido.',how:'Cuando haya cupo, bajar los subtítulos en español y contrastarlos con los apuntes.',days:[1,2,3,4,5],links:[]},
 {id:'d5',st:'ver',h:'¿El Día 5 es de psicología?',q:'El vídeo se titula «Time» pero el contenido es sobre no sobreaprender. Confírmalo tú al verlo.',how:'Mirar la parte donde habla del tiempo en el Día 5.',days:[5],links:[]},
 {id:'be22',st:'esp',h:'Cuándo mover a break even exactamente',q:'Día 22: solo con una razón (key level o zona de conflicto), no por dólares ni miedo. Día 26: al tocar el objetivo (RR 1:1) arrastra el stop a la entrada. Pero deja el detalle para un vídeo más largo.',how:'Esperar ese vídeo. Entra en el paso de stop y riesgo de «Mi sistema».',days:[26,22],links:[['Día 26 · break even al tocar el objetivo',YT.d26,930],['Día 22 · break even',YT.d22,657]]},
 {id:'cifra22',st:'ver',h:'La cifra de operaciones que llegan al objetivo',q:'Al hablar de cerrar antes del objetivo dice cuántas de 1.200 operaciones llegarían al objetivo, pero la traducción no lo deja claro y pierde las palabras stop loss y take profit.',how:'Escuchar el Día 22 en español desde 12:24 y comprobar qué dice exactamente.',days:[22],links:[['Día 22 · «no tocas nada»',YT.d22,744]]},
 {id:'ml23',st:'ver',h:'Qué swing marcar como manipulation leg',q:'Dice que no cojas el high más alto sino el más reciente, y que otra barrida crea una ML nueva y la anterior puede dejar de valer. Es visual, y en el primer ejemplo la transcripción se vuelve confusa.',how:'Ver el Día 23 de 5:37 a 10:50 con el gráfico delante y dibujar tú la ML.',days:[23],links:[['Día 23 · cómo identificar la ML',YT.d23,337],['Día 23 · nueva ML tras otra barrida',YT.d23,562]]},
 {id:'resto23',st:'esp',h:'Lo que le queda por explicar de la estrategia',q:'Stop hunts (relacionados con la ML, no iguales), condiciones, PO3 / AMD, todos sus sistemas de entrada y sponsorship. Luego un vídeo largo con la estrategia entera y uno o dos de backtesting; también escalar y qué profit usar.',how:'Esperar. Completan los pasos 2, 6, 7 y 8 de «Mi sistema».',days:[23],links:[['Día 23 · lo que queda',YT.d23,18]]},
 {id:'gamb24',st:'ver',h:'Qué es gambling según el Día 24',q:'Dice que es gambling salirte del riesgo, operar fuera de horario, meter más de una operación al día o entrar en operaciones «por tiempo». La traducción deja dudas sobre esto último y sobre si «más de una al día» es una regla estricta o una pauta.',how:'Escuchar el Día 24 desde 7:30 y comprobar las palabras exactas.',days:[24],links:[['Día 24 · lo que es gambling',YT.d24,451]]},
 {id:'rr26',st:'ver',h:'¿Qué RR uso exactamente?',q:'Dice que sus favoritos son 1:1 y que adelanta el 1:1,5 para evaluaciones y cuentas de fondeo, pero que ya no tiene un RR fijo: varía según las condiciones del trade. No concreta cuándo un 1:1,5 y cuándo un 1:2.',how:'Esperar la gestión de riesgo, donde dijo que explicará por qué usa cada uno.',days:[26],links:[['Día 26 · sus RR',YT.d26,196]]},
 {id:'ctr26',st:'esp',h:'Cuánto arriesgar y cómo calcular los contratos',q:'Hoy explica qué es un RR y dónde ponen el TP y el stop, pero deja para la gestión de riesgo cuánto arriesgar por operación y el cálculo de contratos (por ejemplo, cómo arriesgar 500 $).',how:'Esperar. Es lo que falta del paso 8 de «Mi sistema».',days:[26],links:[['Día 26 · no explica los contratos aún',YT.d26,1070]]}
];
const DU_ST={ver:{i:'🔎',n:'Verificar en el vídeo',c:'c-y'},esp:{i:'⏳',n:'Lo explicará él',c:'c-b'},no:{i:'🚫',n:'Él decidió no explicarlo',c:'c-c'}};
