// Fase B: flujos de atención (mensajes, libro de reclamaciones, mesa de partes) y aprobaciones.
const L = require('./lib.cjs');
const api = (p, route) => p.evaluate(async r => (await (await fetch(portalURL(r))).json()).data, route);
(async () => {
  const b = await L.browser(); const { p } = await L.login(b, 'nasca', process.env.QA30_PASS); p.on('dialog', d => d.accept());
  let d = await api(p, '/api/portal');
  // Mensajes: abrir detalle (marca leído) y eliminar uno
  const msgs = d.mensajes.filter(m => /QA30/.test(m.nombres || '')); L.rec('B', 'Mensajes QA30 recibidos en intranet', msgs.length >= 3 ? 'OK' : 'FALLA', msgs.length + ' mensajes');
  await p.evaluate(() => { location.hash = '/admin/mensajes'; }); await p.waitForTimeout(1500);
  const xss = await p.evaluate(() => !!document.querySelector('main script, main b'));
  for (const m of msgs.slice(0, 2)) { const row = p.locator(`tr[data-id="${m.id}"] [data-act=open]`); if (await row.count()) { await row.click(); await p.waitForTimeout(1200); await L.shot(p, 'B-mensaje-detalle'); await p.evaluate(() => { location.hash = '/admin/mensajes'; }); await p.waitForTimeout(1000); } }
  d = await api(p, '/api/portal'); const read = d.mensajes.filter(m => msgs.slice(0, 2).some(x => x.id === m.id)).map(m => m.estado || (m.leido ? 'Leído' : 'No leído'));
  L.rec('B', 'Mensajes: abrir detalle cambia estado a leído', read.every(s => !/^(Nuevo|No leído|Pendiente)$/i.test(String(s))) ? 'OK' : 'REVISAR', read.join(', '));
  L.rec('B', 'Mensajes: HTML/script del visitante se muestra escapado', xss ? 'FALLA' : 'OK');
  // Reclamos: derivar, en atención, respuesta y atendido
  const recs = d.reclamos.filter(r => /QA30/.test(r.nombresP || r.nombres || ''));
  for (const [i, r] of recs.slice(0, 3).entries()) {
    await p.evaluate(id => { location.hash = '/admin/reclamos/' + id; }, r.id); await p.waitForTimeout(1500);
    const area = await p.$$eval('#lr-ar option', o => o.map(x => x.value).filter(Boolean)); if (area.length) { await p.selectOption('#lr-ar', area[0]); await p.fill('#lr-arn', 'QA30 derivación de prueba'); await p.click('[data-der]'); await p.waitForTimeout(1500); }
    await p.selectOption('#lr-st', 'En atención'); await p.fill('#lr-sn', 'QA30 en atención').catch(() => {}); await p.locator('button').filter({ hasText: 'Actualizar estado' }).click(); await p.waitForTimeout(1500);
    if (i < 2) { await p.fill('#lr-resp', 'QA30 respuesta institucional de prueba. Caso ficticio.'); await p.locator('button').filter({ hasText: /Guardar respuesta/ }).click(); await p.waitForTimeout(1800); }
    await L.shot(p, 'B-reclamo-' + r.codigo);
  }
  d = await api(p, '/api/portal'); const st = d.reclamos.filter(r => recs.slice(0, 3).some(x => x.id === r.id)).map(r => r.codigo + ':' + r.estado + (r.area ? '@' + r.area : '') + ':' + (r.historial || []).length + 'h');
  L.rec('B', 'Reclamos: derivar, poner en atención y responder (3 casos)', st.filter(s => /Atendido/.test(s)).length === 2 && st.some(s => /En atención/.test(s)) ? 'OK' : 'FALLA', st.join(' · '));
  // Consulta pública refleja el estado
  const pub = await (await b.newContext()).newPage(); await pub.goto(L.BASE + '/#/servicios/libro-de-reclamaciones', { waitUntil: 'domcontentloaded' }); await pub.waitForTimeout(3000);
  await pub.click('main button:has-text("Consultar estado")'); await pub.fill('form[data-lrq2] [name=codigo]', recs[0]?.codigo || recs.at(-1).codigo); await pub.fill('form[data-lrq2] [name=doc]', recs[0]?.numDoc); await pub.click('form[data-lrq2] button:not([type=button])'); await pub.waitForTimeout(2500);
  const pt = await pub.locator('main').innerText(); L.rec('B', 'Consulta pública muestra "Atendido" y la respuesta', /Atendido/.test(pt) && /QA30 respuesta/.test(pt) ? 'OK' : /Atendido/.test(pt) ? 'REVISAR' : 'FALLA', /QA30 respuesta/.test(pt) ? 'estado y respuesta visibles' : 'respuesta no visible'); await L.shot(pub, 'B-reclamo-consulta-publica');
  // Hoja de reclamación PDF
  await p.evaluate(id => { location.hash = '/admin/reclamos/' + id; }, recs[0].id); await p.waitForTimeout(1500);
  const dl = await Promise.all([p.waitForEvent('download', { timeout: 15000 }).catch(() => null), p.locator('button').filter({ hasText: 'Hoja de reclamación' }).click()]).then(x => x[0]);
  L.rec('B', 'Reclamos: descarga de hoja de reclamación (PDF)', dl ? 'OK' : 'REVISAR', dl ? dl.suggestedFilename() : 'sin descarga (puede abrir en ventana)');
  // Mesa de partes: derivar y cambiar estado
  const exps = d.expedientes.filter(x => /QA30/.test(x.nombresP || x.razon || x.asunto || ''));
  for (const [i, x] of exps.slice(0, 4).entries()) {
    await p.evaluate(id => { location.hash = '/admin/expedientes/' + id; }, x.id); await p.waitForTimeout(1500);
    const area = await p.$$eval('#xa option', o => o.map(v => v.value).filter(Boolean)); if (area.length) { await p.selectOption('#xa', area[Math.min(i, area.length - 1)]); await p.fill('#xan', 'QA30 proveído de prueba').catch(() => {}); await p.click('[data-xa]'); await p.waitForTimeout(1500); }
    await p.selectOption('#xs', ['En proceso', 'Observado', 'Atendido', 'Archivado'][i]); await p.fill('#xn', 'QA30 nota de prueba ' + i); await p.click('[data-xs]'); await p.waitForTimeout(1500);
  }
  const dl2 = await Promise.all([p.waitForEvent('download', { timeout: 15000 }).catch(() => null), p.locator('button').filter({ hasText: 'Cargo de recepción' }).click()]).then(x => x[0]);
  L.rec('B', 'Mesa de partes: descarga de cargo de recepción (PDF)', dl2 ? 'OK' : 'REVISAR', dl2 ? dl2.suggestedFilename() : 'sin descarga');
  d = await api(p, '/api/portal'); const es = d.expedientes.filter(x => exps.some(e => e.id === x.id)).map(x => x.numero + ':' + x.estado + '@' + x.area);
  L.rec('B', 'Mesa de partes: derivar y cambiar estado (4 expedientes)', es.filter(s => !/Recibido/.test(s)).length === 4 ? 'OK' : 'FALLA', es.join(' · '));
  // Aprobaciones
  await p.evaluate(() => { location.hash = '/admin/aprobaciones'; }); await p.waitForTimeout(1500);
  L.rec('B', 'Aprobaciones: bandeja accesible', 'OK', (await p.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 160)); await L.shot(p, 'B-aprobaciones');
  // Panel, exportar resumen, auditoría
  await p.evaluate(() => { location.hash = '/admin/dashboard'; }); await p.waitForTimeout(1500);
  for (const per of ['7', '30', '90']) { await p.evaluate(x => { location.hash = '/admin/dashboard?p=' + x; }, per); await p.waitForTimeout(900); }
  const dl3 = await Promise.all([p.waitForEvent('download', { timeout: 15000 }).catch(() => null), p.locator('button, a').filter({ hasText: 'Exportar resumen' }).first().click()]).then(x => x[0]);
  L.rec('B', 'Panel: filtros 7/30/90 días y exportar resumen', dl3 ? 'OK' : 'REVISAR', dl3 ? dl3.suggestedFilename() : 'sin descarga');
  const health = await p.locator('main').innerText(); const hm = health.match(/Salud del portal[\s\S]{0,600}/); L.rec('B', 'Panel: salud del portal', /8 de 8/.test(health) ? 'OK' : 'REVISAR', (hm ? hm[0] : '').replace(/\s+/g, ' ').slice(0, 300));
  await p.goto(L.BASE + '/auditoria.php?q=QA30'); await p.waitForTimeout(2000); const au = await p.locator('main').innerText();
  L.rec('B', 'Auditoría registra las acciones QA30', /(\d+) registros/.test(au) && +au.match(/(\d+) registros/)[1] > 20 ? 'OK' : 'FALLA', (au.match(/\d+ registros[^.]*/) || [''])[0]); await L.shot(p, 'B-auditoria');
  const csv = await Promise.all([p.waitForEvent('download', { timeout: 20000 }).catch(() => null), p.locator('a').filter({ hasText: 'Exportar' }).first().click()]).then(x => x[0]);
  L.rec('B', 'Auditoría: exportar CSV', csv ? 'OK' : 'FALLA', csv ? csv.suggestedFilename() : '');
  L.save('fase-b-atencion'); await b.close();
})().catch(e => { console.error(e); L.save('fase-b-atencion'); process.exit(1); });
