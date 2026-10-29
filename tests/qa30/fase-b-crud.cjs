// Fase B: CRUD desde la interfaz (editor real y botón "Guardar cambios") para cada módulo de contenido.
// Por módulo: crea 5 registros QA30 (3 publicados, 1 borrador, 1 que luego se elimina), edita 1,
// verifica persistencia en el servidor, verifica visibilidad pública y elimina 1.
const L = require('./lib.cjs'); const fs = require('node:fs');
const PUBLIC = { noticias: '/noticias', eventos: '/eventos', inversiones: '/transparencia/inversiones', convocatorias: '/transparencia/convocatorias', documentos: '/transparencia/documentos-gestion', tupa: '/transparencia/tupa', jerarquica: '/nosotros/plana-jerarquica', docentes: '/nosotros/plana-docente', locales: '/nosotros/campus-e-informes', reconocimientos: '/nosotros/reconocimientos', programas: '/programas', egresados: null, becas: '/becas', servicios: '/servicios/complementarios', slides: '/', paginas: 'SLUG', admision: '/admision', matricula: '/matricula', enlaces: '/servicios', catnoticias: '/noticias', tiposdoc: '/transparencia/documentos-gestion', becasper: '/becas', becastipos: '/becas', certificados: null };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
(async () => {
  const b = await L.browser(); const { p } = await L.login(b, 'nasca', process.env.QA30_PASS);
  p.on('dialog', d => d.accept());
  const pub = await (await b.newContext()).newPage();
  const keys = (await p.evaluate(() => Object.keys(SPECS))).filter(k => k !== 'usuarios' && (!ONLY || ONLY.includes(k)));
  const created = {};
  for (const key of keys) {
    const ids = []; const errs = [];
    for (let i = 1; i <= 5; i++) {
      await p.evaluate(k => { location.hash = '/admin/' + k + '/nuevo'; }, key); await p.waitForTimeout(700);
      const fx = await p.evaluate(({ key, i }) => {
        const spec = SPECS[key], col = spec.coll; const sfx = String(Date.now()).slice(-6) + i; const tag = `QA30-0${i}`;
        const pubState = (spec.states || []).find(s => /^(Publicad[oa]|Activo|Válido)$/.test(s)) || spec.states?.[0];
        let w = structuredClone(DB[col].find(r => !r.deleted && !/QA/.test(JSON.stringify(r).slice(0, 300))) || DB[col].find(r => !r.deleted) || {});
        for (const k of ['ref', 'historial', 'creado', 'actualizado', 'autor', 'aprobado', 'aprobacion', 'pendiente', '_testOwner']) delete w[k];
        Object.assign(w, { id: uid(), deleted: false, estado: i <= 3 ? pubState : spec.states?.[0], vigente: false, destacada: false, esDirector: false });
        const fields = typeof spec.fields === 'function' ? spec.fields(w) : spec.fields; const txt = `${tag} ${key} prueba QA30`;
        for (const f of fields) {
          if (['titulo', 'nombre', 'nombres', 'denominacion', 'cargo'].includes(f.n)) w[f.n] = txt;
          if (f.unique && f.t !== 'number') w[f.n] = f.n === 'slug' ? `qa30-${key}-${i}-${sfx}` : (f.n === 'dni' ? '9901' + sfx.slice(-4) : f.n === 'codigo' ? `QA30-${key.slice(0, 4).toUpperCase()}-${sfx}` : txt);
          if (f.req && (w[f.n] == null || w[f.n] === '')) w[f.n] = f.t === 'number' ? 1 : f.t === 'date' ? '2026-10-29' : f.t === 'datetime-local' ? '2026-10-29T09:00' : f.t === 'email' ? `qa30.${key}${i}@portal.invalid` : txt;
          if (f.t === 'select') { const o = optList(f, w); if (o.length && !o.some(([v]) => String(v) === String(w[f.n]))) w[f.n] = o[0][0]; }
        }
        if ('orden' in w) w.orden = Math.max(0, ...DB[col].map(r => Number(r.orden) || 0)) + 1;
        if (col === 'personas') { w.titulo = 'Lic.'; w.dni = '9901' + sfx.slice(-4); w.apellidos = 'Prueba QA30'; w.especialidad = 'Pruebas de software'; }
        if (col === 'documentos') { w.grupo = 'qa30-' + sfx; w.version = '1.' + i; w.refModulo = ''; }
        if (col === 'programas') { w.codigo = 'Q3' + sfx.slice(-4); w.slug = `qa30-programa-${sfx}`; w.coordinadorId = ''; }
        if (col === 'enlaces') w.url = `https://example.org/qa30-${i}`;
        if (col === 'tupa') { w.anio = 2026; w.codigo = `QA30-${sfx}`; w.monto = 10 * i; }
        if (col === 'becasPeriodos') { w.anio = 2090 + i; w.vigente = false; }
        if (col === 'becarios') { w.dni = '9902' + sfx.slice(-4); w.apellidos = 'Prueba QA30'; }
        if (col === 'certificados') { w.dni = '9903' + sfx.slice(-4); w.codigo = `QA30-CERT-${sfx}`; w.fecha = '2026-10-29'; }
        if (col === 'admisiones') { w.anio = 2090 + i; w.vigente = false; }
        if (col === 'matriculas') { w.periodo = `2090-${i}`; w.vigente = false; }
        if (col === 'egresados') w.anio = 2025;
        if (col === 'eventos') w.fecha = ['2026-10-01T10:00', '2026-10-29T18:00', '2026-12-15T09:00', '2026-11-20T09:00', '2026-11-25T09:00'][i - 1];
        ADM.work = w; ADM.workKey = key; ADM.workNew = true; route();
        return { col, id: w.id, txt, slug: w.slug, state: w.estado };
      }, { key, i });
      await p.waitForTimeout(400);
      await p.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await p.waitForTimeout(1500);
      const stillForm = await p.locator('[data-cf]').count();
      if (stillForm) { const m = (await p.locator('.errmsg, .toast, .fe, [aria-invalid=true]').allInnerTexts()).join(' | ').replace(/\s+/g, ' '); errs.push(`#${i}: ${m.slice(0, 200)}`); await L.shot(p, `B-${key}-error-${i}`); continue; }
      ids.push(fx);
    }
    // Persistencia en servidor
    const server = await p.evaluate(async col => { const r = await fetch(portalURL('/api/portal')); const d = await r.json(); return (d.data[col] || []).map(x => ({ id: x.id, estado: x.estado, deleted: !!x.deleted, t: x.titulo || x.nombre || x.nombres || x.denominacion || x.cargo })); }, ids[0]?.col || key);
    const persisted = ids.filter(f => server.some(s => s.id === f.id));
    L.rec('B', `${key}: crear 5 registros`, persisted.length === 5 ? 'OK' : 'FALLA', `${persisted.length}/5 guardados en servidor` + (errs.length ? ' · errores: ' + errs.join(' ; ') : ''));
    if (!persisted.length) continue;
    // Edición del registro 1 por formulario
    const e = persisted[0]; const newTxt = e.txt.replace('prueba', 'editado');
    await p.evaluate(({ k, id }) => { location.hash = '/admin/' + k + '/' + id; }, { k: key, id: e.id }); await p.waitForTimeout(1200);
    const fld = await p.evaluate(() => { const f = document.querySelector('[data-cf]'); return ['titulo', 'nombre', 'nombres', 'denominacion', 'cargo'].find(n => { const el = f?.querySelector(`[name="${n}"]`); return el && !el.disabled && el.tagName !== 'SELECT'; }); });
    if (fld) { await p.fill(`[data-cf] [name="${fld}"]`, newTxt); await p.getByRole('button', { name: 'Guardar cambios', exact: true }).click(); await p.waitForTimeout(1500);
      const v = await p.evaluate(async ({ col, id, fld }) => { const d = await (await fetch(portalURL('/api/portal'))).json(); return d.data[col].find(x => x.id === id)?.[fld]; }, { col: e.col, id: e.id, fld });
      L.rec('B', `${key}: editar registro`, v === newTxt ? 'OK' : 'FALLA', `campo ${fld} = ${v}`); if (v === newTxt) e.txt = newTxt; }
    else L.rec('B', `${key}: editar registro`, 'BLOQUEADO', 'sin campo de texto editable');
    // Eliminar el registro 5 desde el listado
    const del = persisted[4];
    if (del) { await p.evaluate(k => { location.hash = '/admin/' + k; }, key); await p.waitForTimeout(1200);
      const q = p.locator('[data-lf] [name=q]'); if (await q.count()) { await q.fill(del.txt); await p.locator('[data-lf]').evaluate(f => f.requestSubmit()); await p.waitForTimeout(900); }
      const btn = p.locator(`tr[data-id="${del.id}"] [data-act=del]`);
      if (await btn.count()) { await btn.first().click(); await p.waitForTimeout(600); const conf = p.locator('button:visible').filter({ hasText: /^\s*Eliminar\s*$/ }); if (await conf.count()) await conf.last().click(); await p.waitForTimeout(1500);
        const s = await p.evaluate(async ({ col, id }) => { const d = await (await fetch(portalURL('/api/portal'))).json(); const r = d.data[col].find(x => x.id === id); return r ? (r.deleted ? 'papelera' : 'sigue activo') : 'eliminado'; }, del);
        L.rec('B', `${key}: eliminar registro`, s === 'sigue activo' ? 'FALLA' : 'OK', s); }
      else L.rec('B', `${key}: eliminar registro`, 'BLOQUEADO', 'no se encontró botón Eliminar en el listado'); }
    // Visibilidad pública
    const route = PUBLIC[key];
    if (route) { const pubs = persisted.filter(f => /^(Publicad[oa]|Activo|Válido)$/.test(f.state)).slice(0, 3); const target = pubs[0];
      const r = route === 'SLUG' ? '/paginas/' + target.slug : route;
      await pub.goto(L.BASE + '/#' + r, { waitUntil: 'domcontentloaded', timeout: 60000 }); await pub.waitForTimeout(3500);
      const body = await pub.evaluate(() => document.body.innerText);
      const seen = pubs.filter(f => body.includes(f.txt)).length; const draft = persisted[3] && body.includes(persisted[3].txt);
      L.rec('B', `${key}: publicados visibles en portal (${r})`, seen > 0 && !draft ? 'OK' : (seen === 0 ? 'REVISAR' : 'FALLA'), `${seen}/${pubs.length} visibles en la primera página` + (draft ? ' · BORRADOR visible en portal' : ''));
      await L.shot(pub, `B-${key}-portal`); }
    created[key] = persisted.map(f => ({ id: f.id, txt: f.txt, col: f.col }));
    fs.writeFileSync(L.EVID + `/fase-b-ids${process.env.ONLY ? '-' + process.env.ONLY : ''}.json`, JSON.stringify(created, null, 1));
    L.save('fase-b-crud' + (process.env.ONLY ? '-' + process.env.ONLY : ''));
  }
  if (p._errors.length) L.rec('B', 'Errores JavaScript en intranet', 'FALLA', p._errors.slice(0, 5).join(' | '));
  L.save('fase-b-crud' + (process.env.ONLY ? '-' + process.env.ONLY : '')); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
