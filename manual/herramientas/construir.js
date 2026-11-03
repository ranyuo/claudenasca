// Construye el manual en HTML y PDF a partir de contenido/*.md y una ficha de instituciones/.
// Uso: node construir.js [ficha]   (por defecto: ica)
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const fichaId = process.argv[2] || 'ica';
const ficha = JSON.parse(fs.readFileSync(path.join(RAIZ, 'instituciones', fichaId + '.json'), 'utf8'));
const SALIDA = path.join(RAIZ, 'salida');
fs.mkdirSync(SALIDA, { recursive: true });

const hoy = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---- Markdown → HTML ----
const toc = [];
const renderer = new marked.Renderer();
renderer.heading = (text, level, raw) => {
  const id = slug(raw);
  if (level <= 2) toc.push({ level, text: raw, id });
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};
renderer.image = (href, title, text) =>
  `<figure><img src="${href}" alt="${esc(text)}" loading="lazy"><figcaption>${esc(text)}</figcaption></figure>`;
renderer.code = (code, lang) => lang === 'mermaid'
  ? `<div class="diagrama"><pre class="mermaid">${esc(code)}</pre></div>`
  : `<pre><code>${esc(code)}</code></pre>`;
renderer.blockquote = quote => {
  const tipo = /Incidencia/.test(quote) ? 'incidencia' : 'nota';
  return `<aside class="aviso ${tipo}">${quote}</aside>`;
};
renderer.paragraph = text => /^<figure>/.test(text) ? text : `<p>${text}</p>\n`;
marked.use({ renderer, gfm: true });

const reemplazar = s => s.replace(/\{\{inst\.(\w+)\}\}/g, (_, k) => ficha[k] ?? '');
const capitulos = fs.readdirSync(path.join(RAIZ, 'contenido')).filter(f => /^\d+.*\.md$/.test(f)).sort();
const cuerpo = capitulos.map(f => {
  const md = reemplazar(fs.readFileSync(path.join(RAIZ, 'contenido', f), 'utf8'));
  return `<section class="capitulo">${marked.parse(md)}</section>`;
}).join('\n');

// Numeración de capturas (Figura N)
let nFig = 0;
const cuerpoNumerado = cuerpo.replace(/<figcaption>/g, () => `<figcaption><b>Figura ${++nFig}.</b> `);

const indice = toc.map(t => `<li class="n${t.level}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join('');

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Manual de uso · ${esc(ficha.nombreCorto)}</title>
<style>
:root{--azul:#0b1d3f;--azul2:#0f6fb5;--rojo:#c8102e;--tinta:#1d2533;--gris:#5b6475;--linea:#d9dee7;--fondo:#ffffff;--suave:#f3f6fa}
*{box-sizing:border-box}
body{margin:0;background:var(--fondo);color:var(--tinta);font:15px/1.6 "Segoe UI",Inter,Arial,sans-serif}
.contenedor{max-width:980px;margin:0 auto;padding:0 20px 60px}
.portada{min-height:100vh;display:flex;flex-direction:column;justify-content:center;background:var(--azul);color:#fff;padding:60px 8%}
.portada .eti{display:inline-block;background:#f2b705;color:var(--azul);font-weight:700;padding:4px 12px;border-radius:4px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;width:max-content}
.portada h1{font-size:44px;line-height:1.15;margin:22px 0 8px;border:0;color:#fff}
.portada .inst{font-size:20px;opacity:.95;margin:0 0 40px}
.portada dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;font-size:14px;opacity:.9;margin:0}
.portada dt{font-weight:700}.portada dd{margin:0}
.portada .nota{margin-top:36px;font-size:13px;opacity:.75;max-width:640px}
nav.indice{padding:40px 0 10px}
nav.indice h2{border:0;margin-top:0}
nav.indice ol{list-style:none;padding:0;margin:0}
nav.indice li.n1{font-weight:700;margin-top:12px}
nav.indice li.n2{padding-left:22px;font-size:14px}
nav.indice a{color:var(--tinta);text-decoration:none}
nav.indice a:hover{color:var(--azul2);text-decoration:underline}
h1{color:var(--azul);font-size:30px;margin:56px 0 12px;padding-bottom:8px;border-bottom:4px solid #f2b705}
h2{color:var(--azul);font-size:22px;margin:36px 0 10px;padding-bottom:4px;border-bottom:1px solid var(--linea)}
h3{color:var(--azul2);font-size:17px;margin:26px 0 8px}
a{color:var(--azul2)}
code{background:var(--suave);padding:1px 5px;border-radius:4px;font-size:.9em}
pre{background:var(--suave);padding:12px 14px;border-radius:6px;overflow:auto}
table{width:100%;border-collapse:collapse;margin:12px 0 20px;font-size:14px}
th{background:var(--azul);color:#fff;text-align:left;padding:7px 10px;font-weight:600}
td{border-bottom:1px solid var(--linea);padding:7px 10px;vertical-align:top}
tr:nth-child(even) td{background:var(--suave)}
td:first-child{white-space:nowrap}
figure{margin:18px 0 22px;border:1px solid var(--linea);border-radius:8px;overflow:hidden;background:#fff}
figure img{display:block;width:100%;height:auto}
figcaption{font-size:13px;color:var(--gris);padding:8px 12px;background:var(--suave);border-top:1px solid var(--linea)}
aside.aviso{margin:16px 0;padding:12px 16px;border-radius:6px;border-left:5px solid var(--azul2);background:#eaf3fb}
aside.aviso p{margin:4px 0}
aside.aviso ul{margin:4px 0;padding-left:20px}
aside.incidencia{border-left-color:var(--rojo);background:#fdecef}
.diagrama{margin:16px 0 22px;padding:16px;border:1px solid var(--linea);border-radius:8px;background:#fff;text-align:center}
.diagrama svg{max-width:100%;max-height:520px;height:auto}
.pie{margin-top:60px;padding-top:12px;border-top:1px solid var(--linea);font-size:12px;color:var(--gris)}
@media (max-width:640px){.portada h1{font-size:30px}td:first-child{white-space:normal}table{font-size:13px}}
@media print{
  body{font-size:11pt}
  .portada{min-height:auto;height:257mm;page-break-after:always}
  nav.indice{page-break-after:always}
  section.capitulo{page-break-before:always}
  h1{margin-top:0}
  figure,table,.diagrama,aside.aviso{page-break-inside:avoid}
  h2,h3{page-break-after:avoid}
  a{color:inherit;text-decoration:none}
  .contenedor{max-width:none;padding:0}
}
</style></head>
<body>
<header class="portada">
  <span class="eti">Manual de uso</span>
  <h1>Portal institucional e intranet</h1>
  <p class="inst">${esc(ficha.nombre)}</p>
  <dl>
    <dt>Sitio</dt><dd>${esc(ficha.dominio)}</dd>
    <dt>Plataforma</dt><dd>${esc(ficha.versionPlataforma)}</dd>
    <dt>Edición</dt><dd>Manual completo: ${capitulos.length} capítulos, todos los módulos de la intranet</dd>
    <dt>Fecha</dt><dd>${esc(hoy)}</dd>
  </dl>
  <p class="nota">${esc(ficha.nota || '')} Las capturas se tomaron en una instalación de prueba con datos ficticios.</p>
</header>
<div class="contenedor">
<nav class="indice"><h2>Contenido</h2><ol>${indice}</ol></nav>
${cuerpoNumerado}
<p class="pie">Manual estándar de la plataforma · ${esc(ficha.nombreCorto)} · Generado el ${esc(hoy)}.</p>
</div>
<script src="../herramientas/node_modules/mermaid/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:false,theme:'neutral',flowchart:{htmlLabels:true,curve:'basis'},fontFamily:'Segoe UI, Arial, sans-serif'});
mermaid.run({querySelector:'.mermaid'}).then(()=>{document.body.dataset.listo='1'}).catch(e=>{document.body.dataset.listo='error:'+e.message});</script>
</body></html>`;

(async () => {
  const borrador = path.join(SALIDA, `.borrador-${fichaId}.html`);
  fs.writeFileSync(borrador, html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto('file://' + borrador, { waitUntil: 'load' });
  await p.waitForFunction(() => document.body.dataset.listo, null, { timeout: 30000 });
  const estado = await p.evaluate(() => document.body.dataset.listo);
  if (estado !== '1') throw new Error('Mermaid: ' + estado);

  // HTML final: diagramas ya convertidos en SVG, sin depender de scripts.
  await p.evaluate(() => document.querySelectorAll('script').forEach(s => s.remove()));
  const final = '<!doctype html>\n' + await p.evaluate(() => document.documentElement.outerHTML);
  const salidaHtml = path.join(SALIDA, `manual-${fichaId}.html`);
  fs.writeFileSync(salidaHtml, final);

  // PDF
  await p.emulateMedia({ media: 'print' });
  await p.pdf({
    path: path.join(SALIDA, `manual-${fichaId}.pdf`), format: 'A4', printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' }, displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 16mm;color:#5b6475;text-align:right">Manual de uso · ${esc(ficha.nombreCorto)}</div>`,
    footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#5b6475">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
  });
  await b.close();
  fs.unlinkSync(borrador);
  console.log(`Listo: salida/manual-${fichaId}.html y salida/manual-${fichaId}.pdf (${capitulos.length} capítulos, ${nFig} figuras)`);
})().catch(e => { console.error(e); process.exit(1); });
