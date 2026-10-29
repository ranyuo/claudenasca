// Fase A: documentos publicados, buscador, boletín y contador de visitas.
const { browser, BASE, rec, save, shot, login } = require('./lib.cjs');
(async () => {
  const b = await browser(); const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto(BASE + '/#/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(3000);
  const urls = await p.evaluate(() => { const out = new Set(); const walk = (v, k) => { if (typeof v === 'string') { if (/^\/(assets\/|index\.php\?route=api\/archivos)/.test(v) || (/^https?:\/\//.test(v) && /\.(pdf|docx?)$/i.test(v))) out.add(v); } else if (v && typeof v === 'object') for (const [kk, vv] of Object.entries(v)) walk(vv, kk); }; walk(PORTAL_BOOTSTRAP.data); return [...out]; });
  let ok = 0; const fails = [];
  for (const u of urls) { const s = await p.request.get(new URL(u, BASE).href, { timeout: 30000 }).then(r => r.status()).catch(() => 'ERR'); if (s === 200) ok++; else fails.push(u + ' → ' + s); }
  rec('A', `Archivos publicados (imágenes, PDF) accesibles ${ok}/${urls.length}`, fails.length ? 'FALLA' : 'OK', fails.slice(0, 8).join('; '));
  // Buscador
  for (const [q, expect] of [['admisión', true], ['contabilidad', true], ['enfermeria', true], ['xyzqwe123', false], ['<script>alert(1)</script>', false], ["' OR 1=1 --", false]]) {
    let alerted = false; p.once('dialog', d => { alerted = true; d.dismiss(); });
    await p.evaluate(() => { location.hash = '/'; }); await p.waitForTimeout(500);
    const input = p.locator('#q1:visible, #q2:visible').first(); await input.fill(q); await input.press('Enter'); await p.waitForTimeout(1500);
    const txt = await p.locator('main').innerText(); const n = await p.locator('main a[href^="#/"]').count();
    const hasRes = !/sin resultados|no se encontr|0 resultados/i.test(txt) && n > 0;
    rec('A', `Buscador "${q}"`, alerted ? 'FALLA' : (hasRes === expect ? 'OK' : (expect ? 'FALLA' : 'OK')), alerted ? 'ejecutó script (XSS)' : (hasRes ? n + ' enlaces en resultados' : 'sin resultados'));
  }
  await shot(p, 'A-buscador');
  // Boletín (sin enviar correo real: dominio .invalid)
  await p.evaluate(() => { location.hash = '/'; }); await p.waitForTimeout(800);
  const nl = p.locator('#nl'); await nl.fill('correo-invalido'); await nl.locator('xpath=ancestor::form//button').click(); await p.waitForTimeout(800);
  rec('A', 'Boletín rechaza correo inválido', await nl.evaluate(e => !e.checkValidity()) ? 'OK' : 'FALLA');
  // Contador de visitas: visitar 5 páginas y ver el panel
  const pages = ['/admision', '/becas', '/noticias', '/eventos', '/contacto'];
  const v = await b.newContext(); const vp = await v.newPage(); await vp.goto(BASE + '/#/', { waitUntil: 'domcontentloaded' }); await vp.waitForTimeout(2000);
  const posts = []; vp.on('response', r => { if (r.url().includes('api%2Fvisitas') || r.url().includes('api/visitas')) posts.push(r.status()); });
  for (const h of pages) { await vp.evaluate(x => { location.hash = x; }, h); await vp.waitForTimeout(1200); }
  rec('A', 'Registro de visitas (POST /api/visitas)', posts.length && posts.every(s => s < 300) ? 'OK' : 'FALLA', 'respuestas: ' + JSON.stringify(posts));
  const { p: ap } = await login(b, 'nasca', process.env.QA30_PASS);
  await ap.evaluate(() => { location.hash = '/admin/dashboard?p=7'; }); await ap.waitForTimeout(2500);
  const card = await ap.locator('text=Visitas al portal').locator('xpath=ancestor::*[self::a or self::div][1]/..').first().innerText().catch(() => '');
  rec('A', 'Panel muestra visitas registradas', /\b0\b/.test(card.split('\n').slice(0, 3).join(' ')) ? 'FALLA' : 'OK', card.replace(/\s+/g, ' ').slice(0, 120));
  await shot(ap, 'A-panel-visitas');
  save('fase-a-extra'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
