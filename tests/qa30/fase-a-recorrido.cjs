// Fase A: recorrido de todas las rutas públicas (escritorio y móvil), errores, enlaces y recursos.
const { browser, BASE, rec, save, shot } = require('./lib.cjs');
(async () => {
  const b = await browser();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  const errs = []; const bad = new Map();
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(BASE)) bad.set(r.url(), r.status()); });
  await p.goto(BASE + '/#/mapa-del-sitio', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(4000);
  let routes = await p.$$eval('a[href^="#/"]', a => [...new Set(a.map(x => x.getAttribute('href').split('?')[0]))]);
  routes = routes.filter(r => !r.startsWith('#/admin'));
  // Detalles de noticias/eventos/programas incluidos vía enlaces encontrados en cada página.
  const seen = new Set(); const queue = ['#/', ...routes]; const assets = new Set();
  while (queue.length) {
    const r = queue.shift(); if (seen.has(r) || seen.size > 160) continue; seen.add(r);
    errs.length = 0;
    await p.evaluate(h => { location.hash = h.slice(1); }, r); await p.waitForTimeout(900);
    const info = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      const txt = main.innerText.trim();
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith('data:')).map(i => i.src);
      const noAlt = [...main.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length;
      const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
      const h1 = document.querySelector('main h1, h1')?.innerText.trim() || '';
      return { len: txt.length, nf: /no encontrad|no existe|404/i.test(txt.slice(0, 600)), broken, noAlt, links, h1 };
    });
    for (const l of info.links) {
      if (l.startsWith('#/') && !l.startsWith('#/admin') && !seen.has(l.split('?')[0])) queue.push(l.split('?')[0]);
      else if (/^\/(assets|index\.php\?route=api\/archivos)|\.(pdf|docx?|xlsx?)$/i.test(l)) assets.add(new URL(l, BASE).href);
    }
    const problems = [];
    if (info.len < 80) problems.push('contenido vacío (' + info.len + ' car.)');
    if (info.nf) problems.push('muestra "no encontrado"');
    if (info.broken.length) problems.push('imágenes rotas: ' + info.broken.slice(0, 3).join(', '));
    if (errs.length) problems.push('errores JS: ' + errs.slice(0, 2).join(' | '));
    rec('A', 'Ruta ' + r + (info.h1 ? ' (' + info.h1.slice(0, 40) + ')' : ''), problems.length ? 'FALLA' : 'OK', problems.join('; '));
  }
  rec('A', 'Total rutas públicas recorridas', 'OK', seen.size);
  // Recursos descargables
  let okA = 0;
  for (const u of assets) { const s = await p.request.get(u, { timeout: 30000 }).then(r => r.status()).catch(e => 'ERR'); if (s === 200) okA++; else rec('A', 'Recurso ' + u, 'FALLA', 'HTTP ' + s); }
  rec('A', `Documentos/archivos enlazados descargables (${okA}/${assets.size})`, okA === assets.size ? 'OK' : 'FALLA');
  for (const [u, s] of bad) rec('A', 'Petición con error ' + u, 'FALLA', 'HTTP ' + s);
  // Móvil 375 px
  const m = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true }); const mp = await m.newPage();
  await mp.goto(BASE + '/#/', { waitUntil: 'domcontentloaded' }); await mp.waitForTimeout(3000);
  const overflow = [];
  for (const r of [...seen]) { await mp.evaluate(h => { location.hash = h.slice(1); }, r); await mp.waitForTimeout(500);
    const w = await mp.evaluate(() => document.documentElement.scrollWidth); if (w > 377) overflow.push(r + ' (' + w + 'px)'); }
  rec('A', 'Móvil 375 px sin desplazamiento horizontal', overflow.length ? 'FALLA' : 'OK', overflow.join(', '));
  await mp.evaluate(() => { location.hash = '/'; }); await mp.waitForTimeout(800);
  const burger = mp.locator('button:has-text("Abrir menú")').first();
  if (await burger.isVisible()) { await burger.click(); await mp.waitForTimeout(500); rec('A', 'Menú hamburguesa móvil abre', (await mp.locator('nav a:visible').count()) > 5 ? 'OK' : 'FALLA'); }
  else rec('A', 'Menú hamburguesa móvil visible', 'FALLA');
  await shot(mp, 'A-movil-menu');
  await shot(p, 'A-escritorio-ultima');
  save('fase-a-recorrido'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
