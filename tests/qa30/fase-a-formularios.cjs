// Fase A: 5 envíos por formulario público (contacto, libro de reclamaciones, mesa de partes).
const L = require('./lib.cjs'); const fs = require('node:fs');
const FILES = process.env.QA30_FILES; const out = {};
async function open(b, hash, sel) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage();
  p._req = []; p.on('response', r => { if (/api%2F(solicitudes|archivos)/.test(r.url())) r.text().then(t => p._req.push(r.status() + ' ' + t.slice(0, 160))).catch(() => {}); });
  await p.goto(L.BASE + '/#' + hash, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForSelector(sel, { timeout: 30000 }); await p.waitForTimeout(800); return { ctx, p };
}
async function fill(p, sel, values, { captcha = true, wrongCaptcha = false } = {}) {
  const f = p.locator(sel);
  for (const [n, v] of Object.entries(values)) {
    const el = f.locator(`[name="${n}"]`); const c = await el.count(); if (!c) { console.log('  falta campo', n); continue; }
    const type = await el.first().getAttribute('type'); const tag = await el.first().evaluate(e => e.tagName);
    if (type === 'radio') await f.locator(`[name="${n}"][value="${v}"]`).check({ force: true });
    else if (type === 'checkbox') { if (v) await el.check({ force: true }); }
    else if (type === 'file') await el.setInputFiles(v);
    else if (tag === 'SELECT') await el.selectOption(v);
    else await el.fill(String(v));
  }
  if (captcha) { const q = await f.evaluate(form => (form.innerText.match(/Cuánto es\s*(\d+)\s*\+\s*(\d+)/) || []).slice(1).map(Number));
    await f.locator('[name=captcha]').fill(String(wrongCaptcha ? q[0] + q[1] + 1 : q[0] + q[1])); }
  await p.waitForTimeout(1500);
  await f.locator('button:not([type=button]):not([type=reset])').last().click(); await p.waitForTimeout(3500);
  const toast = (await p.locator('.toast, [role=alert], [role=status], .errmsg, .err').allInnerTexts()).join(' | ').replace(/\s+/g, ' ');
  const main = (await p.locator('main').innerText()).replace(/\s+/g, ' ');
  const code = (main.match(/\b(RCL|LR|MPV|EXP|MP)[-\s]?\d{4}[-\s]?\d{3,6}\b/) || [])[0] || '';
  return { toast, code, ok: p._req.some(r => r.startsWith('200') || r.startsWith('201')), req: p._req.slice(-2).join(' || ') };
}
(async () => {
  const b = await L.browser(); const ts = Date.now().toString().slice(-5);
  // Contacto
  const contactos = [
    { d: 'válido 1', v: { nombres: 'QA30-01 Contacto Prueba', documento: '99000001', correo: 'qa30.c1@portal.invalid', telefono: '999000001', asunto: 'Consulta sobre proceso de admisión', programa: 'cont', mensaje: 'QA30 mensaje de prueba ficticio 1, por favor ignorar.', acepto: true }, exp: true },
    { d: 'válido 2', v: { nombres: 'QA30-02 Contacto Prueba', correo: 'qa30.c2@portal.invalid', asunto: 'Matrícula y becas', mensaje: 'QA30 mensaje de prueba ficticio 2, por favor ignorar.', acepto: true }, exp: true },
    { d: 'válido 3', v: { nombres: 'QA30-03 Contacto Prueba', correo: 'qa30.c3@portal.invalid', asunto: 'Sugerencias', programa: 'enf', mensaje: 'QA30 mensaje 3 con <b>html</b> y <script>alert(1)</script> para probar escape.', acepto: true }, exp: true },
    { d: 'sin campos obligatorios', v: { nombres: '', correo: '', mensaje: '' }, exp: false },
    { d: 'captcha incorrecto', v: { nombres: 'QA30-05 Contacto', correo: 'qa30.c5@portal.invalid', asunto: 'Otros', mensaje: 'QA30 captcha incorrecto, no debe registrarse.', acepto: true }, exp: false, wrong: true },
  ];
  for (const c of contactos) { const { ctx, p } = await open(b, '/contacto', 'form[data-contact]');
    let alerted = false; p.on('dialog', d => { alerted = true; d.dismiss(); });
    const r = await fill(p, 'form[data-contact]', c.v, { wrongCaptcha: c.wrong }); await L.shot(p, 'A-contacto-' + c.d.replace(/\W+/g, '-'));
    L.rec('A', 'Contacto ' + c.d, r.ok === c.exp && !alerted ? 'OK' : 'FALLA', (r.ok ? 'registrado' : 'rechazado') + ' · ' + (r.toast || '').slice(0, 140) + (alerted ? ' · XSS ejecutado' : '')); await ctx.close(); await new Promise(s => setTimeout(s, 4000)); }
  // Libro de reclamaciones
  const base = { tipoDoc: 'DNI', correo: 'qa30.lr@portal.invalid', telefono: '999000010', condicion: 'Público en general', programaId: 'cont', fechaHecho: '2026-10-28', descripcion: 'QA30 PRUEBA FICTICIA del Libro de Reclamaciones. Descripción del hecho para control de calidad, ignorar.', pedido: 'QA30 pedido ficticio de prueba.', declaro: true, acepto: true };
  const reclamos = [
    { d: 'reclamo 1 con adjunto PDF', v: { ...base, numDoc: '99000011', nombresP: 'QA30-11 Reclamante', apellidos: 'Prueba Uno', tipo: 'Reclamo', adjunto: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'reclamo 2', v: { ...base, numDoc: '99000012', nombresP: 'QA30-12 Reclamante', apellidos: 'Prueba Dos', tipo: 'Reclamo' }, exp: true },
    { d: 'queja 1', v: { ...base, numDoc: '99000013', nombresP: 'QA30-13 Quejoso', apellidos: 'Prueba Tres', tipo: 'Queja' }, exp: true },
    { d: 'queja 2', v: { ...base, numDoc: '99000014', nombresP: 'QA30-14 Quejoso', apellidos: 'Prueba Cuatro', tipo: 'Queja' }, exp: true },
    { d: 'inválido (sin documento ni descripción)', v: { tipoDoc: 'DNI', nombresP: 'QA30-15', tipo: 'Reclamo', acepto: true }, exp: false },
  ];
  out.reclamos = [];
  for (const c of reclamos) { const { ctx, p } = await open(b, '/servicios/libro-de-reclamaciones', 'form[data-lr2]');
    const sel = 'form[data-lr2]'; const tipos = await p.$$eval(sel + ' [name=tipo]', r => r.map(x => x.value)); if (c.v.tipo && !tipos.includes(c.v.tipo)) c.v.tipo = tipos[c.v.tipo === 'Queja' ? 1 : 0];
    const area = await p.$$eval(sel + ' [name=areaHecho] option', o => o.map(x => x.value).filter(Boolean)); if (c.exp) c.v.areaHecho = area[0];
    const r = await fill(p, sel, c.v); await L.shot(p, 'A-reclamo-' + c.d.replace(/\W+/g, '-'));
    const m = r.req.match(/"(?:codigo|code|numero)":"([^"]+)"/); const code = m ? m[1] : r.code; if (r.ok) out.reclamos.push({ code, doc: c.v.numDoc });
    L.rec('A', 'Libro de reclamaciones ' + c.d, r.ok === c.exp ? 'OK' : 'FALLA', (r.ok ? 'registrado ' + code : 'rechazado') + ' · ' + r.toast.slice(0, 140)); await ctx.close(); await new Promise(s => setTimeout(s, 4000)); }
  // Consulta de reclamo por código
  for (const rc of out.reclamos.slice(0, 2)) { const { ctx, p } = await open(b, '/servicios/libro-de-reclamaciones', 'form[data-lrq2]');
    await p.fill('form[data-lrq2] [name=codigo]', rc.code); await p.fill('form[data-lrq2] [name=doc]', rc.doc); await p.click('form[data-lrq2] button:not([type=button])'); await p.waitForTimeout(3000);
    const t = (await p.locator('main').innerText()); L.rec('A', 'Consulta pública de reclamo ' + rc.code, t.includes(rc.code) && /recibido|en atención|atendido/i.test(t) ? 'OK' : 'FALLA'); await ctx.close(); }
  // Mesa de partes
  const mbase = { tipoPersona: 'Persona natural', tipoDoc: 'DNI', correo: 'qa30.mp@portal.invalid', telefono: '999000020', direccion: 'Av. Prueba QA30 123, Nasca', tipoTramite: 'Solicitud', asunto: 'QA30 PRUEBA FICTICIA de Mesa de Partes, por favor ignorar.', folios: '1', declaro: true, acepto: true };
  const mesas = [
    { d: 'expediente 1 con PDF', v: { ...mbase, numDoc: '99000021', nombresP: 'QA30-21 Solicitante', apellidos: 'Prueba Uno', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'expediente 2 con PDF', v: { ...mbase, numDoc: '99000022', nombresP: 'QA30-22 Solicitante', apellidos: 'Prueba Dos', tipoTramite: 'Carta', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'expediente 3 con PDF', v: { ...mbase, numDoc: '99000023', nombresP: 'QA30-23 Solicitante', apellidos: 'Prueba Tres', tipoTramite: 'Oficio', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'expediente 4 persona jurídica con PDF', v: { ...mbase, tipoPersona: 'Persona jurídica / entidad', tipoDoc: 'RUC', numDoc: '20999000241', razon: 'QA30-24 Empresa Prueba SAC', nombresP: 'QA30-24 Representante', apellidos: 'Prueba', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'archivo .php no permitido', v: { ...mbase, numDoc: '99000025', nombresP: 'QA30-25', apellidos: 'Prueba', archivos: FILES + '/qa30-script.php' }, exp: false },
  ];
  out.expedientes = [];
  for (const c of mesas) { const { ctx, p } = await open(b, '/servicios/mesa-de-partes', 'form[data-mpv]'); const sel = 'form[data-mpv]';
    if (c.v.tipoPersona) { await p.selectOption(sel + ' [name=tipoPersona]', c.v.tipoPersona); await p.waitForTimeout(500); }
    const area = await p.$$eval(sel + ' [name=areaDestino] option', o => o.map(x => x.value).filter(Boolean)); c.v.areaDestino = area[0];
    const r = await fill(p, sel, c.v); await L.shot(p, 'A-mesa-' + c.d.replace(/\W+/g, '-'));
    const m = r.req.match(/"(?:numero|codigo)":"([^"]+)"/); const code = m ? m[1] : r.code; const registered = /solicitudes/.test(r.req) && /^20/.test(r.req.split('||').pop().trim()) ;
    const ok = c.exp ? r.ok && !!code : !/api%2Fsolicitudes|"numero"/.test(r.req) || /^4/.test(r.req.split('||')[0].trim());
    if (c.exp && r.ok) out.expedientes.push({ code, doc: c.v.numDoc });
    L.rec('A', 'Mesa de partes ' + c.d, ok ? 'OK' : 'FALLA', (code ? 'registrado ' + code : '') + ' · ' + r.toast.slice(0, 120) + ' · ' + r.req.slice(0, 160)); await ctx.close(); await new Promise(s => setTimeout(s, 4000)); }
  fs.writeFileSync(L.EVID + '/fase-a-codigos.json', JSON.stringify(out, null, 1));
  L.save('fase-a-formularios'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
