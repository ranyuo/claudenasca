// Verificación en navegador (servidor PHP local) de las correcciones y la optimización QA30.
const L = require('./lib.cjs'); const fs = require('node:fs');
(async () => {
  const b = await L.browser();
  // Portal público: sin errores, recursos versionados, logo como archivo y luego data: en memoria
  const ctx = await b.newContext(); const p = await ctx.newPage(); const errs = []; const reqs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('response', r => reqs.push([r.url().replace(L.BASE, ''), r.status()]));
  await p.goto(L.BASE + '/#/', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  const bad = reqs.filter(([u, s]) => s >= 400); L.rec('V', 'Portal público carga sin errores ni recursos fallidos', !errs.length && !bad.length ? 'OK' : 'FALLA', [...errs, ...bad.map(x => x.join(' '))].join(' | '));
  const app = reqs.filter(([u]) => /assets\/app|portal-server/.test(u)); L.rec('V', 'CSS y JS servidos como archivos versionados', app.length === 6 && app.every(([u, s]) => /\?v=\d+/.test(u) && s === 200) ? 'OK' : 'FALLA', app.map(x => x.join(' ')).join(', '));
  const logo = await p.evaluate(() => [PORTAL_BOOTSTRAP.data.config.inst.logo.slice(0, 40), DB.config.inst.logo.slice(0, 22)]);
  L.rec('V', 'Logo enviado como archivo cacheable y rehidratado a data: para PDF', /^\/assets\/cache\//.test(logo[0]) && logo[1].startsWith('data:image/png') ? 'OK' : 'FALLA', logo.join(' → '));
  for (const r of ['/nosotros/plana-jerarquica', '/programas', '/transparencia/tupa', '/servicios/mesa-de-partes', '/servicios/libro-de-reclamaciones']) { await p.evaluate(h => { location.hash = h; }, r); await p.waitForTimeout(700); }
  L.rec('V', 'Navegación por 5 secciones públicas sin errores', errs.length ? 'FALLA' : 'OK', errs.slice(0, 3).join(' | '));
  // Administrador: sin guardado automático al ingresar, visitas reales, editor de áreas
  const { p: ap } = await (async () => { const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pg = await c.newPage(); const puts = []; pg.on('request', r => { if (r.method() === 'PUT') puts.push(r.postData()?.slice(0, 160)); }); pg._puts = puts;
    await pg.goto(L.BASE + '/#/admin', { waitUntil: 'domcontentloaded' }); await pg.fill('#lg-u', 'principal'); await pg.fill('#lg-p', process.env.LOCAL_PASS); await pg.click('form button[type=submit]');
    await pg.waitForFunction(() => location.hash.startsWith('#/admin/') && window.PORTAL_BOOTSTRAP?.user, null, { timeout: 20000 }).catch(async e => { throw new Error('Ingreso local: ' + await pg.locator('#lg-e').textContent()); }); await pg.waitForTimeout(3000); return { p: pg }; })();
  L.rec('V', 'Ingreso del administrador sin guardados automáticos', ap._puts.length ? 'FALLA' : 'OK', ap._puts.join(' | '));
  const vis = await ap.evaluate(() => JSON.stringify(DB.visitas)); L.rec('V', 'El panel recibe las visitas reales', /\d/.test(vis) && vis !== '[]' ? 'OK' : 'FALLA', vis);
  await ap.evaluate(() => { location.hash = '/admin/expedientes/areas'; }); await ap.waitForTimeout(1200);
  const href = await ap.locator('a', { hasText: 'Editar áreas' }).getAttribute('href').catch(() => null);
  L.rec('V', 'Botón "Editar áreas" apunta al editor', href === '#/admin/expedientes/areas/editar' ? 'OK' : 'FALLA', href);
  await ap.click('a:has-text("Editar áreas")'); await ap.waitForTimeout(1500);
  const n0 = await ap.locator('[data-edit^="areas:"]').count();
  L.rec('V', 'Editor de áreas y tipos de trámite visible', (await ap.locator('[data-new="areas"]').count()) && (await ap.locator('[data-new="tramites"]').count()) ? 'OK' : 'FALLA', `${n0} áreas`);
  await ap.click('[data-new="areas"]'); await ap.waitForTimeout(700); const m = ap.locator('.modal:visible, dialog[open]').last();
  for (const f of await m.locator('input:not([type=checkbox]):not([readonly]), select, textarea').all()) { if (!(await f.isVisible())) continue; const info = await f.evaluate(e => ({ tag: e.tagName, type: e.type, name: (e.name || '').toLowerCase() }));
    if (info.tag === 'SELECT') { const o = await f.evaluate(e => [...e.options].map(x => x.value).filter(Boolean)); if (o.length) await f.selectOption(o[0]); }
    else await f.fill(info.type === 'email' || /correo|mail/.test(info.name) ? 'mesadepartes@istpnasca.edu.pe' : /cod/.test(info.name) ? 'QA30A' : 'QA30 Área local de prueba'); }
  await m.locator('button', { hasText: /^\s*Registrar\s*$/ }).click(); await ap.waitForTimeout(1500);
  const after = await ap.locator('[data-edit^="areas:"]').count(); const saved = await ap.evaluate(async () => (await (await fetch(portalURL('/api/portal'))).json()).data.academico.areas.some(a => /QA30/.test(JSON.stringify(a))));
  L.rec('V', 'Crear área desde el editor y guardarla en el servidor', after === n0 + 1 && saved ? 'OK' : 'FALLA', `${n0} → ${after}; servidor: ${saved}`);
  await L.shot(ap, 'V-editor-areas');
  // Mensaje real del servidor al rechazar un archivo en Mesa de partes (formulario real)
  { const { open, fill } = require('./forms-lib.cjs'); const { ctx: c2, p: mp } = await open(b, '/servicios/mesa-de-partes', 'form[data-mpv]'); const sel = 'form[data-mpv]';
    const area = (await mp.$$eval(sel + ' [name=areaDestino] option', o => o.map(x => x.value).filter(Boolean)))[0];
    const r = await fill(mp, sel, { tipoDoc: 'DNI', numDoc: '99000031', nombresP: 'QA30 Local', apellidos: 'Prueba', correo: 'qa30.local@portal.invalid', telefono: '999000031', direccion: 'Av. Prueba 1', tipoTramite: 'Solicitud', areaDestino: area, asunto: 'QA30 prueba local de archivo rechazado', folios: '1', archivos: process.env.QA30_FILES + '/qa30-falso.pdf', declaro: true, acepto: true });
    L.rec('V', 'Mesa de partes: el error del servidor llega al usuario', /contenido del archivo|formato/i.test(r.toast) ? 'OK' : 'FALLA', r.toast.slice(0, 200)); await L.shot(mp, 'V-mesa-error'); await c2.close(); }
  const dels = ap.locator('[data-del^="areas:"]'); await dels.last().click(); await ap.waitForTimeout(600); await ap.locator('.modal:visible button, dialog[open] button').filter({ hasText: /^\s*Eliminar\s*$/ }).last().click(); await ap.waitForTimeout(1500);
  L.rec('V', 'Eliminar el área de prueba', (await ap.locator('[data-edit^="areas:"]').count()) === n0 ? 'OK' : 'FALLA');
  // Recorrido de módulos de la intranet sin errores
  const aerrs = []; ap.on('pageerror', e => aerrs.push(e.message));
  const mods = await ap.$$eval('aside a[href^="#/admin/"]', a => [...new Set(a.map(x => x.getAttribute('href')))]);
  for (const h of mods) { await ap.evaluate(x => { location.hash = x.slice(1); }, h); await ap.waitForTimeout(500); }
  L.rec('V', `Recorrido de ${mods.length} módulos de la intranet sin errores JS`, aerrs.length ? 'FALLA' : 'OK', aerrs.slice(0, 3).join(' | '));
  L.rec('V', 'Sin guardados automáticos durante el recorrido', ap._puts.length <= 2 ? 'OK' : 'REVISAR', `${ap._puts.length} PUT (2 corresponden al área creada y eliminada)`);
  L.save('local-verificacion'); await b.close();
})().catch(e => { console.error(e); L.save('local-verificacion'); process.exit(1); });
