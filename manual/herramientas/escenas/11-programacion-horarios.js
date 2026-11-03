const { espera, ir, marcar, foto, alto, arriba } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Usa los alumnos del capítulo 10 (sección APSTI III-A, turno Mañana; alumna 74125836).
const CLAVE_ALUMNA = 'RosaIca-2026#Clave';
const DOC_USUARIO = 'docente.apsti.demo';
const DOC_TEMP = 'Temporal-Docente-2026';
const DOC_CLAVE = 'DocenteIca-2026#Clave';
const UDS = [
  { cod: 'APSTI-301', nombre: 'Desarrollo de aplicaciones web', horas: 4, cred: 3 },
  { cod: 'APSTI-302', nombre: 'Administración de bases de datos', horas: 3, cred: 2 },
];

async function elegir(p, sel, texto) {
  const v = await p.locator(sel).evaluate((s, t) => { const o = [...s.options].find(o => o.textContent.includes(t)); return o ? o.value : null; }, texto);
  if (v === null) throw new Error(`Opción «${texto}» no encontrada en ${sel}`);
  await p.selectOption(sel, v);
}
const campo = (p, k) => p.locator(`#mform [data-fld="${k}"]`);
const enviar = async p => { await p.locator('#mform button[type=submit]').click(); await espera(p, 1500); };
const subtab = async (p, k) => { await ir(p, '#/admin/ix-horarios'); await p.locator('[data-tab="horarios:config"]').click(); await espera(p, 500); await p.locator(`[data-tab="hconf:${k}"]`).click(); await espera(p, 700); };
async function grupo(p, sec) {
  await ir(p, '#/admin/ix-horarios');
  await elegir(p, '#hg_p', 'APSTI'); await espera(p, 400);
  await p.selectOption('#hg_c', 'III'); await espera(p, 300);
  await p.selectOption('#hg_s', sec); await espera(p, 300);
  await p.selectOption('#hg_t', 'Mañana'); await espera(p, 500);
}
async function clase(p, celda, ud, doc, amb, fin) {
  await p.locator(`[data-act="newSes"][data-id="${celda}"]`).click(); await espera(p, 600);
  await elegir(p, '#f_ud', ud); if (doc) await elegir(p, '#f_doc', doc); if (amb) await elegir(p, '#f_amb', amb);
  if (fin) await p.selectOption('#f_fin', fin);
}
// Primer ingreso de una cuenta con contraseña temporal: cambia la clave y devuelve la página.
async function ingresar(ctx, usuario, temporal, nueva) {
  const e = await (await ctx()).newPage();
  await ir(e, '#/admin', 1500);
  await e.fill('#lg-u', usuario); await e.fill('#lg-p', temporal); await e.press('#lg-p', 'Enter');
  await e.waitForURL(/accounts\.php|#\/admin/, { timeout: 15000 }); await espera(e, 1200);
  if (/accounts\.php/.test(e.url()) && temporal !== nueva) {
    const f = e.locator('form', { has: e.locator('input[name=current_password]') });
    await f.locator('input[name=current_password]').fill(temporal);
    await f.locator('input[name=password]').fill(nueva); await f.locator('input[name=password_confirmation]').fill(nueva);
    await f.locator('button').click(); await e.waitForLoadState('load'); await espera(e, 800);
  }
  return e;
}

escena('11-programacion-horarios', async ({ adm, ctx }) => {
  const p = adm;
  await alto(p, 850);

  // 1. Unidades didácticas
  await subtab(p, 'uds');
  for (const [i, u] of UDS.entries()) {
    if (await p.locator('#ix-root tbody tr', { hasText: u.cod }).count()) continue;
    await p.locator('[data-new="uds"]').click(); await espera(p, 600);
    await p.fill('#f_cod', u.cod); await p.fill('#f_nombre', u.nombre); await elegir(p, '#f_prog', 'APSTI');
    await p.selectOption('#f_ciclo', 'III'); await p.fill('#f_horas', String(u.horas)); await p.fill('#f_cred', String(u.cred));
    if (i === 0) {
      await marcar(p, [[1, campo(p, 'cod')], [2, campo(p, 'nombre')], [3, campo(p, 'prog')], [4, campo(p, 'ciclo')], [5, campo(p, 'horas')], [6, campo(p, 'cred')]]);
      await foto(p, '11-02-unidad-didactica');
    }
    await enviar(p);
  }
  await espera(p, 3500);
  await marcar(p, [[1, p.locator('[data-tab="horarios:config"]')], [2, p.locator('#ix-root .pubtabs')], [3, p.locator('#ix-root tbody tr', { hasText: UDS[0].cod })], [4, p.locator('[data-new="uds"]')]]);
  await foto(p, '11-01-configuracion');

  // 2. Carga docente
  await subtab(p, 'docentes');
  await alto(p, 1100);
  await p.locator('[data-new="docentes"]').click(); await espera(p, 600);
  const opts = await p.locator('#f_per option').allInnerTexts();
  const docA = opts[0].split(' · ')[0];
  const iB = opts.findIndex(o => o.split(' · ')[0] !== docA), docB = opts[iB].split(' · ')[0];
  await p.selectOption('#f_per', { index: 0 });
  await p.locator('#mform label.ck', { hasText: UDS[0].nombre }).locator('input').check();
  for (const d of ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']) await p.locator(`#mform input[name=dias][value="${d}"]`).check();
  await p.fill('#f_desde', '08:00'); await p.fill('#f_hasta', '14:15');
  await marcar(p, [[1, campo(p, 'per')], [2, campo(p, 'uds')], [3, campo(p, 'dias')], [4, p.locator('#mform [data-fld="desde"], #mform [data-fld="hasta"]').first()], [5, campo(p, 'hasta')]]);
  await foto(p, '11-03-carga-docente');
  await enviar(p);
  await p.locator('[data-new="docentes"]').click(); await espera(p, 600);
  await p.selectOption('#f_per', { index: iB });
  await p.locator('#mform label.ck', { hasText: UDS[1].nombre }).locator('input').check();
  for (const d of ['Mar', 'Jue']) await p.locator(`#mform input[name=dias][value="${d}"]`).check();
  await p.fill('#f_desde', '08:00'); await p.fill('#f_hasta', '12:15');
  await enviar(p);
  await alto(p, 850);

  // 3. Ambientes
  await subtab(p, 'ambientes');
  await p.locator('[data-new="ambientes"]').click(); await espera(p, 600);
  await p.fill('#f_cod', 'LAB-C01'); await p.selectOption('#f_tipo', 'Laboratorio'); await p.fill('#f_cap', '25');
  await p.fill('#f_ubic', 'Pabellón C, segundo piso'); await p.fill('#f_caract', '25 computadoras, proyector y pizarra acrílica'); await elegir(p, '#f_prog', 'APSTI');
  await marcar(p, [[1, campo(p, 'cod')], [2, campo(p, 'tipo')], [3, campo(p, 'cap')], [4, campo(p, 'ubic')], [5, campo(p, 'prog')]]);
  await foto(p, '11-04-ambiente');
  await enviar(p);
  await p.locator('[data-new="ambientes"]').click(); await espera(p, 600);
  await p.fill('#f_cod', 'AULA-B12'); await p.selectOption('#f_tipo', 'Aula'); await p.fill('#f_cap', '35'); await p.fill('#f_ubic', 'Pabellón B, primer piso');
  await enviar(p);

  // 4. Bloques y receso (solo se muestra)
  await subtab(p, 'bloques');
  await alto(p, 1650);
  const tm = p.locator('#ix-root .bq').first();
  await marcar(p, [[1, tm.locator('.bq-top')], [2, tm.locator('.tl-rec').first()], [3, tm.locator('[data-act="bqAddRec"]').first()], [4, tm.locator('[data-act="bqAddHora"]')], [5, p.locator('[data-act="bloqReset"]')]]);
  await foto(p, '11-05-bloques');
  await alto(p, 850);

  // 5. Programación de la sección APSTI III-A
  await grupo(p, 'A');
  await alto(p, 1000);
  await clase(p, 'Lun|08:00|09:00', UDS[0].cod, docA, 'LAB-C01', '10:00');
  await marcar(p, [[1, campo(p, 'ud')], [2, campo(p, 'doc')], [3, campo(p, 'amb')], [4, campo(p, 'dia')], [5, p.locator('#mform [data-fld="ini"]')], [6, campo(p, 'fin')], [7, p.locator('#mform button[type=submit]')]]);
  await foto(p, '11-06-programar-clase');
  await enviar(p);
  await clase(p, 'Mié|08:00|09:00', UDS[0].cod, docA, 'LAB-C01', '10:00'); await enviar(p);
  await clase(p, 'Mar|08:00|09:00', UDS[1].cod, docB, 'AULA-B12', '11:00'); await enviar(p);

  // 6. Cruce: el mismo docente en otra sección a la misma hora
  await grupo(p, 'B');
  await clase(p, 'Lun|08:00|09:00', UDS[0].cod, docA, 'AULA-B12', '09:00');
  await enviar(p);
  await marcar(p, [[1, p.locator('#sesWarn .alert').first()], [2, p.locator('#mform button[type=submit]')]]);
  await foto(p, '11-07-cruce');
  await enviar(p);
  await grupo(p, 'B');
  await marcar(p, [[1, p.locator('#ix-root .alert.bad').first()], [2, p.locator('#ix-root .cell.ses.err').first()], [3, p.locator('[data-act="publish"]')]]);
  await foto(p, '11-08-error-seccion');

  // 7. Validaciones de todo el periodo
  await ir(p, '#/admin/ix-horarios');
  await p.locator('[data-tab="horarios:valid"]').click(); await espera(p, 700);
  await marcar(p, [[1, p.locator('[data-tab="horarios:valid"]')], [2, p.locator('#ix-root .alert').first()], [3, p.locator('#ix-root tbody tr').first().locator('.pill')], [4, p.locator('[data-act="goSes"]').first()], [5, p.locator('[data-act="valXLS"]')]]);
  await foto(p, '11-09-validaciones');

  // Corregir: quitar la clase de la sección B que provoca el cruce
  await grupo(p, 'B');
  await p.locator('#ix-root [data-act="editSes"]').first().click(); await espera(p, 800);
  await p.locator('#mform [data-act="delSes"]').click(); await espera(p, 600);
  await p.locator('#mform button[type=submit]').click(); await espera(p, 1500);

  // 8. Publicar la sección III-A
  await grupo(p, 'A');
  await marcar(p, [[1, p.locator('#ix-root .panel-h').first()], [2, p.locator('#ix-root .alert').first()], [3, p.locator('[data-act="hPDF"]')], [4, p.locator('[data-act="publish"]')]]);
  await foto(p, '11-10-antes-publicar');
  await p.locator('[data-act="publish"]').click(); await espera(p, 4000);
  await marcar(p, [[1, p.locator('#ix-root .panel-h .pill').first()], [2, p.locator('#ix-root .panel-h .note').first()], [3, p.locator('[data-act="unpublish"]')]]);
  await foto(p, '11-11-publicado');

  // 9. Vista por docente
  await ir(p, '#/admin/ix-horarios');
  await p.locator('[data-tab="horarios:docente"]').click(); await espera(p, 700);
  await marcar(p, [[1, '#hdoc'], [2, p.locator('#ix-root .panel-h').first()], [3, p.locator('#ix-root .cell.ses').first()]]);
  await foto(p, '11-12-vista-docente');
  await alto(p, 850);

  // 10. Lo que ve la estudiante
  const e = await ingresar(ctx, '74125836', CLAVE_ALUMNA, CLAVE_ALUMNA);
  await alto(e, 1000);
  await ir(e, '#/admin/ix-horarios', 1800);
  await marcar(e, [[1, e.locator('#ix-root .panel-h').first()], [2, e.locator('[data-act="hePDF"]')], [3, e.locator('#ix-root table.sched')]]);
  await foto(e, '11-13-horario-estudiante');
  await e.context().close();

  // 11. Lo que ve el docente: cuenta vinculada a su carga docente
  const docId = await p.evaluate(n => (IX.db().docentes.find(d => d.nom === n) || {}).id, docA);
  await ir(p, '#/admin', 800);
  await p.goto(p.url().split('#')[0].replace(/\?.*$/, '') + 'accounts.php'); await espera(p, 800);
  const cf = p.locator('form', { has: p.locator('input[name=password_confirmation]') }).filter({ has: p.locator('input[name=username]') });
  if (await cf.count()) {
    await cf.locator('input[name=name]').fill(docA); await cf.locator('input[name=username]').fill(DOC_USUARIO);
    await cf.locator('input[name=email]').fill('docente.apsti@correo-demo.pe'); await cf.locator('select[name=role]').selectOption('docente');
    await cf.locator('input[name=vin]').fill('doc:' + docId);
    await cf.locator('input[name=password]').fill(DOC_TEMP); await cf.locator('input[name=password_confirmation]').fill(DOC_TEMP);
    await cf.locator('button').click(); await p.waitForLoadState('load'); await espera(p, 800);
  }
  const d = await ingresar(ctx, DOC_USUARIO, DOC_TEMP, DOC_CLAVE);
  await alto(d, 1000);
  await ir(d, '#/admin/ix-horarios', 1800);
  await marcar(d, [[1, d.locator('#ix-root [role=tablist]')], [2, d.locator('#ix-root .panel-h').first()], [3, d.locator('#ix-root table.sched').first()]]);
  await foto(d, '11-14-horario-docente');
  await d.context().close();
  await alto(p, 850);
});
