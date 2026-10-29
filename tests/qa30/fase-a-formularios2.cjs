// Fase A (parte 2): consulta pública de reclamos y 5 envíos de Mesa de partes.
const L = require('./lib.cjs'); const fs = require('node:fs'); const { open, fill } = require('./forms-lib.cjs');
const FILES = process.env.QA30_FILES;
(async () => {
  const b = await L.browser();
  for (const rc of process.env.SKIP ? [] : [{ code: 'RCL-2026-00005', doc: '99000011' }, { code: 'RCL-2026-00007', doc: '99000013' }, { code: 'RCL-2026-00005', doc: '11111111', bad: true }, { code: 'RCL-2099-99999', doc: '99000011', bad: true }]) {
    const { ctx, p } = await open(b, '/servicios/libro-de-reclamaciones', 'form[data-lr2]');
    await p.click('main button:has-text("Consultar estado")'); await p.waitForTimeout(800);
    await p.fill('form[data-lrq2] [name=codigo]', rc.code); await p.fill('form[data-lrq2] [name=doc]', rc.doc); await p.click('form[data-lrq2] button:not([type=button])'); await p.waitForTimeout(3000);
    const t = await p.locator('main').innerText(); const found = /Recibido|En atención|Atendido/.test(t) && t.includes(rc.code) && /QA30|Reclam|Queja/.test(t);
    L.rec('A', `Consulta pública reclamo ${rc.code} doc ${rc.doc}`, found === !rc.bad ? 'OK' : 'FALLA', found ? 'muestra estado' : 'no muestra datos'); await L.shot(p, 'A-consulta-' + rc.code + '-' + rc.doc); await ctx.close();
  }
  const mbase = { tipoDoc: 'DNI', correo: 'qa30.mp@portal.invalid', telefono: '999000020', direccion: 'Av. Prueba QA30 123, Nasca', tipoTramite: 'Solicitud', asunto: 'QA30 PRUEBA FICTICIA de Mesa de Partes, por favor ignorar.', folios: '1', declaro: true, acepto: true };
  const mesas = [
    { d: 'expediente 1 con PDF', v: { ...mbase, numDoc: '99000021', nombresP: 'QA30-21 Solicitante', apellidos: 'Prueba Uno', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'expediente 2 con PDF', v: { ...mbase, numDoc: '99000022', nombresP: 'QA30-22 Solicitante', apellidos: 'Prueba Dos', tipoTramite: 'Carta', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'expediente 3 con PDF', v: { ...mbase, numDoc: '99000023', nombresP: 'QA30-23 Solicitante', apellidos: 'Prueba Tres', tipoTramite: 'Oficio', archivos: FILES + '/qa30-documento.pdf' }, exp: true },
    { d: 'expediente 4 persona jurídica', v: { ...mbase, tipoDoc: 'RUC', numDoc: '20999000241', razon: 'QA30-24 Empresa Prueba SAC', nombresP: 'QA30-24 Representante', apellidos: 'Prueba', archivos: FILES + '/qa30-documento.pdf' }, exp: true, juridica: true },
    { d: 'archivo .php no permitido', v: { ...mbase, numDoc: '99000025', nombresP: 'QA30-25', apellidos: 'Prueba', archivos: FILES + '/qa30-script.php' }, exp: false },
    { d: 'PHP renombrado a .pdf', v: { ...mbase, numDoc: '99000026', nombresP: 'QA30-26', apellidos: 'Prueba', archivos: FILES + '/qa30-falso.pdf' }, exp: false },
    { d: 'PDF de 25 MB', v: { ...mbase, numDoc: '99000027', nombresP: 'QA30-27', apellidos: 'Prueba', archivos: FILES + '/qa30-grande.pdf' }, exp: false },
  ];
  for (const c of mesas.slice(+(process.env.SKIP||0))) { const { ctx, p } = await open(b, '/servicios/mesa-de-partes', 'form[data-mpv]'); const sel = 'form[data-mpv]';
    if (c.juridica) { await p.selectOption(sel + ' [name=tipoPersona]', { index: 1 }); await p.waitForTimeout(500); }
    c.v.areaDestino = (await p.$$eval(sel + ' [name=areaDestino] option', o => o.map(x => x.value).filter(Boolean)))[0];
    const r = await fill(p, sel, c.v); await L.shot(p, 'A-mesa-' + c.d.replace(/\W+/g, '-'));
    const created = /^20\d .*"(numero|codigo)"/.test(r.req) || r.req.includes('solicitudes') ;
    const main = (await p.locator('main').innerText()); const code = (main.match(/\b[A-Z]{2,4}-\d{4}-\d{3,6}\b/) || [''])[0];
    const ok = c.exp ? r.ok : !r.ok;
    L.rec('A', 'Mesa de partes ' + c.d, ok ? 'OK' : 'FALLA', (r.ok ? 'registrado ' + code : 'rechazado') + ' · ' + r.toast.slice(0, 140) + ' · ' + r.req.slice(0, 200)); await ctx.close(); await new Promise(s => setTimeout(s, 4000)); }
  L.save('fase-a-formularios2'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
