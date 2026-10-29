// Fase B: verificación pública (recarga completa) de los registros QA30 publicados vs. borradores.
const L = require('./lib.cjs'); const fs = require('node:fs');
const PUBLIC = { noticias: '/noticias', catnoticias: '/noticias', eventos: '/eventos', inversiones: '/transparencia/inversiones', convocatorias: '/transparencia/convocatorias', documentos: '/transparencia/documentos-gestion', tiposdoc: '/transparencia/documentos-gestion', tupa: '/transparencia/tupa', jerarquica: '/nosotros/plana-jerarquica', docentes: '/nosotros/plana-docente', locales: '/nosotros/campus-e-informes', reconocimientos: '/nosotros/reconocimientos', programas: '/programas', becas: '/becas', becasper: '/becas', becastipos: '/becas', servicios: '/servicios/complementarios', slides: '/', admision: '/admision', matricula: '/matricula', enlaces: '/', paginas: 'SLUG', egresados: null, certificados: null };
const PUBSTATES = /^(Publicad[oa]|Activo|Válido)$/;
(async () => {
  const b = await L.browser(); const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto(L.BASE + '/#/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(2500);
  const data = await p.evaluate(() => PORTAL_BOOTSTRAP.data);
  const { p: ap } = await L.login(b, 'nasca', process.env.QA30_PASS);
  const all = await ap.evaluate(async () => (await (await fetch(portalURL('/api/portal'))).json()).data);
  for (const [key, route] of Object.entries(PUBLIC)) {
    const col = await ap.evaluate(k => SPECS[k].coll, key);
    const mine = (all[col] || []).filter(r => /QA30-0\d/.test(JSON.stringify([r.titulo, r.nombre, r.nombres, r.denominacion, r.cargo])));
    if (!mine.length) continue;
    const pubIds = new Set((data[col] || []).map(r => r.id));
    const published = mine.filter(r => PUBSTATES.test(r.estado) && !r.deleted), hidden = mine.filter(r => !PUBSTATES.test(r.estado) || r.deleted);
    const leak = hidden.filter(r => pubIds.has(r.id)); const missing = published.filter(r => !pubIds.has(r.id));
    // Render: buscar el texto de un publicado en la página pública tras recarga completa
    let rendered = 'n/a';
    if (route && published.length) { const t = published[0]; const r = route === 'SLUG' ? '/paginas/' + t.slug : route; const label = t.titulo || t.nombre || t.nombres || t.denominacion || t.cargo;
      await p.goto(L.BASE + '/?r=' + Date.now() + '#' + r, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(3000);
      let body = await p.evaluate(() => document.body.innerText);
      if (!body.includes(label)) { const s = p.locator('main input[type=search], main input[name=q]').first(); if (await s.count()) { await s.fill('QA30'); await s.press('Enter'); await p.waitForTimeout(1500); body = await p.evaluate(() => document.body.innerText); } }
      rendered = body.includes(label) ? 'visible' : 'no visible en la página'; await L.shot(p, 'B-publico-' + key); }
    const st = leak.length ? 'FALLA' : missing.length ? 'REVISAR' : (rendered === 'no visible en la página' ? 'REVISAR' : 'OK');
    L.rec('B', `${key}: publicación en portal`, st, `${published.length} publicados → ${published.length - missing.length} en datos públicos, render: ${rendered}; ${hidden.length} borrador/eliminado → ${leak.length} filtrados al público`);
  }
  L.save('fase-b-publico'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
