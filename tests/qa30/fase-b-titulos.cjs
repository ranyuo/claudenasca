// Fase B: Grados y títulos. Registra 5 alumnos QA30 en estado "Egresado" y les registra el título.
const L = require('./lib.cjs');
async function modalSubmit(p, label) { const m = p.locator('.modal:visible, dialog[open]').last(); await m.locator('button').filter({ hasText: new RegExp('^\\s*' + label + '\\s*$') }).last().click(); await p.waitForTimeout(1800);
  const open = await p.locator('.modal:visible, dialog[open]').count(); const err = open ? (await m.innerText()).split('\n').filter(l => /obligatorio|ya |debe|inválid|existe|futura/i.test(l)).join(' | ') : ''; if (open) { await p.keyboard.press('Escape'); await p.locator('.modal:visible button').filter({ hasText: /Cancelar|Cerrar|✕/ }).first().click().catch(() => {}); } return err; }
(async () => {
  const b = await L.browser(); const { p } = await L.login(b, 'nasca', process.env.QA30_PASS); p.on('dialog', d => d.accept());
  const sfx = String(Date.now()).slice(-4); const names = [];
  await p.evaluate(() => { location.hash = '/admin/ix-alumnos'; }); await p.waitForTimeout(1800);
  for (let i = 1; i <= 5; i++) {
    await p.locator('[data-new="estudiantes"]').click(); await p.waitForTimeout(700); const m = p.locator('.modal:visible, dialog[open]').last();
    const nom = `QA30-T${i} EGRESADO PRUEBA ${sfx}`; names.push(nom);
    await m.locator('[name=dni]').fill('9905' + sfx.slice(-3) + i); await m.locator('[name=nom]').fill(nom); await m.locator('[name=periodo]').fill('2023-I');
    for (const s of ['prog', 'ciclo', 'sec', 'turno']) { const o = await m.locator(`[name=${s}] option`).evaluateAll(o => o.map(x => x.value).filter(Boolean)); if (o.length) await m.locator(`[name=${s}]`).selectOption(o[0]); }
    await m.locator('[name=estado]').selectOption('Egresado'); await m.locator('[name=correo]').fill(`qa30.egr${i}@portal.invalid`).catch(() => {});
    const err = await modalSubmit(p, 'Registrar'); L.rec('B', `Títulos: alumno egresado ${i} para titular`, err ? 'FALLA' : 'OK', err);
  }
  await p.evaluate(() => { location.hash = '/admin/ix-titulos'; }); await p.waitForTimeout(1800);
  let ok = 0; const errs = [];
  for (let i = 1; i <= 5; i++) {
    await p.locator('[data-new="titulos"]').click(); await p.waitForTimeout(700); const m = p.locator('.modal:visible, dialog[open]').last();
    const opt = await m.locator('[name=est] option').evaluateAll((o, n) => (o.find(x => x.text.includes(n)) || {}).value, names[i - 1]);
    if (!opt) { errs.push(`#${i}: el egresado no aparece en la lista`); await p.keyboard.press('Escape'); continue; }
    await m.locator('[name=est]').selectOption(opt); await m.locator('[name=culm]').fill('2026-07-31'); await m.locator('[name=tit]').fill('2026-10-15');
    await m.locator('[name=cod]').fill(`QA30-TIT-${sfx}-${i}`); await m.locator('[name=resol]').fill(`R.D. N.º 9${i}${sfx.slice(-2)}-2026-QA30`);
    const err = await modalSubmit(p, 'Registrar'); if (err) errs.push(`#${i}: ${err}`); else ok++;
  }
  L.rec('B', 'titulos (académico): crear 5 registros', ok === 5 ? 'OK' : 'FALLA', `${ok}/5 registrados` + (errs.length ? ' · ' + errs.join(' ; ') : ''));
  // Validación: segundo título para el mismo egresado y fecha de titulación anterior a culminación
  await p.locator('[data-new="titulos"]').click(); await p.waitForTimeout(700); let m = p.locator('.modal:visible, dialog[open]').last();
  const o1 = await m.locator('[name=est] option').evaluateAll((o, n) => (o.find(x => x.text.includes(n)) || {}).value, names[0]);
  await m.locator('[name=est]').selectOption(o1); await m.locator('[name=culm]').fill('2026-07-31'); await m.locator('[name=tit]').fill('2026-07-01'); await m.locator('[name=cod]').fill(`QA30-TIT-${sfx}-X`); await m.locator('[name=resol]').fill('R.D. QA30 duplicado');
  const err = await modalSubmit(p, 'Registrar');
  L.rec('B', 'Títulos: rechaza título duplicado y fecha incoherente', /ya tiene/.test(err) && /posterior/.test(err) ? 'OK' : 'FALLA', err);
  // Editar y eliminar
  await p.locator('[data-q="titulos"]').fill('QA30').catch(() => {}); await p.locator('[data-q="titulos"]').press('Enter').catch(() => {}); await p.waitForTimeout(900);
  const ed = p.locator('[data-edit^="titulos:"]'); if (await ed.count()) { await ed.first().click(); await p.waitForTimeout(700); m = p.locator('.modal:visible, dialog[open]').last(); await m.locator('[name=resol]').fill('R.D. QA30 editada'); const e2 = await modalSubmit(p, 'Guardar cambios'); L.rec('B', 'titulos (académico): editar registro', e2 ? 'FALLA' : 'OK', e2); }
  const dl = p.locator('[data-del^="titulos:"]'); const n = await dl.count(); if (n) { await dl.last().click(); await p.waitForTimeout(700); await p.locator('.modal:visible button, dialog[open] button').filter({ hasText: /^\s*Eliminar\s*$/ }).last().click(); await p.waitForTimeout(1800); L.rec('B', 'titulos (académico): eliminar registro', (await p.locator('[data-del^="titulos:"]').count()) === n - 1 ? 'OK' : 'FALLA'); }
  await L.shot(p, 'B-titulos');
  // Consulta pública del título
  const pub = await (await b.newContext()).newPage(); await pub.goto(L.BASE + '/#/servicios/consulta-certificados', { waitUntil: 'domcontentloaded' }); await pub.waitForTimeout(3000);
  L.rec('B', 'Títulos: página pública de consulta carga', (await pub.locator('main').innerText()).length > 100 ? 'OK' : 'FALLA'); await L.shot(pub, 'B-consulta-certificados');
  L.save('fase-b-titulos'); await b.close();
})().catch(e => { console.error(e); L.save('fase-b-titulos'); process.exit(1); });
