const { espera, ir, marcar, foto, alto } = require('../lib');

module.exports = [];
const escena = (id, fn) => module.exports.push({ id, fn });

// Usa a la egresada del capítulo 10 (Yupanqui Soto, Milagros Isabel · DNI 70946318).
const DNI = '70946318';
const COD = 'TIT-APSTI-2026-0007';
const CLAVE_EGRESADA = 'MilagrosIca-2026#Clave';

async function elegir(p, sel, texto) {
  const v = await p.locator(sel).evaluate((s, t) => { const o = [...s.options].find(o => o.textContent.includes(t)); return o ? o.value : null; }, texto);
  if (v === null) throw new Error(`Opción «${texto}» no encontrada en ${sel}`);
  await p.selectOption(sel, v);
}
const campo = (p, k) => p.locator(`#mform [data-fld="${k}"]`);

escena('17-grados-titulos', async ({ adm, ctx }) => {
  const p = adm;
  await alto(p, 850);
  await ir(p, '#/admin/ix-titulos');

  // Formulario con un error de fechas
  await p.locator('[data-new="titulos"]').click(); await espera(p, 600);
  await elegir(p, '#f_est', DNI); await p.fill('#f_culm', '2025-12-19'); await p.fill('#f_tit', '2025-12-01');
  await p.fill('#f_cod', COD); await p.fill('#f_resol', 'R.D. N.º 087-2026-IESTP-ICA');
  await p.locator('#mform button[type=submit]').click(); await espera(p, 600);
  await marcar(p, [[1, campo(p, 'est')], [2, campo(p, 'culm')], [3, campo(p, 'tit')], [4, campo(p, 'cod')], [5, campo(p, 'resol')]]);
  await foto(p, '17-02-formulario');
  await p.fill('#f_tit', '2026-10-15');
  await p.locator('#mform button[type=submit]').click(); await espera(p, 4000);

  // Registro de titulados
  const fila = p.locator('#ix-root tbody tr', { hasText: COD });
  await marcar(p, [[1, p.locator('#ix-root [role=tablist]')], [2, fila.locator('td').first()], [3, fila.locator('[data-act="docTit"]')], [4, p.locator('[data-new="titulos"]')], [5, p.locator('#ix-root p.note').last()]]);
  await foto(p, '17-01-registro');

  // Reporte de validación
  await fila.locator('[data-act="docTit"]').click(); await espera(p, 1500);
  await alto(p, 1250);
  await marcar(p, [[1, p.locator('#mform .paper dl')], [2, p.locator('#mform .pf')], [3, p.locator('#mform [data-act="pdfTit"]')]]);
  await foto(p, '17-03-validacion');
  await p.keyboard.press('Escape'); await espera(p, 400);

  // Consulta y validación
  await alto(p, 900);
  await ir(p, '#/admin/ix-titulos');
  await p.locator('[data-tab="titulos:consulta"]').click(); await espera(p, 600);
  await p.fill('#tq', 'Yupanqui'); await p.locator('[data-form="tq"] button').click(); await espera(p, 900);
  await marcar(p, [[1, p.locator('[data-form="tq"]')], [2, p.locator('#ix-root .ficha').first()], [3, p.locator('#ix-root .ficha [data-act="docTit"]').first()]]);
  await foto(p, '17-04-consulta');

  // El estado del alumno pasó a Titulado; se le crea su acceso
  await alto(p, 850);
  await ir(p, '#/admin/ix-alumnos');
  const fa = p.locator('#ix-root tbody tr', { hasText: DNI });
  let temporal = null;
  if (await fa.locator('[data-act="mkAcc"]').count()) {
    await fa.locator('[data-act="mkAcc"]').click(); await espera(p, 1500);
    temporal = (await p.locator('#mform dd.mono').nth(1).innerText()).trim();
    await p.keyboard.press('Escape'); await espera(p, 400);
    await ir(p, '#/admin/ix-alumnos');
  }
  await marcar(p, [[1, fa.locator('.pill')], [2, fa.locator('td').nth(7)]]);
  await foto(p, '17-05-titulado');

  // Lo que ve la egresada
  const e = await (await ctx()).newPage();
  await ir(e, '#/admin', 1500);
  await e.fill('#lg-u', DNI); await e.fill('#lg-p', temporal || CLAVE_EGRESADA); await e.press('#lg-p', 'Enter');
  await e.waitForURL(/accounts\.php|#\/admin/, { timeout: 15000 }); await espera(e, 1200);
  if (/accounts\.php/.test(e.url()) && temporal) {
    const f = e.locator('form', { has: e.locator('input[name=current_password]') });
    await f.locator('input[name=current_password]').fill(temporal);
    await f.locator('input[name=password]').fill(CLAVE_EGRESADA); await f.locator('input[name=password_confirmation]').fill(CLAVE_EGRESADA);
    await f.locator('button').click(); await e.waitForLoadState('load'); await espera(e, 800);
  }
  await alto(e, 850);
  await ir(e, '#/admin/ix-titulos', 1800);
  await marcar(e, [[1, e.locator('#ix-root .ficha dl')], [2, e.locator('#ix-root [data-act="docTit"]')], [3, e.locator('nav, aside').filter({ hasText: 'Grados y títulos' }).first()]]);
  await foto(e, '17-06-vista-egresada');
  await e.context().close();
});
